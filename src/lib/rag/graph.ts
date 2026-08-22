import { Annotation, StateGraph, END, START } from "@langchain/langgraph";
import { site } from "@/lib/data/site";
import { retrieve, type Retrieved } from "./retrieve";
import { tokenize } from "./bm25";

/**
 * Agentic RAG orchestration for the "Ask AI" widget, built with LangGraph.
 *
 * The corrective retrieval loop runs as a graph, then generation is streamed
 * token-by-token straight to the client:
 *
 *   retrieve -> grade -> [weak match] -> rewriteQuery -> retrieve (max 2x)
 *                     \-> [good match] -> (graph ends here; caller streams the reply)
 *                     \-> [still weak after retries] -> fallback (deterministic reply)
 *
 * Grading + the rewrite loop are what a single-shot chain can't express
 * cleanly — a cycle, not a straight line. Citation verification still runs
 * after generation, but since streamed tokens already reached the user by
 * then, it can't retract and regenerate — instead it appends a disclosure
 * note when the reply didn't cite anything (see runChatGraphStream).
 */

const PERSONA = `You are the AI assistant on ${site.name}'s portfolio site, answering questions from recruiters and engineers about his work. Be concise, specific, and confident — 2-4 sentences unless asked for depth.

CORE FACTS (always true): ${site.name} is a ${site.role}, 3+ years production MERN experience at Web Design Magics. ${site.availabilityLabel}. Contact: ${site.email}. Location: ${site.location}.

RULES:
- Answer ONLY from the CONTEXT passages below. If the context doesn't contain the answer, say so and suggest emailing ${site.email} — never invent details.
- When you use a passage, cite it inline like [1] or [2] matching the passage number.
- For availability/hiring questions, be warm and point to ${site.email}.`;

const MAX_REWRITES = 2;

export type ChatMessage = { role: string; content: string };
export type Source = { n: number; title: string; href: string };
export type StreamEvent = { type: "token"; text: string } | { type: "sources"; sources: Source[] };

const overwrite = <T>(_current: T, next: T) => next;

const GraphState = Annotation.Root({
  history: Annotation<ChatMessage[]>(),
  query: Annotation<string>(),
  chunks: Annotation<Retrieved[]>({ value: overwrite, default: () => [] }),
  rewriteCount: Annotation<number>({ value: overwrite, default: () => 0 }),
  relevant: Annotation<boolean>({ value: overwrite, default: () => false }),
  reply: Annotation<string>({ value: overwrite, default: () => "" }),
  sources: Annotation<Source[]>({ value: overwrite, default: () => [] }),
});

type State = typeof GraphState.State;

async function callClaude(system: string, messages: ChatMessage[], maxTokens: number): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: maxTokens,
      system,
      messages: messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.content).slice(0, 2000),
      })),
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.content?.[0]?.text ?? null;
}

type SystemBlock = { type: "text"; text: string; cache_control?: { type: "ephemeral" } };

/**
 * Same call as callClaude, but streams text deltas as they arrive via SSE instead of waiting for the full reply.
 * `system` is a content-block array so the static persona block can carry `cache_control` while the
 * per-query CONTEXT block (which varies every request) doesn't — see the PERSONA block in runChatGraphStream.
 *
 * Claude Haiku 4.5's minimum cacheable prefix is 4096 tokens (higher than Sonnet/Opus's 1024/512) — logging
 * usage.cache_creation/read_input_tokens is the only way to confirm the cache is actually being hit rather
 * than assuming cache_control alone guarantees it. Measured: this app's PERSONA+CONTEXT system prompt runs
 * ~800-900 tokens, so on Haiku the cache never writes (cache_write=0, cache_read=0 on every request) — the
 * breakpoint is correctly placed but currently inactive at this prompt size. Verified, not assumed.
 */
async function* streamClaudeTokens(system: SystemBlock[], messages: ChatMessage[], maxTokens: number): AsyncGenerator<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: maxTokens,
      stream: true,
      system,
      messages: messages.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.content).slice(0, 2000),
      })),
    }),
  });
  if (!res.ok || !res.body) return;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const evt of events) {
      const dataLine = evt.split("\n").find((l) => l.startsWith("data:"));
      if (!dataLine) continue;
      try {
        const parsed = JSON.parse(dataLine.slice(5).trim());
        if (parsed.type === "message_start") {
          const u = parsed.message?.usage;
          if (u) {
            console.log(
              `[cache] input=${u.input_tokens} cache_write=${u.cache_creation_input_tokens ?? 0} cache_read=${u.cache_read_input_tokens ?? 0}`
            );
          }
        } else if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
          yield parsed.delta.text as string;
        }
      } catch {
        // ignore malformed/keep-alive lines
      }
    }
  }
}

