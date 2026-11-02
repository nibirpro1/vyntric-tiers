import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VYNTRIC TIERS · Ranked. Tested. Verified.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#05060A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #7C3AED, #22D3EE)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Logo representation */}
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(135deg, #7C3AED, #22D3EE)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: "36px",
            }}
          >
            V
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                color: "#E8EAF2",
                fontSize: "44px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              VYNTRIC TIERS
            </span>
            <span
              style={{
                color: "#8A91A6",
                fontSize: "18px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              Ranked. Tested. Verified.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.1,
              maxWidth: "900px",
              letterSpacing: "-0.02em",
            }}
          >
            The Official Competitive Minecraft PvP Tier List & Testing Council.
          </h1>
          <p style={{ fontSize: "24px", color: "#8A91A6", maxWidth: "800px" }}>
            Verified 1v1 first-to-5 tests across 9 kit ladders. Strict pyramid distribution.
          </p>
        </div>

        <div style={{ display: "flex", gap: "32px", color: "#67E8F9", fontSize: "18px", fontFamily: "monospace" }}>
          <span>SWORD</span>
          <span>AXE</span>
          <span>CRYSTAL</span>
          <span>POT</span>
          <span>UHC</span>
          <span>SMP</span>
          <span>MACE</span>
          <span>DIAMOND</span>
          <span>VANILLA</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
