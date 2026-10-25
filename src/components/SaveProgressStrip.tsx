import Link from "next/link";

// Shown to guests (started with "Start free") until they add an email or Google.
export function SaveProgressStrip({ name }: { name?: string }) {
  return (
    <Link href="/save" className="no-print flex items-center gap-3 rounded-2xl bg-black px-4 py-3 text-sm text-white">
      <span className="flex-1">
        <b className="font-semibold text-[var(--brand-yellow)]">Save {name ? `${name}'s` : "your"} progress</b>
        <span className="block text-gray-300">Add your email so you can come back on any device.</span>
      </span>
      <span aria-hidden>→</span>
    </Link>
  );
}
