"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Search,
  Filter,
  Sparkles,
  Info,
  ChevronUp,
  ChevronDown,
  Star,
  ExternalLink,
  Crown,
  Medal,
  Flame,
  Zap,
  Shield,
  Swords,
  LayoutGrid,
  List,
  Clock,
} from "lucide-react";
import {
  GamemodeId,
  GAMEMODES,
  GAMEMODE_MAP,
  Region,
  STARTING_REGIONS,
  Tier,
  TIER_COLORS,
  TIER_POINTS,
  REGION_META,
  getTitle,
  formatTestTimestamp,
  compareTiers,
} from "@/lib/tiers";
import { Player, PlayerKitEntry } from "@/lib/types";
import { PLAYERS } from "@/lib/data";
import { useUIStore } from "@/lib/store";
import { GamemodeIcon } from "../icons/GamemodeIcons";

// ---------------------------------------------------------------------------
// 3D HOLOGRAPHIC TILT CARD WITH SPECULAR GLARE REFLECTION
// ---------------------------------------------------------------------------
function HoloTiltCard({
  children,
  className = "",
  onClick,
  style = {},
  glowColor = "#7C3AED",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 6;
    const rotY = ((x - centerX) / centerX) * 6;

    setRotate({ x: rotX, y: rotY });
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.22,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(900px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: "transform 0.15s ease-out",
        ...style,
      }}
      className={`relative cursor-pointer ${className}`}
    >
      {/* Specular Holographic Glare Layer */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10 rounded-2xl overflow-hidden"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.3) 0%, ${glowColor}30 35%, transparent 70%)`,
        }}
      />
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// SLEEK ESPORTS TOP 3 CHAMPIONS STRIP (CENTRAL TIER LIST STYLE)
// ---------------------------------------------------------------------------
function TopPodiumSection({
  players,
  onSelectPlayer,
}: {
  players: Player[];
  onSelectPlayer: (p: Player) => void;
}) {
  const first = players.find((p) => p.globalRank === 1) || players[0];
  const second = players.find((p) => p.globalRank === 2) || players[1];
  const third = players.find((p) => p.globalRank === 3) || players[2];

  if (!first || !second || !third) return null;

  const podiumSlots = [
    {
      player: second,
      rank: 2,
      label: "RANK #2",
      borderGlow: "border-slate-300/40 hover:border-slate-200",
      bgGlow: "from-slate-300/15 via-surface to-[#0A0D15]",
      medal: "🥈",
      color: "#CBD5E1",
    },
    {
      player: first,
      rank: 1,
      label: "CHAMPION #1",
      borderGlow: "border-amber-400/60 hover:border-amber-300 ring-1 ring-amber-400/40",
      bgGlow: "from-amber-400/20 via-surface to-[#0A0D15]",
      medal: "👑",
      color: "#FFB800",
    },
    {
      player: third,
      rank: 3,
      label: "RANK #3",
      borderGlow: "border-amber-700/40 hover:border-amber-600",
      bgGlow: "from-amber-700/15 via-surface to-[#0A0D15]",
      medal: "🥉",
      color: "#EA580C",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
      {podiumSlots.map((slot) => {
        const p = slot.player;
        const points = p.points ?? p.totalPoints ?? 0;
        const title = getTitle(points);
        const reg = REGION_META[p.region] || REGION_META.NA;

        return (
          <motion.div
            key={p.id}
            onClick={() => onSelectPlayer(p)}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={`card-solid p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer select-none transition-all hover:shadow-lg ${slot.borderGlow} bg-gradient-to-r ${slot.bgGlow}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={`https://mc-heads.net/head/${p.username}/64`}
                  alt={p.username}
                  className="w-10 h-10 rounded-xl border border-line"
                />
                <span className="absolute -top-2 -left-1 text-sm">{slot.medal}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-black text-sm text-text truncate">
                    {p.username}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold border ${reg.badgeClass}`}>
                    {p.region}
                  </span>
                </div>
                <span
                  className="text-[11px] font-mono font-bold block truncate"
                  style={{ color: title.color }}
                >
                  {title.name}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono font-black text-sm text-amber-400 block">
                {points} pts
              </span>
              <span className="text-[9.5px] font-mono text-muted/80 block uppercase">
                {slot.label}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

interface RankingsHubProps {
  players?: Player[];
  onSelectPlayer?: (player: Player, kit?: string) => void;
  onOpenInfo?: () => void;
}

export function RankingsHub({
  players = PLAYERS,
  onSelectPlayer: propOnSelectPlayer,
  onOpenInfo: propOnOpenInfo,
}: RankingsHubProps = {}) {
  const { setSelectedPlayer } = useUIStore();
  const onSelectPlayer = propOnSelectPlayer || setSelectedPlayer;
  const onOpenInfo =
    propOnOpenInfo ||
    (() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("open-vyntric-info"));
      }
    });

  const searchParams = useSearchParams();
  const [activeGamemode, setActiveGamemode] = useState<GamemodeId>("overall");
  const [selectedRegion, setSelectedRegion] = useState<Region | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTitle, setSelectedTitle] = useState<string>("ALL");
  const [selectedTierTab, setSelectedTierTab] = useState<number | "ALL">("ALL");

  // Read URL ?kit= parameter
  useEffect(() => {
    if (!searchParams) return;
    const kitParam = searchParams.get("kit");
    if (kitParam) {
      const lower = kitParam.toLowerCase() as GamemodeId;
      if (GAMEMODE_MAP[lower]) {
        setActiveGamemode(lower);
      }
    }
  }, [searchParams]);
  const [hoveredKitTooltip, setHoveredKitTooltip] = useState<{
    playerId: string;
    kitId: string;
    entry: PlayerKitEntry;
    kitName: string;
  } | null>(null);

  // Filtered Players
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // Region filter
      if (selectedRegion !== "ALL" && player.region !== selectedRegion) {
        return false;
      }
      // Search filter
      if (
        searchQuery.trim() &&
        !player.username.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) {
        return false;
      }
      // Combat title filter
      if (selectedTitle !== "ALL") {
        const title = getTitle(player.points);
        if (title.name !== selectedTitle) return false;
      }
      // Gamemode filter (if specific kit, must have a tier in this kit)
      if (activeGamemode !== "overall") {
        const entry = player.kits?.[activeGamemode] || player.kits?.[GAMEMODE_MAP[activeGamemode]?.name];
        if (!entry || !entry.tier || entry.tier === "Unranked") {
          return false;
        }
      }
      return true;
    });
  }, [players, selectedRegion, searchQuery, selectedTitle, activeGamemode]);

  // Count combatants per tier bracket (Tier 1 -> Tier 5) in active ladder
  const tierCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    [1, 2, 3, 4, 5].forEach((num) => {
      const ht = `HT${num}`;
      const lt = `LT${num}`;
      const total = filteredPlayers.filter((p) => {
        const entry = p.kits?.[activeGamemode] || p.kits?.[GAMEMODE_MAP[activeGamemode]?.name];
        return entry?.tier === ht || entry?.tier === lt;
      }).length;
      counts[num] = total;
    });
    return counts;
  }, [filteredPlayers, activeGamemode]);

  const showPodium =
    activeGamemode === "overall" &&
    !searchQuery.trim() &&
    selectedRegion === "ALL" &&
    selectedTitle === "ALL";

  return (
    <section id="rankings" className="w-full space-y-4 pt-2 pb-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* ========================================================= */}
        {/* GAMEMODE SELECTOR BAR (VYNTRIC 9-TAB SEGMENTED BAR) */}
        {/* ========================================================= */}
        <div className="p-1.5 rounded-2xl bg-[#0B0E17] border border-line shadow-2xl backdrop-blur-xl overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {GAMEMODES.map((gm) => {
              const isActive = activeGamemode === gm.id;
              return (
                <motion.button
                  key={gm.id}
                  onClick={() => setActiveGamemode(gm.id)}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-heading text-xs sm:text-sm font-bold transition-all duration-200 select-none ${
                    isActive ? "text-white" : "text-muted hover:text-text hover:bg-surface-2/60"
                  }`}
                >
                  {/* Sliding layoutId neon background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="gamemode-tab"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF2D55] via-[#E11D48] to-[#7C3AED] shadow-[0_4px_24px_rgba(255,45,85,0.45)] ring-1 ring-white/20"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}

                  {/* Tab Icon & Label */}
                  <span className="relative z-10 flex items-center gap-2">
                    <GamemodeIcon id={gm.id} size={18} />
                    <span>{gm.name}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECONDARY FILTER BAR: REGIONS, SEARCH, TITLE & INFO MODAL */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface/90 border border-line">
          {/* Left: Region Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] font-mono font-bold text-muted uppercase mr-1 hidden sm:inline">
              Region:
            </span>
            <motion.button
              onClick={() => setSelectedRegion("ALL")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedRegion === "ALL"
                  ? "bg-text text-[#07090E] shadow-sm font-black"
                  : "bg-surface-2 text-muted hover:text-text border border-line"
              }`}
            >
              ALL
            </motion.button>
            {STARTING_REGIONS.map((r) => {
              const meta = REGION_META[r];
              const isSelected = selectedRegion === r;
              return (
                <motion.button
                  key={r}
                  onClick={() => setSelectedRegion(r)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? `${meta.badgeClass} ring-2 ring-current font-black`
                      : "bg-surface-2/70 text-muted hover:text-text border-line"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span>{r}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Right: Search + Title Filter + Info Button */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-2 border border-line text-xs font-mono text-text placeholder:text-muted/60 focus:outline-none focus:border-brand-violet transition-colors"
              />
            </div>

            {/* Combat Title Select */}
            <select
              value={selectedTitle}
              onChange={(e) => setSelectedTitle(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-surface-2 border border-line text-xs font-mono text-text focus:outline-none focus:border-brand-violet cursor-pointer transition-colors"
            >
              <option value="ALL">All Titles</option>
              <option value="Combat Grandmaster">Combat Grandmaster (250+)</option>
              <option value="Combat Master">Combat Master (180+)</option>
              <option value="Combat Ace">Combat Ace (110+)</option>
              <option value="Combat Specialist">Combat Specialist (60+)</option>
              <option value="Combat Cadet">Combat Cadet (30+)</option>
              <option value="Combat Novice">Combat Novice (1+)</option>
            </select>

            {/* Info / Points Popup Button */}
            <motion.button
              onClick={onOpenInfo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-surface-2 hover:bg-surface border border-line text-xs font-mono text-muted hover:text-amber-400 transition-colors flex items-center gap-1 shrink-0"
              title="View Points & Titles Matrix"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Info</span>
            </motion.button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: "OVERALL" LEADERBOARD (VYNTRIC STANDINGS TABLE)   */}
        {/* ========================================================= */}
        <AnimatePresence mode="wait">
          {activeGamemode === "overall" ? (
            <motion.div
              key="view-overall"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Table / Cards List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono text-muted px-3">
                  <span>SHOWING {filteredPlayers.length} COMBATANTS</span>
                  <span>CLICK TO VIEW 3D PROFILE</span>
                </div>

                {filteredPlayers.length === 0 ? (
                  <div className="card-solid p-12 text-center text-muted font-mono text-sm border-line rounded-2xl">
                    No players match the selected filters.
                  </div>
                ) : (
                  filteredPlayers.map((player) => {
                    const points = player.points ?? player.totalPoints ?? 0;
                    const title = getTitle(points);
                    const regionMeta = REGION_META[player.region] || REGION_META.NA;
                    const isFirst = player.globalRank === 1;
                    const isSecond = player.globalRank === 2;
                    const isThird = player.globalRank === 3;

                    // Ranked kit entries
                    const rankedKits = Object.entries(player.kits || {}).filter(
                      (item): item is [string, PlayerKitEntry] =>
                        Boolean(item[1] && item[1].tier && item[1].tier !== "Unranked")
                    );

                    return (
                      <HoloTiltCard
                        key={player.id}
                        onClick={() => onSelectPlayer(player)}
                        glowColor={isFirst ? "#FFB800" : isSecond ? "#CBD5E1" : isThird ? "#EA580C" : "#7C3AED"}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none ${
                          isFirst
                            ? "bg-gradient-to-r from-amber-500/10 via-surface to-surface border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-500/10"
                            : isSecond
                            ? "bg-gradient-to-r from-slate-300/10 via-surface to-surface border-slate-300/30 hover:border-slate-200"
                            : isThird
                            ? "bg-gradient-to-r from-amber-700/10 via-surface to-surface border-amber-700/30 hover:border-amber-600"
                            : "bg-surface-2/60 hover:bg-surface border-line hover:border-brand-violet/40"
                        }`}
                      >
                        {/* Left: Rank Badge + 3D Head + IGN + Title */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Rank Plate */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-inner ${
                              isFirst
                                ? "bg-gradient-to-b from-amber-300 to-amber-600 text-[#07090E] ring-2 ring-amber-400/50"
                                : isSecond
                                ? "bg-gradient-to-b from-slate-200 to-slate-400 text-[#07090E]"
                                : isThird
                                ? "bg-gradient-to-b from-amber-600 to-amber-900 text-white"
                                : "bg-surface border border-line text-muted"
                            }`}
                          >
                            {isFirst ? <Crown className="w-5 h-5 fill-current" /> : `#${player.globalRank}`}
                          </div>

                          {/* 3D Minecraft Isometric Head */}
                          <div className="relative shrink-0">
                            <img
                              src={`https://mc-heads.net/head/${player.username}/100`}
                              alt={player.username}
                              className="w-11 h-11 rounded-lg border border-line drop-shadow hover:scale-110 transition-transform duration-300"
                            />
                            {isFirst && (
                              <div className="absolute -top-2.5 -right-1 text-xs">👑</div>
                            )}
                          </div>

                          {/* Username, Title & Points */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-heading font-black text-base sm:text-lg text-text hover:text-brand-cyan transition-colors truncate">
                                {player.username}
                              </span>
                              <span
                                className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold border ${regionMeta.badgeClass}`}
                              >
                                {player.region}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono mt-0.5">
                              <span
                                className="font-bold truncate"
                                style={{ color: title.color }}
                              >
                                {title.isGrandmaster && "👑 "}
                                {title.name}
                              </span>
                              <span className="text-muted">•</span>
                              <span className="text-amber-400 font-black">
                                {points} pts
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Vyntric Circular Kit Badges Strip */}
                        <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-line/50 z-20">
                          {rankedKits.length === 0 ? (
                            <span className="text-xs font-mono text-muted/60 italic">
                              Unranked in active ladder
                            </span>
                          ) : (
                            rankedKits.map(([kitKey, entry]) => {
                              const gmMeta = GAMEMODE_MAP[kitKey as GamemodeId] || {
                                name: kitKey,
                                id: kitKey,
                              };
                              const tierColor = TIER_COLORS[entry.tier];
                              const isHovered =
                                hoveredKitTooltip?.playerId === player.id &&
                                hoveredKitTooltip?.kitId === kitKey;

                              return (
                                <div
                                  key={kitKey}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectPlayer(player, kitKey);
                                  }}
                                  onMouseEnter={() =>
                                    setHoveredKitTooltip({
                                      playerId: player.id,
                                      kitId: kitKey,
                                      entry,
                                      kitName: gmMeta.name,
                                    })
                                  }
                                  onMouseLeave={() => setHoveredKitTooltip(null)}
                                  className="relative w-9 h-14 flex flex-col items-center justify-between shrink-0 group/kit cursor-pointer select-none"
                                >
                                  {/* Circular metallic kit icon ringed in tier color */}
                                  <div
                                    className="w-8 h-8 rounded-full bg-[#0C101B] border-2 flex items-center justify-center text-text shadow-sm transition-transform duration-150 group-hover/kit:-translate-y-1"
                                    style={{
                                      borderColor: tierColor,
                                      boxShadow: isHovered
                                        ? `0 0 16px ${tierColor}80`
                                        : `0 0 8px ${tierColor}30`,
                                    }}
                                  >
                                    <GamemodeIcon id={kitKey} size={18} />
                                  </div>

                                  {/* Tier Tag Pill underneath */}
                                  <span
                                    className="px-1.5 py-0.2 rounded font-mono font-black text-[9.5px] leading-tight border transition-colors"
                                    style={{
                                      color: tierColor,
                                      borderColor: `${tierColor}40`,
                                      backgroundColor: `${tierColor}15`,
                                    }}
                                  >
                                    {entry.tier}
                                  </span>

                                  {/* Vyntric Sleek Tooltip with Downward Caret Arrow (Exact match to Vyntric screenshot) */}
                                  {isHovered && (
                                    <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                                      <div className="relative px-3.5 py-2 rounded-xl bg-[#0B0F19] border border-line-strong shadow-[0_12px_32px_rgba(0,0,0,0.9)] min-w-[120px] text-left select-none">
                                        {/* Downward triangle arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1.5 w-2.5 h-2.5 rotate-45 bg-[#0B0F19] border-r border-b border-line-strong" />

                                        {/* Title in bold white: e.g. "Sword HT1" */}
                                        <div className="font-heading font-black text-sm text-text whitespace-nowrap leading-tight">
                                          {gmMeta.name} {entry.tier}
                                        </div>

                                        {/* Subtitle: "60 points" */}
                                        <div className="text-xs font-mono text-muted/90 mt-0.5 whitespace-nowrap">
                                          {TIER_POINTS[entry.tier]} points
                                        </div>

                                        {/* Test details if available */}
                                        {(entry.score || entry.tester) && (
                                          <div className="text-[10px] font-mono text-emerald-400 mt-1 pt-1 border-t border-line/60 flex items-center gap-1.5 whitespace-nowrap">
                                            {entry.score && <span>Score: {entry.score}</span>}
                                            {entry.tester && <span className="text-muted/80">@{entry.tester}</span>}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </HoloTiltCard>
                    );
                  })
                )}
              </div>
            </motion.div>
          ) : (
            /* ========================================================= */
            /* VIEW 2: GAMEMODE 5-COLUMN TIER LIST (TIER 1 TO TIER 5)   */
            /* ========================================================= */
            <motion.div
              key={`view-${activeGamemode}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Gamemode Tournament Standings Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0C101D] via-[#090C16] to-[#0C101D] border border-line/80 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div
                  className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: "#38BDF8" }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Gamemode Icon + Title + Meta */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#121829] border border-line flex items-center justify-center shrink-0 shadow-lg p-2 relative group">
                      <GamemodeIcon id={activeGamemode} size={30} />
                      <div className="absolute inset-0 rounded-2xl bg-[#FF2D55]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-black text-xl sm:text-2xl text-text tracking-tight">
                          {GAMEMODE_MAP[activeGamemode]?.name} Tier Standings
                        </h3>
                        
                      </div>
                      <p className="text-xs font-mono text-muted mt-0.5">
                        Official Vyntric PvP rankings • Tested under Vyntric standard competitive rules
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Stats & Rules Guide Trigger */}
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <div className="px-3 py-1.5 rounded-xl bg-surface-2/90 border border-line/70 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="font-mono text-xs font-black text-text">
                        {filteredPlayers.length}
                      </span>
                      <span className="font-mono text-[11px] text-muted uppercase">Combatants</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={onOpenInfo}
                      className="px-3 py-1.5 rounded-xl bg-surface-2/90 hover:bg-surface border border-line/70 hover:border-amber-400/40 text-xs font-mono font-bold text-muted hover:text-amber-300 transition-all flex items-center gap-1.5"
                    >
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      <span>Scoring Guide</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* MCTIERS-INSPIRED TIER NAVIGATION BAR (CUSTOMIZED VYNTRIC)  */}
              {/* ========================================================= */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#080B14]/95 border border-line/80 shadow-xl overflow-x-auto scrollbar-none backdrop-blur-xl">
                {/* All Tiers Button */}
                <button
                  onClick={() => setSelectedTierTab("ALL")}
                  className={`px-3.5 py-2 rounded-xl font-heading text-xs font-bold transition-all flex items-center gap-2 shrink-0 select-none ${
                    selectedTierTab === "ALL"
                      ? "bg-white/15 text-white border border-white/20 shadow-md"
                      : "text-muted hover:text-text hover:bg-surface-2/60 border border-transparent"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>All Tiers</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-black/40 text-muted">
                    {filteredPlayers.length}
                  </span>
                </button>

                {/* Tier 1 - Tier 5 Tabs with Gold/Silver/Bronze Trophies */}
                {[
                  {
                    tierNum: 1,
                    title: "Tier 1",
                    trophy: "gold",
                    color: "#F59E0B",
                    textColor: "#FBBF24",
                    tabBg: "bg-[#281F10]/95",
                    tabBorder: "border-amber-500/50",
                  },
                  {
                    tierNum: 2,
                    title: "Tier 2",
                    trophy: "silver",
                    color: "#38BDF8",
                    textColor: "#E2E8F0",
                    tabBg: "bg-[#1C2533]/95",
                    tabBorder: "border-slate-400/50",
                  },
                  {
                    tierNum: 3,
                    title: "Tier 3",
                    trophy: "bronze",
                    color: "#EA580C",
                    textColor: "#D97706",
                    tabBg: "bg-[#281810]/95",
                    tabBorder: "border-orange-500/50",
                  },
                  {
                    tierNum: 4,
                    title: "Tier 4",
                    trophy: null,
                    color: "#34D399",
                    textColor: "#CBD5E1",
                    tabBg: "bg-[#131A26]/95",
                    tabBorder: "border-slate-600/40",
                  },
                  {
                    tierNum: 5,
                    title: "Tier 5",
                    trophy: null,
                    color: "#94A3B8",
                    textColor: "#CBD5E1",
                    tabBg: "bg-[#131A26]/95",
                    tabBorder: "border-slate-600/40",
                  },
                ].map((tab) => {
                  const isSelected = selectedTierTab === tab.tierNum;
                  return (
                    <button
                      key={tab.tierNum}
                      onClick={() =>
                        setSelectedTierTab(selectedTierTab === tab.tierNum ? "ALL" : tab.tierNum)
                      }
                      className={`px-4 py-2 rounded-xl font-heading text-xs font-black transition-all flex items-center gap-2 shrink-0 border select-none ${
                        isSelected
                          ? `${tab.tabBg} ${tab.tabBorder} shadow-lg ring-2 ring-white/15`
                          : "bg-surface-2/40 hover:bg-surface-2 border-line/60 text-muted hover:text-text"
                      }`}
                      style={{ color: isSelected || selectedTierTab === "ALL" ? tab.textColor : undefined }}
                    >
                      {tab.trophy === "gold" && (
                        <Trophy className="w-3.5 h-3.5 text-[#FBBF24] fill-amber-400/30 shrink-0" />
                      )}
                      {tab.trophy === "silver" && (
                        <Trophy className="w-3.5 h-3.5 text-[#E2E8F0] fill-slate-300/30 shrink-0" />
                      )}
                      {tab.trophy === "bronze" && (
                        <Trophy className="w-3.5 h-3.5 text-[#CD7F32] fill-orange-500/30 shrink-0" />
                      )}
                      {tab.tierNum === 4 && (
                        <Shield className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                      )}
                      {tab.tierNum === 5 && (
                        <Zap className="w-3.5 h-3.5 text-slate-400/80 shrink-0" />
                      )}
                      <span>{tab.title}</span>
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border"
                        style={{
                          backgroundColor: `${tab.color}15`,
                          borderColor: `${tab.color}35`,
                          color: tab.textColor,
                        }}
                      >
                        {tierCounts[tab.tierNum]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 5 Side-by-Side Columns Grid with Staggered Cascading */}
              <div
                className={`grid gap-3.5 ${
                  selectedTierTab === "ALL"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
                    : "grid-cols-1 max-w-xl mx-auto w-full"
                }`}
              >
                {[
                  {
                    tierNum: 1,
                    title: "Tier 1",
                    subtitle: "MYTHIC",
                    ht: "HT1",
                    lt: "LT1",
                    color: "#F59E0B",
                    textColor: "#FBBF24",
                    trophy: "gold",
                    headerBg: "linear-gradient(180deg, #2D2110 0%, #171107 100%)",
                    borderColor: "border-amber-500/40",
                    pts: "60 / 45 pts",
                  },
                  {
                    tierNum: 2,
                    title: "Tier 2",
                    subtitle: "DIAMOND",
                    ht: "HT2",
                    lt: "LT2",
                    color: "#38BDF8",
                    textColor: "#E2E8F0",
                    trophy: "silver",
                    headerBg: "linear-gradient(180deg, #1C2433 0%, #0E131C 100%)",
                    borderColor: "border-slate-400/40",
                    pts: "30 / 20 pts",
                  },
                  {
                    tierNum: 3,
                    title: "Tier 3",
                    subtitle: "MASTER",
                    ht: "HT3",
                    lt: "LT3",
                    color: "#EA580C",
                    textColor: "#D97706",
                    trophy: "bronze",
                    headerBg: "linear-gradient(180deg, #27160E 0%, #140A06 100%)",
                    borderColor: "border-orange-500/40",
                    pts: "10 / 6 pts",
                  },
                  {
                    tierNum: 4,
                    title: "Tier 4",
                    subtitle: "ADEPT",
                    ht: "HT4",
                    lt: "LT4",
                    color: "#34D399",
                    textColor: "#CBD5E1",
                    trophy: null,
                    headerBg: "linear-gradient(180deg, #131A26 0%, #090E17 100%)",
                    borderColor: "border-emerald-500/30",
                    pts: "4 / 3 pts",
                  },
                  {
                    tierNum: 5,
                    title: "Tier 5",
                    subtitle: "CHALLENGER",
                    ht: "HT5",
                    lt: "LT5",
                    color: "#94A3B8",
                    textColor: "#CBD5E1",
                    trophy: null,
                    headerBg: "linear-gradient(180deg, #131A26 0%, #090E17 100%)",
                    borderColor: "border-slate-600/30",
                    pts: "2 / 1 pt",
                  },
                ]
                  .filter((col) => selectedTierTab === "ALL" || selectedTierTab === col.tierNum)
                  .map((col, colIdx) => {
                  // Players in High Tier for this column
                  const htPlayers = filteredPlayers.filter((p) => {
                    const entry = p.kits?.[activeGamemode] || p.kits?.[GAMEMODE_MAP[activeGamemode]?.name];
                    return entry?.tier === col.ht;
                  });

                  // Players in Low Tier for this column
                  const ltPlayers = filteredPlayers.filter((p) => {
                    const entry = p.kits?.[activeGamemode] || p.kits?.[GAMEMODE_MAP[activeGamemode]?.name];
                    return entry?.tier === col.lt;
                  });

                  const totalInCol = htPlayers.length + ltPlayers.length;

                  return (
                    <motion.div
                      key={col.tierNum}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 320,
                        damping: 24,
                        delay: colIdx * 0.05,
                      }}
                      className="border border-line/80 hover:border-line-strong bg-[#090D18]/95 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden shadow-xl transition-all duration-300"
                    >
                      {/* Top Glowing Accent Line */}
                      <div
                        className="h-1 w-full"
                        style={{
                          background: `linear-gradient(to right, ${col.color}, ${col.color}40, transparent)`,
                        }}
                      />

                      {/* Top Header Tab Cap: MCTiers Trophy Aesthetic + Vyntric Cyber Styling */}
                      <div
                        className="p-3 border-b flex items-center justify-between relative overflow-hidden"
                        style={{
                          borderColor: `${col.color}35`,
                          background: col.headerBg,
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          {col.trophy === "gold" ? (
                            <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)] shrink-0">
                              <Trophy className="w-4 h-4 fill-amber-400/40" />
                            </div>
                          ) : col.trophy === "silver" ? (
                            <div className="p-1.5 rounded-lg bg-slate-300/20 border border-slate-300/40 text-slate-200 shadow-[0_0_12px_rgba(226,232,240,0.3)] shrink-0">
                              <Trophy className="w-4 h-4 fill-slate-300/40" />
                            </div>
                          ) : col.trophy === "bronze" ? (
                            <div className="p-1.5 rounded-lg bg-orange-700/20 border border-orange-600/40 text-[#CD7F32] shadow-[0_0_12px_rgba(205,127,50,0.3)] shrink-0">
                              <Trophy className="w-4 h-4 fill-orange-500/40" />
                            </div>
                          ) : col.tierNum === 4 ? (
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                              <Shield className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-400 shrink-0">
                              <Zap className="w-4 h-4" />
                            </div>
                          )}

                          <div>
                            <span
                              className="font-heading font-black text-base leading-none tracking-tight block"
                              style={{ color: col.textColor }}
                            >
                              {col.title}
                            </span>
                            <span
                              className="text-[9px] font-mono font-black tracking-widest uppercase block mt-1"
                              style={{ color: col.color }}
                            >
                              {col.subtitle}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className="px-2.5 py-0.5 rounded-full font-mono font-black text-xs border shadow-sm block"
                            style={{
                              color: col.textColor,
                              borderColor: `${col.color}50`,
                              backgroundColor: `${col.color}20`,
                            }}
                          >
                            {totalInCol}
                          </span>
                        </div>
                      </div>

                      {/* Column Points Formula Strip */}
                      <div className="px-3 py-1.5 bg-[#070A12]/80 border-b border-line/50 text-[10px] font-mono text-muted flex items-center justify-between">
                        <span className="uppercase tracking-wider text-[9px] text-muted/80">LADDER WEIGHT</span>
                        <span className="font-black text-amber-300 font-mono text-[10.5px]">{col.pts}</span>
                      </div>

                      {/* Column Body: High Tier on Top, Low Tier on Bottom */}
                      <div className="p-2 space-y-3.5 flex-1 overflow-y-auto min-h-[160px] max-h-[640px] scrollbar-thin">
                        {/* SUB-GROUP 1: HIGH TIER */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-surface-2/60 border border-line/40">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-1.5 h-1.5 rounded-full shadow-sm"
                                style={{ backgroundColor: TIER_COLORS[col.ht as Tier] }}
                              />
                              <span className="font-heading font-bold text-[10.5px] text-text tracking-wide">
                                HIGH TIER ({col.ht})
                              </span>
                            </div>
                            <span
                              className="font-mono font-bold text-[9.5px] px-1.5 py-0.2 rounded border"
                              style={{
                                color: TIER_COLORS[col.ht as Tier],
                                borderColor: `${TIER_COLORS[col.ht as Tier]}40`,
                                backgroundColor: `${TIER_COLORS[col.ht as Tier]}15`,
                              }}
                            >
                              +{TIER_POINTS[col.ht as Tier]} pts
                            </span>
                          </div>

                          {htPlayers.length === 0 ? (
                            <div className="py-5 px-3 rounded-xl border border-dashed border-line/40 bg-[#070A12]/30 flex flex-col items-center justify-center text-center gap-1 select-none">
                              <Shield className="w-3.5 h-3.5 text-muted/30" />
                              <span className="text-[10px] font-mono font-medium text-muted/50 uppercase tracking-wider">
                                No Combatants
                              </span>
                              <span className="text-[8.5px] font-mono text-muted/30">
                                Slot Available
                              </span>
                            </div>
                          ) : (
                            htPlayers.map((p) => {
                              const entry = p.kits?.[activeGamemode] || p.kits?.[GAMEMODE_MAP[activeGamemode]?.name];
                              const times = entry ? formatTestTimestamp(entry.lastTestedAt) : null;
                              const reg = REGION_META[p.region] || REGION_META.NA;

                              return (
                                <motion.div
                                  key={p.id}
                                  whileHover={{ y: -2, scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => onSelectPlayer(p, activeGamemode)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = `${col.color}75`;
                                    e.currentTarget.style.boxShadow = `0 4px 18px -2px ${col.color}30`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "";
                                    e.currentTarget.style.boxShadow = "";
                                  }}
                                  className="group p-2 rounded-xl bg-[#0D1220]/90 hover:bg-[#151D33] border border-line/70 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <img
                                      src={`https://mc-heads.net/head/${p.username}/64`}
                                      alt={p.username}
                                      className="w-8 h-8 rounded-lg border border-line/80 shrink-0 shadow-inner group-hover:scale-105 transition-transform"
                                      style={{ imageRendering: "pixelated" }}
                                      loading="lazy"
                                    />
                                    <div className="min-w-0">
                                      <span className="font-heading font-extrabold text-xs text-text block truncate group-hover:text-amber-300 transition-colors">
                                        {p.username}
                                      </span>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className={`px-1 py-0.2 rounded text-[8.5px] font-mono font-extrabold border ${reg.badgeClass}`}>
                                          {p.region}
                                        </span>
                                        {times && (
                                          <span className="text-[8.5px] font-mono text-muted/70 truncate">
                                            {times.relative}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                                    <span
                                      className="font-mono font-black text-xs px-1.5 py-0.5 rounded-md border"
                                      style={{
                                        color: TIER_COLORS[col.ht as Tier],
                                        borderColor: `${TIER_COLORS[col.ht as Tier]}50`,
                                        backgroundColor: `${TIER_COLORS[col.ht as Tier]}18`,
                                      }}
                                    >
                                      {col.ht}
                                    </span>
                                    {entry?.score && (
                                      <span className="text-[9px] font-mono font-bold text-emerald-400 px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/25">
                                        {entry.score}
                                      </span>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                        </div>

                        {/* SUB-GROUP 2: LOW TIER */}
                        <div className="space-y-1.5 pt-2 border-t border-line/50">
                          <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-surface-2/60 border border-line/40">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-1.5 h-1.5 rounded-full shadow-sm"
                                style={{ backgroundColor: TIER_COLORS[col.lt as Tier] }}
                              />
                              <span className="font-heading font-bold text-[10.5px] text-text tracking-wide">
                                LOW TIER ({col.lt})
                              </span>
                            </div>
                            <span
                              className="font-mono font-bold text-[9.5px] px-1.5 py-0.2 rounded border"
                              style={{
                                color: TIER_COLORS[col.lt as Tier],
                                borderColor: `${TIER_COLORS[col.lt as Tier]}40`,
                                backgroundColor: `${TIER_COLORS[col.lt as Tier]}15`,
                              }}
                            >
                              +{TIER_POINTS[col.lt as Tier]} pts
                            </span>
                          </div>

                          {ltPlayers.length === 0 ? (
                            <div className="py-5 px-3 rounded-xl border border-dashed border-line/40 bg-[#070A12]/30 flex flex-col items-center justify-center text-center gap-1 select-none">
                              <Shield className="w-3.5 h-3.5 text-muted/30" />
                              <span className="text-[10px] font-mono font-medium text-muted/50 uppercase tracking-wider">
                                No Combatants
                              </span>
                              <span className="text-[8.5px] font-mono text-muted/30">
                                Slot Available
                              </span>
                            </div>
                          ) : (
                            ltPlayers.map((p) => {
                              const entry = p.kits?.[activeGamemode] || p.kits?.[GAMEMODE_MAP[activeGamemode]?.name];
                              const times = entry ? formatTestTimestamp(entry.lastTestedAt) : null;
                              const reg = REGION_META[p.region] || REGION_META.NA;

                              return (
                                <motion.div
                                  key={p.id}
                                  whileHover={{ y: -2, scale: 1.01 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => onSelectPlayer(p, activeGamemode)}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = `${col.color}75`;
                                    e.currentTarget.style.boxShadow = `0 4px 18px -2px ${col.color}30`;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "";
                                    e.currentTarget.style.boxShadow = "";
                                  }}
                                  className="group p-2 rounded-xl bg-[#0D1220]/90 hover:bg-[#151D33] border border-line/70 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-sm"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <img
                                      src={`https://mc-heads.net/head/${p.username}/64`}
                                      alt={p.username}
                                      className="w-8 h-8 rounded-lg border border-line/80 shrink-0 shadow-inner group-hover:scale-105 transition-transform"
                                      style={{ imageRendering: "pixelated" }}
                                      loading="lazy"
                                    />
                                    <div className="min-w-0">
                                      <span className="font-heading font-extrabold text-xs text-text block truncate group-hover:text-brand-cyan transition-colors">
                                        {p.username}
                                      </span>
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className={`px-1 py-0.2 rounded text-[8.5px] font-mono font-extrabold border ${reg.badgeClass}`}>
                                          {p.region}
                                        </span>
                                        {times && (
                                          <span className="text-[8.5px] font-mono text-muted/70 truncate">
                                            {times.relative}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                                    <span
                                      className="font-mono font-black text-xs px-1.5 py-0.5 rounded-md border"
                                      style={{
                                        color: TIER_COLORS[col.lt as Tier],
                                        borderColor: `${TIER_COLORS[col.lt as Tier]}50`,
                                        backgroundColor: `${TIER_COLORS[col.lt as Tier]}18`,
                                      }}
                                    >
                                      {col.lt}
                                    </span>
                                    {entry?.score && (
                                      <span className="text-[9px] font-mono font-bold text-emerald-400 px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/25">
                                        {entry.score}
                                      </span>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
