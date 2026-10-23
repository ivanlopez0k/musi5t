"use client";

import { PROFILE_PALETTES, type ProfilePalette } from "@/lib/profile/palettes";

export { PROFILE_PALETTES, type ProfilePalette };

interface PaletteSelectorProps {
  selectedTheme: string;
  onSelect: (themeKey: string) => void;
  isEmailVerified?: boolean;
  onLockedClick?: (paletteLabel: string) => void;
}

export function PaletteSelector({
  selectedTheme,
  onSelect,
  isEmailVerified = false,
  onLockedClick,
}: PaletteSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Profile palette selector"
      className="inline-flex items-center gap-[1.2vw] sm:gap-[0.38vw] bg-primary/85 border border-secondary/15 rounded-full px-[1.8vw] py-[0.9vw] sm:px-[0.55vw] sm:py-[0.28vw] backdrop-blur-md"
    >
      {PROFILE_PALETTES.map((p) => {
        const isSelected = selectedTheme === p.key;
        const isLocked = Boolean(p.requiresVerification && !isEmailVerified);

        return (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              if (isLocked) {
                onLockedClick?.(p.label);
              } else {
                onSelect(p.key);
              }
            }}
            aria-label={
              isLocked
                ? `${p.label} (locked — verify your email to unlock)`
                : `Select ${p.label} palette`
            }
            title={
              isLocked
                ? `${p.label} — verify email to unlock this exclusive palette`
                : p.label
            }
            className={`relative w-[3.4vw] h-[3.4vw] sm:w-[0.95vw] sm:h-[0.95vw] rounded-full transition-all duration-300 flex items-center justify-center ${
              isLocked
                ? "cursor-not-allowed opacity-55 hover:opacity-85"
                : isSelected
                ? "scale-115 ring-1 ring-secondary ring-offset-1 ring-offset-primary cursor-pointer"
                : "hover:scale-110 opacity-75 hover:opacity-100 cursor-pointer"
            }`}
            style={{
              background: `radial-gradient(circle at 35% 35%, ${p.secondaryOrb}, ${p.accent} 65%, ${p.softGlow})`,
            }}
          >
            {isLocked && (
              <svg
                className="w-[1.8vw] h-[1.8vw] sm:w-[0.55vw] sm:h-[0.55vw] text-secondary/90 drop-shadow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}


