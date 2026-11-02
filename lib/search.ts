import { Player } from "./types";
import { GAMEMODE_MAP } from "./tiers";

// Damerau-Levenshtein distance calculation (handles insertions, deletions, substitutions, and transpositions)
export function damerauLevenshtein(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];
  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[al][bl];
}

export interface SearchResult {
  player: Player;
  score: number;
  matchType: "exact" | "prefix" | "substring" | "fuzzy" | "region" | "kit" | "title";
  matchedField?: string;
  suggestedName?: string;
}

export function searchPlayers(query: string, players: Player[]): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResult[] = [];

  for (const player of players) {
    const ign = player.username.toLowerCase();
    const region = player.region.toLowerCase();
    const title = (player.combatTitle || "").toLowerCase();

    // 1. Exact IGN match
    if (ign === q) {
      results.push({ player, score: 1000, matchType: "exact" });
      continue;
    }

    // 2. Prefix IGN match
    if (ign.startsWith(q)) {
      results.push({ player, score: 800 + (q.length / ign.length) * 50, matchType: "prefix" });
      continue;
    }

    // 3. Substring IGN match
    if (ign.includes(q)) {
      results.push({ player, score: 600 + (q.length / ign.length) * 40, matchType: "substring" });
      continue;
    }

    // 4. Subsequence IGN match (all query characters appear in order in IGN)
    let qIdx = 0;
    for (let i = 0; i < ign.length && qIdx < q.length; i++) {
      if (ign[i] === q[qIdx]) qIdx++;
    }
    if (qIdx === q.length && q.length >= 3) {
      results.push({ player, score: 450 + (q.length / ign.length) * 30, matchType: "fuzzy" });
      continue;
    }

    // 5. Damerau-Levenshtein sliding window match (catches typos like "marlwo" -> "marlowww")
    const qLen = q.length;
    let minDistance = 999;
    
    // Check against full username and sliding substrings of similar length
    const candidateStrings = [ign];
    for (const w of [qLen - 1, qLen, qLen + 1, qLen + 2]) {
      if (w <= 1 || w > ign.length) continue;
      for (let s = 0; s <= ign.length - w; s++) {
        candidateStrings.push(ign.substring(s, s + w));
      }
    }

    for (const candidate of candidateStrings) {
      const dist = damerauLevenshtein(q, candidate);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }

    if (minDistance <= 1 && qLen >= 3) {
      results.push({
        player,
        score: 350 - minDistance * 40,
        matchType: "fuzzy",
        suggestedName: player.username,
      });
      continue;
    }

    if (minDistance <= 2 && qLen >= 5) {
      results.push({
        player,
        score: 250 - minDistance * 30,
        matchType: "fuzzy",
        suggestedName: player.username,
      });
      continue;
    }

    // 6. Region search (e.g. "eu", "na", "as", "asia", "europe")
    if (region === q || (q === "europe" && region === "eu") || (q === "america" && (region === "na" || region === "sa"))) {
      results.push({ player, score: 200, matchType: "region", matchedField: `Region: ${player.region}` });
      continue;
    }

    // 7. Title search (e.g. "grandmaster", "master", "cadet")
    if (title.includes(q) && q.length >= 3) {
      results.push({ player, score: 180, matchType: "title", matchedField: `Title: ${player.combatTitle}` });
      continue;
    }

    // 8. Gamemode / Kit search (e.g. "sword", "potion", "crystal", "uhc", "mace")
    for (const [kitKey, kitData] of Object.entries(player.kits || {})) {
      if (!kitData || !kitData.tier || kitData.tier === "Unranked") continue;
      const kitDef = (GAMEMODE_MAP as Record<string, any>)[kitKey.toLowerCase()];
      const kitName = (kitDef?.name || kitKey).toLowerCase();
      if (kitName.includes(q) && q.length >= 3) {
        results.push({
          player,
          score: 150 + (kitData.tier.startsWith("HT") ? 20 : 0),
          matchType: "kit",
          matchedField: `${kitDef?.name || kitKey}: ${kitData.tier}`,
        });
        break;
      }
    }
  }

  // Sort by highest match score, then by global rank ascending
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.player.globalRank || 999) - (b.player.globalRank || 999);
  });

  return results;
}
