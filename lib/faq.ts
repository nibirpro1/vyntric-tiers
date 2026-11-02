export type FAQCategory = "Minecraft" | "Discord" | "Questions";

export interface FAQItem {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  points?: string[];
  tag?: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  // ================= MINECRAFT PVP RULES =================
  {
    id: "mc-format",
    category: "Minecraft",
    tag: "COMBAT RULES",
    question: "What is the official 1v1 Minecraft test duel format?",
    answer:
      "All tier evaluations are conducted as a 1v1 First-to-5 match on dedicated 20.0 TPS Vyntric test nodes. Both players enter with identical gear kits, unmanipulated combat settings, and vanilla mechanics. Prior to round 1, the challenger must cycle through their F3 debug screen and open their inventory to confirm unmanipulated client state. Spectator testers monitor hit distance, spacing, and packet flow in real time.",
    points: [
      "Strict first-to-5 rounds (no tiebreakers; clean round wins required)",
      "Standard competitive arenas with neutral terrain",
      "Both players must record full perspective at minimum 720p 60fps",
    ],
  },
  {
    id: "mc-clients-mods",
    category: "Minecraft",
    tag: "CLIENT INTEGRITY",
    question: "Which Minecraft clients and mods are allowed in tests?",
    answer:
      "Approved clients include Lunar Client, Badlion Client, Feather Client, and clean Fabric/Prism instances. Permitted mods are strictly visual/performance (Sodium, Lithium, Iris, Keystrokes, Armor Status). Any mod that alters reach, hitboxes, FOV manipulation, free-look during combat, auto-totem, or automated debuff hotkeys results in an immediate permanent competitive ban.",
    points: [
      "Permitted: Lunar Client, Badlion, Feather, clean Fabric",
      "Performance mods allowed: Sodium, Lithium, FerriteCore, Iris",
      "Strictly banned: Free-look in combat, reach modifiers, auto-clickers, timer modifications",
    ],
  },
  {
    id: "mc-ping",
    category: "Minecraft",
    tag: "LATENCY PARITY",
    question: "How is ping equalized between challengers from different regions?",
    answer:
      "Tests are assigned to regional routing nodes (NA East, NA West, EU Central, Singapore, São Paulo, Sydney). When players from different continents duel, the council routes both combatants to a neutral node where the latency differential is capped at ≤ 35ms. Testers do not hold home-node advantage.",
    points: [
      "Regional nodes deployed in NA, EU, AS, SA, AU, and ME",
      "Maximum allowed ping delta between combatants is 35ms",
      "Matches rescheduled if node packet loss exceeds 1.5%",
    ],
  },
  {
    id: "mc-cooldowns",
    category: "Minecraft",
    tag: "COOLDOWNS",
    question: "What are the match re-test cooldown rules?",
    answer:
      "If you retain your tier or lose a promotion test, a mandatory 7-day cooldown applies before you can queue again in that specific kit. If you are swept 0-5 by a tester, a 14-day cooldown is enforced to ensure challengers spend adequate practice time before re-applying. There is no cooldown across different kits (e.g. you can test Axe 24 hours after a Sword test).",
    points: [
      "7-day cooldown on standard retention or competitive defeat",
      "14-day cooldown if swept 0–5 by the officiating tester",
      "Zero cooldown between separate kit ladders (Sword, Axe, Pot, etc.)",
    ],
  },
  {
    id: "mc-disconnects",
    category: "Minecraft",
    tag: "DISPUTES",
    question: "What happens if a player disconnects or experiences lag spikes mid-duel?",
    answer:
      "If a crash or disconnection occurs within the first 15 seconds of a round before damage is exchanged, the round is restarted without penalty. If a player disconnects while in combat or below 50% health, the round is forfeited to the opponent unless clear server-side packet loss is proven by the spectator logs.",
    points: [
      "15-second grace period at round start if no damage has been dealt",
      "Combat disconnects (<50% HP) count as a round forfeit",
      "Server TPS drops below 19.5 result in immediate round void & replay",
    ],
  },
  {
    id: "mc-macros",
    category: "Minecraft",
    tag: "HARDWARE",
    question: "Are custom hardware keybinds or debuff macros permitted?",
    answer:
      "Single 1:1 hardware keybinds (e.g. mapping slot 1 to a mouse thumb button) are 100% permitted. Multi-action macros (such as automated pot-drop-switch macros, sprint-toggle repeaters, or scroll-wheel attack scripts) are strictly prohibited and trigger anti-cheat flag audits.",
  },

