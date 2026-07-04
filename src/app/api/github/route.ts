import { NextResponse } from "next/server";
import { site } from "@/lib/data/site";

export const revalidate = 3600;

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "muthu-portfolio",
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const res = await fetch(`https://api.github.com/users/${site.githubUser}/events/public?per_page=10`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) return NextResponse.json({ items: [] });

    const events = (await res.json()) as Array<{
      type: string;
      repo: { name: string };
      payload: { commits?: { message: string }[]; action?: string; pull_request?: { title: string } };
      created_at: string;
    }>;

    const items = events.slice(0, 6).map((e) => ({
      type: e.type,
      repo: e.repo.name,
      message:
        e.payload.commits?.[0]?.message?.split("\n")[0] ??
        e.payload.pull_request?.title ??
        e.payload.action ??
        e.type.replace("Event", ""),
      date: e.created_at,
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
