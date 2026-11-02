import { PrismaClient, Region, Kit, Tier, StaffRole, Status, Result, QueueStatus } from "@prisma/client";
import { calculatePoints } from "@vyntric/shared";

const prisma = new PrismaClient();

const SEED_TESTERS: {
  discordId: string;
  name: string;
  ign: string;
  role: StaffRole;
  specialties: Kit[];
  status: Status;
  quote: string;
  testsCompleted: number;
}[] = [
  {
    discordId: "100000000000000001",
    name: "Kaz",
    ign: "Kaz_PvP",
    role: "OWNER",
    specialties: ["SWORD", "CRYSTAL", "POT"],
    status: "ONLINE",
    quote: "Standardizing Minecraft PvP tiers with ruthless integrity.",
    testsCompleted: 342,
  },
  {
    discordId: "100000000000000002",
    name: "Aether",
    ign: "Aether_99",
    role: "CO_OWNER",
    specialties: ["AXE", "UHC", "SMP"],
    status: "ONLINE",
    quote: "Consistency under pressure separates HT1 from the rest.",
    testsCompleted: 289,
  },
  {
    discordId: "100000000000000003",
    name: "Zephyr",
    ign: "Zephyrr",
    role: "HEAD_TESTER",
    specialties: ["SWORD", "POT", "VANILLA"],
    status: "TESTING",
    quote: "Every missed sprint-reset tells the story of your spacing.",
    testsCompleted: 412,
  },
  {
    discordId: "100000000000000004",
    name: "Vortex",
    ign: "Vortex_PvP",
    role: "SENIOR_TESTER",
    specialties: ["CRYSTAL", "MACE"],
    status: "ONLINE",
    quote: "Crystal APM is rhythm. When you panic, the round is over.",
    testsCompleted: 215,
  },
  {
    discordId: "100000000000000005",
    name: "Marcus",
    ign: "Mxrcus",
    role: "TESTER",
    specialties: ["UHC", "DIASMP"],
    status: "OFFLINE",
    quote: "Rod control is second nature. Come prepared or do not apply.",
    testsCompleted: 178,
  },
  {
    discordId: "100000000000000006",
    name: "Kyrox",
    ign: "kyrox_",
    role: "TESTER",
    specialties: ["SWORD", "AXE"],
    status: "ONLINE",
    quote: "Hit selection and W-taps decide the round in 3 seconds.",
    testsCompleted: 145,
  },
  {
    discordId: "100000000000000007",
    name: "Soulless",
    ign: "Soulless_7",
    role: "TESTER",
    specialties: ["POT", "VANILLA"],
    status: "OFFLINE",
    quote: "Speed II potion replenishment without losing sprint is key.",
    testsCompleted: 132,
  },
  {
    discordId: "100000000000000008",
    name: "Breezily",
    ign: "Breezily",
    role: "MANAGER",
    specialties: ["SMP", "VANILLA"],
    status: "ONLINE",
    quote: "Queue etiquette matters as much as your combo speed.",
    testsCompleted: 164,
  },
];

