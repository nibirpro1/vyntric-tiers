import { StaffRole } from "./types.js";

export interface RoleMeta {
  role: StaffRole;
  label: string;
  color: string;
  badgeBg: string;
  level: number; // Higher is more privileged
}

export const STAFF_ROLES: RoleMeta[] = [
  {
    role: "OWNER",
    label: "Owner",
    color: "#F43F5E",
    badgeBg: "rgba(244, 63, 94, 0.2)",
    level: 100,
  },
  {
    role: "CO_OWNER",
    label: "Co-Owner",
    color: "#FB7185",
    badgeBg: "rgba(251, 113, 133, 0.2)",
    level: 90,
  },
  {
    role: "DEVELOPER",
    label: "Developer",
    color: "#38BDF8",
    badgeBg: "rgba(56, 189, 248, 0.2)",
    level: 80,
  },
  {
    role: "MANAGER",
    label: "Manager",
    color: "#F59E0B",
    badgeBg: "rgba(245, 158, 11, 0.2)",
    level: 70,
  },
  {
    role: "HEAD_TESTER",
    label: "Head Tester",
    color: "#8B5CF6",
    badgeBg: "rgba(139, 92, 246, 0.2)",
    level: 60,
  },
  {
    role: "SENIOR_TESTER",
    label: "Senior Tester",
    color: "#A78BFA",
    badgeBg: "rgba(167, 139, 250, 0.2)",
    level: 50,
  },
  {
    role: "TESTER",
    label: "Tester",
    color: "#22D3EE",
    badgeBg: "rgba(34, 211, 238, 0.2)",
    level: 40,
  },
  {
    role: "TRIAL_TESTER",
    label: "Trial Tester",
    color: "#34D399",
    badgeBg: "rgba(52, 211, 153, 0.2)",
    level: 30,
  },
];

export const ROLE_MAP: Record<StaffRole, RoleMeta> = STAFF_ROLES.reduce((acc, curr) => {
  acc[curr.role] = curr;
  return acc;
}, {} as Record<StaffRole, RoleMeta>);

export function isStaffAdmin(role: StaffRole): boolean {
  return ROLE_MAP[role].level >= 70;
}

export function isAuthorizedTester(role: StaffRole): boolean {
  return ROLE_MAP[role].level >= 30;
}
