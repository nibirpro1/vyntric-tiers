export const TIER_ORDER = [
    "HT1",
    "LT1",
    "HT2",
    "LT2",
    "HT3",
    "LT3",
    "HT4",
    "LT4",
    "HT5",
    "LT5",
];
export const TIER_COLORS = {
    HT1: "#FF2D55", // Crimson Glow
    LT1: "#FF6B4A",
    HT2: "#FFB020", // Gold
    LT2: "#FFD56B",
    HT3: "#22D3EE", // Cyan
    LT3: "#67E8F9",
    HT4: "#7C3AED", // Violet
    LT4: "#A78BFA",
    HT5: "#22C55E", // Green
    LT5: "#86EFAC",
};
export function tierToNumber(tier) {
    switch (tier) {
        case "HT1": return 1;
        case "LT1": return 2;
        case "HT2": return 3;
        case "LT2": return 4;
        case "HT3": return 5;
        case "LT3": return 6;
        case "HT4": return 7;
        case "LT4": return 8;
        case "HT5": return 9;
        case "LT5": return 10;
    }
}
export function compareTiers(a, b) {
    return tierToNumber(a) - tierToNumber(b);
}
export function isHighTier(tier) {
    return tier.startsWith("HT");
}
export function tierLabel(tier) {
    const isHT = tier.startsWith("HT");
    const num = tier.slice(2);
    return `${isHT ? "High" : "Low"} Tier ${num}`;
}
//# sourceMappingURL=tiers.js.map