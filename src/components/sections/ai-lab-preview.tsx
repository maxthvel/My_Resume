import Link from "next/link";
import { experiments } from "@/lib/data/ai-lab";
import { SectionHeading } from "@/components/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight, FlaskConical } from "lucide-react";
import { statusStyle } from "@/components/ai-status";

export function AiLabPreview() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <SectionHeading
        eyebrow="03 · AI Lab"
        title="Where the stack meets the models"
        description="LLM features grounded in real domains I've shipped — not chat wrappers."
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.slice(0, 3).map((x) => (
          <StaggerItem key={x.title}>
            <SpotlightCard className="h-full p-6">
              <div className="mb-3 flex items-center justify-between">
                <Badge className="border-accent-violet/30 text-accent-violet">
                  <FlaskConical className="h-3 w-3" aria-hidden /> {x.category}
                </Badge>
                <span className={statusStyle(x.status)}>{x.status}</span>
              </div>
              <h3 className="font-semibold">{x.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{x.description}</p>
            </SpotlightCard>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-10">
        <Link href="/ai-lab">
          <Button variant="secondary">
            Enter the AI Lab <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </section>
  );
}
