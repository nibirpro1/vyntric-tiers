import { describe, it, expect } from "vitest";
import {
  computePoints,
  getTitle,
  compareTiers,
  tierToNumber,
  TIER_POINTS,
  Tier,
} from "../tiers";
import { PLAYERS, RECENT_TESTS } from "../data";

describe("Tier System & Points Calculation", () => {
  it("computes points correctly based on TIER_POINTS table", () => {
    const sampleKits = {
      Sword: { tier: "HT1" as Tier }, // 60
      Axe: { tier: "LT1" as Tier }, // 45
      Crystal: { tier: "HT2" as Tier }, // 30
      Pot: { tier: "LT2" as Tier }, // 20
      UHC: { tier: "HT3" as Tier }, // 10
      SMP: { tier: "LT3" as Tier }, // 6
      Mace: { tier: "HT4" as Tier }, // 4
      Diamond: { tier: "LT4" as Tier }, // 3
      Vanilla: { tier: "HT5" as Tier }, // 2
    };

    const total = computePoints(sampleKits);
    // 60 + 45 + 30 + 20 + 10 + 6 + 4 + 3 + 2 = 180
    expect(total).toBe(180);
  });

  it("handles empty or unranked kits gracefully", () => {
    expect(computePoints({})).toBe(0);
    expect(computePoints({ Sword: { tier: "Unranked" as Tier } })).toBe(0);
  });

  it("derives exact title thresholds per specification", () => {
    expect(getTitle(500).name).toBe("Combat Grandmaster");
    expect(getTitle(250).name).toBe("Combat Grandmaster");
    expect(getTitle(249).name).toBe("Combat Master");
    expect(getTitle(180).name).toBe("Combat Master");
    expect(getTitle(179).name).toBe("Combat Ace");
    expect(getTitle(110).name).toBe("Combat Ace");
    expect(getTitle(109).name).toBe("Combat Specialist");
    expect(getTitle(60).name).toBe("Combat Specialist");
    expect(getTitle(59).name).toBe("Combat Cadet");
    expect(getTitle(30).name).toBe("Combat Cadet");
    expect(getTitle(29).name).toBe("Combat Novice");
    expect(getTitle(1).name).toBe("Combat Novice");
    expect(getTitle(0).name).toBe("Unrated");
  });

  it("strictly orders tiers (HT1 is 1, LT5 is 10, Unranked is 99)", () => {
    expect(tierToNumber("HT1")).toBe(1);
    expect(tierToNumber("LT1")).toBe(2);
    expect(tierToNumber("HT2")).toBe(3);
    expect(tierToNumber("LT2")).toBe(4);
    expect(tierToNumber("HT3")).toBe(5);
    expect(tierToNumber("LT3")).toBe(6);
    expect(tierToNumber("HT4")).toBe(7);
    expect(tierToNumber("LT4")).toBe(8);
    expect(tierToNumber("HT5")).toBe(9);
    expect(tierToNumber("LT5")).toBe(10);
    expect(tierToNumber("Unranked")).toBe(99);

    expect(compareTiers("HT1", "LT1")).toBeLessThan(0);
    expect(compareTiers("HT3", "HT2")).toBeGreaterThan(0);
    expect(compareTiers("LT5", "HT1")).toBeGreaterThan(0);
  });

  it("verifies global leaderboard points ordering", () => {
    for (let i = 0; i < PLAYERS.length - 1; i++) {
      const current = PLAYERS[i];
      const next = PLAYERS[i + 1];
      expect(current.points).toBeGreaterThanOrEqual(next.points);
    }
  });

  it("verifies players and recent tests exist and are populated", () => {
    expect(PLAYERS.length).toBeGreaterThan(0);
    expect(RECENT_TESTS.length).toBeGreaterThan(0);
  });
});
