import { Region } from "./types.js";
export interface RegionMeta {
    id: Region;
    name: string;
    flag: string;
    color: string;
}
export declare const REGIONS: RegionMeta[];
export declare const REGION_MAP: Record<Region, RegionMeta>;
export declare const REGION_COLORS: Record<Region, string>;
export declare function parseRegion(input: string): Region | null;
//# sourceMappingURL=regions.d.ts.map