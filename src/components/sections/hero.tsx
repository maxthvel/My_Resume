"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { site } from "@/lib/data/site";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Github, Linkedin } from "lucide-react";
import { GitHubActivity } from "@/components/github-activity";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-36 md:pb-28 md:pt-44">
      {/* Motion background */}
      <div className="dot-grid absolute inset-0 -z-10" aria-hidden />
      <div
        className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(closest-side, hsl(210 100% 50%), hsl(258 90% 50% / 0.5), transparent)" }}
        aria-hidden
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl px-5 md:px-8"
      >
        {/* Availability */}
        <motion.div variants={item} className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/80 px-4 py-1.5 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute h-full w-full animate-pulse-dot rounded-full bg-accent-emerald" />
          </span>
          <span className="text-sm text-muted">{site.availabilityLabel}</span>
        </motion.div>

        <motion.h1 variants={item} className="max-w-4xl text-display-lg font-semibold">
          <span className="text-gradient">I build production systems</span>
          <br />
          <span className="text-gradient-accent">that scale past the demo.</span>
        </motion.h1>

        <motion.p variants={item} className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
          Full stack product engineer — 3+ years shipping MERN systems that real businesses run on:
          a 50-endpoint ERP backend, race-condition-safe auth, and frontends that cut load times by 80%.
          Now building AI-native features on top of that foundation.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/#projects">
            <Button size="lg">
              View case studies <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Link>
          <Link href={site.resumeUrl} target="_blank">
            <Button variant="secondary" size="lg">
              <FileText className="h-4 w-4" aria-hidden /> Résumé
            </Button>
          </Link>
          <div className="ml-1 flex items-center gap-1">
            <Link href={site.github} target="_blank" aria-label="GitHub">
              <Button variant="ghost" size="md" aria-hidden><Github className="h-5 w-5" /></Button>
            </Link>
            <Link href={site.linkedin} target="_blank" aria-label="LinkedIn">
              <Button variant="ghost" size="md" aria-hidden><Linkedin className="h-5 w-5" /></Button>
            </Link>
          </div>
        </motion.div>

        {/* GitHub live strip */}
        <motion.div variants={item} className="mt-16">
          <GitHubActivity />
        </motion.div>
      </motion.div>
    </section>
  );
}
