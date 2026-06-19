import type { LayoutSchema, CopyElement, ContextProfile, Section } from "@/types";

export interface ReviewIssue {
  sectionId: string;
  sectionType: string;
  field: string;
  severity: "error" | "warning" | "info";
  message: string;
  fixed?: boolean;
}

export interface ConversionMetric {
  category: string;
  score: number;
  maxScore: number;
  tips: string[];
}

export interface ReviewReport {
  overallScore: number;
  conversionScore: number;
  languageScore: number;
  completenessScore: number;
  accessibilityScore: number;
  issues: ReviewIssue[];
  conversionMetrics: ConversionMetric[];
  fixedLayout: LayoutSchema;
}

const EMPTY_PATTERNS = ["", "undefined", "null", "placeholder", "lorem", "sample text", "your text here"];

function isEmpty(val: string | undefined): boolean {
  if (!val) return true;
  const lower = val.trim().toLowerCase();
  return EMPTY_PATTERNS.some((p) => lower.includes(p)) || lower.length < 2;
}

function isTooShort(val: string | undefined, minLen: number = 10): boolean {
  if (!val) return true;
  return val.trim().length < minLen;
}

function isGenericAI(val: string | undefined): boolean {
  if (!val) return false;
  const lower = val.toLowerCase();
  const buzzwords = [
    "cutting-edge", "next-gen", "revolutionary", "game-changer",
    "state-of-the-art", "leverage", "synergy", "paradigm shift",
    "disrupt", "innovative solution", "seamless experience",
    "seamless", "robust", "best-in-class", "industry-leading",
    "cutting edge", "next generation", "groundbreaking",
  ];
  return buzzwords.some((bw) => lower.includes(bw));
}

function hasAISlopColor(layout: LayoutSchema): boolean {
  const ds = layout.designSystem;
  if (!ds) return false;
  const purplePinkGradients = ["#6366F1", "#8B5CF6", "#EC4899", "#A855F7", "#D946EF"];
  const primary = ds.colors.primary.toLowerCase();
  return purplePinkGradients.some((c) => primary.includes(c.toLowerCase()));
}

function detectMixedLanguage(text: string, expectedLang: string): boolean {
  if (!text) return false;
  const idWords = /\b(dan|yang|untuk|dengan|dari|ini|itu|sudah|bisa|akan|tidak|ada|juga|atau|karena)\b/gi;
  const enWords = /\b(the|and|for|with|from|this|that|will|can|have|are|was|were)\b/gi;
  const idMatches = (text.match(idWords) || []).length;
  const enMatches = (text.match(enWords) || []).length;

  if (expectedLang === "id" && enMatches > idMatches * 2 && enMatches > 3) return true;
  if (expectedLang === "en" && idMatches > enMatches * 2 && idMatches > 3) return true;
  return false;
}

const SECTION_REQUIRED_FIELDS: Record<string, string[]> = {
  hero: ["headline", "subheadline", "cta"],
  features: ["title", "feature_1_title", "feature_1_desc", "feature_2_title", "feature_2_desc", "feature_3_title", "feature_3_desc"],
  testimonials: ["title", "quote_1", "name_1", "quote_2", "name_2"],
  pricing: ["title", "plan_1_name", "plan_1_price", "plan_2_name", "plan_2_price", "plan_3_name", "plan_3_price"],
  cta: ["headline", "button"],
  faq: ["title", "q_1", "a_1", "q_2", "a_2"],
  stats: ["stat_1_value", "stat_1_label", "stat_2_value", "stat_2_label", "stat_3_value", "stat_3_label"],
  gallery: ["title"],
  logos: ["title"],
  contact: ["title", "email"],
  comparison: ["title"],
  timeline: ["title"],
  team: ["title"],
};

function reviewSection(section: Section, lang: string): { issues: ReviewIssue[]; fixedSection: Section } {
  const issues: ReviewIssue[] = [];
  const content = { ...section.content };
  const required = SECTION_REQUIRED_FIELDS[section.type] || ["title"];

  for (const field of required) {
    if (isEmpty(content[field])) {
      issues.push({
        sectionId: section.id,
        sectionType: section.type,
        field,
        severity: "error",
        message: `Empty required field: ${field}`,
        fixed: false,
      });
    } else if (isTooShort(content[field], 5)) {
      issues.push({
        sectionId: section.id,
        sectionType: section.type,
        field,
        severity: "warning",
        message: `Too short: ${field}`,
        fixed: false,
      });
    }

    if (isGenericAI(content[field])) {
      issues.push({
        sectionId: section.id,
        sectionType: section.type,
        field,
        severity: "warning",
        message: `Generic AI buzzword detected in: ${field}`,
        fixed: false,
      });
    }

    if (detectMixedLanguage(content[field] || "", lang)) {
      issues.push({
        sectionId: section.id,
        sectionType: section.type,
        field,
        severity: "warning",
        message: `Mixed language detected in: ${field}`,
        fixed: false,
      });
    }
  }

  return { issues, fixedSection: { ...section, content } };
}

