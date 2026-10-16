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


