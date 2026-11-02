import { Metadata } from "next";
import { Members } from "@/components/sections/Members";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/ui/section-title";
import { RoleBadge } from "@/components/ui/role-badge";
import { MemberRole } from "@/lib/types";

export const metadata: Metadata = {
  title: "Testing Council & Staff Roster",
  description:
    "Official Vyntric Testing Council hierarchy, staff responsibilities, and accredited regional testers.",
};

const ROLE_DESCRIPTIONS: { role: MemberRole; summary: string; responsibilities: string[] }[] = [
  {
    role: "Owner",
    summary: "Platform stewardship, infrastructure hosting, and final dispute arbitrator.",
    responsibilities: [
      "Network operations & test node server allocation",
      "Executive oversight of ladder integrity",
      "Dispute escalation and anti-cheat compliance",
    ],
  },
  {
    role: "Co-Owner",
    summary: "Competitive meta oversight, tournament partnerships, and lead testing regulations.",
    responsibilities: [
      "Competitive rulebook calibration across 9 gamemodes",
      "Head Tester appointment and regional allocation",
      "Tier threshold points balancing",
    ],
  },
  {
    role: "Admin",
    summary: "Senior staff management, community audits, and anti-abuse verification.",
    responsibilities: [
      "Reviewing appealed test VODs within 24 hours",
      "Auditing suspicious score submissions and ghost hits",
      "Discord node queue permissions management",
    ],
  },
  {
    role: "Head Tester",
    summary: "Regional trial directors who evaluate aspiring testers and preside over HT1/HT2 title matches.",
    responsibilities: [
      "High Tier promotion duels (HT1 & LT1 assessments)",
      "Standardizing first-to-5 hit trading protocols",
      "Auditing regional latency compensation metrics",
    ],
  },
  {
    role: "Tester",
    summary: "Accredited combatants who conduct daily 1v1 first-to-5 evaluations across specialized kit ladders.",
    responsibilities: [
      "Executing scheduled 1v1 evaluations on neutral nodes",
      "Submitting verified scores and unedited VOD proof",
      "Guiding players on spacing errors and tier benchmarks",
    ],
  },
  {
    role: "Moderator",
    summary: "Queue etiquette enforcement, dispute intake, and community chat discipline.",
    responsibilities: [
      "Screening initial test applications and VOD links",
      "Maintaining test arena chat civility and node spectator order",
      "Answering challenger questions regarding cooldowns",
    ],
  },
];

export default function TeamPage() {
  return (
    <div className="py-8 space-y-16">
      {/* 1. Interactive Members Component */}
      <Members />

      {/* 2. Council Roles & Hierarchy Explanation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionTitle
          eyebrow="COUNCIL HIERARCHY & PROTOCOL"
          title="Staff Responsibilities & Selection"
          description="Every member of the Vyntric Council has a defined jurisdiction. We do not recruit through generic applications; testers must be invited or beat an active Head Tester in a trial duel."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROLE_DESCRIPTIONS.map((item) => (
            <Card key={item.role} className="p-6 space-y-4 border-line">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <RoleBadge role={item.role} />
                <span className="micro-label text-[10px] text-muted">AUTHORITY LEVEL</span>
              </div>

              <p className="text-muted text-xs leading-relaxed font-mono">
                {item.summary}
              </p>

              <div className="space-y-1.5 pt-2">
                <span className="micro-label text-[9px] text-muted block">KEY PROTOCOLS:</span>
                <ul className="space-y-1 text-xs text-text font-mono list-disc list-inside">
                  {item.responsibilities.map((r, i) => (
                    <li key={i} className="text-muted/90 hover:text-text transition-colors">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
