import { describe, it, expect } from "vitest";
import { compareTiers, KITS, TIER_ORDER, Kit, Tier } from "@vyntric/shared";
import { MojangService } from "../../apps/bot/src/services/mojangService";
import {
  createBaseEmbed,
  createSuccessEmbed,
  createErrorEmbed,
  createResultEmbed,
  createTranscriptEmbed,
  VY_BRAND,
  VY_COLORS,
} from "../../apps/bot/src/embeds/brand";
import { commands } from "../../apps/bot/src/events/interactionCreate";

describe("Vyntric Tiers — Bot Commands & Services", () => {
  it("registers all expected slash commands with valid builders", () => {
    const expectedCommands = [
      "register",
      "tester",
      "next",
      "result",
      "profile",
      "leaderboard",
      "queue",
      "cooldown",
      "testers",
      "admin",
      "help",
    ];

    for (const name of expectedCommands) {
      expect(commands.has(name)).toBe(true);
      const cmd = commands.get(name);
      expect(cmd.data).toBeDefined();
      expect(cmd.data.name).toBe(name);
      expect(typeof cmd.data.description).toBe("string");
      expect(typeof cmd.execute).toBe("function");
    }
  });

  it("verifies MojangService UUID formatting", () => {
    const rawUuid = "069a79f444e94726a5befca90e38aaf5";
    const formatted = MojangService.formatUuid(rawUuid);
    expect(formatted).toBe("069a79f4-44e9-4726-a5be-fca90e38aaf5");

    // Invalid length should return as is
    expect(MojangService.formatUuid("short")).toBe("short");
  });

  it("calculates promotional tier movements accurately", () => {
    // compareTiers(new, prev) < 0 => PROMOTED
    expect(compareTiers("HT1", "LT1")).toBeLessThan(0);
    expect(compareTiers("HT1", "HT2")).toBeLessThan(0);
    expect(compareTiers("LT2", "HT3")).toBeLessThan(0);

    // compareTiers(new, prev) > 0 => DEMOTED
    expect(compareTiers("LT1", "HT1")).toBeGreaterThan(0);
    expect(compareTiers("HT3", "HT2")).toBeGreaterThan(0);

    // compareTiers(new, prev) === 0 => RETAINED
    expect(compareTiers("HT2", "HT2")).toBe(0);
  });

  it("verifies brand embeds have proper Vyntric Tiers metadata and branding", () => {
    expect(VY_BRAND.name).toBe("Vyntric Tiers");
    expect(VY_BRAND.tagline).toBe("Ranked. Tested. Verified.");

    const base = createBaseEmbed("Test Title");
    expect(base.data.title).toBe("Test Title");
    expect(base.data.footer?.text).toContain("Vyntric Tiers");

    const success = createSuccessEmbed("Success Title", "Operation successful");
    expect(success.data.color).toBe(VY_COLORS.cyan);
    expect(success.data.description).toBe("Operation successful");

    const error = createErrorEmbed("Error Title", "An error occurred");
    expect(error.data.color).toBe(VY_COLORS.error);

    const result = createResultEmbed({
      ign: "Kazuma",
      uuid: "069a79f4-44e9-4726-a5be-fca90e38aaf5",
      kit: "SWORD",
      previousTier: "LT1",
      newTier: "HT1",
      score: "5-2",
      testerName: "Apex",
      notes: "Clean sprint resets and spacing",
      totalPoints: 180,
      globalRank: 1,
      result: "PROMOTED",
      profileUrl: "https://vyntric.gg/player/Kazuma",
    });

    expect(result.data.title).toContain("Sword Duel: Kazuma");
    expect(result.data.description).toContain("PROMOTED");
    expect(result.data.description).toContain("5-2");
    expect(result.data.thumbnail?.url).toContain("069a79f4-44e9-4726-a5be-fca90e38aaf5");

    const transcript = createTranscriptEmbed({
      channelName: "test-sword-kazuma",
      testerName: "Apex",
      playerIgn: "Kazuma",
      kit: "SWORD",
      outcome: "Completed (HT1 - PROMOTED)",
      messageCount: 15,
    });
    expect(transcript.data.title).toContain("#test-sword-kazuma");
  });

  it("verifies all 9 competitive kits exist", () => {
    expect(KITS.length).toBe(9);
    const kitIds = KITS.map((k) => k.id);
    expect(kitIds).toContain("SWORD");
    expect(kitIds).toContain("AXE");
    expect(kitIds).toContain("CRYSTAL");
    expect(kitIds).toContain("POT");
    expect(kitIds).toContain("UHC");
    expect(kitIds).toContain("SMP");
    expect(kitIds).toContain("MACE");
    expect(kitIds).toContain("DIASMP");
    expect(kitIds).toContain("VANILLA");
  });
});
