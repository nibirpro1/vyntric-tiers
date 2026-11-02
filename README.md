# ⚔️ VYNTRIC TIERS — Full System Architecture
### *Ranked. Tested. Verified.*

> An esports-grade Minecraft PvP tier-testing system connecting a live **Discord Queue Bot**, a **PostgreSQL Database** via Prisma, **Supabase Realtime**, and a modern **Next.js 14 Web Platform**.

---

## ⚡ The Full Connected Lifecycle

```text
Player joins queue in Discord  →  Bot assigns a Tester  →  Private test ticket opens
        ↓
Tester runs /result  →  Bot saves tier to Database (Supabase / Postgres)
        ↓
Website auto-updates LIVE  →  Card flies to new tier + "Recent Tiers" feed updates
```

1. **Player Registration (`/register ign:<ign> region:<region>`)**:
   - Validates Minecraft IGN in real-time via official Mojang API (`api.mojang.com/users/profiles/minecraft/{ign}`).
   - Fetches official UUID and assigns competitive region (`NA`, `EU`, `AS`, `AU`, `SA`, `AF`).
   - Automatically synchronizes Discord server nickname (`{ign} [{region}]`) and assigns the `Registered` role.

2. **Ladder Queue System (`#queue`)**:
   - The bot maintains 9 persistent interactive panels (one for each competitive ladder: Sword, Axe, Crystal, Pot, UHC, SMP, Mace, DiaSMP, Vanilla).
   - Players click `[Join Queue]`, `[Leave Queue]`, or `[Queue Info]`.
   - Prevents multi-queueing and validates active cooldowns (14 days for promotions, 7 days for retention/new tests, 3 days for demotions).

3. **Tester Pickup (`/next kit:<kit>`)**:
   - Testers toggle availability via `/tester online` or `/tester offline`.
   - Tester runs `/next kit:<kit>` to claim the next waiting challenger in line.
   - The bot automatically generates a private duel ticket channel (`#test-sword-{ign}`) with restricted permissions for only the Tester, Player, and Head Testers.
   - Posts interactive Ticket Control Panel: `[Start Test ⏱]`, `[Cancel]`, `[Player No-Show]`, `[Close]`.

4. **Recording Duel Results (`/result tier:<tier> score:<score> notes:<notes>`)**:
   - Inside the duel ticket channel, the tester executes `/result`.
   - Automatically calculates score, tier difference (`PROMOTED`, `DEMOTED`, `RETAINED`, `NEW`), and updates peak tier.
   - Recalculates total leaderboard points across all 9 ladders (HT1 = 60 pts down to LT5 = 1 pt).
   - Syncs Discord tier roles (e.g. `Sword HT2`) and titles (`Grandmaster`, `Master`, `Diamond`).
   - Emits public announcement to `#results` with head avatar, score, and link to web dossier.
   - Self-destructs the ticket channel after saving the transcript.

5. **Live Website Reaction (Supabase Realtime)**:
   - Within milliseconds, the website catches the database event via Supabase Realtime channels.
   - Displays a dynamic toast notification with duel details.
   - Fires celebratory confetti if a player achieves HT1 or LT1!
   - Card in `/tierlist` pulses and moves to the new tier column.
   - The `/tests` live feed ticker automatically prepends the new verified test.
   - Live queue status on `/queue` updates in real-time.

---

## 🏗️ Monorepo Structure

