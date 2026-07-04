# Portfolio Strategy — Muthu V

The thinking behind the site: positioning, design system, copy, and the roadmap that gets you into top product companies.

## 1. Positioning

**You are not "a MERN developer."** Thousands of resumes say that. Your differentiators are rarer:

- You designed a **50+ endpoint production backend from a blank repo** — most 3-year engineers have only extended someone else's.
- You've solved **real distributed-systems problems** (concurrent token refresh, timezone-correct queries, state-machine integrity) — not tutorial problems.
- You have **numbers**: -80% load time, -20% bug reports, 0 design defects, 4 RBAC roles.

**Positioning statement (used across site, resume, LinkedIn):**
> Full Stack Engineer who builds production systems that scale past the demo — and is now building AI-native features on that foundation.

The AI angle is deliberately framed as *"AI on top of production engineering"*, not *"AI enthusiast."* AI startups are drowning in prompt-tinkerers; they're starving for engineers who can put an LLM behind RBAC, validation, and an audit trail. The AI Lab's closing line — *"LLM output is a proposal, never a mutation"* — is a senior-engineer signal worth more than any framework list.

## 2. Resume positioning strategy

- Lead with the ERP backend, not the frontend work — architecture ownership is the scarce signal at 3 YOE.
- Rename the title to **"Full Stack Engineer"**; drop "Front End Development React" from the header (it undersells).
- Every bullet keeps the pattern: *verb → system → mechanism → measured outcome.* You already do this well.
- Add one line under the summary: "Portfolio with architecture case studies: muthu.dev" — the site is the proof the resume can't fit.
- Fix the typo "Shaden UI" → "Shadcn UI" in your resume.

## 3. Design system

**References:** Vercel (typographic restraint, dot grids), Linear (surface hierarchy, border glow), Stripe (diagram-as-content), Notion (calm density), Perplexity (AI-native accents).

### Color
| Token | Value | Use |
|---|---|---|
| background | hsl(240 6% 4%) | page |
| surface / surface-hover | 7% / 10% | cards |
| border / border-strong | 14% / 22% | hairlines, hover states |
| foreground | hsl(0 0% 95%) | primary text |
| muted / subtle | 62% / 42% | body / metadata |
| accent | hsl(210 100% 66%) | blue — interactive, engineering |
| accent-violet | hsl(258 90% 70%) | AI/experimental content |
| accent-emerald | hsl(160 84% 45%) | status: live/production |
| accent-amber | hsl(38 92% 55%) | infra, in-progress |

Rule: color = meaning, never decoration. Blue for engineering, violet for AI, green for "alive," amber for infrastructure.

### Typography
- **Inter** (UI/body) + **JetBrains Mono** (metadata, numbers, code, eyebrows) via next/font.
- Fluid display sizes with clamp(); tight tracking (-0.02 to -0.03em) on headings only.
- Mono is the "engineer texture": section eyebrows, metrics, timestamps, the `~/muthu-v` logo.

### Animation guidelines
- One easing everywhere: `cubic-bezier(0.21, 0.47, 0.32, 0.98)` — fast start, soft landing.
- Reveals: 24px rise + fade, 0.5–0.7s, staggered 80ms, trigger once at -80px margin.
- Micro-interactions: buttons scale 0.98 on press; cards get cursor-tracking spotlight + border lift; arrows nudge 2px on hover.
- Diagrams: edges draw in with pathLength, then a slow dash-flow suggests live data.
- Everything respects `prefers-reduced-motion`.

## 4. Content strategy

- **Case studies over screenshots.** Each project answers: what broke without it, how it's shaped, what was hard, what's measurable, where AI fits next. That last section turns legacy work into an AI roadmap.
- **Blog cadence:** one deep post per month, always from production experience ("the bug that only appears in production" genre). Three seed posts included. Cross-post to dev.to/Hashnode with canonical links back.
- **The site itself is a case study**: command palette, streaming AI chat, live GitHub feed — features recruiters can *touch*.

## 5. Flagship AI projects (build these next, in order)

### ① SiteBrain — RAG copilot for construction operations
Ask "what did we pay for cement across Site 3 this quarter, and is that above market?" over your ERP's audit trail. Hybrid search (pgvector + keyword), citations to source records, role-aware retrieval (RBAC filters what the LLM can see).
**Why it wins:** RAG + your real domain + the almost-never-seen "RBAC-filtered retrieval" — instantly senior. Directly extends a system you already built.

### ② Refhold — open-source race-condition-safe auth toolkit + AI explainer
npm package extracting your battle-tested JWT refresh queue (client interceptor + server rotation with grace windows), plus an AI assistant that reads a repo's auth code and explains its token flow / flags vulnerabilities.
**Why it wins:** OSS with real downloads beats any demo; it packages your best war story into something other engineers depend on. Write the launch post — it's HN-friendly.

### ③ FieldVoice — voice-to-structured-data for field teams
Offline-first PWA: field staff speak a site report in Tamil/English; Whisper transcribes, an LLM extracts structured data validated by Zod schemas, syncs into dashboards when connectivity returns. Human confirmation before commit.
**Why it wins:** multimodal AI + offline-first + emerging-market insight — a genuine product with your low-bandwidth field experience baked in. This is the one you demo live in interviews.

Each flagship gets the full case-study treatment on the site and a launch blog post. One shipped flagship beats three half-done ones — build in order.

## 6. Premium UX details already in the build

⌘K command palette · cursor-tracking spotlight cards · availability pulse · animated architecture diagrams with flowing dashes · copy-email with confirmation state · skeleton loaders on the GitHub strip · 404 page with personality · skip-to-content link · JSON-LD Person schema · security headers.
