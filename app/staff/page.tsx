"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { SectionTitle } from "@/components/ui/section-title";
import { Card } from "@/components/ui/card";
import { GlowButton } from "@/components/ui/glow-button";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/ui/tier-badge";
import { RegionPill } from "@/components/icons/region-pill";
import { KitIcon } from "@/components/icons/kit-icons";
import { ALL_TIERS, TIER_POINTS, KitId, Tier, getTitle } from "@/lib/tiers";
import { KITS, MEMBERS, PLAYERS } from "@/lib/data";
import { Application, TestRecord, Result } from "@/lib/types";
import {
  Lock,
  Unlock,
  KeyRound,
  Swords,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  LogOut,
  Calendar,
  ExternalLink
} from "lucide-react";

export default function StaffPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"log" | "applications" | "history">("log");

  // Form State for Logging Test
  const [selectedTester, setSelectedTester] = useState(MEMBERS[0]?.name || "Zephyrr");
  const [challengerMode, setChallengerMode] = useState<"select" | "custom">("select");
  const [selectedPlayer, setSelectedPlayer] = useState(PLAYERS[0]?.username || "Lethal_V");
  const [customIgn, setCustomIgn] = useState("");
  const [selectedKit, setSelectedKit] = useState<KitId>("Sword");
  const [outcome, setOutcome] = useState<Result>("promoted");
  const [newTier, setNewTier] = useState<Tier>("HT2");
  const [score, setScore] = useState("5-3");
  const [duration, setDuration] = useState("14m");
  const [vodUrl, setVodUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingTest, setSubmittingTest] = useState(false);

  // Applications State
  const [applications, setApplications] = useState<Application[]>([]);
  const [appFilter, setAppFilter] = useState<string>("all");
  const [loadingApps, setLoadingApps] = useState(false);

  // Recent council logs
  const [recentTests, setRecentTests] = useState<TestRecord[]>([]);

  // Check auth status on mount
  useEffect(() => {
    fetch("/api/staff")
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  // Fetch applications & recent tests when authenticated
  const loadData = () => {
    setLoadingApps(true);
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) setApplications(data.applications);
      })
      .finally(() => setLoadingApps(false));

    fetch("/api/tests?limit=25")
      .then((res) => res.json())
      .then((data) => {
        if (data.tests) setRecentTests(data.tests);
      });
  };

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  const activeIgn = challengerMode === "select" ? selectedPlayer : customIgn.trim();
  const playerObj = useMemo(
    () => PLAYERS.find((p) => p.username.toLowerCase() === activeIgn.toLowerCase()),
    [activeIgn]
  );

  const currentTier: Tier = playerObj?.kits[selectedKit]?.tier || "Unranked";

  // Calculate live diff
  const oldPoints = playerObj ? playerObj.points : 0;
  const oldTierPts = TIER_POINTS[currentTier] || 0;
  const newTierPts = TIER_POINTS[newTier] || 0;
  const ptsDifference = newTierPts - oldTierPts;
  const projectedPoints = Math.max(0, oldPoints + ptsDifference);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: passphrase.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      setAuthenticated(true);
      toast.success("Authenticated as Council Tester", {
        description: "Official logging capabilities unlocked.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication error";
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "vyntric_staff_token=; Max-Age=0; path=/;";
    setAuthenticated(false);
    toast.info("Signed out of Council Panel.");
  };

  const handleLogTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIgn) {
      toast.error("Please specify a challenger IGN.");
      return;
    }

    setSubmittingTest(true);

    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testerName: selectedTester,
          ign: activeIgn,
          kit: selectedKit,
          outcome,
          oldTier: currentTier,
          newTier,
          score,
          duration,
          vodUrl: vodUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record test");

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#7C3AED", "#22D3EE", "#FF2D55"],
      });

      toast.success(`Test officially recorded for ${activeIgn}!`, {
        description: `Rank updated: #${data.diff.oldRank} → #${data.diff.newRank} (${data.diff.pointDiff >= 0 ? "+" : ""}${data.diff.pointDiff} pts)`,
      });

      // Reset / reload
      setNotes("");
      setVodUrl("");
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error recording test";
      toast.error(msg);
    } finally {
      setSubmittingTest(false);
    }
  };

  const handleUpdateAppStatus = async (appId: string, status: string, reviewerNotes?: string) => {
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          status,
          reviewerNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status update failed");

      toast.success(`Application updated to ${status}.`);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Update failed";
      toast.error(msg);
    }
  };

  const handleTestChallengerNow = (app: Application) => {
    setChallengerMode("custom");
    setCustomIgn(app.ign);
    setSelectedKit(app.kit);
    if (app.targetTier) {
      setNewTier(app.targetTier);
    }
    setActiveTab("log");
    toast.info(`Pre-filled test form for challenger ${app.ign}.`);
  };

  // If loading session
  if (authenticated === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-violet border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  // If not authenticated, render login gate
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-line flex items-center justify-center mx-auto text-brand-violet shadow-xl">
            <Lock className="w-7 h-7" />
          </div>
          <span className="micro-label block">RESTRICTED ACCESS</span>
          <h1 className="font-heading font-black text-2xl text-text">Council Tester Portal</h1>
          <p className="text-muted text-xs leading-relaxed">
            Cryptographic access for accredited Vyntric testers to ratify 1v1 match results and modify ladder rankings.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="passphrase" className="micro-label block">COUNCIL PASSPHRASE</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-muted absolute left-3 top-3" />
                <input
                  id="passphrase"
                  type="password"
                  required
                  placeholder="Enter staff passphrase"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-violet"
                />
              </div>
            </div>

            <GlowButton
              type="submit"
              variant="primary"
              size="md"
              loading={loginLoading}
              className="w-full"
            >
              <Unlock className="w-4 h-4 mr-2" />
              Sign In to Council
            </GlowButton>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setPassphrase("vyntric2026")}
                className="text-[11px] font-mono text-brand-cyan hover:underline inline-flex items-center gap-1"
              >
                <span>⚡ Use Demo Passphrase (vyntric2026)</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Authenticated Staff View
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl card-solid">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-violet/20 border border-brand-violet/40 flex items-center justify-center text-brand-violet">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-xl text-text">Council Control Panel</h1>
              <Badge variant="outline" className="border-brand-violet/40 text-brand-cyan font-mono text-[10px]">
                AUTHORIZED TESTER
              </Badge>
            </div>
            <p className="text-muted text-xs">
              Live in-memory ledger updates immediately sync across tier lists, leaderboards, and recent tests.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-surface-2 hover:bg-surface border border-line text-muted hover:text-text transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loadingApps ? "animate-spin text-brand-cyan" : ""}`} />
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-2 hover:bg-red-500/10 hover:text-red-400 border border-line text-xs font-mono text-muted transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface-2 p-1 rounded-xl border border-line w-fit">
        <button
          onClick={() => setActiveTab("log")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "log" ? "bg-brand-violet text-white shadow-sm" : "text-muted hover:text-text"
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Log Match Result</span>
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "applications" ? "bg-brand-violet text-white shadow-sm" : "text-muted hover:text-text"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Queue ({applications.filter((a) => a.status === "pending" || a.status === "in_review").length})</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "history" ? "bg-brand-violet text-white shadow-sm" : "text-muted hover:text-text"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Council Ledger ({recentTests.length})</span>
        </button>
      </div>

      {/* TAB 1: LOG MATCH RESULT */}
      {activeTab === "log" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 glass rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <span className="micro-label">OFFICIAL RATIFICATION</span>
              <h2 className="font-heading font-black text-xl text-text">Record 1v1 Test Outcome</h2>
            </div>

            <form onSubmit={handleLogTestSubmit} className="space-y-5">
              {/* Row 1: Tester */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                  Officiating Council Tester
                </label>
                <select
                  value={selectedTester}
                  onChange={(e) => setSelectedTester(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-violet"
                >
                  {MEMBERS.map((m) => (
                    <option key={m.id} value={m.name} className="bg-surface text-text">
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 2: Challenger IGN selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Challenger Player IGN
                  </label>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setChallengerMode("select")}
                      className={`px-2 py-0.5 rounded ${
                        challengerMode === "select" ? "bg-brand-violet text-white" : "text-muted"
                      }`}
                    >
                      Existing Player
                    </button>
                    <button
                      type="button"
                      onClick={() => setChallengerMode("custom")}
                      className={`px-2 py-0.5 rounded ${
                        challengerMode === "custom" ? "bg-brand-violet text-white" : "text-muted"
                      }`}
                    >
                      New Challenger
                    </button>
                  </div>
                </div>

                {challengerMode === "select" ? (
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-violet"
                  >
                    {PLAYERS.map((p) => (
                      <option key={p.id} value={p.username} className="bg-surface text-text">
                        #{p.globalRank} {p.username} ({getTitle(p.points).name} · {p.points} pts)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom Minecraft IGN"
                    value={customIgn}
                    onChange={(e) => setCustomIgn(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-violet"
                  />
                )}
              </div>

              {/* Row 3: Kit & Outcome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Kit Tested
                  </label>
                  <select
                    value={selectedKit}
                    onChange={(e) => setSelectedKit(e.target.value as KitId)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-violet"
                  >
                    {KITS.map((k) => (
                      <option key={k.id} value={k.id} className="bg-surface text-text">
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Test Outcome
                  </label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as Result)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-violet"
                  >
                    <option value="promoted" className="bg-surface text-text">Promoted (Won match)</option>
                    <option value="retained" className="bg-surface text-text">Retained (Competitive hold)</option>
                    <option value="demoted" className="bg-surface text-text">Demoted (Underperformed)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: New Tier & Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Awarded Tier
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as Tier)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-violet"
                  >
                    {ALL_TIERS.map((t) => (
                      <option key={t} value={t} className="bg-surface text-text">
                        {t} ({TIER_POINTS[t]} pts)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Round Score (First-to-5)
                  </label>
                  <select
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-violet"
                  >
                    <option value="5-0">5-0 (Flawless Sweep)</option>
                    <option value="5-1">5-1 (Dominant)</option>
                    <option value="5-2">5-2 (Decisive)</option>
                    <option value="5-3">5-3 (Competitive)</option>
                    <option value="5-4">5-4 (Overtime Thriller)</option>
                    <option value="4-5">4-5 (Tester Win)</option>
                    <option value="3-5">3-5 (Tester Win)</option>
                    <option value="2-5">2-5 (Tester Win)</option>
                    <option value="1-5">1-5 (Tester Win)</option>
                    <option value="0-5">0-5 (Swept)</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Duration & VOD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Match Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14m"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-violet"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Official VOD URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtu.be/..."
                    value={vodUrl}
                    onChange={(e) => setVodUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-violet"
                  />
                </div>
              </div>

              {/* Row 6: Tester Notes */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                  Official Verdict & Notes
                </label>
                <textarea
                  rows={3}
                  maxLength={300}
                  placeholder="e.g. Clean sprint resetting and W-tap discipline. Punished over-extensions during rounds 3 and 5."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-violet resize-none"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <GlowButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submittingTest}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ratify Test & Recalculate Ladder
                </GlowButton>
              </div>
            </form>
          </div>

          {/* Right Column: Live Diff Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="card-solid rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <span className="micro-label">LIVE DIFF PREVIEW</span>
                <Badge variant="outline" className="border-brand-violet/40 text-brand-violet font-mono text-[10px]">
                  REAL-TIME SIMULATION
                </Badge>
              </div>

              {/* Player Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-2 border border-line overflow-hidden relative">
                  <Image
                    src={`https://mc-heads.net/avatar/${activeIgn || "Steve"}/64`}
                    alt={activeIgn || "Player"}
                    width={48}
                    height={48}
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-text">
                    {activeIgn || "Unspecified Player"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono text-muted">
                      Current: #{playerObj?.globalRank || "New"}
                    </span>
                    <span className="text-muted/40">•</span>
                    <span className="text-xs font-mono text-muted">
                      {playerObj?.points || 0} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Tier Transition */}
              <div className="p-4 rounded-xl bg-surface-2 border border-line space-y-3">
                <span className="text-[10px] font-mono text-muted uppercase block">
                  {selectedKit} Ladder Movement
                </span>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted block uppercase">BEFORE</span>
                    <TierBadge tier={currentTier} size="md" />
                  </div>

                  <ArrowRight className="w-5 h-5 text-brand-cyan shrink-0" />

                  <div className="space-y-1 text-right">
                    <span className="text-[10px] text-muted block uppercase">AFTER</span>
                    <TierBadge tier={newTier} size="md" />
                  </div>
                </div>
              </div>

              {/* Points Delta */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-surface-2 border border-line">
                  <span className="text-[10px] text-muted block uppercase">POINTS DELTA</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {ptsDifference > 0 && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                    {ptsDifference < 0 && <TrendingDown className="w-4 h-4 text-rose-400" />}
                    {ptsDifference === 0 && <Minus className="w-4 h-4 text-muted" />}
                    <span className={`font-bold text-sm ${
                      ptsDifference > 0 ? "text-emerald-400" : ptsDifference < 0 ? "text-rose-400" : "text-muted"
                    }`}>
                      {ptsDifference > 0 ? `+${ptsDifference}` : ptsDifference} pts
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-2 border border-line">
                  <span className="text-[10px] text-muted block uppercase">PROJECTED TOTAL</span>
                  <span className="font-bold text-sm text-text mt-1 block">
                    {projectedPoints} pts
                  </span>
                </div>
              </div>

              {/* Action summary */}
              <div className="p-4 rounded-xl bg-brand-violet/10 border border-brand-violet/20 text-xs text-brand-cyan leading-relaxed">
                Ratifying will append this match to the public ledger, update {activeIgn}&apos;s verified kit record, and recalculate global standings instantly.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHALLENGER QUEUE MANAGEMENT */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="micro-label">QUEUE CONTROL</span>
              <h2 className="font-heading font-black text-xl text-text">Challenger Submissions</h2>
            </div>

            <div className="flex bg-surface-2 p-1 rounded-xl border border-line text-xs font-mono">
              {["all", "pending", "in_review", "scheduled", "completed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setAppFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    appFilter === st ? "bg-brand-violet text-white" : "text-muted hover:text-text"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications
              .filter((a) => appFilter === "all" || a.status === appFilter)
              .map((app) => (
                <Card key={app.id} className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-2 border border-line overflow-hidden relative">
                        <Image
                          src={`https://mc-heads.net/avatar/${app.ign}/64`}
                          alt={app.ign}
                          width={40}
                          height={40}
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading font-bold text-base text-text">{app.ign}</h4>
                          <RegionPill region={app.region} />
                        </div>
                        <span className="text-[11px] font-mono text-muted">
                          Discord: {app.discordTag}
                        </span>
                      </div>
                    </div>

                    <Badge variant="outline" className="font-mono text-[10px] uppercase border-line">
                      {app.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono p-2.5 rounded-xl bg-surface-2 border border-line">
                    <div>
                      <span className="text-[9px] text-muted block uppercase">KIT</span>
                      <span className="font-bold text-text">{app.kit}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted block uppercase">PREV</span>
                      <span className="font-bold text-muted">{app.previousTier}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted block uppercase">TARGET</span>
                      <span className="font-bold text-brand-pink">{app.targetTier || "Evaluation"}</span>
                    </div>
                  </div>

                  {app.notes && (
                    <p className="text-xs text-muted leading-relaxed line-clamp-2 italic">
                      &ldquo;{app.notes}&rdquo;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line text-xs font-mono">
                    <a
                      href={app.vodLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-brand-cyan hover:underline"
                    >
                      <span>VOD Clip</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-2">
                      {app.status === "pending" && (
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, "scheduled", "Assigned for official test match.")}
                          className="px-2.5 py-1 rounded bg-brand-violet/20 hover:bg-brand-violet text-brand-violet hover:text-white border border-brand-violet/40 transition-colors"
                        >
                          Schedule
                        </button>
                      )}

                      <button
                        onClick={() => handleTestChallengerNow(app)}
                        className="px-2.5 py-1 rounded bg-brand-cyan/20 hover:bg-brand-cyan text-brand-cyan hover:text-black border border-brand-cyan/40 transition-colors font-bold"
                      >
                        Test Now →
                      </button>

                      {app.status !== "rejected" && app.status !== "completed" && (
                        <button
                          onClick={() => handleUpdateAppStatus(app.id, "rejected", "Submission did not meet VOD guidelines.")}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 transition-colors"
                        >
                          Decline
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: COUNCIL LEDGER */}
      {activeTab === "history" && (
        <Card className="p-6 space-y-4">
          <div className="space-y-1">
            <span className="micro-label">LEDGER AUDIT</span>
            <h2 className="font-heading font-black text-xl text-text">Officially Ratified Tests</h2>
          </div>

          <div className="divide-y divide-line/60">
            {recentTests.map((t) => (
              <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-2 border border-line overflow-hidden shrink-0">
                    <Image
                      src={`https://mc-heads.net/avatar/${t.playerUsername}/32`}
                      alt={t.playerUsername}
                      width={32}
                      height={32}
                      unoptimized
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/player/${t.playerUsername}`} className="font-heading font-bold text-text hover:text-brand-cyan">
                        {t.playerUsername}
                      </Link>
                      <span className="text-muted text-xs font-mono">vs</span>
                      <span className="font-mono text-xs text-muted">{t.testerUsername}</span>
                    </div>
                    <span className="text-xs text-muted block line-clamp-1">{t.notes}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    <KitIcon kit={t.kit} className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>{t.kit}</span>
                  </div>

                  <span className="font-bold text-text">{t.score}</span>

                  <div className="flex items-center gap-1.5">
                    {t.previousTier && t.previousTier !== "UNRANKED" ? (
                      <TierBadge tier={t.previousTier as Tier} size="sm" />
                    ) : (
                      <span className="text-muted text-[10px]">Unranked</span>
                    )}
                    <ArrowRight className="w-3 h-3 text-muted" />
                    <TierBadge tier={t.newTier} size="sm" />
                  </div>

                  <Badge
                    variant="outline"
                    className={`font-mono text-[10px] uppercase ${
                      t.result === "promoted"
                        ? "border-emerald-500/40 text-emerald-400"
                        : t.result === "demoted"
                        ? "border-rose-500/40 text-rose-400"
                        : "border-brand-yellow/40 text-brand-yellow"
                    }`}
                  >
                    {t.result}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
