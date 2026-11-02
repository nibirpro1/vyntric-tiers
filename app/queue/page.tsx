"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShieldAlert,
  Clock,
  Sparkles,
  Disc as DiscordIcon,
  RefreshCw,
  ArrowRight,
  Radio,
} from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { SectionTitle } from "@/components/ui/section-title";
import { KITS, KitMeta } from "@vyntric/shared";
import { GamemodeIcon } from "@/components/icons/GamemodeIcons";
import { SITE_CONFIG } from "@/lib/site";
import { useUIStore } from "@/lib/store";

interface QueueData {
  totalWaiting: number;
  onlineTestersCount: number;
  testers: Array<{
    id?: string;
    ign: string;
    role: string;
    status: string;
    testsCompleted: number;
    specialties: string[];
  }>;
  queues: Record<string, any[]>;
}

export default function QueuePage() {
  const [data, setData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeTestersCount, waitingQueueCount } = useUIStore();

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/queue");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalWaiting = data?.totalWaiting ?? waitingQueueCount ?? 0;
  const onlineTesters = data?.onlineTestersCount ?? activeTestersCount ?? 3;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Mission */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/15 border border-brand-violet/30 text-brand-cyan text-xs font-mono">
            <Radio className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            <span>REAL-TIME DISCORD QUEUE MONITOR</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-text tracking-tight">
            Live Testing Queues
          </h1>
          <p className="text-muted text-sm sm:text-base max-w-2xl">
            Combatants currently queued for official first-to-5 duels. Join on Discord to claim your position on any ladder.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <GlowButton variant="outline" size="sm" onClick={fetchQueue} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </GlowButton>
          <GlowButton variant="primary" size="sm" asChild>
            <a href={SITE_CONFIG.links.discord} target="_blank" rel="noopener noreferrer">
              <DiscordIcon className="w-3.5 h-3.5 mr-1.5" />
              <span>Join Queue on Discord</span>
            </a>
          </GlowButton>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-solid p-5 border-line bg-surface/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted">WAITING COMBATANTS</span>
            <Users className="w-4 h-4 text-brand-cyan" />
          </div>
          <div className="font-mono font-bold text-3xl text-text mt-2">{totalWaiting}</div>
          <span className="text-[11px] text-muted">Across all 9 competitive ladders</span>
        </div>

        <div className="card-solid p-5 border-line bg-surface/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted">ACTIVE TESTERS</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono font-bold text-3xl text-emerald-400 mt-2">{onlineTesters}</div>
          <span className="text-[11px] text-muted">Certified staff currently online</span>
        </div>

        <div className="card-solid p-5 border-line bg-surface/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted">ESTIMATED WAIT</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono font-bold text-3xl text-amber-400 mt-2">
            {totalWaiting > 0 ? `~${Math.max(5, totalWaiting * 6)}m` : "< 5m"}
          </div>
          <span className="text-[11px] text-muted">Based on average FT5 duel speed</span>
        </div>
      </div>

      {/* Online Testers Council */}
      {data?.testers && data.testers.length > 0 && (
        <div className="card-solid p-6 border-line bg-surface/90 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-text">Testers on Duty</h2>
            <span className="text-xs font-mono text-muted">{data.testers.length} verified testers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.testers.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-line"
              >
                <img
                  src={`https://mc-heads.net/avatar/${t.ign}/64`}
                  alt={t.ign}
                  className="w-10 h-10 rounded-lg border border-line shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-text truncate">{t.ign}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        t.status === "TESTING" ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                      }`}
                      title={t.status}
                    />
                  </div>
                  <span className="text-[11px] text-muted block truncate">
                    {t.status === "TESTING" ? "⚔️ In Test" : "🟢 Ready"} • {t.testsCompleted} tests
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9 Gamemode Ladder Queue Cards */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-text">Ladder Waitlists</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {KITS.map((kitMeta: KitMeta) => {
            const queueItems = data?.queues?.[kitMeta.id] || [];

            return (
              <div
                key={kitMeta.id}
                className="card-solid p-5 border-line bg-surface/90 rounded-2xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#121829] border border-line flex items-center justify-center p-1.5 shadow-md shrink-0">
                        <GamemodeIcon id={kitMeta.id} size={26} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading font-black text-base text-text truncate">{kitMeta.name}</h3>
                        <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">Competitive Ladder</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-surface-2 border border-line text-muted shrink-0">
                      {queueItems.length} in queue
                    </span>
                  </div>

                  <p className="text-xs text-muted line-clamp-2">{kitMeta.shortDesc}</p>

                  <div className="pt-2 border-t border-line/60">
                    {queueItems.length === 0 ? (
                      <div className="text-xs font-mono text-muted/70 py-4 text-center">
                        🟢 Queue empty — Instant pickup!
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {queueItems.map((item: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded-lg bg-surface-2 border border-line/60"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-muted font-bold">#{i + 1}</span>
                              <span className="text-text font-semibold">{item.player?.ign || "Player"}</span>
                            </div>
                            <span className="text-muted text-[10px]">{item.player?.region}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <a
                  href={SITE_CONFIG.links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-surface-2 hover:bg-surface border border-line text-xs font-mono font-semibold text-text hover:text-brand-cyan transition-colors"
                >
                  <span>Queue on Discord</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discord Call to Action */}
      <div className="card-solid p-8 border border-brand-violet/40 bg-gradient-to-br from-surface via-brand-violet/10 to-surface rounded-2xl text-center space-y-4">
        <h3 className="font-heading font-black text-2xl text-text">Ready to Prove Your Rank?</h3>
        <p className="text-muted text-sm max-w-xl mx-auto">
          Our verified testing council conducts live first-to-5 duels daily. Connect your account in Discord and join the ladder today.
        </p>
        <GlowButton variant="primary" size="lg" asChild className="mx-auto">
          <a href={SITE_CONFIG.links.discord} target="_blank" rel="noopener noreferrer">
            <DiscordIcon className="w-4 h-4 mr-2" />
            <span>Join Vyntric Discord</span>
          </a>
        </GlowButton>
      </div>
    </div>
  );
}
