// Simple one-colour line icons (they take the text colour), to match the site's thin Montserrat look.
const PATHS = {
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5",
  pen: "M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16zM14 6l3 3",
  camera: "M3 8h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  sound: "M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12",
  class: "M3 4h18v12H3zM8 20h8M12 16v4M7 9h6M7 12h4",
  phone: "M7 2h10v20H7zM11 18h2",
  star: "M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.3L12 17.5 6.5 20.4l1-6.3L3 9.7l6.2-.9z",
  translate: "M3 5h10M8 3v2M5 5c1 4 4 7 7 8M11 5c-1 4-4 7-7 8M13 21l4-10 4 10M14.5 17h5",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18",
} as const;

export type IconName = keyof typeof PATHS;

export function LineIcon({ name, size = 28 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
