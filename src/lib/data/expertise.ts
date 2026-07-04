export type Expertise = {
  id: string;
  title: string;
  summary: string;
  points: string[];
  icon: string; // lucide icon name mapped in the component
};

export const expertise: Expertise[] = [
  {
    id: "auth",
    title: "JWT Auth Architecture",
    icon: "KeyRound",
    summary: "Short-lived access tokens, rotating refresh tokens, and interceptors that survive concurrency.",
    points: [
      "15-min access / 7-day refresh rotation in production",
      "Race-condition-safe parallel refresh queue",
      "Token injection & error normalisation at one seam",
    ],
  },
  {
    id: "rbac",
    title: "RBAC Systems",
    icon: "ShieldCheck",
    summary: "Role-gated access composed per-route — not sprinkled through controllers.",
    points: [
      "4-role production system across 50+ endpoints",
      "Permission middleware as composable units",
      "Separation-of-duty rules (no self-approval)",
    ],
  },
  {
    id: "backend",
    title: "Scalable Backend Architecture",
    icon: "Layers",
    summary: "Clean architecture that keeps business logic independent of HTTP, ORM, and framework.",
    points: [
      "Route → Controller → Service → Repository",
      "Explicit state machines for critical workflows",
      "Centralised error hierarchy & response envelopes",
    ],
  },
  {
    id: "api",
    title: "API Design",
    icon: "Braces",
    summary: "Contracts validated at the boundary, versioned thoughtfully, documented by shape.",
    points: [
      "Zod schema validation on every request",
      "Consistent JSON envelopes across 50+ endpoints",
      "Predictable pagination, filtering & sorting semantics",
    ],
  },
  {
    id: "caching",
    title: "Caching Strategies",
    icon: "Database",
    summary: "Cache where it changes the user's experience — memory, store, and HTTP layers.",
    points: [
      "Zustand response caching (part of an 80% load-time cut)",
      "Selective store subscriptions to kill re-renders",
      "HTTP cache headers & revalidation on the edge",
    ],
  },
  {
    id: "performance",
    title: "Performance Optimization",
    icon: "Gauge",
    summary: "Profile first, then split, defer, and cache. Numbers or it didn't happen.",
    points: [
      "80% page-load reduction on a production app",
      "Route-level code-splitting & lazy loading",
      "React.memo applied surgically, not superstitiously",
    ],
  },
  {
    id: "pipelines",
    title: "Deployment Pipelines",
    icon: "Rocket",
    summary: "Repeatable deploys: build, migrate, seed — the same way every time.",
    points: [
      "tsc → migrate → seed pipeline on Render",
      "Env-driven config, SSL, CORS whitelisting",
      "Railway MySQL with zero-drift schema migrations",
    ],
  },
  {
    id: "database",
    title: "Database Optimization",
    icon: "HardDrive",
    summary: "Schema design and queries that respect how databases actually work.",
    points: [
      "IST-aware date queries without timezone tables",
      "Indexed lookups for geofence & attendance paths",
      "Audit-trail tables designed for append-only writes",
    ],
  },
  {
    id: "system-design",
    title: "System Design Thinking",
    icon: "Network",
    summary: "Model the domain, make illegal states unrepresentable, plan for the failure case first.",
    points: [
      "Procurement as an explicit state machine with audit trail",
      "Financial reconciliation with partial-payment modelling",
      "Cron-driven background jobs for time-based rules",
    ],
  },
];
