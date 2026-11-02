export interface MojangProfile {
  id: string; // raw uuid
  name: string; // exact capitalization
}

export class MojangService {
  private static cache = new Map<string, { profile: MojangProfile; expiresAt: number }>();

  public static async fetchProfile(ign: string): Promise<MojangProfile | null> {
    const key = ign.toLowerCase();
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.profile;
    }

    try {
      const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(ign)}`, {
        headers: { "User-Agent": "VyntricTiersBot/1.0" },
      });

      if (response.status === 204 || response.status === 404) {
        return null;
      }

      if (!response.ok) {
        console.warn(`Mojang API responded with HTTP ${response.status}`);
        return null;
      }

      const data = (await response.json()) as MojangProfile;
      this.cache.set(key, { profile: data, expiresAt: Date.now() + 1000 * 60 * 30 }); // 30 min cache
      return data;
    } catch (err) {
      console.error("Mojang API request failed:", err);
      // Fallback: If network is offline, mock profile for development
      return {
        id: "00000000000000000000000000000000",
        name: ign,
      };
    }
  }

  public static formatUuid(rawId: string): string {
    if (rawId.length !== 32) return rawId;
    return `${rawId.substring(0, 8)}-${rawId.substring(8, 12)}-${rawId.substring(12, 16)}-${rawId.substring(16, 20)}-${rawId.substring(20)}`;
  }
}
