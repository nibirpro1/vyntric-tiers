"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Shield, Sparkles, Disc as DiscordIcon, ExternalLink, ArrowRight } from "lucide-react";
import { TIER_ORDER, TIER_COLORS, TIER_POINTS } from "@/lib/tiers";
import { BrandLogo } from "./icons/BrandLogo";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const modalScrollRef = useRef<HTMLDivElement | null>(null);

  // Lock background body scroll completely while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none"
        data-lenis-prevent="true"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          ref={modalScrollRef}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto overscroll-contain card-solid border border-[#FF2D55]/30 bg-[#0A0D15] rounded-3xl shadow-[0_0_60px_rgba(255,45,85,0.2)] p-5 sm:p-8 space-y-6 text-text"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <BrandLogo size={42} glow={false} />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FF2D55]/15 border border-[#FF2D55]/30 text-[#FF2D55] text-[11px] font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>OFFICIAL SCORING GUIDE</span>
                </div>
                <h2 className="font-heading font-black text-xl sm:text-2xl text-text mt-0.5">
                  Vyntric Tiers & Points Formula
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-surface-2 hover:bg-surface border border-line text-muted hover:text-text transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: Points per Tier */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-base text-text flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Points Matrix per Kit Tier</span>
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Every verified tier earns fixed leaderboard points. A player&apos;s total points is the direct sum of their active tiers across all 9 gamemode ladders.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-xs">
              {TIER_ORDER.filter((t) => t !== "Unranked").map((tier) => {
                const color = TIER_COLORS[tier];
                const pts = TIER_POINTS[tier];
                return (
                  <div
                    key={tier}
                    className="p-2.5 rounded-xl bg-surface-2 border border-line flex flex-col items-center justify-center text-center transition-transform hover:scale-105"
                    style={{ borderColor: `${color}40`, boxShadow: `0 0 10px ${color}15` }}
                  >
                    <span className="font-black text-sm" style={{ color }}>
                      {tier}
                    </span>
                    <span className="text-muted text-[11px] mt-0.5 font-bold">
                      +{pts} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Combat Titles */}
          <div className="space-y-3 border-t border-line pt-5">
            <h3 className="font-heading font-bold text-base text-text flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-cyan" />
              <span>Combat Titles by Total Points</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-surface-2/80 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300">
                    👑 Combat Grandmaster
                  </span>
                  <p className="text-[11px] text-muted">Tier 1 mastery across multiple gamemodes</p>
                </div>
                <span className="font-mono font-bold text-amber-400">250+ pts</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-2/80 border border-line flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-400">⚔️ Combat Master</span>
                  <p className="text-[11px] text-muted">Dominant High Tier combatant</p>
                </div>
                <span className="font-mono font-bold text-amber-400">180–249 pts</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-2/80 border border-line flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-400">🔥 Combat Ace</span>
                  <p className="text-[11px] text-muted">High Tier competitor with proven consistency</p>
                </div>
                <span className="font-mono font-bold text-rose-400">110–179 pts</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-2/80 border border-line flex items-center justify-between">
                <div>
                  <span className="font-bold text-violet-400">⚡ Combat Specialist</span>
                  <p className="text-[11px] text-muted">Established placements across key ladders</p>
                </div>
                <span className="font-mono font-bold text-violet-400">60–109 pts</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-2/80 border border-line flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-400">🛡️ Combat Cadet</span>
                  <p className="text-[11px] text-muted">Verified placement in at least one ladder</p>
                </div>
                <span className="font-mono font-bold text-emerald-400">30–59 pts</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-2/80 border border-line flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-400">🗡️ Combat Novice</span>
                  <p className="text-[11px] text-muted">Initial placement in competitive duels</p>
                </div>
                <span className="font-mono font-bold text-slate-400">1–29 pts</span>
              </div>
            </div>
          </div>

          {/* Section 3: Official Verification Rules */}
          <div className="space-y-2 border-t border-line pt-5 text-xs text-muted leading-relaxed">
            <h4 className="font-heading font-semibold text-text">Testing Standards:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>All tests are conducted as First-to-5 (FT5) duels on verified server nodes.</li>
              <li>Only official Vyntric Council Testers are authorized to ratify tier tests.</li>
              <li>Clients permitted: Lunar Client, Badlion, Feather, Vanilla, Fabric with approved PvP mods.</li>
              <li>Cooldowns: 14 days on promotion, 7 days on retention, 3 days on demotion.</li>
            </ul>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              href="/rules"
              onClick={onClose}
              className="text-xs font-mono text-[#FF2D55] hover:underline flex items-center gap-1 font-bold"
            >
              <span>View Full Rules Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="https://discord.gg/RESuGyFwJ3"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-vyntric-discord inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold w-full sm:w-auto justify-center"
            >
              <DiscordIcon className="w-4 h-4 fill-current" />
              <span>Join Vyntric Discord</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
