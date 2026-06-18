import type { Section, SectionType, SpacingScale, AsymmetryRule } from "@/types";

interface LayoutPattern {
  sections: SectionType[];
  description: string;
  bias: string;
  vibe: string;
  premium?: "shadcn" | "glass" | "gradient" | "editorial" | "brutalist";
}

const PATTERNS: LayoutPattern[] = [
  { sections: ["hero", "logos", "stats", "features", "testimonials", "pricing", "faq", "cta"], description: "Full conversion funnel", bias: "general", vibe: "trust", premium: "shadcn" },
  { sections: ["hero", "features", "testimonials", "pricing", "faq", "cta"], description: "Classic SaaS", bias: "general", vibe: "professional", premium: "shadcn" },
  { sections: ["hero", "testimonials", "stats", "features", "cta", "pricing"], description: "Social proof anchor", bias: "social-proof", vibe: "trust" },
  { sections: ["hero", "cta", "features", "comparison", "testimonials", "faq"], description: "Early hook", bias: "general", vibe: "energetic", premium: "editorial" },
  { sections: ["hero", "features", "cta", "pricing", "testimonials", "faq"], description: "Feature-forward SaaS", bias: "feature-forward", vibe: "professional", premium: "shadcn" },
  { sections: ["hero", "gallery", "features", "testimonials", "cta", "contact"], description: "Visual showcase", bias: "visual-showcase", vibe: "playful", premium: "glass" },
  { sections: ["hero", "stats", "features", "testimonials", "pricing", "cta", "faq"], description: "Data-driven conversion", bias: "data-driven", vibe: "balanced" },
  { sections: ["hero", "timeline", "features", "testimonials", "team", "cta"], description: "Storytelling flow", bias: "storytelling", vibe: "warm", premium: "editorial" },
  { sections: ["hero", "features", "comparison", "testimonials", "pricing", "cta", "faq"], description: "Comparison-heavy", bias: "general", vibe: "professional", premium: "shadcn" },
  { sections: ["hero", "logos", "features", "stats", "testimonials", "cta", "contact"], description: "Brand trust builder", bias: "social-proof", vibe: "confident" },
  { sections: ["hero", "cta", "features", "pricing", "faq", "contact"], description: "Short & punchy", bias: "general", vibe: "energetic", premium: "brutalist" },
  { sections: ["hero", "testimonials", "features", "cta", "pricing", "faq"], description: "Testimonial-first", bias: "testimonial-first", vibe: "trust", premium: "shadcn" },
  { sections: ["hero", "features", "cta", "stats", "testimonials", "gallery", "contact"], description: "Visual-heavy hybrid", bias: "visual-showcase", vibe: "playful", premium: "glass" },
  { sections: ["hero", "stats", "cta", "features", "testimonials", "faq"], description: "Stats anchor short", bias: "data-driven", vibe: "balanced" },
  { sections: ["hero", "team", "features", "testimonials", "cta", "contact"], description: "People-first", bias: "people-first", vibe: "warm", premium: "editorial" },
  { sections: ["hero", "gallery", "cta", "features", "testimonials", "pricing", "faq"], description: "Portfolio style", bias: "portfolio-style", vibe: "creative", premium: "glass" },
  { sections: ["hero", "logos", "features", "testimonials", "cta", "faq", "stats", "pricing"], description: "Long-form conversion", bias: "general", vibe: "trust" },
  { sections: ["hero", "features", "testimonials", "cta"], description: "Minimalist", bias: "general", vibe: "calm", premium: "editorial" },
  { sections: ["hero", "stats", "logos", "features", "testimonials", "cta", "faq", "pricing"], description: "Maximum trust", bias: "social-proof", vibe: "confident" },
  { sections: ["hero", "pricing", "features", "testimonials", "faq", "cta"], description: "Price-first", bias: "feature-forward", vibe: "professional", premium: "shadcn" },
];

const SHADCN_TW_CLASSES: Record<string, string[]> = {
  hero: ["relative", "overflow-hidden", "bg-gradient-to-b", "from-surface", "to-surface-secondary"],
  features: ["grid", "md:grid-cols-3", "gap-6", "md:gap-8"],
  testimonials: ["grid", "md:grid-cols-2", "gap-6", "auto-rows-fr"],
  pricing: ["grid", "md:grid-cols-3", "gap-6", "items-start"],
  cta: ["relative", "overflow-hidden", "rounded-xl", "bg-gradient-to-br", "from-brand-primary", "via-brand-primary-light", "to-brand-secondary"],
  faq: ["max-w-3xl", "mx-auto", "divide-y", "divide-surface-tertiary"],
  stats: ["grid", "grid-cols-2", "md:grid-cols-4", "gap-8", "md:gap-12"],
  gallery: ["grid", "grid-cols-2", "md:grid-cols-3", "gap-4", "auto-rows-[200px]", "md:auto-rows-[280px]"],
  logos: ["flex", "flex-wrap", "justify-center", "gap-8", "md:gap-12", "items-center"],
  contact: ["grid", "md:grid-cols-2", "gap-8", "md:gap-12"],
  comparison: ["overflow-hidden", "rounded-xl", "border", "border-surface-tertiary"],
  timeline: ["relative", "pl-8", "md:pl-12", "border-l-2", "border-brand-primary/20"],
  team: ["grid", "md:grid-cols-2", "lg:grid-cols-4", "gap-6", "md:gap-8"],
  default: ["max-w-7xl", "mx-auto", "px-4", "sm:px-6", "lg:px-8"],
};

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

