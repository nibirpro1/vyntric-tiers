"use client";

import React, { useEffect, useState, useCallback } from "react";

interface Spark {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  rotation: number;
}

interface ClickWave {
  id: string;
  x: number;
  y: number;
  color: string;
  sparks: Spark[];
}

const COLOR_PALETTE = [
  "#22D3EE", // Cyber Cyan
  "#FF2D55", // Vyntric Crimson
  "#F59E0B", // Gold Trophy
  "#818CF8", // Electric Violet
  "#10B981", // Emerald
  "#EC4899", // Neon Ruby
];

export function ClickFeedback() {
  const [waves, setWaves] = useState<ClickWave[]>([]);

  const handlePointerDown = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Trigger on any clickable or interactive element
    const interactive = target.closest(
      'button, a, [role="button"], input, select, textarea, .card-solid, [data-interactive="true"], [tabindex]'
    );
    if (!interactive) return;

    const baseColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const waveId = `${Date.now()}-${Math.random()}`;

    // Generate 10-14 directional sparks bursting outward like Minecraft critical hit / cyber particles
    const sparkCount = 12;
    const sparks: Spark[] = [];

    for (let i = 0; i < sparkCount; i++) {
      const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
      const speed = 36 + Math.random() * 50; // distance in px
      const color =
        Math.random() > 0.35
          ? baseColor
          : COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];

      sparks.push({
        id: `s-${i}`,
        x: e.clientX,
        y: e.clientY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 3.5,
        rotation: Math.random() * 360,
      });
    }

    const newWave: ClickWave = {
      id: waveId,
      x: e.clientX,
      y: e.clientY,
      color: baseColor,
      sparks,
    };

    setWaves((prev) => [...prev.slice(-6), newWave]);

    setTimeout(() => {
      setWaves((prev) => prev.filter((w) => w.id !== waveId));
    }, 650);
  }, []);

  useEffect(() => {
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [handlePointerDown]);

  if (waves.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none">
      {waves.map((w) => (
        <React.Fragment key={w.id}>
          {/* 1. Luminous Inner Expanding Shockwave Ring */}
          <div
            className="absolute rounded-full pointer-events-none animate-cyber-shockwave"
            style={{
              left: w.x,
              top: w.y,
              borderColor: w.color,
              boxShadow: `0 0 22px ${w.color}, inset 0 0 10px ${w.color}60`,
            }}
          />

          {/* 2. Outer Ambient Secondary Shockwave */}
          <div
            className="absolute rounded-full pointer-events-none animate-cyber-ripple"
            style={{
              left: w.x,
              top: w.y,
              borderColor: `${w.color}50`,
            }}
          />

          {/* 3. Minecraft PvP Critical Hit / Cyber Energy Sparks */}
          {w.sparks.map((s) => (
            <div
              key={s.id}
              className="absolute pointer-events-none animate-spark-fly"
              style={
                {
                  left: s.x,
                  top: s.y,
                  width: `${s.size}px`,
                  height: `${s.size}px`,
                  backgroundColor: s.color,
                  borderRadius: s.size > 5 ? "1px" : "9999px",
                  boxShadow: `0 0 12px ${s.color}, 0 0 4px #ffffff`,
                  "--dx": `${s.dx}px`,
                  "--dy": `${s.dy}px`,
                  "--rot": `${s.rotation}deg`,
                } as React.CSSProperties
              }
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
