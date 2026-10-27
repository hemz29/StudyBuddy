// Simple one-colour line icons (they take the text colour), to match the site's thin Montserrat look.
const PATHS = {
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  chat: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5",
  pen: "M4 20l4-1L19 8a2.1 2.1 0 0 0-3-3L5 16zM14 6l3 3",
  camera: "M3 8h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  sound: "M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12",
  female: "M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10M12 14v7M9 18h6",
  male: "M10 20a6 6 0 1 0 0-12 6 6 0 0 0 0 12M14.5 9.5L20 4M15 4h5v5",
  class: "M3 4h18v12H3zM8 20h8M12 16v4M7 9h6M7 12h4",
  phone: "M7 2h10v20H7zM11 18h2",
  star: "M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.3L12 17.5 6.5 20.4l1-6.3L3 9.7l6.2-.9z",
  translate: "M3 5h10M8 3v2M5 5c1 4 4 7 7 8M11 5c-1 4-4 7-7 8M13 21l4-10 4 10M14.5 17h5",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18",
  page: "M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 16h5",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2",
  printer: "M7 8V3h10v5M5 17H3v-8h18v8h-2M7 14h10v7H7z",
  check: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M8 12l3 3 5-6",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  family: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M17 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M3 20c0-3 2.2-5 5-5s5 2 5 5M13 20c.3-2.4 2-4 4-4s3.6 1.6 4 4",
  scissors: "M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6M8.5 7.5L20 18M8.5 16.5L20 6",
  people: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M2.5 20c.4-3.5 3-6 6.5-6s6.1 2.5 6.5 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c2 .6 3.3 2.8 3.5 6",
  swap: "M4 8h14l-3-3M20 16H6l3 3",
  music: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0M20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3",
  laptop: "M5 5h14v10H5zM2 19h20",
  image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5a1.5 1.5 0 1 0 0-.01",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H4c0 3 1.5 4.5 4 5M16 6h4c0 3-1.5 4.5-4 5M12 13v4M8 21h8M10 17h4v4h-4z",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  question: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01",
} as const;

export type IconName = keyof typeof PATHS;

export function LineIcon({ name, size = 28, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}
