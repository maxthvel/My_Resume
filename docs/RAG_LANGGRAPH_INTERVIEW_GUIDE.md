# RAG + LangGraph — Interview Guide

How the "Ask AI" chatbot on the portfolio evolved from a single-shot RAG pipeline into an agentic, streaming, cache-aware system — and how to talk about each step. Written to be studied, not just read once.

---

## 1. The 30-second answer

> "I built a hybrid-retrieval RAG chatbot for my portfolio — BM25 keyword search plus Voyage AI embeddings, fused with Reciprocal Rank Fusion — then re-architected the generation path as a LangGraph state machine that self-corrects weak retrievals before ever calling the LLM to answer. I added token streaming so answers appear live instead of after a multi-second wait, and instrumented prompt caching well enough to prove — not assume — whether it's actually saving anything."

## 2. The 2-minute answer

> "The chatbot answers questions about my projects using only my own site content — no hallucinated experience. Retrieval is hybrid: a zero-dependency BM25 implementation for keyword matching, plus optional dense embeddings from Voyage AI, fused with Reciprocal Rank Fusion so neither retriever's blind spots dominate.
>
> The interesting part is the orchestration. Originally this was a single-shot pipeline — retrieve six chunks, stuff them in a system prompt, call Claude once, return. That's a chain, not an agent: it can't recover if retrieval genuinely missed. I rebuilt it as a LangGraph state graph with a real cycle — retrieve, grade the results for relevance using keyword overlap, and if the match is weak, have the model rewrite the query and retry, capped at two attempts. If it still can't find anything relevant, it short-circuits to a deterministic 'email me' response instead of letting the LLM guess — that's a design choice to eliminate a whole class of hallucination risk rather than prompt around it.
>
> Once retrieval succeeds, I stream the generation token-by-token instead of blocking on the full response — that meant restructuring how citation verification works, since you can't retract tokens already shown to a user. And I added prompt caching, then actually measured it with `usage.cache_read_input_tokens` instead of assuming `cache_control` alone does something — turns out Claude Haiku's cache minimum is 4096 tokens and my system prompt runs under 900, so the cache never fires. I documented that instead of hiding it."

Use the 30-second version to open, then let them pull threads — the sections below give you depth on each one.

---

## 3. Architecture at a glance

```
User question
     │
     ▼
┌─────────────┐
│  retrieve   │  BM25 + Voyage embeddings → RRF fusion (top 6 chunks)
└──────┬──────┘
       ▼
┌─────────────┐
│    grade    │  keyword-overlap check (no LLM call — free relevance signal)
└──────┬──────┘
       │
   ┌───┴────────────────┐
   │ weak match          │ good match
   ▼                     ▼
┌──────────────┐   (graph ends — context handed to caller)
│ rewriteQuery │
│ (max 2x,     │
│  loops back  │
│  to retrieve)│
└──────┬───────┘
       │ still weak after 2 retries
       ▼
┌──────────────┐
│  fallback    │  deterministic "email me" reply — no LLM call
└──────────────┘

  ── outside the graph, once context is resolved ──

┌───────────────────────────────┐
│ streamClaudeTokens()          │  Claude Haiku, stream:true
│  → tokens forwarded live      │  system = [PERSONA (cached), CONTEXT (not cached)]
│  → citations checked post-hoc │
│  → NDJSON over the wire       │
└───────────────────────────────┘
```

Files, if asked to point to code:

| File | Role |
|---|---|
| `src/lib/rag/bm25.ts` | Zero-dependency BM25 keyword index |
| `src/lib/rag/vector.ts` | Voyage AI dense embeddings, cosine similarity |
| `src/lib/rag/retrieve.ts` | RRF fusion of the two retrievers (k=60) |
| `src/lib/rag/graph.ts` | LangGraph `StateGraph` + streaming generation |
| `src/app/api/chat/route.ts` | NDJSON streaming API route |
| `src/components/chat-widget.tsx` | Client-side stream consumer |

---

## 4. What changed, one improvement at a time

