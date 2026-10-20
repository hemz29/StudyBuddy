"use client";
import { useState } from "react";
import { THEMES, type Theme } from "@/lib/store/types";
import { THEME_INFO, ThemeMascot } from "./ThemeArt";

export function ThemePicker({ initial = "space" }: { initial?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);
  return (
    <fieldset>
      <legend className="font-bold">Pick a look</legend>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {THEMES.map((t) => (
          <label
            key={t}
            data-theme={t}
            className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition ${
              theme === t ? "border-accent bg-accent-soft" : "border-line bg-surface"
            }`}
          >
            <input type="radio" name="theme" value={t} checked={theme === t} onChange={() => setTheme(t)} className="sr-only" />
            <ThemeMascot theme={t} size={56} />
            <span className="text-sm font-bold">{THEME_INFO[t].label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
