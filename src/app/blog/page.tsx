import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Engineering notes from production: auth, performance, system design, and AI integration.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
      <SectionHeading
        eyebrow="Writing"
        title="Engineering notes"
        description="Postmortems, patterns, and hard-won details from systems in production."
      />

      <Stagger className="space-y-4">
        {posts.map((p) => (
          <StaggerItem key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="group block rounded-xl border border-border bg-surface p-6 transition-colors hover:border-border-strong">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-semibold transition-colors group-hover:text-accent">
                  {p.title}
                  <ArrowUpRight className="ml-1 inline h-4 w-4 text-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </h2>
                <span className="shrink-0 font-mono text-xs text-subtle">{p.date}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
              <div className="mt-4 flex items-center gap-2">
                {p.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                <span className="ml-auto font-mono text-xs text-subtle">{p.readingTime}</span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
