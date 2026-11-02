import { ImageResponse } from "next/og";
import { getPlayerByUsername } from "@/lib/data";
import { getTitle } from "@/lib/tiers";

export const runtime = "edge";
export const alt = "Vyntric Player Profile Card";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { ign: string } }) {
  const ign = params.ign;
  const player = getPlayerByUsername(ign);

  const username = player ? player.username : ign;
  const rank = player ? `#${player.globalRank}` : "UNRANKED";
  const points = player ? `${player.points} PTS` : "0 PTS";
  const title = player ? getTitle(player.points).name : "Unranked";
  const region = player ? player.region : "NA";
  const firstKit = player ? Object.values(player.kits)[0] : undefined;
  const peak = firstKit ? firstKit.peakTier : "Unranked";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#05060A",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.25) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.2) 0%, transparent 60%)",
          padding: "60px 80px",
          color: "#E8EAF2",
          fontFamily: "sans-serif",
          border: "2px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#7C3AED",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "900",
                fontSize: "24px",
                color: "#FFFFFF",
              }}
            >
              V
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "20px", fontWeight: "900", letterSpacing: "0.1em", color: "#FFFFFF" }}>
                VYNTRIC TIERS
              </span>
              <span style={{ fontSize: "12px", letterSpacing: "0.15em", color: "#8A91A6" }}>
                RANKED · TESTED · VERIFIED
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "14px",
              fontWeight: "700",
              color: "#22D3EE",
            }}
          >
            REGION: {region}
          </div>
        </div>

        {/* Center Player Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          {/* Avatar Face */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/avatar/${username}/128`}
            alt={username}
            width={128}
            height={128}
            style={{
              borderRadius: "24px",
              border: "3px solid #7C3AED",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "56px", fontWeight: "900", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                {username}
              </span>
              <div
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(124, 58, 237, 0.2)",
                  border: "1px solid rgba(124, 58, 237, 0.4)",
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#A78BFA",
                }}
              >
                {title}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "24px", fontSize: "20px", color: "#8A91A6" }}>
              <span style={{ color: "#22D3EE", fontWeight: "700" }}>GLOBAL STANDING: {rank}</span>
              <span>•</span>
              <span style={{ color: "#E8EAF2", fontWeight: "700" }}>{points}</span>
              <span>•</span>
              <span>ALL-TIME PEAK: {peak}</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "24px",
            fontSize: "15px",
            color: "#8A91A6",
          }}
        >
          <span>Official 1v1 First-to-5 Minecraft PvP Ladder Record</span>
          <span style={{ color: "#22D3EE" }}>vyntric.gg/player/{username.toLowerCase()}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
