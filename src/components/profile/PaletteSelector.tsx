"use client";

export interface ProfilePalette {
  key: string;
  label: string;
  bg: string;
  text: string;
  accent: string;
  secondaryOrb: string;
  softGlow: string;
}

export const PROFILE_PALETTES: ProfilePalette[] = [
  {
    key: "lima",
    label: "lima",
    bg: "#F4F7E8",
    text: "#1B1F10",
    accent: "#B6E02E",
    secondaryOrb: "#D9F970",
    softGlow: "#82B515",
  },
  {
    key: "coral",
    label: "coral",
    bg: "#FFF1EC",
    text: "#2A1511",
    accent: "#FF5A3C",
    secondaryOrb: "#FF8E72",
    softGlow: "#E03516",
  },
  {
    key: "cobalto",
    label: "cobalto",
    bg: "#EEF3FF",
    text: "#0F1A33",
    accent: "#2F5BFF",
    secondaryOrb: "#6E90FF",
    softGlow: "#1939B7",
  },
  {
    key: "violeta",
    label: "violeta",
    bg: "#F5EEFF",
    text: "#1D1230",
    accent: "#8A4DFF",
    secondaryOrb: "#B488FF",
    softGlow: "#5E22D9",
  },
  {
    key: "mandarina",
    label: "mandarina",
    bg: "#FFF6E5",
    text: "#2B1D08",
    accent: "#FF9F1C",
    secondaryOrb: "#FFC15E",
    softGlow: "#E87A00",
  },
];

interface PaletteSelectorProps {
  selectedTheme: string;
  onSelect: (themeKey: string) => void;
}

export function PaletteSelector({ selectedTheme, onSelect }: PaletteSelectorProps) {
  return (
    <div className="inline-flex items-center gap-[1.8vw] sm:gap-[0.55vw] bg-primary/90 border border-secondary/15 rounded-[0.4vw] sm:rounded-[0.25vw] px-[2.5vw] py-[1.2vw] sm:px-[0.8vw] sm:py-[0.4vw] drop-shadow-soft backdrop-blur-md">
      <span className="detailText text-secondary/60 lowercase mr-[0.5vw] sm:mr-[0.25vw] select-none">
        palette
      </span>
      <div className="flex items-center gap-[1.5vw] sm:gap-[0.45vw]">
        {PROFILE_PALETTES.map((p) => {
          const isSelected = selectedTheme === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelect(p.key)}
              aria-label={`Select ${p.label} palette`}
              title={p.label}
              className={`relative w-[4.2vw] h-[4.2vw] sm:w-[1.25vw] sm:h-[1.25vw] rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
                isSelected
                  ? "scale-125 ring-2 ring-secondary ring-offset-2 ring-offset-primary"
                  : "hover:scale-110 opacity-75 hover:opacity-100"
              }`}
              style={{
                background: `radial-gradient(circle at 35% 35%, ${p.secondaryOrb}, ${p.accent} 65%, ${p.softGlow})`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

