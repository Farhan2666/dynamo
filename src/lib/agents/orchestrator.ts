import type { ContextProfile, CopyElement, LayoutSchema, UserSettings } from "@/types";
import { analyzeContext } from "./agent1-context";
import { generateCopy } from "./agent2-copywriter";
import { generateLayout } from "./agent3-ui-engineer";
import { callLLM } from "@/lib/llm/api-call";
import { runResearchAgent, applyResearchToPrompt } from "./agent4-researcher";
import { runSelfReview, type ReviewReport } from "./agent5-reviewer";
import { detectLanguage } from "@/lib/utils/language";
import { extractJsonFromResponse } from "@/lib/utils/json";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function llmAnalyzeContext(
  prompt: string,
  settings: UserSettings
): Promise<ContextProfile | null> {
  try {
    const lang = detectLanguage(prompt);
    const system = `You are a market context analyzer. Analyze the business description and output ONLY valid JSON:
{
  "niche": "exact business category (be specific, not just 'saas' or 'tech')",
  "industryTags": ["3-5 specific keywords about this business"],
  "primaryColor": "hex color based on brand psychology for this industry",
  "secondaryColor": "hex secondary color",
  "accentColor": "hex accent color (often complementary to primary, for small highlights)",
  "primaryFont": "heading font (Inter, Sora, or Poppins)",
  "secondaryFont": "body font (Inter, Sora, or Poppins)",
  "layoutPriority": ["hero", "features", "testimonials", "cta"],
  "audiencePersona": "specific target audience description",
  "moodProfile": "one of: trust, professional, calm, growth, energetic, playful, warm, confident, balanced",
  "language": "${lang}"
}

The MOST IMPORTANT rule: niche MUST be specific (e.g. "cattle farming marketplace" not "ecommerce"; "vegan bakery" not "food"). Use terms from the user's prompt directly.
ONLY valid JSON. No markdown. No explanations.`;

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
  settings: UserSettings,
  researchContext?: string
): Promise<LayoutSchema | null> {
  try {
    const lang = context.language || "en";
    const langNote = lang === "id"
      ? "BAHASA: Semua teks konten (headline, subheadline, title, description, dll) harus dalam BAHASA INDONESIA. Jangan pakai bahasa Inggris. Gunakan bahasa Indonesia yang alami dan menarik."
      : "LANGUAGE: All content text (headline, subheadline, title, descriptions, etc.) must be in ENGLISH.";
    const copySummary = copy.map((c) => `${c.type}: ${c.content}`).join("\n");
    const system = `You are a world-class UI engineer who designs like a human art director, not an AI template machine. Design a beautiful landing page layout for ${context.niche} (mood: ${context.moodProfile}).`;
${langNote}

DESIGN SYSTEM-FIRST APPROACH:
Before writing any UI code, define a complete design system:
- Color roles: primary, secondary, accent, surface, text, border with specific hex values
- Typography: display font (expressive), heading font, body font with specific sizes/weights
- Spacing: section padding, container max-width, grid gaps, stack gaps
- Border radius scale
- Shadow system

Then generate the layout WITHIN these constraints.

INTENTIONAL ASYMMETRY:
This page MUST NOT look AI-generated (too symmetrical). Apply:
- Broken grids, overlapping sections, staggered cards
- Clipped corners or diagonal clip-paths
- Odd-numbered grids, floating CTA with negative margin
- Varying card heights, content bleeding past containers

Output JSON with:
- layout: centered|asymmetric|split|full-width|grid|broken-grid|diagonal|bleed
- sections: array of {id, type, order, content (ALL fields filled), twClasses, spacing}
- animations: {type, intensity 1-5, springPhysics}
- twConfig: string array with design system variables
- designSystem (object): the complete design system

{
  "layout": "centered|asymmetric|split|full-width|grid (pick best for ${context.niche})",
  "sections": [
    {
      "type": "hero|features|testimonials|pricing|cta|faq|stats|gallery|logos|contact|comparison|timeline|team",
      "order": 1,
      "twClasses": ["tailwind classes like py-20 md:py-32"],
      "spacing": "compact|comfortable|spacious|breathing",
      "content": {
        "headline": "specific headline for this section",
        "subheadline": "supporting description",
        ...section-specific fields
      }
    }
  ],
  "animations": {
    "type": "fade|slide|bounce|scale",
    "intensity": 1-5,
    "springPhysics": true or false
  },
  "twConfig": ["font-heading: ${context.primaryFont}", "font-body: ${context.secondaryFont}"]
}

RULES:
- Pick 4-8 sections that tell the best story for "${context.niche}" — choose section TYPES and ORDER that match this specific industry
- CRITICAL: Generate ORIGINAL, niche-specific content for each section. Do NOT use generic phrases like "transform your business" or "take your productivity to the next level"
- Use vocabulary specific to ${context.niche} industry

EXACT content keys per section type (use these EXACT field names in the content object):

hero content: { "headline": "...", "subheadline": "...", "cta": "...", "badge?": "optional badge" }

features content: { "title": "...", "subtitle": "...", "feature_1_title": "...", "feature_1_desc": "...", "feature_2_title": "...", "feature_2_desc": "...", "feature_3_title": "...", "feature_3_desc": "..." }

testimonials content: { "title": "...", "subtitle": "...", "quote_1": "...", "name_1": "...", "role_1": "...", "quote_2": "...", "name_2": "...", "role_2": "..." }

pricing content: { "title": "...", "subtitle": "...", "plan_1_name": "...", "plan_1_price": "$...", "plan_1_desc": "...", "plan_1_feat_1": "...", "plan_1_feat_2": "...", "plan_1_feat_3": "...", "plan_1_feat_4": "...", "plan_2_name": "...", "plan_2_price": "$...", "plan_2_feat_1": "...", "plan_2_feat_2": "...", "plan_3_name": "...", "plan_3_price": "$..." }

cta content: { "headline": "...", "subheadline": "...", "button": "..." }

faq content: { "title": "...", "subtitle": "...", "q_1": "...", "a_1": "...", "q_2": "...", "a_2": "...", "q_3": "...", "a_3": "..." }

stats content: { "stat_1_value": "...", "stat_1_label": "...", "stat_2_value": "...", "stat_2_label": "...", "stat_3_value": "...", "stat_3_label": "...", "stat_4_value": "...", "stat_4_label": "..." }

gallery content: { "title": "...", "subtitle": "..." }

logos content: { "title": "..." }

contact content: { "title": "...", "subtitle": "...", "email": "...", "phone": "..." }

team content: { "title": "...", "subtitle": "...", "member_1_name": "...", "member_1_role": "...", "member_2_name": "...", "member_2_role": "...", "member_3_name": "..." }

comparison content: { "title": "...", "subtitle": "...", "col_1_name": "Our Product", "col_1_feat_1": "...", "col_1_feat_2": "...", "col_2_name": "Others", "col_2_feat_1": "...", "col_2_feat_2": "..." }

timeline content: { "title": "...", "subtitle": "...", "step_1_title": "...", "step_1_desc": "...", "step_2_title": "...", "step_2_desc": "...", "step_3_title": "...", "step_3_desc": "...", "step_4_title": "..." }

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
    const llmResult = await llmGenerateLayout(effectiveContext, settings, researchContext);
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


