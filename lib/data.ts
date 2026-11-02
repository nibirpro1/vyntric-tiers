import {
  KitId,
  GamemodeId,
  Region,
  Tier,
  Player,
  Member,
  TestRecord,
  Application,
  PlayerKitEntry,
} from "./types";
import {
  TIER_POINTS,
  getTitle,
  GAMEMODES,
  computePoints,
} from "./tiers";

// ---------------------------------------------------------------------------
// 12 OFFICIAL VYNTRIC MEMBERS & TESTING COUNCIL
// ---------------------------------------------------------------------------
export const VYNTRIC_MEMBERS: Member[] = [
  {
    id: "mem-1",
    name: "Kazuma",
    ign: "Kazuma",
    role: "OWNER",
    avatarUrl: "https://mc-heads.net/avatar/Kazuma/128",
    discord: "kazuma.vyntric",
    testsCompleted: 482,
    testsConducted: 482,
    specialties: ["sword", "axe", "vanilla"],
    specialtyKits: ["sword", "axe", "vanilla"],
    joinDate: "Jan 14, 2024",
    joinedAt: "Jan 14, 2024",
    status: "ONLINE",
    quote: "Precision spacing and frame-perfect W-taps define the Vyntric benchmark.",
    isTesterOfTheMonth: true,
  },
  {
    id: "mem-2",
    name: "VyntricApex",
    ign: "Apex",
    role: "CO-OWNER",
    avatarUrl: "https://mc-heads.net/avatar/Apex/128",
    discord: "apex_vyntric",
    testsCompleted: 395,
    testsConducted: 395,
    specialties: ["vanilla", "uhc", "mace"],
    specialtyKits: ["vanilla", "uhc", "mace"],
    joinDate: "Feb 02, 2024",
    joinedAt: "Feb 02, 2024",
    status: "TESTING NOW",
    quote: "If you cannot reset under 120ms ping disparity, you are not ready for Tier 1.",
  },
  {
    id: "mem-3",
    name: "Cynical",
    ign: "Cynical",
    role: "MANAGER",
    avatarUrl: "https://mc-heads.net/avatar/Cynical/128",
    discord: "cynical.gg",
    testsCompleted: 310,
    testsConducted: 310,
    specialties: ["pot", "smp", "nethop"],
    specialtyKits: ["pot", "smp", "nethop"],
    joinDate: "Mar 10, 2024",
    joinedAt: "Mar 10, 2024",
    status: "ONLINE",
    quote: "Fair play, clean logs, and strict anti-macro audits on every verification duel.",
  },
  {
    id: "mem-4",
    name: "Vortexx",
    ign: "Vortex",
    role: "HEAD TESTER",
    avatarUrl: "https://mc-heads.net/avatar/Vortex/128",
    discord: "vortex_pvp",
    testsCompleted: 341,
    testsConducted: 341,
    specialties: ["vanilla", "sword"],
    specialtyKits: ["vanilla", "sword"],
    joinDate: "Apr 05, 2024",
    joinedAt: "Apr 05, 2024",
    status: "ONLINE",
    quote: "Crystal combat requires split-second anchor timings and aggressive terrain control.",
  },
  {
    id: "mem-5",
    name: "SlayerEU",
    ign: "Slayer",
    role: "HEAD TESTER",
    avatarUrl: "https://mc-heads.net/avatar/Slayer/128",
    discord: "slayer.eu",
    testsCompleted: 288,
    testsConducted: 288,
    specialties: ["axe", "mace"],
    specialtyKits: ["axe", "mace"],
    joinDate: "May 12, 2024",
    joinedAt: "May 12, 2024",
    status: "OFFLINE",
    quote: "Shield disables decide matches. Never misjudge a heavy swing trade.",
  },
  {
    id: "mem-6",
    name: "Zephyrus",
    ign: "Zephyr",
    role: "SENIOR TESTER",
    avatarUrl: "https://mc-heads.net/avatar/Zephyr/128",
    discord: "zephyr.vyn",
    testsCompleted: 247,
    testsConducted: 247,
    specialties: ["pot", "uhc"],
    specialtyKits: ["pot", "uhc"],
    joinDate: "Jun 20, 2024",
    joinedAt: "Jun 20, 2024",
    status: "TESTING NOW",
    quote: "Potion conservation under Speed II is an art. Don't waste your health pots.",
  },
  {
    id: "mem-7",
    name: "Riptide",
    ign: "Riptide",
    role: "SENIOR TESTER",
    avatarUrl: "https://mc-heads.net/avatar/Riptide/128",
    discord: "riptide_na",
    testsCompleted: 219,
    testsConducted: 219,
    specialties: ["smp", "nethop"],
    specialtyKits: ["smp", "nethop"],
    joinDate: "Jul 15, 2024",
    joinedAt: "Jul 15, 2024",
    status: "ONLINE",
    quote: "Netherite endurance testing tests psychological discipline as much as aim.",
  },
  {
    id: "mem-8",
    name: "Aetherial",
    ign: "Aether",
    role: "OFFICIAL TESTER",
    avatarUrl: "https://mc-heads.net/avatar/Aether/128",
    discord: "aether.gg",
    testsCompleted: 182,
    testsConducted: 182,
    specialties: ["sword", "uhc"],
    specialtyKits: ["sword", "uhc"],
    joinDate: "Aug 01, 2024",
    joinedAt: "Aug 01, 2024",
    status: "OFFLINE",
    quote: "Rod combos and sprint-breaking separates high tier challengers from novices.",
  },
  {
    id: "mem-9",
    name: "Spectre",
    ign: "Spectre",
    role: "OFFICIAL TESTER",
    avatarUrl: "https://mc-heads.net/avatar/Spectre/128",
    discord: "spectre_vyn",
    testsCompleted: 165,
    testsConducted: 165,
    specialties: ["mace", "vanilla"],
    specialtyKits: ["mace", "vanilla"],
    joinDate: "Sep 09, 2024",
    joinedAt: "Sep 09, 2024",
    status: "ONLINE",
    quote: "Mace wind charges changed the vertical meta forever. Respect the blast radius.",
  },
  {
    id: "mem-10",
    name: "Kryptic",
    ign: "Kryptic",
    role: "OFFICIAL TESTER",
    avatarUrl: "https://mc-heads.net/avatar/Kryptic/128",
    discord: "kryptic.dev",
    testsCompleted: 140,
    testsConducted: 140,
    specialties: ["axe", "pot"],
    specialtyKits: ["axe", "pot"],
    joinDate: "Oct 18, 2024",
    joinedAt: "Oct 18, 2024",
    status: "TESTING NOW",
    quote: "Always test on standard Minemen or verified Vyntric staging nodes.",
  },
  {
    id: "mem-11",
    name: "Cyphr",
    ign: "Cyphr",
    role: "DEVELOPER",
    avatarUrl: "https://mc-heads.net/avatar/Cyphr/128",
    discord: "cyphr_code",
    testsCompleted: 88,
    testsConducted: 88,
    specialties: ["sword", "vanilla"],
    specialtyKits: ["sword", "vanilla"],
    joinDate: "Nov 01, 2024",
    joinedAt: "Nov 01, 2024",
    status: "ONLINE",
    quote: "Building the lowest latency tier rating platform in the Minecraft competitive scene.",
  },
  {
    id: "mem-12",
    name: "Nebula",
    ign: "Nebula",
    role: "DEVELOPER",
    avatarUrl: "https://mc-heads.net/avatar/Nebula/128",
    discord: "nebula.bot",
    testsCompleted: 64,
    testsConducted: 64,
    specialties: ["pot", "smp"],
    specialtyKits: ["pot", "smp"],
    joinDate: "Dec 12, 2024",
    joinedAt: "Dec 12, 2024",
    status: "OFFLINE",
    quote: "Real-time Discord bot test verification connected seamlessly to web 3D graphics.",
  },
];

