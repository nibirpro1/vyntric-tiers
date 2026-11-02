export const KITS = [
    {
        id: "SWORD",
        name: "Sword",
        shortDesc: "Sprint-reset combos, W-tap discipline, and spacing.",
        accentColor: "#FF2D55",
        emoji: "⚔️",
    },
    {
        id: "AXE",
        name: "Axe",
        shortDesc: "Shield disables, stun windows, and trade timing.",
        accentColor: "#FFB020",
        emoji: "🪓",
    },
    {
        id: "CRYSTAL",
        name: "Crystal",
        shortDesc: "High APM obsidian & respawn anchor detonations.",
        accentColor: "#22D3EE",
        emoji: "🔮",
    },
    {
        id: "POT",
        name: "Pot",
        shortDesc: "Speed II pot management, strafe locks, and pacing.",
        accentColor: "#A78BFA",
        emoji: "🧪",
    },
    {
        id: "UHC",
        name: "UHC",
        shortDesc: "Golden heads, fishing rod combos, and lava traps.",
        accentColor: "#F43F5E",
        emoji: "🍎",
    },
    {
        id: "SMP",
        name: "SMP",
        shortDesc: "Endgame survival kit meta with totems & elytra.",
        accentColor: "#34D399",
        emoji: "🛡️",
    },
    {
        id: "MACE",
        name: "Mace",
        shortDesc: "Wind charge vertical momentum & lethal slam timing.",
        accentColor: "#FB923C",
        emoji: "🔨",
    },
    {
        id: "DIASMP",
        name: "Dia SMP",
        shortDesc: "Competitive diamond tier with strict spacing trades.",
        accentColor: "#38BDF8",
        emoji: "💎",
    },
    {
        id: "VANILLA",
        name: "Vanilla",
        shortDesc: "Standard 1.9+ duel ruleset and fundamental PvP.",
        accentColor: "#86EFAC",
        emoji: "🎯",
    },
];
export const KIT_MAP = KITS.reduce((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
}, {});
export function parseKit(input) {
    const normalized = input.toUpperCase().replace(/\s+/g, "");
    if (normalized in KIT_MAP)
        return normalized;
    if (normalized === "DIAMOND")
        return "DIASMP";
    return null;
}
//# sourceMappingURL=kits.js.map