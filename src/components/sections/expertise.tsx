import { expertise } from "@/lib/data/expertise";
import { SectionHeading } from "@/components/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  Braces, Database, Gauge, HardDrive, KeyRound, Layers, Network, Rocket, ShieldCheck,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  KeyRound: <KeyRound />, ShieldCheck: <ShieldCheck />, Layers: <Layers />,
  Braces: <Braces />, Database: <Database />, Gauge: <Gauge />,
  Rocket: <Rocket />, HardDrive: <HardDrive />, Network: <Network />,
};

export function Expertise() {
  return (
    <section id="expertise" className="border-y border-border bg-surface/30">
      <div className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
        <SectionHeading
          eyebrow="02 · Depth"
          title="Engineering expertise"
          description="Not a skills cloud — each of these is backed by decisions I've defended in production."
        />

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {expertise.map((e) => (
            <StaggerItem key={e.id}>
              <SpotlightCard className="h-full p-6">
                <div className="mb-4 inline-flex rounded-lg border border-border bg-background p-2.5 text-accent [&_svg]:h-5 [&_svg]:w-5">
                  {iconMap[e.icon]}
                </div>
                <h3 className="font-semibold">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{e.summary}</p>
                <ul className="mt-4 space-y-1.5">
                  {e.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-sm text-subtle">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/70" aria-hidden />
                      {pt}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
