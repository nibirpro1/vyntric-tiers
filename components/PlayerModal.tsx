"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { PLAYERS } from "@/lib/data";
import { PlayerProfileModal } from "./PlayerProfileModal";

export function PlayerModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedPlayer, selectedKit, setSelectedPlayer } = useUIStore();

  // Read ?player= query parameter on initial load or URL change
  useEffect(() => {
    const playerParam = searchParams.get("player");
    if (playerParam && (!selectedPlayer || selectedPlayer.username.toLowerCase() !== playerParam.toLowerCase())) {
      const found = PLAYERS.find(
        (p) => p.username.toLowerCase() === playerParam.toLowerCase() || p.id === playerParam
      );
      if (found) {
        setSelectedPlayer(found);
      }
    }
  }, [searchParams, selectedPlayer, setSelectedPlayer]);

  const handleClose = React.useCallback(() => {
    setSelectedPlayer(null);
    // Remove ?player= query parameter cleanly
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.delete("player");
      const query = params.toString() ? `?${params.toString()}` : "";
      router.replace(`${window.location.pathname}${query}`, { scroll: false });
    }
  }, [router, setSelectedPlayer]);

  return <PlayerProfileModal player={selectedPlayer} initialKit={selectedKit} onClose={handleClose} />;
}
