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
    primary: "DM Sans",
    secondary: "Inter",
    reason: "Friendly + approachable",
  },
  education: {
    primary: "Merriweather",
    secondary: "Inter",
    reason: "Serif authority + sans readability",
  },
  creative: {
    primary: "Clash Display",
    secondary: "Satoshi",
    reason: "Expressive display + clean sans",
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
  luxury: {
    primary: "Playfair Display",
    secondary: "DM Sans",
    reason: "Elegant serif + refined sans",
  },
  startup: {
    primary: "Space Grotesk",
    secondary: "Inter",
    reason: "Bold tech-forward + clean body",
  },
  ecommerce: {
    primary: "Plus Jakarta Sans",
    secondary: "Inter",
    reason: "Modern retail + high readability",
  },
  nonprofit: {
    primary: "Merriweather",
    secondary: "Figtree",
    reason: "Trustworthy serif + friendly sans",
  },
  gaming: {
    primary: "Oxanium",
    secondary: "Space Grotesk",
    reason: "Futuristic display + tech body",
  },
  fashion: {
    primary: "Cabinet Grotesk",
    secondary: "Satoshi",
    reason: "Sleek editorial + minimal body",
  },
  finance: {
    primary: "Instrument Serif",
    secondary: "Inter",
    reason: "Classy serif + professional sans",
  },
  travel: {
    primary: "Sora",
    secondary: "DM Sans",
    reason: "Warm headings + clean body",
  },
  fitness: {
    primary: "Space Grotesk",
    secondary: "Inter",
    reason: "Energetic display + crisp body",
  },
  saas: {
    primary: "Inter",
    secondary: "Sora",
    reason: "Clean UI + approachable accent",
  },
  agency: {
    primary: "Sentient",
    secondary: "Satoshi",
    reason: "Premium serif + modern sans",
  },
  realestate: {
    primary: "Playfair Display",
    secondary: "Figtree",
    reason: "Elegant headings + warm body",
  },
  "fitness-app": {
    primary: "Space Grotesk",
    secondary: "Inter",
    reason: "Energetic display + crisp body",
  },
  livestock: {
    primary: "Sora",
    secondary: "Figtree",
    reason: "Rugged warmth + friendly body",
  },
  marathon: {
    primary: "Space Grotesk",
    secondary: "DM Sans",
    reason: "Bold action + clean details",
  },
};

export function getFontPairing(niche: string): {
  primary: string;
  secondary: string;
} {
  const match = FONT_PAIRINGS[niche] || FONT_PAIRINGS.general;
  return { primary: match.primary, secondary: match.secondary };
}
