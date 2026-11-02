import { Tier } from "./types.js";
export declare const TIER_ORDER: Tier[];
export declare const TIER_COLORS: Record<Tier, string>;
export declare function tierToNumber(tier: Tier): number;
export declare function compareTiers(a: Tier, b: Tier): number;
export declare function isHighTier(tier: Tier): boolean;
export declare function tierLabel(tier: Tier): string;
//# sourceMappingURL=tiers.d.ts.map