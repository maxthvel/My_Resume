import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProject, projects } from "@/lib/data/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { Reveal } from "@/components/motion/reveal";
import { ArrowLeft, ArrowUpRight, Github, Sparkles } from "lucide-react";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: p.title, description: p.oneLiner };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  return (
    <article className="mx-auto max-w-4xl px-5 pb-24 pt-28 md:px-8 md:pt-32">
      <Link href="/#projects" className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All case studies
      </Link>

      <Reveal>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Badge className="border-accent-emerald/30 text-accent-emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald" /> {p.status}
          </Badge>
          <span className="font-mono text-sm text-subtle">{p.period} · {p.client}</span>
        </div>
        <h1 className="text-display font-semibold text-gradient">{p.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{p.oneLiner}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {p.stack.map((s) => <Badge key={s}>{s}</Badge>)}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {p.links.demo && (
            <Link href={p.links.demo} target="_blank">
              <Button>Live demo <ArrowUpRight className="h-4 w-4" aria-hidden /></Button>
            </Link>
          )}
          {p.links.github && (
            <Link href={p.links.github} target="_blank">
              <Button variant="secondary"><Github className="h-4 w-4" aria-hidden /> GitHub</Button>
            </Link>
          )}
        </div>
      </Reveal>

      {/* Metrics */}
      <Reveal className="mt-14">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
          {p.metrics.map((m) => (
            <div key={m.label} className="bg-surface p-5">
              <p className="font-mono text-2xl font-semibold text-foreground">{m.value}</p>
              <p className="mt-1 text-xs text-subtle">{m.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Section title="The problem">
        <p className="leading-relaxed text-muted">{p.problem}</p>
      </Section>

      <Section title="Architecture">
        <div className="mb-8">
          <ArchitectureDiagram nodes={p.diagram.nodes} edges={p.diagram.edges} title={p.title} />
        </div>
        <ul className="space-y-4">
          {p.architecture.map((a) => (
            <li key={a} className="flex gap-3 leading-relaxed text-muted">
              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
              {a}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Key engineering challenges">
        <div className="space-y-5">
          {p.challenges.map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-surface p-6">
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{c.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Where AI fits next">
        <ul className="space-y-3">
          {p.aiOpportunities.map((a) => (
            <li key={a} className="flex gap-3 leading-relaxed text-muted">
              <Sparkles className="mt-1 h-4 w-4 shrink-0 text-accent-violet" aria-hidden />
              {a}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Deployment">
        <p className="rounded-xl border border-border bg-surface p-6 font-mono text-sm leading-relaxed text-muted">
          {p.deployment}
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal className="mt-16">
      <h2 className="mb-6 text-title font-semibold">{title}</h2>
      {children}
    </Reveal>
  );
}
