"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Trophy,
  Sparkles,
  Swords,
  Disc as DiscordIcon,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Calculator,
  Crown,
  Flame,
  Zap,
  RotateCcw,
  FileText,
  Check,
  X,
  ChevronRight,
  Cpu,
  Layers,
  Sliders,
  Scale,
} from "lucide-react";
import {
  TIER_ORDER,
  TIER_COLORS,
  TIER_POINTS,
  GAMEMODES,
  GAMEMODE_MAP,
  GamemodeId,
  Tier,
  getTitle,
} from "@/lib/tiers";
import { BrandLogo } from "@/components/icons/BrandLogo";
import { GamemodeIcon } from "@/components/icons/GamemodeIcons";

// ---------------------------------------------------------------------------
// 8 GAMEMODE TECHNICAL SPECIFICATIONS & LOADOUT CODEX
// ---------------------------------------------------------------------------
interface GamemodeRuleSpec {
  id: GamemodeId;
  name: string;
  category: "Sword & Mechanics" | "Explosives & Anchors" | "Potions & Survival";
  armor: string;
  primaryWeapon: string;
  utility: string[];
  food: string;
  format: string;
  keyMechanics: string[];
  bannedTactics: string[];
}

const GAMEMODE_SPECS: GamemodeRuleSpec[] = [
  {
    id: "sword",
    name: "Sword (1.9+ Normal Shield)",
    category: "Sword & Mechanics",
    armor: "Full Diamond Armor (Unenchanted / Prot 0)",
    primaryWeapon: "Netherite Sword (Sharpness V)",
    utility: ["1 Normal Shield (No unbreaking glitch)", "1 Golden Apple (Emergency reset)"],
    food: "64 Cooked Beef",
    format: "Best of 9 (First-to-5 rounds), Standard flat arena (30x30 blocks)",
    keyMechanics: [
      "W-Tap & S-Tap sprint-reset spacing to maximize critical attack vectors",
      "Shield-timing discipline to nullify incoming crits without shield stun penalty",
      "Strafing locks and knockback redirection at 1.9+ attack cooldown recovery (100% recharge)",
    ],
    bannedTactics: [
      "Shield-switch hotbar desync exploit",
      "Run-away stalling exceeding 15 seconds without engaging",
      "Off-hand block-glitch inventory toggles",
    ],
  },
  {
    id: "vanilla",
    name: "Vanilla (Crystal & Respawn Anchor)",
    category: "Explosives & Anchors",
    armor: "Full Netherite Armor (Protection IV, Unbreaking III)",
    primaryWeapon: "Netherite Sword (Sharp V), Heavy Mace",
    utility: [
      "64 End Crystals & 64 Obsidian blocks",
      "64 Respawn Anchors & 64 Glowstone blocks",
      "8 Totems of Undying (Active off-hand + hotbar slots)",
      "Crossbow (Quick Charge III, Piercing IV)",
    ],
    food: "64 Golden Carrots, 8 Enchanted Golden Apples",
    format: "Best of 9 (First-to-5 rounds), Netherrack/Obsidian blast-proof ring (40x40)",
    keyMechanics: [
      "Sub-tick double-crystal popping and double-anchor blast placement",
      "Totem cycling with hotbar re-slotting under 0.15s reaction threshold",
      "Shield block detonation deflection to survive point-blank zero-y explosions",
    ],
    bannedTactics: [
      "Ceiling anchor traps above 12 blocks height limit",
      "Anchor spamming inside unbreakable world border pockets",
      "Inventory desync double-totem auto-rearming macros",
    ],
  },
  {
    id: "uhc",
    name: "UHC (Ultra Hardcore Duels)",
    category: "Potions & Survival",
    armor: "Full Diamond Armor (Protection II, Unbreaking III)",
    primaryWeapon: "Diamond Sword (Sharpness III)",
    utility: [
      "Bow (Power III) with 32 Arrows",
      "6 Standard Golden Apples",
      "2 Golden Heads (+4 hearts absorption, 9s Regeneration II)",
      "1 Water Bucket & 1 Lava Bucket",
      "64 Cobblestone for defensive walling",
    ],
    food: "Natural regeneration is strictly DISABLED (Heal only via Apples/Heads)",
    format: "Best of 9 (First-to-5 rounds), Natural terrain simulation arena (45x45)",
    keyMechanics: [
      "Lava-trapping and instant water-pickup momentum counters",
      "Fishing rod and arrow knockback disruption before sword trade execution",
      "Golden Head consumption pacing to synchronize absorption with incoming damage bursts",
    ],
    bannedTactics: [
      "Skybasing higher than 10 blocks",
      "Running outside the combat circle for more than 10 seconds",
      "Bucket duplication or ghost block exploits",
    ],
  },
  {
    id: "pot",
    name: "Pot / Nodebuff (Speed II & Health II)",
    category: "Potions & Survival",
    armor: "Full Diamond Armor (Protection IV, Unbreaking III)",
    primaryWeapon: "Diamond Sword (Sharpness V, Fire Aspect II)",
    utility: [
      "28 Splash Potions of Healing II (Instant Health)",
      "4 Potion of Speed II (1:30 duration)",
      "1 Potion of Fire Resistance (8:00 duration)",
      "1 Ender Pearl (For tactical repositioning / clutch resets)",
    ],
    food: "64 Cooked Porkchops",
    format: "Best of 9 (First-to-5 rounds), Hard clay enclosed arena (35x35)",
    keyMechanics: [
      "Up-potting and down-potting while maintaining uninterrupted sprint momentum",
      "Speed II strafe-locking to break opponent hitboxes while chaining 4-5 hit combos",
      "Potion management efficiency — minimizing thrown pot wastage to win potion endurance battles",
    ],
    bannedTactics: [
      "Throwing potions outside the arena barrier",
      "Ender pearl camping in high out-of-reach boundary perches",
      "Auto-potting or hotkey auto-throw macros",
    ],
  },
  {
    id: "nethop",
    name: "NethOP (Netherite Overpowered)",
    category: "Potions & Survival",
    armor: "Full Netherite Armor (Protection IV, Unbreaking III)",
    primaryWeapon: "Netherite Sword (Sharpness V, Knockback II)",
    utility: [
      "Splash Potions of Strength II (1:30)",
      "Splash Potions of Speed II (1:30)",
      "24 Splash Potions of Healing II",
      "Netherite Axe (Efficiency V, Sharpness V)",
    ],
    food: "64 Cooked Beef",
    format: "Best of 9 (First-to-5 rounds), Reinforced obsidian chamber (35x35)",
    keyMechanics: [
      "Trading with Strength II buff active while counter-shielding high-damage swings",
      "Armor durability awareness during prolonged high-damage trades",
      "Knockback II trajectory management against arena borders",
    ],
    bannedTactics: [
      "Hiding behind unbreachable obstacles to run out opponent potion timers",
      "Shield glitch swap mechanics",
      "Macro potion cycling",
    ],
  },
  {
    id: "smp",
    name: "SMP (Axe, Shield & Crossbow)",
    category: "Sword & Mechanics",
    armor: "Full Diamond Armor (Protection III)",
    primaryWeapon: "Diamond Axe (Sharpness IV, Efficiency IV)",
    utility: [
      "1 Shield (Custom cooldown reset)",
      "Crossbow (Quick Charge III, Piercing IV) with 16 Firework Rockets",
      "1 Water Bucket",
      "2 Golden Apples",
    ],
    food: "64 Cooked Beef",
    format: "Best of 9 (First-to-5 rounds), Forest/Plains obstacle arena (40x40)",
    keyMechanics: [
      "Disabling opponent shield for 5 seconds using Axe critical attacks",
      "Quick Charge III Crossbow bursting during opponent shield stun windows",
      "Water bucket drop to negate explosive kinetic firework momentum",
    ],
    bannedTactics: [
      "Elytra flight during active duels",
      "Infinity bow spam from render-distance perches",
      "Firework multishot close-quarter spawn glitching",
    ],
  },
  {
    id: "axe",
    name: "Axe (Shield Disable & Crit Trading)",
    category: "Sword & Mechanics",
    armor: "Full Diamond Armor (Unenchanted / Prot 0)",
    primaryWeapon: "Diamond Axe (Sharpness V)",
    utility: ["1 Shield (Standard vanilla 5-second disable cooldown)"],
    food: "64 Cooked Beef",
    format: "Best of 9 (First-to-5 rounds), Clean flat arena (25x25)",
    keyMechanics: [
      "Precision jump-critting to bypass and break opponent guard instantly",
      "Weapon swapping to punch or sprint-tap during shield disable recovery",
      "Counter-spacing: forcing missed axe swings to punish during weapon recharge",
    ],
    bannedTactics: [
      "Shield-switching double-inventory exploits",
      "Passive back-pedaling without trade engagement",
      "Ghost shield desync manipulation",
    ],
  },
  {
    id: "mace",
    name: "Mace (1.21 Heavy Mace & Wind Charge)",
    category: "Explosives & Anchors",
    armor: "Full Netherite Armor (Protection IV)",
    primaryWeapon: "Heavy Mace (Density V, Breach IV, Wind Burst III)",
    utility: [
      "32 Wind Charges (For vertical lift and kinetic smash attacks)",
      "Netherite Sword (Sharpness V)",
      "1 Shield",
      "4 Golden Apples",
    ],
    food: "64 Cooked Beef",
    format: "Best of 9 (First-to-5 rounds), High-ceiling vertical colosseum (40x40x25)",
    keyMechanics: [
      "Wind Charge chaining to gain 10-15 blocks altitude for 1-hit lethal smash attacks",
      "Breach IV execution to bypass 60% of opponent Netherite armor protection",
      "Mid-air smash hit landing to trigger Wind Burst III upward bounce recursion",
    ],
    bannedTactics: [
      "Exceeding 22 blocks vertical altitude limit",
      "Wind charge boundary camping out of player attack range",
      "Disconnecting mid-fall to reset kinetic momentum",
    ],
  },
];

