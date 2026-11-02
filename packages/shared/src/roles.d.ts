import { StaffRole } from "./types.js";
export interface RoleMeta {
    role: StaffRole;
    label: string;
    color: string;
    badgeBg: string;
    level: number;
}
export declare const STAFF_ROLES: RoleMeta[];
export declare const ROLE_MAP: Record<StaffRole, RoleMeta>;
export declare function isStaffAdmin(role: StaffRole): boolean;
export declare function isAuthorizedTester(role: StaffRole): boolean;
//# sourceMappingURL=roles.d.ts.map