"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { TestRecord, KitId, Result } from "@/lib/types";
import { RECENT_TESTS, PLAYERS, MEMBERS } from "@/lib/data";
import { KITS } from "@/lib/data";
import { ALL_TIERS } from "@/lib/tiers";

import { useUIStore } from "@/lib/store";

export function useLiveFeed(initialTests: TestRecord[] = RECENT_TESTS) {
  const pathname = usePathname();
  const { liveRecentTests } = useUIStore();
  const [tests, setTests] = useState<TestRecord[]>(initialTests);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [newestId, setNewestId] = useState<string | null>(null);

  // Sync any live tests pushed from Supabase Realtime
  useEffect(() => {
    if (liveRecentTests.length > 0) {
      setTests((prev) => {
        const ids = new Set(liveRecentTests.map((t) => t.id));
        return [...liveRecentTests, ...prev.filter((t) => !ids.has(t.id))].slice(0, 60);
      });
      setNewestId(liveRecentTests[0].id);
      setTimeout(() => setNewestId(null), 3000);
    }
  }, [liveRecentTests]);

  const testCounterRef = useRef(1000);

  useEffect(() => {
    if (!isLive) return;

    // Disabled on reduced motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Interval every 28 seconds
    const interval = setInterval(() => {
      // Pick a random player, tester, and kit
      const randomPlayer = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
      const eligibleTesters = MEMBERS.filter(
        (m) => m.role.includes("Tester") || m.role === "Admin" || m.role === "Owner"
      );
      const randomTester =
        eligibleTesters[Math.floor(Math.random() * eligibleTesters.length)];
      const randomKit = KITS[Math.floor(Math.random() * KITS.length)].id;

      const randomTier = ALL_TIERS[Math.floor(Math.random() * (ALL_TIERS.length - 2))];
      const results: Result[] = ["promoted", "retained", "demoted"];
      const result = results[Math.floor(Math.random() * results.length)];
      const scores = ["5–3", "5–2", "5–4", "5–1", "5–0"];
      const score = scores[Math.floor(Math.random() * scores.length)];

      const newId = `live-test-${testCounterRef.current++}`;
      const newTest: TestRecord = {
        id: newId,
        playerId: randomPlayer.id,
        playerUsername: randomPlayer.username,
        testerId: randomTester.id,
        testerUsername: randomTester.name,
        kit: randomKit,
        previousTier: "HT3",
        newTier: randomTier,
        result,
        score,
        durationSec: 180 + Math.floor(Math.random() * 300),
        timestamp: new Date().toISOString(),
      };

      setTests((prev) => [newTest, ...prev.slice(0, 59)]);
      setNewestId(newId);

      // Only show live toast notifications on the /tests page
      if (pathname === "/tests") {
        toast.info(
          `⚔️ New verified test: ${randomPlayer.username} scored ${score} in ${randomKit}`,
          { duration: 3500 }
        );
      }

      // Reset newest highlight after 2.5s
      setTimeout(() => {
        setNewestId(null);
      }, 2500);
    }, 28000);

    return () => clearInterval(interval);
  }, [isLive, pathname]);

  return {
    tests,
    isLive,
    setIsLive,
    newestId,
  };
}
