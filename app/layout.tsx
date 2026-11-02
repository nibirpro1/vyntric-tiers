import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, JetBrains_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/providers/SmoothScroll";
import { ThreeProvider } from "@/providers/ThreeProvider";
import { Preloader } from "@/components/Preloader";
import { RealtimeProvider } from "@/components/RealtimeProvider";
import { CommandPalette } from "@/components/CommandPalette";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClickFeedback } from "@/components/ClickFeedback";

// TODO: Clash Display local .woff2 files missing in /public/fonts, falling back to Bricolage Grotesque from next/font/google
const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vyntric.gg"),
  title: {
    default: "VYNTRIC TIERS — Ranked. Tested. Verified.",
    template: "%s · VYNTRIC TIERS",
  },
  description:
    "Official Minecraft PvP Tier Testing & Rankings Platform. Verified 1v1 first-to-5 tier tests, kit ladders, and community standings.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/logo.png",
  },
  keywords: [
    "Minecraft PvP",
    "Tier List",
    "PvP Tiers",
    "Vyntric Tiers",
    "Sword Tier",
    "Crystal Tier",
    "UHC Tier",
    "PotPvP",
  ],
  authors: [{ name: "Vyntric Testing Council" }],
  openGraph: {
    title: "VYNTRIC TIERS — Ranked. Tested. Verified.",
    description:
      "Competitive Minecraft PvP Tier Testing platform. Real-time player ranks, first-to-5 test results, and verified standings.",
    type: "website",
    siteName: "Vyntric Tiers",
  },
  twitter: {
    card: "summary_large_image",
    title: "VYNTRIC TIERS — Ranked. Tested. Verified.",
    description:
      "Competitive Minecraft PvP Tier Testing platform. Real-time player ranks, first-to-5 test results, and verified standings.",
    creator: "@vyntrictiers",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} dark`}
    >
      <body className="bg-bg text-text antialiased selection:bg-brand-violet/30 selection:text-brand-cyan min-h-screen relative flex flex-col">
        {/* Skip to main content link for keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-violet focus:text-white focus:rounded-lg focus:font-mono focus:text-xs"
        >
          Skip to main content
        </a>

        {/* Dynamic atmospheric ambient glow and grid/grain overlays */}
        <div className="ambient-glow" />
        <div className="grid-overlay" />
        <div className="grain-overlay" />

        {/* Global Providers & Interactive Chrome */}
        <ClickFeedback />
        <ThreeProvider>
          <SmoothScrollProvider>
            <Preloader />
            <RealtimeProvider />
            <CommandPalette />
            <Toaster />

            <Navbar />
            <main id="main-content" className="flex-1 relative z-10">
              {children}
            </main>
            <Footer />
          </SmoothScrollProvider>
        </ThreeProvider>
      </body>
    </html>
  );
}
