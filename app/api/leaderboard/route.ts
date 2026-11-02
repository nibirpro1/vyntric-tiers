import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dataStore } from "@/lib/data";
import { KitId, Region, Tier } from "@/lib/tiers";
import { Player, PlayerKitEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") as Region | null;
  const kit = searchParams.get("kit") as KitId | null;
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const dbPlayers = await prisma.player.findMany({
      where: region && region !== ("ALL" as Region) ? { region: region as any } : {},
      include: { tiers: true },
      orderBy: { points: "desc" },
      take: limit,
    });

    if (dbPlayers && dbPlayers.length > 0) {
      let players: Player[] = dbPlayers.map((p, index) => {
        const kitsMap: Partial<Record<KitId, PlayerKitEntry>> = {};
        for (const t of p.tiers) {
          const kitName = (t.kit.charAt(0).toUpperCase() + t.kit.slice(1).toLowerCase()) as KitId;
          kitsMap[kitName] = {
            tier: t.tier as Tier,
            peakTier: t.peakTier as Tier,
            lastTestedAt: t.updatedAt.toISOString(),
            tester: "Vyntric Tester",
          };
        }

        return {
          id: p.id,
          username: p.ign,
          uuid: p.uuid || p.ign,
          region: p.region as Region,
          points: p.points,
          globalRank: index + 1,
          kits: kitsMap,
          testHistory: [],
          joinedAt: p.createdAt.toISOString(),
          lastTestedAt: p.createdAt.toISOString(),
          discord: p.discordId,
        };
      });

      if (kit && kit !== ("ALL" as KitId)) {
        players = players.filter((p) => Boolean(p.kits[kit]));
      }

      return NextResponse.json({
        total: players.length,
        leaderboard: players,
      });
    }
  } catch {
    // Fall back
  }

  let players: Player[] = dataStore.getPlayers();
  if (region && region !== ("ALL" as Region)) {
    players = players.filter((p: Player) => p.region === region);
  }
  if (kit && kit !== ("ALL" as KitId)) {
    players = players.filter((p: Player) => Boolean(p.kits[kit]));
  }

  return NextResponse.json({
    total: players.length,
    leaderboard: players,
  });
}
