import type { Section, SectionType, SpacingScale } from "@/types";

interface LayoutPattern {
  sections: SectionType[];
  description: string;
  bias: string;
}

const PATTERNS: LayoutPattern[] = [
  { sections: ["hero", "features", "testimonials", "pricing", "cta", "faq"], description: "Classic conversion", bias: "general" },
  { sections: ["hero", "logos", "stats", "features", "cta", "testimonials"], description: "Social proof first", bias: "social-proof" },
  { sections: ["hero", "cta", "features", "comparison", "testimonials", "faq"], description: "Early hook", bias: "general" },
  { sections: ["hero", "features", "cta", "pricing", "testimonials", "faq"], description: "Feature-forward", bias: "feature-forward" },
  { sections: ["hero", "gallery", "features", "testimonials", "cta", "contact"], description: "Visual showcase", bias: "visual-showcase" },
  { sections: ["hero", "stats", "features", "testimonials", "pricing", "cta", "faq"], description: "Data-driven", bias: "data-driven" },
  { sections: ["hero", "timeline", "features", "testimonials", "team", "cta"], description: "Storytelling", bias: "storytelling" },
  { sections: ["hero", "features", "comparison", "testimonials", "pricing", "cta", "faq"], description: "Comparison heavy", bias: "general" },
  { sections: ["hero", "logos", "features", "stats", "cta", "testimonials", "contact"], description: "Brand trust", bias: "social-proof" },
  { sections: ["hero", "cta", "features", "pricing", "faq", "contact"], description: "Short & punchy", bias: "general" },
  { sections: ["hero", "testimonials", "stats", "features", "cta", "pricing"], description: "Testimonial-first", bias: "testimonial-first" },
  { sections: ["hero", "features", "cta", "testimonials", "gallery", "contact"], description: "Visual-heavy", bias: "visual-showcase" },
  { sections: ["hero", "stats", "cta", "features", "testimonials", "faq", "pricing"], description: "Stats anchor", bias: "data-driven" },
  { sections: ["hero", "team", "features", "testimonials", "cta", "contact"], description: "People-first", bias: "people-first" },
  { sections: ["hero", "gallery", "cta", "features", "testimonials", "pricing", "faq"], description: "Portfolio style", bias: "portfolio-style" },
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

const SECTION_CONTENT: Record<string, Record<string, string>> = {
  hero: { headline: "", subheadline: "", cta: "" },
  features: { title: "", subtitle: "" },
  testimonials: { title: "", subtitle: "" },
  pricing: { title: "", subtitle: "" },
  cta: { headline: "", button: "" },
  faq: { title: "", subtitle: "" },
  stats: { title: "" },
  gallery: { title: "", subtitle: "" },
  logos: { title: "" },
  contact: { title: "", subtitle: "" },
  comparison: { title: "", subtitle: "" },
  timeline: { title: "", subtitle: "" },
  team: { title: "", subtitle: "" },
};

const lastIndices: number[] = [];

export function selectPattern(niche: string, mood: string): Section[] {
  const available = [...PATTERNS];
  const bias = mood === "calm" ? "visual-showcase"
    : mood === "trust" ? "social-proof"
    : mood === "professional" ? "feature-forward"
    : mood === "growth" ? "storytelling"
    : mood === "playful" ? "portfolio-style"
    : mood === "data-driven" ? "data-driven"
    : "general";

  const biasedPatterns = bias === "general"
    ? available
    : available.filter((p) => p.bias === bias);

  const pool = biasedPatterns.length >= 2 ? biasedPatterns : available;

  let selected: LayoutPattern | null = null;
  let attempts = 0;

  while (attempts < 15) {
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    const candidateIdx = PATTERNS.indexOf(candidate);

    const isRecent = lastIndices.includes(candidateIdx);
    if (!isRecent || attempts > 8) {
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

  return selected.sections.map((type, i) => ({
    id: `${type}-${i}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    order: i + 1,
    content: { ...SECTION_CONTENT[type] },
    twClasses: [SPACING_CLASSES[type] || "py-12"],
    spacing: (i === 0 ? "spacious" : i === selected!.sections.length - 1 ? "compact" : "comfortable") as SpacingScale,
  }));
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