export const MEMBERS = VYNTRIC_MEMBERS;

// ---------------------------------------------------------------------------
// 20 RECENT TIER TESTS (WITH EXACT TIMESTAMPS)
// ---------------------------------------------------------------------------
export const RECENT_TESTS: TestRecord[] = [
  {
    id: "test-1",
    playerId: "p-marlowww",
    playerUsername: "Marlowww",
    testerId: "mem-1",
    testerUsername: "Kazuma",
    kit: "vanilla",
    previousTier: "LT1",
    newTier: "HT1",
    result: "PROMOTED",
    score: "5-2",
    duration: "13m 48s",
    durationSec: 828,
    timestamp: "2026-11-01T14:46:00.000Z", // ~5 mins ago relative
    testedAt: "5 mins ago",
    notes: "Flawless anchor double-ticks and defensive obsidian placement under pressure.",
  },
  {
    id: "test-2",
    playerId: "p-swight",
    playerUsername: "Swight",
    testerId: "mem-4",
    testerUsername: "Vortex",
    kit: "sword",
    previousTier: "HT2",
    newTier: "HT1",
    result: "PROMOTED",
    score: "5-3",
    duration: "15m 12s",
    durationSec: 912,
    timestamp: "2026-11-01T14:33:00.000Z", // ~18 mins ago
    testedAt: "18 mins ago",
    notes: "Exceptional sprint reset cadence. Hit selection was virtually unpunishable.",
  },
  {
    id: "test-3",
    playerId: "p-coldified",
    playerUsername: "Coldified",
    testerId: "mem-2",
    testerUsername: "Apex",
    kit: "pot",
    previousTier: "LT1",
    newTier: "HT1",
    result: "PROMOTED",
    score: "5-1",
    duration: "11m 05s",
    durationSec: 665,
    timestamp: "2026-11-01T14:08:00.000Z", // ~43 mins ago
    testedAt: "43 mins ago",
    notes: "Speed II pot rotation efficiency at 94%. Unmatched strafe lock.",
  },
  {
    id: "test-4",
    playerId: "p-itzrealme",
    playerUsername: "ItzRealMe",
    testerId: "mem-6",
    testerUsername: "Zephyr",
    kit: "uhc",
    previousTier: "HT2",
    newTier: "LT1",
    result: "PROMOTED",
    score: "5-4",
    duration: "17m 30s",
    durationSec: 1050,
    timestamp: "2026-11-01T13:20:00.000Z", // ~1.5h ago
    testedAt: "1h ago",
    notes: "Decisive golden head timing and clutch lava bucket trap in game 9.",
  },
  {
    id: "test-5",
    playerId: "p-clownpierce",
    playerUsername: "ClownPierce",
    testerId: "mem-5",
    testerUsername: "Slayer",
    kit: "axe",
    previousTier: "LT1",
    newTier: "HT1",
    result: "PROMOTED",
    score: "5-0",
    duration: "09m 14s",
    durationSec: 554,
    timestamp: "2026-11-01T12:45:00.000Z", // ~2h ago
    testedAt: "2h ago",
    notes: "Flawless 5-0 sweep. Masterful shield disable bait and critical spacing.",
  },
  {
    id: "test-6",
    playerId: "p-blvckwolv",
    playerUsername: "BlvckWolv",
    testerId: "mem-3",
    testerUsername: "Cynical",
    kit: "nethop",
    previousTier: "HT2",
    newTier: "LT1",
    result: "PROMOTED",
    score: "5-3",
    duration: "21m 40s",
    durationSec: 1300,
    timestamp: "2026-11-01T11:15:00.000Z", // ~3.5h ago
    testedAt: "3h ago",
    notes: "Strength potion burst punishment was executed with surgical patience.",
  },
  {
    id: "test-7",
    playerId: "p-minemanner",
    playerUsername: "Minemanner",
    testerId: "mem-8",
    testerUsername: "Aether",
    kit: "sword",
    previousTier: "HT2",
    newTier: "HT2",
    result: "RETAINED",
    score: "3-5",
    duration: "14m 22s",
    durationSec: 862,
    timestamp: "2026-11-01T09:30:00.000Z", // ~5h ago
    testedAt: "5h ago",
    notes: "Solid mechanics, but struggles on counter-strafe resets against High Tier 1 speed.",
  },
  {
    id: "test-8",
    playerId: "p-rasplin",
    playerUsername: "Rasplin",
    testerId: "mem-9",
    testerUsername: "Spectre",
    kit: "mace",
    previousTier: "LT2",
    newTier: "HT2",
    result: "PROMOTED",
    score: "5-2",
    duration: "12m 19s",
    durationSec: 739,
    timestamp: "2026-11-01T07:10:00.000Z", // ~7h ago
    testedAt: "7h ago",
    notes: "Wind charge heights exploited the ceiling geometry perfectly.",
  },
  {
    id: "test-9",
    playerId: "p-xnestorio",
    playerUsername: "xNestorio",
    testerId: "mem-6",
    testerUsername: "Zephyr",
    kit: "uhc",
    previousTier: "LT2",
    newTier: "HT2",
    result: "PROMOTED",
    score: "5-3",
    duration: "18m 04s",
    durationSec: 1084,
    timestamp: "2026-10-31T22:40:00.000Z", // Yesterday
    testedAt: "Yesterday",
    notes: "Legendary bow accuracy and rod-spacing preserved golden head parity.",
  },
  {
    id: "test-10",
    playerId: "p-lurrn",
    playerUsername: "Lurrn",
    testerId: "mem-7",
    testerUsername: "Riptide",
    kit: "smp",
    previousTier: "HT3",
    newTier: "LT2",
    result: "PROMOTED",
    score: "5-2",
    duration: "19m 50s",
    durationSec: 1190,
    timestamp: "2026-10-31T19:15:00.000Z", // Yesterday
    testedAt: "Yesterday",
    notes: "Totem cycling and elytra escape recovery executed with minimal latency.",
  },
  {
    id: "test-11",
    playerId: "p-flowtives",
    playerUsername: "Flowtives",
    testerId: "mem-1",
    testerUsername: "Kazuma",
    kit: "sword",
    previousTier: "LT2",
    newTier: "HT2",
    result: "PROMOTED",
    score: "5-1",
    duration: "10m 55s",
    durationSec: 655,
    timestamp: "2026-10-31T15:30:00.000Z", // Yesterday
    testedAt: "Yesterday",
    notes: "Smooth tracking and dominant combo resets on 1.8 duel physics.",
  },
  {
    id: "test-12",
    playerId: "p-tryhard",
    playerUsername: "Tryhard",
    testerId: "mem-10",
    testerUsername: "Kryptic",
    kit: "pot",
    previousTier: "HT3",
    newTier: "LT2",
    result: "PROMOTED",
    score: "5-4",
    duration: "16m 12s",
    durationSec: 972,
    timestamp: "2026-10-31T11:00:00.000Z", // Yesterday
    testedAt: "Yesterday",
    notes: "Aggressive debuff throwing swung the decisive final duel.",
  },
  {
    id: "test-13",
    playerId: "p-sharpness",
    playerUsername: "Sharpness",
    testerId: "mem-5",
    testerUsername: "Slayer",
    kit: "axe",
    previousTier: "HT2",
    newTier: "HT2",
    result: "RETAINED",
    score: "4-5",
    duration: "18m 45s",
    durationSec: 1125,
    timestamp: "2026-10-30T21:10:00.000Z", // 2 days ago
    testedAt: "2d ago",
    notes: "Extremely close duel. Retains High Tier 2 with peak performance.",
  },
  {
    id: "test-14",
    playerId: "p-spokeishere",
    playerUsername: "SpokeIsHere",
    testerId: "mem-2",
    testerUsername: "Apex",
    kit: "vanilla",
    previousTier: "LT3",
    newTier: "HT3",
    result: "PROMOTED",
    score: "5-3",
    duration: "12m 40s",
    durationSec: 760,
    timestamp: "2026-10-30T17:20:00.000Z", // 2 days ago
    testedAt: "2d ago",
    notes: "Rapid anchor double explosions caught tester off guard in mid-fight.",
  },
  {
    id: "test-15",
    playerId: "p-flamefrags",
    playerUsername: "flamefrags",
    testerId: "mem-9",
    testerUsername: "Spectre",
    kit: "mace",
    previousTier: "UNRANKED",
    newTier: "LT2",
    result: "NEW",
    score: "5-2",
    duration: "11m 30s",
    durationSec: 690,
    timestamp: "2026-10-30T14:05:00.000Z", // 2 days ago
    testedAt: "2d ago",
    notes: "Initial placement test. Strong vertical awareness grants Low Tier 2.",
  },
  {
    id: "test-16",
    playerId: "p-manepear",
    playerUsername: "ManePear",
    testerId: "mem-3",
    testerUsername: "Cynical",
    kit: "nethop",
    previousTier: "LT2",
    newTier: "LT3",
    result: "DEMOTED",
    score: "2-5",
    duration: "17m 50s",
    durationSec: 1070,
    timestamp: "2026-10-29T20:30:00.000Z", // 3 days ago
    testedAt: "3d ago",
    notes: "Struggled with golden apple pacing and got chipped out consistently.",
  },
  {
    id: "test-17",
    playerId: "p-wemmbu",
    playerUsername: "Wemmbu",
    testerId: "mem-7",
    testerUsername: "Riptide",
    kit: "smp",
    previousTier: "UNRANKED",
    newTier: "HT3",
    result: "NEW",
    score: "5-1",
    duration: "15m 10s",
    durationSec: 910,
    timestamp: "2026-10-29T16:45:00.000Z", // 3 days ago
    testedAt: "3d ago",
    notes: "Instant placement into High Tier 3. Excellent web trap mechanics.",
  },
  {
    id: "test-18",
    playerId: "p-doly",
    playerUsername: "Doly",
    testerId: "mem-4",
    testerUsername: "Vortex",
    kit: "vanilla",
    previousTier: "HT3",
    newTier: "LT2",
    result: "PROMOTED",
    score: "5-3",
    duration: "14m 00s",
    durationSec: 840,
    timestamp: "2026-10-29T12:00:00.000Z", // 3 days ago
    testedAt: "3d ago",
    notes: "Solid crystal break speed and high-level terrain adaptation.",
  },
  {
    id: "test-19",
    playerId: "p-ziblacking",
    playerUsername: "Ziblacking",
    testerId: "mem-8",
    testerUsername: "Aether",
    kit: "sword",
    previousTier: "LT3",
    newTier: "HT3",
    result: "PROMOTED",
    score: "5-2",
    duration: "13m 15s",
    durationSec: 795,
    timestamp: "2026-10-28T18:25:00.000Z", // 4 days ago
    testedAt: "4d ago",
    notes: "Reliable sprint tap rhythm and smart reach spacing throughout.",
  },
  {
    id: "test-20",
    playerId: "p-sponker",
    playerUsername: "Sponker",
    testerId: "mem-1",
    testerUsername: "Kazuma",
    kit: "sword",
    previousTier: "HT1",
    newTier: "HT1",
    result: "RETAINED",
    score: "5-4",
    duration: "20m 10s",
    durationSec: 1210,
    timestamp: "2026-10-28T14:10:00.000Z", // 4 days ago
    testedAt: "4d ago",
    notes: "God-tier 1v1 battle. Sponker retains High Tier 1 in a nail-biting game 9.",
  },
];

