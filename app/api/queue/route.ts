import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { KITS, KitMeta } from "@vyntric/shared";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const queueEntries = await prisma.queueEntry.findMany({
      where: { status: "WAITING" },
      orderBy: { position: "asc" },
    });

    const playerIds = queueEntries.map((e) => e.playerId);
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
      select: {
        id: true,
        ign: true,
        uuid: true,
        region: true,
        points: true,
      },
    });

    const playerMap = new Map(players.map((p) => [p.id, p]));

    const enrichedEntries = queueEntries.map((e) => ({
      ...e,
      player: playerMap.get(e.playerId) || null,
    }));

    const testers = await prisma.tester.findMany({
      where: { status: { in: ["ONLINE", "TESTING"] } },
      select: {
        id: true,
        name: true,
        ign: true,
        role: true,
        specialties: true,
        status: true,
        testsCompleted: true,
      },
    });

    // Group by kit
    const byKit: Record<string, typeof enrichedEntries> = {};
    for (const kitMeta of KITS) {
      byKit[kitMeta.id] = enrichedEntries.filter((e) => e.kit === kitMeta.id);
    }

    return NextResponse.json({
      totalWaiting: queueEntries.length,
      onlineTestersCount: testers.length,
      testers,
      queues: byKit,
    });
  } catch {
    // If DB offline, mock queue
    const mockQueues: Record<string, any[]> = {};
    for (const kitMeta of KITS) {
      mockQueues[kitMeta.id] = [];
    }

    return NextResponse.json({
      totalWaiting: 0,
      onlineTestersCount: 3,
      testers: [
        { ign: "Apex", role: "OWNER", status: "ONLINE", testsCompleted: 342, specialties: ["SWORD", "AXE"] },
        { ign: "Vortex", role: "HEAD_TESTER", status: "TESTING", testsCompleted: 219, specialties: ["CRYSTAL"] },
        { ign: "Zenith", role: "TESTER", status: "ONLINE", testsCompleted: 98, specialties: ["POT", "UHC"] },
      ],
      queues: mockQueues,
    });
  }
}
