"use client";

import Link from "next/link";
import { useState } from "react";
import { projects, allTags } from "@/lib/data/projects";
import { SectionHeading } from "@/components/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function FeaturedProjects() {
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter ? projects.filter((p) => p.tags.includes(filter)) : projects;

  return (
    <section id="projects" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
      <SectionHeading
        eyebrow="01 · Work"
        title="Case studies, not screenshots"
        description="Real systems running in production — with the problems, the architecture, and the numbers."
      />

      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
        <FilterChip active={filter === null} onClick={() => setFilter(null)}>All</FilterChip>
        {allTags.map((t) => (
          <FilterChip key={t} active={filter === t} onClick={() => setFilter(filter === t ? null : t)}>
            {t}
          </FilterChip>
        ))}
      </div>

      <Stagger className="grid gap-5">
        {shown.map((p, i) => (
          <StaggerItem key={p.slug}>
            <Link href={`/projects/${p.slug}`} className="group block">
              <SpotlightCard className="p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="font-mono text-sm text-subtle">0{i + 1}</span>
                      <Badge className="border-accent-emerald/30 text-accent-emerald">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" /> production
                      </Badge>
                    </div>
                    <h3 className="text-title font-semibold transition-colors group-hover:text-accent">
                      {p.title}
                      <ArrowUpRight className="ml-1.5 inline h-5 w-5 -translate-y-0.5 text-subtle opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-accent group-hover:opacity-100" aria-hidden />
                    </h3>
                    <p className="mt-2 leading-relaxed text-muted">{p.oneLiner}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.stack.slice(0, 6).map((s) => (
                        <Badge key={s}>{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid shrink-0 grid-cols-2 gap-x-8 gap-y-4 md:text-right">
                    {p.metrics.slice(0, 4).map((m) => (
                      <div key={m.label}>
                        <p className="font-mono text-xl font-semibold text-foreground">{m.value}</p>
                        <p className="text-xs text-subtle">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function FilterChip({
  children, active, onClick,
}: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-all",
        active
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-border bg-surface text-muted hover:border-border-strong hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