// ---------------------------------------------------------------------------
// 30+ RANKED PLAYERS WITH REAL SKINS & MULTI-KIT TIERS
// ---------------------------------------------------------------------------
interface RawPlayerConfig {
  id: string;
  ign: string;
  region: Region;
  tiers: Partial<Record<GamemodeId, { tier: Tier; peakTier: Tier; testedAt: string; tester: string; score?: string }>>;
}

const RAW_PLAYERS: RawPlayerConfig[] = [
  {
    id: "p-marlowww",
    ign: "Marlowww",
    region: "NA",
    tiers: {
      vanilla: { tier: "HT1", peakTier: "HT1", testedAt: "2026-11-01T14:46:00.000Z", tester: "Kazuma", score: "5-2" },
      sword: { tier: "HT1", peakTier: "HT1", testedAt: "2026-10-25T16:00:00.000Z", tester: "Apex", score: "5-3" },
      pot: { tier: "LT1", peakTier: "HT1", testedAt: "2026-10-20T12:00:00.000Z", tester: "Zephyr", score: "5-4" },
      uhc: { tier: "HT2", peakTier: "HT1", testedAt: "2026-10-18T18:00:00.000Z", tester: "Zephyr", score: "5-2" },
      axe: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-15T14:00:00.000Z", tester: "Slayer", score: "5-3" },
      nethop: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-10T19:00:00.000Z", tester: "Cynical", score: "5-3" },
      smp: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-05T17:00:00.000Z", tester: "Riptide", score: "5-2" },
      mace: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-01T15:00:00.000Z", tester: "Spectre", score: "5-4" },
    },
  },
  {
    id: "p-swight",
    ign: "Swight",
    region: "NA",
    tiers: {
      sword: { tier: "HT1", peakTier: "HT1", testedAt: "2026-11-01T14:33:00.000Z", tester: "Vortex", score: "5-3" },
      vanilla: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-24T18:00:00.000Z", tester: "Kazuma", score: "5-3" },
      pot: { tier: "HT1", peakTier: "HT1", testedAt: "2026-10-22T19:00:00.000Z", tester: "Zephyr", score: "5-1" },
      axe: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-19T14:00:00.000Z", tester: "Slayer", score: "5-4" },
      uhc: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-14T16:00:00.000Z", tester: "Zephyr", score: "5-3" },
      smp: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-11T12:00:00.000Z", tester: "Riptide", score: "5-2" },
      nethop: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-08T15:00:00.000Z", tester: "Cynical", score: "5-3" },
      mace: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-02T16:00:00.000Z", tester: "Spectre", score: "5-2" },
    },
  },
  {
    id: "p-clownpierce",
    ign: "ClownPierce",
    region: "EU",
    tiers: {
      axe: { tier: "HT1", peakTier: "HT1", testedAt: "2026-11-01T12:45:00.000Z", tester: "Slayer", score: "5-0" },
      sword: { tier: "HT1", peakTier: "HT1", testedAt: "2026-10-26T20:00:00.000Z", tester: "Kazuma", score: "5-1" },
      smp: { tier: "HT1", peakTier: "HT1", testedAt: "2026-10-21T18:00:00.000Z", tester: "Riptide", score: "5-2" },
      vanilla: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-16T15:00:00.000Z", tester: "Apex", score: "5-4" },
      mace: { tier: "HT1", peakTier: "HT1", testedAt: "2026-10-12T17:00:00.000Z", tester: "Spectre", score: "5-1" },
      nethop: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-07T14:00:00.000Z", tester: "Cynical", score: "5-3" },
      uhc: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-03T19:00:00.000Z", tester: "Zephyr", score: "5-3" },
    },
  },
  {
    id: "p-coldified",
    ign: "Coldified",
    region: "NA",
    tiers: {
      pot: { tier: "HT1", peakTier: "HT1", testedAt: "2026-11-01T14:08:00.000Z", tester: "Apex", score: "5-1" },
      sword: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-23T17:00:00.000Z", tester: "Kazuma", score: "5-4" },
      vanilla: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-18T13:00:00.000Z", tester: "Vortex", score: "5-2" },
      uhc: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-13T19:00:00.000Z", tester: "Zephyr", score: "5-3" },
      nethop: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-09T18:00:00.000Z", tester: "Cynical", score: "5-2" },
      axe: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-04T15:00:00.000Z", tester: "Slayer", score: "5-4" },
      smp: { tier: "HT2", peakTier: "HT2", testedAt: "2026-09-30T16:00:00.000Z", tester: "Riptide", score: "5-3" },
    },
  },
  {
    id: "p-sponker",
    ign: "Sponker",
    region: "EU",
    tiers: {
      sword: { tier: "HT1", peakTier: "HT1", testedAt: "2026-10-28T14:10:00.000Z", tester: "Kazuma", score: "5-4" },
      vanilla: { tier: "HT1", peakTier: "HT1", testedAt: "2026-10-25T19:00:00.000Z", tester: "Vortex", score: "5-3" },
      axe: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-20T16:00:00.000Z", tester: "Slayer", score: "5-2" },
      pot: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-15T18:00:00.000Z", tester: "Zephyr", score: "5-3" },
      uhc: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-10T14:00:00.000Z", tester: "Aether", score: "5-4" },
      smp: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-06T15:00:00.000Z", tester: "Riptide", score: "5-3" },
    },
  },
  {
    id: "p-blvckwolv",
    ign: "BlvckWolv",
    region: "EU",
    tiers: {
      nethop: { tier: "LT1", peakTier: "LT1", testedAt: "2026-11-01T11:15:00.000Z", tester: "Cynical", score: "5-3" },
      vanilla: { tier: "HT1", peakTier: "HT1", testedAt: "2026-10-26T18:00:00.000Z", tester: "Apex", score: "5-2" },
      smp: { tier: "HT1", peakTier: "HT1", testedAt: "2026-10-22T14:00:00.000Z", tester: "Riptide", score: "5-1" },
      sword: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-17T17:00:00.000Z", tester: "Kazuma", score: "5-4" },
      axe: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-12T13:00:00.000Z", tester: "Slayer", score: "5-3" },
      mace: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-08T19:00:00.000Z", tester: "Spectre", score: "5-2" },
    },
  },
  {
    id: "p-itzrealme",
    ign: "ItzRealMe",
    region: "NA",
    tiers: {
      uhc: { tier: "LT1", peakTier: "LT1", testedAt: "2026-11-01T13:20:00.000Z", tester: "Zephyr", score: "5-4" },
      sword: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-24T19:00:00.000Z", tester: "Kazuma", score: "5-2" },
      pot: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-19T17:00:00.000Z", tester: "Zephyr", score: "5-3" },
      vanilla: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-14T15:00:00.000Z", tester: "Vortex", score: "5-4" },
      axe: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-09T18:00:00.000Z", tester: "Slayer", score: "5-1" },
      smp: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-05T14:00:00.000Z", tester: "Riptide", score: "5-3" },
    },
  },
  {
    id: "p-minemanner",
    ign: "Minemanner",
    region: "NA",
    tiers: {
      sword: { tier: "HT2", peakTier: "HT1", testedAt: "2026-11-01T09:30:00.000Z", tester: "Aether", score: "3-5" },
      pot: { tier: "LT1", peakTier: "LT1", testedAt: "2026-10-27T18:00:00.000Z", tester: "Zephyr", score: "5-2" },
      vanilla: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-21T15:00:00.000Z", tester: "Apex", score: "5-3" },
      uhc: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-16T19:00:00.000Z", tester: "Zephyr", score: "5-4" },
      axe: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-11T13:00:00.000Z", tester: "Slayer", score: "5-2" },
    },
  },
  {
    id: "p-xnestorio",
    ign: "xNestorio",
    region: "NA",
    tiers: {
      uhc: { tier: "HT2", peakTier: "HT1", testedAt: "2026-10-31T22:40:00.000Z", tester: "Zephyr", score: "5-3" },
      sword: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-25T14:00:00.000Z", tester: "Kazuma", score: "5-2" },
      pot: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-20T17:00:00.000Z", tester: "Zephyr", score: "5-4" },
      vanilla: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-15T16:00:00.000Z", tester: "Vortex", score: "5-3" },
      smp: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-10T12:00:00.000Z", tester: "Riptide", score: "5-1" },
    },
  },
  {
    id: "p-rasplin",
    ign: "Rasplin",
    region: "EU",
    tiers: {
      mace: { tier: "HT2", peakTier: "HT2", testedAt: "2026-11-01T07:10:00.000Z", tester: "Spectre", score: "5-2" },
      vanilla: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-24T19:00:00.000Z", tester: "Vortex", score: "5-4" },
      axe: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-19T14:00:00.000Z", tester: "Slayer", score: "5-3" },
      sword: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-14T16:00:00.000Z", tester: "Aether", score: "5-2" },
      smp: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-09T18:00:00.000Z", tester: "Riptide", score: "5-4" },
    },
  },
  {
    id: "p-flowtives",
    ign: "Flowtives",
    region: "NA",
    tiers: {
      sword: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-31T15:30:00.000Z", tester: "Kazuma", score: "5-1" },
      pot: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-26T17:00:00.000Z", tester: "Zephyr", score: "5-3" },
      vanilla: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-20T19:00:00.000Z", tester: "Apex", score: "5-4" },
      uhc: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-15T15:00:00.000Z", tester: "Aether", score: "5-2" },
    },
  },
  {
    id: "p-kylaz",
    ign: "Kylaz",
    region: "AU",
    tiers: {
      vanilla: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-27T12:00:00.000Z", tester: "Vortex", score: "5-3" },
      sword: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-22T14:00:00.000Z", tester: "Aether", score: "5-4" },
      pot: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-17T16:00:00.000Z", tester: "Zephyr", score: "5-2" },
      mace: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-12T13:00:00.000Z", tester: "Spectre", score: "5-1" },
    },
  },
  {
    id: "p-lurrn",
    ign: "Lurrn",
    region: "NA",
    tiers: {
      smp: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-31T19:15:00.000Z", tester: "Riptide", score: "5-2" },
      nethop: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-25T18:00:00.000Z", tester: "Cynical", score: "5-4" },
      sword: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-19T15:00:00.000Z", tester: "Kazuma", score: "5-3" },
      vanilla: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-14T17:00:00.000Z", tester: "Apex", score: "5-2" },
    },
  },
  {
    id: "p-tryhard",
    ign: "Tryhard",
    region: "NA",
    tiers: {
      pot: { tier: "LT2", peakTier: "HT2", testedAt: "2026-10-31T11:00:00.000Z", tester: "Kryptic", score: "5-4" },
      sword: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-26T16:00:00.000Z", tester: "Kazuma", score: "5-2" },
      uhc: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-21T18:00:00.000Z", tester: "Zephyr", score: "5-3" },
      vanilla: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-16T14:00:00.000Z", tester: "Vortex", score: "5-4" },
    },
  },
  {
    id: "p-sharpness",
    ign: "Sharpness",
    region: "EU",
    tiers: {
      axe: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-30T21:10:00.000Z", tester: "Slayer", score: "4-5" },
      sword: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-24T17:00:00.000Z", tester: "Kazuma", score: "5-3" },
      mace: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-18T15:00:00.000Z", tester: "Spectre", score: "5-2" },
      smp: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-13T19:00:00.000Z", tester: "Riptide", score: "5-1" },
    },
  },
  {
    id: "p-spokeishere",
    ign: "SpokeIsHere",
    region: "NA",
    tiers: {
      vanilla: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-30T17:20:00.000Z", tester: "Apex", score: "5-3" },
      smp: { tier: "HT2", peakTier: "HT2", testedAt: "2026-10-25T16:00:00.000Z", tester: "Riptide", score: "5-4" },
      sword: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-20T14:00:00.000Z", tester: "Aether", score: "5-2" },
    },
  },
  {
    id: "p-flamefrags",
    ign: "flamefrags",
    region: "AS",
    tiers: {
      mace: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-30T14:05:00.000Z", tester: "Spectre", score: "5-2" },
      vanilla: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-26T13:00:00.000Z", tester: "Vortex", score: "5-4" },
      sword: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-21T15:00:00.000Z", tester: "Aether", score: "5-3" },
    },
  },
  {
    id: "p-manepear",
    ign: "ManePear",
    region: "SA",
    tiers: {
      nethop: { tier: "LT3", peakTier: "LT2", testedAt: "2026-10-29T20:30:00.000Z", tester: "Cynical", score: "2-5" },
      pot: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-24T18:00:00.000Z", tester: "Zephyr", score: "5-3" },
      sword: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-18T16:00:00.000Z", tester: "Kazuma", score: "5-2" },
    },
  },
  {
    id: "p-wemmbu",
    ign: "Wemmbu",
    region: "EU",
    tiers: {
      smp: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-29T16:45:00.000Z", tester: "Riptide", score: "5-1" },
      axe: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-23T14:00:00.000Z", tester: "Slayer", score: "5-3" },
      sword: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-17T17:00:00.000Z", tester: "Kazuma", score: "5-2" },
    },
  },
  {
    id: "p-ferret",
    ign: "Ferret",
    region: "NA",
    tiers: {
      vanilla: { tier: "LT2", peakTier: "LT2", testedAt: "2026-10-28T16:00:00.000Z", tester: "Apex", score: "5-3" },
      pot: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-22T19:00:00.000Z", tester: "Zephyr", score: "5-4" },
      sword: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-16T15:00:00.000Z", tester: "Aether", score: "5-2" },
    },
  },
  {
    id: "p-doly",
    ign: "Doly",
    region: "EU",
    tiers: {
      vanilla: { tier: "LT2", peakTier: "HT3", testedAt: "2026-10-29T12:00:00.000Z", tester: "Vortex", score: "5-3" },
      sword: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-24T15:00:00.000Z", tester: "Kazuma", score: "5-2" },
      axe: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-18T17:00:00.000Z", tester: "Slayer", score: "5-4" },
    },
  },
  {
    id: "p-ziblacking",
    ign: "Ziblacking",
    region: "AS",
    tiers: {
      sword: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-28T18:25:00.000Z", tester: "Aether", score: "5-2" },
      pot: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-23T14:00:00.000Z", tester: "Zephyr", score: "5-3" },
      vanilla: { tier: "HT4", peakTier: "HT4", testedAt: "2026-10-17T16:00:00.000Z", tester: "Apex", score: "5-1" },
    },
  },
  {
    id: "p-stimpy",
    ign: "stimpy",
    region: "NA",
    tiers: {
      pot: { tier: "HT2", peakTier: "HT1", testedAt: "2026-10-25T19:00:00.000Z", tester: "Zephyr", score: "5-3" },
      sword: { tier: "LT2", peakTier: "LT1", testedAt: "2026-10-20T17:00:00.000Z", tester: "Kazuma", score: "5-4" },
    },
  },
  {
    id: "p-inteledits",
    ign: "intel_edits",
    region: "NA",
    tiers: {
      sword: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-26T16:00:00.000Z", tester: "Aether", score: "5-2" },
      axe: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-21T14:00:00.000Z", tester: "Slayer", score: "5-3" },
    },
  },
  {
    id: "p-dewier",
    ign: "Dewier",
    region: "EU",
    tiers: {
      vanilla: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-27T17:00:00.000Z", tester: "Vortex", score: "5-3" },
      mace: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-22T15:00:00.000Z", tester: "Spectre", score: "5-4" },
    },
  },
  {
    id: "p-koi",
    ign: "Koi",
    region: "AS",
    tiers: {
      sword: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-25T14:00:00.000Z", tester: "Aether", score: "5-3" },
      pot: { tier: "HT4", peakTier: "HT4", testedAt: "2026-10-19T18:00:00.000Z", tester: "Zephyr", score: "5-1" },
    },
  },
  {
    id: "p-vyntricking",
    ign: "VyntricKing",
    region: "NA",
    tiers: {
      sword: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-24T19:00:00.000Z", tester: "Kazuma", score: "5-2" },
      axe: { tier: "HT4", peakTier: "HT4", testedAt: "2026-10-18T16:00:00.000Z", tester: "Slayer", score: "5-3" },
    },
  },
  {
    id: "p-aetherpvp",
    ign: "AetherPvP",
    region: "AU",
    tiers: {
      mace: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-23T12:00:00.000Z", tester: "Spectre", score: "5-3" },
      vanilla: { tier: "HT4", peakTier: "HT4", testedAt: "2026-10-17T15:00:00.000Z", tester: "Apex", score: "5-2" },
    },
  },
  {
    id: "p-noxious",
    ign: "Noxious",
    region: "SA",
    tiers: {
      uhc: { tier: "HT4", peakTier: "HT4", testedAt: "2026-10-22T18:00:00.000Z", tester: "Zephyr", score: "5-2" },
      smp: { tier: "LT4", peakTier: "LT4", testedAt: "2026-10-16T14:00:00.000Z", tester: "Riptide", score: "5-3" },
    },
  },
  {
    id: "p-zephyr",
    ign: "Zephyr",
    region: "NA",
    tiers: {
      pot: { tier: "HT3", peakTier: "HT3", testedAt: "2026-10-21T19:00:00.000Z", tester: "Kryptic", score: "5-3" },
      sword: { tier: "LT4", peakTier: "LT4", testedAt: "2026-10-15T16:00:00.000Z", tester: "Aether", score: "5-4" },
    },
  },
  {
    id: "p-lethalv",
    ign: "Lethal_V",
    region: "EU",
    tiers: {
      sword: { tier: "HT3", peakTier: "HT2", testedAt: "2026-10-20T17:00:00.000Z", tester: "Kazuma", score: "5-3" },
      axe: { tier: "LT3", peakTier: "LT3", testedAt: "2026-10-14T15:00:00.000Z", tester: "Slayer", score: "5-2" },
    },
  },
  {
    id: "p-kryo",
    ign: "Kryo",
    region: "AS",
    tiers: {
      vanilla: { tier: "HT4", peakTier: "HT4", testedAt: "2026-10-19T14:00:00.000Z", tester: "Vortex", score: "5-1" },
      mace: { tier: "LT4", peakTier: "LT4", testedAt: "2026-10-13T16:00:00.000Z", tester: "Spectre", score: "5-3" },
    },
  },
];

