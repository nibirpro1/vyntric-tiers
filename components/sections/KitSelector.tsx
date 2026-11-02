"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { KitIcon } from "@/components/icons/kit-icons";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { SectionTitle } from "@/components/ui/section-title";
import { useUIStore } from "@/lib/store";
import { KITS, getKitStats } from "@/lib/data";
import { KitId } from "@/lib/tiers";
import { cn } from "@/lib/utils";

interface KitItem {
  id: KitId | "ALL";
  name: string;
  shortDesc: string;
  accentColor: string;
  playerCount: number;
  topPlayerName?: string;
}

export function KitSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { filters, setKit } = useUIStore();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [mousePos, setMousePos] = useState<Record<string, { x: number; y: number }>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Build items list with "All Kits" prepended
  const kitItems: KitItem[] = [
    {
      id: "ALL",
      name: "All Ladders",
      shortDesc: "Complete competitive overview across all 9 standard gamemode disciplines.",
      accentColor: "#7C3AED",
      playerCount: 60,
      topPlayerName: "Zephyrr",
    },
    ...KITS.map((k) => {
      const stats = getKitStats(k.id);
      return {
        id: k.id,
        name: k.name,
        shortDesc: k.shortDesc,
        accentColor: k.accentColor,
        playerCount: stats.totalRanked,
        topPlayerName: stats.topPlayer?.username,
      };
    }),
  ];

  // Check scroll position
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const node = scrollContainerRef.current;
    if (!node) return;
    node.addEventListener("scroll", updateScrollButtons, { passive: true });
    return () => node.removeEventListener("scroll", updateScrollButtons);
  }, []);

  const scrollBy = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const handleCardMouseMove = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos((prev) => ({ ...prev, [id]: { x, y } }));
  };

  const handleCardMouseLeave = (id: string) => {
    setMousePos((prev) => ({ ...prev, [id]: { x: 0, y: 0 } }));
  };

  const handleSelectKit = (id: KitId | "ALL") => {
    setKit(id);
    if (pathname === "/" || pathname === "/tierlist") {
      // Update URL query parameter
      const params = new URLSearchParams(window.location.search);
      if (id === "ALL") {
        params.delete("kit");
      } else {
        params.set("kit", id);
      }
      const query = params.toString() ? `?${params.toString()}` : "";

      if (pathname === "/") {
        // Smooth scroll to tier list section on homepage
        const target = document.getElementById("tierlist");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        } else {
          router.push(`/tierlist${query}`);
        }
      } else {
        router.replace(`${pathname}${query}`, { scroll: false });
      }
    } else {
      router.push(`/tierlist?kit=${id}`);
    }
  };

  return (
    <section id="kits" className="w-full space-y-6 pt-4 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="SELECT COMPETITIVE DISCIPLINE"
          title="Gamemode Ladders"
          description="Browse player distributions, peak holders, and verified tier brackets for each kit."
          rightSlot={
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scrollBy(-320)}
                disabled={!canScrollLeft}
                className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface border border-line flex items-center justify-center text-muted hover:text-text disabled:opacity-40 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollBy(320)}
                disabled={!canScrollRight}
                className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-surface border border-line flex items-center justify-center text-muted hover:text-text disabled:opacity-40 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          }
        />
      </div>

      {/* 3D-feeling Horizontal Carousel Container */}
      <div className="relative w-full">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 py-6 snap-x snap-mandatory scrollbar-none [perspective:1000px]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {kitItems.map((item, idx) => {
            const isActive = filters.kit === item.id;
            const tilt = mousePos[item.id] || { x: 0, y: 0 };
            const rotateX = tilt.y * -14;
            const rotateY = tilt.x * 14;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectKit(item.id)}
                onMouseMove={(e) => handleCardMouseMove(item.id, e)}
                onMouseLeave={() => handleCardMouseLeave(item.id)}
                style={{
                  transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${
                    isActive ? 1.04 : 1
                  })`,
                  transition: "transform 0.15s ease-out, border-color 0.2s, box-shadow 0.2s",
                }}
                className={cn(
                  "snap-center shrink-0 w-64 sm:w-72 card-solid p-5 cursor-pointer relative overflow-hidden group select-none",
                  isActive
                    ? "border-brand-cyan shadow-xl shadow-brand-cyan/15 bg-surface-2"
                    : "hover:border-line-strong hover:bg-surface"
                )}
              >
                {/* Accent glow orb behind icon */}
                <div
                  className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: item.accentColor }}
                />

                <div className="flex items-start justify-between relative z-10">
                  <div
                    className={cn(
                      "p-3 rounded-xl border border-line transition-transform duration-300 group-hover:scale-110",
                      isActive ? "bg-brand-cyan/15 border-brand-cyan/40" : "bg-surface-2"
                    )}
                    style={{
                      transform: `translateY(${Math.sin(idx * 0.8) * 3}px)`,
                      color: item.accentColor,
                    }}
                  >
                    {item.id === "ALL" ? (
                      <Layers className="w-6 h-6 text-brand-violet" />
                    ) : (
                      <KitIcon kit={item.id as KitId} size={24} color={item.accentColor} />
                    )}
                  </div>

                  <span className="micro-label text-[10px] text-muted">
                    {item.playerCount} COMBATANTS
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 relative z-10">
                  <h3 className="font-heading font-bold text-lg text-text flex items-center justify-between">
                    {item.name}
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                    )}
                  </h3>
                  <p className="text-muted text-xs leading-relaxed line-clamp-2 min-h-[32px]">
                    {item.shortDesc}
                  </p>
                </div>

                {/* Top Player Indicator */}
                <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-mono relative z-10">
                  <div className="flex items-center gap-2">
                    {item.topPlayerName && (
                      <>
                        <PlayerAvatar username={item.topPlayerName} size={20} />
                        <span className="text-muted text-[11px] truncate max-w-[100px]">
                          {item.topPlayerName}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-brand-cyan group-hover:translate-x-1 transition-transform inline-flex items-center text-[11px] font-semibold">
                    View list →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
