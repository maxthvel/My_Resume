import { NextResponse } from "next/server";
import { site } from "@/lib/data/site";
import { retrieve } from "@/lib/rag/retrieve";

export const maxDuration = 30;

const PERSONA = `You are the AI assistant on ${site.name}'s portfolio site, answering questions from recruiters and engineers about his work. Be concise, specific, and confident — 2-4 sentences unless asked for depth.

CORE FACTS (always true): ${site.name} is a ${site.role}, 3+ years production MERN experience at Web Design Magics. ${site.availabilityLabel}. Contact: ${site.email}. Location: ${site.location}.

RULES:
- Answer ONLY from the CONTEXT passages below. If the context doesn't contain the answer, say so and suggest emailing ${site.email} — never invent details.
- When you use a passage, cite it inline like [1] or [2] matching the passage number.
- For availability/hiring questions, be warm and point to ${site.email}.`;

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: { role: string; content: string }[] };
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // --- RAG: retrieve the most relevant content chunks for this question ---
    const chunks = await retrieve(String(lastUser).slice(0, 500), 6);
    const context = chunks
      .map((c) => `[${c.rank}] (${c.source}) ${c.text}`)
      .join("\n\n");
    const sources = chunks.map((c) => ({ n: c.rank, title: c.source, href: c.href }));

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Graceful degradation: no LLM key — return the retrieval results themselves,
      // which still demonstrates the RAG pipeline end-to-end.
      const top = chunks[0];
      return NextResponse.json({
        reply: top
          ? `(LLM key not configured — showing raw retrieval instead.) Most relevant passage: ${top.text}`
          : `The AI assistant isn't fully connected yet. Everything I'd tell you is in the case studies — or email ${site.email}.`,
        sources,
      });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        system: `${PERSONA}\n\nCONTEXT:\n${context}`,
        messages: messages.slice(-12).map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: String(m.content).slice(0, 2000),
        })),
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ reply: "The assistant hit a rate limit — try again shortly.", sources: [] });
    }

    const data = await res.json();
    const reply = data?.content?.[0]?.text ?? "Hmm, empty response — try rephrasing?";
    // Only surface sources the model actually cited (falls back to all retrieved)
    const cited = sources.filter((s) => reply.includes(`[${s.n}]`));
    return NextResponse.json({ reply, sources: cited.length ? cited : sources.slice(0, 3) });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
