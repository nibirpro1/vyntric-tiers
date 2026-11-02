"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import { SectionTitle } from "@/components/ui/section-title";
import { Card } from "@/components/ui/card";
import { GlowButton } from "@/components/ui/glow-button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { 
  Search, 
  ArrowRight, 
  Hash, 
  CheckCircle2, 
  X, 
  Gamepad2, 
  MessageSquare, 
  HelpCircle
} from "lucide-react";

import { FAQ_ITEMS, FAQItem, FAQCategory } from "@/lib/faq";

export type { FAQItem, FAQCategory };
export { FAQ_ITEMS };

interface FAQProps {
  previewMode?: boolean;
}

export function FAQ({ previewMode = false }: FAQProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | "ALL">("ALL");

  const fuse = useMemo(
    () =>
      new Fuse(FAQ_ITEMS, {
        keys: ["question", "answer", "points", "tag", "category"],
        threshold: 0.35,
      }),
    []
  );

  const filteredItems = useMemo(() => {
    let items = FAQ_ITEMS;

    if (searchQuery.trim()) {
      items = fuse.search(searchQuery.trim()).map((res) => res.item);
    }

    if (selectedCategory !== "ALL") {
      items = items.filter((item) => item.category === selectedCategory);
    }

    // If on homepage preview and not searching, show 6 highlighted items across categories
    if (previewMode && !searchQuery.trim() && selectedCategory === "ALL") {
      return items.slice(0, 6);
    }

    return items;
  }, [searchQuery, selectedCategory, previewMode, fuse]);

  const counts = useMemo(() => {
    return {
      ALL: FAQ_ITEMS.length,
      Minecraft: FAQ_ITEMS.filter((i) => i.category === "Minecraft").length,
      Discord: FAQ_ITEMS.filter((i) => i.category === "Discord").length,
      Questions: FAQ_ITEMS.filter((i) => i.category === "Questions").length,
    };
  }, []);

  return (
    <section id="faq" className="py-16 sm:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <SectionTitle
            eyebrow="OFFICIAL RULEBOOK"
            title="Rules & Testing FAQ"
            description="Official Minecraft 1v1 PvP duel standards, Discord queue conduct, and leaderboard scoring criteria."
          />

          {previewMode && (
            <GlowButton variant="outline" size="sm" asChild className="shrink-0">
              <Link href="/faq">
                View Full Rulebook ({FAQ_ITEMS.length})
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </GlowButton>
          )}
        </div>

        {/* Live Search Bar directly inside this section */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              id="rules-faq-search"
              type="text"
              placeholder="Search rules, Discord guidelines, scoring, client mods, ping parity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-2 border border-line text-text text-sm font-mono placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-violet focus:border-brand-violet transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 text-muted hover:text-text p-0.5 rounded transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Tabs with Item Counts */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === "ALL"
                  ? "bg-brand-violet text-white shadow-sm"
                  : "bg-surface-2 border border-line text-muted hover:text-text"
              }`}
            >
              <span>All Rules & FAQ</span>
              <span className="text-[10px] opacity-70">({counts.ALL})</span>
            </button>

            <button
              onClick={() => setSelectedCategory("Minecraft")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === "Minecraft"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-surface-2 border border-line text-muted hover:text-text"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Minecraft Rules</span>
              <span className="text-[10px] opacity-70">({counts.Minecraft})</span>
            </button>

            <button
              onClick={() => setSelectedCategory("Discord")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === "Discord"
                  ? "bg-[#5865F2] text-white shadow-sm"
                  : "bg-surface-2 border border-line text-muted hover:text-text"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discord Rules</span>
              <span className="text-[10px] opacity-70">({counts.Discord})</span>
            </button>

            <button
              onClick={() => setSelectedCategory("Questions")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                selectedCategory === "Questions"
                  ? "bg-brand-cyan text-black shadow-sm font-bold"
                  : "bg-surface-2 border border-line text-muted hover:text-text"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Scoring</span>
              <span className="text-[10px] opacity-70">({counts.Questions})</span>
            </button>
          </div>
        </div>

        {/* Accordion Content Box */}
        <Card className="p-6">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2 font-mono text-xs text-muted">
              <p>No matching rules or questions found for &ldquo;{searchQuery}&rdquo;.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="text-brand-cyan hover:underline"
              >
                Reset search and filters
              </button>
            </div>
          ) : (
            <Accordion type="multiple" className="w-full space-y-3">
              {filteredItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  id={item.id}
                  className="border-line/60 py-1"
                >
                  <AccordionTrigger className="text-left font-heading font-bold text-base text-text hover:text-brand-cyan hover:no-underline transition-colors py-3">
                    <div className="flex items-center gap-2.5 flex-1 pr-2">
                      <Hash className="w-3.5 h-3.5 text-muted opacity-40 shrink-0" />
                      <span className="flex-1">{item.question}</span>
                      {item.tag && (
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                          item.category === "Minecraft"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : item.category === "Discord"
                            ? "bg-[#5865F2]/10 border-[#5865F2]/30 text-[#8ea1e1]"
                            : "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan"
                        }`}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-4 text-sm text-muted leading-relaxed space-y-3">
                    <p>{item.answer}</p>

                    {item.points && (
                      <div className="p-3.5 rounded-xl bg-surface-2 border border-line space-y-2 mt-2">
                        {item.points.map((pt, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-xs font-mono text-text">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </Card>

        {previewMode && (
          <div className="text-center pt-1">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-brand-cyan hover:underline"
            >
              Looking for full rules? Open the comprehensive {FAQ_ITEMS.length}-rulebook page →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
