"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Filter,
  Flame,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Shield,
  Swords,
} from "lucide-react";
import { TestRecord, Player, GamemodeId } from "@/lib/types";
import { RECENT_TESTS, PLAYERS } from "@/lib/data";
import { useUIStore } from "@/lib/store";
import {
  formatTestTimestamp,
  TIER_COLORS,
  GAMEMODES,
} from "@/lib/tiers";
import { GamemodeIcon } from "../icons/GamemodeIcons";

interface RecentTestsSectionProps {
  tests?: TestRecord[];
  players?: Player[];
  onSelectPlayer?: (player: Player) => void;
}

export function RecentTestsSection({
  tests = RECENT_TESTS,
  players = PLAYERS,
  onSelectPlayer: propOnSelectPlayer,
}: RecentTestsSectionProps = {}) {
  const { setSelectedPlayer } = useUIStore();
  const onSelectPlayer = propOnSelectPlayer || setSelectedPlayer;
  const [filterType, setFilterType] = useState<"ALL" | "PROMOTIONS" | "NEW" | "DEMOTIONS">("ALL");
  const [selectedKit, setSelectedKit] = useState<string>("ALL");

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      // Type filter
      if (filterType === "PROMOTIONS") {
        if (test.result !== "PROMOTED" && test.result !== "promoted") return false;
      } else if (filterType === "NEW") {
        if (test.result !== "NEW" && test.result !== "new") return false;
      } else if (filterType === "DEMOTIONS") {
        if (test.result !== "DEMOTED" && test.result !== "demoted") return false;
      }

      // Kit filter
      if (selectedKit !== "ALL") {
        if (test.kit.toLowerCase() !== selectedKit.toLowerCase()) return false;
      }

      return true;
    });
  }, [tests, filterType, selectedKit]);

  return (
    <section id="recent-tests" className="w-full space-y-6 pt-10 pb-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-line">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/15 border border-brand-violet/30 text-brand-cyan text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-brand-cyan" />
              <span>LIVE AUDIT TRAIL</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-text tracking-tight">
              Recent Verified Tier Tests
            </h2>
            <p className="text-muted text-xs sm:text-sm max-w-xl">
              Real-time audit log of First-to-5 official duel tests conducted by the Vyntric Council.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-2 border border-line">
              <motion.button
                onClick={() => setFilterType("ALL")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === "ALL"
                    ? "bg-text text-[#07090E] shadow-sm font-black"
                    : "text-muted hover:text-text"
                }`}
              >
                All Tests
              </motion.button>
              <motion.button
                onClick={() => setFilterType("PROMOTIONS")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === "PROMOTIONS"
                    ? "bg-emerald-500 text-black font-black"
                    : "text-muted hover:text-emerald-400"
                }`}
              >
                Promotions ▲
              </motion.button>
              <motion.button
                onClick={() => setFilterType("NEW")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === "NEW"
                    ? "bg-cyan-500 text-black font-black"
                    : "text-muted hover:text-brand-cyan"
                }`}
              >
                Placements ★
              </motion.button>
              <motion.button
                onClick={() => setFilterType("DEMOTIONS")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterType === "DEMOTIONS"
                    ? "bg-rose-500 text-black font-black"
                    : "text-muted hover:text-rose-400"
                }`}
              >
                Demotions ▼
              </motion.button>
            </div>

            {/* Gamemode Dropdown */}
            <select
              value={selectedKit}
              onChange={(e) => setSelectedKit(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-2 border border-line text-xs font-mono text-text focus:outline-none focus:border-brand-violet"
            >
              <option value="ALL">All Gamemodes</option>
              {GAMEMODES.filter((g) => g.id !== "overall").map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tests List Rows */}
        {filteredTests.length === 0 ? (
          <div className="card-solid p-10 text-center text-muted font-mono text-xs border-line">
            No recent tests match the active filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTests.map((test) => {
              const times = formatTestTimestamp(test.timestamp);
              const isPromo = test.result === "PROMOTED" || test.result === "promoted";
              const isDemo = test.result === "DEMOTED" || test.result === "demoted";
              const isNew = test.result === "NEW" || test.result === "new";
              const tierColor = TIER_COLORS[test.newTier];

              const matchedPlayer = players.find(
                (p) => p.username.toLowerCase() === test.playerUsername.toLowerCase()
              );

              return (
                <motion.div
                  key={test.id}
                  whileHover={{ scale: 1.015, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (matchedPlayer) onSelectPlayer(matchedPlayer);
                  }}
                  className="card-solid p-3.5 sm:p-4 rounded-2xl border border-line hover:border-brand-cyan/50 bg-[#0C0F17]/90 hover:bg-[#111624] transition-all cursor-pointer flex items-center justify-between gap-4 shadow-lg group select-none"
                >
                  {/* Left: 3D Head + Duel Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={`https://mc-heads.net/head/${test.playerUsername}/100`}
                      alt={test.playerUsername}
                      className="w-11 h-11 rounded-xl border border-line shrink-0 group-hover:scale-105 transition-transform"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-black text-sm sm:text-base text-text group-hover:text-brand-cyan transition-colors truncate">
                          {test.playerUsername}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[9.5px] font-bold border ${
                            isPromo
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : isDemo
                              ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                              : isNew
                              ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                              : "bg-surface text-muted border-line"
                          }`}
                        >
                          {isPromo
                            ? "▲ PROMOTED"
                            : isDemo
                            ? "▼ DEMOTED"
                            : isNew
                            ? "★ NEW"
                            : "● RETAINED"}
                        </span>
                      </div>

                      {/* Movement: Previous -> New Tier */}
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="flex items-center gap-1.5 text-text font-semibold capitalize">
                          <GamemodeIcon id={test.kit} size={14} />
                          {test.kit}:
                        </span>
                        <span className="text-muted/80">
                          {test.previousTier ? `${test.previousTier} ➔ ` : ""}
                        </span>
                        <span
                          className="font-black"
                          style={{ color: tierColor }}
                        >
                          {test.newTier}
                        </span>
                      </div>

                      {/* Tester & Score Pill */}
                      <div className="text-[11px] font-mono text-muted flex items-center gap-2">
                        <span>Score: <strong className="text-text">{test.score}</strong></span>
                        <span>•</span>
                        <span>Tester: <strong className="text-text">@{test.testerUsername}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Prominent Timestamp Box in JetBrains Mono */}
                  <div className="text-right shrink-0 bg-[#141A28] border border-line/80 px-3 py-2 rounded-xl">
                    <span className="text-xs font-mono font-bold text-brand-cyan block">
                      {times.relative}
                    </span>
                    <span className="text-[10px] font-mono text-muted/80 block mt-0.5">
                      {times.exact}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
