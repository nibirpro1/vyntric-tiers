export type Tier =
  | "HT1"
  | "LT1"
  | "HT2"
  | "LT2"
  | "HT3"
  | "LT3"
  | "HT4"
  | "LT4"
  | "HT5"
  | "LT5"
  | "Unranked";

export type TierId = Tier;

export type Region = "NA" | "EU" | "AS" | "AU" | "SA" | "ME";

export type GamemodeId =
  | "overall"
  | "vanilla"
  | "uhc"
  | "pot"
  | "nethop"
  | "smp"
  | "sword"
  | "axe"
  | "mace";

// Backwards-compatible KitId (supports both Capitalized and lowercase)
export type KitId =
  | "Vanilla"
  | "Sword"
  | "Axe"
  | "Crystal"
  | "UHC"
  | "Pot"
  | "SMP"
  | "Mace"
  | "Diamond"
  | "NethOP"
  | GamemodeId;

export const STARTING_REGIONS: Region[] = ["NA", "EU", "AS", "AU", "SA"];

export const TIER_ORDER: Tier[] = [
  "HT1",
  "LT1",
  "HT2",
  "LT2",
  "HT3",
  "LT3",
  "HT4",
  "LT4",
  "HT5",
  "LT5",
  "Unranked",
];

export const ALL_TIERS: Tier[] = [
  "HT1",
  "LT1",
  "HT2",
  "LT2",
  "HT3",
  "LT3",
  "HT4",
  "LT4",
  "HT5",
  "LT5",
];

// Vyntric Standard Tier Colors
export const TIER_COLORS: Record<Tier, string> = {
  HT1: "#FFB800", // Gold / Crimson Glow
  LT1: "#F59E0B", // Warm Gold
  HT2: "#E2E8F0", // Bright Silver/Platinum
  LT2: "#94A3B8", // Cool Silver
  HT3: "#EA580C", // Radiant Bronze
  LT3: "#C2410C", // Warm Copper
  HT4: "#8B5CF6", // Electric Amethyst
  LT4: "#6D28D9", // Soft Violet
  HT5: "#475569", // Slate Steel
  LT5: "#334155", // Dark Iron
  Unranked: "#64748B",
};

export const TIER_BORDER_GLOW: Record<Tier, string> = {
  HT1: "rgba(255, 184, 0, 0.4)",
  LT1: "rgba(245, 158, 11, 0.35)",
  HT2: "rgba(226, 232, 240, 0.35)",
  LT2: "rgba(148, 163, 184, 0.3)",
  HT3: "rgba(234, 88, 12, 0.3)",
  LT3: "rgba(194, 65, 12, 0.25)",
  HT4: "rgba(139, 92, 246, 0.3)",
  LT4: "rgba(109, 40, 217, 0.25)",
  HT5: "rgba(71, 85, 105, 0.25)",
  LT5: "rgba(51, 65, 85, 0.2)",
  Unranked: "rgba(100, 116, 139, 0.15)",
};

// Exact Vyntric Points
export const TIER_POINTS: Record<Tier, number> = {
  HT1: 60,
  LT1: 45,
  HT2: 30,
  LT2: 20,
  HT3: 10,
  LT3: 6,
  HT4: 4,
  LT4: 3,
  HT5: 2,
  LT5: 1,
  Unranked: 0,
};

// Region Pill Styling
export const REGION_META: Record<Region, { name: string; flag: string; badgeClass: string; borderClass: string; color: string }> = {
  NA: {
    name: "North America",
    flag: "🇺🇸",
    badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
    borderClass: "border-red-500/40",
    color: "#EF4444",
  },
  EU: {
    name: "Europe",
    flag: "🇪🇺",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    borderClass: "border-emerald-500/40",
    color: "#10B981",
  },
  AS: {
    name: "Asia",
    flag: "🇸🇬",
    badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    borderClass: "border-amber-500/40",
    color: "#F59E0B",
  },
  AU: {
    name: "Oceania",
    flag: "🇦🇺",
    badgeClass: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    borderClass: "border-cyan-500/40",
    color: "#06B6D4",
  },
  SA: {
    name: "South America",
    flag: "🇧🇷",
    badgeClass: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    borderClass: "border-purple-500/40",
    color: "#A855F7",
  },
  ME: {
    name: "Middle East",
    flag: "🇦🇪",
    badgeClass: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    borderClass: "border-orange-500/40",
    color: "#F97316",
  },
};

