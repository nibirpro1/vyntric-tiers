import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dataStore } from "@/lib/data";
import { KitId, ALL_TIERS, Tier, getTitle } from "@/lib/tiers";
import { KITS } from "@/lib/data";

const kitIds = KITS.map((k) => k.id) as [KitId, ...KitId[]];

const recordTestSchema = z.object({
  testerName: z.string().min(2, "Tester name is required"),
  ign: z
    .string()
    .min(3, "IGN must be at least 3 characters")
    .max(16, "IGN must be at most 16 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "IGN can only contain letters, numbers, and underscores"),
  kit: z.enum(kitIds),
  outcome: z.enum(["promoted", "demoted", "retained"]),
  oldTier: z.enum(ALL_TIERS as [Tier, ...Tier[]]),
  newTier: z.enum(ALL_TIERS as [Tier, ...Tier[]]),
  score: z.string().regex(/^5-[0-4]$|^[0-4]-5$/, "Score must be in first-to-5 format (e.g. 5-3, 5-1, 5-4)"),
  duration: z.string().optional(),
  vodUrl: z.string().url("Must be a valid VOD URL").optional().or(z.literal("")),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
});

const TOKEN_VALUE = "vyntric_staff_token_authorized_session";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "40", 10);
  const kit = searchParams.get("kit") as KitId | null;

  let tests = dataStore.getTests(100);

  if (kit && kit !== ("ALL" as KitId)) {
    tests = tests.filter((t) => t.kit === kit);
  }

  return NextResponse.json({
    total: tests.length,
    tests: tests.slice(0, limit),
  });
}

export async function POST(request: NextRequest) {
  // Check authorization
  const cookie = request.cookies.get("vyntric_staff_token");
  const authHeader = request.headers.get("authorization");

  if (cookie?.value !== TOKEN_VALUE && authHeader !== `Bearer ${TOKEN_VALUE}`) {
    return NextResponse.json(
      { error: "Unauthorized. Staff authentication required to log test results." },
      { status: 401 }
    );
  }

  try {
    const json = await request.json();
    const validated = recordTestSchema.parse(json);

    const result = dataStore.recordTestResult({
      testerName: validated.testerName,
      ign: validated.ign,
      kit: validated.kit,
      outcome: validated.outcome,
      oldTier: validated.oldTier,
      newTier: validated.newTier,
      score: validated.score,
      duration: validated.duration || "15m",
      vodUrl: validated.vodUrl || undefined,
      notes: validated.notes,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Official test recorded for ${validated.ign}. Ladder rankings recomputed.`,
        testRecord: result.testRecord,
        player: {
          id: result.player.id,
          username: result.player.username,
          points: result.player.points,
          globalRank: result.player.globalRank,
          title: getTitle(result.player.points),
        },
        diff: result.diff,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          issues: error.issues.map((i) => i.message),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to record test result." },
      { status: 400 }
    );
  }
}
