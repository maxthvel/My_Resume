import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.meta.title, description: post.meta.description };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-28 md:px-8 md:pt-32">
      <Link href="/blog" className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All posts
      </Link>

      <header className="mb-12">
        <p className="mb-4 font-mono text-sm text-subtle">{post.meta.date} · {post.meta.readingTime}</p>
        <h1 className="text-display font-semibold text-gradient">{post.meta.title}</h1>
        <p className="mt-4 text-lg text-muted">{post.meta.description}</p>
        <div className="mt-5 flex gap-2">
          {post.meta.tags.map((t) => <Badge key={t}>{t}</Badge>)}
        </div>
      </header>

      <div className="prose prose-invert max-w-none prose-headings:tracking-tight prose-a:text-accent prose-pre:border prose-pre:border-border prose-pre:bg-surface prose-code:font-mono">
        <MDXRemote source={post.content} />
      </div>
    </article>
  );
}