Tell this as a progression, not a feature list — interviewers want to hear *why* each step happened, not just that it exists.

### v1 → Hybrid retrieval (the foundation)
**What:** BM25 (hand-rolled, zero deps) + Voyage AI embeddings, fused with Reciprocal Rank Fusion instead of picking one retriever.
**Why:** Keyword search alone misses semantically-related questions ("what's his biggest technical challenge" vs. a chunk that says "concurrent token refresh"); embeddings alone miss exact-term matches and cost money per query. RRF combines both rankings without needing to calibrate two different score scales against each other.
**Talking point:** "I didn't reach for a vector DB or LangChain's retriever abstractions first — I wrote BM25 from scratch to understand what a hybrid retriever actually does mechanically before wrapping it in a framework."

### v2 → LangGraph corrective RAG (agentic retrieval)
**What:** Replaced the single retrieve→generate chain with a graph: `retrieve → grade → [rewriteQuery → retrieve]* → done`, capped at 2 rewrite attempts, falling back to a deterministic reply if retrieval never finds a relevant match.
**Why:** A chain can't recover from a bad first retrieval. If someone asks an ambiguous or pronoun-heavy follow-up ("how did he fix that?"), naive retrieval on the raw query often misses — a graph can detect the miss (via keyword overlap, no extra LLM cost) and reformulate before ever generating an answer.
**Talking point:** "The grading step costs nothing extra — it's a keyword-overlap check between the query and retrieved chunks, not another LLM call. I only pay for an LLM call when I actually need to rewrite the query. That was a deliberate cost decision, not an oversight."

### v3 → Token streaming (production UX)
**What:** Split the graph into a retrieval-only `contextGraph` and a separate streamed generation step. Claude's response streams token-by-token as NDJSON over a `ReadableStream`, consumed by the client via `res.body.getReader()`.
**Why:** The original blocking response meant users stared at a "typing" indicator for the full generation time. Streaming cuts perceived latency to first-token time instead of total-response time.
**The interesting tradeoff:** the original design regenerated the whole answer if it detected zero citations (a self-correction loop). That's incompatible with streaming — you can't un-send tokens the user already saw. I converted it from a *retry* into a *disclosure*: if the completed stream cited nothing, I append a short note ("this answer wasn't tied to a specific cited passage") instead of silently retrying. Same signal, different mechanism, because the constraints changed.
**Talking point:** "This is the answer to 'how do you handle self-correction in a streaming agent' — you generally can't regenerate what's already been shown. You either buffer generation before streaming (defeats the purpose) or turn correction into a post-hoc annotation. I chose the second."

### v4 → Prompt caching (measured, not assumed)
**What:** The static persona block in the system prompt carries `cache_control: {type: "ephemeral"}`; the per-query retrieved context doesn't (it's different every request, so caching it would never pay off). Added logging of `usage.cache_creation_input_tokens` / `cache_read_input_tokens` on every call.
**What I found:** Claude Haiku 4.5 requires a **4096-token minimum prefix** to cache at all — a fact that's easy to miss because Sonnet's minimum is 1024 and Opus's is 512. My system prompt runs ~844 tokens. Measured live, back-to-back identical requests: `cache_write=0, cache_read=0` every time. The cache is correctly wired and genuinely inactive at this prompt size.
**What I did about it:** documented it rather than padding the prompt artificially or switching to a pricier model tier just to make a number go positive.
**Talking point:** this is the strongest story of the four, precisely because it isn't a clean win. "Adding `cache_control` and moving on is the naive version. The senior-engineer version is checking `usage.cache_read_input_tokens` before claiming the optimization worked — and in this case it didn't, for a documented, model-specific reason. That's the difference between shipping a feature and verifying one."

---

## 5. Achievements (concrete, defensible numbers)

Use real numbers — an interviewer who probes will ask for numbers, and having ones you can defend without hedging is worth more than round, made-up ones.

