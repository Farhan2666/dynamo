import type { ContextProfile, CopyElement, LayoutSchema, UserSettings } from "@/types";
import { analyzeContext } from "./agent1-context";
import { generateCopy } from "./agent2-copywriter";
import { generateLayout } from "./agent3-ui-engineer";
import { callLLM } from "@/lib/llm/api-call";
import { runResearchAgent, applyResearchToPrompt } from "./agent4-researcher";
import { runSelfReview, type ReviewReport } from "./agent5-reviewer";
import { detectLanguage } from "@/lib/utils/language";
import { extractJsonFromResponse } from "@/lib/utils/json";
import { getCuratedStyles, getCuratedColors, getCuratedFonts, getCuratedProducts, formatCuratedPicks, getAntiSlopRules } from "@/lib/skill-loader";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function llmAnalyzeContext(
  prompt: string,
  settings: UserSettings
): Promise<ContextProfile | null> {
  try {
    const lang = detectLanguage(prompt);
    const skillInject = settings?.skillInject ?? true;
    const curatedProducts = skillInject ? formatCuratedPicks(getCuratedProducts(prompt, [], 3), "INDUSTRY MATCHES") : "";
    const curatedColors = skillInject ? formatCuratedPicks(getCuratedColors(prompt, [], 3), "SUGGESTED COLOR PALETTES") : "";
    const curatedFonts = skillInject ? formatCuratedPicks(getCuratedFonts(prompt, [], 3), "SUGGESTED FONTS") : "";
    const curatedStyles = skillInject ? formatCuratedPicks(getCuratedStyles(prompt, [], 3), "SUGGESTED STYLES") : "";

    const skillBlock = skillInject ? `

Design references for this business:
${curatedStyles}
${curatedColors}
${curatedFonts}
${curatedProducts}
` : "";

    const system = `Analyze this business and output JSON.${skillBlock}

{
  "niche": "specific category (e.g. 'vegan bakery' not 'food')",
  "industryTags": ["3-5 keywords"],
  "primaryColor": "hex",
  "secondaryColor": "hex",
  "accentColor": "hex",
  "primaryFont": "heading font",
  "secondaryFont": "body font",
  "layoutPriority": ["hero", "features", "cta"],
  "audiencePersona": "target audience",
  "moodProfile": "trust|professional|calm|growth|energetic|playful|warm|confident|balanced|creative|stable|compassionate",
  "language": "${lang}"
}

ONLY valid JSON.`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Analyze this business: ${prompt}`,
      responseFormat: "json",
    });

    return JSON.parse(extractJsonFromResponse(result.content)) as ContextProfile;
  } catch (e) {
    console.warn("[Agent 1] LLM error:", e instanceof Error ? e.message : e);
    return null;
  }
}

async function llmGenerateCopy(
  context: ContextProfile,
  settings: UserSettings
): Promise<CopyElement[] | null> {
  try {
    const lang = context.language || "en";
    const langNote = lang === "id"
      ? "BAHASA: Semua teks harus dalam BAHASA INDONESIA. Gunakan kata-kata Indonesia yang alami dan spesifik untuk industri ini."
      : "LANGUAGE: All text must be in ENGLISH with industry-specific vocabulary.";
    const system = `You are a world-class conversion copywriter who writes like a human marketer, not an AI. Generate marketing copy for a landing page targeting ${context.audiencePersona} in the ${context.niche} industry.
Mood: ${context.moodProfile}.

${langNote}

CRITICAL RULES:
- Create ORIGINAL, UNIQUE copy specific to ${context.niche} — avoid generic phrases
- Use specific vocabulary related to ${context.industryTags.join(", ")}
- Each headline/subheader/cta must feel deeply specific to this niche

CONTENT-DRIVEN DESIGN APPROACH:
- Write the content FIRST, as if it's a real brand's website copy.
- Make headlines specific and opinionated.
- Include a hook that grabs attention emotionally.
- Write micro-copy (short, punchy phrases for buttons, badges, footnotes).
- Include real-feeling social proof (stats, user counts, testimonials).

Output a JSON array of objects with:
- type: "headline" | "subheader" | "cta" | "benefit" | "seo" | "story" | "microcopy" | "social_proof"
- content: string
- variants: string[] (2-3 alternative phrasings)
- hook: string (optional, for headlines)
- tone: string (optional)

Include at least 2 microcopy items and 1 story item. Return ONLY valid JSON.`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Write conversion copy for a ${context.niche} business targeting ${context.audiencePersona}. Tags: ${context.industryTags.join(", ")}. Language: ${lang}. Be specific to this niche, not generic.`,
      responseFormat: "json",
    });

    return JSON.parse(extractJsonFromResponse(result.content)) as CopyElement[];
  } catch (e) {
    console.warn("[Agent 2] LLM error:", e instanceof Error ? e.message : e);
    return null;
  }
}

