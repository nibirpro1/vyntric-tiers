"use client";

import React, { useEffect, useState } from "react";
import { useUIStore } from "@/lib/store";
import { BrandLogo } from "./icons/BrandLogo";

export function Preloader() {
  const { preloaderDone, setPreloaderDone, reducedMotion } = useUIStore();
  const [percent, setPercent] = useState<number>(10);
  const [curtainOpen, setCurtainOpen] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    if (reducedMotion) {
      setPreloaderDone(true);
      return;
    }

    // Lock body scroll while intro animation runs
    document.body.style.overflow = "hidden";

    // Fast, punchy esports progress counter (~650ms total)
    let progress = 15;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 22) + 16;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setPercent(100);

        setTimeout(() => {
          setCurtainOpen(true);
          setTimeout(() => {
            setPreloaderDone(true);
            document.body.style.overflow = "";
          }, 500);
        }, 150);
      }
      setPercent(Math.min(progress, 100));
    }, 60);

    // Escape key or click skips immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearInterval(interval);
        setPercent(100);
        setCurtainOpen(true);
        setTimeout(() => {
          setPreloaderDone(true);
          document.body.style.overflow = "";
        }, 200);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [reducedMotion, setPreloaderDone]);

  const dismiss = () => {
    setCurtainOpen(true);
    setTimeout(() => {
      setPreloaderDone(true);
      document.body.style.overflow = "";
    }, 350);
  };

  if (!mounted || preloaderDone) return null;

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[10000] cursor-pointer select-none"
      aria-label="Loading Vyntric Tiers platform (click or press Esc to skip)"
    >
      {/* Top Curtain Panel */}
      <div
        className={`absolute top-0 left-0 right-0 h-1/2 bg-[#05060A] border-b border-line transition-transform duration-700 [transition-timing-function:cubic-bezier(0.77,0,0.175,1)] ${
          curtainOpen ? "-translate-y-full" : "translate-y-0"
        }`}
      />

      {/* Bottom Curtain Panel */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1/2 bg-[#05060A] border-t border-line transition-transform duration-700 [transition-timing-function:cubic-bezier(0.77,0,0.175,1)] ${
          curtainOpen ? "translate-y-full" : "translate-y-0"
        }`}
      />

      {/* Center Preloader Content */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${
          curtainOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <BrandLogo size={64} />
          </div>

          <div className="text-center space-y-2">
            <h1 className="font-heading font-extrabold text-3xl tracking-tight text-text flex items-center justify-center gap-1 select-none">
              {"VYNTRIC".split("").map((letter, i) => (
                <span
                  key={i}
                  className="inline-block transition-all duration-500 will-change-transform"
                  style={{
                    opacity: percent > (i * 12) ? 1 : 0.2,
                    transform: percent > (i * 12) ? "translateY(0) scale(1)" : "translateY(10px) scale(0.9)",
                    filter: percent > (i * 12) ? "blur(0px)" : "blur(4px)",
                    transitionDelay: `${i * 40}ms`,
                  }}
                >
                  {letter}
                </span>
              ))}
              <span className="text-brand-cyan ml-2 bg-brand-cyan/10 border border-brand-cyan/30 px-2 py-0.5 rounded text-sm tracking-widest">
                TIERS
              </span>
            </h1>
            <p className="micro-label text-muted tracking-widest text-[10px]">
              VERIFYING TEST LADDERS · {percent}%
            </p>
          </div>

          {/* Minimal 1px Progress Bar */}
          <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-violet transition-all duration-150 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          <span className="text-[10px] font-mono text-muted/60 tracking-wider uppercase">
            Press ESC or Click to Skip
          </span>
        </div>
      </div>
    </div>
  );
}
