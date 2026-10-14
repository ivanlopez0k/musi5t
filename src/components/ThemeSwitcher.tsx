"use client";

import { useEffect, useState } from "react";

const PALETTES = [
  { key: "lima", label: "lima", bg: "#F4F7E8", text: "#1B1F10", accent: "#B6E02E" },
  { key: "coral", label: "coral", bg: "#FFF1EC", text: "#2A1511", accent: "#FF5A3C" },
  { key: "cobalto", label: "cobalto", bg: "#EEF3FF", text: "#0F1A33", accent: "#2F5BFF" },
  { key: "violeta", label: "violeta", bg: "#F5EEFF", text: "#1D1230", accent: "#8A4DFF" },
  { key: "mandarina", label: "mandarina", bg: "#FFF6E5", text: "#2B1D08", accent: "#FF9F1C" },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("lima");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  return (
    <div className="flex items-center gap-2 border border-black/10 rounded-full px-3 py-1.5 backdrop-blur-sm bg-white/20">
      <span className="text-[11px] tracking-tight opacity-50 uppercase mr-1">palette</span>
      {PALETTES.map((p) => (
        <button
          key={p.key}
          onClick={() => setCurrentTheme(p.key)}
          aria-label={`Select palette ${p.label}`}
          title={p.label}
          className={`w-4 h-4 rounded-full transition-transform duration-300 ${
            currentTheme === p.key ? "scale-125 ring-2 ring-black/20" : "hover:scale-110 opacity-70"
          }`}
          style={{ backgroundColor: p.accent }}
        />
      ))}
    </div>
  );
}
