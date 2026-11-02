"use client";

import React, { useRef, useState } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface GlowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline" | "discord";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
  magnetic?: boolean;
  loading?: boolean;
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      asChild = false,
      magnetic = false,
      loading = false,
      disabled,
      children,
      onMouseMove,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (magnetic && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
        const y = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
        setOffset({ x, y });
      }
      onMouseMove?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (magnetic) {
        setOffset({ x: 0, y: 0 });
      }
      onMouseLeave?.(e);
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-xs tracking-wider gap-2",
      lg: "h-12 px-6 text-sm tracking-wide gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-brand-violet to-brand-cyan text-white shadow-lg shadow-brand-violet/25 hover:shadow-brand-cyan/25 hover:opacity-95 active:scale-[0.98] border border-white/20",
      ghost:
        "bg-transparent hover:bg-white/[0.06] text-text active:bg-white/[0.1] border border-transparent",
      outline:
        "bg-surface-2/60 hover:bg-surface-2 text-text border border-line hover:border-line-strong active:scale-[0.98]",
      discord:
        "bg-[#5865F2] hover:bg-[#4752C4] text-white shadow-lg shadow-[#5865F2]/25 active:scale-[0.98] border border-white/10",
    };

    const baseClasses = cn(
      "inline-flex items-center justify-center rounded-lg font-mono font-semibold uppercase transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden focus-visible:outline-2 focus-visible:outline-brand-violet focus-visible:outline-offset-2",
      sizeStyles[size],
      variantStyles[variant],
      className
    );

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={baseClasses}
          {...(props as any)}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        disabled={disabled || loading}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: magnetic ? `translate3d(${offset.x}px, ${offset.y}px, 0)` : undefined,
          transition: magnetic && offset.x === 0 ? "transform 0.3s ease-out" : undefined,
        }}
        className={baseClasses}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
        {children}
      </button>
    );
  }
);

GlowButton.displayName = "GlowButton";
