import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { dataStore } from "@/lib/data";
import { ROLE_MAP, StaffRole } from "@vyntric/shared";
import { Member, KitId } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const testers = await prisma.tester.findMany({
      orderBy: { testsCompleted: "desc" },
    });

    if (testers && testers.length > 0) {
      const members: Member[] = testers.map((t) => {
        const roleMeta = ROLE_MAP[t.role as StaffRole];
        return {
          id: t.id,
          name: t.name,
          ign: t.ign,
          role: (roleMeta?.label || t.role) as any,
          avatarUrl: `https://mc-heads.net/avatar/${t.ign}/128`,
          discord: `@${t.ign.toLowerCase()}`,
          testsCompleted: t.testsCompleted,
          specialties: t.specialties.map(
            (k) => (k.charAt(0).toUpperCase() + k.slice(1).toLowerCase()) as KitId
          ),
          joinDate: t.joinDate.toISOString().split("T")[0],
          status: t.status === "ONLINE" || t.status === "TESTING" ? "Online" : "Offline",
          quote: t.quote || "Dedicated to fair, competitive Minecraft PvP testing.",
        };
      });

      return NextResponse.json({
        total: members.length,
        members,
      });
    }
  } catch {
    // Fall back
  }

  const mockTesters = dataStore.getTesters();
  return NextResponse.json({
    total: mockTesters.length,
    members: mockTesters,
  });
}
