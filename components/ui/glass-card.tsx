"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: "none" | "violet" | "cyan" | "hot";
  hoverEffect?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, glow = "none", hoverEffect = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl border border-line bg-surface/80 backdrop-blur-2xl p-6 shadow-xl transition-all duration-300",
          hoverEffect && "hover:border-line-strong hover:-translate-y-1 hover:shadow-2xl",
          glow === "violet" && "hover:shadow-[0_0_30px_rgba(124,58,237,0.2)] hover:border-brand-violet/40",
          glow === "cyan" && "hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:border-brand-cyan/40",
          glow === "hot" && "hover:shadow-[0_0_30px_rgba(244,63,94,0.2)] hover:border-brand-hot/40",
          className
        )}
        {...props}
      >
        {/* Subtle top specular highlight line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none rounded-t-2xl" />
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
