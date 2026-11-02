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
      Axe: { tier: "LT1" as Tier }, // 44
      Crystal: { tier: "HT2" as Tier }, // 30
      Pot: { tier: "LT2" as Tier }, // 20
      UHC: { tier: "HT3" as Tier }, // 10
      SMP: { tier: "LT3" as Tier }, // 6
      Mace: { tier: "HT4" as Tier }, // 4
      Diamond: { tier: "LT4" as Tier }, // 3
      Vanilla: { tier: "HT5" as Tier }, // 2
    };

    const total = computePoints(sampleKits);
    // 60 + 44 + 30 + 20 + 10 + 6 + 4 + 3 + 2 = 179
    expect(total).toBe(179);
  });

  it("handles empty or unranked kits gracefully", () => {
    expect(computePoints({})).toBe(0);
    expect(computePoints({ Sword: { tier: "Unranked" as Tier } })).toBe(0);
  });

  it("derives exact title thresholds per specification", () => {
    expect(getTitle(500).name).toBe("Combat Grandmaster");
    expect(getTitle(400).name).toBe("Combat Grandmaster");
    expect(getTitle(399).name).toBe("Combat Master");
    expect(getTitle(250).name).toBe("Combat Master");
    expect(getTitle(249).name).toBe("Combat Ace");
    expect(getTitle(100).name).toBe("Combat Ace");
    expect(getTitle(99).name).toBe("Combat Specialist");
    expect(getTitle(50).name).toBe("Combat Specialist");
    expect(getTitle(49).name).toBe("Combat Cadet");
    expect(getTitle(20).name).toBe("Combat Cadet");
    expect(getTitle(19).name).toBe("Combat Novice");
    expect(getTitle(10).name).toBe("Combat Novice");
    expect(getTitle(9).name).toBe("Rookie");
    expect(getTitle(1).name).toBe("Rookie");
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

  it("verifies global leaderboard tie-break sorting", () => {
    for (let i = 0; i < PLAYERS.length - 1; i++) {
      const current = PLAYERS[i];
      const next = PLAYERS[i + 1];

      if (current.points !== next.points) {
        expect(current.points).toBeGreaterThan(next.points);
      } else {
        const timeA = new Date(current.lastTestedAt).getTime();
        const timeB = new Date(next.lastTestedAt).getTime();
        if (timeA !== timeB) {
          expect(timeA).toBeGreaterThanOrEqual(timeB);
        } else {
          expect(current.username.localeCompare(next.username)).toBeLessThanOrEqual(0);
        }
      }
    }
  });

  it("enforces test-history consistency (every player's last history entry per kit equals current tier)", () => {
    PLAYERS.forEach((player) => {
      Object.entries(player.kits).forEach(([kit, kitEntry]) => {
        if (!kitEntry || kitEntry.tier === "Unranked") return;

        // Find tests for this kit
        const kitTests = player.testHistory.filter((t) => t.kit === kit);
        expect(kitTests.length).toBeGreaterThan(0);

        // Sort kit tests descending
        kitTests.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        const latestTest = kitTests[0];
        expect(latestTest.newTier).toBe(kitEntry.tier);
      });
    });
  });

  it("verifies exactly 60 players and 40 recent tests generated", () => {
    expect(PLAYERS.length).toBe(60);
    expect(RECENT_TESTS.length).toBe(40);
  });
});
