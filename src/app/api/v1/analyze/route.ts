import { NextRequest, NextResponse } from "next/server";
import { analyzeContext } from "@/lib/agents/agent1-context";
import { callLLM } from "@/lib/llm/api-call";
import type { ContextProfile, UserSettings } from "@/types";

async function callLLMService(
  provider: string,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model?: string,
  responseFormat?: "json" | "text"
) {
  return callLLM({
    provider: provider as any,
    apiKey,
    model: model || "",
    systemPrompt,
    userPrompt,
    responseFormat,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, settings } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Prompt must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (settings?.apiKey) {
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

        const result = await callLLMService(
          settings.llmProvider,
          settings.apiKey,
          system,
          `Analyze this business: ${prompt}`,
          settings.defaultModel,
          "json",
        );

        const context = JSON.parse(result.content) as ContextProfile;
        return NextResponse.json({
          context,
          llm: true,
          model: result.model,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        return NextResponse.json(
          { error: `LLM call failed: ${(e as Error).message.slice(0, 150)}` },
          { status: 502 }
        );
      }
    }

    const context = analyzeContext(prompt);
    return NextResponse.json({
      context,
      llm: false,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Context analysis failed" },
      { status: 500 }
    );
  }
}