// Helper to build full Player object
export function buildPlayerList(): Player[] {
  // First calculate points for all
  const rawWithPoints = RAW_PLAYERS.map((rp) => {
    const kitsMap: Partial<Record<string, PlayerKitEntry>> = {};
    for (const [k, v] of Object.entries(rp.tiers)) {
      if (v) {
        kitsMap[k] = {
          tier: v.tier,
          peakTier: v.peakTier,
          lastTestedAt: v.testedAt,
          tester: v.tester,
          score: v.score,
        };
      }
    }
    const points = computePoints(kitsMap);
    return {
      ...rp,
      kits: kitsMap,
      points,
    };
  });

  // Sort by points descending
  rawWithPoints.sort((a, b) => b.points - a.points);

  // Map to final Player array with rank and combatTitle
  return rawWithPoints.map((p, index) => {
    const title = getTitle(p.points);
    // Find matching tests in RECENT_TESTS
    const playerTests = RECENT_TESTS.filter((t) => t.playerUsername.toLowerCase() === p.ign.toLowerCase());

    return {
      id: p.id,
      username: p.ign,
      ign: p.ign,
      uuid: p.ign,
      region: p.region,
      points: p.points,
      totalPoints: p.points,
      globalRank: index + 1,
      combatTitle: title.name,
      kits: p.kits,
      tiers: p.kits,
      testHistory: playerTests,
      joinedAt: "Jan 2025",
      lastTestedAt: Object.values(p.kits)[0]?.lastTestedAt || "2026-10-25T12:00:00.000Z",
      discord: `@${p.ign.toLowerCase()}`,
    };
  });
}

