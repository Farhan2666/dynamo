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
- language (string): "${lang}" — the detected language of the user's prompt

Return ONLY valid JSON, no explanations.`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Analyze this business: ${prompt}`,
      responseFormat: "json",
    });

    return JSON.parse(result.content) as ContextProfile;
  } catch {
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
      ? "BAHASA: Semua teks harus dalam BAHASA INDONESIA. Gunakan kata-kata Indonesia yang alami, bukan terjemahan kaku."
      : lang === "en"
      ? "LANGUAGE: All text must be in ENGLISH. Use natural English phrasing."
      : `LANGUAGE: All text must be in the language "${lang}". Use natural phrasing in that language.`;
    const system = `You are a conversion copywriter. Generate marketing copy for a landing page targeting ${context.audiencePersona} in the ${context.niche} industry.
Mood: ${context.moodProfile}.

${langNote}

Output a JSON array of objects with properties: type (string: headline|subheader|cta|benefit|seo), content (string), variants (array of strings).
Be creative and persuasive. Return ONLY valid JSON.`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Generate copy for ${context.niche} business targeting ${context.audiencePersona}. Tags: ${context.industryTags.join(", ")}. Output language: ${lang}.`,
      responseFormat: "json",
    });

    return JSON.parse(result.content) as CopyElement[];
  } catch {
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
      ? "BAHASA: Semua teks konten (headline, subheadline, title, description, dll) WAJIB dalam BAHASA INDONESIA. Jangan pakai bahasa Inggris sama sekali. Gunakan bahasa Indonesia yang alami dan menarik."
      : lang === "en"
      ? "LANGUAGE: All content text (headline, subheadline, title, descriptions, etc.) MUST be in ENGLISH."
      : `LANGUAGE: All content text (headline, subheadline, title, descriptions, etc.) MUST be in "${lang}". Use natural phrasing.`;
    const copySummary = copy.map((c) => `${c.type}: ${c.content}`).join("\n");
    const system = `You are a world-class UI engineer. Design a beautiful landing page layout for ${context.niche} (mood: ${context.moodProfile}).
${langNote}
Colors: primary ${context.primaryColor}, secondary ${context.secondaryColor}.
Fonts: heading ${context.primaryFont}, body ${context.secondaryFont}.

CRITICAL: This page MUST NOT look AI-generated. Avoid generic patterns. Make it look like a real, hand-crafted brand site.

Output JSON with:
- layout (string): centered|asymmetric|split|full-width|grid
- sections (array): each section has: id, type, order, content (object with ALL fields filled), twClasses (string array), spacing (compact|comfortable|spacious|breathing)
- animations (object with type fade|slide|bounce|scale, intensity 1-5, springPhysics boolean)
- twConfig (string array)

For section types, populate ALL content fields:
- hero: headline, subheadline, cta, badge (optional short tag)
- features: title, subtitle, feature_1_title, feature_1_desc, feature_2_title, feature_2_desc, feature_3_title, feature_3_desc
- testimonials: title, subtitle, quote_1, name_1, role_1, company_1, quote_2, name_2, role_2, company_2
- pricing: title, subtitle, plan_1_name, plan_1_desc, plan_1_price, plan_1_feat_1..4, plan_1_cta, plan_2_name, plan_2_desc, plan_2_price, plan_2_feat_1..4, plan_2_cta, plan_3_name, plan_3_desc, plan_3_price, plan_3_feat_1..4, plan_3_cta
- cta: headline, subheadline, button
- faq: title, subtitle, q_1, a_1, q_2, a_2, q_3, a_3
- stats: title, stat_1_value, stat_1_label, stat_2_value, stat_2_label, stat_3_value, stat_3_label, stat_4_value, stat_4_label
- gallery: title, subtitle, category_1..4, tag_1..6
- logos: title, logo_1..logo_6
- contact: title, subtitle, email, phone, address, hours, cta
- comparison: title, subtitle, row_1..6, our_val_1..6, their_val_1..6
- timeline: title, subtitle, year_1..5, event_1..5, desc_1..5
- team: title, subtitle, name_1..4, role_1..4, bio_1..4

Make content feel BRAND-SPECIFIC, not generic. Use specific metrics, concrete details, and original phrasing. Avoid:
- "cutting-edge", "next-gen", "revolutionary", "game-changer", "state-of-the-art"
- Generic stock phrases that could apply to any business
- Perfectly symmetrical structures that scream "AI template"

Instead write like a real human marketer: specific, opinionated, with a clear point of view.`;

    const researchBlock = researchContext ? `\n\nRESEARCH INSIGHTS:\n${researchContext}` : "";
    const langInstruction = lang === "id"
      ? "\n\nWAJIB: Semua teks di landing page HARUS dalam BAHASA INDONESIA — headline, subheadline, judul section, deskripsi, CTA, FAQ, testimonial, semua. Jangan ada satu kata pun bahasa Inggris."
      : lang === "en"
      ? "\n\nREQUIRED: All text on the landing page MUST be in ENGLISH."
      : `\n\nREQUIRED: All text on the landing page MUST be in "${lang}".`;
    const userMsg = `Design a landing page layout for ${context.niche} targeting ${context.audiencePersona}. Use these copy elements as inspiration:\n${copySummary}.${researchBlock}\n\nGenerate ALL section content fields — do not leave anything empty. Make every section feel like it was written by a human copywriter, not an AI.${langInstruction}`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: userMsg,
      responseFormat: "json",
    });

    return JSON.parse(result.content) as LayoutSchema;
  } catch {
    return null;
  }
}

export async function runAgent1(
  prompt: string,
  settings?: UserSettings
): Promise<ContextProfile> {
  if (settings?.apiKey) {
    const llmResult = await llmAnalyzeContext(prompt, settings);
    if (llmResult) return llmResult;
  }
  await sleep(600 + Math.random() * 400);
  return analyzeContext(prompt);
}

export async function runAgent2(
  context: ContextProfile,
  settings?: UserSettings
): Promise<CopyElement[]> {
  if (settings?.apiKey) {
    const llmResult = await llmGenerateCopy(context, settings);
    if (llmResult) return llmResult;
  }
  await sleep(400 + Math.random() * 300);
  return generateCopy(context);
}

export async function runAgent3(
  context: ContextProfile,
  copy?: CopyElement[],
  settings?: UserSettings,
  vibeOverride?: string | null
): Promise<LayoutSchema> {
  const effectiveContext = vibeOverride && vibeOverride !== ""
    ? { ...context, moodProfile: vibeOverride }
    : context;

  let researchContext: string | undefined;

  if (settings?.apiKey) {
    const research = await runResearchAgent(effectiveContext, settings);
    if (research) {
      researchContext = applyResearchToPrompt(effectiveContext, research);
    }
  }

  if (settings?.apiKey && copy) {
    const llmResult = await llmGenerateLayout(effectiveContext, copy, settings, researchContext);
    if (llmResult) return llmResult;
  }
  await sleep(500 + Math.random() * 500);
  return generateLayout(effectiveContext);
}

export function runAgent5(
  layout: LayoutSchema,
  copy: CopyElement[],
  context: ContextProfile
): ReviewReport {
  return runSelfReview(layout, copy, context);
}
