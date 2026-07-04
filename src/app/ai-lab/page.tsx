import type { Metadata } from "next";
import { experiments } from "@/lib/data/ai-lab";
import { SectionHeading } from "@/components/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { statusStyle } from "@/components/ai-status";
import { FlaskConical } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Lab",
  description: "LLM experiments, RAG systems, agents, and semantic search — grounded in production domains.",
};

export default function AiLabPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <SectionHeading
        eyebrow="AI Lab"
        title="Experiments in AI-native product engineering"
        description="Every experiment here starts from a domain I've actually shipped — ERPs, marketplaces, field tools — because AI features are only as good as the systems underneath them."
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map((x) => (
          <StaggerItem key={x.title}>
            <SpotlightCard className="flex h-full flex-col p-6">
              <div className="mb-3 flex items-center justify-between">
                <Badge className="border-accent-violet/30 text-accent-violet">
                  <FlaskConical className="h-3 w-3" aria-hidden /> {x.category}
                </Badge>
                <span className={statusStyle(x.status)}>{x.status}</span>
              </div>
              <h2 className="font-semibold">{x.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{x.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {x.stack.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>

      <p className="mt-14 max-w-2xl font-mono text-sm leading-relaxed text-subtle">
        <span className="text-accent">// principle:</span> LLM output is a proposal, never a mutation.
        Every AI feature routes through the same validation, RBAC, and audit layers as a human action.
      </p>
    </div>
  );
}
