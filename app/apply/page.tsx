import { Metadata } from "next";
import { Apply } from "@/components/sections/Apply";

export const metadata: Metadata = {
  title: "Apply for Tier Testing",
  description: "Queue for official Minecraft PvP Tier Testing with accredited Vyntric Council testers. First-to-5 duels on 20 TPS neutral nodes.",
};

export default function ApplyPage() {
  return (
    <div className="py-8">
      <Apply />
    </div>
  );
}