export const PLAYERS: Player[] = buildPlayerList();

export const KITS = GAMEMODES.map((g) => ({
  id: g.id as KitId,
  name: g.name,
  shortDesc: g.shortDesc,
  accentColor: g.accentColor,
}));

// Backward-compatible query helpers
export function getPlayerByUsername(username: string): Player | undefined {
  const clean = username.trim().toLowerCase();
  return PLAYERS.find(
    (p) => p.username.toLowerCase() === clean || p.id.toLowerCase() === clean
  );
}

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function getTests(limit = 20): TestRecord[] {
  return RECENT_TESTS.slice(0, limit);
}

export function getPlayerTests(playerId: string): TestRecord[] {
  const p = PLAYERS.find((pl) => pl.id === playerId);
  if (!p) return [];
  return RECENT_TESTS.filter((t) => t.playerUsername.toLowerCase() === p.username.toLowerCase());
}

export function getStats() {
  const activeTesters = VYNTRIC_MEMBERS.filter(
    (m) => m.status === "ONLINE" || m.status === "TESTING NOW"
  ).length;

  return {
    totalPlayers: PLAYERS.length,
    totalTests: 1248,
    activeTesters: activeTesters,
    testsThisWeek: 87,
    avgTestDuration: "12m 30s",
    seasonNumber: 1,
  };
}