// ---------------------------------------------------------------------------
// PRESTIGE COMBAT TITLES HIERARCHY
// ---------------------------------------------------------------------------
const TITLE_TIERS = [
  {
    id: "grandmaster",
    title: "👑 Combat Grandmaster",
    range: "250+ pts",
    minPts: 250,
    accent: "from-amber-400 via-rose-500 to-amber-300",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "border-amber-500/50",
    description: "The pinnacle of competitive Minecraft PvP. Reserved for legends holding Tier 1 in multiple ladders simultaneously.",
    perks: [
      "Permanent gold-embossed Discord badge & profile banner",
      "Automatic VIP seeding in official Vyntric seasonal tournaments",
      "Council voting rights on ladder meta adjustments and tester accreditations",
      "Immunity to short-term ranking decay",
    ],
  },
  {
    id: "master",
    title: "⚔️ Combat Master",
    range: "180–249 pts",
    minPts: 180,
    accent: "from-amber-400 to-amber-300",
    color: "#FBBF24",
    bg: "rgba(251, 191, 36, 0.10)",
    border: "border-amber-400/40",
    description: "Dominant competitive combatant with consistent High Tier placements across 4 or more specialized PvP ladders.",
    perks: [
      "Accredited Guest Tester eligibility",
      "Direct challenge priority against Tier 1 champions",
      "Featured on global champion marquee leaderboard",
      "30-day decay buffer protection",
    ],
  },
  {
    id: "ace",
    title: "🔥 Combat Ace",
    range: "110–179 pts",
    minPts: 110,
    accent: "from-rose-500 to-rose-400",
    color: "#F43F5E",
    bg: "rgba(244, 63, 94, 0.10)",
    border: "border-rose-500/40",
    description: "Elite combatant with proven mastery across multiple competitive kits and high duel retention rates.",
    perks: [
      "Access to official high-tier private scrim matchmaking",
      "Priority queue status during peak testing hours",
      "Custom verified discord role badge",
    ],
  },
  {
    id: "specialist",
    title: "⚡ Combat Specialist",
    range: "60–109 pts",
    minPts: 60,
    accent: "from-violet-400 to-violet-300",
    color: "#A78BFA",
    bg: "rgba(167, 139, 250, 0.10)",
    border: "border-violet-500/40",
    description: "Solid, battle-hardened competitor with established verified tier placements in core competitive disciplines.",
    perks: [
      "Standard Discord queue access",
      "Eligible for official tier review retests every 7 days",
      "Detailed combat statistics telemetry tracking",
    ],
  },
  {
    id: "cadet",
    title: "🛡️ Combat Cadet",
    range: "30–59 pts",
    minPts: 30,
    accent: "from-emerald-400 to-emerald-300",
    color: "#34D399",
    bg: "rgba(52, 211, 153, 0.10)",
    border: "border-emerald-500/40",
    description: "Recognized competitor with at least one verified tier placement and audited live duel match logs.",
    perks: [
      "Public profile on Vyntric global rankings hub",
      "Eligible for promotion audit duels",
    ],
  },
  {
    id: "novice",
    title: "🗡️ Combat Novice",
    range: "1–29 pts",
    minPts: 1,
    accent: "from-slate-400 to-slate-300",
    color: "#94A3B8",
    bg: "rgba(148, 163, 184, 0.08)",
    border: "border-slate-500/30",
    description: "Initial competitive tier placement. Entering the official Vyntric ranked circuit.",
    perks: [
      "Free automated test ticket generation",
      "Basic duel audit telemetry",
    ],
  },
];

