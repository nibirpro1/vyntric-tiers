"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  LayoutGrid,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Twitter,
  Youtube,
  Disc as DiscordIcon,
  Sparkles,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { RoleBadge } from "@/components/ui/role-badge";
import { StatusDot } from "@/components/ui/status-dot";
import { KitIcon } from "@/components/icons/kit-icons";
import { CountUp } from "@/components/ui/count-up";
import { GlowButton } from "@/components/ui/glow-button";
import { MEMBERS, RECENT_TESTS } from "@/lib/data";
import { Member } from "@/lib/types";
import { cn } from "@/lib/utils";

// Lightweight 2D Gold Particle Aura Canvas (<= 80 particles, pauses offscreen)
function GoldAuraCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let isVisible = true;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const count = 50;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.8 - 0.3,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < 0) {
            p.y = canvas.height;
            p.x = Math.random() * canvas.width;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "#F59E0B";
          ctx.fill();
        });
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 rounded-2xl"
      aria-hidden="true"
    />
  );
}

// Individual Flippable Card
function MemberCard({
  member,
  isFlipped,
  onFlip,
}: {
  member: Member;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const bustUrl = `https://mc-heads.net/bust/${member.name}/120`;

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`${member.name}, ${member.role}. Press Enter or Space to flip card.`}
      onClick={onFlip}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFlip();
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-72 h-[380px] cursor-pointer select-none [perspective:1000px] outline-none focus-visible:ring-2 focus-visible:ring-brand-violet rounded-2xl shrink-0"
    >
      <div
        className={cn(
          "relative w-full h-full [transform-style:preserve-3d] rounded-2xl",
          isFlipped ? "transition-transform duration-500" : "transition-transform duration-75"
        )}
        style={{
          transform: !isFlipped
            ? `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`
            : "rotateY(180deg)",
        }}
      >
        {/* ================= CARD FRONT ================= */}
        <div className="absolute inset-0 card-solid p-6 flex flex-col justify-between [backface-visibility:hidden] rounded-2xl border-line hover:border-line-strong transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <RoleBadge role={member.role} />
              <StatusDot status={member.status} showLabel />
            </div>

            {/* Avatar Bust */}
            <div className="w-full h-36 flex items-center justify-center my-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-brand-violet/10 to-transparent pointer-events-none" />
              <Image
                src={bustUrl}
                alt={`${member.name}'s Minecraft skin bust`}
                width={100}
                height={100}
                className="object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-heading font-black text-xl text-text">
                {member.name}
              </h3>
              <span className="micro-label text-[10px] text-muted block">
                SPECIALIST IN {member.specialties.join(" · ")}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-line flex items-center justify-between">
            <div>
              <span className="micro-label text-[9px] block">TESTS CONDUCTED</span>
              <span className="font-mono text-base font-bold text-brand-cyan">
                <CountUp end={member.testsCompleted} />
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted flex items-center gap-1 group-hover:text-text">
              <RotateCw className="w-3 h-3" /> Flip Details
            </span>
          </div>
        </div>

        {/* ================= CARD BACK ================= */}
        <div className="absolute inset-0 card-solid p-6 flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border-brand-cyan/40 bg-surface-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <span className="font-mono text-xs font-bold text-brand-cyan">
                {member.name}
              </span>
              <span className="micro-label text-[10px] text-muted">DOSSIER</span>
            </div>

            <p className="text-xs text-muted leading-relaxed italic border-l-2 border-brand-cyan/40 pl-2.5">
              &ldquo;{member.quote}&rdquo;
            </p>

            <div className="space-y-1 pt-1">
              <span className="micro-label text-[9px] text-muted block">TESTING SPECIALTIES</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {member.specialties.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-line text-[11px] font-mono text-text"
                  >
                    <KitIcon kit={k} size={12} />
                    {k}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <span className="micro-label text-[9px] text-muted block">AFFILIATION</span>
              <span className="font-mono text-xs text-text">
                Member since {new Date(member.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-line">
            <Link
              href={`/apply?tester=${member.name}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center w-full py-2 rounded-lg bg-brand-violet hover:bg-brand-violet/90 text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Request Test with {member.name}
            </Link>

            <div className="flex items-center justify-center gap-3 pt-1">
              {member.socials?.discord && (
                <span className="text-muted hover:text-[#5865F2] text-xs font-mono" title={member.discord}>
                  @{member.discord}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Members() {
  const [viewMode, setViewMode] = useState<"deck" | "grid">("deck");
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);

  // Tester of the Month calculation
  const testerOfTheMonth = useMemo(() => {
    return MEMBERS.find((m) => m.isTesterOfTheMonth) || MEMBERS[4];
  }, []);

  const totmStats = useMemo(() => {
    const testerTests = RECENT_TESTS.filter(
      (t) => t.testerUsername === testerOfTheMonth.name
    );
    const promotions = testerTests.filter((t) => t.result === "promoted").length;
    return {
      monthlyTests: Math.max(testerTests.length, 14),
      promotionsAwarded: Math.max(promotions, 8),
      favoriteKit: testerOfTheMonth.specialties[0] || "Sword",
    };
  }, [testerOfTheMonth]);

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const nextDeck = () => {
    setActiveDeckIndex((prev) => Math.min(prev + 1, MEMBERS.length - 1));
  };

  const prevDeck = () => {
    setActiveDeckIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section id="team" className="w-full space-y-12 pt-4 pb-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionTitle
          eyebrow="ACCREDITED STAFF CORPS"
          title="Meet the Vyntric Team"
          description="Council testers are veteran PvP competitors selected through strict regional trial duels and audited by administration. We don't recruit off applications."
          rightSlot={
            <div className="inline-flex items-center p-1 rounded-xl bg-surface-2 border border-line">
              <button
                onClick={() => setViewMode("deck")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all",
                  viewMode === "deck"
                    ? "bg-surface text-brand-cyan shadow-sm border border-line"
                    : "text-muted hover:text-text"
                )}
                title="Deck View"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Deck</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all",
                  viewMode === "grid"
                    ? "bg-surface text-brand-cyan shadow-sm border border-line"
                    : "text-muted hover:text-text"
                )}
                title="Grid View (Accessible)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          }
        />

        {/* ========================================================= */}
        {/* TESTER OF THE MONTH SPOTLIGHT                             */}
        {/* ========================================================= */}
        <div className="card-solid p-6 sm:p-8 rounded-2xl border-amber-400/40 relative overflow-hidden bg-gradient-to-br from-surface to-amber-950/20">
          <GoldAuraCanvas />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 font-mono text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> TESTER OF THE MONTH
              </div>

              <div className="flex items-center gap-4">
                <Image
                  src={`https://mc-heads.net/bust/${testerOfTheMonth.name}/120`}
                  alt={testerOfTheMonth.name}
                  width={80}
                  height={80}
                  className="filter drop-shadow-[0_8px_16px_rgba(245,158,11,0.3)]"
                  unoptimized
                />
                <div>
                  <h3 className="font-heading font-black text-2xl text-text">
                    {testerOfTheMonth.name}
                  </h3>
                  <RoleBadge role={testerOfTheMonth.role} className="mt-1" />
                </div>
              </div>

              <p className="text-muted text-xs leading-relaxed italic border-l-2 border-amber-400/50 pl-3">
                &ldquo;{testerOfTheMonth.quote}&rdquo;
              </p>
            </div>

            <div className="md:col-span-5 grid grid-cols-3 gap-3 text-center sm:text-left">
              <div className="p-3.5 rounded-xl bg-surface-2 border border-line">
                <span className="micro-label text-[9px] block mb-1">TESTS CONDUCTED</span>
                <span className="font-mono text-xl font-black text-amber-300 tabular-nums">
                  <CountUp end={totmStats.monthlyTests} />
                </span>
                <span className="text-[10px] font-mono text-muted block mt-0.5">Audited</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-2 border border-line">
                <span className="micro-label text-[9px] block mb-1">PROMOTIONS</span>
                <span className="font-mono text-xl font-black text-emerald-400 tabular-nums">
                  <CountUp end={totmStats.promotionsAwarded} />
                </span>
                <span className="text-[10px] font-mono text-muted block mt-0.5">Verified</span>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-2 border border-line">
                <span className="micro-label text-[9px] block mb-1">PRIMARY KIT</span>
                <span className="font-mono text-sm font-bold text-text flex items-center gap-1 mt-1 justify-center sm:justify-start">
                  <KitIcon kit={totmStats.favoriteKit as any} size={14} />
                  {totmStats.favoriteKit}
                </span>
              </div>
            </div>

            <div className="md:col-span-3 flex justify-center md:justify-end">
              <GlowButton variant="primary" size="md" asChild>
                <Link href={`/apply?tester=${testerOfTheMonth.name}`}>
                  Challenge {testerOfTheMonth.name}
                </Link>
              </GlowButton>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE CARDS: DECK VIEW vs GRID VIEW                 */}
        {/* ========================================================= */}
        {viewMode === "deck" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="micro-label text-muted">
                DRAG OR USE ARROWS TO SCRUB · CLICK OR PRESS SPACE TO FLIP
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevDeck}
                  disabled={activeDeckIndex === 0}
                  className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface border border-line flex items-center justify-center text-muted hover:text-text disabled:opacity-40"
                  aria-label="Previous card"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextDeck}
                  disabled={activeDeckIndex === MEMBERS.length - 1}
                  className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface border border-line flex items-center justify-center text-muted hover:text-text disabled:opacity-40"
                  aria-label="Next card"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Drag Deck */}
            <motion.div
              drag="x"
              dragConstraints={{ left: -((MEMBERS.length - 1) * 220), right: 0 }}
              dragElastic={0.15}
              className="flex items-center gap-5 overflow-visible py-4 cursor-grab active:cursor-grabbing"
            >
              {MEMBERS.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isFlipped={!!flippedCards[member.id]}
                  onFlip={() => toggleFlip(member.id)}
                />
              ))}
            </motion.div>
          </div>
        ) : (
          /* Accessible Standard Responsive Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {MEMBERS.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isFlipped={!!flippedCards[member.id]}
                onFlip={() => toggleFlip(member.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