export function getTesters(): Member[] {
  return VYNTRIC_MEMBERS;
}

export function getKitStats(kitId: KitId) {
  const tested = PLAYERS.filter(
    (p) => p.kits?.[kitId]?.tier && p.kits[kitId]?.tier !== "Unranked"
  );
  return {
    totalTested: tested.length,
    totalRanked: tested.length,
    ht1Count: PLAYERS.filter((p) => p.kits?.[kitId]?.tier === "HT1").length,
    activeTesters: 4,
    topPlayer: tested[0],
  };
}

export function getWeeklyTestCounts(weeks = 12): { week: string; count: number }[] {
  const result: { week: string; count: number }[] = [];
  for (let i = 1; i <= weeks; i++) {
    result.push({
      week: `W${i}`,
      count: 42 + i * 4 + (i % 3 === 0 ? 12 : -5),
    });
  }
  return result;
}

const mockApplications: Application[] = [
  {
    id: "app-1",
    ign: "Kenorii",
    discordTag: "kenorii#1001",
    region: "NA",
    kit: "sword",
    previousTier: "LT3",
    targetTier: "HT2",
    vodLink: "https://youtube.com/watch?v=mock1",
    status: "pending",
    submittedAt: "2025-05-10T14:20:00Z",
    queuePosition: 1,
    estimatedWaitHours: 2,
    reviewNotes: "Strong rod combo, needs consistency check in second set.",
  },
  {
    id: "app-2",
    ign: "Velociti",
    discordTag: "velociti#4021",
    region: "EU",
    kit: "pot",
    previousTier: "HT3",
    targetTier: "LT2",
    vodLink: "https://youtube.com/watch?v=mock2",
    status: "in_review",
    submittedAt: "2025-05-11T09:15:00Z",
    queuePosition: 2,
    estimatedWaitHours: 4,
  },
];