```text
/vyntric (Workspace Root)
├── apps/
│   ├── bot/                   # Discord Bot (discord.js v14 + TypeScript)
│   │   ├── src/
│   │   │   ├── commands/      # /register, /tester, /next, /result, /profile, /leaderboard, /queue, /cooldown, /testers, /admin
│   │   │   ├── embeds/        # Vyntric brand embed builders (#7C3AED, #22D3EE, #FF2D55)
│   │   │   ├── events/        # interactionCreate, ready, button dispatchers
│   │   │   ├── services/      # mojangService, queueService, testService, tierService, logService
│   │   │   ├── config.ts      # Zod environment validation
│   │   │   ├── deploy-commands.ts # Slash command deployment script
│   │   │   └── index.ts       # Bot client entrypoint
│   │   ├── Dockerfile         # Standalone production container
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                   # Next.js 14 App Router (Tailwind + Three.js + Framer Motion)
│       ├── app/
│       │   ├── api/           # /api/players, /api/players/[ign], /api/leaderboard, /api/tests/recent, /api/queue, /api/members, /api/stats
│       │   ├── player/[ign]/  # Dedicated player dossier page with radar chart & 3D avatar
│       │   ├── queue/         # Live queue monitor & tester roster
│       │   ├── staff/         # Internal staff portal for manual logging & application review
│       │   ├── tierlist/      # Full interactive tier list with filters
│       │   └── page.tsx       # Cinematic esports homepage
│       ├── components/        # Section views, 3D scenes, UI primitives
│       ├── hooks/             # useRealtimeTiers, useLiveFeed
│       └── lib/               # Shared logic, db singleton, Supabase client
│
├── packages/
│   ├── db/                    # Shared Prisma database package
│   │   ├── prisma/
│   │   │   └── schema.prisma  # Player, PlayerTier, Tester, QueueEntry, Test, Cooldown
│   │   ├── src/
│   │   │   ├── index.ts       # Prisma Client singleton
│   │   │   └── seed.ts        # Database seeder with competitive players and testers
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/                # Single Source of Truth for types and constants
│       ├── src/
│       │   ├── types.ts       # Tier, Kit, Region, StaffRole, Status, Result enums
│       │   ├── tiers.ts       # TIER_ORDER, TIER_COLORS, compareTiers, tierLabel
│       │   ├── kits.ts        # KITS, KIT_MAP, descriptions, icons, accent colors
│       │   ├── regions.ts     # REGIONS, flags, colors
│       │   ├── roles.ts       # STAFF_ROLES, permission tiers
│       │   ├── points.ts      # Leaderboard points formula (HT1=60 ... LT5=1) & titles
│       │   └── index.ts       # Barrel exports
│       ├── package.json
│       └── tsconfig.json
│
├── .env.example               # Full environment variable blueprint
└── package.json               # Monorepo workspaces configuration
```

---

## 🎮 Discord Slash Commands

| Command | Permission | Description |
|---|---|---|
| `/register <ign> <region>` | Everyone | Link Minecraft username via Mojang API and set region. |
| `/profile [ign\|@user]` | Everyone | View player's ranks across all 9 ladders, points, and rank. |
| `/leaderboard [kit] [region]` | Everyone | View top 10 global combatants or ladder specific standings. |
| `/queue status` | Everyone | View waitlist counts and active duels across all kits. |
| `/cooldown [ign]` | Everyone | Check remaining re-test cooldown timers. |
| `/testers` | Everyone | View active council members, specialties, and test counts. |
| `/tester online\|offline` | Staff | Toggle tester status and assign/remove the Active Tester role. |
| `/next <kit>` | Tester | Claim the next waiting player and open a private ticket channel. |
| `/result <tier> <score> [notes]` | Tester | Ratify duel outcome, recalculate points, update roles, and announce. |
| `/queue refresh` | Staff | Refresh and re-post persistent queue buttons in `#queue`. |
| `/queue clear <kit>` | Admin | Clear waiting line for a specific ladder. |
| `/admin settier <ign> <kit> <tier>` | Admin | Manually set a player's tier and synchronize roles/points. |
| `/admin removetier <ign> <kit>` | Admin | Remove a ladder tier placement from a player. |
| `/admin ban-tests <ign> <reason>` | Admin | Suspend a player from participating in official tests. |
| `/admin unban-tests <ign>` | Admin | Lift a player's testing suspension. |
| `/admin resetcooldown <ign> <kit>`| Admin | Clear active ladder cooldown for a player. |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js 18+ or 20+
- A Supabase project (or PostgreSQL database)
- A Discord Developer Application with a Bot token

### 2. Environment Setup
Copy the blueprint:
```bash
cp .env.example .env
```
Fill in your credentials:
- `DATABASE_URL` & `DIRECT_URL`: Postgres connection string from Supabase Settings -> Database.
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase API credentials.
- `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`: Discord Developer Portal keys.

### 3. Install & Generate Database
```bash
npm install
npm run db:generate
npm run db:seed
```

### 4. Run the Web Application
```bash
npm run dev
# Website starts on http://localhost:3000
```

### 5. Run the Discord Bot
```bash
# Deploy slash commands to your Discord guild
npm run bot:deploy

# Start the bot in development mode
npm run bot:dev
```

### 6. Production Build
```bash
npm run build
npm run start
```

---

## 🛡️ Discord Bot Invite Permissions
To invite the bot to your Discord server with all necessary capabilities:
- **Intents**: `Server Members Intent`, `Message Content Intent` (enabled under Bot tab in Discord Developer Portal).
- **OAuth2 Permissions**:
  - `Manage Roles` (to assign tier roles and registered roles)
  - `Manage Channels` (to create and delete private `#test-sword-{ign}` ticket channels)
  - `Change Nickname` & `Manage Nicknames` (to set `{ign} [{region}]`)
  - `Send Messages`, `Embed Links`, `Attach Files`, `Read Message History`
  - `Use Slash Commands`

---

### © 2026 VYNTRIC TIERS. All rights reserved.