| Claim | Number | Source |
|---|---|---|
| Retrieval fusion | RRF constant k=60, top-6 chunks returned per query | `retrieve.ts` |
| Corrective retry ceiling | Max 2 query rewrites before fallback | `graph.ts` `MAX_REWRITES` |
| Grading cost | $0 — keyword-overlap heuristic, no LLM call | `gradeNode` in `graph.ts` |
| Streaming granularity | ~8 token chunks over ~1.5s for a typical answer (measured via `curl -N` timing) | live test, this session |
| System prompt size | ~844 tokens (persona + retrieved context) | measured via `usage.input_tokens`, this session |
| Cache activation threshold | 4096 tokens (Haiku 4.5) vs. 844 actual — 0% cache hit rate, confirmed not assumed | `usage.cache_creation_input_tokens` |
| Dependency footprint | 1 new dependency added (`@langchain/langgraph`) for the entire agentic layer — no `@langchain/anthropic`, no vector DB SDK | `package.json` |
| Fallback path | Deterministic reply (no LLM call) when retrieval fails twice — bounded worst-case cost per conversation | `fallbackNode` in `graph.ts` |

---

## 6. Optimizations and deliberate engineering tradeoffs

These are the "why did you do X instead of Y" answers — the questions that separate someone who followed a tutorial from someone who made decisions.

- **BM25 hand-rolled instead of a library** — zero dependencies, full control over tokenization, and forces genuine understanding of TF-IDF/BM25 scoring rather than treating it as a black box.
- **RRF instead of a weighted score blend** — BM25 and cosine-similarity scores live on incompatible scales (unbounded vs. [-1,1]); RRF only needs *rank position*, sidestepping score calibration entirely.
- **Grading via keyword overlap, not an LLM call** — an extra Claude call on every single message would double latency and cost for a signal a cheap heuristic mostly gets right. Escalate to the model only for the harder case (rewriting the query), not the easy case (deciding retrieval was weak).
- **Deterministic fallback instead of "let the model apologize"** — when the corrective loop exhausts its retries, returning a fixed string is cheaper, faster, and impossible to hallucinate from. The LLM never even sees a request it can't ground.
- **No `@langchain/anthropic`** — LangGraph is used purely for graph orchestration (state, cycles, conditional edges); the actual Claude/Voyage calls stay as plain `fetch` wrappers matching the rest of the codebase's minimal-dependency style. This is a real architectural choice worth defending if asked "why not just use LangChain's model wrappers."
- **Streaming changed the shape of self-correction, not just the transport** — see v3 above. This is the single best "tradeoffs under changing constraints" story in the whole feature.
- **Cache breakpoint placement** — the static persona is separated into its own content block specifically so it's the one eligible for caching, while the always-different retrieved context sits after it, uncached. Getting this placement wrong (caching the whole prompt including the variable part) would silently write a new, never-reused cache entry on every request — pure cost with no benefit.

---

## 7. Q&A — likely interview questions

**Q: Why LangGraph instead of a plain `while` loop for the retry logic?**
A: Honestly, for exactly this use case a `while` loop would work fine — it's a small, bounded cycle. I used LangGraph because it gives me a typed state schema, explicit conditional edges I can reason about and extend (e.g. adding a citation-check node later), and a recursion-limit safety net independent of my own counters. The value shows up as the graph grows — a second corrective loop, a router node, a subgraph — not in this minimal version alone. I'd say that plainly if asked; overclaiming the value of a framework for a trivial case is a tell.

**Q: What's the difference between a chain and an agent here — isn't this still pretty deterministic?**
A: Fair pushback. It's not a fully autonomous agent deciding its own tools — it's a bounded, deterministic corrective loop. What makes it agentic rather than a chain is the *cycle*: the graph can revisit an earlier step (retrieve) based on a decision made downstream (grade), which a linear chain structurally cannot express. It's a small step up the agency spectrum, not a leap to full autonomy — and that's the right amount of agency for a task this scoped.

