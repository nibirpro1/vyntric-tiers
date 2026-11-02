"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowDown, ChevronRight, ShieldCheck } from "lucide-react";
import { gsap } from "gsap";
import { GlowButton } from "@/components/ui/glow-button";
import { CountUp } from "@/components/ui/count-up";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { StatusDot } from "@/components/ui/status-dot";
import { useCanUse3D } from "@/providers/ThreeProvider";
import { Player, Member } from "@/lib/types";

// Dynamic R3F Canvas
const DynamicHeroScene = dynamic(
  () => import("@/components/three/HeroScene").then((m) => m.HeroScene),
  { ssr: false }
);

interface HeroProps {
  topPlayers: Player[];
  members: Member[];
  stats: {
    totalPlayers: number;
    totalTests: number;
    activeTesters: number;
    regionsCount: number;
  };
}

export function Hero({ topPlayers, members, stats }: HeroProps) {
  const canUse3D = useCanUse3D();
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // GSAP glitch-reveal animation on hero title
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !titleRef.current) return;

    const letters = titleRef.current.querySelectorAll(".hero-letter");
    gsap.fromTo(
      letters,
      {
        opacity: 0,
        y: 24,
        skewX: -15,
        filter: "blur(8px)",
      },
      {
        opacity: 1,
        y: 0,
        skewX: 0,
        filter: "blur(0px)",
        stagger: 0.035,
        duration: 0.7,
        ease: "power3.out",
      }
    );
  }, []);

  const onlineTesters = members
    .filter((m) => m.status === "Online" && (m.role.includes("Tester") || m.role === "Admin" || m.role === "Owner"))
    .slice(0, 4);

  return (
    <section className="relative w-full min-h-[92vh] flex items-center justify-between overflow-hidden pt-8 pb-16">
      {/* Background 3D Scene / CSS Fallback */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none md:pointer-events-auto">
        {mounted && canUse3D ? (
          <div className="absolute right-0 top-0 w-full lg:w-[65%] h-full opacity-90">
            <DynamicHeroScene topPlayers={topPlayers.slice(0, 3)} />
          </div>
        ) : (
          /* High-performance CSS podium silhouette fallback */
          <div className="absolute right-0 top-0 w-full lg:w-[55%] h-full flex items-end justify-center pb-16 pointer-events-none opacity-40 lg:opacity-75">
            <div className="flex items-end justify-center gap-4 w-full max-w-md h-72">
              {/* #2 Left */}
              <div className="w-24 h-40 rounded-t-xl bg-gradient-to-t from-surface-2 to-amber-500/20 border-t-2 border-amber-400 flex flex-col items-center justify-between p-2">
                <span className="font-mono text-xs font-bold text-amber-400">#2</span>
                <span className="font-mono text-[11px] text-muted truncate max-w-full">
                  {topPlayers[1]?.username || "Top 2"}
                </span>
              </div>
              {/* #1 Center */}
              <div className="w-28 h-56 rounded-t-xl bg-gradient-to-t from-surface-2 to-brand-hot/20 border-t-2 border-brand-hot flex flex-col items-center justify-between p-2 shadow-2xl shadow-brand-hot/20">
                <span className="font-mono text-sm font-black text-brand-hot">#1</span>
                <span className="font-mono text-xs font-bold text-text truncate max-w-full">
                  {topPlayers[0]?.username || "Top 1"}
                </span>
              </div>
              {/* #3 Right */}
              <div className="w-24 h-32 rounded-t-xl bg-gradient-to-t from-surface-2 to-brand-cyan/20 border-t-2 border-brand-cyan flex flex-col items-center justify-between p-2">
                <span className="font-mono text-xs font-bold text-brand-cyan">#3</span>
                <span className="font-mono text-[11px] text-muted truncate max-w-full">
                  {topPlayers[2]?.username || "Top 3"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Seamless bottom gradient fade handing off to next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg via-bg/80 to-transparent pointer-events-none" />
      </div>

      {/* Foreground Left-Aligned UI Overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="max-w-2xl space-y-6 text-left">
          {/* Eyebrow Micro-Label */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-line text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
            <span className="text-muted tracking-wider uppercase font-semibold">
              LIVE AUDIT · {stats.totalTests.toLocaleString()} TESTS LOGGED
            </span>
          </div>

          {/* Glitch-reveal Split Title */}
          <h1
            ref={titleRef}
            className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl text-text tracking-tight leading-[1.04]"
          >
            <span className="inline-block select-text">
              {"VYNTRIC".split("").map((letter, idx) => (
                <span key={idx} className="hero-letter inline-block">
                  {letter}
                </span>
              ))}
            </span>{" "}
            <span className="inline-block bg-gradient-to-r from-brand-violet to-brand-cyan bg-clip-text text-transparent select-text">
              {"TIERS".split("").map((letter, idx) => (
                <span key={idx} className="hero-letter inline-block">
                  {letter}
                </span>
              ))}
            </span>
          </h1>

          {/* Subtext: short, specific, authentic gaming voice */}
          <p className="text-muted text-sm sm:text-base leading-relaxed max-w-xl">
            Ranked. Tested. Verified. The standard tier list for competitive Minecraft PvP.
            1v1 first-to-5 duels audited by council testers — no excuses, no rematches.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <GlowButton variant="primary" size="md" asChild magnetic>
              <Link href="/apply">
                Get Tested <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </GlowButton>
            <GlowButton variant="ghost" size="md" asChild>
              <Link href="/tierlist">Browse Tier Lists</Link>
            </GlowButton>
          </div>

          {/* Live Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-line/70">
            <div>
              <span className="micro-label block mb-1">PLAYERS RANKED</span>
              <div className="text-xl sm:text-2xl text-text">
                <CountUp end={stats.totalPlayers} />
              </div>
            </div>
            <div>
              <span className="micro-label block mb-1">TESTS LOGGED</span>
              <div className="text-xl sm:text-2xl text-brand-cyan">
                <CountUp end={stats.totalTests} />
              </div>
            </div>
            <div>
              <span className="micro-label block mb-1">COUNCIL TESTERS</span>
              <div className="text-xl sm:text-2xl text-brand-violet">
                <CountUp end={stats.activeTesters} />
              </div>
            </div>
            <div>
              <span className="micro-label block mb-1">REGIONS ACTIVE</span>
              <div className="text-xl sm:text-2xl text-text">
                <CountUp end={stats.regionsCount} />
              </div>
            </div>
          </div>

          {/* Online Council Testers Row */}
          {onlineTesters.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <span className="micro-label text-[10px] text-muted">ONLINE TESTERS:</span>
              <div className="flex items-center -space-x-1.5">
                {onlineTesters.map((t) => (
                  <div key={t.id} className="relative group" title={`${t.name} (${t.role}) — Online`}>
                    <PlayerAvatar username={t.name} size={24} className="border-2 border-bg" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-bg" />
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-mono text-muted/80">
                Ready on node queue
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Down Hint at Bottom */}
      <a
        href="#kits"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 text-muted hover:text-text transition-colors select-none z-20"
        aria-label="Scroll to gamemode ladders"
      >
        <span className="micro-label text-[9px] tracking-widest">SCROLL</span>
        <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
      </a>
    </section>
  );
}
