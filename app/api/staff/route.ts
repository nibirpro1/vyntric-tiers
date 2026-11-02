import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data";
import { ApplicationStatus } from "@/lib/types";

const VALID_PASSPHRASE = process.env.STAFF_PASSPHRASE || "vyntric2026";
const AUTH_COOKIE_NAME = "vyntric_staff_token";
const TOKEN_VALUE = "vyntric_staff_token_authorized_session";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  const authHeader = request.headers.get("authorization");

  const isAuthenticated =
    cookie?.value === TOKEN_VALUE ||
    authHeader === `Bearer ${TOKEN_VALUE}`;

  return NextResponse.json({
    authenticated: isAuthenticated,
  });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { passphrase } = json;

    if (!passphrase || passphrase !== VALID_PASSPHRASE) {
      return NextResponse.json(
        { error: "Invalid staff passphrase." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      token: TOKEN_VALUE,
      message: "Staff authentication successful.",
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: TOKEN_VALUE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Application status update endpoint
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  const authHeader = request.headers.get("authorization");

  if (cookie?.value !== TOKEN_VALUE && authHeader !== `Bearer ${TOKEN_VALUE}`) {
    return NextResponse.json(
      { error: "Unauthorized. Staff login required." },
      { status: 401 }
    );
  }

  try {
    const json = await request.json();
    const { applicationId, status, reviewerNotes } = json;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Missing applicationId or status." },
        { status: 400 }
      );
    }

    const updated = dataStore.updateApplicationStatus(
      applicationId,
      status as ApplicationStatus,
      reviewerNotes
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: updated,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update application status." },
      { status: 400 }
    );
  }
}
