import type { ContextProfile, CopyElement, LayoutSchema, UserSettings } from "@/types";
import { analyzeContext } from "./agent1-context";
import { generateCopy } from "./agent2-copywriter";
import { generateLayout } from "./agent3-ui-engineer";
import { callLLM } from "@/lib/llm/api-call";
import { runResearchAgent, applyResearchToPrompt } from "./agent4-researcher";
import { runSelfReview, type ReviewReport } from "./agent5-reviewer";
import { detectLanguage } from "@/lib/utils/language";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function stripCodeFences(text: string): string {
  return text.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/g, "").trim();
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

    return JSON.parse(stripCodeFences(result.content)) as ContextProfile;
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
      ? "BAHASA: Semua teks harus dalam BAHASA INDONESIA. Gunakan kata-kata yang relevan dengan industri ini."
      : `LANGUAGE: All text must be in ${lang === "en" ? "ENGLISH" : `"${lang}"`}. Use industry-specific vocabulary.`;
    const system = `You are a conversion copywriter for a ${context.niche} landing page targeting ${context.audiencePersona}.
Mood/profile: ${context.moodProfile} | ${context.audiencePersona}
${langNote}

CRITICAL RULES:
- Create ORIGINAL, UNIQUE copy specific to ${context.niche} — do NOT use generic phrases like "transform your business" or "take your productivity to the next level"
- Use specific vocabulary related to ${context.niche} and ${context.industryTags.join(", ")}
- Each headline/subheader/cta must feel like it was written by someone who deeply understands this specific niche
- Avoid: "cutting-edge", "next-gen", "revolutionary", "game-changer", "innovative", "seamless"

Output a JSON array of objects with:
- type: "headline" | "subheader" | "cta" | "benefit" | "seo"
- content: string (the copy text - MUST be niche-specific)
- variants: string[] (2-3 alternative phrasings)

ONLY valid JSON array starting with [ and ending with ]. No markdown.`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Write conversion copy for a ${context.niche} business targeting ${context.audiencePersona}. Tags: ${context.industryTags.join(", ")}. Language: ${lang}. Be specific to this niche, not generic.`,
      responseFormat: "json",
    });

    return JSON.parse(stripCodeFences(result.content)) as CopyElement[];
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
      ? "BAHASA: Semua teks WAJIB BAHASA INDONESIA."
      : `LANGUAGE: All text in ${lang === "en" ? "ENGLISH" : `"${lang}"`}.`;

    const system = `You are a UI engineer designing a landing page for "${context.niche}" (mood: ${context.moodProfile}) targeting ${context.audiencePersona}.
${langNote}

Brand assets:
- Colors: primary ${context.primaryColor}, secondary ${context.secondaryColor}
- Fonts: heading ${context.primaryFont}, body ${context.secondaryFont}

Output JSON for layout STRUCTURE ONLY (no copy/content fields). Follow this EXACT format:

{
  "layout": "centered|asymmetric|split|full-width|grid (pick best for ${context.niche})",
  "sections": [
    {
      "type": "hero|features|testimonials|pricing|cta|faq|stats|gallery|logos|contact|comparison|timeline|team",
      "order": 1,
      "twClasses": ["tailwind classes like py-20 md:py-32"],
      "spacing": "compact|comfortable|spacious|breathing"
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
- DO NOT include any content fields (no headline, subheadline, cta, etc.) — structure only
- layout: choose the best style for ${context.niche} (not always the same one)
- twClasses: vary Tailwind padding based on section importance
- spacing: vary per section

ONLY valid JSON. No markdown. No content fields.`;

    const researchBlock = researchContext ? `\n\nRelevant research about ${context.niche}:\n${researchContext}` : "";
    const userMsg = `Design a landing page structure for ${context.niche} (${context.moodProfile}) targeting ${context.audiencePersona}.${researchBlock}`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: userMsg,
      responseFormat: "json",
    });

    const parsed = JSON.parse(stripCodeFences(result.content)) as LayoutSchema;

    const validSections = parsed.sections.map((s) => ({
      id: `${s.type}-${s.order}-${Math.random().toString(36).slice(2, 8)}`,
      type: s.type,
      order: s.order,
      content: {},
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


