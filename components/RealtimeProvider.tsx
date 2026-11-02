"use client";

import { useRealtimeTiers } from "@/hooks/useRealtimeTiers";

export function RealtimeProvider() {
  useRealtimeTiers();
  return null;
}
