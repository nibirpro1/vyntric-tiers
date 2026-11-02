"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Trophy,
  Swords,
  Sparkles,
  Clock,
  ShieldCheck,
  Disc as DiscordIcon,
  ArrowRight,
  ExternalLink,
  Info,
} from "lucide-react";
import { RankingsHub } from "@/components/sections/RankingsHub";
import { PlayerProfileModal } from "@/components/PlayerProfileModal";
import { InfoModal } from "@/components/InfoModal";
import { PLAYERS, dataStore } from "@/lib/data";
import { useUIStore } from "@/lib/store";

export default function RankingsPage() {
  const {
    selectedPlayer,
    setSelectedPlayer,
    selectedKit,
    infoModalOpen,
    setInfoModalOpen,
  } = useUIStore();
  const stats = dataStore.getStats();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative space-y-6 pb-20 overflow-x-hidden min-h-screen"
    >
      {/* Top Header Banner for Dedicated Rankings Page */}
      <section className="pt-6 pb-4 border-b border-line/40 bg-[#07090E]/80 backdrop-blur-md select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-[11px] font-mono text-brand-cyan font-bold mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                <span>OFFICIAL COMPETITIVE TIERS</span>
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-text tracking-tight flex items-center gap-2.5">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span>Vyntric Combat Rankings & Tier Standings</span>
              </h1>
              <p className="text-xs font-mono text-muted mt-1 max-w-2xl">
                Official leaderboard scores, accredited duel audit history, and tier brackets across 8 competitive disciplines.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setInfoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface border border-line text-xs font-mono text-muted hover:text-amber-400 transition-colors font-semibold shadow-sm"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>Points Matrix</span>
              </button>

              <Link
                href="/queue"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-vyntric-primary text-xs font-mono font-bold shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Tested</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Rankings Hub */}
      <main id="rankings" className="relative z-10">
        <React.Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-mono text-muted">
                <span className="w-3 h-3 rounded-full bg-[#FF2D55] animate-ping" />
                <span>Loading Vyntric Rankings Hub...</span>
              </div>
            </div>
          }
        >
          <RankingsHub
            players={PLAYERS}
            onSelectPlayer={(player, kit) => setSelectedPlayer(player, kit)}
            onOpenInfo={() => setInfoModalOpen(true)}
          />
        </React.Suspense>
      </main>

      {/* Player Profile Modal */}
      <PlayerProfileModal
        player={selectedPlayer}
        initialKit={selectedKit}
        onClose={() => setSelectedPlayer(null)}
      />

      {/* Info Modal */}
      <InfoModal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)} />
    </motion.div>
  );
}
