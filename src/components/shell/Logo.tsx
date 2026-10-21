import Link from "next/link";

// StudyBuddy mark: an open book with a leaf, in the app's sage green.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="23" fill="#e6efe8" />
      <path d="M10 17c5-2 10-1.5 14 1.5V36c-4-3-9-3.5-14-1.5z" fill="#fffdf9" stroke="#5e8b76" strokeWidth="2" strokeLinejoin="round" />
      <path d="M38 17c-5-2-10-1.5-14 1.5V36c4-3 9-3.5 14-1.5z" fill="#fffdf9" stroke="#5e8b76" strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 18.5c0-5 3-8.5 8-9.5-.5 5-3.5 8.5-8 9.5z" fill="#5e8b76" />
      <path d="M24 18.5c-.5-3.5-2.5-6-6-7 .3 3.6 2.4 6 6 7z" fill="#9dbca9" />
    </svg>
  );
}

export function Logo({ href = "/learn" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <LogoMark />
      <span className="serif text-lg font-semibold text-ink">StudyBuddy</span>
    </Link>
  );
}
