import Link from "next/link";
import { site } from "@/lib/data/site";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 md:flex-row md:px-8">
        <p className="font-mono text-sm text-subtle">
          © {new Date().getFullYear()} {site.name} · Built with Next.js, deployed on Vercel
        </p>
        <div className="flex items-center gap-4">
          <Link href={site.github} target="_blank" aria-label="GitHub" className="text-subtle transition-colors hover:text-foreground"><Github className="h-5 w-5" /></Link>
          <Link href={site.linkedin} target="_blank" aria-label="LinkedIn" className="text-subtle transition-colors hover:text-foreground"><Linkedin className="h-5 w-5" /></Link>
          <Link href={site.x} target="_blank" aria-label="X / Twitter" className="text-subtle transition-colors hover:text-foreground"><Twitter className="h-5 w-5" /></Link>
          <Link href={`mailto:${site.email}`} aria-label="Email" className="text-subtle transition-colors hover:text-foreground"><Mail className="h-5 w-5" /></Link>
        </div>
      </div>
    </footer>
  );
}
