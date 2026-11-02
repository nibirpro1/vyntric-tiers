"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { toast } from "sonner";
import { History, Sparkles, Swords, ExternalLink, Copy } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useUIStore } from "@/lib/store";
import { PLAYERS, KITS } from "@/lib/data";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { KitIcon } from "@/components/icons/kit-icons";
import { RegionPill } from "@/components/icons/region-pill";
import { SITE_CONFIG } from "@/lib/site";

export function CommandPalette() {
  const router = useRouter();
  const { commandOpen, setCommandOpen, setSelectedPlayer } = useUIStore();
  const [search, setSearch] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("vyntric_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 4));
      }
    } catch {}
  }, [commandOpen]);

  const saveRecentSearch = (term: string) => {
    try {
      const clean = term.trim();
      if (!clean) return;
      const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("vyntric_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const fusePlayers = useMemo(() => {
    return new Fuse(PLAYERS, {
      keys: ["username"],
      threshold: 0.35,
    });
  }, []);

  const fuseKits = useMemo(() => {
    return new Fuse(KITS, {
      keys: ["name", "shortDesc"],
      threshold: 0.3,
    });
  }, []);

  // Global keyboard shortcuts: Cmd+K / Ctrl+K and /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "TEXTAREA"].includes(
        (e.target as HTMLElement)?.tagName
      );
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !isInput)) {
        e.preventDefault();
        setCommandOpen(!commandOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandOpen, setCommandOpen]);

  const filteredPlayers = useMemo(() => {
    if (!search.trim()) return PLAYERS.slice(0, 5);
    return fusePlayers.search(search.trim()).map((res) => res.item).slice(0, 8);
  }, [search, fusePlayers]);

  const filteredKits = useMemo(() => {
    if (!search.trim()) return KITS.slice(0, 4);
    return fuseKits.search(search.trim()).map((res) => res.item);
  }, [search, fuseKits]);

  const handleCopyDiscord = () => {
    navigator.clipboard.writeText(SITE_CONFIG.links.discord);
    toast.success("Discord invite link copied to clipboard!");
    setCommandOpen(false);
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput
        placeholder="Type combatant IGN, kit ladder, or action..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No combatants, ladders, or commands found.</CommandEmpty>

        {/* Recent Searches (when search query is empty) */}
        {!search && recentSearches.length > 0 && (
          <CommandGroup heading="RECENT SEARCHES">
            {recentSearches.map((term) => (
              <CommandItem
                key={term}
                value={`recent-${term}`}
                onSelect={() => setSearch(term)}
                className="flex items-center gap-2"
              >
                <History className="w-3.5 h-3.5 text-muted" />
                <span>{term}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Players Group */}
        <CommandGroup heading={`PLAYERS (${filteredPlayers.length})`}>
          {filteredPlayers.map((player) => (
            <CommandItem
              key={player.id}
              value={player.username}
              onSelect={() => {
                saveRecentSearch(player.username);
                setCommandOpen(false);
                setSelectedPlayer(player);
                router.push(`/player/${player.username}`);
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <PlayerAvatar username={player.username} size={22} />
                <span className="font-semibold text-text">{player.username}</span>
                <RegionPill region={player.region} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted font-mono">
                  {player.points} pts
                </span>
                <span className="text-brand-hot text-[11px] font-mono font-bold">
                  #{player.globalRank}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Kit Ladders Group */}
        <CommandGroup heading="KIT LADDERS">
          {filteredKits.map((kit) => (
            <CommandItem
              key={kit.id}
              value={kit.name}
              onSelect={() => {
                saveRecentSearch(kit.name);
                setCommandOpen(false);
                router.push(`/tierlist?kit=${kit.id}`);
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <KitIcon kit={kit.id} size={18} className="text-brand-cyan" />
                <span className="font-semibold text-text">{kit.name} Ladder</span>
              </div>
              <span className="text-[10px] text-muted font-mono">
                View Standings →
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Navigation Pages */}
        <CommandGroup heading="PAGES">
          <CommandItem
            value="tier lists"
            onSelect={() => {
              setCommandOpen(false);
              router.push("/tierlist");
            }}
          >
            <Swords className="w-3.5 h-3.5 mr-2 text-brand-cyan" />
            <span>Official Kit Tier Lists</span>
          </CommandItem>
          <CommandItem
            value="leaderboard"
            onSelect={() => {
              setCommandOpen(false);
              router.push("/leaderboard");
            }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-400" />
            <span>Global Standings & Hall of Fame</span>
          </CommandItem>
          <CommandItem
            value="recent tests dispatch"
            onSelect={() => {
              setCommandOpen(false);
              router.push("/tests");
            }}
          >
            <span>📋 Council Test Dispatch Feed</span>
          </CommandItem>
          <CommandItem
            value="staff testers members"
            onSelect={() => {
              setCommandOpen(false);
              router.push("/team");
            }}
          >
            <span>🛡️ Accredited Council Members</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Actions Group */}
        <CommandGroup heading="ACTIONS">
          <CommandItem value="apply get tested" onSelect={() => {
            setCommandOpen(false);
            router.push("/apply");
          }}>
            <ExternalLink className="w-3.5 h-3.5 mr-2 text-brand-violet" />
            <span>Apply for Official Tier Test</span>
          </CommandItem>
          <CommandItem value="copy discord invite" onSelect={handleCopyDiscord}>
            <Copy className="w-3.5 h-3.5 mr-2 text-[#5865F2]" />
            <span>Copy Discord Community Invite</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
