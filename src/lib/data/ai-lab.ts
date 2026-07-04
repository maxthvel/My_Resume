export type Experiment = {
  title: string;
  status: "shipped" | "building" | "researching";
  category: string;
  description: string;
  stack: string[];
};

export const experiments: Experiment[] = [
  {
    title: "RAG chatbot over this portfolio",
    status: "shipped",
    category: "RAG Systems",
    description:
      "The chatbot on this site is a real retrieval pipeline: content chunked with citation metadata, hybrid retrieval (BM25 + Voyage embeddings) fused with Reciprocal Rank Fusion, top-k passages injected into Claude with inline citations you can click.",
    stack: ["BM25", "Voyage Embeddings", "RRF", "Claude API"],
  },
  {
    title: "RAG over ERP audit trails",
    status: "building",
    category: "RAG Systems",
    description:
      "Retrieval-augmented answers over procurement and payment history — embeddings on audit rows, hybrid search, and citations back to source records. Built on my Construction ERP domain.",
    stack: ["pgvector", "Embeddings", "Hybrid Search", "Node.js"],
  },
  {
    title: "Semantic service search",
    status: "building",
    category: "Semantic Search",
    description:
      "'Someone to fix a leaking tap this weekend' → ranked, available professionals. Embedding search over service descriptions with availability and geo re-ranking.",
    stack: ["Embeddings", "Re-ranking", "MongoDB Atlas Vector"],
  },
  {
    title: "LLM-drafted purchase orders",
    status: "researching",
    category: "AI Workflows",
    description:
      "Unstructured supplier quotes → structured PO drafts, validated by Zod schemas, approved by humans inside the existing procurement state machine. LLM output as a proposal, never a mutation.",
    stack: ["Structured Output", "Zod", "State Machines"],
  },
  {
    title: "Prompt-eval harness",
    status: "researching",
    category: "Prompt Engineering",
    description:
      "Small harness for versioning prompts and scoring outputs against golden sets — treating prompts like code: reviewed, tested, and regression-checked.",
    stack: ["Evals", "CI", "TypeScript"],
  },
  {
    title: "Attendance anomaly detection",
    status: "researching",
    category: "Applied ML",
    description:
      "Flagging geofence spoofing and duplicate selfie patterns in field attendance data — classical features first, model second.",
    stack: ["Feature Engineering", "Python", "MySQL"],
  },
];
