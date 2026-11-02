import { notFound } from "next/navigation";

/**
 * Decoy / Fake 404 Route:
 * Anyone trying to guess or access `/admin` will receive a 100% authentic 404 error,
 * keeping the real administrative suite entirely undetectable.
 */
export default function DecoyAdminPage() {
  notFound();
}
