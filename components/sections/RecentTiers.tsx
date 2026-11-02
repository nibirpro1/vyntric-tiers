"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Radio, Filter, RotateCcw } from "lucide-react";
import { SectionTitle } from "@/components/ui/section-title";
import { TierBadge } from "@/components/ui/tier-badge";
import { KitIcon } from "@/components/icons/kit-icons";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { TimeAgo } from "@/components/ui/time-ago";
import { Marquee } from "@/components/ui/marquee";
import { useLiveFeed } from "@/hooks/useLiveFeed";
import { useUIStore } from "@/lib/store";
import { getPlayerByUsername, KITS } from "@/lib/data";
import { formatDuration } from "@/lib/utils";
import { KitId, Result } from "@/lib/types";

interface RecentTiersProps {
  previewMode?: boolean;
}

export function RecentTiers({ previewMode = false }: RecentTiersProps) {
  const router = useRouter();
  const { setSelectedPlayer } = useUIStore();
  const { tests, isLive, setIsLive, newestId } = useLiveFeed();

  const [selectedKit, setSelectedKit] = useState<KitId | "ALL">("ALL");
  const [selectedResult, setSelectedResult] = useState<Result | "ALL">("ALL");
  const [displayCount, setDisplayCount] = useState<number>(previewMode ? 6 : 15);

  const handleOpenPlayer = (username: string) => {
    const p = getPlayerByUsername(username);
    if (p) {
      setSelectedPlayer(p);
      const params = new URLSearchParams(window.location.search);
      params.set("player", username);
      router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      if (selectedKit !== "ALL" && t.kit !== selectedKit) return false;
      if (selectedResult !== "ALL" && t.result !== selectedResult) return false;
      return true;
    });
  }, [tests, selectedKit, selectedResult]);

  const visibleTests = filteredTests.slice(0, displayCount);

  return (
    <section id="tests" className="w-full space-y-6 pt-4 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <SectionTitle
          eyebrow="COUNCIL DISPATCH"
          title="Recent Verified Tests"
          description="Live audit trail of 1v1 first-to-5 tier promotions and tier retentions."
          rightSlot={
            <div className="flex items-center gap-3">
              {/* Live Feed Toggle */}
              <button
                onClick={() => setIsLive(!isLive)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                  isLive
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/20"
                    : "bg-surface-2 text-muted border-line"
                }`}
                title="Toggle live test simulation"
              >
                <Radio className={`w-3.5 h-3.5 ${isLive ? "animate-pulse" : ""}`} />
                <span>{isLive ? "LIVE FEED ACTIVE" : "FEED PAUSED"}</span>
              </button>
            </div>
          }
        />

        {/* Auto-scrolling Marquee Ticker of 10 Latest Tests */}
        <div className="card-solid p-2.5 overflow-hidden border-line">
          <Marquee pauseOnHover={true}>
            {tests.slice(0, 10).map((t) => (
              <div
                key={t.id}
                onClick={() => handleOpenPlayer(t.playerUsername)}
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-2/70 hover:bg-surface border border-line text-xs font-mono cursor-pointer shrink-0 transition-colors"
              >
                <PlayerAvatar username={t.playerUsername} size={18} />
                <span className="font-semibold text-text">{t.playerUsername}</span>
                <span
                  className={
                    t.result === "promoted"
                      ? "text-emerald-400 font-bold"
                      : t.result === "demoted"
                      ? "text-brand-hot font-bold"
                      : "text-muted"
                  }
                >
                  {t.result === "promoted" ? "▲" : t.result === "demoted" ? "▼" : "●"}
                </span>
                <TierBadge tier={t.newTier} size="sm" />
                <div className="flex items-center gap-1 text-muted text-[11px]">
                  <KitIcon kit={t.kit} size={12} />
                  <span>{t.kit}</span>
                </div>
              </div>
            ))}
          </Marquee>
        </div>

        {/* Filters Row */}
        {!previewMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-surface-2/60 border border-line text-xs font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="micro-label text-muted">FILTER KIT:</span>
              <select
                value={selectedKit}
                onChange={(e) => setSelectedKit(e.target.value as any)}
                className="h-8 px-2.5 rounded-lg bg-surface border border-line text-text focus:outline-brand-violet cursor-pointer"
              >
                <option value="ALL">All Kits</option>
                {KITS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>

              <span className="micro-label text-muted ml-2">RESULT:</span>
              <select
                value={selectedResult}
                onChange={(e) => setSelectedResult(e.target.value as any)}
                className="h-8 px-2.5 rounded-lg bg-surface border border-line text-text focus:outline-brand-violet cursor-pointer"
              >
                <option value="ALL">All Results</option>
                <option value="promoted">Promotions Only (▲)</option>
                <option value="retained">Retentions Only (●)</option>
                <option value="demoted">Demotions Only (▼)</option>
              </select>
            </div>

            <span className="micro-label text-muted">
              {filteredTests.length} VERIFIED ENTRIES
            </span>
          </div>
        )}

        {/* Feed List Rows */}
        <div className="space-y-2.5">
          {visibleTests.map((test) => {
            const isNewest = test.id === newestId;

            return (
              <div
                key={test.id}
                onClick={() => handleOpenPlayer(test.playerUsername)}
                className={`card-solid p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all duration-300 hover:border-brand-cyan/40 hover:bg-surface-2 ${
                  isNewest
                    ? "border-brand-cyan bg-brand-cyan/10 shadow-lg shadow-brand-cyan/20 animate-in slide-in-from-top-2"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlayerAvatar username={test.playerUsername} size={32} />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-text hover:text-brand-cyan transition-colors">
                        {test.playerUsername}
                      </span>
                      <span className="text-muted text-xs font-mono">
                        {test.result === "promoted"
                          ? "gained"
                          : test.result === "demoted"
                          ? "dropped to"
                          : "retained"}
                      </span>
                      <TierBadge tier={test.newTier} size="sm" />
                      <span className="text-muted text-xs font-mono">in</span>
                      <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-text">
                        <KitIcon kit={test.kit} size={14} className="text-brand-cyan" />
                        <span>{test.kit}</span>
                      </div>
                    </div>

                    <div className="micro-label text-[10px] text-muted flex items-center gap-2">
                      <span>TESTED BY @{test.testerUsername}</span>
                      <span>·</span>
                      <span className="text-text font-bold">SCORE {test.score}</span>
                      <span>·</span>
                      <span>{test.duration || formatDuration(test.durationSec || 600)}</span>
                      <span>·</span>
                      <TimeAgo date={test.timestamp} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span
                    className={`micro-label text-[10.5px] font-bold px-2 py-0.5 rounded border ${
                      test.result === "promoted"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : test.result === "demoted"
                        ? "bg-brand-hot/10 text-brand-hot border-brand-hot/30"
                        : "bg-surface-2 text-muted border-line"
                    }`}
                  >
                    {test.result.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button or Link to /tests */}
        {previewMode ? (
          <div className="text-center pt-2">
            <a
              href="/tests"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface border border-line text-xs font-mono font-medium text-brand-cyan hover:underline transition-colors"
            >
              View Full Dispatch Log (40+ Tests) →
            </a>
          </div>
        ) : (
          displayCount < filteredTests.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setDisplayCount((c) => c + 15)}
                className="px-5 py-2.5 rounded-lg bg-surface-2 hover:bg-surface border border-line text-xs font-mono font-medium text-text transition-colors"
              >
                Load More Test Dispatches
              </button>
            </div>
          )
        )}
      </div>
    </section>
  );
}
