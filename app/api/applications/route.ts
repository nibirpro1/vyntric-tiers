import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dataStore } from "@/lib/data";
import { STARTING_REGIONS, ALL_TIERS, KitId, Region, Tier } from "@/lib/tiers";
import { KITS } from "@/lib/data";

const kitIds = KITS.map((k) => k.id) as [KitId, ...KitId[]];

const applicationSchema = z.object({
  ign: z
    .string()
    .min(3, "IGN must be at least 3 characters")
    .max(16, "IGN must be at most 16 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "IGN can only contain letters, numbers, and underscores"),
  discordTag: z
    .string()
    .min(2, "Discord handle is required")
    .max(32, "Discord handle is too long"),
  region: z.enum(STARTING_REGIONS as [Region, ...Region[]]),
  kit: z.enum(kitIds),
  previousTier: z.string().min(1, "Please specify your estimated or previous tier"),
  targetTier: z.enum(ALL_TIERS as [Tier, ...Tier[]]).optional(),
  preferredTester: z.string().optional(),
  availability: z.string().max(100, "Availability notes too long").optional(),
  vodLink: z
    .string()
    .url("Must be a valid URL")
    .refine(
      (url) =>
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("twitch.tv") ||
        url.includes("medal.tv") ||
        url.includes("streamable.com"),
      "VOD link must be from YouTube, Twitch, Medal, or Streamable"
    ),
  notes: z.string().max(300, "Notes cannot exceed 300 characters").optional(),
  honeypot: z.string().optional(),
  website: z.string().optional(),
});

// In-memory rate limiting: 5 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count++;
  return true;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ign = searchParams.get("ign");

  if (ign) {
    const apps = dataStore.getApplications({ ign });
    return NextResponse.json({ total: apps.length, applications: apps });
  }

  const applications = dataStore.getApplications();
  return NextResponse.json({
    total: applications.length,
    applications,
  });
}

export async function POST(request: NextRequest) {
  // Identify client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many applications. Please wait a minute before submitting again." },
      { status: 429 }
    );
  }

  try {
    const json = await request.json();

    // Honeypot trap check
    if (json.honeypot || json.website) {
      return NextResponse.json(
        {
          success: true,
          message: "Application queued successfully.",
          application: { id: "app-bot-discarded", queuePosition: 99, estimatedWaitHours: 48 },
        },
        { status: 200 }
      );
    }

    const validated = applicationSchema.parse(json);

    // Duplicate check within 24 hours
    const existing = dataStore.getApplications({ ign: validated.ign });
    const now = Date.now();
    const recent = existing.find(
      (a: any) =>
        (a.status === "pending" || a.status === "in_review" || a.status === "scheduled") &&
        now - new Date(a.submittedAt).getTime() < 24 * 60 * 60 * 1000
    );

    if (recent) {
      return NextResponse.json(
        {
          error: "Duplicate application",
          message: `An active application for IGN ${validated.ign} is already in the queue (Ticket #${recent.id}). Check ticket status below.`,
          ticketId: recent.id,
        },
        { status: 409 }
      );
    }

    const newApp = dataStore.addApplication({
      ign: validated.ign,
      discordTag: validated.discordTag,
      region: validated.region,
      kit: validated.kit,
      previousTier: validated.previousTier,
      targetTier: validated.targetTier,
      preferredTester: validated.preferredTester,
      availability: validated.availability,
      vodLink: validated.vodLink,
      notes: validated.notes,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Challenger application queued successfully.",
        application: {
          id: newApp.id,
          ign: newApp.ign,
          kit: newApp.kit,
          queuePosition: newApp.queuePosition,
          estimatedWaitHours: newApp.estimatedWaitHours,
          submittedAt: newApp.submittedAt,
        },
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
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }
}
