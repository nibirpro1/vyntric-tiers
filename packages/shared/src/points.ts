import { Tier, Kit } from "./types.js";

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
};

export function calculatePoints(
  tiers: Partial<Record<Kit, Tier | null>> | { kit: Kit; tier: Tier }[]
): number {
  if (Array.isArray(tiers)) {
    return tiers.reduce((acc, curr) => acc + (TIER_POINTS[curr.tier] || 0), 0);
  }

  return Object.values(tiers).reduce<number>((acc, tier) => {
    if (!tier) return acc;
    return acc + (TIER_POINTS[tier] || 0);
  }, 0);
}

export interface PlayerTitle {
  name: string;
  minPoints: number;
  color: string;
  badgeBg: string;
}

export const TITLE_THRESHOLDS: PlayerTitle[] = [
  {
    name: "Combat Grandmaster",
    minPoints: 400,
    color: "#FF2D55",
    badgeBg: "rgba(255, 45, 85, 0.15)",
  },
  {
    name: "Combat Master",
    minPoints: 250,
    color: "#FFB020",
    badgeBg: "rgba(255, 176, 32, 0.15)",
  },
  {
    name: "Combat Ace",
    minPoints: 100,
    color: "#22D3EE",
    badgeBg: "rgba(34, 211, 238, 0.15)",
  },
  {
    name: "Combat Specialist",
    minPoints: 50,
    color: "#A78BFA",
    badgeBg: "rgba(167, 139, 250, 0.15)",
  },
  {
    name: "Combat Cadet",
    minPoints: 20,
    color: "#34D399",
    badgeBg: "rgba(52, 211, 153, 0.15)",
  },
  {
    name: "Combat Novice",
    minPoints: 10,
    color: "#94A3B8",
    badgeBg: "rgba(148, 163, 184, 0.15)",
  },
  {
    name: "Rookie",
    minPoints: 1,
    color: "#64748B",
    badgeBg: "rgba(100, 116, 139, 0.12)",
  },
  {
    name: "Unrated",
    minPoints: 0,
    color: "#475569",
    badgeBg: "rgba(71, 85, 105, 0.1)",
  },
];

export function getTitle(points: number): PlayerTitle {
  for (const threshold of TITLE_THRESHOLDS) {
    if (points >= threshold.minPoints) {
      return threshold;
    }
  }
  return TITLE_THRESHOLDS[TITLE_THRESHOLDS.length - 1];
}
