import type { ContextProfile, UserSettings } from "@/types";
import { callLLM } from "@/lib/llm/api-call";

export interface ResearchInsight {
  industryTrends: string[];
  competitorAngle: string;
  designTips: string[];
  realWorldData: string[];
  sectionSuggestions: Array<{ type: string; reason: string }>;
}

export async function runResearchAgent(
  context: ContextProfile,
  settings: UserSettings
): Promise<ResearchInsight | null> {
  try {
    const system = `You are a landing page research analyst. Given a business niche and audience, research (based on your training data) what makes great landing pages in this space.

Output JSON with:
- industryTrends (array of strings): current trends for this niche
- competitorAngle (string): unique competitive angle that works
- designTips (array of strings): specific design recommendations
- realWorldData (array of strings): real metrics, stats, or facts relevant to this industry
- sectionSuggestions (array of {type, reason}): what sections to include and why

Be specific to the niche. Avoid generic advice. Return ONLY valid JSON.`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Analyze the landing page market for: ${context.niche}
Audience: ${context.audiencePersona}
Mood: ${context.moodProfile}
Tags: ${context.industryTags.join(", ")}

Give me 5-7 specific industry trends, a unique angle, 4-6 design tips, and 5-7 real-world data points relevant to this niche. Also suggest which sections to prioritize and why.`,
      responseFormat: "json",
    });

    return JSON.parse(result.content) as ResearchInsight;
  } catch {
    return null;
  }
}

export function applyResearchToPrompt(
  context: ContextProfile,
  insight: ResearchInsight
): string {
  const trends = insight.industryTrends.slice(0, 4).join("; ");
  const tips = insight.designTips.slice(0, 4).join("; ");
  const data = insight.realWorldData.slice(0, 3).join("; ");
  const sections = insight.sectionSuggestions
    .map((s) => `${s.type}: ${s.reason}`)
    .join("; ");

  return [
    `INDUSTRY CONTEXT:`,
    `Trends: ${trends}`,
    `Design direction: ${tips}`,
    `Real data points: ${data}`,
    `Recommended sections: ${sections}`,
    `Competitive angle: ${insight.competitorAngle}`,
  ].join("\n");
}
