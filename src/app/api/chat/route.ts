import { NextResponse } from "next/server";
import { site } from "@/lib/data/site";
import { retrieve } from "@/lib/rag/retrieve";
import { runChatGraph } from "@/lib/rag/graph";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: { role: string; content: string }[] };
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Graceful degradation: no LLM key — return the retrieval results themselves
      // (bypasses the graph entirely, since every node in it needs the LLM).
      const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
      const chunks = await retrieve(String(lastUser).slice(0, 500), 6);
      const top = chunks[0];
      return NextResponse.json({
        reply: top
          ? `(LLM key not configured — showing raw retrieval instead.) Most relevant passage: ${top.text}`
          : `The AI assistant isn't fully connected yet. Everything I'd tell you is in the case studies — or email ${site.email}.`,
        sources: chunks.map((c) => ({ n: c.rank, title: c.source, href: c.href })),
      });
    }

    // --- Agentic RAG: retrieve -> grade -> rewrite/retry -> generate -> verify citations ---
    const { reply, sources } = await runChatGraph(messages);
    return NextResponse.json({ reply, sources });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
