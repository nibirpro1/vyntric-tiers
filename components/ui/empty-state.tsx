import React from "react";
import { cn } from "@/lib/utils";
import { GlowButton } from "./glow-button";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "No ranked players found",
  description = "Nobody matched your filter combination. Either clear your query or check a different region.",
  actionText,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "card-solid p-10 text-center flex flex-col items-center justify-center space-y-4 my-6",
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-line flex items-center justify-center text-muted font-mono text-base font-bold">
        0
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="font-heading font-bold text-lg text-text">{title}</h3>
        <p className="text-muted text-xs leading-relaxed">{description}</p>
      </div>

      {actionText && onAction && (
        <GlowButton variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </GlowButton>
      )}
    </div>
  );
}
