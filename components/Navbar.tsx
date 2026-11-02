"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Disc as DiscordIcon,
  Sparkles,
  Command,
  X,
  ExternalLink,
  Info,
  Menu,
  Shield,
  Clock,
  Users,
  Trophy,
  ArrowRight,
  Radio,
  Flame,
} from "lucide-react";
import { PLAYERS, RECENT_TESTS } from "@/lib/data";
import { Player } from "@/lib/types";
import { formatTestTimestamp, TIER_COLORS, REGION_META } from "@/lib/tiers";
import { BrandLogo } from "./icons/BrandLogo";
import { useUIStore } from "@/lib/store";
import { searchPlayers, SearchResult } from "@/lib/search";

interface NavbarProps {
  onSelectPlayer?: (player: Player) => void;
  onOpenInfo?: () => void;
}

export function Navbar({ onSelectPlayer: propOnSelectPlayer, onOpenInfo: propOnOpenInfo }: NavbarProps = {}) {
  const { setSelectedPlayer, setInfoModalOpen } = useUIStore();
  const onSelectPlayer = propOnSelectPlayer || setSelectedPlayer;
  const onOpenInfo = propOnOpenInfo || (() => setInfoModalOpen(true));
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut CMD+K / Ctrl+K focuses the single search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Search results with typo tolerance & fuzzy matching
  const searchResults: SearchResult[] = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchPlayers(searchQuery, PLAYERS).slice(0, 8);
  }, [searchQuery]);

  const topRecent = RECENT_TESTS.slice(0, 10);

  const navLinks = [
    { label: "Home", href: "/", icon: Flame },
    { label: "Rankings", href: "/rankings", icon: Trophy },
    { label: "Recent Tests", href: "/tests", icon: Clock },
    { label: "Vyntric Members", href: "/members", icon: Users },
    { label: "Scoring Rules", href: "/rules", icon: Shield },
    { label: "Live Queue", href: "/queue", icon: Radio },
  ];

  return (
    <header className="sticky top-0 z-50 w-full select-none">
      {/* 1. TOP ULTRA-THIN LIVE MARQUEE STRIP */}
      <div className="w-full bg-[#05060A] border-b border-line/60 py-1.5 px-4 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 shrink-0 pr-4 border-r border-line/60 text-[#FF2D55]">
            <span className="w-2 h-2 rounded-full bg-[#FF2D55] animate-ping inline-block" />
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-3 bg-[#FF2D55] rounded-full animate-pulse" />
              <span className="w-0.5 h-2 bg-brand-violet rounded-full animate-pulse delay-75" />
              <span className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-pulse delay-150" />
            </div>
            <span className="font-bold tracking-wider">LIVE AUDIT</span>
          </div>

          {/* Marquee ticker feed with seamless infinite loop and edge fades */}
          <div className="flex-1 overflow-hidden whitespace-nowrap mx-3 [mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)]">
            <div className="inline-flex gap-8 animate-marquee hover:[animation-play-state:paused] text-text/80 text-xs">
              {[...topRecent, ...topRecent].map((test, idx) => (
                <div key={`${test.id}-${idx}`} className="inline-flex items-center gap-2 shrink-0">
                  <span className="text-amber-400">⚡</span>
                  <span className="font-bold text-text">{test.playerUsername || test.playerName}</span>
                  <span className="text-muted">earned</span>
                  <span
                    className="font-bold px-1.5 py-0.2 rounded text-[10px]"
                    style={{
                      color: TIER_COLORS[test.newTier],
                      backgroundColor: `${TIER_COLORS[test.newTier]}15`,
                    }}
                  >
                    {test.newTier}
                  </span>
                  <span className="text-muted">in {test.kit}</span>
                  <span className="text-emerald-400 font-bold font-mono">({test.score})</span>
                  <span className="text-muted">• Tested by @{test.testerUsername || test.testerName}</span>
                  <span className="text-muted/60">• {formatTestTimestamp(test.timestamp).relative}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Discord Queue Link */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 pl-4 border-l border-line/60 text-muted">
            <span>Official Discord Queue</span>
            <a
              href="https://discord.gg/RESuGyFwJ3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF2D55] hover:text-white font-bold flex items-center gap-1 transition-colors"
            >
              discord.gg/RESuGyFwJ3
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN STICKY GLASS NAVBAR */}
      <nav
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#07080D]/95 backdrop-blur-2xl border-b border-[#FF2D55]/20 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            : "bg-[#07080D]/90 backdrop-blur-xl border-b border-line py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* LEFT: Official Vyntric Logo + Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <BrandLogo size={36} />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-text leading-none group-hover:text-white transition-colors">
                  VYNTRIC{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D55] via-[#E11D48] to-[#7C3AED]">
                    TIERS
                  </span>
                </span>
              </div>
              <span className="text-[9.5px] font-mono text-muted tracking-widest uppercase mt-0.5">
                Ranked. Tested. Verified.
              </span>
            </div>
          </Link>

          {/* CENTER: Multi-Page Navigation Buttons (Animated Gliding Active Capsule) */}
          <div className="hidden xl:flex flex-1 items-center justify-center gap-1 mx-2 p-1 rounded-2xl bg-[#090C15]/75 border border-white/[0.06] backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold tracking-wide whitespace-nowrap shrink-0 transition-colors group select-none"
                >
                  {/* Fluid Sliding Active Indicator (Framer Motion layoutId) */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTabIndicator"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF2D55]/25 via-[#E11D48]/20 to-[#7C3AED]/25 border border-[#FF2D55]/60 shadow-[0_0_20px_rgba(255,45,85,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-[#FF2D55]/30 -z-10"
                    />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-115 ${
                      isActive ? "text-[#FF2D55] drop-shadow-[0_0_8px_rgba(255,45,85,0.8)]" : "text-muted group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`whitespace-nowrap transition-colors duration-200 ${
                      isActive ? "text-white font-extrabold" : "text-muted group-hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}

            <button
              onClick={onOpenInfo}
              className="p-1.5 rounded-xl text-muted hover:text-amber-400 hover:bg-white/[0.06] transition-all border border-transparent shrink-0 hover:scale-110 active:scale-95"
              title="Quick Points & Titles Guide"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Compact Nav for Medium Screens (Tablets / Laptops) */}
          <div className="hidden md:flex xl:hidden items-center gap-1 shrink-0 p-1 rounded-xl bg-[#090C15]/75 border border-white/[0.06]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-heading font-bold whitespace-nowrap shrink-0 transition-colors group select-none"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTabIndicatorMd"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-lg bg-[#FF2D55]/20 border border-[#FF2D55]/50 shadow-sm -z-10"
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#FF2D55]" : "text-muted group-hover:text-white"}`} />
                  <span className={`whitespace-nowrap ${isActive ? "text-white" : "text-muted group-hover:text-white"}`}>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* RIGHT: SINGLE REAL Search Input + Discord CTA (Zero Duplicate Search Bars!) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* The ONE and ONLY Search Input */}
            <div ref={searchContainerRef} className="relative">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search player..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    setSearchOpen(Boolean(val.trim()));
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) {
                      setSearchOpen(true);
                    }
                  }}
                  className="w-28 sm:w-36 lg:w-44 pl-8 pr-9 py-1.5 rounded-xl bg-surface-2/90 hover:bg-surface border border-line focus:border-[#FF2D55]/60 focus:bg-surface text-xs font-mono text-text placeholder:text-muted/70 focus:outline-none transition-all shadow-inner"
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted hover:text-text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface border border-line text-[9px] text-muted font-bold">
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Search Results Dropdown - 100% Solid Opaque Background with Typo Tolerance */}
              {searchOpen && searchQuery.trim().length > 0 && (
                <div
                  data-lenis-prevent="true"
                  style={{ position: "absolute", zIndex: 99999, backgroundColor: "#0A0E18" }}
                  className="!absolute right-0 top-full mt-2 w-[calc(100vw-24px)] max-w-sm sm:w-96 border border-white/10 border-t-[#FF2D55]/60 bg-[#0A0E18] rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.98),0_0_35px_rgba(255,45,85,0.15)] p-2.5 text-xs font-mono space-y-2 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between px-2.5 py-1 text-[10px] text-muted border-b border-line">
                    <span className="font-bold text-text/80 tracking-wide">
                      {searchResults.length} {searchResults.length === 1 ? "COMBATANT" : "COMBATANTS"} FOUND
                    </span>
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="text-muted hover:text-white text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <span>ESC</span>
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto pt-1 space-y-1.5 overscroll-contain pr-0.5">
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center space-y-3">
                        <div className="text-muted text-[11px] font-mono leading-relaxed">
                          No combatants found matching{" "}
                          <span className="text-white font-bold bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                            &ldquo;{searchQuery}&rdquo;
                          </span>
                        </div>
                        <div className="text-[10px] text-muted/60 uppercase tracking-widest font-mono">
                          Popular Champions:
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {["ClownPierce", "Marlowww", "Swight", "Sponker", "Coldified"].map((name) => {
                            const p = PLAYERS.find((x) => x.username.toLowerCase() === name.toLowerCase());
                            if (!p) return null;
                            return (
                              <button
                                key={name}
                                onClick={() => {
                                  onSelectPlayer(p);
                                  setSearchOpen(false);
                                  setSearchQuery("");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#121724] hover:bg-[#FF2D55]/20 border border-line hover:border-[#FF2D55]/50 text-[11px] font-mono text-text hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                              >
                                <img
                                  src={`https://mc-heads.net/head/${p.username}/32`}
                                  alt={p.username}
                                  className="w-4 h-4 rounded shrink-0"
                                />
                                <span className="font-bold">{p.username}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      searchResults.map((result) => {
                        const player = result.player;
                        const isFuzzy = result.matchType === "fuzzy";
                        return (
                          <button
                            key={player.id}
                            onClick={() => {
                              onSelectPlayer(player);
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="w-full flex items-center justify-between p-2 rounded-xl bg-[#0F1422]/60 hover:bg-[#151D30] border border-line/60 hover:border-[#FF2D55]/50 transition-all text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={`https://mc-heads.net/head/${player.username}/64`}
                                alt={player.username}
                                className="w-8 h-8 rounded-lg border border-line/80 group-hover:scale-105 transition-transform shrink-0 bg-black/40"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-heading font-bold text-sm text-white group-hover:text-brand-cyan transition-colors truncate">
                                    {player.username}
                                  </span>
                                  {isFuzzy && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono shrink-0">
                                      Did you mean?
                                    </span>
                                  )}
                                  {result.matchedField && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 font-mono shrink-0">
                                      {result.matchedField}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                                  <span className="font-mono font-bold text-amber-400">
                                    #{player.globalRank || "?"}
                                  </span>
                                  <span>•</span>
                                  <span>{player.points} pts</span>
                                  {player.combatTitle && (
                                    <>
                                      <span>•</span>
                                      <span className="text-brand-cyan/80 truncate max-w-[120px]">
                                        {player.combatTitle}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface border border-line text-muted group-hover:text-white shrink-0 ml-2">
                              {player.region}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Official Discord Button */}
            <a
              href="https://discord.gg/RESuGyFwJ3"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-vyntric-discord shrink-0 hidden xl:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold whitespace-nowrap"
            >
              <DiscordIcon className="w-3.5 h-3.5 fill-current" />
              <span>Join Discord</span>
            </a>

            {/* Get Tested CTA (Hidden on small phones to prevent overflow, shown in mobile drawer) */}
            <a
              href="https://discord.gg/RESuGyFwJ3"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-vyntric-primary shrink-0 hidden sm:inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-mono tracking-wide whitespace-nowrap shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Tested</span>
              <ArrowRight className="w-3 h-3 opacity-80" />
            </a>

            {/* Mobile Menu Hamburger (Always visible on mobile without horizontal shift) */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl bg-surface-2 border border-line text-muted hover:text-text shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div
            data-lenis-prevent="true"
            className="md:hidden border-t border-line mt-3 px-4 py-4 bg-[#0A0D15] space-y-2 font-mono text-sm"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2.5 rounded-xl ${
                    isActive
                      ? "bg-[#FF2D55]/20 text-white font-bold border border-[#FF2D55]/40"
                      : "text-muted hover:text-text hover:bg-surface-2"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#FF2D55]" />
                    <span>{link.label}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}

            <a
              href="https://discord.gg/RESuGyFwJ3"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-vyntric-discord flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold mt-2"
            >
              <DiscordIcon className="w-4 h-4 fill-current" />
              <span>Join Official Discord</span>
            </a>

            <a
              href="https://discord.gg/RESuGyFwJ3"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-vyntric-primary flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold mt-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Get Tested on Discord</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}
