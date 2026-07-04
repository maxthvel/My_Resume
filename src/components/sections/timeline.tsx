import { timeline } from "@/lib/data/timeline";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function Timeline() {
  return (
    <section className="border-y border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <SectionHeading eyebrow="04 · Path" title="The trajectory" />

        <ol className="relative ml-3 space-y-12 border-l border-border pl-8 md:ml-6">
          {timeline.map((t, i) => (
            <Reveal key={t.period} delay={i * 0.08}>
              <li className="relative">
                <span
                  className="absolute -left-[38px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-background md:-left-[38px]"
                  aria-hidden
                />
                <p className="font-mono text-sm text-accent">{t.period}</p>
                <h3 className="mt-1 text-lg font-semibold">
                  {t.role} <span className="font-normal text-muted">· {t.org}</span>
                </h3>
                <ul className="mt-3 space-y-2">
                  {t.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-subtle" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
