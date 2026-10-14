"use client";

import { useState } from "react";

export const PROFILE_PALETTES = [
  { key: "lima", label: "lima", bg: "#F4F7E8", text: "#1B1F10", accent: "#B6E02E" },
  { key: "coral", label: "coral", bg: "#FFF1EC", text: "#2A1511", accent: "#FF5A3C" },
  { key: "cobalto", label: "cobalto", bg: "#EEF3FF", text: "#0F1A33", accent: "#2F5BFF" },
  { key: "violeta", label: "violeta", bg: "#F5EEFF", text: "#1D1230", accent: "#8A4DFF" },
  { key: "mandarina", label: "mandarina", bg: "#FFF6E5", text: "#2B1D08", accent: "#FF9F1C" },
];

interface PaletteSelectorProps {
  selectedTheme: string;
  onSelect: (themeKey: string) => void;
}

export function PaletteSelector({ selectedTheme, onSelect }: PaletteSelectorProps) {
  return (
    <div className="flex items-center gap-2 border border-black/10 rounded-full px-3 py-1.5 backdrop-blur-sm bg-white/40">
      <span className="text-[10px] font-mono tracking-tight opacity-50 uppercase mr-1">
        profile palette
      </span>
      {PROFILE_PALETTES.map((p) => (
        <button
          key={p.key}
          onClick={() => onSelect(p.key)}
          aria-label={`Select ${p.label} palette`}
          title={p.label}
          className={`w-4 h-4 rounded-full transition-transform duration-300 ${
            selectedTheme === p.key ? "scale-125 ring-2 ring-black/20" : "hover:scale-110 opacity-70"
          }`}
          style={{ backgroundColor: p.accent }}
        />
      ))}
    </div>
  );
}
