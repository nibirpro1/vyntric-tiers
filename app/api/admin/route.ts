import { NextRequest, NextResponse } from "next/server";
import {
  PLAYERS,
  RECENT_TESTS,
  VYNTRIC_MEMBERS,
  dataStore,
  addOrUpdatePlayer,
  deletePlayer,
  deleteTestRecord,
  addOrUpdateTester,
  getSiteAnnouncement,
  setSiteAnnouncement,
  recordTestResult,
  getSiteSettings,
  updateSiteSettings,
  getAllData,
  restoreAllData,
} from "@/lib/data";

const VALID_PASSPHRASE = process.env.STAFF_PASSPHRASE || "vyntric2026";
const AUTH_COOKIE_NAME = "vyntric_staff_token";
const TOKEN_VALUE = "vyntric_staff_token_authorized_session";

function isAuthorized(request: NextRequest): boolean {
  const cookie = request.cookies.get(AUTH_COOKIE_NAME);
  const authHeader = request.headers.get("authorization");
  return (
    cookie?.value === TOKEN_VALUE ||
    authHeader === `Bearer ${TOKEN_VALUE}`
  );
}

export async function GET(request: NextRequest) {
  const authenticated = isAuthorized(request);

  if (!authenticated) {
    return NextResponse.json({
      authenticated: false,
    });
  }

  return NextResponse.json({
    authenticated: true,
    stats: dataStore.getStats(),
    settings: getSiteSettings(),
    announcement: getSiteAnnouncement(),
    totalPlayers: PLAYERS.length,
    totalTests: RECENT_TESTS.length,
    totalStaff: VYNTRIC_MEMBERS.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. LOGIN ACTION
    if (action === "login") {
      const { passphrase } = body;
      if (!passphrase || passphrase !== VALID_PASSPHRASE) {
        return NextResponse.json(
          { error: "Invalid master passphrase. Access denied." },
          { status: 401 }
        );
      }

      const response = NextResponse.json({
        success: true,
        authenticated: true,
        token: TOKEN_VALUE,
        message: "Master Vault access authorized.",
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
    }

    // 2. LOGOUT ACTION
    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        authenticated: false,
        message: "Logged out from Master Vault.",
      });
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    // ALL OTHER ACTIONS REQUIRE AUTHENTICATION
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Master authorization key required." },
        { status: 401 }
      );
    }

    // 3. COMBATANT / PLAYER ACTIONS
    if (action === "add_player" || action === "update_player") {
      const { playerData } = body;
      if (!playerData || !playerData.username) {
        return NextResponse.json(
          { error: "Player username is required." },
          { status: 400 }
        );
      }
      const updated = addOrUpdatePlayer(playerData);
      return NextResponse.json({
        success: true,
        player: updated,
        totalPlayers: PLAYERS.length,
      });
    }

    if (action === "delete_player") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "Missing player ID" }, { status: 400 });
      }
      const removed = deletePlayer(id);
      return NextResponse.json({
        success: removed,
        totalPlayers: PLAYERS.length,
      });
    }

    // 4. TEST RESULT ACTIONS
    if (action === "log_test") {
      const { testData } = body;
      if (!testData || !testData.ign || !testData.newTier) {
        return NextResponse.json(
          { error: "Missing required test details." },
          { status: 400 }
        );
      }
      const result = recordTestResult(testData);

      // Also update player's kit entry
      const player = PLAYERS.find((p) => p.username.toLowerCase() === testData.ign.toLowerCase());
      if (player && testData.kit) {
        player.kits = player.kits || {};
        player.kits[testData.kit.toLowerCase()] = {
          tier: testData.newTier,
          peakTier: testData.newTier,
          lastTestedAt: new Date().toISOString(),
          tester: testData.testerName || "Council",
          score: testData.score,
        };
        addOrUpdatePlayer(player);
      }

      return NextResponse.json({
        success: true,
        testResult: result,
        recentTests: RECENT_TESTS.slice(0, 10),
      });
    }

    if (action === "delete_test") {
      const { testId } = body;
      if (!testId) {
        return NextResponse.json({ error: "Missing testId" }, { status: 400 });
      }
      const removed = deleteTestRecord(testId);
      return NextResponse.json({
        success: removed,
        recentTestsCount: RECENT_TESTS.length,
      });
    }

    // 5. STAFF & TESTER ACTIONS
    if (action === "add_tester" || action === "update_tester") {
      const { testerData } = body;
      if (!testerData || !testerData.ign) {
        return NextResponse.json(
          { error: "Tester IGN is required." },
          { status: 400 }
        );
      }
      const member = addOrUpdateTester(testerData);
      return NextResponse.json({
        success: true,
        member,
        totalStaff: VYNTRIC_MEMBERS.length,
      });
    }

    // 6. SITE SETTINGS & ANNOUNCEMENT
    if (action === "update_settings") {
      const { settings } = body;
      const updated = updateSiteSettings(settings);
      return NextResponse.json({
        success: true,
        settings: updated,
      });
    }

    if (action === "update_announcement") {
      const { announcement } = body;
      const updated = setSiteAnnouncement(announcement);
      updateSiteSettings({ announcement: updated });
      return NextResponse.json({
        success: true,
        announcement: updated,
      });
    }

    // 7. BACKUP EXPORT & RESTORE
    if (action === "export_backup") {
      return NextResponse.json({
        success: true,
        exportedAt: new Date().toISOString(),
        data: getAllData(),
      });
    }

    if (action === "restore_backup") {
      const { data } = body;
      if (!data) {
        return NextResponse.json({ error: "No backup data provided" }, { status: 400 });
      }
      const restored = restoreAllData(data);
      return NextResponse.json({
        success: restored,
        totalPlayers: PLAYERS.length,
        totalTests: RECENT_TESTS.length,
        totalStaff: VYNTRIC_MEMBERS.length,
      });
    }

    return NextResponse.json(
      { error: `Unknown admin action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
