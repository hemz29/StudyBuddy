import { LEVELS } from "@/lib/readiness";

// A half-circle gauge: four bands (Just starting → Exam ready) and a needle pointing at the readiness %.
// Without enough practice to tell, the bands are grey and there's no needle.
const BAND = ["#e6e6e6", "#fbf1cc", "#fbce1a", "#111111"];
const C = { x: 100, y: 100 };
const R = 78;
const point = (pct: number, r = R) => {
  const a = Math.PI * (1 - pct / 100);
  return [C.x + r * Math.cos(a), C.y - r * Math.sin(a)];
};
const arc = (from: number, to: number) => {
  const [x1, y1] = point(from);
  const [x2, y2] = point(to);
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
};

export function ReadinessDial({ pct, active = true, size = "lg" }: { pct: number; active?: boolean; size?: "sm" | "lg" }) {
  const bounds = [...LEVELS.map((l) => l.from), 100];
  const needle = Math.max(1, Math.min(99, pct));
  const [nx, ny] = point(needle, R - 20);
  return (
    <svg viewBox="0 0 200 146" className={size === "lg" ? "w-full max-w-72" : "w-28"} role="img" aria-label={active ? `Exam readiness ${pct}%` : "Exam readiness: not enough practice yet"}>
      {LEVELS.map((l, i) => (
        <path key={l.id} d={arc(bounds[i] + (i ? 0.8 : 0), bounds[i + 1] - (i < 3 ? 0.8 : 0))} fill="none" stroke={active ? BAND[i] : "#eeeeee"} strokeWidth="18" strokeLinecap="butt" />
      ))}
      {active && (
        <>
          <line x1={C.x} y1={C.y} x2={nx} y2={ny} stroke="#111" strokeWidth="4" strokeLinecap="round" />
          <circle cx={C.x} cy={C.y} r="7" fill="#111" />
          <circle cx={C.x} cy={C.y} r="2.5" fill="var(--brand-yellow)" />
        </>
      )}
      <text x={C.x} y={C.y + 40} textAnchor="middle" className="fill-current" style={{ fontSize: 30, fontWeight: 700 }}>
        {active ? `${pct}%` : "–"}
      </text>
    </svg>
  );
}
