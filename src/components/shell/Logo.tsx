import Link from "next/link";

// Kali Kannada (ಕಲಿ ಕನ್ನಡ, "learn Kannada") mark: a white ಕ on a black tile.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <span className="kn grid shrink-0 place-items-center rounded-[22%] bg-black font-bold text-white" style={{ width: size, height: size, fontSize: size * 0.55 }} aria-hidden>
      ಕ
    </span>
  );
}

// The full logo for the sign-in, about, privacy and worksheet pages.
export function Wordmark({ size = 56 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-3" aria-label="Kali Kannada – Kannada, with confidence">
      <LogoMark size={size} />
      <span className="flex flex-col text-left leading-tight">
        <span className="serif font-semibold text-ink" style={{ fontSize: size * 0.42 }}>Kali Kannada</span>
        <span className="text-muted" style={{ fontSize: Math.max(11, size * 0.22) }}>
          <span className="kn">ಕಲಿ ಕನ್ನಡ</span> · Kannada, with confidence
        </span>
      </span>
    </span>
  );
}

export function Logo({ href = "/learn" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5" aria-label="Kali Kannada home">
      <LogoMark />
      <span className="serif text-lg font-semibold text-ink">Kali Kannada</span>
    </Link>
  );
}