export default function RulesPage() {
  const [activeTab, setActiveTab] = useState<
    "calculator" | "points" | "titles" | "loadouts" | "testing" | "anticheat"
  >("calculator");

  // Real-Time Points & Title Calculator State
  const [calcKits, setCalcKits] = useState<Record<string, Tier>>({
    sword: "HT1",
    vanilla: "HT1",
    uhc: "HT2",
    pot: "HT2",
    nethop: "LT2",
    smp: "HT3",
    axe: "HT3",
    mace: "LT3",
  });

  // Calculate live score
  const totalCalculatedPoints = useMemo(() => {
    return Object.values(calcKits).reduce((sum, tier) => {
      return sum + (TIER_POINTS[tier] || 0);
    }, 0);
  }, [calcKits]);

  // Current title based on score
  const currentTitle = useMemo(() => {
    return getTitle(totalCalculatedPoints);
  }, [totalCalculatedPoints]);

  // Next title milestone
  const nextMilestone = useMemo(() => {
    for (const t of TITLE_TIERS) {
      if (t.minPts > totalCalculatedPoints) {
        return {
          title: t.title,
          target: t.minPts,
          needed: t.minPts - totalCalculatedPoints,
          pct: Math.min(100, Math.round((totalCalculatedPoints / t.minPts) * 100)),
        };
      }
    }
    return null; // Already max (Grandmaster)
  }, [totalCalculatedPoints]);

  // Presets for quick demonstration
  const applyPreset = (preset: "clownpierce" | "marlowww" | "swight" | "reset") => {
    if (preset === "clownpierce") {
      setCalcKits({
        sword: "HT1",
        vanilla: "HT1",
        uhc: "HT1",
        pot: "HT1",
        nethop: "HT1",
        smp: "HT2",
        axe: "HT1",
        mace: "HT2",
      });
    } else if (preset === "marlowww") {
      setCalcKits({
        sword: "HT1",
        vanilla: "HT1",
        uhc: "HT1",
        pot: "HT1",
        nethop: "HT2",
        smp: "HT2",
        axe: "HT1",
        mace: "LT2",
      });
    } else if (preset === "swight") {
      setCalcKits({
        sword: "HT1",
        vanilla: "HT2",
        uhc: "HT1",
        pot: "HT1",
        nethop: "HT1",
        smp: "LT2",
        axe: "HT2",
        mace: "HT3",
      });
    } else {
      setCalcKits({
        sword: "Unranked",
        vanilla: "Unranked",
        uhc: "Unranked",
        pot: "Unranked",
        nethop: "Unranked",
        smp: "Unranked",
        axe: "Unranked",
        mace: "Unranked",
      });
    }
  };

  const tabs = [
    { id: "calculator", label: "Points Calculator", icon: Calculator },
    { id: "points", label: "Points Matrix", icon: Scale },
    { id: "titles", label: "Combat Titles", icon: Crown },
    { id: "loadouts", label: "8 Gamemode Loadouts", icon: Swords },
    { id: "testing", label: "1v1 Test Protocol", icon: CheckCircle2 },
    { id: "anticheat", label: "Anti-Cheat & Clients", icon: Shield },
  ];

  return (
    <div className="py-8 sm:py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 select-none">
      {/* ========================================================= */}
      {/* 1. HEADER: OFFICIAL VYNTRIC CODEX                         */}
      {/* ========================================================= */}
      <div className="text-center space-y-3 pb-8 border-b border-line">
        <div className="flex justify-center">
          <BrandLogo size={68} glow />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF2D55]/15 border border-[#FF2D55]/30 text-[#FF2D55] text-xs font-mono font-bold shadow-[0_0_15px_rgba(255,45,85,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OFFICIAL VYNTRIC COMPETITIVE CODEX</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-text tracking-tight">
          Scoring Rules & Testing Standards
        </h1>
        <p className="text-muted text-sm sm:text-base max-w-2xl mx-auto font-mono leading-relaxed">
          The official mathematical points matrix, accredited 1v1 testing protocols, gamemode equipment specifications, and combat prestige titles.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 2. FLUID CODEX TABS NAVIGATION                           */}
      {/* ========================================================= */}
      <div className="p-1.5 rounded-2xl bg-[#090C15]/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-xs sm:text-sm font-bold transition-all select-none ${
                  isActive ? "text-white" : "text-muted hover:text-text hover:bg-surface-2/60"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="codex-active-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF2D55] via-[#E11D48] to-[#7C3AED] shadow-[0_0_20px_rgba(255,45,85,0.45)] ring-1 ring-white/20 -z-10"
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TAB CONTENT SECTIONS                                   */}
      {/* ========================================================= */}
      <AnimatePresence mode="wait">
        {/* ======================================================= */}
        {/* TAB 1: INTERACTIVE REAL-TIME POINTS & TITLE CALCULATOR   */}
        {/* ======================================================= */}
        {activeTab === "calculator" && (
          <motion.div
            key="tab-calculator"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Live Score Telemetry Hero Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0D1222] via-[#090D18] to-[#070910] border border-[#FF2D55]/35 shadow-[0_12px_45px_rgba(0,0,0,0.8),0_0_30px_rgba(255,45,85,0.15)] relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#22D3EE]/10 blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#FF2D55]/12 blur-[80px] pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: Total Score Display */}
                <div className="lg:col-span-5 space-y-3 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-2 border border-line text-[11px] font-mono text-muted">
                    <Calculator className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>REAL-TIME SCORING SIMULATOR</span>
                  </div>

                  <div className="flex items-baseline justify-center lg:justify-start gap-3">
                    <span className="font-heading font-black text-6xl sm:text-7xl text-white tracking-tight leading-none drop-shadow-[0_0_25px_rgba(34,211,238,0.4)]">
                      {totalCalculatedPoints}
                    </span>
                    <span className="font-mono text-base sm:text-lg font-bold text-muted uppercase">
                      / 480 Max Pts
                    </span>
                  </div>

                  <p className="text-xs font-mono text-muted leading-relaxed">
                    Adjust your verified tier in each of the 8 specialized gamemode ladders below to calculate your live total and combat title.
                  </p>

                  {/* Quick Preset Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <span className="text-[10px] font-mono text-muted/70 uppercase tracking-wider block w-full text-center lg:text-left">
                      Test Loadout Presets:
                    </span>
                    <button
                      onClick={() => applyPreset("clownpierce")}
                      className="px-2.5 py-1 rounded-lg bg-[#141C30] hover:bg-[#FF2D55]/20 border border-line hover:border-[#FF2D55]/50 text-xs font-mono font-bold text-text hover:text-white transition-all cursor-pointer"
                    >
                      👑 ClownPierce (365 pts)
                    </button>
                    <button
                      onClick={() => applyPreset("marlowww")}
                      className="px-2.5 py-1 rounded-lg bg-[#141C30] hover:bg-[#FF2D55]/20 border border-line hover:border-[#FF2D55]/50 text-xs font-mono font-bold text-text hover:text-white transition-all cursor-pointer"
                    >
                      ⚔️ Marlowww (345 pts)
                    </button>
                    <button
                      onClick={() => applyPreset("swight")}
                      className="px-2.5 py-1 rounded-lg bg-[#141C30] hover:bg-[#FF2D55]/20 border border-line hover:border-[#FF2D55]/50 text-xs font-mono font-bold text-text hover:text-white transition-all cursor-pointer"
                    >
                      🔥 Swight (295 pts)
                    </button>
                    <button
                      onClick={() => applyPreset("reset")}
                      className="p-1 rounded-lg bg-surface-2 hover:bg-surface border border-line text-muted hover:text-text transition-all cursor-pointer"
                      title="Reset all kits to Unranked"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right: Computed Combat Title & Next Milestone Progress */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-[#070A12]/80 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-line/60">
                    <div>
                      <span className="text-[10px] font-mono text-muted uppercase tracking-widest block">
                        COMPUTED PRESTIGE TITLE
                      </span>
                      <span className="font-heading font-black text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-amber-200">
                        {currentTitle.name}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Progress to Next Milestone */}
                  {nextMilestone ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-muted">
                          Next Rank: <strong className="text-white">{nextMilestone.title}</strong>
                        </span>
                        <span className="font-bold text-brand-cyan">
                          +{nextMilestone.needed} pts needed
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF2D55] via-[#22D3EE] to-amber-400 transition-all duration-300"
                          style={{ width: `${nextMilestone.pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs font-mono text-amber-300 font-bold text-center">
                      🏆 MAXIMUM COMBAT GRANDMASTER PRESTIGE ACHIEVED!
                    </div>
                  )}

                  {/* Mathematical Formula Preview */}
                  <div className="p-2.5 rounded-xl bg-[#04060A] border border-white/5 font-mono text-[11px] text-muted flex items-center justify-between">
                    <span>Formula: Total Score = Σ TierPoints(Kit)</span>
                    <span className="text-emerald-400 font-bold">Diminishing Decay Resilient</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8 Gamemode Tier Selectors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {GAMEMODE_SPECS.map((spec) => {
                const currentTier = calcKits[spec.id] || "Unranked";
                const color = TIER_COLORS[currentTier];
                const pts = TIER_POINTS[currentTier] || 0;

                return (
                  <div
                    key={spec.id}
                    className="p-4 rounded-2xl bg-surface-2/90 border border-line hover:border-line-strong transition-all space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#121829] border border-line flex items-center justify-center p-1 shrink-0">
                          <GamemodeIcon id={spec.id} size={20} />
                        </div>
                        <span className="font-heading font-extrabold text-sm text-text">
                          {spec.name.split(" ")[0]}
                        </span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-md font-mono text-xs font-bold border"
                        style={{
                          color,
                          backgroundColor: `${color}15`,
                          borderColor: `${color}35`,
                        }}
                      >
                        +{pts} pts
                      </span>
                    </div>

                    {/* Quick Tier Selector Pills */}
                    <div className="grid grid-cols-3 gap-1 text-[10px] font-mono font-bold">
                      {(["HT1", "LT1", "HT2", "LT2", "HT3", "LT3"] as Tier[]).map((t) => {
                        const isSelected = currentTier === t;
                        return (
                          <button
                            key={t}
                            onClick={() => setCalcKits((prev) => ({ ...prev, [spec.id]: t }))}
                            className={`py-1 rounded border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-white text-black border-white shadow-sm font-black"
                                : "bg-black/30 hover:bg-surface border-line text-muted hover:text-white"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-line/40 text-[10px] font-mono">
                      <button
                        onClick={() =>
                          setCalcKits((prev) => ({
                            ...prev,
                            [spec.id]: currentTier === "HT4" ? "LT4" : currentTier === "HT5" ? "LT5" : "HT4",
                          }))
                        }
                        className="text-muted hover:text-brand-cyan transition-colors"
                      >
                        Tier 4 / Tier 5
                      </button>
                      <button
                        onClick={() => setCalcKits((prev) => ({ ...prev, [spec.id]: "Unranked" }))}
                        className="text-muted/60 hover:text-rose-400 transition-colors"
                      >
                        Unrank
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: POINTS MATRIX & MATHEMATICAL PROPERTIES           */}
        {/* ======================================================= */}
        {activeTab === "points" && (
          <motion.div
            key="tab-points"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <h2 className="font-heading font-black text-2xl text-text flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-amber-400" />
                <span>Points Matrix per Tier Placement</span>
              </h2>
              <p className="text-sm font-mono text-muted leading-relaxed">
                The Vyntric competitive standard assigns non-linear leaderboard weights to each tier placement. High Tier placements carry a significant premium reflecting the exponential skill gap required to secure promotion past Tier 3.
              </p>
            </div>

            {/* 10-Tier Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              {[
                { tier: "HT1", pts: 60, title: "Mythic High Tier", bracket: "Tier 1", share: "12.5%" },
                { tier: "LT1", pts: 45, title: "Mythic Low Tier", bracket: "Tier 1", share: "9.4%" },
                { tier: "HT2", pts: 30, title: "Diamond High Tier", bracket: "Tier 2", share: "6.3%" },
                { tier: "LT2", pts: 20, title: "Diamond Low Tier", bracket: "Tier 2", share: "4.2%" },
                { tier: "HT3", pts: 10, title: "Master High Tier", bracket: "Tier 3", share: "2.1%" },
                { tier: "LT3", pts: 6, title: "Master Low Tier", bracket: "Tier 3", share: "1.3%" },
                { tier: "HT4", pts: 4, title: "Adept High Tier", bracket: "Tier 4", share: "0.8%" },
                { tier: "LT4", pts: 3, title: "Adept Low Tier", bracket: "Tier 4", share: "0.6%" },
                { tier: "HT5", pts: 2, title: "Challenger High Tier", bracket: "Tier 5", share: "0.4%" },
                { tier: "LT5", pts: 1, title: "Challenger Low Tier", bracket: "Tier 5", share: "0.2%" },
              ].map((item) => {
                const color = TIER_COLORS[item.tier as Tier];
                return (
                  <div
                    key={item.tier}
                    className="p-4 rounded-2xl bg-surface-2 border flex flex-col justify-between text-center space-y-2 shadow-lg transition-transform hover:-translate-y-1"
                    style={{ borderColor: `${color}40`, boxShadow: `0 0 16px ${color}12` }}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-muted uppercase tracking-wider block">
                        {item.bracket}
                      </span>
                      <span className="font-heading font-black text-2xl" style={{ color }}>
                        {item.tier}
                      </span>
                    </div>

                    <div className="my-1">
                      <span className="font-heading font-black text-xl text-white block">
                        +{item.pts} pts
                      </span>
                      <span className="text-[10.5px] font-mono text-muted/80 block mt-0.5">
                        {item.title}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-line/40 text-[9.5px] font-mono text-muted">
                      Weight: <strong className="text-white">{item.share}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Core Mathematical Properties */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-2xl bg-surface-2 border border-line space-y-2">
                <div className="flex items-center gap-2 text-text font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cumulative Non-Punitive Sum</span>
                </div>
                <p className="text-xs text-muted font-mono leading-relaxed">
                  Points from all verified kits add together linearly. Playing and securing a tier in a new kit can never reduce a combatant&apos;s total points.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 border border-line space-y-2">
                <div className="flex items-center gap-2 text-text font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cross-Ladder Synergy</span>
                </div>
                <p className="text-xs text-muted font-mono leading-relaxed">
                  Specializing in only 1 kit caps a combatant at 60 points (Combat Specialist). Reaching Grandmaster (250+ pts) strictly requires mastery across multiple gamemodes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 border border-line space-y-2">
                <div className="flex items-center gap-2 text-text font-bold text-sm">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Inactivity Buffer Protection</span>
                </div>
                <p className="text-xs text-muted font-mono leading-relaxed">
                  Verified tiers remain active for 60 days before entering the grace period. Retesting within 60 days resets the activity clock immediately.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: COMBAT TITLES HIERARCHY                          */}
        {/* ======================================================= */}
        {activeTab === "titles" && (
          <motion.div
            key="tab-titles"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <h2 className="font-heading font-black text-2xl text-text flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Prestige Combat Titles Hierarchy</span>
              </h2>
              <p className="text-sm font-mono text-muted leading-relaxed">
                Combat titles are the definitive public signifier of prestige on Vyntric. They are calculated dynamically from a combatant&apos;s total verified points.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TITLE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  className={`p-5 sm:p-6 rounded-2xl border ${tier.border} space-y-4 shadow-lg transition-transform hover:-translate-y-0.5`}
                  style={{ backgroundColor: tier.bg }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3
                        className={`font-heading font-black text-xl text-transparent bg-clip-text bg-gradient-to-r ${tier.accent}`}
                      >
                        {tier.title}
                      </h3>
                      <p className="text-xs font-mono text-muted mt-1 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-lg font-mono font-black text-xs border shrink-0 shadow-sm"
                      style={{
                        color: tier.color,
                        borderColor: `${tier.color}40`,
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      {tier.range}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-line/40 space-y-2">
                    <span className="text-[10px] font-mono text-muted/70 uppercase tracking-widest block font-bold">
                      Prestige Entitlements:
                    </span>
                    <ul className="space-y-1.5 text-xs font-mono text-text/80">
                      {tier.perks.map((perk, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 shrink-0" style={{ color: tier.color }} />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======================================================= */}
        {/* TAB 4: 8 GAMEMODE TECHNICAL LOADOUT CODEX                */}
        {/* ======================================================= */}
        {activeTab === "loadouts" && (
          <motion.div
            key="tab-loadouts"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <h2 className="font-heading font-black text-2xl text-text flex items-center gap-2.5">
                <Swords className="w-5 h-5 text-brand-cyan" />
                <span>Standard Gamemode Equipment & Duel Rules</span>
              </h2>
              <p className="text-sm font-mono text-muted leading-relaxed">
                Every official Vyntric 1v1 tier audit is conducted in a strictly standardized Minecraft environment. Below are the official equipment specifications and banned tactics for all 8 competitive disciplines.
              </p>
            </div>

            <div className="space-y-4">
              {GAMEMODE_SPECS.map((spec) => (
                <div
                  key={spec.id}
                  className="p-5 sm:p-6 rounded-2xl bg-surface-2/90 border border-line space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#121829] border border-line flex items-center justify-center p-1.5 shadow-md shrink-0">
                        <GamemodeIcon id={spec.id} size={26} />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-text">
                          {spec.name}
                        </h3>
                        <span className="text-[10px] font-mono text-brand-cyan uppercase tracking-wider block">
                          Discipline: {spec.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface border border-line text-muted font-bold self-start sm:self-auto">
                      {spec.format}
                    </span>
                  </div>

                  {/* Loadout Specifications Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-[#080B14] border border-white/5 space-y-1">
                      <span className="text-[10px] text-muted uppercase tracking-wider block">ARMOR SPEC</span>
                      <span className="text-white font-bold block">{spec.armor}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#080B14] border border-white/5 space-y-1">
                      <span className="text-[10px] text-muted uppercase tracking-wider block">PRIMARY WEAPON</span>
                      <span className="text-amber-400 font-bold block">{spec.primaryWeapon}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#080B14] border border-white/5 space-y-1">
                      <span className="text-[10px] text-muted uppercase tracking-wider block">FOOD & SATURATION</span>
                      <span className="text-emerald-400 font-bold block">{spec.food}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#080B14] border border-white/5 space-y-1">
                      <span className="text-[10px] text-muted uppercase tracking-wider block">UTILITY ITEMS</span>
                      <span className="text-brand-cyan font-bold block truncate" title={spec.utility.join(", ")}>
                        {spec.utility.join(", ")}
                      </span>
                    </div>
                  </div>

                  {/* Key Mechanics vs Forbidden Tactics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Core Tactical Standards</span>
                      </span>
                      <ul className="space-y-1 text-muted">
                        {spec.keyMechanics.map((m, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 shrink-0">•</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1.5">
                      <span className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Forbidden Exploits & Disqualification Triggers</span>
                      </span>
                      <ul className="space-y-1 text-muted">
                        {spec.bannedTactics.map((b, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400 shrink-0">✕</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======================================================= */}
        {/* TAB 5: ACCREDITED 1V1 TESTING AUDIT PROTOCOL             */}
        {/* ======================================================= */}
        {activeTab === "testing" && (
          <motion.div
            key="tab-testing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <h2 className="font-heading font-black text-2xl text-text flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Accredited 1v1 Tier Testing Protocol</span>
              </h2>
              <p className="text-sm font-mono text-muted leading-relaxed">
                Vyntric tier placements are verified strictly through live combat audits conducted by accredited council testers on verified neutral ping nodes.
              </p>
            </div>

            {/* Duel Score Outcome Matrix */}
            <div className="p-6 rounded-2xl bg-surface-2 border border-line space-y-4">
              <h3 className="font-heading font-black text-lg text-text">
                Bo9 First-to-5 Round Outcome Decision Matrix
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1 text-center">
                  <span className="font-black text-lg text-emerald-400 block">5 - 0 or 5 - 1</span>
                  <span className="font-bold text-white block uppercase">High Tier Promotion (HT)</span>
                  <p className="text-[10px] text-muted">Clean dominance over accredited tester benchmark</p>
                </div>

                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1 text-center">
                  <span className="font-black text-lg text-brand-cyan block">5 - 2 or 5 - 3</span>
                  <span className="font-bold text-white block uppercase">Low Tier Promotion (LT)</span>
                  <p className="text-[10px] text-muted">Clear competitive superiority across round cycles</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-center">
                  <span className="font-black text-lg text-amber-400 block">5 - 4 Win / Loss</span>
                  <span className="font-bold text-white block uppercase">Retention / Re-Match</span>
                  <p className="text-[10px] text-muted">Tester discretion or instant tiebreaker round</p>
                </div>

                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1 text-center">
                  <span className="font-black text-lg text-rose-400 block">0 - 5 to 3 - 5 Loss</span>
                  <span className="font-bold text-white block uppercase">Retention or Demotion</span>
                  <p className="text-[10px] text-muted">Demotion only if candidate has active rank decay</p>
                </div>
              </div>
            </div>

            {/* Verification Rules & Standards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-surface-2 border border-line space-y-2">
                <div className="flex items-center gap-2 text-text font-bold text-sm">
                  <Cpu className="w-4 h-4 text-brand-cyan" />
                  <span>Dual 60 FPS Recording Mandate</span>
                </div>
                <p className="text-xs text-muted font-mono leading-relaxed">
                  Both candidate and tester must record full-match POV at minimum 60fps with visible key-strokes and latency telemetry. Recordings are preserved for 30 days for public dispute review.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 border border-line space-y-2">
                <div className="flex items-center gap-2 text-text font-bold text-sm">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Neutral Ping Node Selection</span>
                </div>
                <p className="text-xs text-muted font-mono leading-relaxed">
                  Tests occur on dedicated 20 TPS tick-stabilized proxy servers across NA (Virginia), EU (Frankfurt), AS (Singapore), and SA (São Paulo) to guarantee fair latency parity (delta &lt; 35ms).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-2 border border-line space-y-2">
                <div className="flex items-center gap-2 text-text font-bold text-sm">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Retest Cooldown Intervals</span>
                </div>
                <p className="text-xs text-muted font-mono leading-relaxed">
                  14 days upon promotion, 7 days upon retention, and 3 days upon demotion. This prevents queue flooding and ensures combatants train before challenging higher brackets.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================= */}
        {/* TAB 6: ANTI-CHEAT & CLIENT INTEGRITY                     */}
        {/* ======================================================= */}
        {activeTab === "anticheat" && (
          <motion.div
            key="tab-anticheat"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <h2 className="font-heading font-black text-2xl text-text flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-rose-500" />
                <span>Anti-Cheat & Client Integrity Regulations</span>
              </h2>
              <p className="text-sm font-mono text-muted leading-relaxed">
                Vyntric maintains zero tolerance for illegitimate competitive advantages. All matches are monitored by server-side tick telemetry and subject to random post-match screen-share audits.
              </p>
            </div>

            {/* Permitted vs Prohibited Client Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Allowed Clients */}
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Permitted Clients & Modifications</span>
                </div>
                <ul className="space-y-2 text-xs font-mono text-muted">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Lunar Client & Badlion Client:</strong> Latest official release with built-in anti-cheat toggle active.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Feather Client & Official Vanilla:</strong> Standard unmodified vanilla launcher.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Fabric Performance Suite:</strong> Sodium, Lithium, Iris, FerriteCore, Entity Culling, Krypton (Zero game-physics modification).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Cosmetics & HUD:</strong> ArmorStatusHUD, Keystrokes, CPS counter, Custom crosshairs.</span>
                  </li>
                </ul>
              </div>

              {/* Forbidden Modifications */}
              <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/25 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Strictly Forbidden Modifications</span>
                </div>
                <ul className="space-y-2 text-xs font-mono text-muted">
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Reach & Hitbox Modification:</strong> Any attack reach exceeding 3.00 blocks or expanded entity boundary boxes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Velocity / Anti-Knockback:</strong> Horizontal or vertical knockback reduction under 100%.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Hardware & Software Macros:</strong> Auto-clickers exceeding 20 CPS, auto-totem, auto-pot, or macro hotbar re-slotting.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span><strong>Ghost & Trigger Mechanics:</strong> Aim-assist, triggerbot, freecam, or desync packet injects.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Escalation Policy Banner */}
            <div className="p-5 rounded-2xl bg-[#090D18] border border-rose-500/30 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-heading font-black text-sm text-rose-400 uppercase">
                  Blacklist & Sanction Policy
                </span>
                <p className="text-xs font-mono text-muted leading-relaxed">
                  First infraction results in permanent exclusion from all Vyntric competitive ladders, revocation of all historical points, and cross-league reporting.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-mono font-bold shrink-0">
                Zero Tolerance
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. CALL TO ACTION: JOIN DISCORD QUEUE                    */}
      {/* ========================================================= */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0C101B] via-[#090D18] to-[#0A0D15] border border-[#FF2D55]/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,45,85,0.12),_transparent_70%)] pointer-events-none" />
        <h3 className="font-heading font-black text-2xl sm:text-3xl text-text">
          Ready to Claim Your Competitive Tier?
        </h3>
        <p className="text-xs sm:text-sm text-muted max-w-xl mx-auto font-mono leading-relaxed">
          Join the official Vyntric Discord queue, open an automated test ticket, select your preferred gamemode ladder, and face accredited council testers in live first-to-5 duels.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="https://discord.gg/RESuGyFwJ3"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-vyntric-primary inline-flex items-center gap-2 px-6 py-3.5 text-sm font-mono tracking-wide shadow-xl"
          >
            <DiscordIcon className="w-4 h-4 fill-current" />
            <span>Join Official Discord Queue</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <Link
            href="/rankings"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface-2 hover:bg-surface border border-line text-xs font-mono font-bold text-white hover:text-brand-cyan transition-colors"
          >
            <span>Explore Standings Hub</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
