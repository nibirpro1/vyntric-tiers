import React from "react";
import { cn } from "@/lib/utils";

export interface SectionTitleProps {
  eyebrow?: string;
  title: string | React.ReactNode;
  description?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  rightSlot,
  className = "",
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left",
        className
      )}
    >
      <div className="space-y-1.5 max-w-2xl">
        {eyebrow && <span className="micro-label block">{eyebrow}</span>}
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-text tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-muted text-sm leading-relaxed">{description}</p>
        )}
      </div>

      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}
