"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  Disc as DiscordIcon,
  Swords,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Member, StaffRole } from "@/lib/types";
import { VYNTRIC_MEMBERS } from "@/lib/data";
import { GamemodeIcon } from "../icons/GamemodeIcons";

interface VyntricMembersSectionProps {
  members?: Member[];
}

export function VyntricMembersSection({ members = VYNTRIC_MEMBERS }: VyntricMembersSectionProps) {
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter === "ALL") return true;
      if (roleFilter === "LEADERSHIP") {
        return m.role === "OWNER" || m.role === "CO-OWNER" || m.role === "MANAGER";
      }
      if (roleFilter === "HEAD_SENIOR") {
        return m.role === "HEAD TESTER" || m.role === "SENIOR TESTER";
      }
      if (roleFilter === "OFFICIAL") {
        return m.role === "OFFICIAL TESTER";
      }
      if (roleFilter === "DEVELOPER") {
        return m.role === "DEVELOPER";
      }
      return true;
    });
  }, [members, roleFilter]);

  const testerOfTheMonth = members.find((m) => m.isTesterOfTheMonth) || members[0];

  return (
    <section id="members" className="w-full space-y-8 pt-10 pb-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-line">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/15 border border-brand-violet/30 text-brand-cyan text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
              <span>THE TESTING COUNCIL</span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-text tracking-tight">
              Vyntric Official Members & Staff
            </h2>
            <p className="text-muted text-xs sm:text-sm max-w-xl">
              Certified examiners and administrators managing competitive ladder integrity, duel moderation, and tier ratification.
            </p>
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-2 border border-line overflow-x-auto scrollbar-none text-xs font-mono font-bold">
            <motion.button
              onClick={() => setRoleFilter("ALL")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === "ALL"
                  ? "bg-text text-[#07090E] shadow-sm font-black"
                  : "text-muted hover:text-text"
              }`}
            >
              All Team
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter("LEADERSHIP")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === "LEADERSHIP"
                  ? "bg-brand-violet text-white shadow-sm font-black"
                  : "text-muted hover:text-text"
              }`}
            >
              Leadership
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter("HEAD_SENIOR")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === "HEAD_SENIOR"
                  ? "bg-brand-cyan text-black shadow-sm font-black"
                  : "text-muted hover:text-text"
              }`}
            >
              Head & Senior
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter("OFFICIAL")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === "OFFICIAL"
                  ? "bg-emerald-500 text-black shadow-sm font-black"
                  : "text-muted hover:text-text"
              }`}
            >
              Official Testers
            </motion.button>
            <motion.button
              onClick={() => setRoleFilter("DEVELOPER")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                roleFilter === "DEVELOPER"
                  ? "bg-blue-500 text-white shadow-sm font-black"
                  : "text-muted hover:text-text"
              }`}
            >
              Developers
            </motion.button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FEATURED: TESTER OF THE MONTH SPOTLIGHT BANNER            */}
        {/* ========================================================= */}
        {testerOfTheMonth && (
          <div className="card-solid border-2 border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-[#111728] to-surface rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            {/* Ambient golden glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                {/* 3D Skin Render */}
                <div className="relative shrink-0">
                  <img
                    src={`https://mc-heads.net/body/${testerOfTheMonth.ign}/180`}
                    alt={testerOfTheMonth.name}
                    className="w-24 sm:w-28 h-auto drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] filter transition-transform hover:scale-105"
                  />
                  <div className="absolute -top-2 -right-1 p-1 rounded-full bg-amber-500 text-black shadow-md">
                    <Award className="w-4 h-4 fill-current" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>HONORARY TESTER OF THE MONTH</span>
                  </div>

                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-text">
                    {testerOfTheMonth.name} <span className="text-muted text-lg font-mono">(@{testerOfTheMonth.ign})</span>
                  </h3>

                  <p className="text-muted text-xs sm:text-sm italic max-w-lg">
                    &ldquo;{testerOfTheMonth.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs font-mono justify-center sm:justify-start">
                    <span className="text-amber-400 font-bold">
                      {testerOfTheMonth.testsConducted ?? testerOfTheMonth.testsCompleted} Tests Ratified
                    </span>
                    <span className="text-muted">•</span>
                    <span className="text-emerald-400 font-semibold">● {testerOfTheMonth.status}</span>
                  </div>
                </div>
              </div>

              <a
                href="https://discord.gg/RESuGyFwJ3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-black text-xs shadow-xl shadow-amber-500/25 transition-all shrink-0"
              >
                <DiscordIcon className="w-4 h-4" />
                <span>Request Test on Discord</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3D HOLOGRAPHIC MEMBER CARDS GRID                          */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Subcomponent: Interactive 3D Member Card with holographic glare & mouse tilt
function MemberCard({ member }: { member: Member }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = React.useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Role gradient helper
  const getRoleStyle = (role: StaffRole) => {
    switch (role) {
      case "OWNER":
      case "CO-OWNER":
        return {
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          glow: "rgba(244, 63, 94, 0.25)",
        };
      case "MANAGER":
        return {
          badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          glow: "rgba(168, 85, 247, 0.25)",
        };
      case "HEAD TESTER":
        return {
          badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          glow: "rgba(6, 182, 212, 0.25)",
        };
      case "SENIOR TESTER":
        return {
          badge: "bg-violet-500/20 text-violet-300 border-violet-500/40",
          glow: "rgba(139, 92, 246, 0.25)",
        };
      case "OFFICIAL TESTER":
        return {
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          glow: "rgba(16, 185, 129, 0.25)",
        };
      case "DEVELOPER":
        return {
          badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          glow: "rgba(59, 130, 246, 0.25)",
        };
      default:
        return {
          badge: "bg-surface-2 text-muted border-line",
          glow: "rgba(255, 255, 255, 0.1)",
        };
    }
  };

  const roleStyle = getRoleStyle(member.role);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      animate={{
        rotateX: -mousePos.y * 14,
        rotateY: mousePos.x * 14,
      }}
      transition={{ type: "spring", stiffness: 250, damping: 25 }}
      style={{ perspective: 1000 }}
      className="card-solid border border-line bg-[#0D111A]/95 hover:bg-[#121826] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-200 group shadow-lg hover:shadow-2xl hover:border-line-strong select-none"
    >
      {/* Holographic foil glare sweep */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100 + 50}% ${
            mousePos.y * 100 + 50
          }%, ${roleStyle.glow}, transparent 70%)`,
        }}
      />

      <div className="space-y-4 relative z-10">
        {/* Header: Role Badge + Status Indicator */}
        <div className="flex items-center justify-between">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wider uppercase border ${roleStyle.badge}`}
          >
            {member.role}
          </span>

          <span className="flex items-center gap-1.5 text-[10.5px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                member.status === "TESTING NOW"
                  ? "bg-amber-400 animate-pulse"
                  : member.status === "ONLINE"
                  ? "bg-emerald-400"
                  : "bg-slate-600"
              }`}
            />
            <span className="text-muted">{member.status}</span>
          </span>
        </div>

        {/* 3D Skin Body popping out */}
        <div className="flex items-center justify-center py-2 relative">
          <img
            src={`https://mc-heads.net/body/${member.ign}/140`}
            alt={member.name}
            className="w-20 sm:w-24 h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter group-hover:scale-110 transition-transform duration-300"
          />
        </div>

        {/* Identity & Quote */}
        <div className="text-center space-y-1">
          <h4 className="font-heading font-black text-lg text-text group-hover:text-brand-cyan transition-colors">
            {member.name}
          </h4>
          <span className="text-xs font-mono text-muted/80 block">
            @{member.ign}
          </span>
          <p className="text-[11px] text-muted line-clamp-2 italic pt-1">
            &ldquo;{member.quote}&rdquo;
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/60 font-mono text-center">
          <div className="p-2 rounded-xl bg-surface-2 border border-line/60">
            <span className="text-[9.5px] text-muted block uppercase">Tests</span>
            <span className="text-xs font-black text-amber-400">
              {member.testsConducted ?? member.testsCompleted}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-surface-2 border border-line/60">
            <span className="text-[9.5px] text-muted block uppercase">Joined</span>
            <span className="text-[10px] font-bold text-text truncate block">
              {member.joinedAt ?? member.joinDate}
            </span>
          </div>
        </div>

        {/* Specialty Kit Icons */}
        <div className="flex items-center justify-center gap-1.5 pt-1 text-muted">
          {(member.specialtyKits ?? member.specialties ?? []).map((kit) => (
            <div
              key={kit}
              className="p-1 rounded-md bg-surface border border-line text-text"
              title={`Specialist in ${kit}`}
            >
              <GamemodeIcon id={kit} size={13} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Discord Link */}
      <div className="pt-3 mt-3 border-t border-line/60 relative z-10">
        <a
          href="https://discord.gg/RESuGyFwJ3"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-surface-2 hover:bg-surface border border-line text-[11px] font-mono font-semibold text-muted hover:text-[#8EA1FF] transition-colors"
        >
          <DiscordIcon className="w-3.5 h-3.5" />
          <span>{member.discord}</span>
        </a>
      </div>
    </motion.div>
  );
}
