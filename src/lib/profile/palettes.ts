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

export function getProfilePalette(key?: string | null): ProfilePalette {
  return PROFILE_PALETTES.find((p) => p.key === key) || PROFILE_PALETTES[0];
}
