"use client";

import React from "react";
import { normalizeGamemode } from "@/lib/tiers";

interface GamemodeIconProps {
  id: string;
  className?: string;
  size?: number;
}

const ITEM_MAP: Record<string, string> = {
  overall: "/items/overall.png",
  sword: "/items/sword.png",
  diamond: "/items/sword.png",
  crystal: "/items/crystal.png",
  vanilla: "/items/vanilla.png",
  nethpot: "/items/nethpot.png",
  nethop: "/items/nethpot.png",
  potion: "/items/potion.png",
  pot: "/items/potion.png",
  mace: "/items/mace.png",
  uhc: "/items/uhc.png",
  axe: "/items/axe.png",
  smp: "/items/smp.png",
  diasmp: "/items/smp.png",
};

export function GamemodeIcon({ id, className = "w-4 h-4", size = 20 }: GamemodeIconProps) {
  const clean = (id || "sword").toLowerCase().replace(/[^a-z0-9]/g, "");
  const norm = normalizeGamemode(id);
  const itemPath = ITEM_MAP[clean] || ITEM_MAP[norm] || "/items/sword.png";

  return (
    <img
      src={itemPath}
      alt={`${id} icon`}
      width={size}
      height={size}
      style={{
        imageRendering: "pixelated",
        width: `${size}px`,
        height: `${size}px`,
      }}
      className={`shrink-0 inline-block object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${className}`}
    />
  );
}
