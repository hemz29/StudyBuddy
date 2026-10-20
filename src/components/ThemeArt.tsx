import type { Theme } from "@/lib/store/types";

export const THEME_INFO: Record<Theme, { label: string; blurb: string }> = {
  kitten: { label: "Cute kittens", blurb: "Soft and cosy" },
  space: { label: "Space", blurb: "Planets and stars" },
  floral: { label: "Flowers", blurb: "Fresh and green" },
  speed: { label: "Speed & gadgets", blurb: "Fast and bold" },
  geometric: { label: "Shapes", blurb: "Clean and sharp" },
};

// Simple original illustrations, one per theme, drawn with the theme's accent colour.
export function ThemeMascot({ theme, size = 72 }: { theme: Theme; size?: number }) {
  const a = "var(--accent)";
  const common = { width: size, height: size, viewBox: "0 0 100 100", "aria-hidden": true } as const;
  switch (theme) {
    case "kitten":
      return (
        <svg {...common}>
          <path d="M22 40 L28 14 L44 30 Z" fill={a} />
          <path d="M78 40 L72 14 L56 30 Z" fill={a} />
          <circle cx="50" cy="55" r="32" fill={a} />
          <circle cx="50" cy="60" r="22" fill="#fff" opacity="0.9" />
          <circle cx="40" cy="52" r="4" fill="#2a2a3a" />
          <circle cx="60" cy="52" r="4" fill="#2a2a3a" />
          <path d="M46 62 L54 62 L50 67 Z" fill="#e46a8c" />
          <path d="M50 67 Q46 72 42 70 M50 67 Q54 72 58 70" stroke="#2a2a3a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M30 62 H16 M30 67 L17 71 M70 62 H84 M70 67 L83 71" stroke="#2a2a3a" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "space":
      return (
        <svg {...common}>
          <circle cx="50" cy="52" r="24" fill={a} />
          <circle cx="42" cy="44" r="5" fill="#fff" opacity="0.35" />
          <circle cx="58" cy="60" r="3.5" fill="#fff" opacity="0.3" />
          <ellipse cx="50" cy="54" rx="42" ry="11" fill="none" stroke="#ffd166" strokeWidth="4" transform="rotate(-18 50 54)" />
          <path d="M14 18 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#ffd166" />
          <path d="M84 80 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#ffd166" />
          <circle cx="82" cy="20" r="2" fill="#ffd166" />
        </svg>
      );
    case "floral":
      return (
        <svg {...common}>
          <path d="M50 58 Q48 80 50 96" stroke="#3f8f5a" strokeWidth="4" fill="none" />
          <path d="M50 80 Q30 70 26 82 Q40 90 50 80Z" fill="#3f8f5a" />
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="50" cy="26" rx="12" ry="18" fill="#f28fb0" transform={`rotate(${r} 50 44)`} />
          ))}
          <circle cx="50" cy="44" r="10" fill="#ffd166" />
        </svg>
      );
    case "speed":
      return (
        <svg {...common}>
          <path d="M6 44 H26 M2 54 H20 M8 64 H22" stroke={a} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <path d="M24 66 L28 52 Q32 44 44 42 L60 40 Q70 40 78 48 L92 52 Q96 54 96 60 L96 66 Z" fill={a} />
          <path d="M46 46 L58 44 Q66 44 70 50 L46 50 Z" fill="#cfe8ff" />
          <circle cx="40" cy="68" r="9" fill="#2a2a3a" />
          <circle cx="40" cy="68" r="4" fill="#ddd" />
          <circle cx="80" cy="68" r="9" fill="#2a2a3a" />
          <circle cx="80" cy="68" r="4" fill="#ddd" />
        </svg>
      );
    case "geometric":
      return (
        <svg {...common}>
          <rect x="14" y="40" width="40" height="40" fill={a} />
          <circle cx="64" cy="38" r="22" fill="#ffd166" opacity="0.9" />
          <path d="M50 88 L72 50 L94 88 Z" fill="#2a2a3a" opacity="0.85" />
        </svg>
      );
  }
}