const SEED_PLAYERS: {
  discordId: string;
  ign: string;
  uuid: string;
  region: Region;
  tiers: { kit: Kit; tier: Tier; peakTier: Tier }[];
}[] = [
  {
    discordId: "200000000000000001",
    ign: "marlowww",
    uuid: "983d582f-2d33-4f93-b670-65f57a3e7421",
    region: "NA",
    tiers: [
      { kit: "SWORD", tier: "HT1", peakTier: "HT1" },
      { kit: "AXE", tier: "HT1", peakTier: "HT1" },
      { kit: "POT", tier: "HT1", peakTier: "HT1" },
      { kit: "VANILLA", tier: "HT1", peakTier: "HT1" },
      { kit: "CRYSTAL", tier: "LT1", peakTier: "HT1" },
    ],
  },
  {
    discordId: "200000000000000002",
    ign: "Velo",
    uuid: "1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
    region: "EU",
    tiers: [
      { kit: "SWORD", tier: "LT1", peakTier: "HT1" },
      { kit: "POT", tier: "HT1", peakTier: "HT1" },
      { kit: "VANILLA", tier: "HT1", peakTier: "HT1" },
      { kit: "UHC", tier: "LT1", peakTier: "LT1" },
    ],
  },
  {
    discordId: "200000000000000003",
    ign: "Doogile",
    uuid: "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
    region: "NA",
    tiers: [
      { kit: "CRYSTAL", tier: "HT1", peakTier: "HT1" },
      { kit: "MACE", tier: "HT1", peakTier: "HT1" },
      { kit: "SMP", tier: "HT1", peakTier: "HT1" },
      { kit: "SWORD", tier: "HT2", peakTier: "HT2" },
    ],
  },
  {
    discordId: "200000000000000004",
    ign: "Minemanner",
    uuid: "3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
    region: "EU",
    tiers: [
      { kit: "UHC", tier: "HT1", peakTier: "HT1" },
      { kit: "SWORD", tier: "HT2", peakTier: "HT1" },
      { kit: "AXE", tier: "LT1", peakTier: "LT1" },
      { kit: "DIASMP", tier: "HT1", peakTier: "HT1" },
    ],
  },
  {
    discordId: "200000000000000005",
    ign: "ClownPierce",
    uuid: "4c5d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f",
    region: "EU",
    tiers: [
      { kit: "SMP", tier: "HT1", peakTier: "HT1" },
      { kit: "CRYSTAL", tier: "HT1", peakTier: "HT1" },
      { kit: "MACE", tier: "LT1", peakTier: "HT1" },
      { kit: "SWORD", tier: "HT2", peakTier: "HT2" },
    ],
  },
  {
    discordId: "200000000000000006",
    ign: "DevLx",
    uuid: "5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a",
    region: "AS",
    tiers: [
      { kit: "SWORD", tier: "HT3", peakTier: "HT3" },
      { kit: "POT", tier: "LT2", peakTier: "LT2" },
      { kit: "AXE", tier: "HT3", peakTier: "HT3" },
    ],
  },
  {
    discordId: "200000000000000007",
    ign: "Sora_PvP",
    uuid: "6e7f8a9b-0c1d-2e3f-4a5b-6c7d8e9f0a1b",
    region: "AS",
    tiers: [
      { kit: "SWORD", tier: "HT2", peakTier: "HT2" },
      { kit: "POT", tier: "HT2", peakTier: "HT2" },
      { kit: "VANILLA", tier: "LT2", peakTier: "LT2" },
    ],
  },
  {
    discordId: "200000000000000008",
    ign: "Kryptic",
    uuid: "7f8a9b0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c",
    region: "NA",
    tiers: [
      { kit: "CRYSTAL", tier: "HT2", peakTier: "HT1" },
      { kit: "MACE", tier: "HT2", peakTier: "HT2" },
      { kit: "SMP", tier: "LT2", peakTier: "LT2" },
    ],
  },
  {
    discordId: "200000000000000009",
    ign: "Noxious_z",
    uuid: "8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
    region: "SA",
    tiers: [
      { kit: "SWORD", tier: "LT3", peakTier: "HT3" },
      { kit: "AXE", tier: "HT4", peakTier: "HT4" },
      { kit: "POT", tier: "LT4", peakTier: "LT4" },
    ],
  },
  {
    discordId: "200000000000000010",
    ign: "ZenithPvP",
    uuid: "9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e",
    region: "AU",
    tiers: [
      { kit: "SWORD", tier: "HT4", peakTier: "HT4" },
      { kit: "VANILLA", tier: "LT4", peakTier: "HT4" },
      { kit: "SMP", tier: "HT5", peakTier: "HT5" },
    ],
  },
];

export async function seed() {
  console.log("🌱 Starting Vyntric Tiers Database Seed...");

  // Clear existing records in sequence
  await prisma.test.deleteMany();
  await prisma.playerTier.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.cooldown.deleteMany();
  await prisma.tester.deleteMany();
  await prisma.player.deleteMany();

  console.log("Cleared existing records.");

  // 1. Seed Testers
  const createdTesters = await Promise.all(
    SEED_TESTERS.map((t) => prisma.tester.create({ data: t }))
  );
  console.log(`Created ${createdTesters.length} Testers.`);

  // 2. Seed Players & Tiers
  for (const p of SEED_PLAYERS) {
    const totalPoints = calculatePoints(p.tiers);

    const player = await prisma.player.create({
      data: {
        discordId: p.discordId,
        ign: p.ign,
        uuid: p.uuid,
        region: p.region,
        points: totalPoints,
        tiers: {
          create: p.tiers.map((t) => ({
            kit: t.kit,
            tier: t.tier,
            peakTier: t.peakTier,
          })),
        },
      },
    });

    // Create 1-2 historical test records for each player
    const tester = createdTesters[Math.floor(Math.random() * createdTesters.length)];
    const primaryTier = p.tiers[0];

    await prisma.test.create({
      data: {
        playerId: player.id,
        testerId: tester.id,
        kit: primaryTier.kit,
        previousTier: primaryTier.tier === "HT1" ? "LT1" : "HT3",
        newTier: primaryTier.tier,
        result: "PROMOTED",
        score: "5-3",
        durationSec: 840,
        notes: "Solid spacing and sprint resets. Verified.",
      },
    });
  }

  console.log(`Created ${SEED_PLAYERS.length} Players with Tiers & Tests.`);

  // 3. Seed active Queue entries
  const players = await prisma.player.findMany();
  if (players.length >= 4) {
    await prisma.queueEntry.createMany({
      data: [
        {
          playerId: players[0].id,
          kit: "SWORD",
          region: "EU",
          position: 1,
          status: "WAITING",
        },
        {
          playerId: players[1].id,
          kit: "SWORD",
          region: "EU",
          position: 2,
          status: "WAITING",
        },
        {
          playerId: players[2].id,
          kit: "CRYSTAL",
          region: "NA",
          position: 1,
          status: "WAITING",
        },
        {
          playerId: players[3].id,
          kit: "POT",
          region: "NA",
          position: 1,
          status: "IN_TEST",
        },
      ],
    });
    console.log("Created active Queue entries.");
  }

  console.log("✅ Vyntric Tiers Database Seeding complete!");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
