import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { projects } from "@/lib/data/projects";
import { expertise } from "@/lib/data/expertise";
import { experiments } from "@/lib/data/ai-lab";
import { timeline } from "@/lib/data/timeline";
import { site } from "@/lib/data/site";
import { freelance } from "@/lib/data/freelance";

export type Chunk = {
  id: string;
  text: string;
  source: string; // human-readable citation label
  href: string;   // where a reader can verify the claim
};

let cached: Chunk[] | null = null;

/** Builds the retrieval corpus from the site's typed content + blog MDX. Built once per server instance. */
export function getCorpus(): Chunk[] {
  if (cached) return cached;
  const chunks: Chunk[] = [];
  const add = (id: string, text: string, source: string, href: string) =>
    chunks.push({ id, text: text.trim(), source, href });

  add(
    "profile",
    `${site.name} is a ${site.role} with 3+ years of production MERN experience at Web Design Magics. ${site.tagline} ${site.availabilityLabel}. Location: ${site.location}. Contact: ${site.email}. GitHub: ${site.github}.`,
    "About Muthu",
    "/"
  );

  for (const p of projects) {
    const base = `/projects/${p.slug}`;
    add(`${p.slug}:overview`, `${p.title} (${p.client}, ${p.period}, ${p.status}). ${p.oneLiner} Stack: ${p.stack.join(", ")}. Metrics: ${p.metrics.map((m) => `${m.label}: ${m.value}`).join("; ")}.`, p.title, base);
    add(`${p.slug}:problem`, `${p.title} — the problem: ${p.problem}`, `${p.title} · Problem`, base);
    for (let i = 0; i < p.architecture.length; i += 2) {
      add(`${p.slug}:arch:${i}`, `${p.title} — architecture: ${p.architecture.slice(i, i + 2).join(" ")}`, `${p.title} · Architecture`, base);
    }
    for (const c of p.challenges) {
      add(`${p.slug}:challenge:${c.title}`, `${p.title} — engineering challenge, ${c.title}: ${c.detail}`, `${p.title} · ${c.title}`, base);
    }
    add(`${p.slug}:ai`, `${p.title} — where AI fits next: ${p.aiOpportunities.join(" ")}`, `${p.title} · AI roadmap`, base);
    add(`${p.slug}:deploy`, `${p.title} — deployment: ${p.deployment}`, `${p.title} · Deployment`, base);
  }

  for (const e of expertise) {
    add(`exp:${e.id}`, `Expertise — ${e.title}: ${e.summary} Evidence: ${e.points.join("; ")}.`, `Expertise · ${e.title}`, "/#expertise");
  }

  for (const f of freelance) {
    add(`fl:${f.title}`, `Freelance — ${f.title} for ${f.client} (${f.url}): ${f.description} ${f.highlights.join(" ")} Stack: ${f.stack.join(", ")}.`, `Freelance · ${f.title}`, "/#freelance");
  }

  for (const x of experiments) {
    add(`lab:${x.title}`, `AI Lab (${x.status}) — ${x.title} [${x.category}]: ${x.description} Stack: ${x.stack.join(", ")}.`, `AI Lab · ${x.title}`, "/ai-lab");
  }

  for (const t of timeline) {
    add(`tl:${t.period}`, `${t.period}: ${t.role} at ${t.org}. ${t.highlights.join(" ")}`, `Timeline · ${t.role}`, "/");
  }

  const blogDir = path.join(process.cwd(), "content", "blog");
  if (fs.existsSync(blogDir)) {
    for (const file of fs.readdirSync(blogDir).filter((f) => f.endsWith(".mdx"))) {
      const slug = file.replace(/\.mdx$/, "");
      const { data, content } = matter(fs.readFileSync(path.join(blogDir, file), "utf-8"));
      const sections = content.split(/^## /m);
      sections.forEach((sec, i) => {
        const text = sec.replace(/```[\s\S]*?```/g, "(code example)").replace(/[#*`]/g, "").trim();
        if (text.length < 40) return;
        const heading = i === 0 ? "intro" : sec.split("\n")[0].trim();
        add(`blog:${slug}:${i}`, `Blog post "${data.title}" — ${heading}: ${text.slice(0, 900)}`, `Blog · ${data.title}`, `/blog/${slug}`);
      });
    }
  }

  cached = chunks;
  return chunks;
}