function calculateConversionScore(layout: LayoutSchema): { score: number; metrics: ConversionMetric[] } {
  const metrics: ConversionMetric[] = [];
  const sectionTypes = layout.sections.map((s) => s.type);

  // 1. CTA Presence (max 20)
  const ctaCount = sectionTypes.filter((t) => t === "cta").length;
  const heroHasCta = layout.sections.find((s) => s.type === "hero")?.content?.cta;
  const ctaScore = (ctaCount > 0 ? 10 : 0) + (heroHasCta ? 10 : 0);
  metrics.push({
    category: "CTA Effectiveness",
    score: Math.min(ctaScore, 20),
    maxScore: 20,
    tips: ctaCount === 0 ? ["Add at least one CTA section"] : heroHasCta ? [] : ["Add a CTA button to your hero section"],
  });

  // 2. Social Proof (max 25)
  const hasTestimonials = sectionTypes.includes("testimonials");
  const hasLogos = sectionTypes.includes("logos");
  const hasStats = sectionTypes.includes("stats");
  const socialScore = (hasTestimonials ? 10 : 0) + (hasLogos ? 8 : 0) + (hasStats ? 7 : 0);
  metrics.push({
    category: "Social Proof",
    score: socialScore,
    maxScore: 25,
    tips: [
      ...(!hasTestimonials ? ["Add customer testimonials"] : []),
      ...(!hasLogos ? ["Add trusted brand logos"] : []),
      ...(!hasStats ? ["Add compelling statistics"] : []),
    ],
  });

  // 3. Value Proposition (max 20)
  const hero = layout.sections.find((s) => s.type === "hero");
  const hasFeatures = sectionTypes.includes("features");
  const heroHeadline = hero?.content?.headline || "";
  const headlineQuality = heroHeadline.length > 10 && heroHeadline.length < 80 ? 10 : heroHeadline.length > 5 ? 5 : 0;
  const valueScore = headlineQuality + (hasFeatures ? 10 : 0);
  metrics.push({
    category: "Value Proposition",
    score: valueScore,
    maxScore: 20,
    tips: [
      ...(headlineQuality < 10 ? ["Hero headline should be 10-80 characters, clear and specific"] : []),
      ...(!hasFeatures ? ["Add a features section to show value"] : []),
    ],
  });

  // 4. Trust & Urgency (max 15)
  const hasPricing = sectionTypes.includes("pricing");
  const hasFaq = sectionTypes.includes("faq");
  const hasComparison = sectionTypes.includes("comparison");
  const trustScore = (hasPricing ? 5 : 0) + (hasFaq ? 5 : 0) + (hasComparison ? 5 : 0);
  metrics.push({
    category: "Trust & Objection Handling",
    score: trustScore,
    maxScore: 15,
    tips: [
      ...(!hasPricing ? ["Add pricing to reduce purchase anxiety"] : []),
      ...(!hasFaq ? ["Add FAQ to handle objections"] : []),
    ],
  });

  // 5. Content Flow (max 20)
  const heroIdx = sectionTypes.indexOf("hero");
  const lastCtaIdx = sectionTypes.lastIndexOf("cta");
  const totalSections = sectionTypes.length;
  const flowScore =
    (heroIdx === 0 ? 10 : 0) +
    (lastCtaIdx >= totalSections - 2 ? 5 : 0) +
    (totalSections >= 4 && totalSections <= 10 ? 5 : totalSections > 10 ? 2 : 0);
  metrics.push({
    category: "Content Flow",
    score: flowScore,
    maxScore: 20,
    tips: [
      ...(heroIdx !== 0 ? ["Hero section should be first"] : []),
      ...(lastCtaIdx < totalSections - 2 ? ["Add a CTA near the bottom of the page"] : []),
      ...(totalSections < 4 ? ["Add more sections for a complete landing page"] : []),
    ],
  });

  const totalScore = metrics.reduce((sum, m) => sum + m.score, 0);
  return { score: totalScore, metrics };
}

function calculateLanguageScore(layout: LayoutSchema, lang: string): number {
  let totalFields = 0;
  let mixedFields = 0;

  for (const section of layout.sections) {
    for (const val of Object.values(section.content)) {
      if (val && val.trim().length > 3) {
        totalFields++;
        if (detectMixedLanguage(val, lang)) mixedFields++;
      }
    }
  }

  if (totalFields === 0) return 50;
  const purity = 1 - mixedFields / totalFields;
  return Math.round(purity * 100);
}

