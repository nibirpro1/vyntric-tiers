"use client";

import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function BrandLogo({ size = 36, className = "", glow = true }: BrandLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Crimson Glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#FF2D55] via-[#E11D48] to-[#7C3AED] blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300"
          style={{ transform: "scale(1.15)" }}
        />
      )}

      {/* Official Vyntric Tiers Logo Image */}
      <div
        className="relative z-10 w-full h-full rounded-xl overflow-hidden border border-[#FF2D55]/40 bg-[#07080D] shadow-lg shadow-[#FF2D55]/20 flex items-center justify-center p-0.5"
      >
        <img
          src="/logo.png"
          alt="Vyntric Tiers Official Logo"
          className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,45,85,0.6)]"
        />
      </div>
    </div>
  );
}
