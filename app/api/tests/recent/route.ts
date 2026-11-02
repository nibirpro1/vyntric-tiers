import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dataStore } from "@/lib/data";
import { KitId, Tier } from "@/lib/tiers";
import { TestRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "25", 10);
  const kit = searchParams.get("kit") as KitId | null;

  try {
    const dbTests = await prisma.test.findMany({
      where: kit && kit !== ("ALL" as KitId) ? { kit: kit.toUpperCase() as any } : {},
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        player: { select: { ign: true, uuid: true, region: true } },
        tester: { select: { ign: true, name: true } },
      },
    });

    if (dbTests && dbTests.length > 0) {
      const tests: TestRecord[] = dbTests.map((t) => ({
        id: t.id,
        playerId: t.playerId,
        playerUsername: t.player.ign,
        testerId: t.testerId,
        testerUsername: t.tester?.ign || t.tester?.name || "Vyntric Tester",
        kit: (t.kit.charAt(0).toUpperCase() + t.kit.slice(1).toLowerCase()) as KitId,
        previousTier: t.previousTier as Tier | null,
        newTier: t.newTier as Tier,
        result: t.result.toLowerCase() as any,
        score: t.score,
        durationSec: t.durationSec,
        timestamp: t.createdAt.toISOString(),
        notes: t.notes || undefined,
      }));

      return NextResponse.json({
        total: tests.length,
        tests,
      });
    }
  } catch {
    // Fall back
  }

  let mockTests = dataStore.getTests(limit);
  if (kit && kit !== ("ALL" as KitId)) {
    mockTests = mockTests.filter((t) => t.kit === kit);
  }

  return NextResponse.json({
    total: mockTests.length,
    tests: mockTests.slice(0, limit),
  });
}
