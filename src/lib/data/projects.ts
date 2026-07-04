export type Metric = { label: string; value: string };

export type ArchNode = {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  accent?: "blue" | "violet" | "emerald" | "amber";
};

export type ArchEdge = { from: string; to: string; label?: string };

export type Project = {
  slug: string;
  title: string;
  client: string;
  period: string;
  status: "production" | "in-progress";
  tags: string[];
  oneLiner: string;
  problem: string;
  architecture: string[];
  challenges: { title: string; detail: string }[];
  aiOpportunities: string[];
  metrics: Metric[];
  deployment: string;
  stack: string[];
  links: { demo?: string; github?: string };
  diagram: { nodes: ArchNode[]; edges: ArchEdge[] };
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "construction-erp",
    title: "Construction ERP Platform",
    client: "Enterprise construction group",
    period: "2024 — Present",
    status: "production",
    featured: true,
    tags: ["Backend", "System Design", "Auth"],
    oneLiner:
      "A 50+ endpoint production ERP backend — attendance, CRM, procurement, site management, and finance — designed and shipped from a blank repo.",
    problem:
      "A construction group ran attendance, procurement, and finances across spreadsheets and WhatsApp. Field data was unverifiable, purchase orders had no audit trail, and month-end reconciliation took days. They needed one system of record that field staff, site engineers, accountants, and directors could all trust — each seeing only what their role allows.",
    architecture: [
      "Clean architecture: Route → Controller → Service → Repository, so business rules never leak into HTTP handlers and every module is testable in isolation.",
      "Zod schemas validate every request at the boundary; a centralised AppError hierarchy and consistent JSON response envelope keep failure modes predictable across 50+ endpoints.",
      "JWT auth with 15-minute access tokens and 7-day rotating refresh tokens. A race-condition-safe parallel refresh queue means ten simultaneous requests with an expired token trigger exactly one refresh — not ten.",
      "Granular RBAC middleware gates every endpoint by role (admin, site engineer, accountant, field staff) with permission checks composed per-route, not hard-coded per-controller.",
      "GPS-verified attendance: Haversine geofencing validates check-ins against site coordinates, Multer handles selfie capture, and IST-aware MySQL date logic eliminates an entire class of timezone bugs.",
      "Material procurement modelled as an explicit state machine (MRN → PO → delivery → inventory) with a full audit trail — invalid transitions are impossible by construction.",
      "Financial reconciliation engine: partial payment tracking, cron-driven overdue detection, and P&L / GST report generation rendered to PDF with PDFKit.",
    ],
    challenges: [
      {
        title: "Concurrent token refresh under field conditions",
        detail:
          "Field devices on poor networks fire bursts of parallel requests. When the access token expires, naive interceptors trigger N refresh calls and refresh-token rotation invalidates all but one — logging users out randomly. I built a promise-queue: the first 401 triggers the refresh, subsequent requests await the same promise, and everything retries with the new token.",
      },
      {
        title: "Timezone-correct attendance without timezone tables",
        detail:
          "MySQL on the host lacked timezone tables, so CONVERT_TZ silently returned NULL. I moved IST-awareness into the query layer with explicit offset arithmetic and date-boundary handling, making attendance day-rollover correct at midnight IST — verified with boundary-case tests.",
      },
      {
        title: "Procurement integrity across 4 roles",
        detail:
          "A PO edited after approval is a financial liability. The state machine enforces legal transitions, every mutation writes an immutable audit row, and RBAC ensures a site engineer can raise an MRN but never approve their own PO.",
      },
    ],
    aiOpportunities: [
      "RAG over site documents & POs: 'What did we pay for cement across Site 3 this quarter?' answered from the audit trail.",
      "Anomaly detection on attendance and payment patterns (duplicate selfies, geofence spoofing, unusual PO velocity).",
      "LLM-drafted purchase orders from unstructured supplier quotes with human approval in the existing state machine.",
    ],
    metrics: [
      { label: "REST endpoints", value: "50+" },
      { label: "User roles (RBAC)", value: "4" },
      { label: "Enterprise modules", value: "5" },
      { label: "Access-token TTL", value: "15 min" },
    ],
    deployment:
      "Render (Node.js) + Railway MySQL 8.0. SSL, CORS whitelisting, env-driven config, and a tsc → migrate → seed pipeline for repeatable zero-drift deploys.",
    stack: ["Node.js", "TypeScript", "Express", "Sequelize", "MySQL 8", "JWT", "Zod", "PDFKit", "Render", "Railway"],
    links: { github: "https://github.com/Mamuthvel" },
    diagram: {
      nodes: [
        { id: "client", label: "Field / Admin Clients", sub: "React · 4 roles", x: 60, y: 150, accent: "blue" },
        { id: "auth", label: "Auth Layer", sub: "JWT + refresh queue", x: 260, y: 60, accent: "violet" },
        { id: "api", label: "REST API", sub: "50+ endpoints · Zod", x: 260, y: 150, accent: "blue" },
        { id: "rbac", label: "RBAC Middleware", sub: "per-route gates", x: 260, y: 240, accent: "violet" },
        { id: "services", label: "Service Layer", sub: "state machines · audit", x: 460, y: 150, accent: "emerald" },
        { id: "db", label: "MySQL 8", sub: "Railway · IST-aware", x: 650, y: 100, accent: "amber" },
        { id: "jobs", label: "Cron Jobs", sub: "overdue · reports", x: 650, y: 200, accent: "amber" },
      ],
      edges: [
        { from: "client", to: "api", label: "HTTPS" },
        { from: "api", to: "auth" },
        { from: "api", to: "rbac" },
        { from: "api", to: "services" },
        { from: "services", to: "db" },
        { from: "services", to: "jobs" },
      ],
    },
  },
  {
    slug: "weconnect",
    title: "WeConnect 2.0",
    client: "LightHouse Community Foundation",
    period: "2024 — 2025",
    status: "production",
    featured: true,
    tags: ["Frontend", "Performance", "Product"],
    oneLiner:
      "A three-role community platform — youth portal, admin dashboard, staff tools — built pixel-perfect from Figma and tuned for low-bandwidth field devices.",
    problem:
      "A non-profit's field staff tracked youth programs on paper and disconnected tools. They needed one platform serving three very different users — youth members, program staff, and admins — that stays fast on cheap Android phones with patchy connectivity, and matches the funded design spec exactly.",
    architecture: [
      "Role-aware component architecture: one codebase renders three distinct experiences from a shared design system, with route-level code-splitting per role.",
      "Dynamic data tables with multi-column sorting, filtering, and server-side pagination — the server does the heavy lifting so low-end devices never hold full datasets in memory.",
      "Zustand for state with selective subscriptions: components re-render only on the slices they read, not on every store write.",
      "Centralised Axios interceptors inject auth tokens and normalise error handling once, instead of per-request boilerplate across dozens of API modules.",
      "React.memo + lazy-loaded routes keep the interactive bundle minimal; heavy admin views never ship to youth users.",
    ],
    challenges: [
      {
        title: "Fast on low-bandwidth field devices",
        detail:
          "The real users are field staff on budget phones. Server-side pagination, selective store subscriptions, and route-level lazy loading kept interactions responsive where a naive client-side table would have frozen the UI.",
      },
      {
        title: "Zero design-drift across three roles",
        detail:
          "Funders signed off on the Figma. I maintained pixel-fidelity through rapid client-feedback iterations — the client reported zero design-to-implementation defects across all roles.",
      },
    ],
    aiOpportunities: [
      "Natural-language report queries for program staff ('show attendance trends for the mentorship cohort').",
      "Auto-summarised activity logs so admins read a digest, not raw entries.",
    ],
    metrics: [
      { label: "User roles served", value: "3" },
      { label: "Design defects reported", value: "0" },
      { label: "Milestones missed", value: "0" },
    ],
    deployment: "SPA served via CDN with environment-driven API endpoints; CI checks on every merge.",
    stack: ["React", "TypeScript", "Zustand", "Axios", "Shadcn UI", "Vitest"],
    links: { github: "https://github.com/Mamuthvel" },
    diagram: {
      nodes: [
        { id: "youth", label: "Youth Portal", x: 60, y: 60, accent: "blue" },
        { id: "staff", label: "Staff Dashboard", x: 60, y: 150, accent: "blue" },
        { id: "admin", label: "Admin Dashboard", x: 60, y: 240, accent: "blue" },
        { id: "ds", label: "Shared Design System", sub: "role-aware components", x: 280, y: 150, accent: "violet" },
        { id: "store", label: "Zustand Store", sub: "selective subscriptions", x: 480, y: 90, accent: "emerald" },
        { id: "axios", label: "Axios Layer", sub: "interceptors · auth", x: 480, y: 210, accent: "emerald" },
        { id: "api", label: "REST API", sub: "server-side pagination", x: 660, y: 150, accent: "amber" },
      ],
      edges: [
        { from: "youth", to: "ds" },
        { from: "staff", to: "ds" },
        { from: "admin", to: "ds" },
        { from: "ds", to: "store" },
        { from: "ds", to: "axios" },
        { from: "axios", to: "api" },
      ],
    },
  },
  {
    slug: "homecare-marketplace",
    title: "Home Care Marketplace",
    client: "Consumer services startup",
    period: "2023 — 2024",
    status: "production",
    featured: true,
    tags: ["Frontend", "Performance", "Integrations"],
    oneLiner:
      "A service marketplace connecting homeowners with verified professionals — bookings, payments, SMS, and geo-location — where I cut page load time by 80%.",
    problem:
      "Homeowners had no trustworthy way to find vetted service professionals, and the client's early prototype was losing users to slow loads. The product needed end-to-end booking — discovery, scheduling, payment, notifications — at a speed that didn't bleed conversions.",
    architecture: [
      "Route-level code-splitting and lazy loading: users download the booking flow when they book, not on the landing page.",
      "Zustand API-response caching layer: repeat navigation hits memory, not the network.",
      "Third-party integration seams for payments, SMS notifications, and geo-location kept behind thin adapters so providers can be swapped without touching business logic.",
      "Jest test suites over critical booking and payment workflows, wired into the release process.",
    ],
    challenges: [
      {
        title: "An 80% page-load reduction",
        detail:
          "Profiling showed a monolithic bundle and redundant API calls. Strategic code-splitting, route-level lazy loading, and response caching in Zustand cut load time by 80% — with measurable retention and engagement gains.",
      },
      {
        title: "Confidence to ship weekly",
        detail:
          "Automated Jest suites over critical business workflows cut bug reports by 20% and turned releases from a gamble into a routine.",
      },
    ],
    aiOpportunities: [
      "Semantic search over service descriptions ('someone to fix a leaking tap this weekend').",
      "Smart provider-matching from job description, location, ratings, and availability.",
    ],
    metrics: [
      { label: "Page load time", value: "-80%" },
      { label: "Bug reports", value: "-20%" },
      { label: "Booking flow", value: "End-to-end" },
    ],
    deployment: "CDN-served SPA with staged rollouts; payment and SMS providers configured per environment.",
    stack: ["React", "Zustand", "Tailwind CSS", "Shadcn UI", "Jest"],
    links: { github: "https://github.com/Mamuthvel" },
    diagram: {
      nodes: [
        { id: "user", label: "Homeowner", x: 60, y: 150, accent: "blue" },
        { id: "app", label: "React SPA", sub: "code-split routes", x: 250, y: 150, accent: "violet" },
        { id: "cache", label: "Zustand Cache", sub: "API responses", x: 440, y: 60, accent: "emerald" },
        { id: "api", label: "Booking API", x: 440, y: 150, accent: "emerald" },
        { id: "pay", label: "Payments", x: 650, y: 80, accent: "amber" },
        { id: "sms", label: "SMS", x: 650, y: 150, accent: "amber" },
        { id: "geo", label: "Geo-location", x: 650, y: 220, accent: "amber" },
      ],
      edges: [
        { from: "user", to: "app" },
        { from: "app", to: "cache" },
        { from: "app", to: "api" },
        { from: "api", to: "pay" },
        { from: "api", to: "sms" },
        { from: "api", to: "geo" },
      ],
    },
  },
];

export const allTags = Array.from(new Set(projects.flatMap((p) => p.tags)));

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
