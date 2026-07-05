import Link from "next/link";
import { freelance } from "@/lib/data/freelance";
import { SectionHeading } from "@/components/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

export function Freelance() {
    return (
        <section id="freelance" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
            <SectionHeading
                eyebrow="Freelance"
                title="Independent client work"
                description="Products I've shipped end-to-end for real clients — live and in use today."
            />

            <Stagger className="grid gap-5 md:grid-cols-2">
                {freelance.map((p) => (
                    <StaggerItem key={p.title}>
                        <Link href={p.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
                            <SpotlightCard className="flex h-full flex-col p-6 md:p-7">
                                <div className="relative -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-xl border-b border-border md:-mx-7 md:-mt-7">
                                    <Image
                                        src={p.image || ""}
                                        alt={`${p.title} homepage`}
                                        width={1280}
                                        height={720}
                                        className="aspect-video w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-surface/60 to-transparent" aria-hidden />
                                </div>
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        {p.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 shrink-0 text-subtle transition-all group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
                                </div>
                                <h3 className="font-semibold transition-colors group-hover:text-accent">{p.title}</h3>
                                <p className="mt-0.5 font-mono text-xs text-subtle">{p.client}</p>
                                <p className="mt-3 text-sm leading-relaxed text-muted">{p.description}</p>
                                <ul className="mt-4 flex-1 space-y-1.5">
                                    {p.highlights.map((h) => (
                                        <li key={h} className="flex gap-2 text-sm text-subtle">
                                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/70" aria-hidden />
                                            {h}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-4 truncate font-mono text-xs text-accent">{p.url.replace(/^https?:\/\//, "")}</p>
                            </SpotlightCard>
                        </Link>
                    </StaggerItem>
                ))}
            </Stagger>
        </section>
    );
}