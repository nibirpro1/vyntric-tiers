import React from "react";
import { Region } from "@/lib/types";
import { REGION_COLORS } from "@/lib/tiers";

interface RegionPillProps {
  region: Region;
  className?: string;
  showFullName?: boolean;
}

export function RegionPill({
  region,
  className = "",
  showFullName = false,
}: RegionPillProps) {
  const color = REGION_COLORS[region] || "#94A3B8";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[11px] font-semibold tracking-wider transition-colors ${className}`}
      style={{
        backgroundColor: `${color}1A`, // 10% opacity
        color: color,
        border: `1px solid ${color}33`, // 20% opacity
      }}
      title={`Region: ${region}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {region}
      {showFullName && (
        <span className="opacity-70 text-[10px] hidden sm:inline">
          {region === "EU"
            ? "Europe"
            : region === "NA"
            ? "North America"
            : region === "AS"
            ? "Asia"
            : region === "SA"
            ? "South America"
            : region === "AU"
            ? "Oceania"
            : "Middle East"}
        </span>
      )}
    </span>
  );
}
