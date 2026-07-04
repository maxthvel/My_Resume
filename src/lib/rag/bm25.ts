import type { Chunk } from "./corpus";

/** Minimal BM25 implementation — zero dependencies, built in-memory at cold start. */

const K1 = 1.5;
const B = 0.75;

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export type BM25Index = {
  chunks: Chunk[];
  docTokens: string[][];
  df: Map<string, number>;
  avgLen: number;
};

export function buildIndex(chunks: Chunk[]): BM25Index {
  const docTokens = chunks.map((c) => tokenize(c.text));
  const df = new Map<string, number>();
  for (const tokens of docTokens) {
    for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const avgLen = docTokens.reduce((s, d) => s + d.length, 0) / Math.max(1, docTokens.length);
  return { chunks, docTokens, df, avgLen };
}

/** Returns chunk indices ranked by BM25 score (highest first), zero-score results excluded. */
export function bm25Search(index: BM25Index, query: string, topK: number): number[] {
  const qTokens = tokenize(query);
  const N = index.chunks.length;
  const scores = new Array<number>(N).fill(0);

  for (const q of new Set(qTokens)) {
    const dfq = index.df.get(q);
    if (!dfq) continue;
    const idf = Math.log(1 + (N - dfq + 0.5) / (dfq + 0.5));
    for (let i = 0; i < N; i++) {
      const tf = index.docTokens[i].filter((t) => t === q).length;
      if (!tf) continue;
      const len = index.docTokens[i].length;
      scores[i] += idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (len / index.avgLen))));
    }
  }

  return scores
    .map((score, i) => ({ score, i }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.i);
}
