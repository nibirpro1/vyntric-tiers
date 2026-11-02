import { Tier, Region, KitId, GamemodeId } from "./tiers";

export type { Tier, Region, KitId, GamemodeId };

export type Result = "promoted" | "demoted" | "retained" | "new" | "PROMOTED" | "DEMOTED" | "RETAINED" | "NEW";

export interface Kit {
  id: KitId;
  name: string;
  shortDesc: string;
  accentColor: string;
}

export interface PlayerKitEntry {
  tier: Tier;
  peakTier: Tier;
  lastTestedAt: string;
  tester: string; // Tester IGN
  score?: string;
  retired?: boolean;
}

export interface TestRecord {
  id: string;
  playerId: string;
  playerUsername: string; // IGN
  playerName?: string; // alias
  testerId: string;
  testerUsername: string; // Tester IGN
  testerName?: string; // alias
  kit: KitId;
  previousTier: Tier | null | "UNRANKED";
  newTier: Tier;
  result: Result;
  score: string; // e.g. "3-1", "5-3"
  durationSec?: number;
  duration?: string; // e.g. "11m 42s"
  timestamp: string; // ISO string or human string
  testedAt?: string;
  vodUrl?: string;
  notes?: string;
}

export interface Player {
  id: string;
  username: string; // IGN
  ign?: string; // alias
  uuid: string;
  region: Region;
  points: number;
  totalPoints?: number;
  globalRank: number;
  combatTitle?: string;
  kits: Partial<Record<string, PlayerKitEntry>>;
  tiers?: Partial<Record<string, PlayerKitEntry>>; // alias
  testHistory: TestRecord[];
  joinedAt: string;
  lastTestedAt: string;
  discord?: string;
  bio?: string;
  isTester?: boolean;
  retired?: boolean;
}

export type StaffRole =
  | "OWNER"
  | "CO-OWNER"
  | "MANAGER"
  | "HEAD TESTER"
  | "SENIOR TESTER"
  | "OFFICIAL TESTER"
  | "DEVELOPER"
  | "Owner"
  | "Co-Owner"
  | "Admin"
  | "Head Tester"
  | "Tester"
  | "Moderator";

export type MemberRole = StaffRole;

export type StaffStatus = "ONLINE" | "TESTING NOW" | "OFFLINE" | "Online" | "Idle" | "Offline";

export type MemberStatus = StaffStatus;

export interface Member {
  id: string;
  name: string;
  ign: string; // Minecraft IGN for 3D body render
  role: StaffRole;
  avatarUrl: string;
  discord: string;
  testsCompleted: number;
  testsConducted?: number; // alias
  specialties: KitId[];
  specialtyKits?: GamemodeId[];
  joinDate: string;
  joinedAt?: string;
  status: StaffStatus;
  quote: string;
  socials?: {
    twitter?: string;
    youtube?: string;
    discord?: string;
  };
  isTesterOfTheMonth?: boolean;
}

export type ApplicationStatus =
  | "pending"
  | "in_review"
  | "scheduled"
  | "completed"
  | "rejected";

export interface Application {
  id: string;
  ign: string;
  discordTag: string;
  region: Region;
  kit: KitId;
  previousTier: string;
  targetTier?: Tier;
  preferredTester?: string;
  availability?: string;
  vodLink: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewNotes?: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  notes?: string;
  queuePosition?: number;
  estimatedWaitHours?: number;
}

export interface FilterState {
  kit: KitId | "ALL" | GamemodeId;
  region: Region | "ALL";
  tier: Tier | "ALL";
  query: string;
  sort: "rank" | "points" | "recent" | "name" | "alphabetical";
  view: "columns" | "table" | "rows" | "list";
}