export const REGION_COLORS: Record<Region, string> = {
  NA: "#EF4444",
  EU: "#10B981",
  AS: "#F59E0B",
  AU: "#06B6D4",
  SA: "#A855F7",
  ME: "#F97316",
};

// 9 Vyntric Gamemodes metadata
export interface GamemodeDefinition {
  id: GamemodeId;
  name: string;
  shortDesc: string;
  tagline: string;
  accentColor: string;
}

export const GAMEMODES: GamemodeDefinition[] = [
  {
    id: "overall",
    name: "Overall",
    shortDesc: "Aggregated leaderboard across all official competitive ladders",
    tagline: "Total Points Leaderboard",
    accentColor: "#F59E0B",
  },
  {
    id: "vanilla",
    name: "Vanilla",
    shortDesc: "End crystal explosions, respawn anchor detonators, and high APM placement",
    tagline: "End Crystal & Anchor PvP",
    accentColor: "#C084FC",
  },
  {
    id: "uhc",
    name: "UHC",
    shortDesc: "Golden head conservation, lava bucket traps, and fishing rod spacing",
    tagline: "Ultra Hardcore Duels",
    accentColor: "#F43F5E",
  },
  {
    id: "pot",
    name: "Pot",
    shortDesc: "Speed II potion replenishment, health splash rhythm, and strafe locking",
    tagline: "Diamond Nodebuff Potion PvP",
    accentColor: "#FB7185",
  },
  {
    id: "nethop",
    name: "NethOP",
    shortDesc: "Netherite Protection IV endurance, strength burst windows, and gap discipline",
    tagline: "Netherite Potion PvP",
    accentColor: "#A855F7",
  },
  {
    id: "smp",
    name: "SMP",
    shortDesc: "Modern survival kit meta with totems of undying, elytra aerials, and cobweb tricks",
    tagline: "Survival Multiplayer Meta",
    accentColor: "#10B981",
  },
  {
    id: "sword",
    name: "Sword",
    shortDesc: "Pure sprint-reset combos, W-tap discipline, and spatial reach dominance",
    tagline: "1.8 & 1.9+ Sword Fundamentals",
    accentColor: "#38BDF8",
  },
  {
    id: "axe",
    name: "Axe",
    shortDesc: "Shield disables, stun frames, heavy trades, and critical hit pacing",
    tagline: "Shield Break & Crit Timing",
    accentColor: "#38BDF8",
  },
  {
    id: "mace",
    name: "Mace",
    shortDesc: "Wind charge vertical momentum, smash attacks, and lethal terminal velocity hits",
    tagline: "1.21 Heavy Mace Combat",
    accentColor: "#818CF8",
  },
];

export const GAMEMODE_MAP: Record<GamemodeId, GamemodeDefinition> = GAMEMODES.reduce(
  (acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  },
  {} as Record<GamemodeId, GamemodeDefinition>
);

export function normalizeGamemode(input: string): GamemodeId {
  if (!input) return "sword";
  const clean = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean === "crystal") return "vanilla";
  if (clean === "nethpot" || clean === "nethop") return "nethop";
  if (clean === "potion" || clean === "pot" || clean === "nodebuff") return "pot";
  if (clean === "diamond" || clean === "diamondsword") return "sword";
  if (clean === "diasmp" || clean === "smp") return "smp";
  if (clean === "uhc") return "uhc";
  if (clean === "mace") return "mace";
  if (clean === "axe") return "axe";
  if (clean === "vanilla") return "vanilla";
  if (clean === "overall") return "overall";
  if (GAMEMODES.some((g) => g.id.toLowerCase() === clean)) return clean as GamemodeId;
  return "sword";
}

export function tierToNumber(tier: Tier): number {
  switch (tier) {
    case "HT1": return 1;
    case "LT1": return 2;
    case "HT2": return 3;
    case "LT2": return 4;
    case "HT3": return 5;
    case "LT3": return 6;
    case "HT4": return 7;
    case "LT4": return 8;
    case "HT5": return 9;
    case "LT5": return 10;
    case "Unranked": return 99;
  }
}

export function compareTiers(a: Tier, b: Tier): number {
  return tierToNumber(a) - tierToNumber(b);
}

export function isHighTier(tier: Tier): boolean {
  return tier.startsWith("HT");
}

