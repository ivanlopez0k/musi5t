"use client";

import { PROFILE_PALETTES, type ProfilePalette } from "@/lib/profile/palettes";

export { PROFILE_PALETTES, type ProfilePalette };

interface PaletteSelectorProps {
  selectedTheme: string;
  onSelect: (themeKey: string) => void;
}

export function PaletteSelector({ selectedTheme, onSelect }: PaletteSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Profile palette selector"
      className="inline-flex items-center gap-[1.2vw] sm:gap-[0.38vw] bg-primary/85 border border-secondary/15 rounded-full px-[1.8vw] py-[0.9vw] sm:px-[0.55vw] sm:py-[0.28vw] backdrop-blur-md"
    >
      {PROFILE_PALETTES.map((p) => {
        const isSelected = selectedTheme === p.key;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => onSelect(p.key)}
            aria-label={`Select ${p.label} palette`}
            title={p.label}
            className={`relative w-[3.4vw] h-[3.4vw] sm:w-[0.95vw] sm:h-[0.95vw] rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
              isSelected
                ? "scale-115 ring-1 ring-secondary ring-offset-1 ring-offset-primary"
                : "hover:scale-110 opacity-75 hover:opacity-100"
            }`}
            style={{
              background: `radial-gradient(circle at 35% 35%, ${p.secondaryOrb}, ${p.accent} 65%, ${p.softGlow})`,
            }}
          />
        );
      })}
    </div>
  );
}


