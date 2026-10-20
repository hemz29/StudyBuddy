"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "@/lib/dashboard";

export function ScoreChart({ points }: { points: TrendPoint[] }) {
  const data = points.map((p, i) => ({ ...p, n: `#${i + 1}`, day: new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) }));
  return (
    <div className="mt-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
          <CartesianGrid stroke="#e3e6ee" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} fontSize={12} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as (typeof data)[number];
              return (
                <div className="rounded-xl border border-line bg-white p-3 text-sm shadow">
                  <p className="font-bold">{p.title}</p>
                  <p>{p.day}: {p.awarded}/{p.max} marks ({p.pct}%)</p>
                  <p className="text-muted">Written without help: {p.ownPct}%</p>
                </div>
              );
            }}
          />
          <Line type="monotone" dataKey="pct" name="Score" stroke="#4f5bd5" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
          <Line type="monotone" dataKey="ownPct" name="Without help" stroke="#1f8a4c" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-xs text-muted"><span className="font-bold text-[#4f5bd5]">━</span> Score &nbsp; <span className="font-bold text-[#1f8a4c]">┅</span> Answers written without “I’m stuck” help</p>
    </div>
  );
}
