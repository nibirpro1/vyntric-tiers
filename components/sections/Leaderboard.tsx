"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { Trophy, ArrowUp, ArrowDown, Minus, Crown, ArrowUpRight } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { RegionPill } from "@/components/icons/region-pill";
import { KitIcon } from "@/components/icons/kit-icons";
import { TierBadge } from "@/components/ui/tier-badge";
import { useUIStore } from "@/lib/store";
import { PLAYERS, KITS } from "@/lib/data";
import { STARTING_REGIONS, TIER_POINTS, getTitle, KitId, Region } from "@/lib/tiers";
import { Player, PlayerKitEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  previewMode?: boolean;
}

export function Leaderboard({ previewMode = false }: LeaderboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSelectedPlayer } = useUIStore();

  const [activeTab, setActiveTab] = useState<KitId | "ALL">("ALL");
  const [selectedRegion, setSelectedRegion] = useState<Region | "ALL">("ALL");
  const podiumRef = useRef<HTMLDivElement | null>(null);
  const confettiFiredRef = useRef<boolean>(false);

  // Confetti burst once when podium enters viewport
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || confettiFiredRef.current || !podiumRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !confettiFiredRef.current) {
          confettiFiredRef.current = true;
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#7C3AED", "#22D3EE", "#FF2D55"],
            });
          } catch {}
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(podiumRef.current);
    return () => observer.disconnect();
  }, []);

  const handleOpenPlayer = (player: Player) => {
    setSelectedPlayer(player);
    const params = new URLSearchParams(window.location.search);
    params.set("player", player.username);
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  // Re-rank players depending on activeTab (overall or specific kit points)
  const rankedPlayers = useMemo(() => {
    let list = [...PLAYERS];

    if (selectedRegion !== "ALL") {
      list = list.filter((p) => p.region === selectedRegion);
    }

    if (activeTab === "ALL") {
      list.sort((a, b) => b.points - a.points);
    } else {
      list = list.filter((p) => {
        const entry = p.kits[activeTab];
        return entry && entry.tier !== "Unranked";
      });
      list.sort((a, b) => {
        const ptsA = TIER_POINTS[a.kits[activeTab]?.tier || "Unranked"];
        const ptsB = TIER_POINTS[b.kits[activeTab]?.tier || "Unranked"];
        if (ptsB !== ptsA) return ptsB - ptsA;
        return b.points - a.points;
      });
    }

    return list;
  }, [activeTab, selectedRegion]);

  const top3 = rankedPlayers.slice(0, 3);
  const rest = previewMode ? rankedPlayers.slice(3, 10) : rankedPlayers.slice(3);

  const openedUsername = searchParams?.get("player");

  return (
    <section id="leaderboard" className="w-full space-y-8 pt-4 pb-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionTitle
          eyebrow="GLOBAL HALL OF FAME"
          title="Combat Standings & Top Tier Podium"
          description="Real-time ladder calculated strictly from points earned through verified testing."
          rightSlot={
            <div className="flex items-center gap-2">
              <span className="micro-label text-muted hidden sm:inline">REGION:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as any)}
                className="h-8 px-2.5 rounded-lg bg-surface-2 border border-line text-xs font-mono text-text focus:outline-brand-violet cursor-pointer"
              >
                <option value="ALL">Global (All Regions)</option>
                {STARTING_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        {/* Kit Re-Ranking Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 border-b border-line">
          <button
            onClick={() => setActiveTab("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-mono font-medium shrink-0 transition-colors",
              activeTab === "ALL"
                ? "bg-brand-violet text-white"
                : "bg-surface-2 text-muted hover:text-text border border-line"
            )}
          >
            Overall Ladder
          </button>
          {KITS.map((k) => (
            <button
              key={k.id}
              onClick={() => setActiveTab(k.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium shrink-0 transition-colors",
                activeTab === k.id
                  ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40"
                  : "bg-surface-2 text-muted hover:text-text border border-line"
              )}
            >
              <KitIcon kit={k.id} size={14} />
              <span>{k.name}</span>
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* TOP 3 PODIUM                                             */}
        {/* ========================================================= */}
        {top3.length >= 3 && (
          <div ref={podiumRef} className="pt-4 pb-2">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto">
              {/* #2 Left Podium */}
              <div
                onClick={() => handleOpenPlayer(top3[1])}
                className="card-solid p-4 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] border-amber-400/40 bg-surface-2/60 relative group"
                style={{ height: 250 }}
              >
                <div className="space-y-2">
                  <div className="relative">
                    <PlayerAvatar username={top3[1].username} size={48} className="border-2 border-amber-400" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-bg text-[10px] font-mono font-black flex items-center justify-center">
                      2
                    </span>
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm text-text block truncate max-w-[120px]">
                      {top3[1].username}
                    </span>
                    <RegionPill region={top3[1].region} className="mt-1" />
                  </div>
                </div>

                <div className="w-full pt-3 border-t border-line/60">
                  <span className="font-mono text-base font-black text-amber-400 tabular-nums">
                    {activeTab === "ALL"
                      ? top3[1].points
                      : TIER_POINTS[top3[1].kits[activeTab]?.tier || "Unranked"]}
                  </span>
                  <span className="micro-label text-[9px] block text-muted">PTS</span>
                </div>
              </div>

              {/* #1 Center Podium (Tallest) */}
              <div
                onClick={() => handleOpenPlayer(top3[0])}
                className="card-solid p-4 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] border-brand-hot shadow-xl shadow-brand-hot/20 bg-surface-2 relative group"
                style={{ height: 300 }}
              >
                <Crown className="w-5 h-5 text-brand-hot animate-bounce" />

                <div className="space-y-2">
                  <div className="relative">
                    <PlayerAvatar username={top3[0].username} size={58} className="border-2 border-brand-hot" />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-brand-hot text-white text-xs font-mono font-black flex items-center justify-center shadow-lg">
                      1
                    </span>
                  </div>
                  <div>
                    <span className="font-heading font-extrabold text-base text-text block truncate max-w-[140px]">
                      {top3[0].username}
                    </span>
                    <RegionPill region={top3[0].region} className="mt-1" />
                  </div>
                </div>

                <div className="w-full pt-3 border-t border-line/60">
                  <span className="font-mono text-xl font-black text-brand-hot tabular-nums">
                    {activeTab === "ALL"
                      ? top3[0].points
                      : TIER_POINTS[top3[0].kits[activeTab]?.tier || "Unranked"]}
                  </span>
                  <span className="micro-label text-[9px] block text-muted">APEX POINTS</span>
                </div>
              </div>

              {/* #3 Right Podium */}
              <div
                onClick={() => handleOpenPlayer(top3[2])}
                className="card-solid p-4 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] border-brand-cyan/40 bg-surface-2/60 relative group"
                style={{ height: 220 }}
              >
                <div className="space-y-2">
                  <div className="relative">
                    <PlayerAvatar username={top3[2].username} size={44} className="border-2 border-brand-cyan" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-cyan text-bg text-[10px] font-mono font-black flex items-center justify-center">
                      3
                    </span>
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm text-text block truncate max-w-[120px]">
                      {top3[2].username}
                    </span>
                    <RegionPill region={top3[2].region} className="mt-1" />
                  </div>
                </div>

                <div className="w-full pt-3 border-t border-line/60">
                  <span className="font-mono text-base font-black text-brand-cyan tabular-nums">
                    {activeTab === "ALL"
                      ? top3[2].points
                      : TIER_POINTS[top3[2].kits[activeTab]?.tier || "Unranked"]}
                  </span>
                  <span className="micro-label text-[9px] block text-muted">PTS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* REST OF LEADERBOARD TABLE (#4 -> #60)                    */}
        {/* ========================================================= */}
        <div className="card-solid p-0 overflow-hidden border-line">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2/95 border-b border-line text-muted sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 font-mono text-xs font-semibold">RANK</th>
                  <th className="py-3 px-4 font-mono text-xs font-semibold">COMBATANT</th>
                  <th className="py-3 px-4 font-mono text-xs font-semibold">TITLE</th>
                  <th className="py-3 px-4 font-mono text-xs font-semibold">REGION</th>
                  <th className="py-3 px-4 font-mono text-xs font-semibold">TREND</th>
                  <th className="py-3 px-4 font-mono text-xs font-semibold">SPECIALTIES</th>
                  <th className="py-3 px-4 font-mono text-xs font-semibold text-right">POINTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rest.map((player, idx) => {
                  const rank = idx + 4;
                  const isOpened = openedUsername === player.username;
                  const title = getTitle(player.points);

                  // Trend arrow derived from recent test count
                  const isUp = player.testHistory.some((t) => t.result === "promoted");
                  const isDown = player.testHistory.some((t) => t.result === "demoted");

                  // Top 3 kits
                  const topKits = Object.entries(player.kits)
                    .filter(([_, e]) => e && e.tier !== "Unranked")
                    .slice(0, 3) as [KitId, PlayerKitEntry][];

                  return (
                    <tr
                      key={player.id}
                      onClick={() => handleOpenPlayer(player)}
                      className={cn(
                        "hover:bg-surface-2/60 cursor-pointer transition-colors",
                        isOpened && "bg-brand-cyan/10 border-l-2 border-brand-cyan"
                      )}
                      data-cursor="view"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-xs text-muted tabular-nums">
                        #{rank}
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

                      <td className="py-3 px-4 font-mono text-xs">
                        {isUp ? (
                          <span className="inline-flex items-center text-emerald-400 font-bold gap-0.5">
                            <ArrowUp className="w-3 h-3" /> +1
                          </span>
                        ) : isDown ? (
                          <span className="inline-flex items-center text-brand-hot font-bold gap-0.5">
                            <ArrowDown className="w-3 h-3" /> -1
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-muted gap-0.5">
                            <Minus className="w-3 h-3" /> 0
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {topKits.map(([k, entry]) => (
                            <div
                              key={k}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-2 border border-line"
                            >
                              <KitIcon kit={k} size={12} />
                              <TierBadge tier={entry.tier} size="sm" />
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-text tabular-nums text-sm">
                        {activeTab === "ALL"
                          ? player.points
                          : TIER_POINTS[player.kits[activeTab]?.tier || "Unranked"]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {previewMode && (
          <div className="text-center pt-2">
            <a
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-surface-2 hover:bg-surface border border-line text-xs font-mono font-medium text-brand-cyan hover:underline transition-colors"
            >
              View Full Standings (Top 60 Ranked Combatants) →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
