// Five avatars a child can pick, drawn in the same watercolour style as the rest of the app.
export const AVATARS = {
  cricket: { label: "Cricket star", img: "/art/avatar-cricket.webp" },
  astronaut: { label: "Astronaut", img: "/art/avatar-astronaut.webp" },
  gamer: { label: "Gamer & coder", img: "/art/avatar-gamer.webp" },
  football: { label: "Footballer", img: "/art/avatar-football.webp" },
  cat: { label: "Cat buddy", img: "/art/avatar-cat.webp" },
} as const;
export type Avatar = keyof typeof AVATARS;
export const AVATAR_IDS = Object.keys(AVATARS) as Avatar[];

// Children created before avatars had a colour theme instead; each maps to the closest avatar.
const FROM_THEME: Record<string, Avatar> = { kitten: "cat", space: "astronaut", speed: "gamer", floral: "cat", geometric: "football" };

export const avatarOf = (stored: string): Avatar => (stored in AVATARS ? (stored as Avatar) : (FROM_THEME[stored] ?? "astronaut"));
