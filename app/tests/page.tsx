"use client";

import React from "react";
import { RecentTestsSection } from "@/components/sections/RecentTestsSection";
import { RECENT_TESTS, PLAYERS } from "@/lib/data";
import { useUIStore } from "@/lib/store";

export default function TestsPage() {
  const { setSelectedPlayer } = useUIStore();

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <RecentTestsSection
        tests={RECENT_TESTS}
        players={PLAYERS}
        onSelectPlayer={(player) => setSelectedPlayer(player)}
      />
    </div>
  );
}
