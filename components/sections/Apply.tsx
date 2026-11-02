"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { SectionTitle } from "@/components/ui/section-title";
import { Card } from "@/components/ui/card";
import { GlowButton } from "@/components/ui/glow-button";
import { Badge } from "@/components/ui/badge";
import { RegionPill } from "@/components/icons/region-pill";
import { KitIcon } from "@/components/icons/kit-icons";
import { STARTING_REGIONS, ALL_TIERS, KitId, Region, Tier } from "@/lib/tiers";
import { KITS, MEMBERS } from "@/lib/data";
import { Application, ApplicationStatus } from "@/lib/types";
import { 
  Send, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Calendar
} from "lucide-react";

const LOCAL_STORAGE_KEY = "vyntric_challenger_app";

function ApplyFormContent() {
  const searchParams = useSearchParams();
  const initialTester = searchParams.get("tester") || "";

  const [activeTab, setActiveTab] = useState<"apply" | "status">("apply");
  const [submitting, setSubmitting] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Application | null>(null);

  // Form State
  const [ign, setIgn] = useState("");
  const [discordTag, setDiscordTag] = useState("");
  const [region, setRegion] = useState<Region>("NA");
  const [kit, setKit] = useState<KitId>("Sword");
  const [previousTier, setPreviousTier] = useState<string>("Unranked");
  const [targetTier, setTargetTier] = useState<Tier>("HT3");
  const [preferredTester, setPreferredTester] = useState(initialTester);
  const [availability, setAvailability] = useState("");
  const [vodLink, setVodLink] = useState("");
  const [notes, setNotes] = useState("");
  const [rulesAgreed, setRulesAgreed] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Status Lookup State
  const [lookupQuery, setLookupQuery] = useState("");
  const [searchingStatus, setSearchingStatus] = useState(false);
  const [lookupResult, setLookupResult] = useState<Application | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Debounced IGN avatar preview
  const [avatarIgn, setAvatarIgn] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ign.trim().length >= 3) {
        setAvatarIgn(ign.trim());
      } else {
        setAvatarIgn("");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [ign]);

  // Load saved ticket from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setActiveTicket(parsed);
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Tester auto-fill from query param
  useEffect(() => {
    if (initialTester) {
      setPreferredTester(initialTester);
    }
  }, [initialTester]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rulesAgreed) {
      toast.error("Please confirm acceptance of testing rules and match requirements.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ign: ign.trim(),
          discordTag: discordTag.trim(),
          region,
          kit,
          previousTier,
          targetTier,
          preferredTester: preferredTester || undefined,
          availability: availability.trim() || undefined,
          vodLink: vodLink.trim(),
          notes: notes.trim() || undefined,
          honeypot, // hidden honeypot
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to submit application");
      }

      // Success
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#7C3AED", "#22D3EE", "#FF2D55", "#FFB020"],
      });

      toast.success("Application successfully submitted!", {
        description: `Ticket #${data.application.id} added to the Challenger Queue.`,
      });

      const ticketObj: Application = {
        id: data.application.id,
        ign: data.application.ign,
        discordTag,
        region,
        kit,
        previousTier,
        targetTier,
        preferredTester,
        availability,
        vodLink,
        submittedAt: data.application.submittedAt || new Date().toISOString(),
        status: "pending",
        notes,
        queuePosition: data.application.queuePosition,
        estimatedWaitHours: data.application.estimatedWaitHours,
      };

      setActiveTicket(ticketObj);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ticketObj));
      setActiveTab("status");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error occurred";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setSearchingStatus(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const q = lookupQuery.trim();
      let res: Response;

      if (q.startsWith("app-")) {
        // Direct ID lookup
        res = await fetch(`/api/applications/${encodeURIComponent(q)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Ticket not found");
        setLookupResult(json.application);
      } else {
        // IGN lookup
        res = await fetch(`/api/applications?ign=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to find ticket for IGN");
        if (!json.applications || json.applications.length === 0) {
          throw new Error(`No active ticket found for IGN "${q}".`);
        }
        setLookupResult(json.applications[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ticket search failed";
      setLookupError(msg);
    } finally {
      setSearchingStatus(false);
    }
  };

  return (
    <section id="apply" className="py-16 sm:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <SectionTitle
            eyebrow="CHALLENGER QUEUE"
            title="Apply for Tier Testing"
            description="Official 1v1 first-to-5 duels against accredited testers on 20 TPS neutral nodes. No subjective votes."
          />

          {/* Tab selector */}
          <div className="flex bg-surface-2 p-1 rounded-xl border border-line shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("apply")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "apply"
                  ? "bg-brand-violet text-white shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              Submit Ticket
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "status"
                  ? "bg-brand-violet text-white shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Queue Status</span>
              {activeTicket && (
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {activeTab === "apply" ? (
          <div className="glass rounded-2xl p-6 sm:p-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anti-bot Honeypot field (hidden from real users) */}
              <div className="hidden sr-only" aria-hidden="true">
                <label htmlFor="form-website-field">Leave blank</label>
                <input
                  id="form-website-field"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Row 1: IGN with live avatar + Discord Tag */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 space-y-2">
                  <label htmlFor="apply-ign" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Minecraft In-Game Name (IGN) <span className="text-brand-pink">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 w-7 h-7 rounded bg-surface-2 border border-line overflow-hidden flex items-center justify-center">
                      {avatarIgn ? (
                        <Image
                          src={`https://mc-heads.net/avatar/${avatarIgn}/64`}
                          alt={avatarIgn}
                          width={28}
                          height={28}
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-2" />
                      )}
                    </div>
                    <input
                      id="apply-ign"
                      type="text"
                      required
                      placeholder="e.g. Zephyrr"
                      value={ign}
                      onChange={(e) => setIgn(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-muted">
                    Must be your exact Java Edition IGN. Case-sensitive.
                  </p>
                </div>

                <div className="md:col-span-5 space-y-2">
                  <label htmlFor="apply-discord" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Discord Handle <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    id="apply-discord"
                    type="text"
                    required
                    placeholder="e.g. zephyrr or player#1234"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono"
                  />
                  <p className="text-[11px] text-muted">
                    Used to coordinate duel time and server IP.
                  </p>
                </div>
              </div>

              {/* Row 2: Region & Kit Selection */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-5 space-y-2">
                  <label htmlFor="apply-region" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Regional Ping Bracket <span className="text-brand-pink">*</span>
                  </label>
                  <select
                    id="apply-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value as Region)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono"
                  >
                    {STARTING_REGIONS.map((r) => (
                      <option key={r} value={r} className="bg-surface text-text">
                        {r} — {r === "NA" ? "North America" : r === "EU" ? "Europe" : r === "AS" ? "Asia" : r === "SA" ? "South America" : r === "AU" ? "Australia / Oceania" : "Middle East"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-7 space-y-2">
                  <label htmlFor="apply-kit" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Kit Ladder Challenge <span className="text-brand-pink">*</span>
                  </label>
                  <select
                    id="apply-kit"
                    value={kit}
                    onChange={(e) => setKit(e.target.value as KitId)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono"
                  >
                    {KITS.map((k) => (
                      <option key={k.id} value={k.id} className="bg-surface text-text">
                        {k.name} ({k.shortDesc.slice(0, 48)}...)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Estimated Tier & Target Tier */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6 space-y-2">
                  <label htmlFor="apply-prev-tier" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Previous or Estimated Tier
                  </label>
                  <select
                    id="apply-prev-tier"
                    value={previousTier}
                    onChange={(e) => setPreviousTier(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono"
                  >
                    <option value="Unranked" className="bg-surface text-text">Unranked (First evaluation)</option>
                    {ALL_TIERS.map((t) => (
                      <option key={t} value={t} className="bg-surface text-text">{t}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-6 space-y-2">
                  <label htmlFor="apply-target-tier" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Target Tier Challenge
                  </label>
                  <select
                    id="apply-target-tier"
                    value={targetTier}
                    onChange={(e) => setTargetTier(e.target.value as Tier)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono"
                  >
                    {ALL_TIERS.map((t) => (
                      <option key={t} value={t} className="bg-surface text-text">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Preferred Tester & Availability */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-6 space-y-2">
                  <label htmlFor="apply-tester" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Preferred Tester (Optional)
                  </label>
                  <select
                    id="apply-tester"
                    value={preferredTester}
                    onChange={(e) => setPreferredTester(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono"
                  >
                    <option value="" className="bg-surface text-text">Any Available Tester (Fastest)</option>
                    {MEMBERS.map((m) => (
                      <option key={m.id} value={m.name} className="bg-surface text-text">
                        {m.name} ({m.role} · {m.specialties.join(", ")})
                      </option>
                    ))}
                  </select>
                  {preferredTester && (
                    <p className="text-[11px] text-brand-cyan">
                      Prefilled request with {preferredTester}.
                    </p>
                  )}
                </div>

                <div className="md:col-span-6 space-y-2">
                  <label htmlFor="apply-avail" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                    Availability / Timezone
                  </label>
                  <input
                    id="apply-avail"
                    type="text"
                    placeholder="e.g. Weekdays 18:00–22:00 UTC, Weekends anytime"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono"
                  />
                </div>
              </div>

              {/* Row 5: VOD Link */}
              <div className="space-y-2">
                <label htmlFor="apply-vod" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                  Ranked VOD / Footage URL <span className="text-brand-pink">*</span>
                </label>
                <input
                  id="apply-vod"
                  type="url"
                  required
                  placeholder="https://youtu.be/... or medal.tv / twitch.tv / streamable.com"
                  value={vodLink}
                  onChange={(e) => setVodLink(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono"
                />
                <p className="text-[11px] text-muted">
                  Must be at least 2 rounds of unedited ranked gameplay demonstrating hit pacing and client cleanliness.
                </p>
              </div>

              {/* Row 6: Additional Notes */}
              <div className="space-y-2">
                <label htmlFor="apply-notes" className="text-xs font-mono font-semibold text-text uppercase tracking-wider block">
                  Challenger Notes (Optional)
                </label>
                <textarea
                  id="apply-notes"
                  rows={3}
                  maxLength={300}
                  placeholder="Mention previous server ranks, recent wins against ranked players, or preferred ping cap..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet font-mono resize-none"
                />
              </div>

              {/* Checkbox */}
              <div className="p-4 rounded-xl bg-surface-2/60 border border-line flex items-start gap-3">
                <input
                  id="rules-check"
                  type="checkbox"
                  checked={rulesAgreed}
                  onChange={(e) => setRulesAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-line bg-surface text-brand-violet focus:ring-brand-violet"
                />
                <label htmlFor="rules-check" className="text-xs text-muted leading-relaxed cursor-pointer select-none">
                  I certify that the submitted footage is my own. I agree to compete in a 1v1 first-to-5 duel on official Vyntric neutral nodes, follow anticheat protocol, and understand test results are final and logged permanently.
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <GlowButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  className="w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Challenger Application
                </GlowButton>

                <span className="text-xs text-muted font-mono">
                  ⏱ Average review turnaround: ~18 hours
                </span>
              </div>
            </form>
          </div>
        ) : (
          /* Status & Lookup View */
          <div className="space-y-8">
            {/* Search bar */}
            <Card className="p-6">
              <form onSubmit={handleLookup} className="space-y-3">
                <label htmlFor="ticket-lookup" className="micro-label block">LOOK UP APPLICATION STATUS</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
                    <input
                      id="ticket-lookup"
                      type="text"
                      placeholder="Enter Ticket ID (app-...) or Minecraft IGN"
                      value={lookupQuery}
                      onChange={(e) => setLookupQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-violet"
                    />
                  </div>
                  <GlowButton type="submit" variant="outline" size="md" loading={searchingStatus}>
                    Check Ticket
                  </GlowButton>
                </div>
              </form>

              {lookupError && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{lookupError}</span>
                </div>
              )}
            </Card>

            {/* Display Active Ticket (from Search or localStorage) */}
            {(lookupResult || activeTicket) && (
              <div className="card-solid rounded-2xl p-6 sm:p-8 space-y-6">
                {(() => {
                  const t = lookupResult || activeTicket!;
                  const isScheduled = t.status === "scheduled";
                  const isPending = t.status === "pending";
                  const isInReview = t.status === "in_review";
                  const isCompleted = t.status === "completed";
                  const isRejected = t.status === "rejected";

                  return (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-line">
                        <div className="space-y-1">
                          <span className="micro-label">TICKET #{t.id}</span>
                          <h3 className="font-heading font-extrabold text-2xl text-text flex items-center gap-2">
                            {t.ign}
                            <RegionPill region={t.region} />
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending && (
                            <Badge variant="outline" className="border-brand-yellow/40 text-brand-yellow font-mono text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              IN QUEUE (POS #{t.queuePosition || 1})
                            </Badge>
                          )}
                          {isInReview && (
                            <Badge variant="outline" className="border-brand-cyan/40 text-brand-cyan font-mono text-xs">
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              IN REVIEW
                            </Badge>
                          )}
                          {isScheduled && (
                            <Badge variant="outline" className="border-brand-violet/40 text-brand-violet font-mono text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              DUEL SCHEDULED
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              EVALUATION COMPLETED
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge variant="outline" className="border-rose-500/40 text-rose-400 font-mono text-xs">
                              <ShieldAlert className="w-3 h-3 mr-1" />
                              DECLINED
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-surface-2 border border-line">
                          <span className="text-[10px] text-muted block uppercase">CHALLENGE KIT</span>
                          <span className="text-text font-bold flex items-center gap-1.5 mt-0.5">
                            <KitIcon kit={t.kit} className="w-3.5 h-3.5 text-brand-cyan" />
                            {t.kit}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-surface-2 border border-line">
                          <span className="text-[10px] text-muted block uppercase">TARGET TIER</span>
                          <span className="text-brand-pink font-bold mt-0.5 block">
                            {t.targetTier || "Evaluation"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-surface-2 border border-line">
                          <span className="text-[10px] text-muted block uppercase">ESTIMATED WAIT</span>
                          <span className="text-text font-bold mt-0.5 block">
                            {t.estimatedWaitHours ? `~${t.estimatedWaitHours} hours` : "Under 24h"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-surface-2 border border-line">
                          <span className="text-[10px] text-muted block uppercase">ASSIGNED TESTER</span>
                          <span className="text-text font-bold mt-0.5 block">
                            {t.preferredTester || "Pending match"}
                          </span>
                        </div>
                      </div>

                      {t.reviewerNotes && (
                        <div className="p-4 rounded-xl bg-surface-2 border border-brand-violet/30 text-xs space-y-1">
                          <span className="micro-label text-brand-violet">TESTER NOTE</span>
                          <p className="text-text leading-relaxed">{t.reviewerNotes}</p>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-surface-2/40 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
                        <span>Submitted on {new Date(t.submittedAt).toLocaleDateString()}</span>
                        <a
                          href={t.vodLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-cyan hover:underline"
                        >
                          View Submitted VOD
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export function Apply() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 h-96 card-solid animate-pulse" />}>
      <ApplyFormContent />
    </Suspense>
  );
}
