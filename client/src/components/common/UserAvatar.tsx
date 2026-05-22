import { useEffect, useState } from "react";
import { resolveAvatarSrc, type AvatarSource } from "../../lib/avatar";

export interface UserAvatarProps {
  src?: string | null;
  user?: AvatarSource | null;
  name?: string;
  size?: number;
  className?: string;
  online?: boolean;
  speaking?: boolean;
  host?: boolean;
}

export default function UserAvatar({
  src,
  user,
  name = "User",
  size = 40,
  className = "",
  online = false,
  speaking = false,
  host = false,
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const resolvedSrc = src ?? resolveAvatarSrc(user);
  const showImage = Boolean(resolvedSrc) && !imgError;

  useEffect(() => {
    setImgError(false);
  }, [resolvedSrc]);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div
      className={`relative shrink-0 transition-transform duration-300 hover:scale-[1.04] ${className}`}
      style={{ width: size, height: size }}
      title={name}
    >
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-semibold shadow-lg ${
          speaking ? "ring-2 ring-emerald-400/80 ring-offset-1 ring-offset-transparent animate-pulse" : "ring-1 ring-white/80 dark:ring-white/10"
        }`}
        style={{
          boxShadow: speaking
            ? "0 0 0 2px rgba(52,211,153,0.35), 0 8px 24px rgba(99,102,241,0.25)"
            : "0 6px 20px rgba(99,102,241,0.18)",
        }}
      >
        {showImage ? (
          <img
            src={resolvedSrc!}
            alt={name}
            className="h-full w-full object-cover object-center"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{ fontSize: Math.max(10, Math.floor(size * 0.34)) }}>{initials}</span>
        )}
      </div>

      {online && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0F0F14]"
          style={{ width: Math.max(8, size * 0.28), height: Math.max(8, size * 0.28) }}
        />
      )}

      {host && (
        <span className="absolute -bottom-1 -right-1 rounded-full border border-amber-300/50 bg-amber-400/90 px-1 text-[8px] font-bold uppercase text-amber-950">
          H
        </span>
      )}
    </div>
  );
}
