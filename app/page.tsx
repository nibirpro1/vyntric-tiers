"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Swords,
  ShieldCheck,
  Disc as DiscordIcon,
  ArrowRight,
  Info,
  Users,
  ExternalLink,
  Clock,
  Flame,
  Award,
  Zap,
} from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { PlayerProfileModal } from "@/components/PlayerProfileModal";
import { InfoModal } from "@/components/InfoModal";
import { PLAYERS, RECENT_TESTS, dataStore } from "@/lib/data";
import { GAMEMODES, TIER_COLORS, formatTestTimestamp, REGION_META } from "@/lib/tiers";
import { GamemodeIcon } from "@/components/icons/GamemodeIcons";
import { useUIStore } from "@/lib/store";

export default function Home() {
  const {
    selectedPlayer,
    setSelectedPlayer,
    selectedKit,
    infoModalOpen,
    setInfoModalOpen,
  } = useUIStore();
  const stats = dataStore.getStats();

  // Top 3 combatants for quick preview
  const topCombatants = PLAYERS.slice(0, 3);
  const featuredTests = RECENT_TESTS.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative space-y-12 pb-20 overflow-x-hidden"
    >
      {/* ========================================================= */}
      {/* 1. SYXLOR-STYLE CINEMATIC HERO WITH ANIMATION VIDEO & AUDIO*/}
      {/* ========================================================= */}
      <HeroSection />

      {/* ========================================================= */}
      {/* 2. STANDINGS LIVE STANDINGS STATUS STRIP                   */}
      {/* ========================================================= */}
      <section className="border-y border-line/40 bg-[#07080D]/80 backdrop-blur-md select-none py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5 text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-text">STANDINGS LIVE</span>
            <span className="text-line">•</span>
            <span>
              <strong className="text-text">{PLAYERS.length}</strong> Combatants
            </span>
            <span className="text-line hidden sm:inline">•</span>
            <span className="hidden sm:inline">
              <strong className="text-brand-cyan">{stats.totalTests || 1248}</strong> Tests Audited
            </span>
            <span className="text-line hidden md:inline">•</span>
            <span className="hidden md:inline">
              <strong className="text-amber-400">8</strong> Gamemode Disciplines
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInfoModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface border border-line text-muted hover:text-amber-400 transition-colors font-semibold"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Points Matrix</span>
            </button>

            <Link
              href="/rankings"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg btn-vyntric-primary text-xs font-bold"
            >
              <Trophy className="w-3 h-3 text-amber-300" />
              <span>Full Rankings Hub</span>
              <ArrowRight className="w-3 h-3 opacity-80" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. FEATURED GAMEMODES LADDERS (8 DISCIPLINES)            */}
      {/* ========================================================= */}
      <section id="explore" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-[11px] font-mono text-brand-cyan font-bold mb-1.5">
              <Swords className="w-3 h-3" />
              <span>COMPETITIVE LADDERS</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-text tracking-tight">
              Gamemode Disciplines
            </h2>
            <p className="text-xs font-mono text-muted mt-1 max-w-xl">
              Inspect tier standings across each specialized Minecraft PvP combat ladder.
            </p>
          </div>

          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-brand-cyan hover:text-white transition-colors group"
          >
            <span>View All Standings</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 8 Gamemodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
          {GAMEMODES.filter((g) => g.id !== "overall").map((gm) => (
            <Link
              key={gm.id}
              href={`/rankings?kit=${gm.id}`}
              className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-surface via-surface-2 to-[#090C14] border border-line hover:border-brand-cyan/50 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-[0_10px_25px_rgba(34,211,238,0.15)] flex flex-col justify-between select-none"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#090D18] border border-line group-hover:border-brand-cyan/40 flex items-center justify-center p-2.5 shadow-inner transition-transform group-hover:scale-105">
                  <GamemodeIcon id={gm.id} size={28} />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface border border-line text-muted group-hover:text-brand-cyan group-hover:border-brand-cyan/30 transition-colors">
                  Ladder
                </span>
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="font-heading font-black text-base text-text group-hover:text-brand-cyan transition-colors">
                  {gm.name}
                </h3>
                <p className="text-[11px] font-mono text-muted/80 line-clamp-1">
                  Official FT5 verified ladder
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] font-mono text-muted group-hover:text-text">
                <span>Inspect Tierlist</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. RECENT VERIFICATION AUDITS SHOWCASE                    */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FF2D55]/10 border border-[#FF2D55]/30 text-[11px] font-mono text-[#FF2D55] font-bold mb-1.5">
              <Clock className="w-3 h-3" />
              <span>LIVE AUDIT FEED</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-text tracking-tight">
              Recent Accredited Tier Tests
            </h2>
            <p className="text-xs font-mono text-muted mt-1 max-w-xl">
              Live automated duel recordings verified by accredited Vyntric staff testers.
            </p>
          </div>

          <Link
            href="/tests"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#FF2D55] hover:text-white transition-colors group"
          >
            <span>Full Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {featuredTests.map((test) => {
            const times = formatTestTimestamp(test.timestamp);
            const isPromo = test.result === "PROMOTED" || test.result === "promoted";

            return (
              <div
                key={test.id}
                className="p-4 rounded-2xl bg-surface-2/90 border border-line hover:border-line-strong transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={`https://mc-heads.net/head/${test.playerUsername || test.playerName}/64`}
                      alt={test.playerUsername || test.playerName}
                      className="w-9 h-9 rounded-xl border border-line shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-mono font-bold text-xs text-text block truncate">
                        {test.playerUsername || test.playerName}
                      </span>
                      <span className="text-[10px] font-mono text-muted block capitalize">
                        {test.kit} Duel
                      </span>
                    </div>
                  </div>

                  <span
                    className="font-mono font-black text-xs px-2 py-0.5 rounded-lg border shrink-0"
                    style={{
                      color: TIER_COLORS[test.newTier],
                      borderColor: `${TIER_COLORS[test.newTier]}40`,
                      backgroundColor: `${TIER_COLORS[test.newTier]}15`,
                    }}
                  >
                    {test.newTier}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface/80 border border-line/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-muted text-[11px]">Duel Score</span>
                  <span className="font-bold text-amber-400">{test.score}</span>
                </div>

                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[10px] font-mono text-muted">
                  <span>Tester: @{test.testerUsername || test.testerName}</span>
                  <span className="text-brand-cyan">{times.relative}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. GET TESTED & JOIN PIPELINE CTA BANNER                  */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-[#0C101B] via-surface to-[#0A0D15] border border-brand-cyan/30 shadow-2xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-cyan/20 blur-3xl pointer-events-none" />

          <div className="space-y-3 text-center lg:text-left max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-cyan/15 border border-brand-cyan/30 text-xs font-mono font-bold text-brand-cyan">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL TIER TESTING AUDITS</span>
            </div>
            <h3 className="font-heading font-black text-2xl sm:text-3xl text-text tracking-tight">
              Ready to Claim Your Official Vyntric Rank?
            </h3>
            <p className="text-xs sm:text-sm font-mono text-muted/90 leading-relaxed">
              Queue up on the official Discord, duel an accredited tier tester in a first-to-5 match, and have your verified rank recorded on the leaderboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 z-10 shrink-0 w-full sm:w-auto">
            <Link
              href="/rankings"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-surface-2 hover:bg-surface border border-line-strong hover:border-brand-cyan/40 text-white font-mono text-xs font-bold transition-all text-center"
            >
              Explore Rankings
            </Link>

            <a
              href="https://discord.gg/RESuGyFwJ3"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono text-xs font-bold shadow-lg shadow-[#5865F2]/25 transition-all flex items-center justify-center gap-2"
            >
              <DiscordIcon className="w-4 h-4" />
              <span>Join Discord Queue</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 ml-0.5" />
            </a>
          </div>
        </div>
      </section>

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
