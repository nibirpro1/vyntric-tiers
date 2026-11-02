import React from "react";
import { getTitle } from "@/lib/tiers";
import { cn } from "@/lib/utils";

interface TitleBadgeProps {
  title?: string;
  points?: number;
  className?: string;
}

export function TitleBadge({ title, points, className = "" }: TitleBadgeProps) {
  const config = typeof points === "number" ? getTitle(points) : {
    name: title || "Unrated",
    color: "#64748B",
    badgeBg: "rgba(100, 116, 139, 0.1)",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded border tracking-wide uppercase transition-colors",
        className
      )}
      style={{
        color: config.color,
        backgroundColor: config.badgeBg,
        borderColor: `${config.color}33`,
      }}
    >
      <span
        className="w-1 h-1 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.name}
    </span>
  );
}
