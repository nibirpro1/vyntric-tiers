"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import { useUIStore } from "@/lib/store";
import { TestRecord, KitId, Tier } from "@/lib/types";
import { TIER_COLORS } from "@/lib/tiers";

export function useRealtimeTiers() {
  const {
    addLiveTest,
    setFlyingPlayerId,
    setActiveTestersCount,
    setWaitingQueueCount,
  } = useUIStore();

  useEffect(() => {
    // 1. If Supabase Realtime is configured
    if (supabase) {
      const channel = supabase
        .channel("vyntric_realtime")
        // Listen to Test inserts
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "Test" },
          (payload) => {
            const row = payload.new as any;
            handleIncomingTest({
              id: row.id,
              playerId: row.playerId,
              playerUsername: row.playerIgn || "Player",
              testerId: row.testerId,
              testerUsername: row.testerName || "Vyntric Tester",
              kit: (row.kit.charAt(0).toUpperCase() + row.kit.slice(1).toLowerCase()) as KitId,
              previousTier: row.previousTier as Tier | null,
              newTier: row.newTier as Tier,
              result: row.result.toLowerCase() as any,
              score: row.score,
              durationSec: row.durationSec || 600,
              timestamp: new Date().toISOString(),
              notes: row.notes,
            });
          }
        )
        // Listen to Tester updates
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "Tester" },
          () => {
            // Refetch active testers count
            fetch("/api/stats")
              .then((res) => res.json())
              .then((data) => {
                if (data?.stats?.activeTesters !== undefined) {
                  setActiveTestersCount(data.stats.activeTesters);
                }
              })
              .catch(() => null);
          }
        )
        // Listen to Queue updates
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "QueueEntry" },
          () => {
            fetch("/api/queue")
              .then((res) => res.json())
              .then((data) => {
                if (data?.totalWaiting !== undefined) {
                  setWaitingQueueCount(data.totalWaiting);
                }
              })
              .catch(() => null);
          }
        )
        // Listen to custom broadcast events
        .on("broadcast", { event: "test_completed" }, (event) => {
          const p = event.payload;
          if (p) {
            handleIncomingTest({
              id: p.testId || String(Date.now()),
              playerId: p.playerIgn,
              playerUsername: p.playerIgn,
              testerId: "tester",
              testerUsername: "Vyntric Tester",
              kit: (p.kit.charAt(0).toUpperCase() + p.kit.slice(1).toLowerCase()) as KitId,
              previousTier: p.previousTier,
              newTier: p.newTier,
              result: p.result.toLowerCase(),
              score: p.score || "5-3",
              durationSec: 600,
              timestamp: new Date().toISOString(),
            });
          }
        })
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }

    // Function to handle verified test notifications and animations
    function handleIncomingTest(test: TestRecord) {
      addLiveTest(test);
      setFlyingPlayerId(test.playerUsername);

      const isTopTier = test.newTier === "HT1" || test.newTier === "LT1";

      // Confetti burst on top tier promotion!
      if (isTopTier) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#FF2D55", "#22D3EE", "#7C3AED", "#FFB020"],
          });
        } catch {}
      }

      // Live Toast Notification
      const color = TIER_COLORS[test.newTier] || "#7C3AED";
      toast(
        `⚔️ ${test.playerUsername} placed into ${test.kit} ${test.newTier}!`,
        {
          description: `${test.score} vs ${test.testerUsername} • Verified Duel`,
          style: {
            borderColor: color,
            boxShadow: `0 0 16px ${color}33`,
          },
        }
      );

      // Reset flying state after 3 seconds
      setTimeout(() => {
        setFlyingPlayerId(null);
      }, 3500);
    }
  }, [addLiveTest, setFlyingPlayerId, setActiveTestersCount, setWaitingQueueCount]);
}
