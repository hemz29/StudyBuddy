import Image from "next/image";
import { AVATARS, avatarOf } from "@/lib/avatars";

export function AvatarImage({ avatar, size = 72, className = "" }: { avatar: string; size?: number; className?: string }) {
  const a = AVATARS[avatarOf(avatar)];
  return <Image src={a.img} alt={a.label} width={size} height={size} className={className} />;
}