async function llmGenerateLayout(
  context: ContextProfile,
  copy: CopyElement[],
  settings: UserSettings,
  researchContext?: string
): Promise<LayoutSchema | null> {
  try {
    const lang = context.language || "en";
    const langNote = lang === "id"
      ? "BAHASA: Semua teks konten (headline, subheadline, title, description, dll) harus dalam BAHASA INDONESIA. Jangan pakai bahasa Inggris. Gunakan bahasa Indonesia yang alami dan menarik."
      : "LANGUAGE: All content text (headline, subheadline, title, descriptions, etc.) must be in ENGLISH.";
    const copySummary = copy.map((c) => `${c.type}: ${c.content}`).join("\n");
    const skillInject = settings?.skillInject ?? true;
    const niche = context.niche;
    const tags = context.industryTags || [];
    const curatedStyles = skillInject ? formatCuratedPicks(getCuratedStyles(niche, tags, 5), "STYLE IDEAS (top picks for this industry)") : "";
    const curatedColors = skillInject ? formatCuratedPicks(getCuratedColors(niche, tags, 3), "COLOR PALETTES (best match for this industry)") : "";
    const curatedFonts = skillInject ? formatCuratedPicks(getCuratedFonts(niche, tags, 3), "FONT PAIRINGS (recommended for this industry)") : "";
    const antiSlopRef = skillInject ? getAntiSlopRules() : "";

    const skillBlock = skillInject ? `

Design reference for ${niche}:
${curatedStyles}
${curatedColors}
${curatedFonts}
` : "";

    const system = `You are a world-class UI engineer designing for ${niche}. Create a landing page for ${context.audiencePersona} (mood: ${context.moodProfile}).
${langNote}${skillBlock}

${antiSlopRef}

CSS EFFECTS LIBRARY (use mood-appropriate effects):
- NEON GLOW: For cyberpunk/gaming/creative — text-shadow: 0 0 10px color, box-shadow: 0 0 20px color
- CRT SCANLINES: For retro/sci-fi — ::before overlay with repeating linear-gradient
- GLITCH: For edgy/tech — @keyframes with translate + skew offset
- SHIMMER: For premium/luxury — background: linear-gradient with animated background-position
- GRADIENT MESH: For calm/warm — multiple radial-gradient blobs with float animation
- ANIMATED GRADIENT: For playful/energetic — @keyframes moving gradient background
- FLOATING PARTICLES: For creative — absolute positioned dots with float animation
- GLASS MORPHISM: backdrop-filter: blur + translucent background + subtle border

Mood → Effects mapping:
- playful/creative: NEON GLOW + GLITCH + FLOATING PARTICLES + ANIMATED GRADIENT
- energetic: NEON GLOW + SHIMMER + ANIMATED GRADIENT
- calm/stable: GRADIENT MESH + subtle shadows
- trust/professional: SHIMMER + refined shadows
- warm: GRADIENT MESH + ANIMATED GRADIENT
- growth/compassionate: SHIMMER + GRADIENT MESH

Output JSON:
{
  "layout": "centered|asymmetric|split|full-width|grid",
  "sections": [
    {
      "type": "hero|features|testimonials|pricing|cta|faq|stats|gallery|logos|contact|comparison|timeline|team",
      "order": 1,
      "content": { /* ALL fields below */ },
      "twClasses": ["py-20 md:py-32"],
      "spacing": "compact|comfortable|spacious|breathing"
    }
  ],
  "animations": { "type": "fade|slide|bounce|scale", "intensity": 1-5 },
  "twConfig": ["font-heading: ...", "font-body: ..."],
  "designSystem": { "colors": {...}, "typography": {...}, "spacing": {...} }
}

Content fields per section type:
hero: headline, subheadline, cta, badge
features: title, subtitle, feature_1_title, feature_1_desc, feature_2_title, feature_2_desc, feature_3_title, feature_3_desc
testimonials: title, subtitle, quote_1, name_1, role_1, company_1, quote_2, name_2, role_2, company_2
pricing: title, subtitle, plan_1_name, plan_1_price, plan_1_feat_1..4, plan_1_cta, plan_2_name, plan_2_price, plan_2_feat_1..4, plan_2_cta, plan_3_name, plan_3_price, plan_3_feat_1..4, plan_3_cta
cta: headline, subheadline, button
faq: title, subtitle, q_1, a_1, q_2, a_2, q_3, a_3
stats: title, stat_1_value, stat_1_label, stat_2_value, stat_2_label, stat_3_value, stat_3_label, stat_4_value, stat_4_label
gallery: title, subtitle, category_1..4, tag_1..6
logos: title, logo_1..logo_6
contact: title, subtitle, email, phone, address, hours, cta
comparison: title, subtitle, row_1..6, our_val_1..6, their_val_1..6
timeline: title, subtitle, year_1..5, event_1..5, desc_1..5
team: title, subtitle, name_1..4, role_1..4, bio_1..4

Guidelines:
- 4-8 sections, content must be specific to ${niche}
- CTA should be specific to ${niche}, not "Get Started"
- Avoid generic buzzwords: cutting-edge, next-gen, revolutionary
- Make the page feel designed by a human art director, not a template
- All content fields must be filled

ONLY valid JSON. No markdown.`;

    const researchBlock = researchContext ? `\n\nRESEARCH INSIGHTS:\n${researchContext}` : "";
    const userMsg = `Design a landing page layout for ${context.niche} targeting ${context.audiencePersona}. 

CONTENT-DRIVEN DESIGN: The copy below was written FIRST. Design the UI to showcase this content — don't stuff it into a pre-made template.

Use these copy elements as inspiration:\n${copySummary}.${researchBlock}

Generate ALL section content fields — do not leave anything empty. Make every section feel like it was written by a human copywriter, not an AI.

Apply the design system-first approach: output a "designSystem" object with your color roles, typography, spacing, radius, and shadows.

Apply intentional asymmetry: break grids, overlap elements, use diagonal clips, stagger content, vary card heights.

IMPORTANT: All content text must be in language: ${lang}.${lang === "id" ? " Gunakan BAHASA INDONESIA untuk semua teks." : ""}`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: userMsg,
      responseFormat: "json",
    });

    const parsed = JSON.parse(extractJsonFromResponse(result.content)) as LayoutSchema;

    const validSections = parsed.sections.map((s) => ({
      id: `${s.type}-${s.order}-${Math.random().toString(36).slice(2, 8)}`,
      type: s.type,
      order: s.order,
      content: s.content || {},
      twClasses: s.twClasses || [`py-${12 + s.order * 4} md:py-${16 + s.order * 4}`],
      spacing: s.spacing || ("comfortable" as const),
    }));

    return {
      layout: parsed.layout || "centered",
      sections: validSections,
      animations: parsed.animations || { type: "fade", intensity: 3, springPhysics: false },
      twConfig: parsed.twConfig || [],
    };
  } catch (e) {
    console.warn("[Agent 3] LLM error:", e instanceof Error ? e.message : e);
    return null;
  }
}

