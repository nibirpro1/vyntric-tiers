import { Tier, Kit } from "./types.js";
export declare const TIER_POINTS: Record<Tier, number>;
export declare function calculatePoints(tiers: Partial<Record<Kit, Tier | null>> | {
    kit: Kit;
    tier: Tier;
}[]): number;
export interface PlayerTitle {
    name: string;
    minPoints: number;
    color: string;
    badgeBg: string;
}
export declare const TITLE_THRESHOLDS: PlayerTitle[];
export declare function getTitle(points: number): PlayerTitle;
//# sourceMappingURL=points.d.ts.map