**Q: How do you prevent the corrective loop from running forever or getting expensive?**
A: Two independent caps: `MAX_REWRITES = 2` in application logic, and a `recursionLimit: 12` passed to the graph invocation as a framework-level backstop. Belt and suspenders — if my own counter logic ever had a bug, the graph's built-in limit still bounds worst-case cost.

**Q: Why not just increase the vector DB / retrieval quality instead of adding a correction loop?**
A: Better retrieval reduces how *often* the loop needs to trigger, but it doesn't eliminate the need for one — ambiguous phrasing, pronouns referring to earlier turns, or typos will always occasionally beat even great retrieval. The correction loop is a safety net for the residual failure rate, not a substitute for good retrieval; I'd want both in a system that had to scale.

**Q: How would you evaluate whether this RAG system is actually good?**
A: Right now I don't have a formal eval harness — that's a known gap, honestly. What I'd build: a small labeled set of Q&A pairs against my own site content, measuring retrieval recall@k and whether the generated answer's citations actually match ground truth. I'd rather say that's not built yet than overclaim.

**Q: What would break this at scale (more users, bigger corpus)?**
A: The vector embeddings re-compute from scratch on every cold start — fine at ~70 chunks, not fine at thousands. I'd move to a persistent vector store (pgvector or similar) with incremental re-embedding only on content changes. Also, conversation history isn't persisted server-side — the client resends full message history every request, which is simple but won't scale to long conversations or multi-device continuity; I'd add LangGraph's checkpointer for that.

**Q: Walk me through what happens on a genuinely off-topic question.**
A: Retrieval still runs — BM25 and the embedding search both execute — but the grading step checks keyword overlap between the query and whatever came back. If there's zero overlap, that's treated as a weak match, triggering a query rewrite. If two rewrites still produce nothing relevant, the graph routes to a fallback node that returns a fixed "I don't have that info, email me" string without ever calling the LLM to generate a guess. I tested this live with deliberate gibberish input and confirmed the fallback path via server logs.

**Q: You said prompt caching doesn't currently help — why keep the code at all?**
A: Because it's correct, cheap to keep, and becomes free value the moment the system prompt grows past 4096 tokens — which will happen naturally as I add more always-on context (more projects, more expertise sections). Ripping it out to avoid an awkward "it doesn't work yet" conversation would be the wrong instinct; documenting the measured threshold is more valuable than a fake win.

**Q: How does streaming interact with your citation-verification logic?**
A: That was the trickiest design decision in the whole rebuild. Before streaming, if the model's reply didn't cite any retrieved passage, I'd silently regenerate once with a stricter instruction. Streaming makes that impossible — tokens are already visible to the user. So I moved verification to run *after* the stream completes: if the accumulated text has zero citations, I append a short disclosure note as one more streamed chunk instead of pretending to fix it. Same underlying signal (uncited answer), different mechanism forced by a different constraint.

**Q: What tool-calling or agentic capability is missing that you'd add next?**
A: Real tool use — right now everything is "read stuffed context, answer from it." A natural next step is giving the model an actual function call, like checking availability or pulling structured project details by slug, so it can take a discrete action instead of pattern-matching against prose. That's the next thing on my list, along with a small eval harness.

---

## 8. Things to say honestly (don't overclaim these)

- There's no persistent vector store — Voyage embeddings recompute from the in-memory corpus every cold start.
- There's no formal evaluation harness (recall@k, citation accuracy) — only manual/live testing done during development.
- No multi-turn memory/checkpointing — the client resends full conversation history each request; LangGraph's `MemorySaver` was deliberately skipped since it wasn't needed for correctness here.
- No tool-calling / function-calling — the model only ever reads injected context, it never takes an action.
- No multi-agent routing — one graph, one model, no specialist subgraphs (yet).
- Prompt caching is implemented but currently inactive (see §4, v4) — say this plainly if asked; it's a stronger answer than pretending it's saving cost.

Being upfront about these signals more seniority than pretending the system is more complete than it is — interviewers who've built production RAG systems know every one of these gaps exists somewhere in their own stack too.
