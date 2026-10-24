import Image from "next/image";
import Link from "next/link";

// The Kali logo's ಕಲಿ letters on black, cut to a square for the menu and icons.
export function LogoMark({ size = 32 }: { size?: number }) {
  return <Image src="/brand/kali-mark.png" alt="" width={size} height={size} className="shrink-0 rounded-[22%]" aria-hidden priority />;
}

// The full Kali logo for the sign-in, about, privacy and worksheet pages. `size` is its height in pixels.
export function Wordmark({ size = 56 }: { size?: number }) {
  const h = size * 2.4;
  return <Image src="/brand/kali-logo.webp" alt="Kali Kannada – Kannada, with confidence" width={Math.round(h * 700 / 642)} height={Math.round(h)} className="rounded-2xl" priority />;
}

export function Logo({ href = "/learn" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="Kali Kannada home">
      <LogoMark />
      <span className="serif text-lg font-semibold text-ink">Kali Kannada</span>
    </Link>
  );
}