export function tierLabel(tier: Tier): string {
  if (tier === "Unranked") return "Unranked";
  const isHigh = tier.startsWith("HT");
  const num = tier.slice(2);
  return `${isHigh ? "High" : "Low"} Tier ${num}`;
}

export interface TitleResult {
  name: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  textGradient?: string;
  isGrandmaster?: boolean;
}

/**
 * Vyntric Combat Titles (auto-calculated from player's total points):
 * 250+ pts: "Combat Grandmaster" (Animated Gold-Crimson gradient text + crown icon)
 * 180-249 pts: "Combat Master" (Shimmering Gold text)
 * 110-179 pts: "Combat Ace" (Rose/Crimson glow text)
 * 60-109 pts: "Combat Specialist" (Violet-Cyan text)
 * 30-59 pts: "Combat Cadet" (Emerald text)
 * 1-29 pts: "Combat Novice" (Slate text)
 */
export function getTitle(points: number): TitleResult {
  if (points >= 250) {
    return {
      name: "Combat Grandmaster",
      color: "#FFB800",
      badgeBg: "rgba(255, 184, 0, 0.15)",
      badgeBorder: "rgba(255, 184, 0, 0.4)",
      textGradient: "from-amber-400 via-rose-500 to-amber-300",
      isGrandmaster: true,
    };
  }
  if (points >= 180) {
    return {
      name: "Combat Master",
      color: "#F59E0B",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeBorder: "rgba(245, 158, 11, 0.35)",
      textGradient: "from-amber-300 to-yellow-500",
    };
  }
  if (points >= 110) {
    return {
      name: "Combat Ace",
      color: "#F43F5E",
      badgeBg: "rgba(244, 63, 94, 0.15)",
      badgeBorder: "rgba(244, 63, 94, 0.35)",
      textGradient: "from-rose-400 to-pink-500",
    };
  }
  if (points >= 60) {
    return {
      name: "Combat Specialist",
      color: "#8B5CF6",
      badgeBg: "rgba(139, 92, 246, 0.15)",
      badgeBorder: "rgba(139, 92, 246, 0.35)",
      textGradient: "from-violet-400 to-cyan-400",
    };
  }
  if (points >= 30) {
    return {
      name: "Combat Cadet",
      color: "#10B981",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeBorder: "rgba(16, 185, 129, 0.35)",
      textGradient: "from-emerald-400 to-teal-400",
    };
  }
  if (points >= 1) {
    return {
      name: "Combat Novice",
      color: "#94A3B8",
      badgeBg: "rgba(148, 163, 184, 0.12)",
      badgeBorder: "rgba(148, 163, 184, 0.25)",
      textGradient: "from-slate-300 to-slate-400",
    };
  }
  return {
    name: "Unrated",
    color: "#64748B",
    badgeBg: "rgba(100, 116, 139, 0.1)",
    badgeBorder: "rgba(100, 116, 139, 0.2)",
  };
}

export function computePoints(kits: Partial<Record<string, { tier: Tier }>>): number {
  let sum = 0;
  for (const entry of Object.values(kits)) {
    if (entry && entry.tier in TIER_POINTS) {
      sum += TIER_POINTS[entry.tier];
    }
  }
  return sum;
}

/**
 * Formats a timestamp into BOTH relative and exact readable formats:
 * - relative: "18m ago", "2h ago", "3d ago"
 * - exact: "Today • 7:42 PM", "Oct 24, 2025 • 19:42"
 */
export function formatTestTimestamp(input: string | number | Date): {
  relative: string;
  exact: string;
  fullDate: string;
  clockTime: string;
} {
  const date = typeof input === "object" ? input : new Date(input);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let relative = "just now";
  if (diffMins >= 1 && diffMins < 60) {
    relative = `${diffMins}m ago`;
  } else if (diffHours >= 1 && diffHours < 24) {
    relative = `${diffHours}h ago`;
  } else if (diffDays >= 1 && diffDays < 30) {
    relative = `${diffDays}d ago`;
  } else if (diffDays >= 30) {
    relative = `${Math.floor(diffDays / 30)}mo ago`;
  }

  // Exact clock time: "7:42 PM"
  const clockTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Check if today / yesterday
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const fullDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  let exact = `${fullDate} • ${clockTime}`;
  if (isToday) {
    exact = `Today • ${clockTime}`;
  } else if (isYesterday) {
    exact = `Yesterday • ${clockTime}`;
  }

  return { relative, exact, fullDate, clockTime };
}