export function getApplications(filters?: { ign?: string }): Application[] {
  if (filters?.ign) {
    return mockApplications.filter(
      (a) => a.ign.toLowerCase() === filters.ign!.toLowerCase()
    );
  }
  return mockApplications;
}

export function getApplicationById(id: string): Application | undefined {
  return mockApplications.find((a) => a.id === id);
}

export function addApplication(app: Partial<Application>): Application {
  const newApp: Application = {
    id: `app-${Date.now()}`,
    ign: app.ign || "Unknown",
    discordTag: app.discordTag || "unknown#0000",
    region: app.region || "NA",
    kit: app.kit || "sword",
    previousTier: app.previousTier || "Unranked",
    vodLink: app.vodLink || "",
    status: "pending",
    submittedAt: new Date().toISOString(),
    queuePosition: mockApplications.length + 1,
    estimatedWaitHours: (mockApplications.length + 1) * 2,
    ...app,
  };
  mockApplications.unshift(newApp);
  return newApp;
}

export function updateApplicationStatus(
  id: string,
  status: Application["status"],
  notes?: string
): Application | null {
  const app = mockApplications.find((a) => a.id === id);
  if (!app) return null;
  app.status = status;
  if (notes) app.reviewNotes = notes;
  return app;
}

export function recordTestResult(record: any) {
  const player = getPlayerByUsername(record.ign) || PLAYERS[0];
  const newTest: TestRecord = {
    id: `test-${Date.now()}`,
    playerId: player.id,
    playerUsername: player.username,
    testerId: "mem-1",
    testerUsername: record.testerName || "Kazuma",
    kit: record.kit || "sword",
    previousTier: record.oldTier || "UNRANKED",
    newTier: record.newTier || "HT3",
    result: record.outcome || "promoted",
    score: record.score || "5-2",
    duration: record.duration || "12m 30s",
    timestamp: new Date().toISOString(),
    vodUrl: record.vodUrl,
    notes: record.notes,
  };
  RECENT_TESTS.unshift(newTest);
  return {
    testRecord: newTest,
    player,
    diff: {
      points: 15,
      oldRank: player.globalRank,
      newRank: Math.max(1, player.globalRank - 1),
    },
  };
}


// ---------------------------------------------------------------------------
// ADMIN & COUNCIL MASTER MUTATION API
// ---------------------------------------------------------------------------

let siteAnnouncement = {
  enabled: false,
  message: "Official Vyntric Tier Testing is OPEN. Open a queue ticket to challenge accredited testers.",
  type: "info" as "alert" | "info" | "event",
};

export function getSiteAnnouncement() {
  return siteAnnouncement;
}

export function setSiteAnnouncement(data: Partial<typeof siteAnnouncement>) {
  siteAnnouncement = { ...siteAnnouncement, ...data };
  return siteAnnouncement;
}