const LAYOUT_STYLES: Array<"centered" | "asymmetric" | "split" | "full-width" | "grid" | "broken-grid" | "diagonal" | "bleed"> = [
  "centered", "asymmetric", "split", "full-width", "grid",
  "broken-grid", "diagonal", "bleed",
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
  { type: "scale" as const, intensity: 3 as const, springPhysics: false },
  { type: "bounce" as const, intensity: 2 as const, springPhysics: true },
  { type: "fade" as const, intensity: 4 as const, springPhysics: true },
  { type: "slide" as const, intensity: 5 as const, springPhysics: true },
];

const lastIndices: number[] = [];

function similarity(a: SectionType[], b: SectionType[]): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  const matches = a.filter((s, i) => s === b[i]).length;
  return matches / maxLen;
}

function generateAsymmetryRules(mood: string, intensity: number): AsymmetryRule[] {
  const rules: AsymmetryRule[] = [];

  if (intensity < 2) return rules;

  if (intensity >= 2) {
    rules.push({
      type: "offset-grid",
      params: { columns: 5, ratio: "60/40" },
    });
  }

  if (intensity >= 3) {
    rules.push({
      type: "stagger",
      params: { offset: "2rem", alternate: true },
    });
    rules.push({
      type: "overlap",
      targetSection: "features",
      params: { amount: "-3rem" },
    });
  }

  if (intensity >= 4) {
    rules.push({
      type: "broken-grid",
      params: { heroSpan: "2/3", oddColumns: true },
    });
    rules.push({
      type: "clipped-corner",
      targetSection: "hero",
      params: { angle: "4deg" },
    });
  }

  if (intensity >= 5) {
    rules.push({
      type: "diagonal-clip",
      params: { angle: "-2deg", repeat: true },
    });
    rules.push({
      type: "floating",
      targetSection: "cta",
      params: { translateY: "-4rem", shadow: "2xl" },
    });
    rules.push({
      type: "bleed",
      params: { sides: "left", amount: "-10%" },
    });
  }

  if (mood === "playful" || mood === "creative" || mood === "energetic") {
    rules.push({
      type: "broken-grid",
      params: { heroSpan: "full", oddColumns: true, randomHeight: true },
    });
  }

  if (mood === "calm" || mood === "warm" || mood === "compassionate") {
    rules.push({
      type: "floating",
      params: { translateY: "-2rem", shadow: "md", count: 2 },
    });
  }

  if (mood === "trust" || mood === "professional" || mood === "confident") {
    rules.push({
      type: "clipped-corner",
      targetSection: "hero",
      params: { angle: "3deg", sides: "bottom" },
    });
  }

  return rules;
}

export function selectPattern(niche: string, mood: string, asymmetryIntensity?: number): {
  sections: Section[];
  layout: "centered" | "asymmetric" | "split" | "full-width" | "grid" | "broken-grid" | "diagonal" | "bleed";
  animation: { type: "fade" | "slide" | "bounce" | "scale" | "none"; intensity: 1 | 2 | 3 | 4 | 5; springPhysics?: boolean };
  asymmetryRules?: AsymmetryRule[];
  premium?: string;
} {
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

  const intensity = asymmetryIntensity || (mood === "playful" || mood === "creative" || mood === "energetic" ? 4 : mood === "calm" || mood === "balanced" ? 2 : 3);
  const asymmetryRules = generateAsymmetryRules(mood, intensity);

  const layoutStyle = asymmetryRules.length > 2
    ? (["broken-grid", "diagonal", "asymmetric", "bleed", "split"] as const)[Math.floor(Math.random() * 5)]
    : asymmetryRules.length > 0
    ? (["asymmetric", "split", "broken-grid", "centered"] as const)[Math.floor(Math.random() * 4)]
    : LAYOUT_STYLES[Math.floor(Math.random() * 5)];

  const animation = ANIMATION_PROFILES[Math.floor(Math.random() * ANIMATION_PROFILES.length)];

  const premium = selected.premium || "shadcn";

  const spacingOptions: SpacingScale[] = ["compact", "comfortable", "spacious", "breathing"];
  const sectionCount = selected.sections.length;

  const sections: Section[] = selected.sections.map((type, i) => {
    let spacingIdx: number;
    if (sectionCount <= 4) {
      spacingIdx = i < 2 ? 3 : 2;
    } else if (sectionCount <= 6) {
      spacingIdx = i === 0 ? 3 : i === sectionCount - 1 ? 2 : Math.random() > 0.5 ? 2 : 1;
    } else {
      spacingIdx = Math.floor(Math.random() * 4);
    }

    const baseClasses = [SPACING_CLASSES[type] || "py-12"];
    const shadcnClasses = SHADCN_TW_CLASSES[type] || SHADCN_TW_CLASSES.default;
    const combinedClasses = [...baseClasses, ...shadcnClasses];

    return {
      id: `${type}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      order: i + 1,
      content: {},
      twClasses: combinedClasses,
      spacing: spacingOptions[Math.min(spacingIdx, spacingOptions.length - 1)],
    };
  });

  return { sections, layout: layoutStyle, animation, asymmetryRules, premium };
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
