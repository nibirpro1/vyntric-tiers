"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Tier, TIER_COLORS } from "@/lib/tiers";
import { cn } from "@/lib/utils";

export interface PlayerAvatarProps {
  username: string;
  size?: number;
  tierRing?: Tier;
  mode?: "head" | "body";
  className?: string;
}

/**
 * Deterministic pixel-face SVG fallback (8x8)
 */
function PixelFaceSvg({ username, size }: { username: string; size: number }) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }

  const hue = Math.abs(hash) % 360;
  const baseColor = `hsl(${hue}, 60%, 45%)`;
  const skinColor = `hsl(${hue}, 40%, 65%)`;
  const eyeColor = "#FFFFFF";
  const pupilColor = `hsl(${(hue + 180) % 360}, 70%, 50%)`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 8"
      className="bg-surface-2"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    >
      <rect width="8" height="8" fill={skinColor} />
      <rect x="0" y="0" width="8" height="2" fill={baseColor} />
      <rect x="0" y="2" width="1" height="2" fill={baseColor} />
      <rect x="7" y="2" width="1" height="2" fill={baseColor} />
      <rect x="1" y="3" width="2" height="1" fill={eyeColor} />
      <rect x="5" y="3" width="2" height="1" fill={eyeColor} />
      <rect x="2" y="3" width="1" height="1" fill={pupilColor} />
      <rect x="5" y="3" width="1" height="1" fill={pupilColor} />
      <rect x="3" y="6" width="2" height="1" fill={baseColor} opacity="0.6" />
    </svg>
  );
}

export function PlayerAvatar({
  username,
  size = 32,
  tierRing,
  mode = "head",
  className = "",
}: PlayerAvatarProps) {
  const [attempt, setAttempt] = useState<number>(0);
  const cleanUsername = username.trim() || "Steve";

  const ringColor = tierRing ? TIER_COLORS[tierRing] : undefined;

  // Tiered fallback sequence:
  // attempt 0: mc-heads.net
  // attempt 1: minotar.net
  // attempt 2: pixel-face SVG
  const primaryUrl =
    mode === "body"
      ? `https://mc-heads.net/body/${cleanUsername}/200`
      : `https://mc-heads.net/head/${cleanUsername}/100`;

  const fallbackUrl =
    mode === "body"
      ? `https://minotar.net/armor/body/${cleanUsername}/200.png`
      : `https://minotar.net/helm/${cleanUsername}/100.png`;

  if (attempt >= 2) {
    return (
      <div
        className={cn(
          "relative overflow-hidden shrink-0 flex items-center justify-center bg-surface-2",
          mode === "body" ? "rounded-lg" : "rounded-full",
          className
        )}
        style={{
          width: size,
          height: mode === "body" ? size * 2 : size,
          border: ringColor ? `2px solid ${ringColor}` : "1px solid var(--line)",
          boxShadow: ringColor ? `0 0 10px ${ringColor}33` : undefined,
        }}
      >
        <PixelFaceSvg username={cleanUsername} size={size} />
      </div>
    );
  }

  const currentSrc = attempt === 0 ? primaryUrl : fallbackUrl;

  return (
    <div
      className={cn(
        "relative overflow-hidden shrink-0 bg-surface-2 select-none",
        mode === "body" ? "rounded-lg" : "rounded-full",
        className
      )}
      style={{
        width: size,
        height: mode === "body" ? size * 2 : size,
        border: ringColor ? `2px solid ${ringColor}` : "1px solid var(--line)",
        boxShadow: ringColor ? `0 0 10px ${ringColor}33` : undefined,
      }}
    >
      <Image
        src={currentSrc}
        alt={`${cleanUsername}'s avatar`}
        width={size}
        height={mode === "body" ? size * 2 : size}
        loading="lazy"
        className="object-cover w-full h-full"
        style={{ imageRendering: "pixelated" }}
        unoptimized
        onError={() => setAttempt((prev) => prev + 1)}
      />
    </div>
  );
}
