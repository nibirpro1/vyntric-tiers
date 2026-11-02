import React from "react";

interface CrystalLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export function CrystalLogo({
  size = 28,
  className = "",
  showText = false,
}: CrystalLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="facetPrimary" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C3AED" />
            <stop offset="1" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="facetLeft" x1="6" y1="8" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A78BFA" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
          <linearGradient id="facetRight" x1="42" y1="8" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67E8F9" />
            <stop offset="1" stopColor="#0891B2" />
          </linearGradient>
          <linearGradient id="facetCenter" x1="24" y1="18" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="1" stopColor="#22D3EE" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Faceted 'V' crystal geometry */}
        {/* Outer Left wing */}
        <path
          d="M6 10L18 8L24 44L13 26L6 10Z"
          fill="url(#facetLeft)"
          fillOpacity="0.95"
        />
        {/* Outer Right wing */}
        <path
          d="M42 10L30 8L24 44L35 26L42 10Z"
          fill="url(#facetRight)"
          fillOpacity="0.95"
        />
        {/* Top chevron inner facets */}
        <path
          d="M18 8L24 20L30 8L24 14L18 8Z"
          fill="#DDD6FE"
          fillOpacity="0.8"
        />
        {/* Central spine facet */}
        <path
          d="M24 20L18 24L24 44L30 24L24 20Z"
          fill="url(#facetCenter)"
        />
        {/* Sharp inner cut lines for jewel/crystal refraction */}
        <path
          d="M18 8L24 44M30 8L24 44M13 26L24 20M35 26L24 20"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Edge highlight reflection */}
        <path
          d="M6 10L18 8L24 20"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <span className="font-heading font-extrabold tracking-tight text-text flex items-center text-lg">
          VYNTRIC<span className="text-brand-cyan ml-1 font-semibold text-xs tracking-widest bg-brand-cyan/10 border border-brand-cyan/30 px-1.5 py-0.5 rounded">TIERS</span>
        </span>
      )}
    </div>
  );
}