function calculateCompletenessScore(layout: LayoutSchema): number {
  let totalRequired = 0;
  let filledRequired = 0;

  for (const section of layout.sections) {
    const required = SECTION_REQUIRED_FIELDS[section.type] || ["title"];
    totalRequired += required.length;
    for (const field of required) {
      if (!isEmpty(section.content[field])) filledRequired++;
    }
  }

  if (totalRequired === 0) return 100;
  return Math.round((filledRequired / totalRequired) * 100);
}

function getLuminance(hex: string): number {
  const rgb = hex.replace("#", "").match(/.{2}/g)?.map((c) => {
    const v = parseInt(c, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }) || [0, 0, 0];
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function calculateAccessibilityScore(context: ContextProfile, layout: LayoutSchema): number {
  let score = 0;

  // WCAG contrast check: primary color on white
  const contrastOnWhite = getContrastRatio(context.primaryColor, "#FFFFFF");
  if (contrastOnWhite >= 7) score += 30;
  else if (contrastOnWhite >= 4.5) score += 20;
  else if (contrastOnWhite >= 3) score += 10;

  // WCAG contrast check: text on dark bg (hero/cta sections)
  const heroSection = layout.sections.find((s) => s.type === "hero");
  if (heroSection) {
    const contrastOnPrimary = getContrastRatio("#FFFFFF", context.primaryColor);
    if (contrastOnPrimary >= 4.5) score += 25;
    else if (contrastOnPrimary >= 3) score += 15;
  }

  // Section count not overwhelming
  if (layout.sections.length >= 3 && layout.sections.length <= 12) score += 15;
  else if (layout.sections.length > 12) score += 5;

  // Has alt-text equivalent (descriptive content)
  const hasDescriptiveContent = layout.sections.some(
    (s) => s.content.subtitle && s.content.subtitle.length > 20
  );
  if (hasDescriptiveContent) score += 10;

  // Has FAQ for accessibility (screen readers love structured content)
  if (layout.sections.some((s) => s.type === "faq")) score += 10;

  // Has contact info
  if (layout.sections.some((s) => s.type === "contact")) score += 10;

  return Math.min(100, score);
}

function detectAISlopIssues(layout: LayoutSchema): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  if (hasAISlopColor(layout)) {
    issues.push({
      sectionId: "design-system",
      sectionType: "global",
      field: "primaryColor",
      severity: "warning",
      message: "AI-slop purple/pink gradient detected — replace with intentional brand colors",
    });
  }
  if (layout.twConfig?.some((c) => c.includes("Inter"))) {
    issues.push({
      sectionId: "design-system",
      sectionType: "global",
      field: "typography",
      severity: "info",
      message: "Inter font detected — consider a more distinctive pairing from the 58 font options",
    });
  }
  const ctaTexts = layout.sections
    .filter((s) => s.content?.cta)
    .map((s) => s.content.cta.toLowerCase());
  if (ctaTexts.some((t) => t.includes("get started"))) {
    issues.push({
      sectionId: "cta",
      sectionType: "cta",
      field: "cta",
      severity: "info",
      message: "Generic 'Get Started' CTA — use context-specific action text",
    });
  }
  return issues;
}

export function runSelfReview(
  layout: LayoutSchema,
  copy: CopyElement[],
  context: ContextProfile
): ReviewReport {
  const lang = context.language || "en";
  const allIssues: ReviewIssue[] = [];
  const fixedSections: Section[] = [];

  for (const section of layout.sections) {
    const { issues, fixedSection } = reviewSection(section, lang);
    allIssues.push(...issues);
    fixedSections.push(fixedSection);
  }

  const aiSlopIssues = detectAISlopIssues(layout);
  allIssues.push(...aiSlopIssues);

  const { score: conversionScore, metrics } = calculateConversionScore(layout);
  const languageScore = calculateLanguageScore(layout, lang);
  const completenessScore = calculateCompletenessScore(layout);
  const accessibilityScore = calculateAccessibilityScore(context, layout);

  const slopPenalty = aiSlopIssues.length * 5;
  const overallScore = Math.max(0, Math.round(
    conversionScore * 0.35 + languageScore * 0.25 + completenessScore * 0.25 + accessibilityScore * 0.15 - slopPenalty
  ));

  return {
    overallScore,
    conversionScore,
    languageScore,
    completenessScore,
    accessibilityScore,
    issues: allIssues,
    conversionMetrics: metrics,
    fixedLayout: { ...layout, sections: fixedSections },
  };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Great";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Needs Work";
  return "Poor";
}
