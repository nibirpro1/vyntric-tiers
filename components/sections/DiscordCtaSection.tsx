"use client";

import React from "react";
import { motion } from "framer-motion";
import { Disc as DiscordIcon, Sparkles, ArrowRight, ShieldCheck, Swords, Users } from "lucide-react";

export function DiscordCtaSection() {
  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-solid border-2 border-brand-violet/40 bg-gradient-to-br from-[#0E121F] via-[#120E28]/80 to-[#0A0D18] rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl text-center space-y-8">
          {/* Ambient Lighting */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-violet/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

          {/* Heading */}
          <div className="space-y-3 max-w-2xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/20 border border-brand-violet/40 text-brand-cyan text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE PATH TO TIER 1</span>
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-text tracking-tight">
              Get Tested on{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-cyan">
                Vyntric Tiers
              </span>
            </h2>

            <p className="text-muted text-sm sm:text-base leading-relaxed">
              Prove your combat rating against verified council examiners. First-to-5 duels, transparent recordings, and instant database ranking.
            </p>
          </div>

          {/* 3-Step Process Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto relative z-10 text-left">
            <div className="p-5 rounded-2xl bg-surface/90 border border-line space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-violet/20 border border-brand-violet/40 text-brand-violet flex items-center justify-center font-mono font-black text-sm">
                1
              </div>
              <h3 className="font-heading font-black text-base text-text">Join Vyntric Discord</h3>
              <p className="text-xs text-muted leading-relaxed">
                Enter our official competitive hub and link your Minecraft account with <code className="text-brand-cyan font-mono">/register</code>.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface/90 border border-line space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan flex items-center justify-center font-mono font-black text-sm">
                2
              </div>
              <h3 className="font-heading font-black text-base text-text">Enter Region &amp; Kit Queue</h3>
              <p className="text-xs text-muted leading-relaxed">
                Select your competitive gamemode and region bracket in the automated <code className="text-brand-cyan font-mono">#queue</code> channel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface/90 border border-line space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-mono font-black text-sm">
                3
              </div>
              <h3 className="font-heading font-black text-base text-text">Duel &amp; Earn Your Tier</h3>
              <p className="text-xs text-muted leading-relaxed">
                Fight an official tester in a private FT5 arena. Your result updates the website leaderboard instantly.
              </p>
            </div>
          </div>

          {/* Magnetic Glowing Discord Button */}
          <div className="pt-4 relative z-10">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              href="https://discord.gg/RESuGyFwJ3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-violet via-[#5865F2] to-brand-cyan text-white font-mono font-black text-base shadow-2xl shadow-brand-violet/40 hover:shadow-brand-violet/60 transition-all border border-white/20"
            >
              <DiscordIcon className="w-6 h-6" />
              <span>Join Vyntric Discord Queue</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
