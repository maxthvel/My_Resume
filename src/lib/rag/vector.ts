import type { Chunk } from "./corpus";

/**
 * Optional dense-retrieval layer using Voyage AI embeddings (Anthropic's recommended
 * embedding partner). Enabled when VOYAGE_API_KEY is set; the corpus is embedded once
 * per server instance and cached in module scope. Without the key, retrieval falls
 * back to BM25-only — the chatbot still works.
 */

const MODEL = "voyage-3-lite";
let corpusVectors: Float64Array[] | null = null;
let embeddedFor: Chunk[] | null = null;

async function embed(texts: string[], inputType: "document" | "query"): Promise<number[][] | null> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, input: texts, input_type: inputType }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data.map((d: { embedding: number[] }) => d.embedding);
  } catch {
    return null;
  }
}

function cosine(a: Float64Array, b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

/** Returns chunk indices ranked by cosine similarity, or null if embeddings are unavailable. */
export async function vectorSearch(chunks: Chunk[], query: string, topK: number): Promise<number[] | null> {
  if (!process.env.VOYAGE_API_KEY) return null;

  // Embed corpus once per server instance (batches of 128 — corpus is ~70 chunks)
  if (!corpusVectors || embeddedFor !== chunks) {
    const vecs = await embed(chunks.map((c) => c.text), "document");
    if (!vecs) return null;
    corpusVectors = vecs.map((v) => Float64Array.from(v));
    embeddedFor = chunks;
  }

  const [qVec] = (await embed([query], "query")) ?? [];
  if (!qVec) return null;

  return corpusVectors
    .map((v, i) => ({ score: cosine(v, qVec), i }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.i);
}
