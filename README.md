# Muthu V — Portfolio

Premium, dark-first developer portfolio. Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · MDX.

## Quick start

```bash
npm install
cp .env.example .env.local   # add your keys (optional but recommended)
npm run dev
```

## Environment variables

| Variable | Purpose | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | Powers the "Ask AI" RAG chatbot | No — without it the widget returns raw retrieval results |
| `VOYAGE_API_KEY` | Adds dense (embedding) retrieval to the chatbot's hybrid search | No — falls back to BM25 keyword retrieval |
| `GITHUB_TOKEN` | Raises rate limits for the live GitHub activity strip | No — works unauthenticated at lower limits |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO/sitemap | Yes, in production |

## Before you deploy

1. **Résumé**: replace `public/resume.pdf` (currently a placeholder) with your actual PDF.
2. **Links**: update `src/lib/data/site.ts` — LinkedIn/X URLs are placeholders; set your real domain.
3. **Project links**: add live demo/GitHub repo URLs in `src/lib/data/projects.ts`.
4. Deploy on Vercel: import repo → set env vars → done. API routes run as serverless functions automatically.

## Structure

```
content/blog/          MDX posts (frontmatter: title, description, date, tags)
src/app/               App Router pages + API routes (chat, github) + SEO (sitemap, robots)
src/components/        Sections, UI primitives, motion helpers, chat widget, command palette
src/lib/data/          All content as typed data — edit these to update the site
docs/                  Brand, copywriting & positioning strategy
```

## Editing content

- **Everything recruiters read lives in `src/lib/data/`** — projects, expertise, AI lab, timeline, site config. No component changes needed.
- **Blog**: drop an `.mdx` file in `content/blog/`. Reading time, listing, sitemap, and metadata are automatic.
- **Chatbot knowledge (RAG)**: `src/lib/rag/corpus.ts` chunks all site content (projects, expertise, blog MDX) with citation metadata at cold start. `retrieve.ts` runs hybrid search — BM25 (`bm25.ts`, zero dependencies) + optional Voyage embeddings (`vector.ts`) — fused with Reciprocal Rank Fusion. Add content to the data files and it's automatically retrievable.
- **Agentic orchestration (LangGraph)**: `src/lib/rag/graph.ts` wraps retrieval + generation in a corrective-RAG state graph — `retrieve → grade → generate → verify citations`, with cycles back to a query-rewrite node when the retrieved chunks don't match the question (capped at 2 retries) and back to `generate` when a reply cites nothing (capped at 1 retry). A genuinely irrelevant question short-circuits to a deterministic "email me" fallback instead of letting the LLM guess. The chat route (`src/app/api/chat/route.ts`) just calls `runChatGraph()`.

## Features

Command palette (⌘K) · animated SVG architecture diagrams · dynamic project filtering · live GitHub feed · agentic RAG chat via LangGraph (hybrid BM25 + embeddings, self-correcting retrieval, cited sources) · full SEO (Open Graph, JSON-LD Person schema, sitemap, robots) · accessibility (skip links, focus rings, aria labels, reduced-motion support) · security headers.
