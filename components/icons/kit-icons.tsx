"use client";

import React from "react";
import { KitId, normalizeGamemode } from "@/lib/tiers";

export interface KitIconProps {
  kit: KitId | string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

const KIT_ITEM_MAP: Record<string, string> = {
  sword: "/items/sword.png",
  diamond: "/items/sword.png",
  vanilla: "/items/vanilla.png",
  crystal: "/items/crystal.png",
  nethpot: "/items/nethpot.png",
  nethop: "/items/nethpot.png",
  potion: "/items/potion.png",
  pot: "/items/potion.png",
  mace: "/items/mace.png",
  uhc: "/items/uhc.png",
  axe: "/items/axe.png",
  smp: "/items/smp.png",
  diasmp: "/items/smp.png",
  overall: "/items/overall.png",
};

export function KitIcon({
  kit,
  size = 24,
  className = "",
  style,
}: KitIconProps) {
  const raw = kit ? kit.toString() : "sword";
  const clean = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  const norm = normalizeGamemode(raw);
  const itemSrc = KIT_ITEM_MAP[clean] || KIT_ITEM_MAP[norm] || "/items/sword.png";

  return (
    <img
      src={itemSrc}
      alt={`${kit} Minecraft item`}
      width={size}
      height={size}
      style={{
        imageRendering: "pixelated",
        width: `${size}px`,
        height: `${size}px`,
        ...style,
      }}
      className={`shrink-0 inline-block object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${className}`}
    />
  );
}
