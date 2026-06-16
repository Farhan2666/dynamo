import type { ContextProfile, CopyElement, LayoutSchema, UserSettings } from "@/types";
import { analyzeContext } from "./agent1-context";
import { generateCopy } from "./agent2-copywriter";
import { generateLayout } from "./agent3-ui-engineer";
import { callLLM } from "@/lib/llm/api-call";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function llmAnalyzeContext(
  prompt: string,
  settings: UserSettings
): Promise<ContextProfile | null> {
  try {
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
    const system = `You are a conversion copywriter. Generate marketing copy for a landing page targeting ${context.audiencePersona} in the ${context.niche} industry.
Mood: ${context.moodProfile}.

Output a JSON array of objects with properties: type (string: headline|subheader|cta|benefit|seo), content (string), variants (array of strings).
Be creative and persuasive. Return ONLY valid JSON.`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Generate copy for ${context.niche} business targeting ${context.audiencePersona}. Tags: ${context.industryTags.join(", ")}`,
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
  settings: UserSettings
): Promise<LayoutSchema | null> {
  try {
    const copySummary = copy.map((c) => `${c.type}: ${c.content}`).join("\n");
    const system = `You are a UI engineer. Design a landing page layout for ${context.niche} with mood ${context.moodProfile}.
Colors: primary ${context.primaryColor}, secondary ${context.secondaryColor}.

Output JSON with:
- layout (string): centered|asymmetric|split|full-width|grid
- sections (array of objects with: id, type, order, content (object), twClasses (string array), spacing)
- animations (object with type, intensity 1-5, springPhysics boolean)
- twConfig (string array)

Return ONLY valid JSON.`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Design layout for ${context.niche}. Copy:\n${copySummary}`,
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
  settings?: UserSettings
): Promise<LayoutSchema> {
  if (settings?.apiKey && copy) {
    const llmResult = await llmGenerateLayout(context, copy, settings);
    if (llmResult) return llmResult;
  }
  await sleep(500 + Math.random() * 500);
  return generateLayout(context);
}
