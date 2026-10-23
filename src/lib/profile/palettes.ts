export interface ProfilePalette {
  key: string;
  label: string;
  bg: string;
  text: string;
  accent: string;
  secondaryOrb: string;
  softGlow: string;
  requiresVerification?: boolean;
  textOnAccent?: string;
}

export const PROFILE_PALETTES: ProfilePalette[] = [
  {
    key: "lima",
    label: "lime",
    bg: "#F4F7E8",
    text: "#1B1F10",
    accent: "#B6E02E",
    secondaryOrb: "#D9F970",
    softGlow: "#82B515",
    textOnAccent: "#0E0E0E",
  },
  {
    key: "coral",
    label: "coral",
    bg: "#FFF1EC",
    text: "#2A1511",
    accent: "#FF5A3C",
    secondaryOrb: "#FF8E72",
    softGlow: "#E03516",
    textOnAccent: "#FFFFFF",
  },
  {
    key: "cobalto",
    label: "cobalt",
    bg: "#EEF3FF",
    text: "#0F1A33",
    accent: "#2F5BFF",
    secondaryOrb: "#6E90FF",
    softGlow: "#1939B7",
    textOnAccent: "#FFFFFF",
  },
  {
    key: "violeta",
    label: "violet",
    bg: "#F5EEFF",
    text: "#1D1230",
    accent: "#8A4DFF",
    secondaryOrb: "#B488FF",
    softGlow: "#5E22D9",
    textOnAccent: "#FFFFFF",
  },
  {
    key: "mandarina",
    label: "tangerine",
    bg: "#FFF6E5",
    text: "#2B1D08",
    accent: "#FF9F1C",
    secondaryOrb: "#FFC15E",
    softGlow: "#E87A00",
    textOnAccent: "#0E0E0E",
  },
  {
    key: "obsidiana",
    label: "obsidian",
    bg: "#F0F0F2",
    text: "#0E0E0E",
    accent: "#18181B",
    secondaryOrb: "#71717A",
    softGlow: "#27272A",
    requiresVerification: true,
    textOnAccent: "#FFFFFF",
  },
  {
    key: "bosque",
    label: "forest green",
    bg: "#EEF5F1",
    text: "#0D2619",
    accent: "#1B5E3B",
    secondaryOrb: "#3E9E6C",
    softGlow: "#0B3822",
    requiresVerification: true,
    textOnAccent: "#FFFFFF",
  },
];

const THEME_ALIASES: Record<string, string> = {
  lime: "lima",
  cobalt: "cobalto",
  violet: "violeta",
  tangerine: "mandarina",
  obsidian: "obsidiana",
  forest: "bosque",
  "forest green": "bosque",
};

export function getProfilePalette(key?: string | null): ProfilePalette {
  if (!key) return PROFILE_PALETTES[0];
  const normalized = key.toLowerCase().trim();
  const canonical = THEME_ALIASES[normalized] || normalized;
  return (
    PROFILE_PALETTES.find((p) => p.key === canonical || p.key === normalized || p.label === normalized) ||
    PROFILE_PALETTES[0]
  );
}
