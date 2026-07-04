"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { site } from "@/lib/data/site";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Copy, Check } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(site.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t border-border">
      <div
        className="absolute left-1/2 top-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-[100px]"
        style={{ background: "radial-gradient(closest-side, hsl(210 100% 55%), transparent)" }}
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-5 py-28 text-center md:px-8 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <p className="mb-3 font-mono text-sm uppercase tracking-widest text-accent">06 · Contact</p>
          <h2 className="mx-auto max-w-2xl text-display font-semibold text-gradient">
            Have a system that needs to survive real users?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
            I'm currently {site.available ? "open to" : "considering"} product engineering roles —
            especially where AI features need a production-grade backbone.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href={`mailto:${site.email}`}>
              <Button size="lg">
                {site.email} <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <Button variant="secondary" size="lg" onClick={copyEmail} aria-live="polite">
              {copied ? <><Check className="h-4 w-4 text-accent-emerald" aria-hidden /> Copied</> : <><Copy className="h-4 w-4" aria-hidden /> Copy email</>}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
