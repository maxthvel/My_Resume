"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Source = { n: number; title: string; href: string };
type Msg = { role: "user" | "assistant"; content: string; sources?: Source[] };

const SUGGESTIONS = [
  "What's the most complex system Muthu has built?",
  "How did he cut page load time by 80%?",
  "Is he available for hire?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      // Validation/server errors still come back as plain JSON — only successful
      // requests are streamed NDJSON.
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setMessages([...next, { role: "assistant", content: data.error ?? "Something went wrong." }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";
      let sources: Source[] | undefined;
      let started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as { type: "token"; text: string } | { type: "sources"; sources: Source[] };
          if (event.type === "token") {
            content += event.text;
            if (!started) {
              started = true;
              setLoading(false);
            }
          } else {
            sources = event.sources;
          }
          setMessages([...next, { role: "assistant", content, sources }]);
        }
      }

      if (!content) {
        setMessages([...next, { role: "assistant", content: "Hmm, no response — try again." }]);
      }
    } catch {
      setMessages([...next, { role: "assistant", content: "Network hiccup — try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask AI about Muthu"
        className={cn(
          "fixed bottom-5 right-5 z-40 flex h-13 items-center gap-2 rounded-full border border-border-strong bg-surface px-4 py-3 shadow-xl shadow-black/40 transition-all hover:border-accent/50 hover:shadow-accent/10",
          open && "pointer-events-none opacity-0"
        )}
      >
        <Bot className="h-5 w-5 text-accent" aria-hidden />
        <span className="text-sm font-medium">Ask AI</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed bottom-5 right-5 z-50 flex h-[520px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl shadow-black/60"
            role="dialog"
            aria-label="AI assistant"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-pulse-dot rounded-full bg-accent-emerald" />
                </span>
                <p className="text-sm font-medium">Muthu's AI — RAG over this site</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-subtle hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted">
                    I can answer questions about Muthu's projects, architecture decisions, and experience. Try:
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-muted transition-colors hover:border-accent/40 hover:text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-accent/15 text-foreground"
                      : "bg-background text-muted"
                  )}
                >
                  {m.content}
                  {m.sources && m.sources.length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1.5">
                      {m.sources.map((s) => (
                        <a
                          key={s.n}
                          href={s.href}
                          className="rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-subtle transition-colors hover:border-accent/40 hover:text-accent"
                        >
                          [{s.n}] {s.title}
                        </a>
                      ))}
                    </span>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-1.5 px-2 py-1" aria-label="Assistant is typing">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-subtle" style={{ animationDelay: `${i * 200}ms` }} />
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about my work…"
                aria-label="Message"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-subtle focus:border-accent/50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="rounded-lg bg-foreground p-2 text-background transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
