"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUp, Disc as DiscordIcon, Twitter, Youtube, Github } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BrandLogo } from "./icons/BrandLogo";
import { SITE_CONFIG } from "@/lib/site";
import { GAMEMODES } from "@/lib/tiers";

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const wordmarkRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wordmarkRef.current) return;

    // Check reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordmarkRef.current,
        {
          backgroundPosition: "0% 100%",
          opacity: 0.25,
        },
        {
          backgroundPosition: "100% 0%",
          opacity: 0.85,
          scrollTrigger: {
            trigger: wordmarkRef.current,
            start: "top 95%",
            end: "bottom 85%",
            scrub: 1,
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#030408] border-t border-line mt-20 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-line">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={32} />
              <span className="font-heading font-extrabold text-lg text-text">
                VYNTRIC{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D55] via-[#E11D48] to-[#7C3AED]">
                  TIERS
                </span>
              </span>
            </div>
            <p className="text-muted text-xs leading-relaxed max-w-sm font-mono">
              Official competitive Minecraft PvP Tier Testing Council. 1v1
              first-to-5 verified tests across all 9 standard gamemode ladders.
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={SITE_CONFIG.links.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface border border-line flex items-center justify-center text-muted hover:text-[#5865F2] transition-colors"
                title="Discord"
              >
                <DiscordIcon className="w-4 h-4" />
              </a>
              <a
                href={SITE_CONFIG.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface border border-line flex items-center justify-center text-muted hover:text-[#1DA1F2] transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={SITE_CONFIG.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface border border-line flex items-center justify-center text-muted hover:text-[#FF0000] transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={SITE_CONFIG.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface border border-line flex items-center justify-center text-muted hover:text-text transition-colors"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Ladders */}
          <div className="space-y-3">
            <span className="micro-label block">LADDERS</span>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs font-mono">
              {GAMEMODES.filter((g) => g.id !== "overall").map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/tierlist?kit=${g.id}`}
                    className="text-muted hover:text-brand-cyan transition-colors"
                  >
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Site Navigation */}
          <div className="space-y-3">
            <span className="micro-label block">PAGES</span>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/" className="text-muted hover:text-white transition-colors">
                  Rankings & Tier List
                </Link>
              </li>
              <li>
                <Link href="/tests" className="text-muted hover:text-white transition-colors">
                  Recent Tests Feed
                </Link>
              </li>
              <li>
                <Link href="/members" className="text-muted hover:text-white transition-colors">
                  Council Members
                </Link>
              </li>
              <li>
                <Link href="/rules" className="text-muted hover:text-white transition-colors">
                  Scoring & Rules
                </Link>
              </li>
              <li>
                <Link href="/queue" className="text-muted hover:text-white transition-colors">
                  Live Queue Monitor
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <span className="micro-label block">COMMUNITY</span>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/team" className="text-muted hover:text-text transition-colors">
                  Council Members
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-muted hover:text-text transition-colors">
                  Apply for Testing
                </Link>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-text transition-colors"
                >
                  Discord Server
                </a>
              </li>
              <li>
                <Link href="/faq" className="text-muted hover:text-text transition-colors">
                  Testing FAQ & Rules
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Giant Outlined Wordmark */}
        <div className="pt-8 pb-4 text-center overflow-hidden">
          <div
            ref={wordmarkRef}
            className="font-heading font-black text-6xl sm:text-8xl md:text-9xl lg:text-[13rem] tracking-tighter leading-none select-none text-transparent"
            style={{
              WebkitTextStroke: "1px rgba(255, 255, 255, 0.12)",
              backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #7C3AED 50%, #22D3EE 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              backgroundSize: "200% 200%",
            }}
          >
            VYNTRIC
          </div>
        </div>

        {/* Bottom Disclaimers & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] font-mono text-muted/70">
          <div className="space-y-1 text-center sm:text-left">
            <p>© 2025 VYNTRIC TIERS — Ranked. Tested. Verified. All rights reserved.</p>
            <p className="text-muted/50">
              Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface border border-line text-muted hover:text-text transition-colors"
            title="Scroll back to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