async function retrieveNode(state: State) {
  const chunks = await retrieve(state.query, 6);
  return { chunks };
}

/** Cheap relevance signal (no LLM call): does the query share any keyword with what came back? */
function gradeNode(state: State) {
  const qTokens = new Set(tokenize(state.query));
  const chunkTokens = new Set(state.chunks.flatMap((c) => tokenize(c.text)));
  const overlap = [...qTokens].some((t) => chunkTokens.has(t));
  return { relevant: state.chunks.length > 0 && overlap };
}

function routeAfterGrade(state: State) {
  if (state.relevant) return "generate";
  if (state.rewriteCount < MAX_REWRITES) return "rewriteQuery";
  return "fallback";
}

async function rewriteQueryNode(state: State) {
  const recent = state.history.slice(-4).map((m) => `${m.role}: ${m.content}`).join("\n");
  const rewritten = await callClaude(
    "Rewrite the user's latest message as a short, keyword-rich search query for a developer portfolio site (projects, stack, architecture, availability). Reply with ONLY the rewritten query — no punctuation, no explanation.",
    [{ role: "user", content: `Conversation:\n${recent}\n\nRewrite the last user message as a search query.` }],
    40
  );
  return {
    query: rewritten?.trim() || state.query,
    rewriteCount: state.rewriteCount + 1,
  };
}

function fallbackNode(): Partial<State> {
  return {
    reply: `I don't have specific information about that in Muthu's portfolio content — feel free to email ${site.email} to ask directly.`,
  };
}

/** Retrieval-only graph: resolves either usable context chunks or a final fallback reply. Generation happens outside, streamed. */
const contextGraph = new StateGraph(GraphState)
  .addNode("retrieve", retrieveNode)
  .addNode("grade", gradeNode)
  .addNode("rewriteQuery", rewriteQueryNode)
  .addNode("fallback", fallbackNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "grade")
  .addConditionalEdges("grade", routeAfterGrade, {
    generate: END,
    rewriteQuery: "rewriteQuery",
    fallback: "fallback",
  })
  .addEdge("rewriteQuery", "retrieve")
  .addEdge("fallback", END)
  .compile();

export async function* runChatGraphStream(history: ChatMessage[]): AsyncGenerator<StreamEvent> {
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const ctx = await contextGraph.invoke(
    { history, query: String(lastUser).slice(0, 500) },
    { recursionLimit: 12 } // belt-and-suspenders cap alongside MAX_REWRITES
  );

  if (ctx.reply) {
    // Corrective loop gave up after MAX_REWRITES — fallback node already set the final reply.
    yield { type: "token", text: ctx.reply };
    yield { type: "sources", sources: [] };
    return;
  }

  const context = ctx.chunks.map((c) => `[${c.rank}] (${c.source}) ${c.text}`).join("\n\n");
  // PERSONA is byte-identical across every request, so it carries the cache breakpoint;
  // CONTEXT varies per query and stays uncached.
  const system: SystemBlock[] = [
    { type: "text", text: PERSONA, cache_control: { type: "ephemeral" } },
    { type: "text", text: `CONTEXT:\n${context}` },
  ];
  const allSources = ctx.chunks.map((c) => ({ n: c.rank, title: c.source, href: c.href }));

  let full = "";
  for await (const delta of streamClaudeTokens(system, history.slice(-12), 512)) {
    full += delta;
    yield { type: "token", text: delta };
  }

  if (!full) {
    yield { type: "token", text: "Hmm, I hit an error generating a reply — try rephrasing?" };
    yield { type: "sources", sources: [] };
    return;
  }

  const cited = allSources.filter((s) => full.includes(`[${s.n}]`));
  if (!cited.length) {
    yield {
      type: "token",
      text: "\n\n_(Note: this answer wasn't tied to a specific cited passage — worth double-checking against the linked pages.)_",
    };
  }
  yield { type: "sources", sources: cited.length ? cited : allSources.slice(0, 3) };
}
