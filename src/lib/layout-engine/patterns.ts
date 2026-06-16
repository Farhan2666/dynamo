import type { Section, SectionType, SpacingScale } from "@/types";

interface LayoutPattern {
  sections: SectionType[];
  description: string;
  bias: string;
  vibe: string;
}

const PATTERNS: LayoutPattern[] = [
  { sections: ["hero", "logos", "stats", "features", "testimonials", "pricing", "faq", "cta"], description: "Full conversion funnel", bias: "general", vibe: "trust" },
  { sections: ["hero", "features", "testimonials", "pricing", "faq", "cta"], description: "Classic SaaS", bias: "general", vibe: "professional" },
  { sections: ["hero", "testimonials", "stats", "features", "cta", "pricing"], description: "Social proof anchor", bias: "social-proof", vibe: "trust" },
  { sections: ["hero", "cta", "features", "comparison", "testimonials", "faq"], description: "Early hook", bias: "general", vibe: "energetic" },
  { sections: ["hero", "features", "cta", "pricing", "testimonials", "faq"], description: "Feature-forward SaaS", bias: "feature-forward", vibe: "professional" },
  { sections: ["hero", "gallery", "features", "testimonials", "cta", "contact"], description: "Visual showcase", bias: "visual-showcase", vibe: "playful" },
  { sections: ["hero", "stats", "features", "testimonials", "pricing", "cta", "faq"], description: "Data-driven conversion", bias: "data-driven", vibe: "balanced" },
  { sections: ["hero", "timeline", "features", "testimonials", "team", "cta"], description: "Storytelling flow", bias: "storytelling", vibe: "warm" },
  { sections: ["hero", "features", "comparison", "testimonials", "pricing", "cta", "faq"], description: "Comparison-heavy", bias: "general", vibe: "professional" },
  { sections: ["hero", "logos", "features", "stats", "testimonials", "cta", "contact"], description: "Brand trust builder", bias: "social-proof", vibe: "confident" },
  { sections: ["hero", "cta", "features", "pricing", "faq", "contact"], description: "Short & punchy", bias: "general", vibe: "energetic" },
  { sections: ["hero", "testimonials", "features", "cta", "pricing", "faq"], description: "Testimonial-first", bias: "testimonial-first", vibe: "trust" },
  { sections: ["hero", "features", "cta", "stats", "testimonials", "gallery", "contact"], description: "Visual-heavy hybrid", bias: "visual-showcase", vibe: "playful" },
  { sections: ["hero", "stats", "cta", "features", "testimonials", "faq"], description: "Stats anchor short", bias: "data-driven", vibe: "balanced" },
  { sections: ["hero", "team", "features", "testimonials", "cta", "contact"], description: "People-first", bias: "people-first", vibe: "warm" },
  { sections: ["hero", "gallery", "cta", "features", "testimonials", "pricing", "faq"], description: "Portfolio style", bias: "portfolio-style", vibe: "creative" },
  { sections: ["hero", "logos", "features", "testimonials", "cta", "faq", "stats", "pricing"], description: "Long-form conversion", bias: "general", vibe: "trust" },
  { sections: ["hero", "features", "testimonials", "cta"], description: "Minimalist", bias: "general", vibe: "calm" },
  { sections: ["hero", "stats", "logos", "features", "testimonials", "cta", "faq", "pricing"], description: "Maximum trust", bias: "social-proof", vibe: "confident" },
  { sections: ["hero", "pricing", "features", "testimonials", "faq", "cta"], description: "Price-first", bias: "feature-forward", vibe: "professional" },
];

const SPACING_CLASSES: Record<string, string> = {
  hero: "py-20 md:py-32",
  features: "py-16 md:py-24",
  testimonials: "py-12 md:py-20",
  pricing: "py-16 md:py-24",
  cta: "py-16 md:py-20",
  faq: "py-12 md:py-16",
  stats: "py-12 md:py-20",
  gallery: "py-12 md:py-16",
  logos: "py-8 md:py-12",
  contact: "py-12 md:py-16",
  comparison: "py-16 md:py-24",
  timeline: "py-12 md:py-20",
  team: "py-12 md:py-20",
};

const LAYOUT_STYLES: Array<"centered" | "asymmetric" | "split" | "full-width" | "grid"> = [
  "centered", "asymmetric", "split", "full-width", "grid",
];

