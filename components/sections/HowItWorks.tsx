"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SectionTitle } from "@/components/ui/section-title";
import { GlowButton } from "@/components/ui/glow-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  Swords, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Server,
  Zap
} from "lucide-react";

const HowItWorksScene = dynamic(
  () => import("@/components/three/HowItWorksScene").then((m) => m.HowItWorksScene),
  { ssr: false }
);

interface Step {
  id: number;
  stepNum: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: React.ElementType;
  description: string;
  bulletPoints: string[];
  protocol: {
    duration: string;
    requirement: string;
    node: string;
  };
}

const STEPS: Step[] = [
  {
    id: 0,
    stepNum: "01",
    title: "Submit Application",
    subtitle: "Screened VOD Submission",
    tag: "REQUIREMENTS",
    icon: FileText,
    description:
      "Submit your exact Minecraft IGN, Discord handle, regional latency bracket, and a clean ranked VOD (YouTube, Twitch, or Medal) demonstrating hit selection and spacing.",
    bulletPoints: [
      "Minimum 720p 60FPS unedited gameplay",
      "F3 debug screen shown for 5 seconds to audit modifications",
      "Select your target kit and target tier (HT1–LT5)",
    ],
    protocol: {
      duration: "~5 min submit",
      requirement: "Clean VOD URL",
      node: "Web Form",
    },
  },
  {
    id: 1,
    stepNum: "02",
    title: "Queue & Assignment",
    subtitle: "Automated Bracket Routing",
    tag: "VERIFICATION",
    icon: Clock,
    description:
      "Your ticket enters the live Challenger Queue. The system routes you to an accredited Tester matching your time zone and regional ping bracket (NA East/West, EU, AS, OCE).",
    bulletPoints: [
      "Real-time ticket ID with live position tracker",
      "Tester review of client audit and clip validity",
      "Discord ping when your duel schedule is ready",
    ],
    protocol: {
      duration: "12–24h review",
      requirement: "Active Discord",
      node: "Council Queue",
    },
  },
  {
    id: 2,
    stepNum: "03",
    title: "The 1v1 Test Duel",
    subtitle: "First-to-5 Official Node",
    tag: "COMBAT",
    icon: Swords,
    description:
      "Join the official Vyntric neutral duel node. Fight an accredited tester in a strict First-to-5 match under live spectator oversight. Anti-cheat telemetry logs all hits.",
    bulletPoints: [
      "Standard competitive kit loadout with identical enchantments",
      "Neutral routing node with equalized round-trip ping",
      "Both players record full perspectives for dispute review",
    ],
    protocol: {
      duration: "10–20 min duel",
      requirement: "First-to-5 wins",
      node: "Test Node (20 TPS)",
    },
  },
  {
    id: 3,
    stepNum: "04",
    title: "Ranked & Verified",
    subtitle: "Instant Public Record",
    tag: "OFFICIAL TIER",
    icon: Award,
    description:
      "Points are immediately computed, your profile is minted or updated, and the test result is permanently entered into the public ledger and recent tests feed.",
    bulletPoints: [
      "Instant point recalculation across all active ladders",
      "Promotion, demotion, or tier retention confirmed",
      "Public test card logged with round score and tester notes",
    ],
    protocol: {
      duration: "Instant sync",
      requirement: "Official result",
      node: "Global Ledger",
    },
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-16 sm:py-20 relative overflow-hidden">
      {/* Background radial accent */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl -z-10"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(34,211,238,0.1) 50%, transparent 80%)"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <SectionTitle
            eyebrow="PROTOCOL · TESTING METHODOLOGY"
            title="How Tier Testing Works"
            description="From initial VOD screening to first-to-5 duels on 20 TPS test nodes. No subjective votes. Pure competitive merit."
          />

          <div className="hidden sm:flex items-center gap-3">
            <span className="micro-label">SELECT STEP</span>
            <div className="flex bg-surface-2 p-1 rounded-xl border border-line">
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                    activeStep === step.id
                      ? "bg-brand-violet text-white shadow-sm"
                      : "text-muted hover:text-text"
                  }`}
                  aria-label={`View Step ${step.stepNum}: ${step.title}`}
                >
                  {step.stepNum}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step Navigation Bar for Mobile */}
        <div className="grid grid-cols-4 gap-2 mb-8 sm:hidden">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`p-2 rounded-lg text-center border font-mono text-xs font-bold transition-all ${
                activeStep === step.id
                  ? "bg-brand-violet/20 border-brand-violet text-brand-violet"
                  : "bg-surface-2 border-line text-muted"
              }`}
            >
              {step.stepNum}
            </button>
          ))}
        </div>

        {/* Main Interactive Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3D Morphing Crystal Stage */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-square w-full max-w-[420px] mx-auto rounded-3xl bg-surface border border-line relative overflow-hidden flex flex-col justify-between p-6 shadow-2xl">
              {/* Subtle grid in background */}
              <div className="absolute inset-0 bg-grid-overlay opacity-30 pointer-events-none" />

              {/* Header inside 3D card */}
              <div className="relative z-10 flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-[10px] uppercase border-line bg-surface-2/80">
                  <Server className="w-3 h-3 mr-1 text-brand-cyan" />
                  {STEPS[activeStep].protocol.node}
                </Badge>
                <span className="font-mono text-xs text-muted tabular-nums">
                  STAGE {STEPS[activeStep].stepNum} OF 04
                </span>
              </div>

              {/* 3D Canvas / Fallback container */}
              <div className="relative z-0 h-64 flex items-center justify-center">
                <HowItWorksScene activeStep={activeStep} />
              </div>

              {/* Footer info box inside 3D card */}
              <div className="relative z-10 bg-surface-2/90 border border-line/60 rounded-xl p-3 backdrop-blur-md flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted block uppercase">DURATION</span>
                  <span className="text-text font-bold">{STEPS[activeStep].protocol.duration}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted block uppercase">REQUIREMENT</span>
                  <span className="text-brand-cyan font-bold">{STEPS[activeStep].protocol.requirement}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Active Step Details & Progression */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-3xl font-extrabold text-brand-violet">
                      {STEPS[activeStep].stepNum}
                    </span>
                    <Badge variant="outline" className="border-brand-violet/40 text-brand-cyan font-mono text-xs">
                      {STEPS[activeStep].tag}
                    </Badge>
                  </div>

                  <h3 className="font-heading font-black text-2xl sm:text-3xl text-text tracking-tight">
                    {STEPS[activeStep].title}
                  </h3>
                  <p className="text-muted text-base leading-relaxed">
                    {STEPS[activeStep].description}
                  </p>
                </div>

                {/* Bullet Criteria */}
                <div className="space-y-2.5 pt-2">
                  <span className="micro-label block">CRITERIA & VERIFICATION</span>
                  {STEPS[activeStep].bulletPoints.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-surface-2/60 border border-line text-sm text-text"
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                {/* Navigation actions */}
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-line">
                  {activeStep < STEPS.length - 1 ? (
                    <button
                      onClick={() => setActiveStep((prev) => prev + 1)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 hover:bg-surface border border-line text-sm font-semibold text-text transition-all group"
                    >
                      <span>Next: Step {STEPS[activeStep + 1].stepNum}</span>
                      <ArrowRight className="w-4 h-4 text-brand-cyan group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <GlowButton variant="primary" size="md" asChild>
                      <Link href="/apply">
                        Submit Application
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </GlowButton>
                  )}

                  {activeStep > 0 && (
                    <button
                      onClick={() => setActiveStep((prev) => prev - 1)}
                      className="px-4 py-2.5 rounded-xl text-xs font-mono text-muted hover:text-text transition-colors"
                    >
                      ← Previous Step
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-2 text-xs text-muted font-mono">
                    <Zap className="w-3.5 h-3.5 text-brand-yellow" />
                    <span>Average queue turnaround: ~18 hours</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