  // ================= DISCORD COMMUNITY RULES =================
  {
    id: "dc-tickets",
    category: "Discord",
    tag: "QUEUE ETIQUETTE",
    question: "How does the Discord Challenger Queue & ticket system work?",
    answer:
      "Challengers must submit an application through the web portal or Discord `#test-tickets`. Each player is allowed exactly ONE active ticket at a time. Do not open multiple tickets across different kits simultaneously. You can track your ticket position and estimated wait time live on the web portal using your Ticket ID.",
    points: [
      "Strict limit: 1 active ticket per player across all kits",
      "Include valid Minecraft IGN, region, target kit, and clean VOD link",
      "Tickets auto-close after 48 hours of inactivity once scheduled",
    ],
  },
  {
    id: "dc-conduct",
    category: "Discord",
    tag: "COMMUNITY STANDARDS",
    question: "What are the rules regarding Discord community conduct and toxicity?",
    answer:
      "Vyntric maintains a zero-tolerance policy against toxicity, harassment, and unsportsmanlike behavior. Trash talk during official tests or insulting council testers will result in immediate ticket cancellation, a 30-day queue blacklisting, and Discord mutes. Mutual respect between testers and challengers is required.",
    points: [
      "Harassment of testers or applicants leads to instant queue blacklisting",
      "Match outcomes must be respected; no public flaming in community channels",
      "Constructive feedback is welcomed in `#match-discussion`",
    ],
  },
  {
    id: "dc-no-dms",
    category: "Discord",
    tag: "STAFF PROTOCOL",
    question: "Can I DM testers or council owners to get tested faster?",
    answer:
      "No. Direct messaging testers, admins, or owners asking for priority tests, private evaluations, or tier bypasses is strictly forbidden. All testing must proceed through the official queue to ensure fair wait times for all players. Repeated staff DMs will void your active ticket.",
  },
  {
    id: "dc-screenshare",
    category: "Discord",
    tag: "VERIFICATION",
    question: "When are Discord voice and screen-share audits required?",
    answer:
      "For candidate tests involving High Tier 2 (HT2) and above, officiating testers reserve the right to request a pre-match screen-share or AnyDesk client audit. Refusing an audit when requested by a Head Tester or Council Admin results in immediate forfeiture of the promotion test.",
    points: [
      "Mandatory for HT1 and HT2 tier evaluations",
      "Inspecting active process tree, .minecraft/mods folder, and client logs",
      "Conducted exclusively by accredited Head Testers in private voice channels",
    ],
  },
  {
    id: "dc-vods",
    category: "Discord",
    tag: "APPEALS",
    question: "How long must I retain match VODs, and how do I submit an appeal?",
    answer:
      "Both the challenger and officiating tester must retain unedited match recordings for at least 7 days after the test. If you suspect an officiating error or server glitch, submit an appeal in `#tier-appeals` within 24 hours including your timestamped video evidence.",
    points: [
      "Appeals must be lodged within 24 hours of match conclusion",
      "Unedited 60fps recording with F3 debug screen is required",
      "Council reviews appeals with a 3-tester spectator majority vote",
    ],
  },

  // ================= SCORING & FREQUENTLY ASKED QUESTIONS =================
  {
    id: "faq-ht-lt",
    category: "Questions",
    tag: "TIER DEFINITIONS",
    question: "What is the mechanical difference between High Tier (HT) and Low Tier (LT)?",
    answer:
      "High Tier represents the upper echelon of a skill bracket capable of consistently dominating equal opponents through precision mechanics (sprint resets, hit selection, flawless rod/projectile spacing). Low Tier indicates solid mechanical competence within that bracket but with occasional spacing lapses or unforced tactical mistakes under tournament pressure.",
  },
  {
    id: "faq-points",
    category: "Questions",
    tag: "POINTS FORMULA",
    question: "How are total leaderboard points calculated across all kits?",
    answer:
      "Points are calculated using a strict deterministic curve based on active tiers across all 9 kits. High Tier 1 (HT1) awards 60 points, Low Tier 1 (LT1) awards 44, HT2 awards 30, LT2 awards 20, HT3 awards 10, LT3 awards 6, HT4 awards 4, LT4 awards 3, HT5 awards 2, and LT5 awards 1 point. Your overall title (Grandmaster, Master, Diamond, etc.) is directly dictated by your global point threshold.",
    points: [
      "HT1: 60 pts · LT1: 44 pts · HT2: 30 pts",
      "LT2: 20 pts · HT3: 10 pts · LT3: 6 pts",
      "HT4: 4 pts · LT4: 3 pts · HT5: 2 pts · LT5: 1 pt",
    ],
  },
  {
    id: "faq-titles",
    category: "Questions",
    tag: "TITLE THRESHOLDS",
    question: "What are the point thresholds for Titles (Grandmaster down to Bronze)?",
    answer:
      "Titles denote overall platform status based on multi-kit dominance: Grandmaster (280+ pts), Master (200–279 pts), Diamond (140–199 pts), Emerald (90–139 pts), Gold (50–89 pts), Silver (20–49 pts), and Bronze (1–19 pts).",
    points: [
      "Grandmaster: 280+ pts · Master: 200–279 pts",
      "Diamond: 140–199 pts · Emerald: 90–139 pts",
      "Gold: 50–89 pts · Silver: 20–49 pts · Bronze: 1–19 pts",
    ],
  },
  {
    id: "faq-peaks",
    category: "Questions",
    tag: "HISTORICAL RECORD",
    question: "How do Peak Tiers work and can my peak tier ever be lost?",
    answer:
      "Peak Tier represents the highest verified tier a player has achieved in a kit in competitive play. Even if a player undergoes rank decay or demotes in a subsequent season, their peak tier remains permanently etched into their profile as a historical accolade.",
  },
];
