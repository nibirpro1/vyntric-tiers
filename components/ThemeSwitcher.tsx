"use client";

import React, { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ThemeId = "sapphire" | "obsidian" | "amethyst" | "emerald";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  dotColor: string;
  glowColor: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "sapphire",
    name: "Midnight Sapphire",
    dotColor: "#22D3EE",
    glowColor: "rgba(34, 211, 238, 0.4)",
    description: "Deep esports navy & electric cyan",
  },
  {
    id: "obsidian",
    name: "Cyber Obsidian",
    dotColor: "#F43F5E",
    glowColor: "rgba(244, 63, 94, 0.4)",
    description: "Dark carbon stealth & neon crimson",
  },
  {
    id: "amethyst",
    name: "Cosmic Amethyst",
    dotColor: "#A78BFA",
    glowColor: "rgba(167, 139, 250, 0.4)",
    description: "Deep cosmic void & royal purple",
  },
  {
    id: "emerald",
    name: "Emerald Matrix",
    dotColor: "#34D399",
    glowColor: "rgba(52, 211, 153, 0.4)",
    description: "Titanium slate & vibrant jade",
  },
];

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const [activeTheme, setActiveTheme] = useState<ThemeId>("sapphire");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vyntric_theme") as ThemeId | null;
      if (saved && THEMES.some((t) => t.id === saved)) {
        setActiveTheme(saved);
        if (saved === "sapphire") {
          document.documentElement.removeAttribute("data-theme");
        } else {
          document.documentElement.setAttribute("data-theme", saved);
        }
      }
    } catch {}
  }, []);

  const handleSelect = (themeId: ThemeId) => {
    setActiveTheme(themeId);
    setIsOpen(false);
    try {
      localStorage.setItem("vyntric_theme", themeId);
      if (themeId === "sapphire") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", themeId);
      }
    } catch {}
  };

  const currentTheme = THEMES.find((t) => t.id === activeTheme) || THEMES[0];

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-surface-2 hover:bg-surface border border-line text-muted hover:text-text text-xs font-mono transition-colors"
        title="Change Background Theme"
        aria-label="Change Background Theme"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-transform duration-200"
          style={{
            backgroundColor: currentTheme.dotColor,
            boxShadow: `0 0 8px ${currentTheme.glowColor}`,
          }}
        />
        <Palette className="w-3.5 h-3.5" />
        <span className="hidden sm:inline text-[11px] font-medium">{currentTheme.name.split(" ")[1]}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl glass p-2 border border-line shadow-2xl space-y-1 animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="px-2 py-1 pb-1.5 border-b border-line text-[10px] font-mono uppercase text-muted tracking-wider">
              Background Palette
            </div>
            {THEMES.map((theme) => {
              const isSelected = theme.id === activeTheme;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-mono transition-colors",
                    isSelected
                      ? "bg-surface-2 text-text font-semibold border border-line"
                      : "text-muted hover:text-text hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: theme.dotColor,
                        boxShadow: isSelected ? `0 0 8px ${theme.glowColor}` : "none",
                      }}
                    />
                    <div>
                      <div className="text-xs">{theme.name}</div>
                      <div className="text-[9.5px] text-muted">{theme.description}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-cyan shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