const ANIMATION_PROFILES = [
  { type: "fade" as const, intensity: 2 as const, springPhysics: false },
  { type: "fade" as const, intensity: 3 as const, springPhysics: false },
  { type: "slide" as const, intensity: 2 as const, springPhysics: false },
  { type: "slide" as const, intensity: 3 as const, springPhysics: false },
  { type: "scale" as const, intensity: 2 as const, springPhysics: true },
  { type: "bounce" as const, intensity: 3 as const, springPhysics: true },
  { type: "fade" as const, intensity: 1 as const, springPhysics: false },
  { type: "slide" as const, intensity: 4 as const, springPhysics: true },
];

const lastIndices: number[] = [];

function similarity(a: SectionType[], b: SectionType[]): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  const matches = a.filter((s, i) => s === b[i]).length;
  return matches / maxLen;
}

export function selectPattern(niche: string, mood: string): { sections: Section[]; layout: "centered" | "asymmetric" | "split" | "full-width" | "grid"; animation: { type: "fade" | "slide" | "bounce" | "scale" | "none"; intensity: 1 | 2 | 3 | 4 | 5; springPhysics?: boolean } } {
  const moodToBias: Record<string, string> = {
    calm: "calm",
    trust: "social-proof",
    professional: "feature-forward",
    growth: "storytelling",
    energetic: "energetic",
    playful: "visual-showcase",
    warm: "warm",
    confident: "confident",
    "data-driven": "data-driven",
    balanced: "balanced",
    stable: "trust",
    compassionate: "warm",
  };

  const targetBias = moodToBias[mood] || "general";
  const available = [...PATTERNS];
  const biasedPatterns = available.filter((p) => p.vibe === targetBias);
  const pool = biasedPatterns.length >= 2 ? biasedPatterns : available;

  let selected: LayoutPattern | null = null;
  let attempts = 0;

  while (attempts < 20) {
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    const candidateIdx = PATTERNS.indexOf(candidate);
    const isRecent = lastIndices.includes(candidateIdx);
    const tooSimilar = lastIndices.length > 0 && similarity(candidate.sections, PATTERNS[lastIndices[lastIndices.length - 1]]?.sections || []) > 0.6;

    if ((!isRecent || attempts > 10) && !tooSimilar) {
      selected = candidate;
      break;
    }
    attempts++;
  }

  if (!selected) {
    selected = pool[Math.floor(Math.random() * pool.length)];
  }

  const idx = PATTERNS.indexOf(selected);
  lastIndices.push(idx);
  if (lastIndices.length > 5) lastIndices.shift();

  const layoutStyle = LAYOUT_STYLES[Math.floor(Math.random() * LAYOUT_STYLES.length)];
  const animation = ANIMATION_PROFILES[Math.floor(Math.random() * ANIMATION_PROFILES.length)];

  const spacingOptions: SpacingScale[] = ["compact", "comfortable", "spacious", "breathing"];
  const sectionCount = selected.sections.length;

  const sections: Section[] = selected.sections.map((type, i) => {
    const spacingIdx = sectionCount <= 4
      ? (i < 2 ? 3 : 2)
      : sectionCount <= 6
      ? (i === 0 ? 3 : i === sectionCount - 1 ? 2 : Math.random() > 0.5 ? 2 : 1)
      : Math.floor(Math.random() * 4);

    return {
      id: `${type}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      order: i + 1,
      content: {},
      twClasses: [SPACING_CLASSES[type] || "py-12"],
      spacing: spacingOptions[Math.min(spacingIdx, spacingOptions.length - 1)],
    };
  });

  return { sections, layout: layoutStyle, animation };
}

export function mutateSection(section: Section, strength: number): Section {
  const spacingOptions: SpacingScale[] = ["compact", "comfortable", "spacious", "breathing"];
  const currentIdx = spacingOptions.indexOf(section.spacing);
  const shift = Math.floor(Math.random() * (strength + 1)) - Math.floor(strength / 2);
  const newIdx = Math.max(0, Math.min(spacingOptions.length - 1, currentIdx + shift));

  return {
    ...section,
    spacing: spacingOptions[newIdx],
  };
}

export function getPatternCount(): number {
  return PATTERNS.length;
}
