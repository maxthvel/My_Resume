import { getCorpus, type Chunk } from "./corpus";
import { buildIndex, bm25Search, type BM25Index } from "./bm25";
import { vectorSearch } from "./vector";

let index: BM25Index | null = null;

export type Retrieved = Chunk & { rank: number };

/**
 * Hybrid retrieval: BM25 (always) + dense embeddings (when VOYAGE_API_KEY is set),
 * fused with Reciprocal Rank Fusion. Returns the top-k chunks with citation metadata.
 */
export async function retrieve(query: string, topK = 6): Promise<Retrieved[]> {
  const corpus = getCorpus();
  if (!index) index = buildIndex(corpus);

  const K = 60; // RRF constant
  const fused = new Map<number, number>();

  const sparse = bm25Search(index, query, topK * 2);
  sparse.forEach((docId, rank) => fused.set(docId, (fused.get(docId) ?? 0) + 1 / (K + rank)));

  const dense = await vectorSearch(corpus, query, topK * 2);
  if (dense) dense.forEach((docId, rank) => fused.set(docId, (fused.get(docId) ?? 0) + 1 / (K + rank)));

  return [...fused.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topK)
    .map(([docId], rank) => ({ ...corpus[docId], rank: rank + 1 }));
}
