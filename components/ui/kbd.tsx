import React from "react";
import { cn } from "@/lib/utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center font-mono text-[10px] font-semibold text-muted bg-surface-2 border border-line px-1.5 py-0.5 rounded shadow-sm select-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
