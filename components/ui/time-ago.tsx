"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";

interface TimeAgoProps {
  date: string | Date;
  className?: string;
}

export function TimeAgo({ date, className = "" }: TimeAgoProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    try {
      const d = typeof date === "string" ? parseISO(date) : date;
      setFormatted(formatDistanceToNow(d, { addSuffix: true }));
    } catch {
      setFormatted("recently");
    }
  }, [date]);

  // If not mounted yet, render an unobtrusive fallback or static placeholder to prevent hydration mismatch
  if (!formatted) {
    return (
      <span className={`text-muted font-mono text-xs tabular-nums ${className}`}>
        --
      </span>
    );
  }

  return (
    <span className={`text-muted font-mono text-xs tabular-nums ${className}`} title={String(date)}>
      {formatted}
    </span>
  );
}
