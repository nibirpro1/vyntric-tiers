import { Region } from "./types.js";

export interface RegionMeta {
  id: Region;
  name: string;
  flag: string;
  color: string;
}

export const REGIONS: RegionMeta[] = [
  { id: "NA", name: "North America", flag: "🇺🇸", color: "#38BDF8" },
  { id: "EU", name: "Europe", flag: "🇪🇺", color: "#FBBF24" },
  { id: "AS", name: "Asia", flag: "🇸🇬", color: "#A855F7" },
  { id: "AU", name: "Oceania", flag: "🇦🇺", color: "#FB923C" },
  { id: "SA", name: "South America", flag: "🇧🇷", color: "#34D399" },
  { id: "AF", name: "Africa", flag: "🇿🇦", color: "#EC4899" },
];

export const REGION_MAP: Record<Region, RegionMeta> = REGIONS.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {} as Record<Region, RegionMeta>);

export const REGION_COLORS: Record<Region, string> = {
  NA: "#38BDF8",
  EU: "#FBBF24",
  AS: "#A855F7",
  AU: "#FB923C",
  SA: "#34D399",
  AF: "#EC4899",
};

export function parseRegion(input: string): Region | null {
  const normalized = input.toUpperCase().trim();
  if (normalized in REGION_MAP) return normalized as Region;
  return null;
}
