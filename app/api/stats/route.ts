import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dataStore } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalPlayers, totalTests, activeTesters] = await Promise.all([
      prisma.player.count(),
      prisma.test.count(),
      prisma.tester.count({ where: { status: { in: ["ONLINE", "TESTING"] } } }),
    ]);

    if (totalPlayers > 0) {
      return NextResponse.json({
        stats: {
          totalPlayers,
          totalTests,
          activeTesters,
          avgTestDuration: "10.4m",
          seasonNumber: 4,
        },
      });
    }
  } catch {
    // Fall back
  }

  const stats = dataStore.getStats();
  const testers = dataStore.getTesters();

  return NextResponse.json({
    stats,
    testers,
  });
}
