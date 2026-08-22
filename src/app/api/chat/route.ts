import { NextResponse } from "next/server";
import { site } from "@/lib/data/site";
import { retrieve } from "@/lib/rag/retrieve";
import { runChatGraphStream, type StreamEvent } from "@/lib/rag/graph";

export const maxDuration = 30;

type IncomingMessage = { role: string; content: string };

async function* generateEvents(messages: IncomingMessage[]): AsyncGenerator<StreamEvent> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Graceful degradation: no LLM key — stream the retrieval results themselves
    // as a single chunk (bypasses the graph entirely, since every node needs the LLM).
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const chunks = await retrieve(String(lastUser).slice(0, 500), 6);
    const top = chunks[0];
    yield {
      type: "token",
      text: top
        ? `(LLM key not configured — showing raw retrieval instead.) Most relevant passage: ${top.text}`
        : `The AI assistant isn't fully connected yet. Everything I'd tell you is in the case studies — or email ${site.email}.`,
    };
    yield { type: "sources", sources: chunks.map((c) => ({ n: c.rank, title: c.source, href: c.href })) };
    return;
  }

  // --- Agentic RAG: retrieve -> grade -> rewrite/retry -> stream generation -> verify citations ---
  yield* runChatGraphStream(messages);
}

/** NDJSON: one JSON-encoded StreamEvent per line, so the client can parse partial reads without full SSE framing. */
function toNdjsonStream(events: AsyncGenerator<StreamEvent>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of events) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        }
      } catch {
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "token", text: "\n\n(Something went wrong — try again.)" } satisfies StreamEvent) + "\n")
        );
      } finally {
        controller.close();
      }
    },
  });
}

export async function POST(req: Request) {
  let messages: IncomingMessage[];
  try {
    ({ messages } = (await req.json()) as { messages: IncomingMessage[] });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  return new Response(toNdjsonStream(generateEvents(messages)), {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
