import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PlayerProfileContent } from "@/components/PlayerProfileContent";
import { dataStore } from "@/lib/data";
import { prisma } from "@/lib/db";
import { KitId, Region, Tier } from "@/lib/tiers";
import { Player, PlayerKitEntry, TestRecord } from "@/lib/types";

interface PageProps {
  params: { ign: string };
}

async function getPlayer(ign: string): Promise<Player | null> {
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

      return {
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
    }
  } catch {
    // Fall back to dataStore
  }

  return dataStore.getPlayerByUsername(ign) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const player = await getPlayer(params.ign);
  if (!player) {
    return { title: "Player Not Found · VYNTRIC TIERS" };
  }

  return {
    title: `${player.username} · Ranked #${player.globalRank} (${player.points} pts)`,
    description: `Official Vyntric competitive profile for ${player.username}. Verified 1v1 tier placements and duel records.`,
    openGraph: {
      title: `${player.username} — Vyntric Tiers Profile`,
      description: `Rank #${player.globalRank} • ${player.points} points across verified gamemode ladders.`,
      images: [`https://mc-heads.net/avatar/${player.uuid}/200`],
    },
  };
}

export default async function PlayerPage({ params }: PageProps) {
  const player = await getPlayer(params.ign);

  if (!player) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Tier List</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-violet/15 border border-brand-violet/30 text-brand-cyan text-xs font-mono">
          <Sparkles className="w-3 h-3" />
          <span>VERIFIED COMPETITIVE PROFILE</span>
        </div>
      </div>

      <div className="card-solid border border-line bg-surface/90 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8">
        <PlayerProfileContent player={player} />
      </div>
    </div>
  );
}
