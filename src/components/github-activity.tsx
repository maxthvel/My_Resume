"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/data/site";
import { GitCommit, GitPullRequest, Star, CircleDot } from "lucide-react";

type Item = { type: string; repo: string; message: string; date: string };

const icons: Record<string, React.ReactNode> = {
  PushEvent: <GitCommit className="h-3.5 w-3.5 text-accent" />,
  PullRequestEvent: <GitPullRequest className="h-3.5 w-3.5 text-accent-violet" />,
  WatchEvent: <Star className="h-3.5 w-3.5 text-accent-amber" />,
  default: <CircleDot className="h-3.5 w-3.5 text-subtle" />,
};

export function GitHubActivity() {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    fetch("/api/github")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setItems(d?.items ?? []))
      .catch(() => setItems([]));
  }, []);

  if (items === null) {
    return (
      <div className="flex gap-3" aria-hidden>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 flex-1 animate-pulse rounded-lg border border-border bg-surface" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="font-mono text-sm text-subtle">
        <span className="text-accent">$</span> gh activity --user {site.githubUser} · live feed connects on deploy
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.slice(0, 3).map((it, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface/80 p-3.5 backdrop-blur">
          <div className="flex items-center gap-2 font-mono text-xs text-subtle">
            {icons[it.type] ?? icons.default}
            <span className="truncate">{it.repo}</span>
          </div>
          <p className="mt-1.5 truncate text-sm text-muted">{it.message}</p>
        </div>
      ))}
    </div>
  );
}
