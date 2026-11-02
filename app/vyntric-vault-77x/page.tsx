"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  KeyRound,
  Shield,
  ShieldAlert,
  Users,
  Trophy,
  Swords,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Download,
  Upload,
  Radio,
  LogOut,
  RefreshCw,
  Search,
  Check,
  X,
  Volume2,
  Sliders,
  Megaphone,
  Globe,
  Database,
  FileCode,
  Flame,
} from "lucide-react";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { GamemodeIcon } from "@/components/icons/GamemodeIcons";
import {
  GAMEMODES,
  GAMEMODE_MAP,
  GamemodeId,
  Tier,
  TIER_COLORS,
  TIER_POINTS,
  getTitle,
  formatTestTimestamp,
} from "@/lib/tiers";
import { PLAYERS, RECENT_TESTS, VYNTRIC_MEMBERS, getSiteSettings, SiteSettings } from "@/lib/data";
import { Player, TestRecord, Member, Region } from "@/lib/types";

type VaultTab = "players" | "tests" | "staff" | "queue" | "settings" | "announcement" | "backup";

export default function VyntricVaultSecretPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<VaultTab>("players");

  // Live state
  const [playersList, setPlayersList] = useState<Player[]>(PLAYERS);
  const [testsList, setTestsList] = useState<TestRecord[]>(RECENT_TESTS);
  const [staffList, setStaffList] = useState<Member[]>(VYNTRIC_MEMBERS);
  const [playerSearch, setPlayerSearch] = useState("");

  // Add / Edit Player Modal State
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerFormIgn, setPlayerFormIgn] = useState("");
  const [playerFormRegion, setPlayerFormRegion] = useState<Region>("NA");
  const [playerFormDiscord, setPlayerFormDiscord] = useState("");
  const [playerFormKits, setPlayerFormKits] = useState<Record<string, Tier>>({
    sword: "Unranked",
    vanilla: "Unranked",
    uhc: "Unranked",
    pot: "Unranked",
    nethop: "Unranked",
    smp: "Unranked",
    axe: "Unranked",
    mace: "Unranked",
  });

  // Log Test Form State
  const [testChallenger, setTestChallenger] = useState("");
  const [testTester, setTestTester] = useState("Kazuma");
  const [testKit, setTestKit] = useState<GamemodeId>("sword");
  const [testScore, setTestScore] = useState("5-2");
  const [testOutcome, setTestOutcome] = useState("promoted");
  const [testNewTier, setTestNewTier] = useState<Tier>("HT2");
  const [testVod, setTestVod] = useState("");
  const [testNotes, setTestNotes] = useState("");
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState("");

  // Site Settings State
  const [siteSettings, setSiteSettingsState] = useState<SiteSettings>(getSiteSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Announcement State
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);
  const [announcementText, setAnnouncementText] = useState(
    "Official Vyntric Tier Testing is OPEN. Open a queue ticket on Discord to challenge accredited council testers."
  );
  const [announcementType, setAnnouncementType] = useState<"alert" | "info" | "event">("info");
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  // Queue State
  const [queueWaitlists, setQueueWaitlists] = useState<Record<string, string[]>>({
    sword: ["SwiftCombo", "LethalPvP"],
    vanilla: ["CrystalGod"],
    uhc: ["RodMaster99"],
    pot: [],
    nethop: ["NetherTank"],
    smp: [],
    axe: ["ShieldBreaker"],
    mace: ["WindSlammer"],
  });
  const [newQueuePlayer, setNewQueuePlayer] = useState("");
  const [newQueueKit, setNewQueueKit] = useState<GamemodeId>("sword");

  // Raw JSON Restore State
  const [restoreJsonInput, setRestoreJsonInput] = useState("");
  const [restoreStatus, setRestoreStatus] = useState("");

  // Check auth status on load
  useEffect(() => {
    fetch("/api/admin")
      .then((res) => res.json())
      .then((data) => {
        setAuthenticated(data.authenticated);
        if (data.settings) {
          setSiteSettingsState(data.settings);
          if (data.settings.announcement) {
            setAnnouncementEnabled(data.settings.announcement.enabled);
            setAnnouncementText(data.settings.announcement.message);
            setAnnouncementType(data.settings.announcement.type);
          }
        }
      })
      .catch(() => setAuthenticated(false));
  }, []);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", passphrase }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthenticated(true);
        setPassphrase("");
      } else {
        setAuthError(data.error || "Access Denied. Invalid Master Passcode.");
      }
    } catch {
      setAuthError("Network error connecting to master vault.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setAuthenticated(false);
  };

  // Filtered players
  const filteredPlayers = useMemo(() => {
    if (!playerSearch.trim()) return playersList;
    const q = playerSearch.toLowerCase();
    return playersList.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.combatTitle?.toLowerCase().includes(q)
    );
  }, [playersList, playerSearch]);

  // Open modal to add or edit player
  const openPlayerModal = (player?: Player) => {
    if (player) {
      setEditingPlayer(player);
      setPlayerFormIgn(player.username);
      setPlayerFormRegion(player.region);
      setPlayerFormDiscord(player.discord || "");
      const kits: Record<string, Tier> = {};
      GAMEMODES.forEach((g) => {
        kits[g.id] = (player.kits?.[g.id]?.tier as Tier) || "Unranked";
      });
      setPlayerFormKits(kits);
    } else {
      setEditingPlayer(null);
      setPlayerFormIgn("");
      setPlayerFormRegion("NA");
      setPlayerFormDiscord("");
      const kits: Record<string, Tier> = {};
      GAMEMODES.forEach((g) => {
        kits[g.id] = "Unranked";
      });
      setPlayerFormKits(kits);
    }
    setIsPlayerModalOpen(true);
  };

  // Save Player
  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerFormIgn.trim()) return;

    const formattedKits: Record<string, any> = {};
    for (const [kitId, tier] of Object.entries(playerFormKits)) {
      if (tier && tier !== "Unranked") {
        formattedKits[kitId] = {
          tier,
          peakTier: tier,
          lastTestedAt: new Date().toISOString(),
          tester: "Vault Admin",
          score: "5-2",
        };
      }
    }

    const payload = {
      username: playerFormIgn.trim(),
      region: playerFormRegion,
      discord: playerFormDiscord.trim() || `@${playerFormIgn.trim().toLowerCase()}`,
      kits: formattedKits,
    };

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_player", playerData: payload }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.player) {
        setPlayersList((prev) => {
          const idx = prev.findIndex((p) => p.username.toLowerCase() === data.player.username.toLowerCase());
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data.player;
            return next.sort((a, b) => b.points - a.points);
          }
          return [data.player, ...prev].sort((a, b) => b.points - a.points);
        });
      }
      setIsPlayerModalOpen(false);
    }
  };

  // Delete Player
  const handleDeletePlayer = async (id: string, ign: string) => {
    if (!confirm(`Are you sure you want to completely remove ${ign} from Vyntric Leaderboards?`)) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_player", id }),
    });
    if (res.ok) {
      setPlayersList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Submit Test Result
  const handleLogTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testChallenger.trim()) return;
    setTestSubmitting(true);
    setTestSuccessMessage("");

    const payload = {
      ign: testChallenger.trim(),
      testerName: testTester,
      kit: testKit,
      newTier: testNewTier,
      score: testScore,
      outcome: testOutcome,
      vodUrl: testVod.trim() || undefined,
      notes: testNotes.trim() || undefined,
    };

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "log_test", testData: payload }),
    });

    if (res.ok) {
      const data = await res.json();
      setTestSuccessMessage(`Official test result logged for ${testChallenger}! Tier updated to ${testNewTier}.`);
      setTestChallenger("");
      setTestVod("");
      setTestNotes("");

      if (data.testResult?.testRecord) {
        setTestsList((prev) => [data.testResult.testRecord, ...prev]);
      }
    }
    setTestSubmitting(false);
  };

  // Delete Test Record
  const handleDeleteTest = async (testId: string) => {
    if (!confirm("Remove this duel record from recent audits?")) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_test", testId }),
    });
    if (res.ok) {
      setTestsList((prev) => prev.filter((t) => t.id !== testId));
    }
  };

  // Save Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_settings", settings: siteSettings }),
    });
    if (res.ok) {
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    }
  };

  // Save Announcement
  const handleSaveAnnouncement = async () => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_announcement",
        announcement: {
          enabled: announcementEnabled,
          message: announcementText,
          type: announcementType,
        },
      }),
    });
    if (res.ok) {
      setAnnouncementSaved(true);
      setTimeout(() => setAnnouncementSaved(false), 3000);
    }
  };

  // Add to Queue
  const handleAddQueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueuePlayer.trim()) return;
    setQueueWaitlists((prev) => ({
      ...prev,
      [newQueueKit]: [...(prev[newQueueKit] || []), newQueuePlayer.trim()],
    }));
    setNewQueuePlayer("");
  };

  // Remove from Queue
  const handleRemoveQueue = (kit: string, index: number) => {
    setQueueWaitlists((prev) => ({
      ...prev,
      [kit]: prev[kit].filter((_, i) => i !== index),
    }));
  };

  // Export Database JSON
  const handleExportBackup = async () => {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "export_backup" }),
    });
    if (res.ok) {
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vyntric-vault-master-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Restore Database from JSON
  const handleRestoreJson = async () => {
    if (!restoreJsonInput.trim()) return;
    try {
      const parsed = JSON.parse(restoreJsonInput);
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore_backup", data: parsed }),
      });
      if (res.ok) {
        setRestoreStatus("SUCCESS: Database restored completely from JSON!");
        // Refresh local lists
        if (parsed.players) setPlayersList(parsed.players);
        if (parsed.tests) setTestsList(parsed.tests);
        if (parsed.staff) setStaffList(parsed.staff);
        if (parsed.settings) setSiteSettingsState(parsed.settings);
        setRestoreJsonInput("");
      } else {
        setRestoreStatus("ERROR: Server rejected the backup payload.");
      }
    } catch {
      setRestoreStatus("ERROR: Invalid JSON syntax. Please verify file format.");
    }
  };

  // =========================================================================
  // VIEW 1: AUTHENTICATION GATE (STEALTH TERMINAL)
  // =========================================================================
  if (authenticated === false || authenticated === null) {
    return (
      <div className="min-h-screen bg-[#05070D] flex items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#FF2D55]/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#22D3EE]/15 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md p-8 rounded-3xl bg-[#0B0E1A]/95 border border-[#FF2D55]/30 shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(255,45,85,0.2)] backdrop-blur-2xl relative z-10 space-y-6"
        >
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#FF2D55]/20 to-[#7C3AED]/20 border border-[#FF2D55]/40 shadow-inner mb-1">
              <BrandLogo size={48} />
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#FF2D55] tracking-widest uppercase">
              <Lock className="w-3.5 h-3.5" />
              <span>CLASSIFIED MASTER VAULT // 77X</span>
            </div>
            <h1 className="font-heading font-black text-2xl text-white tracking-tight">
              Secret Control Room
            </h1>
            <p className="text-xs font-mono text-muted leading-relaxed">
              Full god-mode access to Vyntric Tiers platform, rankings, queue, and telemetry.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted flex items-center justify-between">
                <span>Vault Master Key</span>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-brand-cyan hover:underline text-[10px] lowercase"
                >
                  {showPass ? "hide" : "reveal"}
                </button>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter secret passkey..."
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-sm font-mono text-white placeholder:text-muted/60 focus:outline-none transition-all shadow-inner"
                  autoFocus
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl btn-vyntric-primary text-xs font-heading font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Master Credentials...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Master Vault</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[10px] font-mono text-muted">
            <span>Security: ZERO TRACE ACCESS</span>
            <Link href="/" className="hover:text-white transition-colors">
              Return to Public Site →
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MASTER VAULT SUITE (AUTHENTICATED)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#07090E] text-text pb-20 select-none">
      {/* 1. TOP MASTER VAULT BAR */}
      <header className="sticky top-0 z-40 bg-[#0A0D18]/95 backdrop-blur-2xl border-b border-[#FF2D55]/30 shadow-[0_8px_30px_rgba(0,0,0,0.8)] py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo size={36} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-lg text-white tracking-tight">
                  VYNTRIC MASTER VAULT
                </span>
                <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[10px] font-mono font-bold text-red-400">
                  FULL GOD MODE
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted tracking-widest uppercase block">
                CLASSIFIED ADMINISTRATIVE ENGINE & LIVE OVERRIDES
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-2 hover:bg-surface border border-line text-xs font-mono text-muted hover:text-white transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-mono font-bold text-red-400 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Vault</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0C101C] border border-white/10 overflow-x-auto">
          {[
            { id: "players", label: `Combatants (${playersList.length})`, icon: Trophy },
            { id: "tests", label: "Post Duel Result", icon: Swords },
            { id: "staff", label: `Council Staff (${staffList.length})`, icon: Users },
            { id: "queue", label: "Queue & Waitlists", icon: Radio },
            { id: "settings", label: "Website Customizer", icon: Globe },
            { id: "announcement", label: "Global Announcement", icon: Megaphone },
            { id: "backup", label: "Backup & Restore Engine", icon: Database },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as VaultTab)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#FF2D55]/30 to-[#7C3AED]/30 text-white border border-[#FF2D55]/50 shadow-[0_0_15px_rgba(255,45,85,0.3)]"
                    : "text-muted hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#FF2D55]" : "text-muted"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ======================================================= */}
        {/* TAB 1: COMBATANTS & TIERS MANAGER                        */}
        {/* ======================================================= */}
        {activeTab === "players" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading font-black text-xl text-white tracking-tight">
                  Verified Combatant Roster
                </h2>
                <p className="text-xs font-mono text-muted">
                  Add, edit, adjust tiers, or remove players from the official leaderboard.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search player..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="w-48 sm:w-60 pl-8 pr-3 py-1.5 rounded-xl bg-surface-2 border border-line text-xs font-mono text-white placeholder:text-muted/60 focus:outline-none focus:border-[#FF2D55]"
                  />
                </div>

                <button
                  onClick={() => openPlayerModal()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-vyntric-primary text-xs font-mono font-bold shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Combatant</span>
                </button>
              </div>
            </div>

            {/* Combatants Table */}
            <div className="rounded-2xl bg-[#090C18] border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0D1222] border-b border-line/60 text-muted uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank / IGN</th>
                      <th className="py-3 px-4">Region</th>
                      <th className="py-3 px-4">Combat Title</th>
                      <th className="py-3 px-4">Total Score</th>
                      <th className="py-3 px-4">Active Tiers</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredPlayers.map((player) => (
                      <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <span className="font-heading font-black text-sm text-amber-400 w-6">
                            #{player.globalRank}
                          </span>
                          <img
                            src={`https://mc-heads.net/head/${player.username}/32`}
                            alt={player.username}
                            className="w-7 h-7 rounded-lg border border-line shrink-0"
                          />
                          <span className="font-bold text-white">{player.username}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-brand-cyan">
                            {player.region}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-300">
                          {player.combatTitle || "Combat Novice"}
                        </td>
                        <td className="py-3 px-4 font-black text-white text-sm">
                          {player.points} pts
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {GAMEMODES.map((g) => {
                              const t = player.kits?.[g.id]?.tier;
                              if (!t || t === "Unranked") return null;
                              return (
                                <span
                                  key={g.id}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold border"
                                  style={{
                                    color: TIER_COLORS[t as Tier] || "#fff",
                                    borderColor: `${TIER_COLORS[t as Tier] || "#fff"}40`,
                                    backgroundColor: `${TIER_COLORS[t as Tier] || "#fff"}15`,
                                  }}
                                  title={`${g.name}: ${t}`}
                                >
                                  {g.name.split(" ")[0]} {t}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openPlayerModal(player)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-brand-cyan hover:text-white transition-all cursor-pointer"
                              title="Edit Combatant"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player.id, player.username)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                              title="Delete Combatant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: POST LIVE TEST RESULT                             */}
        {/* ======================================================= */}
        {activeTab === "tests" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 p-6 rounded-3xl bg-[#090C18] border border-white/10 shadow-2xl space-y-5">
              <div>
                <h2 className="font-heading font-black text-xl text-white tracking-tight flex items-center gap-2">
                  <Swords className="w-5 h-5 text-[#FF2D55]" />
                  <span>Log Official 1v1 Test Audit</span>
                </h2>
                <p className="text-xs font-mono text-muted">
                  Publishes the result immediately to recent audits, updates player tier, and broadcasts to the marquee ticker.
                </p>
              </div>

              {testSuccessMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{testSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleLogTest} className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-muted text-[11px] uppercase">Challenger IGN *</label>
                    <input
                      type="text"
                      placeholder="e.g. ClownPierce"
                      value={testChallenger}
                      onChange={(e) => setTestChallenger(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted text-[11px] uppercase">Accredited Tester</label>
                    <select
                      value={testTester}
                      onChange={(e) => setTestTester(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none"
                    >
                      {staffList.map((m) => (
                        <option key={m.id} value={m.ign}>
                          {m.name} (@{m.ign})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-muted text-[11px] uppercase">Gamemode</label>
                    <select
                      value={testKit}
                      onChange={(e) => setTestKit(e.target.value as GamemodeId)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none"
                    >
                      {GAMEMODES.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted text-[11px] uppercase">New Tier Awarded</label>
                    <select
                      value={testNewTier}
                      onChange={(e) => setTestNewTier(e.target.value as Tier)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none font-bold"
                    >
                      {["HT1", "LT1", "HT2", "LT2", "HT3", "LT3"].map((t) => (
                        <option key={t} value={t}>
                          {t} ({TIER_POINTS[t as Tier] || 0} pts)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-muted text-[11px] uppercase">Duel Score</label>
                    <select
                      value={testScore}
                      onChange={(e) => setTestScore(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none font-bold"
                    >
                      <option value="5-0">5-0 (Flawless)</option>
                      <option value="5-1">5-1 (Dominant)</option>
                      <option value="5-2">5-2 (Decisive)</option>
                      <option value="5-3">5-3 (Competitive)</option>
                      <option value="5-4">5-4 (Close Set)</option>
                      <option value="4-5">4-5 (Retain)</option>
                      <option value="2-5">2-5 (Demote)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted text-[11px] uppercase">VOD / Recording Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={testVod}
                    onChange={(e) => setTestVod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted text-[11px] uppercase">Council Audit Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Technical duel notes (spacing, sprint resets, anchor APM, rod accuracy)..."
                    value={testNotes}
                    onChange={(e) => setTestNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={testSubmitting}
                  className="w-full py-3 rounded-xl btn-vyntric-primary text-xs font-heading font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {testSubmitting ? (
                    <span>Publishing Result...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Publish & Broadcast Test Result</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Recent Audits Stream */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#090C18] border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <span className="font-heading font-bold text-sm text-white">
                  Recent Duel Audits ({testsList.length})
                </span>
                <span className="text-[10px] font-mono text-muted uppercase">Live Feed</span>
              </div>

              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {testsList.slice(0, 8).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-surface-2 border border-line/60 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={`https://mc-heads.net/head/${t.playerUsername}/32`}
                        alt={t.playerUsername}
                        className="w-7 h-7 rounded-lg border border-line shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{t.playerUsername}</span>
                        <span className="text-[10px] text-muted block capitalize">
                          {t.kit} • {t.score} by @{t.testerUsername}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold border"
                        style={{
                          color: TIER_COLORS[t.newTier],
                          borderColor: `${TIER_COLORS[t.newTier]}40`,
                          backgroundColor: `${TIER_COLORS[t.newTier]}15`,
                        }}
                      >
                        {t.newTier}
                      </span>
                      <button
                        onClick={() => handleDeleteTest(t.id)}
                        className="p-1 rounded text-muted hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete duel log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: COUNCIL & STAFF MANAGEMENT                        */}
        {/* ======================================================= */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-black text-xl text-white tracking-tight">
                  Accredited Council Staff Roster
                </h2>
                <p className="text-xs font-mono text-muted">
                  Manage active testers, status, and testing credentials.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-[#090C18] border border-white/10 flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={`https://mc-heads.net/head/${member.ign}/64`}
                      alt={member.name}
                      className="w-10 h-10 rounded-xl border border-line shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-sm text-white block truncate">{member.name}</span>
                      <span className="text-[10px] font-mono text-brand-cyan block">
                        @{member.ign} • {member.role}
                      </span>
                      <span className="text-[10px] font-mono text-muted block">
                        {member.testsCompleted} tests audited
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      member.status === "ONLINE"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-white/5 text-muted border border-white/10"
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: QUEUE & WAITLISTS MANAGER                         */}
        {/* ======================================================= */}
        {activeTab === "queue" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading font-black text-xl text-white tracking-tight flex items-center gap-2">
                <Radio className="w-5 h-5 text-brand-cyan" />
                <span>Live Gamemode Queue & Waitlist Control</span>
              </h2>
              <p className="text-xs font-mono text-muted">
                Inspect and modify active waitlists for all 8 ladder disciplines.
              </p>
            </div>

            {/* Quick Add Player to Queue Form */}
            <form onSubmit={handleAddQueue} className="p-4 rounded-2xl bg-[#0C101C] border border-white/10 flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Player IGN to queue..."
                value={newQueuePlayer}
                onChange={(e) => setNewQueuePlayer(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-surface-2 border border-line text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
              />
              <select
                value={newQueueKit}
                onChange={(e) => setNewQueueKit(e.target.value as GamemodeId)}
                className="px-3.5 py-2 rounded-xl bg-surface-2 border border-line text-xs font-mono text-white focus:outline-none font-bold"
              >
                {GAMEMODES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl btn-vyntric-primary text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Enqueue Player</span>
              </button>
            </form>

            {/* 8 Gamemode Queue Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {GAMEMODES.map((g) => {
                const waitlist = queueWaitlists[g.id] || [];
                return (
                  <div key={g.id} className="p-4 rounded-2xl bg-[#090C18] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-line">
                      <div className="flex items-center gap-2">
                        <GamemodeIcon id={g.id} size={20} />
                        <span className="font-heading font-black text-sm text-white">{g.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-line text-[10px] font-mono text-brand-cyan font-bold">
                        {waitlist.length} waiting
                      </span>
                    </div>

                    {waitlist.length === 0 ? (
                      <div className="py-6 text-center text-muted/60 text-xs font-mono">
                        Queue is empty
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {waitlist.map((ign, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-line/40 text-xs font-mono">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={`https://mc-heads.net/head/${ign}/24`}
                                alt={ign}
                                className="w-5 h-5 rounded"
                              />
                              <span className="font-bold text-white truncate">#{idx + 1} {ign}</span>
                            </div>
                            <button
                              onClick={() => handleRemoveQueue(g.id, idx)}
                              className="text-muted hover:text-red-400 p-0.5"
                              title="Remove from queue"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 5: WEBSITE TEXTS & HERO CUSTOMIZER                   */}
        {/* ======================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-3xl p-6 rounded-3xl bg-[#090C18] border border-white/10 shadow-2xl space-y-6">
            <div>
              <h2 className="font-heading font-black text-xl text-white tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5 text-brand-cyan" />
                <span>Live Website Customizer & Text Overrides</span>
              </h2>
              <p className="text-xs font-mono text-muted">
                Modify website texts, headlines, Discord links, and maintenance status live.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Website settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-muted text-[11px] uppercase">Hero Headline Text</label>
                <input
                  type="text"
                  value={siteSettings.heroTitle}
                  onChange={(e) => setSiteSettingsState({ ...siteSettings, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-brand-cyan text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted text-[11px] uppercase">Hero Subtitle Text</label>
                <textarea
                  rows={2}
                  value={siteSettings.heroSubtitle}
                  onChange={(e) => setSiteSettingsState({ ...siteSettings, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-brand-cyan text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-muted text-[11px] uppercase">Official Discord Invite Link</label>
                  <input
                    type="url"
                    value={siteSettings.discordInviteUrl}
                    onChange={(e) => setSiteSettingsState({ ...siteSettings, discordInviteUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-brand-cyan text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted text-[11px] uppercase">Total Tests Audited (Stat Counter)</label>
                  <input
                    type="number"
                    value={siteSettings.totalTestsOverride}
                    onChange={(e) => setSiteSettingsState({ ...siteSettings, totalTestsOverride: parseInt(e.target.value) || 1248 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-brand-cyan text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-2 border border-line">
                <div>
                  <span className="font-bold text-white block">Emergency Maintenance Mode</span>
                  <span className="text-[11px] text-muted">When active, visitor traffic is greeted with maintenance notice</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSiteSettingsState({ ...siteSettings, maintenanceMode: !siteSettings.maintenanceMode })}
                  className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-all ${
                    siteSettings.maintenanceMode
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                      : "bg-white/10 text-muted"
                  }`}
                >
                  {siteSettings.maintenanceMode ? "ACTIVE (LOCKED)" : "DISABLED"}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl btn-vyntric-primary text-xs font-heading font-extrabold uppercase tracking-wider cursor-pointer"
              >
                Save Live Website Changes
              </button>
            </form>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 6: GLOBAL ANNOUNCEMENT BANNER                        */}
        {/* ======================================================= */}
        {activeTab === "announcement" && (
          <div className="max-w-2xl p-6 rounded-3xl bg-[#090C18] border border-white/10 shadow-2xl space-y-5">
            <div>
              <h2 className="font-heading font-black text-xl text-white tracking-tight flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-400" />
                <span>Global Site Announcement</span>
              </h2>
              <p className="text-xs font-mono text-muted">
                Display an emergency or event banner at the very top of the website for all visitors.
              </p>
            </div>

            {announcementSaved && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Announcement updated successfully!</span>
              </div>
            )}

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2 border border-line">
                <div>
                  <span className="font-bold text-white block">Banner Status</span>
                  <span className="text-[11px] text-muted">Toggle public visibility of announcement</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnnouncementEnabled(!announcementEnabled)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    announcementEnabled
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                      : "bg-white/10 text-muted"
                  }`}
                >
                  {announcementEnabled ? "ACTIVE (VISIBLE)" : "DISABLED"}
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted text-[11px] uppercase">Banner Text</label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-amber-400 text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveAnnouncement}
                className="w-full py-2.5 rounded-xl btn-vyntric-primary text-xs font-heading font-bold uppercase tracking-wider cursor-pointer"
              >
                Save Announcement
              </button>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 7: BACKUP & RESTORE ENGINE                           */}
        {/* ======================================================= */}
        {activeTab === "backup" && (
          <div className="max-w-3xl space-y-6">
            {/* Download Backup */}
            <div className="p-6 rounded-3xl bg-[#090C18] border border-white/10 shadow-2xl space-y-4">
              <div>
                <h2 className="font-heading font-black text-xl text-white tracking-tight flex items-center gap-2">
                  <Download className="w-5 h-5 text-brand-cyan" />
                  <span>Download Platform Database Backup</span>
                </h2>
                <p className="text-xs font-mono text-muted">
                  Export all 32+ combatants, verified tiers across all 8 gamemodes, duel history, and staff credentials.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-2 border border-line space-y-2 text-xs font-mono">
                <div className="flex justify-between text-muted">
                  <span>Combatants:</span>
                  <span className="font-bold text-white">{playersList.length}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Audited Tests:</span>
                  <span className="font-bold text-white">{testsList.length}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Council Members:</span>
                  <span className="font-bold text-white">{staffList.length}</span>
                </div>
              </div>

              <button
                onClick={handleExportBackup}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-cyan/20 to-brand-violet/20 hover:from-brand-cyan/30 hover:to-brand-violet/30 border border-brand-cyan/40 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Download className="w-4 h-4 text-brand-cyan" />
                <span>Export Master Backup (.json)</span>
              </button>
            </div>

            {/* Restore from JSON */}
            <div className="p-6 rounded-3xl bg-[#090C18] border border-white/10 shadow-2xl space-y-4">
              <div>
                <h2 className="font-heading font-black text-xl text-white tracking-tight flex items-center gap-2">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span>Restore Platform from JSON Payload</span>
                </h2>
                <p className="text-xs font-mono text-muted">
                  Paste a previously exported JSON backup payload to restore the entire platform state.
                </p>
              </div>

              {restoreStatus && (
                <div className={`p-3 rounded-xl text-xs font-mono ${
                  restoreStatus.startsWith("SUCCESS") ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300" : "bg-red-500/15 border border-red-500/40 text-red-300"
                }`}>
                  {restoreStatus}
                </div>
              )}

              <textarea
                rows={5}
                placeholder="Paste JSON backup payload here..."
                value={restoreJsonInput}
                onChange={(e) => setRestoreJsonInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-amber-400 text-xs font-mono text-white focus:outline-none"
              />

              <button
                onClick={handleRestoreJson}
                disabled={!restoreJsonInput.trim()}
                className="w-full py-2.5 rounded-xl btn-vyntric-primary text-xs font-heading font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40"
              >
                Restore Database
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* ADD / EDIT PLAYER MODAL                                    */}
      {/* ========================================================= */}
      {isPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0B0E1A] border border-[#FF2D55]/30 p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-heading font-black text-lg text-white">
                {editingPlayer ? `Edit Combatant: ${editingPlayer.username}` : "Add New Verified Combatant"}
              </h3>
              <button
                onClick={() => setIsPlayerModalOpen(false)}
                className="p-1 text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-muted text-[11px] uppercase">Minecraft IGN *</label>
                  <input
                    type="text"
                    placeholder="IGN"
                    value={playerFormIgn}
                    onChange={(e) => setPlayerFormIgn(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted text-[11px] uppercase">Region</label>
                  <select
                    value={playerFormRegion}
                    onChange={(e) => setPlayerFormRegion(e.target.value as Region)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none font-bold"
                  >
                    <option value="NA">NA (North America)</option>
                    <option value="EU">EU (Europe)</option>
                    <option value="AS">AS (Asia)</option>
                    <option value="AU">AU (Australia)</option>
                    <option value="SA">SA (South America)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted text-[11px] uppercase">Discord Handle</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={playerFormDiscord}
                    onChange={(e) => setPlayerFormDiscord(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#121626] border border-white/10 focus:border-[#FF2D55] text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Tiers for 8 Gamemodes */}
              <div className="space-y-2 pt-2 border-t border-line">
                <label className="text-muted text-[11px] uppercase block">
                  Assign Tiers across 8 Disciplines (Auto-Calculates Points)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {GAMEMODES.map((g) => (
                    <div key={g.id} className="p-2 rounded-xl bg-[#121626] border border-white/10 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <GamemodeIcon id={g.id} size={16} />
                        <span className="font-bold text-[11px] text-white truncate">{g.name}</span>
                      </div>
                      <select
                        value={playerFormKits[g.id] || "Unranked"}
                        onChange={(e) =>
                          setPlayerFormKits({ ...playerFormKits, [g.id]: e.target.value as Tier })
                        }
                        className="w-full px-2 py-1 rounded bg-[#090C18] border border-white/10 text-[11px] font-bold text-amber-300 focus:outline-none"
                      >
                        <option value="Unranked">Unranked</option>
                        <option value="HT1">HT1 (60 pts)</option>
                        <option value="LT1">LT1 (45 pts)</option>
                        <option value="HT2">HT2 (30 pts)</option>
                        <option value="LT2">LT2 (20 pts)</option>
                        <option value="HT3">HT3 (10 pts)</option>
                        <option value="LT3">LT3 (6 pts)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsPlayerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl btn-vyntric-primary font-bold"
                >
                  Save Combatant
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
