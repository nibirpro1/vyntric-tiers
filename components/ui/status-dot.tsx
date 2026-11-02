import React from "react";
import { MemberStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: MemberStatus;
  showLabel?: boolean;
  className?: string;
}

export function StatusDot({
  status,
  showLabel = false,
  className = "",
}: StatusDotProps) {
  const isOnline = status === "Online";
  const isIdle = status === "Idle";

  const colorClass = isOnline
    ? "bg-emerald-400"
    : isIdle
    ? "bg-amber-400"
    : "bg-slate-500";

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`Status: ${status}`}
    >
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            colorClass
          )}
        />
      </span>
      {showLabel && (
        <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
          {status}
        </span>
      )}
    </span>
  );
}
