"use client";

import { useState, type ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { CommandPalette } from "@/components/command-palette";

export function Shell({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  return (
    <>
      <Navbar onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
      {children}
    </>
  );
}
