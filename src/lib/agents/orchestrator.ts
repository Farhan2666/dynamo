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
    const system = `You are a market context analyzer. Analyze the business description and output a JSON object with:
- niche (string): business category
- industryTags (array of strings): relevant keywords
- primaryColor (hex string): best primary brand color based on color psychology
- secondaryColor (hex string): best secondary brand color
- primaryFont (string): recommended font
- secondaryFont (string): secondary font
- layoutPriority (array of strings): preferred section order
- audiencePersona (string): target audience description
- moodProfile (string): one of: trust, professional, calm, growth, energetic, playful, warm, confident, balanced
- language (string): "${lang}"

ONLY valid JSON. No markdown, no explanations.`;

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
      ? "BAHASA: Semua teks harus dalam BAHASA INDONESIA."
      : `LANGUAGE: All text must be in ${lang === "en" ? "ENGLISH" : `"${lang}"`}.`;
    const system = `You are a conversion copywriter. Generate marketing copy for a landing page targeting ${context.audiencePersona} in the ${context.niche} industry.
Mood: ${context.moodProfile}.
${langNote}
Output a JSON array of objects with properties: type (headline|subheader|cta|benefit|seo), content (string), variants (string[]).

ONLY valid JSON array. No markdown. Start with [ and end with ].`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Generate copy for ${context.niche} targeting ${context.audiencePersona}. Tags: ${context.industryTags.join(", ")}. Language: ${lang}.`,
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
  copy: CopyElement[],
  settings: UserSettings,
  researchContext?: string
): Promise<LayoutSchema | null> {
  try {
    const lang = context.language || "en";
    const langNote = lang === "id"
      ? "BAHASA: Semua teks konten WAJIB BAHASA INDONESIA."
      : `LANGUAGE: All content MUST be in ${lang === "en" ? "ENGLISH" : `"${lang}"`}.`;
    const copySummary = copy.map((c) => `${c.type}: ${c.content}`).join("\n");
    const system = `You are a world-class UI engineer. Design a beautiful landing page layout for ${context.niche} (mood: ${context.moodProfile}).
${langNote}
Colors: primary ${context.primaryColor}, secondary ${context.secondaryColor}.
Fonts: heading ${context.primaryFont}, body ${context.secondaryFont}.

CRITICAL: Make it look like a real hand-crafted brand site, not AI-generated.

Output JSON:
- layout: centered|asymmetric|split|full-width|grid
- sections: array of {id, type, order, content (ALL fields filled), twClasses: string[], spacing: compact|comfortable|spacious|breathing}
- animations: {type: fade|slide|bounce|scale, intensity: 1-5, springPhysics: boolean}
- twConfig: string[]

Section content fields:
- hero: headline, subheadline, cta, badge
- features: title, subtitle, feature_1_title, feature_1_desc, feature_2_title, feature_2_desc, feature_3_title, feature_3_desc
- testimonials: title, subtitle, quote_1, name_1, role_1, company_1, quote_2, name_2, role_2, company_2
- pricing: title, subtitle, plan_1_name, plan_1_desc, plan_1_price, plan_1_feat_1..4, plan_1_cta, plan_2_name, plan_2_desc, plan_2_price, plan_2_feat_1..4, plan_2_cta, plan_3_name, plan_3_desc, plan_3_price, plan_3_feat_1..4, plan_3_cta
- cta: headline, subheadline, button
- faq: title, subtitle, q_1, a_1, q_2, a_2, q_3, a_3
- stats: title, stat_1_value, stat_1_label, stat_2_value, stat_2_label, stat_3_value, stat_3_label, stat_4_value, stat_4_label
- gallery: title, subtitle
- logos: title, logo_1..logo_6
- contact: title, subtitle, email, phone, address, cta
- comparison: title, subtitle, row_1..6, our_val_1..6, their_val_1..6
- timeline: title, subtitle, year_1..5, event_1..5, desc_1..5
- team: title, subtitle, name_1..4, role_1..4, bio_1..4

Use specific details, not generic fluff. Avoid: "cutting-edge", "next-gen", "revolutionary".

ONLY valid JSON. No markdown. Start with { and end with }.`;

    const researchBlock = researchContext ? `\n\nRESEARCH:\n${researchContext}` : "";
    const langInstruction = lang === "id"
      ? "\nWAJIB: Semua teks BAHASA INDONESIA."
      : lang === "en"
      ? "\nREQUIRED: All text in ENGLISH."
      : `\nREQUIRED: All text in "${lang}".`;
    const userMsg = `Design a landing page for ${context.niche} targeting ${context.audiencePersona}. Copy inspiration:\n${copySummary}.${researchBlock}${langInstruction}`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: userMsg,
      responseFormat: "json",
    });

    return JSON.parse(stripCodeFences(result.content)) as LayoutSchema;
  } catch (e) {
    console.warn("[Agent 3] LLM error:", e instanceof Error ? e.message : e);
    return null;
  }
}

export async function runAgent1(
  prompt: string,
  settings?: UserSettings
): Promise<{ result: ContextProfile; source: "ai" | "fallback"; error?: string }> {
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
): Promise<{ result: CopyElement[]; source: "ai" | "fallback"; error?: string }> {
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
): Promise<{ result: LayoutSchema; source: "ai" | "fallback"; error?: string }> {
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

  if (settings?.apiKey && copy) {
    const llmResult = await llmGenerateLayout(effectiveContext, copy, settings, researchContext);
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
