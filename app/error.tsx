"use client";

import { useEffect } from "react";
import { GlowButton } from "@/components/ui/glow-button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error("Vyntric system error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="card-solid max-w-md w-full p-8 text-center border-line">
        <span className="micro-label text-brand-hot font-bold tracking-widest block mb-2">
          CLIENT EXCEPTION · PACKET DESYNC
        </span>
        <h2 className="font-heading font-extrabold text-2xl text-text mb-3">
          The arena connection dropped.
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-6">
          We caught an unhandled render exception. Either your client lost sync
          with our route handler or the server node reset during a test update.
        </p>
        <div className="flex gap-3 justify-center">
          <GlowButton variant="outline" size="sm" onClick={() => reset()}>
            Retry Connection
          </GlowButton>
          <GlowButton
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/")}
          >
            Return to Arena
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
