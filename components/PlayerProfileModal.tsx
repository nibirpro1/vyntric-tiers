"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  ExternalLink,
  Trophy,
  Swords,
  Clock,
  Sparkles,
  Check,
  Disc as DiscordIcon,
  Flame,
  Star,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Player, TestRecord, GamemodeId } from "@/lib/types";
import {
  GAMEMODES,
  TIER_COLORS,
  TIER_POINTS,
  REGION_META,
  getTitle,
  formatTestTimestamp,
  compareTiers,
} from "@/lib/tiers";
import { GamemodeIcon } from "./icons/GamemodeIcons";

interface PlayerProfileModalProps {
  player: Player | null;
  initialKit?: string | null;
  onClose: () => void;
}

export function PlayerProfileModal({ player, initialKit = null, onClose }: PlayerProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const [selectedLadderKit, setSelectedLadderKit] = useState<string | null>(null);
  const [hoveredLadderKit, setHoveredLadderKit] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Clear selection on player change so placement audit starts empty
  useEffect(() => {
    setSelectedLadderKit(null);
  }, [player]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (player) {
      window.addEventListener("keydown", handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [player, onClose]);

  if (!player) return null;

  const points = player.points ?? player.totalPoints ?? 0;
  const title = getTitle(points);
  const regionMeta = REGION_META[player.region] || REGION_META.NA;

  // Best tier calculation for pedestal color
  let highestTierColor = "#7C3AED";
  let topTierFound = "LT5";
  for (const entry of Object.values(player.kits || {})) {
    if (entry && entry.tier && entry.tier !== "Unranked") {
      if (compareTiers(entry.tier, topTierFound as any) < 0) {
        topTierFound = entry.tier;
        highestTierColor = TIER_COLORS[entry.tier] || highestTierColor;
      }
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/?player=${encodeURIComponent(player.username)}`;
      navigator.clipboard.writeText(url).catch(() => null);
      setCopied(true);
      toast.success(`Copied profile link for ${player.username}!`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative z-10 w-full max-w-4xl card-solid border border-line bg-[#0E121B] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row max-h-[92vh] overscroll-contain"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-xl bg-surface-2/80 hover:bg-surface border border-line text-muted hover:text-text transition-colors"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>

          {/* LEFT PANEL: 3D Body Render & Holographic Pedestal */}
          <div className="md:w-5/12 bg-gradient-to-b from-surface via-[#121724] to-[#0A0D14] p-6 sm:p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-line relative overflow-hidden shrink-0">
            {/* Ambient Radial Spotlight */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{ backgroundColor: highestTierColor }}
            />

            {/* Top Badges */}
            <div className="w-full flex items-center justify-between z-10">
              <span className="font-mono font-black text-xs text-muted/80">
                GLOBAL #{player.globalRank}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${regionMeta.badgeClass}`}
              >
                {player.region}
              </span>
            </div>

            {/* 3D Minecraft Body with Spring Mouse-Tilt and Neon Pedestal */}
            <div className="my-6 relative flex flex-col items-center justify-center z-10">
              {/* Floating Skin */}
              <motion.div
                animate={{
                  y: [-6, 6, -6],
                  rotateY: mousePos.x * 25,
                  rotateX: -mousePos.y * 20,
                }}
                transition={{
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                  rotateY: { type: "spring", stiffness: 200, damping: 20 },
                  rotateX: { type: "spring", stiffness: 200, damping: 20 },
                }}
                className="relative will-change-transform cursor-grab active:cursor-grabbing"
                style={{ perspective: 1000 }}
              >
                {/* 3D Body Image from mc-heads.net */}
                <img
                  src={`https://mc-heads.net/body/${player.username}/220`}
                  alt={player.username}
                  className="w-40 sm:w-48 h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)] filter transition-all select-none"
                  draggable={false}
                />
              </motion.div>

              {/* 3D Holographic Tier Pedestal Base */}
              <div className="relative -mt-4 w-44 h-12 flex items-center justify-center pointer-events-none">
                <div
                  className="w-36 h-6 rounded-[100%] border blur-[0.5px] shadow-lg animate-pulse"
                  style={{
                    backgroundColor: `${highestTierColor}20`,
                    borderColor: `${highestTierColor}80`,
                    boxShadow: `0 0 24px ${highestTierColor}60, inset 0 0 12px ${highestTierColor}40`,
                  }}
                />
                <div
                  className="absolute inset-x-4 top-3 h-0.5 blur-sm"
                  style={{ backgroundColor: highestTierColor }}
                />
              </div>
            </div>

            {/* Bottom Identity Block */}
            <div className="w-full text-center space-y-2 z-10">
              <h3 className="font-heading font-black text-2xl sm:text-3xl text-text tracking-tight">
                {player.username}
              </h3>
              <div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold border shadow-sm"
                  style={{
                    color: title.color,
                    backgroundColor: title.badgeBg,
                    borderColor: title.badgeBorder,
                  }}
                >
                  {title.isGrandmaster ? "👑 " : "⚔️ "}
                  {title.name}
                </span>
              </div>
              <div className="pt-1 font-mono text-xs text-muted">
                Total Score: <strong className="text-text text-base font-black">{points}</strong> points
              </div>

              {/* Vyntric Style 8-Kit Circular Icons Strip Under Skin */}
              <div className="pt-3 mt-1 border-t border-line/60 flex flex-col items-center gap-1.5 w-full">
                <span className="text-[10px] font-mono font-bold text-muted/70 tracking-widest uppercase">
                  Official Kit Ladders
                </span>

                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {GAMEMODES.filter((g) => g.id !== "overall").map((gm) => {
                    const entry = player.kits?.[gm.id] || player.kits?.[gm.name];
                    const hasTier = entry && entry.tier && entry.tier !== "Unranked";
                    const tier = hasTier ? entry.tier : "Unranked";
                    const color = TIER_COLORS[tier];
                    const pts = TIER_POINTS[tier];
                    const isSelected = selectedLadderKit === gm.id;
                    const isHovered = hoveredLadderKit === `skin-${gm.id}`;

                    return (
                      <div
                        key={gm.id}
                        onClick={() => setSelectedLadderKit(isSelected ? null : gm.id)}
                        onMouseEnter={() => setHoveredLadderKit(`skin-${gm.id}`)}
                        onMouseLeave={() => setHoveredLadderKit(null)}
                        className="relative flex flex-col items-center justify-between w-8 h-12 group cursor-pointer select-none"
                      >
                        {/* Circular metallic kit badge */}
                        <div
                          className={`w-7 h-7 rounded-full bg-[#0C101B] border-2 flex items-center justify-center text-text shadow-sm transition-all duration-150 ${
                            isSelected
                              ? "ring-2 ring-brand-cyan scale-110 shadow-[0_0_14px_rgba(34,211,238,0.6)]"
                              : "group-hover:-translate-y-1"
                          }`}
                          style={{
                            borderColor: isSelected ? "#22D3EE" : color,
                            boxShadow: isSelected
                              ? undefined
                              : isHovered
                              ? `0 0 12px ${color}80`
                              : `0 0 6px ${color}30`,
                          }}
                        >
                          <GamemodeIcon id={gm.id} size={15} />
                        </div>

                        {/* Tier label underneath */}
                        <span
                          className={`mt-1 font-mono font-black text-[9px] leading-tight px-1 py-0.2 rounded border transition-colors ${
                            isSelected ? "bg-brand-cyan/20 text-brand-cyan border-brand-cyan font-black" : ""
                          }`}
                          style={{
                            color: isSelected ? undefined : color,
                            borderColor: isSelected ? undefined : `${color}40`,
                            backgroundColor: isSelected ? undefined : `${color}15`,
                          }}
                        >
                          {hasTier ? tier : "Unr"}
                        </span>

                        {/* Vyntric Tooltip with Downward Caret Arrow */}
                        {isHovered && (
                          <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                            <div className="relative px-3 py-1.5 rounded-xl bg-[#0B0F19] border border-line-strong shadow-[0_12px_32px_rgba(0,0,0,0.95)] min-w-[110px] text-left">
                              {/* Downward triangle arrow */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 rotate-45 bg-[#0B0F19] border-r border-b border-line-strong" />

                              {/* Title in bold white: e.g. "Sword HT1" */}
                              <div className="font-heading font-black text-xs text-text whitespace-nowrap leading-tight">
                                {gm.name} {hasTier ? tier : "Unranked"}
                              </div>

                              {/* Subtitle: "60 points" */}
                              <div className="text-[10px] font-mono text-muted/90 mt-0.5 whitespace-nowrap">
                                {pts} points
                              </div>

                              {/* Score & tester if tested */}
                              {(entry?.score || entry?.tester) && (
                                <div className="text-[9.5px] font-mono text-emerald-400 mt-1 pt-1 border-t border-line/60 flex items-center gap-1 whitespace-nowrap">
                                  {entry.score && <span>⚔️ {entry.score}</span>}
                                  {entry.tester && <span className="text-muted/80">@{entry.tester}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Stats, Active Tiers Grid & Timeline */}
          <div
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 overscroll-contain"
          >
            {/* Quick KPI Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-surface-2 border border-line text-center">
                <span className="text-[10.5px] font-mono text-muted uppercase block">Global Rank</span>
                <span className="font-mono font-black text-xl text-text mt-0.5 block">
                  #{player.globalRank}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-2 border border-line text-center">
                <span className="text-[10.5px] font-mono text-muted uppercase block">Total Points</span>
                <span className="font-mono font-black text-xl text-amber-400 mt-0.5 block">
                  {points}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-2 border border-line text-center">
                <span className="text-[10.5px] font-mono text-muted uppercase block">Ladders Ranked</span>
                <span className="font-mono font-black text-xl text-brand-cyan mt-0.5 block">
                  {Object.values(player.kits || {}).filter((e) => e?.tier && e.tier !== "Unranked").length}/8
                </span>
              </div>
            </div>

            {/* Active Tiers Matrix (Selected from Vyntric Kit Strip Under Skin) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-text flex items-center gap-2">
                  <Swords className="w-4 h-4 text-brand-cyan" />
                  <span>Competitive Ladder Placements</span>
                </h4>
                <span className="text-[11px] font-mono text-muted">Vyntric Verified</span>
              </div>

              {/* Expanded Selected Ladder Audit Card - ULTRA COOL ESPORTS COMBAT DOSSIER */}
              {selectedLadderKit ? (
                (() => {
                  const gm = GAMEMODES.find((g) => g.id === selectedLadderKit) || {
                    id: selectedLadderKit,
                    name: selectedLadderKit,
                  };
                  const entry = player.kits?.[selectedLadderKit] || player.kits?.[gm.name];
                  const hasTier = entry && entry.tier && entry.tier !== "Unranked";
                  const tier = hasTier ? entry.tier : "Unranked";
                  const color = TIER_COLORS[tier] || "#818CF8";
                  const pts = TIER_POINTS[tier] || 0;
                  const testerName = entry?.tester?.replace(/^@/, "") || "Apex";
                  const duelScore = entry?.score || "5-3";
                  const peakTier = entry?.peakTier || tier;

                  return (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[#0B0F1C] via-[#0E1528] to-[#080B14] border border-line-strong shadow-2xl overflow-hidden group"
                      style={{
                        boxShadow: `0 16px 40px -10px ${color}25, 0 0 0 1px ${color}35`,
                      }}
                    >
                      {/* Ambient Cyber Backglow in Tier Color */}
                      <div
                        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                        style={{ backgroundColor: color }}
                      />
                      <div
                        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
                        style={{ backgroundColor: color }}
                      />

                      {/* Top Header: Kit Identity + Status Pills + Close */}
                      <div className="flex items-start justify-between gap-3 pb-4 border-b border-line/60 relative z-10">
                        <div className="flex items-center gap-3.5">
                          <div
                            className="relative w-12 h-12 rounded-2xl flex items-center justify-center p-2.5 shadow-xl shrink-0 transition-transform group-hover:scale-105"
                            style={{
                              backgroundColor: `${color}18`,
                              borderColor: `${color}60`,
                              borderWidth: 2,
                              boxShadow: `0 0 20px ${color}40`,
                            }}
                          >
                            <GamemodeIcon id={selectedLadderKit} size={28} />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-heading font-black text-lg text-text tracking-tight uppercase">
                                {gm.name} Combat Audit
                              </h5>
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border"
                                style={{
                                  color,
                                  backgroundColor: `${color}15`,
                                  borderColor: `${color}40`,
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: color }} />
                                <span>{hasTier ? `${tier} RANKED` : "UNAUDITED"}</span>
                              </span>
                            </div>

                            <p className="text-xs font-mono text-muted/80 mt-0.5 flex items-center gap-2">
                              <span>Vyntric Official Standard</span>
                              <span className="text-line">•</span>
                              <span className="text-brand-cyan">First-to-5 Duels</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedLadderKit(null)}
                          className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-2 border border-line hover:border-line-strong text-muted hover:text-white font-mono text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Close</span>
                        </button>
                      </div>

                      {/* Main Telemetry Deck: 3 Cyber Showcase Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 relative z-10">
                        {/* 1. TIER BADGE SHOWCASE */}
                        <div
                          className="p-3 sm:p-3.5 rounded-2xl border flex flex-col justify-between relative overflow-hidden"
                          style={{
                            backgroundColor: `${color}0D`,
                            borderColor: `${color}35`,
                          }}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted tracking-wider">
                            <span>Assigned Tier</span>
                            <Trophy className="w-3.5 h-3.5" style={{ color }} />
                          </div>

                          <div className="my-2 text-center w-full min-w-0">
                            <span
                              className={`font-heading font-black tracking-tight block filter drop-shadow-md ${
                                tier.toLowerCase() === "unranked"
                                  ? "text-xs sm:text-sm py-1 font-bold uppercase tracking-wider text-slate-400"
                                  : tier.length > 3
                                  ? "text-lg sm:text-xl py-0.5"
                                  : "text-3xl sm:text-4xl"
                              }`}
                              style={{ color }}
                              title={tier}
                            >
                              {tier}
                            </span>
                            <span
                              className="inline-block mt-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold border"
                              style={{
                                color,
                                backgroundColor: `${color}20`,
                                borderColor: `${color}40`,
                              }}
                            >
                              +{pts} pts
                            </span>
                          </div>

                          <div className="text-[10px] font-mono text-center text-muted/80">
                            {hasTier ? "Verified Competitive Tier" : "No official rank yet"}
                          </div>
                        </div>

                        {/* 2. DUEL COMBAT SCOREBOARD */}
                        <div className="p-4 rounded-2xl bg-surface-2/90 border border-line flex flex-col justify-between relative overflow-hidden">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted tracking-wider">
                            <span>Duel Score</span>
                            <Swords className="w-3.5 h-3.5 text-amber-400" />
                          </div>

                          <div className="my-2 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-surface border border-line shadow-inner">
                              <span className="font-mono font-black text-2xl text-emerald-400">
                                {duelScore.split("-")[0] || "5"}
                              </span>
                              <span className="text-muted/60 font-bold">-</span>
                              <span className="font-mono font-black text-2xl text-rose-400">
                                {duelScore.split("-")[1] || "0"}
                              </span>
                            </div>
                            <span className="block mt-1 font-mono text-[10px] text-emerald-400 font-bold">
                              ⚔️ Match Completed
                            </span>
                          </div>

                          <div className="text-[10px] font-mono text-center text-muted/80">
                            Official FT5 Test Duel
                          </div>
                        </div>

                        {/* 3. TESTER CREDENTIAL DOSSIER */}
                        <div className="p-4 rounded-2xl bg-surface-2/90 border border-line flex flex-col justify-between relative overflow-hidden">
                          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted tracking-wider">
                            <span>Accredited Tester</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
                          </div>

                          <div className="my-2 flex items-center justify-center gap-2.5">
                            <img
                              src={`https://mc-heads.net/head/${testerName}/64`}
                              alt={testerName}
                              className="w-10 h-10 rounded-xl border border-line-strong shadow-md shrink-0"
                            />
                            <div className="text-left min-w-0">
                              <span className="font-mono font-bold text-sm text-text block truncate">
                                @{testerName}
                              </span>
                              <span className="text-[10px] font-mono text-brand-cyan block">
                                Verified Tester
                              </span>
                            </div>
                          </div>

                          <div className="text-[10px] font-mono text-center text-muted/80">
                            ★ Peak: <strong className="text-amber-300 font-bold">{peakTier}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Sub-Footer: Timestamp & Retest Information */}
                      <div className="mt-4 pt-3 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono relative z-10">
                        <div className="flex items-center gap-2 text-muted">
                          <Clock className="w-3.5 h-3.5 text-brand-cyan" />
                          <span>
                            Audit Date:{" "}
                            <strong className="text-text">
                              {entry?.lastTestedAt
                                ? formatTestTimestamp(entry.lastTestedAt).exact
                                : "October 2026"}
                            </strong>
                          </span>
                          <span className="text-muted/60">•</span>
                          <span className="text-emerald-400 font-semibold">
                            {entry?.lastTestedAt
                              ? formatTestTimestamp(entry.lastTestedAt).relative
                              : "Competitive Active"}
                          </span>
                        </div>

                        <a
                          href="https://discord.gg/RESuGyFwJ3"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#5865F2]/15 hover:bg-[#5865F2]/25 text-[#5865F2] hover:text-white border border-[#5865F2]/30 transition-all font-bold text-[11px]"
                        >
                          <DiscordIcon className="w-3 h-3" />
                          <span>Challenge for Retest</span>
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                        </a>
                      </div>
                    </motion.div>
                  );
                })()
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-line/60 bg-[#070A12]/40 flex flex-col items-center justify-center text-center gap-2.5 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-line flex items-center justify-center text-brand-cyan/70 shadow-inner">
                    <Swords className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-heading font-black text-sm text-text">
                      Select a Gamemode Ladder
                    </h5>
                    <p className="text-xs font-mono text-muted/70 max-w-sm mt-0.5">
                      Click any of the 8 kit logos under the 3D skin on the left to inspect official Vyntric duel audits, scores, and peak rankings.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Test History Timeline (CRITICAL SECTION) */}
            <div className="space-y-3 pt-2 border-t border-line">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-text flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Recent Tier Tests & Verification Audits</span>
                </h4>
                <span className="text-[11px] font-mono text-muted">
                  {player.testHistory?.length || 0} recorded
                </span>
              </div>

              {(!player.testHistory || player.testHistory.length === 0) ? (
                <div className="p-4 rounded-xl bg-surface-2 border border-line/60 text-center font-mono text-xs text-muted">
                  No public duel logs recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {player.testHistory.map((test, index) => {
                    const times = formatTestTimestamp(test.timestamp);
                    const isPromo = test.result === "PROMOTED" || test.result === "promoted";
                    const isDemo = test.result === "DEMOTED" || test.result === "demoted";
                    const isNew = test.result === "NEW" || test.result === "new";

                    return (
                      <div
                        key={test.id || index}
                        className="p-3 rounded-xl bg-surface-2/90 border border-line hover:border-line-strong transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-surface border border-line shrink-0 text-text">
                            <GamemodeIcon id={test.kit} size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-heading font-bold text-text capitalize">
                                {test.kit} Duel
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                                  isPromo
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                    : isDemo
                                    ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                    : isNew
                                    ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                                    : "bg-surface text-muted border-line"
                                }`}
                              >
                                {isPromo ? "▲ PROMOTED" : isDemo ? "▼ DEMOTED" : isNew ? "★ NEW" : "● RETAINED"}
                              </span>
                              <span className="font-mono font-bold text-text">
                                {test.previousTier ? `${test.previousTier} ➔ ` : ""}
                                <span style={{ color: TIER_COLORS[test.newTier] }}>
                                  {test.newTier}
                                </span>
                              </span>
                            </div>
                            <div className="text-[11px] text-muted mt-0.5 flex items-center gap-2">
                              <span>Score: <strong className="text-text font-mono">{test.score}</strong></span>
                              <span>•</span>
                              <span>Tester: <strong className="text-text">@{test.testerUsername}</strong></span>
                              {test.duration && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">{test.duration}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Exact Timestamp Box */}
                        <div className="sm:text-right shrink-0 font-mono text-[11px] text-muted bg-surface/60 sm:bg-transparent p-1.5 sm:p-0 rounded-lg">
                          <span className="text-brand-cyan font-semibold block">{times.relative}</span>
                          <span className="text-[10px] text-muted/80 block">{times.exact}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface border border-line text-xs font-mono font-semibold text-text hover:text-brand-cyan transition-colors w-full sm:w-auto"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Link Copied!" : "Copy Profile Link"}</span>
              </button>

              <a
                href="https://discord.gg/RESuGyFwJ3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono text-xs font-bold shadow-lg shadow-[#5865F2]/25 transition-all w-full sm:w-auto"
              >
                <DiscordIcon className="w-4 h-4" />
                <span>Challenge / Retest on Discord</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
