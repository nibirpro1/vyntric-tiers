import React from "react";
import { MemberRole } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: MemberRole;
  className?: string;
}

const ROLE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  OWNER: {
    color: "#F43F5E",
    bg: "rgba(244, 63, 94, 0.14)",
    border: "rgba(244, 63, 94, 0.35)",
  },
  "CO-OWNER": {
    color: "#FB923C",
    bg: "rgba(251, 146, 60, 0.14)",
    border: "rgba(251, 146, 60, 0.35)",
  },
  MANAGER: {
    color: "#FFB020",
    bg: "rgba(255, 176, 32, 0.14)",
    border: "rgba(255, 176, 32, 0.35)",
  },
  "HEAD TESTER": {
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.16)",
    border: "rgba(124, 58, 237, 0.4)",
  },
  "SENIOR TESTER": {
    color: "#38BDF8",
    bg: "rgba(56, 189, 248, 0.16)",
    border: "rgba(56, 189, 248, 0.4)",
  },
  "OFFICIAL TESTER": {
    color: "#22D3EE",
    bg: "rgba(34, 211, 238, 0.14)",
    border: "rgba(34, 211, 238, 0.35)",
  },
  DEVELOPER: {
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.14)",
    border: "rgba(16, 185, 129, 0.35)",
  },
  Owner: {
    color: "#F43F5E",
    bg: "rgba(244, 63, 94, 0.14)",
    border: "rgba(244, 63, 94, 0.35)",
  },
  "Co-Owner": {
    color: "#FB923C",
    bg: "rgba(251, 146, 60, 0.14)",
    border: "rgba(251, 146, 60, 0.35)",
  },
  Admin: {
    color: "#FFB020",
    bg: "rgba(255, 176, 32, 0.14)",
    border: "rgba(255, 176, 32, 0.35)",
  },
  "Head Tester": {
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.16)",
    border: "rgba(124, 58, 237, 0.4)",
  },
  Tester: {
    color: "#22D3EE",
    bg: "rgba(34, 211, 238, 0.14)",
    border: "rgba(34, 211, 238, 0.35)",
  },
  Moderator: {
    color: "#34D399",
    bg: "rgba(52, 211, 153, 0.14)",
    border: "rgba(52, 211, 153, 0.35)",
  },
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const style = ROLE_STYLES[role] || ROLE_STYLES.Tester;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md border",
        className
      )}
      style={{
        color: style.color,
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: style.color }}
        aria-hidden="true"
      />
      {role}
    </span>
  );
}
