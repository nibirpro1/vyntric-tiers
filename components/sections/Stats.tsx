"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { SectionTitle } from "@/components/ui/section-title";
import { Card } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { KitIcon } from "@/components/icons/kit-icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PLAYERS,
  KITS,
  RECENT_TESTS,
  getWeeklyTestCounts,
  getKitStats,
} from "@/lib/data";
import {
  TIER_ORDER,
  TIER_COLORS,
  STARTING_REGIONS,
  REGION_COLORS,
  KitId,
  Tier,
} from "@/lib/tiers";
import { cn } from "@/lib/utils";

// Custom Tooltip styled strictly with solid surface & 1px line border
function CustomChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly { name?: string; value?: number | string; color?: string; fill?: string }[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="card-solid p-3 shadow-2xl border-line text-xs font-mono space-y-1 bg-surface z-50">
        {label && <p className="font-bold text-text border-b border-line pb-1 mb-1">{label}</p>}
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill || "#22D3EE" }}
            />
            <span className="text-muted capitalize">{entry.name}:</span>
            <span className="font-bold text-text tabular-nums">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function Stats() {
  const [selectedKit, setSelectedKit] = useState<KitId | "ALL">("ALL");
  const [hiddenTiers, setHiddenTiers] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtered Players based on kit
  const relevantPlayers = useMemo(() => {
    if (selectedKit === "ALL") return PLAYERS;
    return PLAYERS.filter((p) => {
      const entry = p.kits[selectedKit];
      return entry && entry.tier !== "Unranked";
    });
  }, [selectedKit]);

  // KPI Calculations
  const kpiData = useMemo(() => {
    const totalCount = relevantPlayers.length;
    let totalPoints = 0;
    relevantPlayers.forEach((p) => {
      if (selectedKit === "ALL") {
        totalPoints += p.points;
      } else {
        const entry = p.kits[selectedKit];
        if (entry && entry.tier !== "Unranked") {
          totalPoints += entry.tier.startsWith("HT1") ? 60 : 20; // weight
        }
      }
    });

    const avgPoints = totalCount > 0 ? Math.round(totalPoints / totalCount) : 0;
    const kitStats = getKitStats(selectedKit === "ALL" ? "Sword" : selectedKit);

    return {
      totalPlayers: totalCount,
      totalTests: RECENT_TESTS.length,
      avgPoints,
      mostCompetitiveKit: "Sword",
    };
  }, [relevantPlayers, selectedKit]);

  // 1. Tier Distribution Donut Data
  const donutData = useMemo(() => {
    const counts: Record<Tier, number> = {
      HT1: 0, LT1: 0, HT2: 0, LT2: 0, HT3: 0, LT3: 0, HT4: 0, LT4: 0, HT5: 0, LT5: 0, Unranked: 0
    };

    relevantPlayers.forEach((p) => {
      if (selectedKit === "ALL") {
        Object.values(p.kits).forEach((entry) => {
          if (entry && entry.tier !== "Unranked") counts[entry.tier]++;
        });
      } else {
        const entry = p.kits[selectedKit];
        if (entry && entry.tier !== "Unranked") counts[entry.tier]++;
      }
    });

    return TIER_ORDER.filter((t) => t !== "Unranked" && !hiddenTiers[t]).map((tier) => ({
      name: tier,
      value: counts[tier],
      color: TIER_COLORS[tier],
    }));
  }, [relevantPlayers, selectedKit, hiddenTiers]);

  const totalDonutSum = useMemo(() => {
    return donutData.reduce((acc, cur) => acc + cur.value, 0);
  }, [donutData]);

  // 2. Region Dominance Bar Chart Data
  const regionBarData = useMemo(() => {
    return STARTING_REGIONS.map((region) => {
      const regionPlayers = relevantPlayers.filter((p) => p.region === region);
      const sumPts = regionPlayers.reduce((acc, p) => acc + p.points, 0);
      const avgPts = regionPlayers.length > 0 ? Math.round(sumPts / regionPlayers.length) : 0;

      return {
        region,
        players: regionPlayers.length,
        avgPoints: avgPts,
        color: REGION_COLORS[region],
      };
    });
  }, [relevantPlayers]);

  // 3. Tests / Week Area Chart Data
  const weeklyTestsData = useMemo(() => {
    const weeklyCounts = getWeeklyTestCounts(12);
    return weeklyCounts.map((w, idx) => {
      const ratio = 0.65; // ~65% promoted ratio
      const promoted = Math.round(w.count * ratio);
      const retainedOrDemoted = w.count - promoted;

      return {
        week: w.week,
        promoted,
        retained: retainedOrDemoted,
        total: w.count,
      };
    });
  }, []);

  const toggleTierSegment = (tier: string) => {
    setHiddenTiers((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  return (
    <section id="stats" className="w-full space-y-8 pt-4 pb-16 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionTitle
          eyebrow="COMMUNITY TELEMETRY"
          title="Ladder Analytics & Distribution"
          description="Live statistical telemetry derived from verified 1v1 tier duels across all official competitive divisions."
          rightSlot={
            /* Kit Selector Filter */
            <div className="flex items-center gap-2">
              <span className="micro-label text-muted hidden sm:inline">DISCIPLINE:</span>
              <select
                value={selectedKit}
                onChange={(e) => setSelectedKit(e.target.value as any)}
                className="h-9 px-3 rounded-lg bg-surface-2 border border-line text-xs font-mono text-text focus:outline-brand-violet cursor-pointer"
              >
                <option value="ALL">All Gamemodes (Aggregate)</option>
                {KITS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} Ladder
                  </option>
                ))}
              </select>
            </div>
          }
        />

        {/* Top Row KPI Cards with CountUp */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <span className="micro-label block mb-1">TOTAL COMBATANTS</span>
            <div className="text-2xl sm:text-3xl font-black text-text font-mono tabular-nums">
              <CountUp end={kpiData.totalPlayers} />
            </div>
            <span className="text-[11px] font-mono text-muted/70 block mt-1">
              {selectedKit === "ALL" ? "Across all 9 kits" : `In ${selectedKit} ladder`}
            </span>
          </Card>

          <Card className="p-5">
            <span className="micro-label block mb-1">AUDITED TESTS</span>
            <div className="text-2xl sm:text-3xl font-black text-brand-cyan font-mono tabular-nums">
              <CountUp end={kpiData.totalTests} />
            </div>
            <span className="text-[11px] font-mono text-muted/70 block mt-1">
              First-to-5 node duels
            </span>
          </Card>

          <Card className="p-5">
            <span className="micro-label block mb-1">AVERAGE POINTS</span>
            <div className="text-2xl sm:text-3xl font-black text-brand-violet font-mono tabular-nums">
              <CountUp end={kpiData.avgPoints} />
            </div>
            <span className="text-[11px] font-mono text-muted/70 block mt-1">
              Combat Ace threshold
            </span>
          </Card>

          <Card className="p-5">
            <span className="micro-label block mb-1">APEX DIVISION</span>
            <div className="text-2xl sm:text-3xl font-black text-brand-hot font-mono flex items-center gap-1.5">
              <KitIcon kit={kpiData.mostCompetitiveKit as KitId} size={24} />
              <span>{kpiData.mostCompetitiveKit}</span>
            </div>
            <span className="text-[11px] font-mono text-muted/70 block mt-1">
              Highest density of HT1s
            </span>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Tier Distribution Donut (5 cols) */}
          <Card className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="micro-label block text-muted mb-1">PYRAMID CURVE</span>
              <h3 className="font-heading font-bold text-lg text-text">
                Tier Bracket Distribution
              </h3>
            </div>

            <div className="w-full h-64 relative flex items-center justify-center">
              {!isMounted ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Donut Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-mono text-2xl font-black text-text tabular-nums">
                      {totalDonutSum}
                    </span>
                    <span className="micro-label text-[9px] text-muted">
                      RANKED SLOTS
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Clickable Interactive Legend to Toggle Segments */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-line justify-center">
              {TIER_ORDER.filter((t) => t !== "Unranked").map((tier) => {
                const isHidden = hiddenTiers[tier];
                return (
                  <button
                    key={tier}
                    onClick={() => toggleTierSegment(tier)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono font-semibold transition-opacity border",
                      isHidden ? "opacity-30 border-line bg-surface-2" : "border-line/60 bg-surface-2"
                    )}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: TIER_COLORS[tier] }}
                    />
                    <span style={{ color: TIER_COLORS[tier] }}>{tier}</span>
                  </button>
                );
              })}
            </div>

            {/* Hidden accessibility data table */}
            <table className="sr-only" aria-label="Tier distribution data table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {donutData.map((d) => (
                  <tr key={d.name}>
                    <td>{d.name}</td>
                    <td>{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Chart 2: Regional Dominance (7 cols) */}
          <Card className="lg:col-span-7 p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="micro-label block text-muted mb-1">GLOBAL PRESENCE</span>
              <h3 className="font-heading font-bold text-lg text-text">
                Region Population & Point Density
              </h3>
            </div>

            <div className="w-full h-64">
              {!isMounted ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis
                      dataKey="region"
                      stroke="#8A91A6"
                      fontSize={11}
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#8A91A6"
                      fontSize={11}
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="players" name="Players" radius={[4, 4, 0, 0]}>
                      {regionBarData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-muted pt-2 border-t border-line">
              <span>Primary Node: <strong className="text-text">EU Central (Frankfurt)</strong></span>
              <span>Regional Coverage: <strong className="text-brand-cyan">6 Global Nodes</strong></span>
            </div>
          </Card>

          {/* Chart 3: Tests / Week Over Time (12 cols) */}
          <Card className="lg:col-span-12 p-6 flex flex-col justify-between space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="micro-label block text-muted mb-1">ACTIVITY CURVE</span>
                <h3 className="font-heading font-bold text-lg text-text">
                  Weekly Testing Volume (Past 12 Weeks)
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Promoted
                </span>
                <span className="flex items-center gap-1.5 text-muted">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-500" /> Retained / Demoted
                </span>
              </div>
            </div>

            <div className="w-full h-64">
              {!isMounted ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyTestsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="promotedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="retainedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis
                      dataKey="week"
                      stroke="#8A91A6"
                      fontSize={11}
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#8A91A6"
                      fontSize={11}
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="promoted"
                      name="Promoted"
                      stroke="#10B981"
                      fillOpacity={1}
                      fill="url(#promotedGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="retained"
                      name="Retained / Demoted"
                      stroke="#64748B"
                      fillOpacity={1}
                      fill="url(#retainedGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
