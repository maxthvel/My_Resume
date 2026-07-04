import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mb-12 md:mb-16">
      <p className="mb-3 font-mono text-sm uppercase tracking-widest text-accent">{eyebrow}</p>
      <h2 className="text-display font-semibold text-gradient">{title}</h2>
      {description && <p className="mt-4 max-w-2xl text-lg text-muted">{description}</p>}
    </Reveal>
  );
}
