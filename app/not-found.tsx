import Link from "next/link";
import { CrystalLogo } from "@/components/icons/crystal-logo";
import { GlowButton } from "@/components/ui/glow-button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="card-solid max-w-md w-full p-8 text-center border-line">
        <div className="flex justify-center mb-6">
          <CrystalLogo size={42} />
        </div>
        <span className="micro-label text-brand-hot font-bold tracking-widest block mb-2">
          ERROR 404 · KNOCKBACK EXCEEDED
        </span>
        <h1 className="font-heading font-extrabold text-3xl text-text mb-3">
          This page got combo&apos;d.
        </h1>
        <p className="text-muted text-sm leading-relaxed mb-6">
          You got hit out of the arena. The combatant, kit ladder, or route you were
          looking for doesn&apos;t exist or was de-listed by the testing council.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <GlowButton variant="outline" size="sm" asChild>
            <Link href="/">← Back to Arena</Link>
          </GlowButton>
          <GlowButton variant="primary" size="sm" asChild>
            <Link href="/apply">Apply for Testing</Link>
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