export async function runAgent1(
  prompt: string,
  settings?: UserSettings
): Promise<{ result: ContextProfile; source: "ai" | "fallback" }> {
  if (settings?.apiKey) {
    const llmResult = await llmAnalyzeContext(prompt, settings);
    if (llmResult) return { result: llmResult, source: "ai" };
  }
  await sleep(600 + Math.random() * 400);
  return { result: analyzeContext(prompt), source: "fallback" };
}

export async function runAgent2(
  context: ContextProfile,
  settings?: UserSettings
): Promise<{ result: CopyElement[]; source: "ai" | "fallback" }> {
  if (settings?.apiKey) {
    const llmResult = await llmGenerateCopy(context, settings);
    if (llmResult) return { result: llmResult, source: "ai" };
  }
  await sleep(400 + Math.random() * 300);
  return { result: generateCopy(context), source: "fallback" };
}

export async function runAgent3(
  context: ContextProfile,
  copy?: CopyElement[],
  settings?: UserSettings,
  vibeOverride?: string | null
): Promise<{ result: LayoutSchema; source: "ai" | "fallback" }> {
  const effectiveContext = vibeOverride && vibeOverride !== ""
    ? { ...context, moodProfile: vibeOverride }
    : context;

  let researchContext: string | undefined;

  if (settings?.apiKey) {
    try {
      const research = await runResearchAgent(effectiveContext, settings);
      if (research) {
        researchContext = applyResearchToPrompt(effectiveContext, research);
      }
    } catch (e) {
      console.warn("[Agent 4] Research failed:", e);
    }
  }

  if (settings?.apiKey) {
    const llmResult = await llmGenerateLayout(effectiveContext, copy || [], settings, researchContext);
    if (llmResult) return { result: llmResult, source: "ai" };
  }
  await sleep(500 + Math.random() * 500);
  return { result: generateLayout(effectiveContext), source: "fallback" };
}

export function runAgent5(
  layout: LayoutSchema,
  copy: CopyElement[],
  context: ContextProfile
): ReviewReport {
  return runSelfReview(layout, copy, context);
}


