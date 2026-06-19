import type { ContextProfile, CopyElement, LayoutSchema, UserSettings } from "@/types";
import { analyzeContext } from "./agent1-context";
import { generateCopy } from "./agent2-copywriter";
import { generateLayout } from "./agent3-ui-engineer";
import { callLLM } from "@/lib/llm/api-call";
import { runResearchAgent, applyResearchToPrompt } from "./agent4-researcher";
import { runSelfReview, type ReviewReport } from "./agent5-reviewer";
import { detectLanguage } from "@/lib/utils/language";
import { extractJsonFromResponse } from "@/lib/utils/json";
import { getProductsBlock, getStylesBlock, getColorsBlock, getTypographyBlock, getReasoningBlock, getAntiSlopRules } from "@/lib/skill-loader";

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
    const productsRef = skillInject ? getProductsBlock() : "";
    const colorsRef = skillInject ? getColorsBlock() : "";
    const fontsRef = skillInject ? getTypographyBlock() : "";
    const stylesRef = skillInject ? getStylesBlock() : "";

    const skillBlock = skillInject ? `

REFERENSI 97 INDUSTRIES (masing-masing punya style, color palette, pattern rekomendasi):
${productsRef}

REFERENSI 97 COLOR PALETTES (hex codes per industri):
${colorsRef}

REFERENSI 58 FONT PAIRINGS (Google Fonts):
${fontsRef}

REFERENSI 68 UI STYLES:
${stylesRef}
` : "";

    const system = `You are a market context analyzer. Output JSON only.${skillBlock}

WAJIB: Pilih warna dari daftar COLOR PALETTES di atas berdasarkan industri. Tulis nomor # palet yang dipilih.
WAJIB: Pilih font dari daftar FONT PAIRINGS di atas. Tulis nomor # font yang dipilih.
WAJIB: Pilih style dari daftar UI STYLES di atas. Tulis nomor # style yang dipilih.
niche MUST be specific (e.g. "cattle farming marketplace" not "ecommerce").

Output ONLY valid JSON:
{
  "niche": "specific business category",
  "industryTags": ["3-5 keywords"],
  "primaryColor": "hex from chosen palette",
  "secondaryColor": "hex",
  "accentColor": "hex",
  "primaryFont": "heading font from chosen pairing",
  "secondaryFont": "body font from chosen pairing",
  "layoutPriority": ["hero", "features", "cta"],
  "audiencePersona": "target description",
  "moodProfile": "trust|professional|calm|growth|energetic|playful|warm|confident|balanced|creative|stable|compassionate",
  "language": "${lang}"
}

ONLY valid JSON. No markdown.`;

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
    const stylesRef = skillInject ? getStylesBlock() : "";
    const colorsRef = skillInject ? getColorsBlock() : "";
    const fontsRef = skillInject ? getTypographyBlock() : "";
    const reasoningRef = skillInject ? getReasoningBlock() : "";
    const antiSlopRef = skillInject ? getAntiSlopRules() : "";

    const skillBlock = skillInject ? `

REFERENSI 68 UI STYLES (pilih yang paling cocok untuk ${context.niche}):
${stylesRef}

REFERENSI 97 COLOR PALETTES (per industri):
${colorsRef}

REFERENSI 58 FONT PAIRINGS:
${fontsRef}

REFERENSI 101 DESIGN REASONING RULES (decision rules + anti-patterns per industri):
${reasoningRef}

${antiSlopRef}
` : "";

    const system = `You are a world-class UI engineer for ${context.niche}. Design a landing page for ${context.audiencePersona}. Mood: ${context.moodProfile}.
${langNote}${skillBlock}

DEFINE DESIGN SYSTEM FIRST:
- Color roles: primary, secondary, accent, surface, text, border with specific hexes
- Typography: choose from font list # above; cite your choice
- Spacing scale, border radius, shadow system
Then generate sections WITHIN these constraints.

INTENTIONAL ASYMMETRY (MANDATORY):
- Broken grids, staggered cards, diagonal clip-paths, varying heights
- Content bleeding past containers
- Page MUST NOT look like a symmetrical AI template

JSON FORMAT:
{"layout":"centered|asymmetric|split|full-width|grid","sections":[{"type":"hero|features|testimonials|pricing|cta|faq|stats|gallery|logos|contact|comparison|timeline|team","order":1,"twClasses":["py-20 md:py-32"],"spacing":"compact|comfortable|spacious|breathing","content":{}}],"animations":{"type":"fade|slide|bounce|scale","intensity":1-5,"springPhysics":bool},"twConfig":[""],"designSystem":{}}

CONTENT KEYS per section type:
hero: headline,subheadline,cta,badge
features: title,subtitle,feature_1_title,feature_1_desc,feature_2_title,feature_2_desc,feature_3_title,feature_3_desc
testimonials: title,subtitle,quote_1,name_1,role_1,company_1,quote_2,name_2,role_2,company_2
pricing: title,subtitle,plan_1_name,plan_1_price,plan_1_feat_1..4,plan_1_cta,plan_2_name,plan_2_price,plan_2_feat_1..4,plan_2_cta,plan_3_name,plan_3_price,plan_3_feat_1..4,plan_3_cta
cta: headline,subheadline,button
faq: title,subtitle,q_1,a_1,q_2,a_2,q_3,a_3
stats: title,stat_1_value,stat_1_label,stat_2_value,stat_2_label,stat_3_value,stat_3_label,stat_4_value,stat_4_label
gallery: title,subtitle,category_1..4,tag_1..6
logos: title,logo_1..logo_6
contact: title,subtitle,email,phone,address,hours,cta
comparison: title,subtitle,row_1..6,our_val_1..6,their_val_1..6
timeline: title,subtitle,year_1..5,event_1..5,desc_1..5
team: title,subtitle,name_1..4,role_1..4,bio_1..4

RULES:
- 4-8 sections
- Content MUST be specific to ${context.niche}, not generic
- Use vocabulary from ${context.industryTags.join(", ")}

FINAL CHECKLIST — WAJIB dipenuhi sebelum output:
⬜ 1. Warna: Pilih dari daftar COLOR PALETTES di atas. Jangan pakai #6366F1 (purple AI slop).
⬜ 2. Font: Pilih dari daftar FONT PAIRINGS di atas. Jangan pakai Inter sebagai body font.
⬜ 3. CTA: Jangan "Get Started". Pakai CTA spesifik untuk ${context.niche}.
⬜ 4. Layout: Harus asimetris. Jangan grid 3 kolom simetris.
⬜ 5. No buzzwords: jangan "cutting-edge", "next-gen", "revolutionary", "seamless".
⬜ 6. No purple/pink gradient sebagai warna utama.
⬜ 7. No glassmorphism asal.
⬜ 8. Semua field content harus terisi, jangan ada yang kosong.

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


