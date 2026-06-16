const PSYCHOLOGY_MATRIX: Record<
  string,
  { primary: string; secondary: string; accent: string; mood: string }
> = {
  wellness: {
    primary: "#8B9D6E",
    secondary: "#D4C5A9",
    accent: "#C17817",
    mood: "earthy, grounded, natural",
  },
  tech: {
    primary: "#4F46E5",
    secondary: "#06B6D4",
    accent: "#F97316",
    mood: "innovative, trustworthy, dynamic",
  },
  food: {
    primary: "#DC2626",
    secondary: "#F59E0B",
    accent: "#84CC16",
    mood: "warm, appetizing, energetic",
  },
  education: {
    primary: "#2563EB",
    secondary: "#7C3AED",
    accent: "#10B981",
    mood: "trustworthy, intellectual, growth",
  },
  creative: {
    primary: "#EC4899",
    secondary: "#8B5CF6",
    accent: "#F59E0B",
    mood: "playful, expressive, bold",
  },
  professional: {
    primary: "#1E293B",
    secondary: "#475569",
    accent: "#3B82F6",
    mood: "authoritative, clean, confident",
  },
  general: {
    primary: "#6E56CF",
    secondary: "#00C4B4",
    accent: "#FF7E33",
    mood: "balanced, modern, trustworthy",
  },
};

export function getColorPalette(
  niche: string
): { primary: string; secondary: string; accent: string } {
  const match = PSYCHOLOGY_MATRIX[niche] || PSYCHOLOGY_MATRIX.general;
  return {
    primary: match.primary,
    secondary: match.secondary,
    accent: match.accent,
  };
}

export function getPsychologyMood(niche: string): string {
  return PSYCHOLOGY_MATRIX[niche]?.mood || PSYCHOLOGY_MATRIX.general.mood;
}
