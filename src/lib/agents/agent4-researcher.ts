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
    const system = `You are a landing page research analyst and competitive intelligence expert. Given a business niche and audience, research what makes great landing pages in this space by drawing from patterns across SIMILAR and ADJACENT sectors.

Output JSON with:
- industryTrends (array of strings): current trends for this niche AND adjacent sectors that could apply
- competitorAngle (string): unique competitive angle, including lessons from parallel industries
- designTips (array of strings): specific design recommendations citing examples from related sectors
- realWorldData (array of strings): real metrics, stats, case studies, or facts relevant to this niche or adjacent industries
- sectionSuggestions (array of {type, reason}): what sections to include, referencing sector-specific examples

CRITICAL: Cross-reference at least 2-3 different but related sectors. For example, for "cattle farming marketplace" look at agritech, B2B livestock platforms AND general marketplace design patterns. For "vegan bakery" look at food/restaurant AND wellness/sustainability sectors.
Be specific. Reference real company examples. Avoid generic advice. Return ONLY valid JSON.`;

    const result = await callLLM({
      provider: settings.llmProvider,
      apiKey: settings.apiKey,
      model: settings.defaultModel,
      systemPrompt: system,
      userPrompt: `Research landing page strategies for: ${context.niche}
Audience: ${context.audiencePersona}
Mood: ${context.moodProfile}
Tags: ${context.industryTags.join(", ")}

Do cross-sector analysis: find relevant patterns from this niche AND at least 2 adjacent sectors. Give me:
- 5-7 specific industry trends (draw from multiple sectors)
- A unique competitive angle (incorporating cross-sector insights)  
- 4-6 design tips with specific references
- 5-7 real-world data points and examples
- Section prioritization with reasoning from different sectors

Be specific — name real companies, cite actual metrics.`,
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
