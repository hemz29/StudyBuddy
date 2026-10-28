import { LEVELS, type LevelId } from "@/lib/readiness";

// Soft traffic-light colours for the levels (fill), with a darker shade of each for text on white.
export const LEVEL_COLORS: Record<LevelId, { fill: string; text: string }> = {
  starting: { fill: "#ef8a7f", text: "#b3473c" },
  getting: { fill: "#f6b73c", text: "#9a6300" },
  nearly: { fill: "#9fd27e", text: "#4a8429" },
  ready: { fill: "#3a9d5d", text: "#23703f" },
};
const TRACK = "#ececec";

// A half-circle gauge read from left to right: a pale track with the four level zones, filled in colour from the
// left end up to the needle, like a speedometer. Without enough practice to tell, it's just the pale track.
const C = { x: 100, y: 100 };
const R = 78;
const W = 18;
const GAP = 0.8; // a thin gap between zones, in % of the dial
const point = (pct: number, r = R) => {
  const a = Math.PI * (1 - pct / 100);
  return [C.x + r * Math.cos(a), C.y - r * Math.sin(a)];
};
const arc = (from: number, to: number) => {
  const [x1, y1] = point(from);
  const [x2, y2] = point(to);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

export function levelOf(pct: number): LevelId {
  return [...LEVELS].reverse().find((l) => pct >= l.from)!.id;
}

export function ReadinessDial({ pct, level, active = true, size = "lg" }: { pct: number; level?: LevelId; active?: boolean; size?: "sm" | "lg" }) {
  const bounds = [...LEVELS.map((l) => l.from), 100];
  const zones = LEVELS.map((l, i) => ({ id: l.id, from: bounds[i] + (i ? GAP / 2 : 0), to: bounds[i + 1] - (i < 3 ? GAP / 2 : 0) }));
  const shown = Math.max(1, Math.min(100, pct));
  const needle = Math.max(1, Math.min(99, pct));
  const [nx, ny] = point(needle, R - 20);
  const [sx, sy] = point(0);
  const [ex, ey] = point(100);
  const textColor = LEVEL_COLORS[level ?? levelOf(pct)].text;
  return (
    <svg viewBox="0 0 200 146" className={size === "lg" ? "w-full max-w-72" : "w-28"} role="img" aria-label={active ? `Exam readiness ${pct}%` : "Exam readiness: not enough practice yet"}>
      {/* Pale track: four zones, rounded at both ends. */}
      <circle cx={sx} cy={sy + 0.01} r={W / 2} fill={active ? LEVEL_COLORS.starting.fill : TRACK} />
      <circle cx={ex} cy={ey + 0.01} r={W / 2} fill={active && pct >= 100 ? LEVEL_COLORS.ready.fill : TRACK} />
      {zones.map((z) => <path key={z.id} d={arc(z.from, z.to)} fill="none" stroke={TRACK} strokeWidth={W} />)}
      {/* The fill, from the left up to the needle, each zone in its own colour. */}
      {active &&
        zones
          .filter((z) => z.from < shown)
          .map((z) => <path key={`f-${z.id}`} d={arc(z.from, Math.min(z.to, shown))} fill="none" stroke={LEVEL_COLORS[z.id].fill} strokeWidth={W} />)}
      {active && (
        <>
          <line x1={C.x} y1={C.y} x2={nx} y2={ny} stroke="#111" strokeWidth="4" strokeLinecap="round" />
          <circle cx={C.x} cy={C.y} r="7" fill="#111" />
          <circle cx={C.x} cy={C.y} r="2.5" fill="#fff" />
        </>
      )}
      <text x={C.x} y={C.y + 40} textAnchor="middle" fill={active ? textColor : "#9a9a9a"} style={{ fontSize: 30, fontWeight: 700 }}>
        {active ? `${pct}%` : "–"}
      </text>
    </svg>
  );
}
