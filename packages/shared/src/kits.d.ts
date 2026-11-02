import { Kit } from "./types.js";
export interface KitMeta {
    id: Kit;
    name: string;
    shortDesc: string;
    accentColor: string;
    emoji: string;
}
export declare const KITS: KitMeta[];
export declare const KIT_MAP: Record<Kit, KitMeta>;
export declare function parseKit(input: string): Kit | null;
//# sourceMappingURL=kits.d.ts.map