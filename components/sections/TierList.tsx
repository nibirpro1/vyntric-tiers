"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Fuse from "fuse.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  AlignJustify,
  LayoutGrid,
  List as ListIcon,
  Search,
  X,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { TierBadge } from "@/components/ui/tier-badge";
import { RegionPill } from "@/components/icons/region-pill";
import { KitIcon } from "@/components/icons/kit-icons";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { GlowButton } from "@/components/ui/glow-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useUIStore, useFilterUrlSync } from "@/lib/store";
import {
  PLAYERS,
  KITS,
  getPlayerByUsername,
} from "@/lib/data";
import {
  TIER_ORDER,
  TIER_COLORS,
  TIER_POINTS,
  STARTING_REGIONS,
  getTitle,
  KitId,
  Region,
  Tier,
} from "@/lib/tiers";
import { Player, PlayerKitEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface TierListProps {
  initialKit?: KitId | "ALL";
  previewMode?: boolean; // When on homepage, limits rows/cards & shows 'Open full list'
}

export function TierList({ initialKit, previewMode = false }: TierListProps) {
  useFilterUrlSync();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setKit, setRegion, setTier, setQuery, setSort, setView, resetFilters, setSelectedPlayer } =
    useUIStore();

  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasRevealedRef = useRef(false);

  // Pagination for List view
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = previewMode ? 10 : 25;

  // Active kit: if "ALL" in rows or columns view, default to "Sword"
  const activeKit: KitId = filters.kit === "ALL" ? "Sword" : (filters.kit as KitId);

  // Debounce search query 150ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 150);
    return () => clearTimeout(handler);
  }, [filters.query]);

  // Read URL query parameter for selected player modal
  useEffect(() => {
    if (!searchParams) return;
    const playerParam = searchParams.get("player");
    if (playerParam) {
      const p = getPlayerByUsername(playerParam);
      if (p) setSelectedPlayer(p);
    }
  }, [searchParams, setSelectedPlayer]);

  // Stagger animation on cards
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !containerRef.current) return;

    const cards = containerRef.current.querySelectorAll(".stagger-card");
    if (cards.length === 0) return;

    gsap.fromTo(
      cards,
      { opacity: 0, scale: 0.96, filter: "blur(4px)" },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        stagger: 0.02,
        duration: 0.35,
        ease: "power2.out",
      }
    );
  }, [filters.view, activeKit, filters.region, filters.tier]);

  // Count active players per kit
  const kitCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: PLAYERS.length };
    KITS.forEach((k) => {
      counts[k.id] = PLAYERS.filter((p) => p.kits[k.id]?.tier && p.kits[k.id]?.tier !== "Unranked").length;
    });
    return counts;
  }, []);

  // Fuse.js setup for fuzzy username search
  const fuse = useMemo(() => {
    return new Fuse(PLAYERS, {
      keys: ["username"],
      threshold: 0.32,
    });
  }, []);

  // Filter and sort players
  const processedPlayers = useMemo(() => {
    let list: Player[] = [...PLAYERS];

    // Search filter
    if (debouncedQuery.trim()) {
      list = fuse.search(debouncedQuery.trim()).map((res) => res.item);
    }

    // Region filter
    if (filters.region !== "ALL") {
      list = list.filter((p) => p.region === filters.region);
    }

    // Kit filter in List view
    if (filters.kit !== "ALL") {
      list = list.filter((p) => {
        const entry = p.kits[filters.kit as KitId];
        return entry && entry.tier !== "Unranked";
      });
    }

    // Tier filter
    if (filters.tier !== "ALL") {
      if (filters.kit !== "ALL") {
        list = list.filter((p) => p.kits[filters.kit as KitId]?.tier === filters.tier);
      } else {
        list = list.filter((p) =>
          Object.values(p.kits).some((k) => k?.tier === filters.tier)
        );
      }
    }

    // Sort order
    list.sort((a, b) => {
      switch (filters.sort) {
        case "points":
          return b.points - a.points;
        case "alphabetical":
          return a.username.localeCompare(b.username);
        case "recent":
          return (
            new Date(b.lastTestedAt).getTime() - new Date(a.lastTestedAt).getTime()
          );
        case "rank":
        default:
          return a.globalRank - b.globalRank;
      }
    });

    return list;
  }, [debouncedQuery, filters.region, filters.kit, filters.tier, filters.sort, fuse]);

  // Columns/Rows data grouping for the active kit
  const tierBuckets = useMemo(() => {
    const buckets: Record<Tier, { player: Player; entry: PlayerKitEntry }[]> = {
      HT1: [], LT1: [], HT2: [], LT2: [], HT3: [], LT3: [], HT4: [], LT4: [], HT5: [], LT5: [], Unranked: []
    };

    processedPlayers.forEach((player) => {
      const entry = player.kits[activeKit];
      if (entry && entry.tier !== "Unranked") {
        buckets[entry.tier].push({ player, entry });
      }
    });

    return buckets;
  }, [processedPlayers, activeKit]);

  const handleOpenPlayer = (player: Player) => {
    setSelectedPlayer(player);
    const params = new URLSearchParams(window.location.search);
    params.set("player", player.username);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  const paginatedPlayers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedPlayers.slice(start, start + pageSize);
  }, [processedPlayers, currentPage, pageSize]);

  const totalPages = Math.ceil(processedPlayers.length / pageSize);

  const hasActiveFilters =
    filters.region !== "ALL" ||
    filters.tier !== "ALL" ||
    debouncedQuery.trim().length > 0 ||
    filters.sort !== "rank";

  return (
    <section id="tierlist" className="w-full space-y-6 pt-4 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <SectionTitle
          eyebrow="OFFICIAL MINECRAFT PVP TIERS"
          title={
            filters.view === "list"
              ? "Overall Combat Standings"
              : `${activeKit} Tier List`
          }
          description={
            filters.view === "list"
              ? "Complete global leaderboard across all recognized Minecraft PvP gamemodes."
              : `Verified Tier 1 through Tier 5 competitive brackets for the ${activeKit} ladder.`
          }
          rightSlot={
            /* View Mode Toggle: Rows (Vyntric) | Columns | Table */
            <div className="inline-flex items-center p-1 rounded-xl bg-surface-2 border border-line select-none shadow-sm">
              <button
                onClick={() => setView("rows")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all",
                  filters.view === "rows"
                    ? "bg-surface text-brand-cyan shadow-sm border border-line"
                    : "text-muted hover:text-text"
                )}
                title="Vyntric Rows View"
              >
                <AlignJustify className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tier Rows</span>
              </button>
              <button
                onClick={() => setView("columns")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all",
                  filters.view === "columns"
                    ? "bg-surface text-brand-cyan shadow-sm border border-line"
                    : "text-muted hover:text-text"
                )}
                title="Columns Matrix View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all",
                  filters.view === "list"
                    ? "bg-surface text-brand-cyan shadow-sm border border-line"
                    : "text-muted hover:text-text"
                )}
                title="Full Table View"
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          }
        />

        {/* ========================================================= */}
        {/* GAMEMODE SELECTOR BAR (Vyntric Top Gamemodes Bar)        */}
        {/* ========================================================= */}
        <div className="card-solid p-2.5 sm:p-3 border border-line shadow-lg bg-surface/90 backdrop-blur-xl">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => {
                setKit("ALL");
                setView("list");
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold shrink-0 transition-all duration-200 border",
                filters.kit === "ALL" && filters.view === "list"
                  ? "bg-brand-violet text-white border-brand-violet/60 shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                  : "bg-surface-2 text-muted hover:text-text border-line hover:border-line-strong"
              )}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Overall</span>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-muted font-normal">
                {kitCounts.ALL}
              </span>
            </button>

            {KITS.map((k) => {
              const isSelected = filters.kit === k.id || (filters.kit === "ALL" && activeKit === k.id && filters.view !== "list");
              const count = kitCounts[k.id] || 0;

              return (
                <button
                  key={k.id}
                  onClick={() => {
                    setKit(k.id);
                    if (filters.view === "list") setView("rows");
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold shrink-0 transition-all duration-200 border",
                    isSelected
                      ? "bg-brand-cyan/15 text-brand-cyan border-brand-cyan/50 shadow-[0_0_15px_rgba(34,211,238,0.25)]"
                      : "bg-surface-2 text-muted hover:text-text border-line hover:border-line-strong hover:bg-surface"
                  )}
                >
                  <KitIcon kit={k.id} size={16} />
                  <span>{k.name}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-normal",
                      isSelected ? "bg-brand-cyan/20 text-brand-cyan" : "bg-black/30 text-muted"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COMPACT STICKY FILTER BAR                                 */}
        {/* ========================================================= */}
        <div className="sticky top-14 sm:top-18 z-30 card-solid p-3 shadow-xl backdrop-blur-xl bg-surface/95 border-line space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Search Input with Debounce */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search player IGN..."
                className="w-full h-8.5 pl-8.5 pr-8 bg-surface-2 rounded-lg border border-line text-xs font-mono text-text placeholder:text-muted focus:outline-2 focus:outline-brand-violet transition-colors"
              />
              {filters.query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-text p-0.5"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Region Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider mr-1 hidden sm:inline">
                Region:
              </span>
              <button
                onClick={() => setRegion("ALL")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[10.5px] font-mono uppercase font-semibold transition-colors",
                  filters.region === "ALL"
                    ? "bg-white/10 text-text border border-white/20"
                    : "text-muted hover:text-text hover:bg-white/[0.04]"
                )}
              >
                ALL
              </button>
              {STARTING_REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10.5px] font-mono font-semibold transition-colors",
                    filters.region === r
                      ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40"
                      : "text-muted hover:text-text hover:bg-white/[0.04]"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Sort & Reset */}
            <div className="flex items-center gap-2">
              <select
                value={filters.sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="h-8.5 px-2.5 rounded-lg bg-surface-2 border border-line text-xs font-mono text-text focus:outline-2 focus:outline-brand-violet cursor-pointer"
              >
                <option value="rank">Sort: Global Rank</option>
                <option value="points">Sort: Total Points</option>
                <option value="recent">Sort: Last Tested</option>
                <option value="alphabetical">Sort: Name (A-Z)</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 h-8.5 px-2.5 rounded-lg bg-brand-hot/15 text-brand-hot hover:bg-brand-hot/25 border border-brand-hot/30 text-xs font-mono transition-colors"
                  title="Reset all filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Mode Rendering */}
        <div ref={containerRef}>
          {processedPlayers.length === 0 ? (
            <EmptyState
              title="No combatants found"
              description="No player matched your filter criteria in this ladder. Reset filters or try another search."
              actionText="Reset Filters"
              onAction={resetFilters}
            />
          ) : filters.view === "rows" ? (
            /* ========================================================= */
            /* A) MCTIERS ROWS VIEW: Tier 1 -> Tier 5 Wide Rows         */
            /* ========================================================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <KitIcon kit={activeKit} size={20} className="text-brand-cyan" />
                  <span className="font-heading font-bold text-lg text-text">
                    {activeKit} Tier List
                  </span>
                  <span className="text-xs font-mono text-muted">
                    ({kitCounts[activeKit] || 0} combatants ranked)
                  </span>
                </div>
                <span className="micro-label text-[10px] text-muted hidden sm:inline">
                  CLICK COMBATANT FOR FULL MATCH PROFILE
                </span>
              </div>

              {/* 5 Stacked Tier Rows */}
              <div className="space-y-3.5">
                {[1, 2, 3, 4, 5].map((bracketNum) => {
                  const htKey = `HT${bracketNum}` as Tier;
                  const ltKey = `LT${bracketNum}` as Tier;
                  const htPlayers = tierBuckets[htKey] || [];
                  const ltPlayers = tierBuckets[ltKey] || [];
                  const totalInBracket = htPlayers.length + ltPlayers.length;

                  // Primary tier color (based on HT)
                  const tierColor = TIER_COLORS[htKey];
                  const ltColor = TIER_COLORS[ltKey];

                  return (
                    <div
                      key={bracketNum}
                      className="card-solid border border-line/80 overflow-hidden shadow-lg transition-all duration-200 hover:border-line-strong"
                    >
                      <div className="flex flex-col md:flex-row items-stretch">
                        {/* Left Banner: Tier Label Column */}
                        <div
                          className="md:w-32 lg:w-36 shrink-0 p-3 sm:p-4 flex flex-row md:flex-col items-center justify-between md:justify-center text-center border-b md:border-b-0 md:border-r border-line/60 relative"
                          style={{
                            background: `linear-gradient(135deg, ${tierColor}18 0%, ${tierColor}06 100%)`,
                          }}
                        >
                          <div className="flex items-center md:flex-col gap-1.5 md:gap-1">
                            {bracketNum === 1 && (
                              <Trophy className="w-5 h-5 text-[#FBBF24] fill-amber-400/40 shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                            )}
                            {bracketNum === 2 && (
                              <Trophy className="w-5 h-5 text-[#E2E8F0] fill-slate-300/40 shrink-0 drop-shadow-[0_0_8px_rgba(226,232,240,0.3)]" />
                            )}
                            {bracketNum === 3 && (
                              <Trophy className="w-5 h-5 text-[#CD7F32] fill-orange-500/40 shrink-0 drop-shadow-[0_0_8px_rgba(205,127,50,0.3)]" />
                            )}
                            <span
                              className="font-heading font-black text-2xl sm:text-3xl leading-none tracking-tight"
                              style={{ color: tierColor }}
                            >
                              Tier {bracketNum}
                            </span>
                            <span className="micro-label text-[9.5px] text-muted">
                              +{TIER_POINTS[htKey]} / +{TIER_POINTS[ltKey]} PTS
                            </span>
                          </div>

                          <div className="mt-0 md:mt-2.5">
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                              style={{
                                backgroundColor: `${tierColor}20`,
                                color: tierColor,
                                border: `1px solid ${tierColor}40`,
                              }}
                            >
                              {totalInBracket} {totalInBracket === 1 ? "Player" : "Players"}
                            </span>
                          </div>
                        </div>

                        {/* Right Area: Stacked HT and LT Sub-Tiers */}
                        <div className="flex-1 flex flex-col divide-y divide-line/60">
                          {/* 1. High Tier (HT) Sub-Row */}
                          <div className="p-3 sm:p-4 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase tracking-wider"
                                  style={{
                                    backgroundColor: `${tierColor}22`,
                                    color: tierColor,
                                    border: `1px solid ${tierColor}44`,
                                  }}
                                >
                                  HIGH TIER {bracketNum} ({htKey})
                                </span>
                                <span className="text-[10px] font-mono text-muted">
                                  +{TIER_POINTS[htKey]} PTS
                                </span>
                              </div>
                              <span className="micro-label text-[9.5px] text-muted">
                                {htPlayers.length} {htPlayers.length === 1 ? "combatant" : "combatants"}
                              </span>
                            </div>

                            {/* Player Chips Grid */}
                            <div className="flex flex-wrap gap-2 sm:gap-2.5 min-h-[44px] items-center">
                              {htPlayers.length === 0 ? (
                                <span className="text-xs font-mono text-muted/50 italic py-1.5">
                                  No active combatants in {htKey}
                                </span>
                              ) : (
                                htPlayers.map(({ player, entry }) => (
                                  <button
                                    key={player.id}
                                    onClick={() => handleOpenPlayer(player)}
                                    className="stagger-card group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface border border-line/80 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer select-none text-left"
                                    style={{
                                      // Dynamic hover border & shadow based on tier color
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = tierColor;
                                      e.currentTarget.style.boxShadow = `0 0 16px -2px ${tierColor}66`;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = "";
                                      e.currentTarget.style.boxShadow = "";
                                    }}
                                    title={`View ${player.username}'s combat card (${player.points} pts)`}
                                  >
                                    <PlayerAvatar
                                      username={player.username}
                                      size={30}
                                      className="rounded-lg shadow-sm group-hover:scale-105 transition-transform shrink-0"
                                    />
                                    <div className="flex flex-col min-w-0 pr-1">
                                      <span className="font-mono text-xs font-bold text-text group-hover:text-brand-cyan transition-colors truncate max-w-[125px]">
                                        {player.username}
                                      </span>
                                      <span className="text-[10px] font-mono text-muted tabular-nums">
                                        {player.points} pts
                                      </span>
                                    </div>
                                    <RegionPill region={player.region} />
                                  </button>
                                ))
                              )}
                            </div>
                          </div>

                          {/* 2. Low Tier (LT) Sub-Row */}
                          <div className="p-3 sm:p-4 space-y-2.5 bg-black/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase tracking-wider"
                                  style={{
                                    backgroundColor: `${ltColor}22`,
                                    color: ltColor,
                                    border: `1px solid ${ltColor}44`,
                                  }}
                                >
                                  LOW TIER {bracketNum} ({ltKey})
                                </span>
                                <span className="text-[10px] font-mono text-muted">
                                  +{TIER_POINTS[ltKey]} PTS
                                </span>
                              </div>
                              <span className="micro-label text-[9.5px] text-muted">
                                {ltPlayers.length} {ltPlayers.length === 1 ? "combatant" : "combatants"}
                              </span>
                            </div>

                            {/* Player Chips Grid */}
                            <div className="flex flex-wrap gap-2 sm:gap-2.5 min-h-[44px] items-center">
                              {ltPlayers.length === 0 ? (
                                <span className="text-xs font-mono text-muted/50 italic py-1.5">
                                  No active combatants in {ltKey}
                                </span>
                              ) : (
                                ltPlayers.map(({ player, entry }) => (
                                  <button
                                    key={player.id}
                                    onClick={() => handleOpenPlayer(player)}
                                    className="stagger-card group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface border border-line/80 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer select-none text-left"
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = ltColor;
                                      e.currentTarget.style.boxShadow = `0 0 16px -2px ${ltColor}66`;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = "";
                                      e.currentTarget.style.boxShadow = "";
                                    }}
                                    title={`View ${player.username}'s combat card (${player.points} pts)`}
                                  >
                                    <PlayerAvatar
                                      username={player.username}
                                      size={30}
                                      className="rounded-lg shadow-sm group-hover:scale-105 transition-transform shrink-0"
                                    />
                                    <div className="flex flex-col min-w-0 pr-1">
                                      <span className="font-mono text-xs font-bold text-text group-hover:text-brand-cyan transition-colors truncate max-w-[125px]">
                                        {player.username}
                                      </span>
                                      <span className="text-[10px] font-mono text-muted tabular-nums">
                                        {player.points} pts
                                      </span>
                                    </div>
                                    <RegionPill region={player.region} />
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {previewMode && (
                <div className="text-center pt-4">
                  <GlowButton variant="outline" size="sm" asChild>
                    <a href={`/tierlist?kit=${activeKit}`}>
                      Open Full {activeKit} Tier List ({processedPlayers.length} combatants) →
                    </a>
                  </GlowButton>
                </div>
              )}
            </div>
          ) : filters.view === "columns" ? (
            /* ========================================================= */
            /* B) COLUMNS MATRIX VIEW: 5 Vertical Brackets               */
            /* ========================================================= */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KitIcon kit={activeKit} size={20} className="text-brand-cyan" />
                  <span className="font-heading font-bold text-lg text-text">
                    {activeKit} Bracket Matrix
                  </span>
                </div>
                <span className="micro-label text-muted">
                  CLICK COMBATANT FOR FULL MATCH PROFILE
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                {[1, 2, 3, 4, 5].map((bracketNum) => {
                  const htKey = `HT${bracketNum}` as Tier;
                  const ltKey = `LT${bracketNum}` as Tier;
                  const htPlayers = tierBuckets[htKey] || [];
                  const ltPlayers = tierBuckets[ltKey] || [];

                  return (
                    <div
                      key={bracketNum}
                      className="card-solid p-3 space-y-3 border-line flex flex-col justify-between"
                    >
                      {/* Sub-Column 1: High Tier */}
                      <div className="space-y-2">
                        <div
                          className="flex items-center justify-between pb-1.5 border-b"
                          style={{ borderColor: `${TIER_COLORS[htKey]}40` }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: TIER_COLORS[htKey] }}
                            />
                            <span
                              className="font-mono text-xs font-bold"
                              style={{ color: TIER_COLORS[htKey] }}
                            >
                              {htKey}
                            </span>
                          </div>
                          <span className="micro-label text-[9px] text-muted">
                            +{TIER_POINTS[htKey]} PTS · {htPlayers.length}
                          </span>
                        </div>

                        <div className="space-y-1.5 min-h-[90px]">
                          {htPlayers.length === 0 ? (
                            <span className="text-[11px] font-mono text-muted/60 italic block py-2">
                              No combatants
                            </span>
                          ) : (
                            htPlayers
                              .slice(0, previewMode ? 4 : undefined)
                              .map(({ player, entry }) => (
                                <div
                                  key={player.id}
                                  onClick={() => handleOpenPlayer(player)}
                                  className="stagger-card p-2 rounded-lg bg-surface-2 hover:bg-surface border border-line hover:border-brand-cyan/50 cursor-pointer flex items-center justify-between gap-2 transition-all duration-150 group"
                                  style={{ height: 48 }}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <PlayerAvatar
                                      username={player.username}
                                      size={26}
                                      className="transition-transform duration-200 group-hover:scale-110"
                                    />
                                    <div className="truncate">
                                      <span className="font-mono text-xs font-semibold text-text group-hover:text-brand-cyan truncate block">
                                        {player.username}
                                      </span>
                                      <span className="text-[10px] font-mono text-muted block">
                                        {player.points} pts
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {entry.peakTier !== entry.tier && (
                                      <span className="micro-label text-[8px] bg-white/5 border border-white/10 px-1 rounded text-muted">
                                        PEAK
                                      </span>
                                    )}
                                    <RegionPill region={player.region} />
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Sub-Column 2: Low Tier */}
                      <div className="space-y-2 pt-2 border-t border-line/60">
                        <div
                          className="flex items-center justify-between pb-1.5 border-b"
                          style={{ borderColor: `${TIER_COLORS[ltKey]}40` }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: TIER_COLORS[ltKey] }}
                            />
                            <span
                              className="font-mono text-xs font-bold"
                              style={{ color: TIER_COLORS[ltKey] }}
                            >
                              {ltKey}
                            </span>
                          </div>
                          <span className="micro-label text-[9px] text-muted">
                            +{TIER_POINTS[ltKey]} PTS · {ltPlayers.length}
                          </span>
                        </div>

                        <div className="space-y-1.5 min-h-[90px]">
                          {ltPlayers.length === 0 ? (
                            <span className="text-[11px] font-mono text-muted/60 italic block py-2">
                              No combatants
                            </span>
                          ) : (
                            ltPlayers
                              .slice(0, previewMode ? 4 : undefined)
                              .map(({ player, entry }) => (
                                <div
                                  key={player.id}
                                  onClick={() => handleOpenPlayer(player)}
                                  className="stagger-card p-2 rounded-lg bg-surface-2 hover:bg-surface border border-line hover:border-brand-cyan/50 cursor-pointer flex items-center justify-between gap-2 transition-all duration-150 group"
                                  style={{ height: 48 }}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <PlayerAvatar
                                      username={player.username}
                                      size={26}
                                      className="transition-transform duration-200 group-hover:scale-110"
                                    />
                                    <div className="truncate">
                                      <span className="font-mono text-xs font-semibold text-text group-hover:text-brand-cyan truncate block">
                                        {player.username}
                                      </span>
                                      <span className="text-[10px] font-mono text-muted block">
                                        {player.points} pts
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {entry.peakTier !== entry.tier && (
                                      <span className="micro-label text-[8px] bg-white/5 border border-white/10 px-1 rounded text-muted">
                                        PEAK
                                      </span>
                                    )}
                                    <RegionPill region={player.region} />
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* C) LIST VIEW: Overall Ranking Table                       */
            /* ========================================================= */
            <div className="space-y-4">
              <div className="card-solid p-0 overflow-hidden border-line">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-2/95 border-b border-line text-muted sticky top-0 z-10">
                      <tr>
                        <th className="py-3 px-4 font-mono text-xs font-semibold">#</th>
                        <th className="py-3 px-4 font-mono text-xs font-semibold">COMBATANT</th>
                        <th className="py-3 px-4 font-mono text-xs font-semibold">TITLE</th>
                        <th className="py-3 px-4 font-mono text-xs font-semibold">REGION</th>
                        <th className="py-3 px-4 font-mono text-xs font-semibold">ACTIVE KITS</th>
                        <th className="py-3 px-4 font-mono text-xs font-semibold text-right">POINTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {paginatedPlayers.map((player) => {
                        const title = getTitle(player.points);
                        const playerKits = Object.entries(player.kits).filter(
                          ([_, entry]) => entry && entry.tier !== "Unranked"
                        ) as [KitId, PlayerKitEntry][];

                        return (
                          <tr
                            key={player.id}
                            onClick={() => handleOpenPlayer(player)}
                            className="stagger-card hover:bg-surface-2/60 cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-xs tabular-nums">
                              {player.globalRank === 1 ? (
                                <span className="text-brand-hot font-black">#1</span>
                              ) : player.globalRank === 2 ? (
                                <span className="text-amber-400 font-bold">#2</span>
                              ) : player.globalRank === 3 ? (
                                <span className="text-brand-cyan font-bold">#3</span>
                              ) : (
                                <span className="text-muted">#{player.globalRank}</span>
                              )}
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <PlayerAvatar username={player.username} size={28} />
                                <div>
                                  <span className="font-mono font-semibold text-text hover:text-brand-cyan transition-colors">
                                    {player.username}
                                  </span>
                                  {player.isTester && (
                                    <span className="ml-2 micro-label text-[9px] bg-brand-violet/20 text-brand-violet border border-brand-violet/30 px-1 py-0.5 rounded">
                                      STAFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold px-2 py-0.5 rounded border uppercase"
                                style={{
                                  color: title.color,
                                  backgroundColor: title.badgeBg,
                                  borderColor: `${title.color}33`,
                                }}
                              >
                                {title.name}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <RegionPill region={player.region} />
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {playerKits.slice(0, 5).map(([kit, entry]) => (
                                  <div
                                    key={kit}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-2 border border-line"
                                    title={`${kit}: ${entry.tier}`}
                                  >
                                    <KitIcon kit={kit} size={12} />
                                    <TierBadge tier={entry.tier} size="sm" />
                                  </div>
                                ))}
                                {playerKits.length > 5 && (
                                  <span className="text-[10px] font-mono text-muted">
                                    +{playerKits.length - 5}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-right font-mono font-bold text-text tabular-nums text-sm">
                              {player.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              {!previewMode && totalPages > 1 && (
                <div className="flex items-center justify-between text-xs font-mono text-muted pt-2">
                  <span>
                    Showing {(currentPage - 1) * pageSize + 1}–
                    {Math.min(currentPage * pageSize, processedPlayers.length)} of{" "}
                    {processedPlayers.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface border border-line disabled:opacity-40 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-2 text-text font-bold">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface border border-line disabled:opacity-40 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
