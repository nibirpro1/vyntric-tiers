"use client";

import { create } from "zustand";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { KitId, Region, Tier, Player, FilterState } from "./types";

interface UIStoreState {
  // Filters
  filters: FilterState;
  setKit: (kit: KitId | "ALL") => void;
  setRegion: (region: Region | "ALL") => void;
  setTier: (tier: Tier | "ALL") => void;
  setQuery: (query: string) => void;
  setSort: (sort: FilterState["sort"]) => void;
  setView: (view: FilterState["view"]) => void;
  resetFilters: () => void;

  // Info modal (Points & Titles)
  infoModalOpen: boolean;
  setInfoModalOpen: (open: boolean) => void;

  // Selected player modal
  selectedPlayer: Player | null;
  selectedKit: string | null;
  setSelectedPlayer: (player: Player | null, kit?: string | null) => void;

  // Command palette
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  // Mobile menu
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Motion & Animation prefs
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;

  // Ambient Audio Persistence
  audioMuted: boolean;
  setAudioMuted: (muted: boolean) => void;
  audioVolume: number;
  setAudioVolume: (volume: number) => void;

  // Preloader gate
  preloaderDone: boolean;
  setPreloaderDone: (done: boolean) => void;

  // Real-time live synchronization state
  liveRecentTests: import("./types").TestRecord[];
  addLiveTest: (test: import("./types").TestRecord) => void;
  flyingPlayerId: string | null;
  setFlyingPlayerId: (id: string | null) => void;
  activeTestersCount: number;
  setActiveTestersCount: (count: number) => void;
  waitingQueueCount: number;
  setWaitingQueueCount: (count: number) => void;
}

const DEFAULT_FILTERS: FilterState = {
  kit: "Sword",
  region: "ALL",
  tier: "ALL",
  query: "",
  sort: "rank",
  view: "rows",
};

export const useUIStore = create<UIStoreState>((set) => ({
  filters: DEFAULT_FILTERS,
  setKit: (kit) => set((s) => ({ filters: { ...s.filters, kit } })),
  setRegion: (region) => set((s) => ({ filters: { ...s.filters, region } })),
  setTier: (tier) => set((s) => ({ filters: { ...s.filters, tier } })),
  setQuery: (query) => set((s) => ({ filters: { ...s.filters, query } })),
  setSort: (sort) => set((s) => ({ filters: { ...s.filters, sort } })),
  setView: (view) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vyntric_view", view);
      } catch {}
    }
    set((s) => ({ filters: { ...s.filters, view } }));
  },
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  infoModalOpen: false,
  setInfoModalOpen: (open) => set({ infoModalOpen: open }),

  selectedPlayer: null,
  selectedKit: null,
  setSelectedPlayer: (player, kit = null) => set({ selectedPlayer: player, selectedKit: kit }),

  commandOpen: false,
  setCommandOpen: (open) => set({ commandOpen: open }),

  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

  reducedMotion: false,
  setReducedMotion: (reduced) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vyntric_reduced_motion", reduced ? "1" : "0");
      } catch {}
    }
    set({ reducedMotion: reduced });
  },

  preloaderDone: false,
  setPreloaderDone: (done) => set({ preloaderDone: done }),

  liveRecentTests: [],
  addLiveTest: (test) =>
    set((s) => ({
      liveRecentTests: [test, ...s.liveRecentTests.filter((t) => t.id !== test.id)].slice(0, 30),
    })),
  flyingPlayerId: null,
  setFlyingPlayerId: (id) => set({ flyingPlayerId: id }),
  activeTestersCount: 3,
  setActiveTestersCount: (count) => set({ activeTestersCount: count }),
  waitingQueueCount: 0,
  setWaitingQueueCount: (count) => set({ waitingQueueCount: count }),

  audioMuted: typeof window !== "undefined" && localStorage.getItem("vyntric_audio_muted") === "true",
  setAudioMuted: (muted) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vyntric_audio_muted", muted ? "true" : "false");
      } catch {}
    }
    set({ audioMuted: muted });
  },

  audioVolume: typeof window !== "undefined" && localStorage.getItem("vyntric_audio_volume") !== null
    ? parseFloat(localStorage.getItem("vyntric_audio_volume") || "0.9")
    : 0.9,
  setAudioVolume: (volume) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("vyntric_audio_volume", volume.toString());
      } catch {}
    }
    set({ audioVolume: volume });
  },
}));

/**
 * Custom hook to synchronize filters ⇄ URL search params
 * Handles bidirectional update without flicker or hydration mismatches.
 */
export function useFilterUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { filters, setKit, setRegion, setTier, setQuery, setSort, setView } =
    useUIStore();

  const isInitialMount = useRef(true);

  // Read URL into store on initial mount
  useEffect(() => {
    if (!isInitialMount.current || !searchParams) return;
    isInitialMount.current = false;

    const kitParam = searchParams.get("kit") as KitId | null;
    const regionParam = searchParams.get("region") as Region | null;
    const tierParam = searchParams.get("tier") as Tier | null;
    const qParam = searchParams.get("q");
    const sortParam = searchParams.get("sort") as FilterState["sort"] | null;
    const viewParam = searchParams.get("view") as FilterState["view"] | null;

    if (kitParam) setKit(kitParam);
    if (regionParam) setRegion(regionParam);
    if (tierParam) setTier(tierParam);
    if (qParam !== null) setQuery(qParam);
    if (sortParam) setSort(sortParam);
    if (viewParam) setView(viewParam);
  }, [searchParams, setKit, setRegion, setTier, setQuery, setSort, setView]);

  // Sync store changes back to URL
  useEffect(() => {
    // Only sync on relevant pages
    if (pathname !== "/tierlist" && pathname !== "/leaderboard") return;

    const params = new URLSearchParams();
    if (filters.kit !== "Sword") params.set("kit", filters.kit);
    if (filters.region !== "ALL") params.set("region", filters.region);
    if (filters.tier !== "ALL") params.set("tier", filters.tier);
    if (filters.query) params.set("q", filters.query);
    if (filters.sort !== "rank") params.set("sort", filters.sort);
    if (filters.view !== "rows") params.set("view", filters.view);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, pathname, router]);
}
