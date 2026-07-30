import { Annotation, StateGraph, END, START } from "@langchain/langgraph";
import { site } from "@/lib/data/site";
import { retrieve, type Retrieved } from "./retrieve";
import { tokenize } from "./bm25";

/**
 * Agentic RAG orchestration for the "Ask AI" widget, built with LangGraph.
 *
 * Upgrades the previous single-shot retrieve -> generate pipeline into a
 * corrective-RAG loop:
 *
 *   retrieve -> grade -> [weak match] -> rewriteQuery -> retrieve (max 2x)
 *                     \-> [good match] -> generate -> citationCheck
 *                                                        \-> [uncited] -> generate (max 1 retry)
 *                     \-> [still weak after retries] -> fallback
 *
 * Grading and the rewrite/citation retries are what a plain single-shot
 * chain can't express cleanly — they're cycles, not a straight line.
 */

const PERSONA = `You are the AI assistant on ${site.name}'s portfolio site, answering questions from recruiters and engineers about his work. Be concise, specific, and confident — 2-4 sentences unless asked for depth.

CORE FACTS (always true): ${site.name} is a ${site.role}, 3+ years production MERN experience at Web Design Magics. ${site.availabilityLabel}. Contact: ${site.email}. Location: ${site.location}.

RULES:
- Answer ONLY from the CONTEXT passages below. If the context doesn't contain the answer, say so and suggest emailing ${site.email} — never invent details.
- When you use a passage, cite it inline like [1] or [2] matching the passage number.
- For availability/hiring questions, be warm and point to ${site.email}.`;

const MAX_REWRITES = 2;
const MAX_GENERATE_ATTEMPTS = 2;

export type ChatMessage = { role: string; content: string };
export type Source = { n: number; title: string; href: string };

const overwrite = <T>(_current: T, next: T) => next;

const GraphState = Annotation.Root({
  history: Annotation<ChatMessage[]>(),
  query: Annotation<string>(),
  chunks: Annotation<Retrieved[]>({ value: overwrite, default: () => [] }),
  rewriteCount: Annotation<number>({ value: overwrite, default: () => 0 }),
  relevant: Annotation<boolean>({ value: overwrite, default: () => false }),
  citationOk: Annotation<boolean>({ value: overwrite, default: () => true }),
  generateAttempts: Annotation<number>({ value: overwrite, default: () => 0 }),
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
    sources: [],
  };
}

async function generateNode(state: State) {
  const context = state.chunks.map((c) => `[${c.rank}] (${c.source}) ${c.text}`).join("\n\n");
  const retryNote =
    state.generateAttempts > 0
      ? "\n\nYour previous reply didn't cite any passage. You MUST cite at least one [n] marker this time, or explicitly say the context doesn't cover the question."
      : "";
  const system = `${PERSONA}${retryNote}\n\nCONTEXT:\n${context}`;

  const reply = (await callClaude(system, state.history.slice(-12), 512)) ?? "Hmm, I hit an error generating a reply — try rephrasing?";
  const allSources = state.chunks.map((c) => ({ n: c.rank, title: c.source, href: c.href }));
  const cited = allSources.filter((s) => reply.includes(`[${s.n}]`));

  return {
    reply,
    sources: cited.length ? cited : allSources.slice(0, 3),
    citationOk: cited.length > 0,
    generateAttempts: state.generateAttempts + 1,
  };
}

function routeAfterCitationCheck(state: State) {
  if (!state.citationOk && state.generateAttempts < MAX_GENERATE_ATTEMPTS) return "regenerate";
  return "done";
}

const graph = new StateGraph(GraphState)
  .addNode("retrieve", retrieveNode)
  .addNode("grade", gradeNode)
  .addNode("rewriteQuery", rewriteQueryNode)
  .addNode("fallback", fallbackNode)
  .addNode("generate", generateNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "grade")
  .addConditionalEdges("grade", routeAfterGrade, {
    generate: "generate",
    rewriteQuery: "rewriteQuery",
    fallback: "fallback",
  })
  .addEdge("rewriteQuery", "retrieve")
  .addEdge("fallback", END)
  .addConditionalEdges("generate", routeAfterCitationCheck, {
    regenerate: "generate",
    done: END,
  })
  .compile();

export async function runChatGraph(history: ChatMessage[]): Promise<{ reply: string; sources: Source[] }> {
  const lastUser = [...history].reverse().find((m) => m.role === "user")?.content ?? "";
  const result = await graph.invoke(
    { history, query: String(lastUser).slice(0, 500) },
    { recursionLimit: 12 } // belt-and-suspenders cap alongside MAX_REWRITES/MAX_GENERATE_ATTEMPTS
  );
  return { reply: result.reply, sources: result.sources };
}
