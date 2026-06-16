const FONT_PAIRINGS: Record<
  string,
  { primary: string; secondary: string; reason: string }
> = {
  wellness: {
    primary: "Sora",
    secondary: "Inter",
    reason: "Rounded warmth + readability",
  },
  tech: {
    primary: "Inter",
    secondary: "JetBrains Mono",
    reason: "Clean sans + technical accent",
  },
  food: {
    primary: "Sora",
    secondary: "Inter",
    reason: "Friendly + approachable",
  },
  education: {
    primary: "Merriweather",
    secondary: "Inter",
    reason: "Serif authority + sans readability",
  },
  creative: {
    primary: "Sora",
    secondary: "Inter",
    reason: "Bold modern + clean body",
  },
  professional: {
    primary: "Inter",
    secondary: "Sora",
    reason: "Clean professional + accent headings",
  },
  general: {
    primary: "Sora",
    secondary: "Inter",
    reason: "Balanced modern pairing",
  },
};

export function getFontPairing(niche: string): {
  primary: string;
  secondary: string;
} {
  const match = FONT_PAIRINGS[niche] || FONT_PAIRINGS.general;
  return { primary: match.primary, secondary: match.secondary };
}
