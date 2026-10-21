"use client";
import Image from "next/image";
import { useState } from "react";
import { AVATARS, AVATAR_IDS, type Avatar } from "@/lib/avatars";

export function AvatarPicker({ initial = "astronaut" }: { initial?: Avatar }) {
  const [avatar, setAvatar] = useState<Avatar>(initial);
  return (
    <fieldset>
      <legend className="font-bold">Pick your avatar</legend>
      <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {AVATAR_IDS.map((id) => (
          <label
            key={id}
            className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 p-2 text-center transition hover:-translate-y-0.5 ${
              avatar === id ? "border-accent bg-accent-soft" : "border-line bg-surface"
            }`}
          >
            <input type="radio" name="avatar" value={id} checked={avatar === id} onChange={() => setAvatar(id)} className="sr-only" />
            <Image src={AVATARS[id].img} alt="" width={96} height={96} />
            <span className="text-sm font-bold">{AVATARS[id].label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
