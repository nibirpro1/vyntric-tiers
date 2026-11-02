import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dataStore } from "@/lib/data";
import { KitId, Region, Tier } from "@/lib/tiers";
import { Player, PlayerKitEntry, TestRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const kit = searchParams.get("kit") as KitId | null;
  const region = searchParams.get("region") as Region | null;
  const tier = searchParams.get("tier") as Tier | null;

  let players: Player[] = [];

  try {
    const dbPlayers = await prisma.player.findMany({
      include: {
        tiers: true,
        tests: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { points: "desc" },
    });

    if (dbPlayers && dbPlayers.length > 0) {
      players = dbPlayers.map((p, index) => {
        const kitsMap: Partial<Record<KitId, PlayerKitEntry>> = {};
        for (const t of p.tiers) {
          // Normalize Kit enum ("SWORD" -> "Sword")
          const kitName = (t.kit.charAt(0).toUpperCase() + t.kit.slice(1).toLowerCase()) as KitId;
          kitsMap[kitName] = {
            tier: t.tier as Tier,
            peakTier: t.peakTier as Tier,
            lastTestedAt: t.updatedAt.toISOString(),
            tester: "Vyntric Tester",
          };
        }

        const tests: TestRecord[] = p.tests.map((test) => ({
          id: test.id,
          playerId: test.playerId,
          playerUsername: p.ign,
          testerId: test.testerId,
          testerUsername: "Vyntric Tester",
          kit: (test.kit.charAt(0).toUpperCase() + test.kit.slice(1).toLowerCase()) as KitId,
          previousTier: test.previousTier as Tier | null,
          newTier: test.newTier as Tier,
          result: test.result.toLowerCase() as any,
          score: test.score,
          durationSec: test.durationSec,
          timestamp: test.createdAt.toISOString(),
          notes: test.notes || undefined,
        }));

        return {
          id: p.id,
          username: p.ign,
          uuid: p.uuid || p.ign,
          region: p.region as Region,
          points: p.points,
          globalRank: index + 1,
          kits: kitsMap,
          testHistory: tests,
          joinedAt: p.createdAt.toISOString(),
          lastTestedAt: tests[0]?.timestamp || p.createdAt.toISOString(),
          discord: p.discordId,
        };
      });
    }
  } catch {
    // DB not available, fall back
  }

  // Fallback to dataStore if DB had no players
  if (players.length === 0) {
    players = dataStore.getPlayers();
  }

  if (q) {
    players = players.filter((p) => p.username.toLowerCase().includes(q));
  }

  if (region && region !== ("ALL" as Region)) {
    players = players.filter((p) => p.region === region);
  }

  if (kit && kit !== ("ALL" as KitId)) {
    players = players.filter((p) => {
      const entry = p.kits[kit];
      if (!entry) return false;
      if (tier && tier !== ("ALL" as Tier)) {
        return entry.tier === tier;
      }
      return true;
    });
  } else if (tier && tier !== ("ALL" as Tier)) {
    players = players.filter((p) =>
      Object.values(p.kits).some((k) => k?.tier === tier)
    );
  }

  return NextResponse.json({
    total: players.length,
    players,
  });
}
