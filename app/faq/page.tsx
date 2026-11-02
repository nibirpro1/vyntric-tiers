import { Metadata } from "next";
import { FAQ } from "@/components/sections/FAQ";
import { FAQ_ITEMS } from "@/lib/faq";
import { SITE_CONFIG } from "@/lib/site";

export const metadata: Metadata = {
  title: "Rules & Testing FAQ",
  description: "Official Vyntric Testing guidelines, tier thresholds, scoring rules, and dispute resolution protocol.",
  openGraph: {
    title: "Rules & Testing FAQ · VYNTRIC TIERS",
    description: "Official Vyntric Testing guidelines, tier thresholds, scoring rules, and dispute resolution protocol.",
    url: `${SITE_CONFIG.url}/faq`,
  },
};

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="py-8">
        <FAQ previewMode={false} />
      </div>
    </>
  );
}
