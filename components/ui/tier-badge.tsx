import React from "react";
import { Tier } from "@/lib/tiers";
import { TIER_COLORS, isHighTier } from "@/lib/tiers";
import { cn } from "@/lib/utils";

export interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
  showPeak?: boolean;
  className?: string;
}

export function TierBadge({
  tier,
  size = "md",
  showPeak = false,
  className = "",
}: TierBadgeProps) {
  const isUnranked = tier === "Unranked";
  const color = TIER_COLORS[tier] || TIER_COLORS.Unranked;
  const isHigh = isHighTier(tier);

  const sizeStyles = {
    sm: "text-[10px] py-0.5 px-2 gap-1",
    md: "text-xs py-1 px-2.5 gap-1.5",
    lg: "text-sm py-1.5 px-3.5 gap-2",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "relative inline-flex items-center font-mono font-bold tracking-wider rounded-md border select-none transition-all duration-150",
          sizeStyles[size],
          isUnranked ? "bg-surface-2 text-muted border-line" : ""
        )}
        style={
          !isUnranked
            ? {
                backgroundColor: `${color}18`,
                color: color,
                borderColor: `${color}40`,
                boxShadow: `0 0 12px ${color}15`,
              }
            : undefined
        }
      >
        {/* Tier directional chevron */}
        {!isUnranked && (
          <span
            className="text-[9px] leading-none shrink-0"
            aria-hidden="true"
            style={{ color: color }}
          >
            {isHigh ? "▲" : "▼"}
          </span>
        )}
        <span>{tier}</span>
      </span>

      {showPeak && (
        <span
          className="micro-label text-[9px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-muted font-normal"
          title="Peak Career Tier"
        >
          PEAK
        </span>
      )}
    </div>
  );
}
