"use client";

import React from "react";
import { getProfilePalette } from "@/lib/profile/palettes";

export interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName: string;
  themeKey?: string | null;
  className?: string;
  textClassName?: string;
}

export function UserAvatar({
  avatarUrl,
  displayName,
  themeKey,
  className = "",
  textClassName = "",
}: UserAvatarProps) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={displayName}
        className={`w-full h-full object-cover select-none ${className}`}
      />
    );
  }

  const palette = getProfilePalette(themeKey);
  const initials = (displayName || "??").trim().slice(0, 2).toUpperCase();

  return (
    <div
      className={`w-full h-full flex items-center justify-center select-none font-bold tracking-tight transition-colors duration-500 ${className}`}
      style={{
        background: `radial-gradient(circle at 35% 35%, ${palette.secondaryOrb}, ${palette.accent} 68%, ${palette.softGlow})`,
        color: palette.textOnAccent || "#0E0E0E",
      }}
    >
      <span className={textClassName || "leading-none"}>{initials}</span>
    </div>
  );
}