export function addOrUpdatePlayer(playerData: Partial<Player> & { username: string }): Player {
  const existingIdx = PLAYERS.findIndex(
    (p) => p.username.toLowerCase() === playerData.username.toLowerCase() || (playerData.id && p.id === playerData.id)
  );

  let target: Player;

  if (existingIdx >= 0) {
    target = {
      ...PLAYERS[existingIdx],
      ...playerData,
      kits: { ...PLAYERS[existingIdx].kits, ...(playerData.kits || {}) },
    };
    PLAYERS[existingIdx] = target;
  } else {
    const rawKits = playerData.kits || {};
    target = {
      id: playerData.id || `p-${playerData.username.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      username: playerData.username,
      ign: playerData.username,
      uuid: playerData.username,
      region: playerData.region || "NA",
      points: playerData.points || 0,
      globalRank: PLAYERS.length + 1,
      combatTitle: "Combat Novice",
      kits: rawKits,
      tiers: rawKits,
      testHistory: [],
      joinedAt: "Just now",
      lastTestedAt: new Date().toISOString(),
      discord: playerData.discord || `@${playerData.username.toLowerCase()}`,
    };
    PLAYERS.push(target);
  }

  // Calculate live points from kits
  let calculatedPts = 0;
  for (const [_, kData] of Object.entries(target.kits)) {
    if (kData && kData.tier && TIER_POINTS[kData.tier]) {
      calculatedPts += TIER_POINTS[kData.tier] || 0;
    }
  }
  if (calculatedPts > 0 || !playerData.points) {
    target.points = calculatedPts;
    target.totalPoints = calculatedPts;
  }
  target.combatTitle = getTitle(target.points).name;

  // Re-rank all players
  PLAYERS.sort((a, b) => b.points - a.points);
  PLAYERS.forEach((p, idx) => {
    p.globalRank = idx + 1;
  });

  return target;
}

export function deletePlayer(idOrUsername: string): boolean {
  const clean = idOrUsername.toLowerCase();
  const idx = PLAYERS.findIndex((p) => p.id.toLowerCase() === clean || p.username.toLowerCase() === clean);
  if (idx === -1) return false;
  PLAYERS.splice(idx, 1);
  PLAYERS.forEach((p, i) => {
    p.globalRank = i + 1;
  });
  return true;
}

export function deleteTestRecord(testId: string): boolean {
  const idx = RECENT_TESTS.findIndex((t) => t.id === testId);
  if (idx === -1) return false;
  RECENT_TESTS.splice(idx, 1);
  return true;
}

export function addOrUpdateTester(memberData: Partial<Member> & { name: string; ign: string }): Member {
  const existingIdx = VYNTRIC_MEMBERS.findIndex(
    (m) => m.ign.toLowerCase() === memberData.ign.toLowerCase() || m.id === memberData.id
  );

  if (existingIdx >= 0) {
    VYNTRIC_MEMBERS[existingIdx] = {
      ...VYNTRIC_MEMBERS[existingIdx],
      ...memberData,
    };
    return VYNTRIC_MEMBERS[existingIdx];
  } else {
    const newMember: Member = {
      id: memberData.id || `mem-${Date.now()}`,
      name: memberData.name,
      ign: memberData.ign,
      role: memberData.role || "OFFICIAL TESTER",
      avatarUrl: `https://mc-heads.net/head/${memberData.ign}/128`,
      discord: memberData.discord || `@${memberData.ign.toLowerCase()}`,
      testsCompleted: memberData.testsCompleted || 0,
      specialties: memberData.specialties || ["Sword" as KitId],
      joinDate: memberData.joinDate || "Recent",
      status: memberData.status || "ONLINE",
      quote: memberData.quote || "Accredited Vyntric Tier Tester.",
    };
    VYNTRIC_MEMBERS.push(newMember);
    return newMember;
  }
}


export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  discordInviteUrl: string;
  totalTestsOverride: number;
  maintenanceMode: boolean;
  announcement: {
    enabled: boolean;
    message: string;
    type: "alert" | "info" | "event";
  };
}

let siteSettings: SiteSettings = {
  heroTitle: "Your next Minecraft rank starts here.",
  heroSubtitle: "Find your tier, get audited by accredited testers in live duels, and dominate the official competitive standings.",
  discordInviteUrl: "https://discord.gg/RESuGyFwJ3",
  totalTestsOverride: 1248,
  maintenanceMode: false,
  announcement: {
    enabled: false,
    message: "Official Vyntric Tier Testing is OPEN. Open a queue ticket on Discord to challenge accredited council testers.",
    type: "info",
  },
};

export function getSiteSettings(): SiteSettings {
  return siteSettings;
}

export function updateSiteSettings(updates: Partial<SiteSettings>): SiteSettings {
  siteSettings = {
    ...siteSettings,
    ...updates,
    announcement: {
      ...siteSettings.announcement,
      ...(updates.announcement || {}),
    },
  };
  return siteSettings;
}

export function getAllData() {
  return {
    players: PLAYERS,
    tests: RECENT_TESTS,
    staff: VYNTRIC_MEMBERS,
    settings: siteSettings,
  };
}

export function restoreAllData(data: any): boolean {
  try {
    if (data.players && Array.isArray(data.players)) {
      PLAYERS.length = 0;
      PLAYERS.push(...data.players);
    }
    if (data.tests && Array.isArray(data.tests)) {
      RECENT_TESTS.length = 0;
      RECENT_TESTS.push(...data.tests);
    }
    if (data.staff && Array.isArray(data.staff)) {
      VYNTRIC_MEMBERS.length = 0;
      VYNTRIC_MEMBERS.push(...data.staff);
    }
    if (data.settings) {
      updateSiteSettings(data.settings);
    }
    return true;
  } catch (err) {
    console.error("Failed to restore all data:", err);
    return false;
  }
}

export const dataStore = {
  getSiteSettings,
  updateSiteSettings,
  getAllData,
  restoreAllData,
  addOrUpdatePlayer,
  deletePlayer,
  deleteTestRecord,
  addOrUpdateTester,
  getSiteAnnouncement,
  setSiteAnnouncement,

  getPlayers: () => PLAYERS,
  getPlayerByUsername,
  getPlayerById,
  getTests,
  getPlayerTests,
  getTesters,
  getStats,
  getKitStats,
  getWeeklyTestCounts,
  getApplications,
  getApplicationById,
  addApplication,
  updateApplicationStatus,
  recordTestResult,
};
