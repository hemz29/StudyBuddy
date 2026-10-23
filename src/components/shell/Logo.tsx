import Image from "next/image";
import Link from "next/link";

// Nudi (ನುಡಿ, "language, speech") mark: the logo's ನುಡಿ letters on its black tile.
export function LogoMark({ size = 32 }: { size?: number }) {
  return <Image src="/brand/nudi-mark.png" alt="" width={size} height={size} className="shrink-0" aria-hidden priority />;
}

export function Logo({ href = "/learn" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="Nudi home">
      <LogoMark />
      <span className="serif text-lg font-semibold text-ink">Nudi</span>
    </Link>
  );
}
