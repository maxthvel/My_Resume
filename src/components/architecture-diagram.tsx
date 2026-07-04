"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ArchEdge, ArchNode } from "@/lib/data/projects";

const accentColor: Record<string, string> = {
  blue: "hsl(210 100% 66%)",
  violet: "hsl(258 90% 70%)",
  emerald: "hsl(160 84% 45%)",
  amber: "hsl(38 92% 55%)",
};

const W = 150;
const H = 52;

export function ArchitectureDiagram({ nodes, edges, title }: { nodes: ArchNode[]; edges: ArchEdge[]; title: string }) {
  const reduce = useReducedMotion();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <figure className="overflow-x-auto rounded-xl border border-border bg-background p-4">
      <figcaption className="mb-2 flex items-center gap-2 px-2 font-mono text-xs text-subtle">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        </span>
        architecture · {title}
      </figcaption>
      <svg viewBox="0 0 810 310" className="min-w-[640px]" role="img" aria-label={`Architecture diagram for ${title}`}>
        {/* Edges */}
        {edges.map((e, i) => {
          const a = byId[e.from];
          const b = byId[e.to];
          if (!a || !b) return null;
          const x1 = a.x + W;
          const y1 = a.y + H / 2;
          const x2 = b.x;
          const y2 = b.y + H / 2;
          const mx = (x1 + x2) / 2;
          const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
          return (
            <g key={i}>
              <motion.path
                d={d}
                fill="none"
                stroke="hsl(240 5% 26%)"
                strokeWidth="1.5"
                initial={reduce ? undefined : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.12 }}
              />
              <path
                d={d}
                fill="none"
                stroke={accentColor.blue}
                strokeWidth="1.5"
                strokeDasharray="4 20"
                className="animate-dash opacity-60"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={reduce ? undefined : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <rect
              x={n.x} y={n.y} width={W} height={H} rx="8"
              fill="hsl(240 5% 7%)"
              stroke={accentColor[n.accent ?? "blue"]}
              strokeOpacity="0.45"
              strokeWidth="1"
            />
            <circle cx={n.x + 14} cy={n.y + (n.sub ? 20 : H / 2)} r="3" fill={accentColor[n.accent ?? "blue"]} />
            <text x={n.x + 26} y={n.y + (n.sub ? 24 : H / 2 + 4)} fill="hsl(0 0% 92%)" fontSize="12" fontWeight="600" fontFamily="var(--font-mono)">
              {n.label}
            </text>
            {n.sub && (
              <text x={n.x + 26} y={n.y + 40} fill="hsl(240 4% 55%)" fontSize="10" fontFamily="var(--font-mono)">
                {n.sub}
              </text>
            )}
          </motion.g>
        ))}
      </svg>
    </figure>
  );
}
