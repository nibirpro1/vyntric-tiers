"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUIStore } from "@/lib/store";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const { commandOpen, selectedPlayer, mobileMenuOpen, infoModalOpen, reducedMotion } =
    useUIStore();

  useEffect(() => {
    // Check touch device or reduced motion
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      (reducedMotion ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (isTouch || prefersReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      prevent: (node) => {
        if (!node) return false;
        // Don't hijack scroll if target or any parent has data-lenis-prevent or is inside a modal/dialog
        return Boolean(
          node.closest?.("[data-lenis-prevent]") ||
          node.closest?.("[role='dialog']") ||
          node.closest?.(".modal-scroll")
        );
      },
    });

    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCb = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // Pause Lenis and lock body scrolling while any modal or full-screen menu is open
  useEffect(() => {
    const isModalOpen = Boolean(commandOpen || selectedPlayer || mobileMenuOpen || infoModalOpen);
    if (typeof document !== "undefined") {
      if (isModalOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }

    if (lenisRef.current) {
      if (isModalOpen) {
        lenisRef.current.stop();
      } else {
        lenisRef.current.start();
      }
    }

    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [commandOpen, selectedPlayer, mobileMenuOpen, infoModalOpen]);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}
