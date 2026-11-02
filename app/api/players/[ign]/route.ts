import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dataStore } from "@/lib/data";
import { KitId, Region, Tier } from "@/lib/tiers";
import { Player, PlayerKitEntry, TestRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { ign: string } }
) {
  const ign = params.ign;

  try {
    const dbPlayer = await prisma.player.findFirst({
      where: {
        OR: [
          { ign: { equals: ign, mode: "insensitive" } },
          { uuid: ign },
        ],
      },
      include: {
        tiers: true,
        tests: {
          orderBy: { createdAt: "desc" },
          include: { tester: true },
        },
      },
    });

    if (dbPlayer) {
      const higherCount = await prisma.player.count({
        where: { points: { gt: dbPlayer.points } },
      });

      const kitsMap: Partial<Record<KitId, PlayerKitEntry>> = {};
      for (const t of dbPlayer.tiers) {
        const kitName = (t.kit.charAt(0).toUpperCase() + t.kit.slice(1).toLowerCase()) as KitId;
        kitsMap[kitName] = {
          tier: t.tier as Tier,
          peakTier: t.peakTier as Tier,
          lastTestedAt: t.updatedAt.toISOString(),
          tester: "Vyntric Tester",
        };
      }

      const tests: TestRecord[] = dbPlayer.tests.map((test) => ({
        id: test.id,
        playerId: test.playerId,
        playerUsername: dbPlayer.ign,
        testerId: test.testerId,
        testerUsername: test.tester?.ign || "Vyntric Tester",
        kit: (test.kit.charAt(0).toUpperCase() + test.kit.slice(1).toLowerCase()) as KitId,
        previousTier: test.previousTier as Tier | null,
        newTier: test.newTier as Tier,
        result: test.result.toLowerCase() as any,
        score: test.score,
        durationSec: test.durationSec,
        timestamp: test.createdAt.toISOString(),
        notes: test.notes || undefined,
      }));

      const player: Player = {
        id: dbPlayer.id,
        username: dbPlayer.ign,
        uuid: dbPlayer.uuid || dbPlayer.ign,
        region: dbPlayer.region as Region,
        points: dbPlayer.points,
        globalRank: higherCount + 1,
        kits: kitsMap,
        testHistory: tests,
        joinedAt: dbPlayer.createdAt.toISOString(),
        lastTestedAt: tests[0]?.timestamp || dbPlayer.createdAt.toISOString(),
        discord: dbPlayer.discordId,
      };

      return NextResponse.json({
        player,
        tests,
      });
    }
  } catch {
    // Fall back to dataStore
  }

  const mockPlayer = dataStore.getPlayerByUsername(ign);
  if (!mockPlayer) {
    return NextResponse.json(
      { error: `Player '${ign}' not found in Vyntric records.` },
      { status: 404 }
    );
  }

  const mockTests = dataStore.getPlayerTests(mockPlayer.id);
  return NextResponse.json({
    player: mockPlayer,
    tests: mockTests,
  });
}
