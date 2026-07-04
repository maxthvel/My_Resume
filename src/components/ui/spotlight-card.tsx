"use client";

import { cn } from "@/lib/utils";
import { useRef, type HTMLAttributes, type MouseEvent } from "react";

export function SpotlightCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={cn(
        "spotlight-card rounded-xl border border-border bg-surface transition-colors duration-300 hover:border-border-strong",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
