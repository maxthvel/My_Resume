"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { site } from "@/lib/data/site";
import { projects } from "@/lib/data/projects";
import {
  FileText, FolderGit2, FlaskConical, Github, Home, Mail, PenLine, Braces,
} from "lucide-react";

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  function go(href: string) {
    setOpen(false);
    if (href.startsWith("http") || href.startsWith("mailto")) window.open(href, "_blank");
    else router.push(href);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed left-1/2 top-24 z-50 w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl shadow-black/60"
    >
      <Command.Input
        placeholder="Type a command or search…"
        className="w-full border-b border-border bg-transparent px-4 py-3.5 text-sm text-foreground outline-none placeholder:text-subtle"
      />
      <Command.List className="max-h-80 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-subtle">No results.</Command.Empty>

        <Command.Group heading="Navigate" className="px-1 py-1 text-xs uppercase tracking-wider text-subtle [&_[cmdk-group-items]]:mt-1">
          <Item onSelect={() => go("/")} icon={<Home />}>Home</Item>
          <Item onSelect={() => go("/#projects")} icon={<FolderGit2 />}>Projects</Item>
          <Item onSelect={() => go("/ai-lab")} icon={<FlaskConical />}>AI Lab</Item>
          <Item onSelect={() => go("/blog")} icon={<PenLine />}>Blog</Item>
        </Command.Group>

        <Command.Group heading="Case studies" className="px-1 py-1 text-xs uppercase tracking-wider text-subtle [&_[cmdk-group-items]]:mt-1">
          {projects.map((p) => (
            <Item key={p.slug} onSelect={() => go(`/projects/${p.slug}`)} icon={<Braces />}>
              {p.title}
            </Item>
          ))}
        </Command.Group>

        <Command.Group heading="Actions" className="px-1 py-1 text-xs uppercase tracking-wider text-subtle [&_[cmdk-group-items]]:mt-1">
          <Item onSelect={() => go(site.resumeUrl)} icon={<FileText />}>Download résumé</Item>
          <Item onSelect={() => go(site.github)} icon={<Github />}>GitHub</Item>
          <Item onSelect={() => go(`mailto:${site.email}`)} icon={<Mail />}>Email me</Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}

function Item({
  children, onSelect, icon,
}: { children: React.ReactNode; onSelect: () => void; icon: React.ReactNode }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted aria-selected:bg-surface-hover aria-selected:text-foreground [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-subtle aria-selected:[&_svg]:text-accent"
    >
      {icon}
      {children}
    </Command.Item>
  );
}
