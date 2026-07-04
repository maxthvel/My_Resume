import Link from "next/link";
import type { PostMeta } from "@/lib/blog";
import { SectionHeading } from "@/components/section-heading";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ArrowUpRight } from "lucide-react";

export function BlogPreview({ posts }: { posts: PostMeta[] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <SectionHeading
        eyebrow="05 · Writing"
        title="Engineering notes"
        description="Postmortems and patterns from production — the stuff I wish someone had written down for me."
      />

      <Stagger className="divide-y divide-border border-y border-border">
        {posts.slice(0, 3).map((p) => (
          <StaggerItem key={p.slug}>
            <Link
              href={`/blog/${p.slug}`}
              className="group flex flex-col gap-2 py-6 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div className="max-w-2xl">
                <h3 className="font-medium transition-colors group-hover:text-accent">
                  {p.title}
                  <ArrowUpRight className="ml-1 inline h-4 w-4 text-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </h3>
                <p className="mt-1 text-sm text-muted">{p.description}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-subtle">
                {p.date} · {p.readingTime}
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
