"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Share2, ExternalLink, Calendar, Shield, Swords, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Player, KitId } from "@/lib/types";
import { KITS } from "@/lib/data";
import { TIER_POINTS, getTitle } from "@/lib/tiers";
import { RegionPill } from "@/components/icons/region-pill";
import { KitIcon } from "@/components/icons/kit-icons";
import { TierBadge } from "@/components/ui/tier-badge";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { TimeAgo } from "@/components/ui/time-ago";
import { GlowButton } from "@/components/ui/glow-button";
import { useCanUse3D } from "@/providers/ThreeProvider";

const DynamicMiniAvatar = dynamic(
  () => import("@/components/three/MiniAvatarCanvas").then((m) => m.MiniAvatarCanvas),
  { ssr: false }
);

interface PlayerProfileContentProps {
  player: Player;
}

export function PlayerProfileContent({ player }: PlayerProfileContentProps) {
  const canUse3D = useCanUse3D();
  const [activeTab, setActiveTab] = useState<"overview" | "positions" | "history">("overview");

  const title = getTitle(player.points);

  // Prepare Radar chart data for all 9 kits (0–60 scale)
  const radarData = KITS.map((k) => {
    const entry = player.kits[k.id];
    const score = entry && entry.tier !== "Unranked" ? TIER_POINTS[entry.tier] : 0;
    return {
      kit: k.name,
      score,
      fullMark: 60,
    };
  });

  const rankedKitsCount = Object.values(player.kits).filter(
    (e) => e && e.tier !== "Unranked"
  ).length;

  // Best kit calculation
  let bestKit: { kit: KitId; tier: string; points: number } | null = null;
  for (const [kitKey, entry] of Object.entries(player.kits)) {
    if (entry && entry.tier !== "Unranked") {
      const pts = TIER_POINTS[entry.tier];
      if (!bestKit || pts > bestKit.points) {
        bestKit = { kit: kitKey as KitId, tier: entry.tier, points: pts };
      }
    }
  }

  // Handle Share link
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/player/${player.username}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${player.username} · Vyntric PvP Ranks`,
          text: `Check out ${player.username}'s verified tier rankings on Vyntric Tiers.`,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Profile link copied to clipboard!");
    } catch {
      toast.error("Failed to copy profile link.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      {/* Left Column: Avatar & Core Identity */}
      <div className="lg:col-span-4 card-solid p-6 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          {/* 3D Mini Avatar / Fallback Body Render */}
          <div className="w-full h-44 rounded-xl bg-surface-2/60 border border-line flex items-center justify-center overflow-hidden relative">
            {canUse3D ? (
              <DynamicMiniAvatar username={player.username} />
            ) : (
              <div className="py-2">
                <PlayerAvatar username={player.username} mode="body" size={72} />
              </div>
            )}
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="font-heading font-black text-2xl text-text">
                {player.username}
              </h2>
              <RegionPill region={player.region} />
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
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

              {player.isTester && (
                <span className="micro-label text-[9px] bg-brand-violet/20 text-brand-violet border border-brand-violet/30 px-1.5 py-0.5 rounded">
                  COUNCIL TESTER
                </span>
              )}
            </div>
          </div>

          {/* Quick Stat Pill Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <div className="p-3 rounded-lg bg-surface-2 border border-line">
              <span className="micro-label block mb-0.5">GLOBAL RANK</span>
              <span className="font-mono text-lg font-black text-brand-hot tabular-nums">
                #{player.globalRank}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-surface-2 border border-line">
              <span className="micro-label block mb-0.5">TOTAL POINTS</span>
              <span className="font-mono text-lg font-black text-brand-cyan tabular-nums">
                {player.points}
              </span>
            </div>
          </div>

          {player.bio && (
            <p className="text-muted text-xs leading-relaxed italic border-l-2 border-brand-cyan/40 pl-3">
              &ldquo;{player.bio}&rdquo;
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-line">
          <GlowButton
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="w-full justify-center"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share Profile
          </GlowButton>

          <a
            href={`https://namemc.com/profile/${player.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 w-full h-8 rounded-lg bg-surface-2 hover:bg-surface border border-line text-muted hover:text-text font-mono text-xs transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> View in NameMC
          </a>
        </div>
      </div>

      {/* Right Column: Tabs (Overview | Positions | History) */}
      <div className="lg:col-span-8 card-solid p-6 flex flex-col space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-2 border border-line select-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "overview"
                ? "bg-surface text-brand-cyan shadow-sm border border-line"
                : "text-muted hover:text-text"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("positions")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "positions"
                ? "bg-surface text-brand-cyan shadow-sm border border-line"
                : "text-muted hover:text-text"
            }`}
          >
            Positions ({rankedKitsCount})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === "history"
                ? "bg-surface text-brand-cyan shadow-sm border border-line"
                : "text-muted hover:text-text"
            }`}
          >
            Test History ({player.testHistory.length})
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in-0 duration-200">
            {/* Radar Chart */}
            <div className="p-4 rounded-xl bg-surface-2/40 border border-line flex flex-col items-center">
              <span className="micro-label block text-muted mb-2 text-center">
                KIT COMPETENCY PROFILE (0–60 SCALE)
              </span>
              <div className="w-full h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.08)" />
                    <PolarAngleAxis
                      dataKey="kit"
                      tick={{ fill: "#8A91A6", fontSize: 11, fontFamily: "monospace" }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 60]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name={player.username}
                      dataKey="score"
                      stroke="#22D3EE"
                      fill="#7C3AED"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-surface-2 border border-line">
                <span className="micro-label block mb-1">BEST DISCIPLINE</span>
                <span className="font-mono text-sm font-bold text-brand-cyan flex items-center gap-1.5">
                  {bestKit ? (
                    <>
                      <KitIcon kit={bestKit.kit} size={14} />
                      {bestKit.kit} ({bestKit.tier})
                    </>
                  ) : (
                    "Unrated"
                  )}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-2 border border-line">
                <span className="micro-label block mb-1">KITS RANKED</span>
                <span className="font-mono text-sm font-bold text-text tabular-nums">
                  {rankedKitsCount} of 9
                </span>
              </div>
              <div className="p-3 rounded-lg bg-surface-2 border border-line col-span-2 sm:col-span-1">
                <span className="micro-label block mb-1">MEMBER SINCE</span>
                <span className="font-mono text-xs font-semibold text-muted">
                  <TimeAgo date={player.joinedAt} />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Positions Grid */}
        {activeTab === "positions" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in-0 duration-200">
            {KITS.map((kit) => {
              const entry = player.kits[kit.id];
              const isRanked = entry && entry.tier !== "Unranked";

              return (
                <div
                  key={kit.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isRanked
                      ? "bg-surface-2 border-line hover:border-line-strong transition-colors"
                      : "bg-surface-2/30 border-line/40 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg bg-surface border border-line"
                      style={{ color: kit.accentColor }}
                    >
                      <KitIcon kit={kit.id} size={20} />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-text block">
                        {kit.name}
                      </span>
                      {isRanked ? (
                        <span className="text-[10px] font-mono text-muted block">
                          Tested by {entry.tester}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-muted/60 italic block">
                          Unranked
                        </span>
                      )}
                    </div>
                  </div>

                  {isRanked && (
                    <div className="flex items-center gap-2">
                      <TierBadge tier={entry.tier} size="sm" showPeak={entry.peakTier !== entry.tier} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Test History Timeline */}
        {activeTab === "history" && (
          <div className="space-y-3 animate-in fade-in-0 duration-200 max-h-96 overflow-y-auto pr-1">
            {player.testHistory.length === 0 ? (
              <span className="text-muted text-xs font-mono italic block py-4 text-center">
                No verified test records logged yet.
              </span>
            ) : (
              player.testHistory.map((test) => (
                <div
                  key={test.id}
                  className="p-3.5 rounded-xl bg-surface-2 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface text-brand-cyan border border-line shrink-0">
                      <KitIcon kit={test.kit} size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-text">
                          {test.kit} Ladder
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            test.result === "promoted"
                              ? "text-emerald-400"
                              : test.result === "demoted"
                              ? "text-brand-hot"
                              : "text-muted"
                          }`}
                        >
                          {test.result === "promoted" ? "▲ Promoted" : test.result === "demoted" ? "▼ Demoted" : "● Retained"}
                        </span>
                      </div>
                      <span className="micro-label text-[10px] text-muted block mt-0.5">
                        TESTED BY @{test.testerUsername} · SCORE {test.score}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <TierBadge tier={test.newTier} size="sm" />
                    <span className="text-[11px] font-mono text-muted">
                      <TimeAgo date={test.timestamp} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
