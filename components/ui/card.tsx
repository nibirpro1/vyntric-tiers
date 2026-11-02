import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Standard solid surface card with 1px border and faint top-edge highlight
 */
export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("card-solid p-6", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Glassmorphism card for designated chrome (navbar, command palette, player modal, mobile menu)
 */
export function GlassCard({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("glass rounded-2xl p-6", className)} {...props}>
      {children}
    </div>
  );
}
