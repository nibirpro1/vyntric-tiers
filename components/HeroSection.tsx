"use client";
import { useUIStore } from "@/lib/store";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Volume2,
  VolumeX,
  Volume1,
  ExternalLink,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Trophy,
  Swords,
  Shield,
  Disc as DiscordIcon,
  Play,
  Pause,
} from "lucide-react";
import { BrandLogo } from "./icons/BrandLogo";

interface HeroSectionProps {
  onExploreRankings?: () => void;
}

export function HeroSection({ onExploreRankings }: HeroSectionProps) {
  // Audio state - Persisted globally across all page navigations
  const {
    audioMuted: isMuted,
    setAudioMuted,
    audioVolume: volume,
    setAudioVolume,
  } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(!isMuted);
  const isMutedRef = useRef(isMuted);

  // Sync state from localStorage on mount to guarantee persistence
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedMuted = localStorage.getItem("vyntric_audio_muted");
      if (savedMuted === "true") {
        setAudioMuted(true);
        isMutedRef.current = true;
        setIsPlaying(false);
      } else if (savedMuted === "false") {
        setAudioMuted(false);
        isMutedRef.current = false;
      }
      const savedVol = localStorage.getItem("vyntric_audio_volume");
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v)) {
          setAudioVolume(v);
        }
      }
    }
  }, [setAudioMuted, setAudioVolume]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Parallax 3D mouse state for right-side Minecraft block emblem
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement | null>(null);

  // Media refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pure Minecraft "The Sift" New Dimension 3D Animation Loop (ZERO text, ZERO logos, ZERO promo)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => null);
  }, []);

  // Audio initialization & sync - starts ON by default, auto-handles browser interaction policy
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Check localStorage directly to prevent any race condition
    let effectiveMuted = isMuted;
    if (typeof window !== "undefined") {
      const savedMuted = localStorage.getItem("vyntric_audio_muted");
      if (savedMuted === "true") {
        effectiveMuted = true;
      }
    }

    audio.volume = volume;
    audio.muted = effectiveMuted;

    if (!effectiveMuted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            const handleFirstInteraction = () => {
              if (typeof window !== "undefined" && localStorage.getItem("vyntric_audio_muted") === "true") {
                return;
              }
              if (!isMutedRef.current && audioRef.current) {
                audioRef.current.muted = false;
                audioRef.current.volume = volume;
                audioRef.current
                  .play()
                  .then(() => setIsPlaying(true))
                  .catch(() => null);
              }
              window.removeEventListener('pointerdown', handleFirstInteraction);
              window.removeEventListener('keydown', handleFirstInteraction);
              window.removeEventListener('scroll', handleFirstInteraction);
            };
            window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
            window.addEventListener('keydown', handleFirstInteraction, { once: true });
            window.addEventListener('scroll', handleFirstInteraction, { once: true });
          });
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [isMuted, volume]);

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const nextMuted = !isMuted;
    setAudioMuted(nextMuted);
    isMutedRef.current = nextMuted;

    const audio = audioRef.current;
    if (!audio) return;

    if (nextMuted) {
      // STOP IMMEDIATELY
      audio.pause();
      audio.muted = true;
      setIsPlaying(false);
    } else {
      // RESUME
      audio.muted = false;
      audio.volume = volume;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => null);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setAudioVolume(newVol);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVol;
    }
    if (newVol === 0) {
      setAudioMuted(true);
      isMutedRef.current = true;
      setIsPlaying(false);
      if (audio) {
        audio.pause();
        audio.muted = true;
      }
    } else if (isMuted) {
      setAudioMuted(false);
      isMutedRef.current = false;
      setIsPlaying(true);
      if (audio) {
        audio.muted = false;
        audio.play().catch(() => null);
      }
    }
  };

  // Parallax mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  const scrollToRankings = () => {
    if (onExploreRankings) {
      onExploreRankings();
      return;
    }
    const target =
      document.getElementById("rankings") ||
      document.getElementById("rankings-hub") ||
      document.getElementById("main-content");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col justify-between overflow-hidden select-none border-b border-line/40 bg-[#07090E] pt-4 sm:pt-8 pb-6"
    >
      {/* ========================================================= */}
      {/* 1. SEAMLESS LOOPING BACKGROUND VIDEO                      */}
      {/* ========================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 filter brightness-85 contrast-115"
        >
          <source src="/minecraft-bg.mp4" type="video/mp4" />
        </video>

        {/* Ambient Dark Gradient Overlays for Readability & Cinematic Mood */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/80 to-[#07090E]/65" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_25%,_#07090E_92%)]" />
        
        {/* High-End Duotone Atmospheric Glows (Lovable-inspired deep obsidian aesthetic) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#22D3EE]/12 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#FF2D55]/12 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] rounded-full bg-[#7C3AED]/10 blur-[130px] pointer-events-none" />

        {/* Subtle Cyber Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `radial-gradient(rgba(34, 211, 238, 0.35) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src="/hero-ambient.mp3"
      />

      {/* ========================================================= */}
      {/* 2. TOP AUDIO & AMBIENCE CONTROLLER BAR                    */}
      {/* ========================================================= */}
      <div className="relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-end">
        <div className="group relative inline-flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 rounded-full bg-[#080B14]/90 backdrop-blur-2xl border border-white/10 hover:border-[#22D3EE]/50 shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(34,211,238,0.14)] transition-all duration-300 select-none">
          
          {/* Animated 5-Bar Cyber Audio Spectrum */}
          <div className="flex items-end gap-0.5 h-4 px-0.5">
            {[
              { color: "#22D3EE", h: "h-3", delay: "delay-0" },
              { color: "#FF2D55", h: "h-4", delay: "delay-75" },
              { color: "#F59E0B", h: "h-2.5", delay: "delay-150" },
              { color: "#818CF8", h: "h-3.5", delay: "delay-100" },
              { color: "#10B981", h: "h-2", delay: "delay-200" },
            ].map((bar, i) => (
              <span
                key={i}
                className={`w-0.5 rounded-full transition-all duration-200 ${
                  mounted && !isMuted && isPlaying
                    ? `${bar.h} animate-pulse ${bar.delay}`
                    : "h-1 opacity-40"
                }`}
                style={{ backgroundColor: bar.color }}
              />
            ))}
          </div>

          {/* Sound Toggle Button with Tactile Feedback */}
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer group/btn"
            title={mounted && isMuted ? "Sound is Muted - Click to Unmute" : "Sound is Active - Click to Mute"}
          >
            {mounted && isMuted ? (
              <VolumeX className="w-4 h-4 text-muted group-hover/btn:text-white transition-colors" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4 text-[#22D3EE] drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#22D3EE] drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            )}
            <span
              className={`text-[11px] font-mono tracking-wider transition-colors ${
                mounted && isMuted
                  ? "text-muted group-hover/btn:text-white"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#818CF8] font-black"
              }`}
            >
              {mounted && isMuted ? "SOUND: OFF" : "Ambient Sound: ON"}
            </span>
          </button>

          {/* Glowing Vertical Divider */}
          <span className="w-px h-3.5 bg-white/10" />

          {/* Futuristic Cyber Volume Slider */}
          <div className="flex items-center gap-2">
            <input
              id="hero-ambient-volume-slider"
              name="hero-ambient-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={mounted && isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="cyber-slider w-16 sm:w-20"
              title={`Volume: ${Math.round((mounted && isMuted ? 0 : volume) * 100)}%`}
            />

            {/* Glowing Digital Readout Badge */}
            <span
              className="px-1.5 py-0.5 rounded-md font-mono text-[10.5px] font-black tracking-wider border shadow-sm select-none"
              style={{
                color: mounted && isMuted ? "#94A3B8" : "#22D3EE",
                backgroundColor: mounted && isMuted ? "rgba(255,255,255,0.04)" : "rgba(34, 211, 238, 0.12)",
                borderColor: mounted && isMuted ? "rgba(255,255,255,0.08)" : "rgba(34, 211, 238, 0.35)",
                textShadow: mounted && isMuted ? "none" : "0 0 8px rgba(34, 211, 238, 0.5)",
              }}
            >
              {Math.round((mounted && isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. HERO CONTENT: 2-COLUMN SYXLOR-STYLE LAYOUT             */}
      {/* ========================================================= */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Pill Tag, Giant Headline, Subtitle, CTA Buttons */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Category Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0C1220]/80 border border-brand-cyan/30 text-xs font-mono text-brand-cyan shadow-[0_0_15px_rgba(34,211,238,0.15)]"
            >
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
              <span className="font-bold tracking-wider">THE OFFICIAL VYNTRIC TIERS HUB</span>
            </motion.div>

            {/* Giant Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-[1.06]"
            >
              Your next <br />
              Minecraft rank <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22D3EE] via-[#38BDF8] to-[#818CF8] drop-shadow-[0_0_40px_rgba(34,211,238,0.45)]">
                starts here.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm sm:text-base text-muted/90 max-w-xl font-mono leading-relaxed mx-auto lg:mx-0"
            >
              Find your tier, get audited by accredited testers in live duels, and dominate the official competitive standings.
            </motion.p>

            {/* Call-to-Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              {/* Primary Glowing Action: Explore Rankings */}
              <button
                onClick={scrollToRankings}
                className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#22D3EE] hover:from-[#0369A1] hover:to-[#0EA5E9] text-white font-heading font-black text-sm tracking-wide shadow-[0_0_25px_rgba(14,165,233,0.5)] hover:shadow-[0_0_35px_rgba(14,165,233,0.7)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Rankings</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary Action: Join Discord Community */}
              <a
                href="https://discord.gg/RESuGyFwJ3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B0F19]/80 hover:bg-[#131A2B] border border-line-strong hover:border-[#5865F2]/50 text-white font-mono text-sm font-bold shadow-lg hover:shadow-[0_0_20px_rgba(88,101,242,0.3)] transition-all duration-200"
              >
                <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
                <span>Join the Community</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </a>
            </motion.div>

            {/* Trust Metrics Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-4 pt-3 text-xs font-mono text-muted/80 flex-wrap"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>32+ Verified Combatants</span>
              </div>
              <span className="text-line">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                <span>1,248+ Tests Audited</span>
              </div>
              <span className="text-line">•</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>8 Gamemode Disciplines</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: 3D Blocky Minecraft Isometric Emblem (Syxlor-style) */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                transform: `perspective(1000px) rotateX(${mouseOffset.y * -14}deg) rotateY(${mouseOffset.x * 18}deg)`,
                transition: "transform 0.15s ease-out",
              }}
              className="relative w-full max-w-md p-6 sm:p-8 flex flex-col items-center justify-center"
            >
              {/* Backglow Aura */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#0284C7]/20 via-[#22D3EE]/25 to-[#F59E0B]/20 blur-2xl opacity-75 pointer-events-none" />

              {/* Isometric 3D Minecraft Block Logo */}
              <div className="relative z-10 flex flex-col items-center justify-center select-none text-center">
                {/* Official Brand Emblem Floating Above */}
                <div className="mb-4">
                  <BrandLogo size={68} glow />
                </div>

                {/* "VYNTRIC" - Cyan 3D Minecraft Extruded Block Typography */}
                <div
                  className="font-mono font-black text-5xl sm:text-6xl tracking-wider text-[#38BDF8] uppercase leading-none"
                  style={{
                    letterSpacing: "0.08em",
                    textShadow: `
                      0 1px 0 #0284C7,
                      0 2px 0 #0284C7,
                      0 3px 0 #0369A1,
                      0 4px 0 #0369A1,
                      0 5px 0 #075985,
                      0 6px 0 #0C4A6E,
                      0 7px 0 #082F49,
                      0 8px 0 #082F49,
                      0 10px 0 #021A2B,
                      0 14px 24px rgba(0, 0, 0, 0.9),
                      0 0 35px rgba(34, 211, 238, 0.6)
                    `,
                  }}
                >
                  VYNTRIC
                </div>

                {/* "TIERS" - Golden Amber 3D Minecraft Extruded Block Typography */}
                <div
                  className="font-mono font-black text-4xl sm:text-5xl tracking-widest text-[#FCD34D] uppercase mt-2 leading-none"
                  style={{
                    letterSpacing: "0.14em",
                    textShadow: `
                      0 1px 0 #F59E0B,
                      0 2px 0 #F59E0B,
                      0 3px 0 #D97706,
                      0 4px 0 #D97706,
                      0 5px 0 #B45309,
                      0 6px 0 #92400E,
                      0 7px 0 #78350F,
                      0 8px 0 #451A03,
                      0 10px 0 #270E02,
                      0 14px 24px rgba(0, 0, 0, 0.9),
                      0 0 30px rgba(245, 158, 11, 0.6)
                    `,
                  }}
                >
                  TIERS
                </div>

                {/* Competitive Tag */}
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0C1220]/90 border border-brand-cyan/40 text-[11px] font-mono font-bold text-brand-cyan shadow-md">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>OFFICIAL COMPETITIVE LADDERS</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. BOTTOM "SCROLL TO EXPLORE" INDICATOR                   */}
      {/* ========================================================= */}
      <div className="relative z-20 pb-4 flex flex-col items-center justify-center">
        <button
          onClick={scrollToRankings}
          className="group flex flex-col items-center gap-1 text-muted hover:text-white transition-colors cursor-pointer"
        >
          <span className="text-[10px] font-mono tracking-widest font-bold text-muted/70 group-hover:text-brand-cyan uppercase">
            Scroll to Explore
          </span>
          <ChevronDown className="w-4 h-4 text-brand-cyan animate-bounce" />
        </button>
      </div>
    </section>
  );
}
