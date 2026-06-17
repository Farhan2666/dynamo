import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const PROVIDER_CONFIG: Record<string, { sdkType: "openai" | "anthropic" | "gemini"; baseURL?: string }> = {
  openai: { sdkType: "openai" },
  anthropic: { sdkType: "anthropic" },
  google: { sdkType: "gemini" },
  mistral: { sdkType: "openai", baseURL: "https://api.mistral.ai/v1" },
  groq: { sdkType: "openai", baseURL: "https://api.groq.com/openai/v1" },
  together: { sdkType: "openai", baseURL: "https://api.together.xyz/v1" },
  openrouter: { sdkType: "openai", baseURL: "https://openrouter.ai/api/v1" },
  deepseek: { sdkType: "openai", baseURL: "https://api.deepseek.com/v1" },
  cohere: { sdkType: "openai", baseURL: "https://api.cohere.ai/v1" },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, model, systemPrompt, userPrompt, responseFormat } = body;

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Missing provider or apiKey" }, { status: 400 });
    }

    const config = PROVIDER_CONFIG[provider];
    if (!config) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    let llmModel;
    const opts = { apiKey, baseURL: config.baseURL || undefined };

    if (config.sdkType === "anthropic") {
      const client = createAnthropic(opts);
      llmModel = client(model);
    } else if (config.sdkType === "gemini") {
      const client = createGoogleGenerativeAI(opts);
      llmModel = client(model);
    } else {
      const client = createOpenAI(opts);
      llmModel = client.chat(model);
    }

    const supportsJsonMode = provider === "openai" || provider === "openrouter";
    let finalSystem = systemPrompt;
    if (responseFormat === "json" && supportsJsonMode) {
      finalSystem = `${systemPrompt}\n\nRespond with valid JSON only.`;
    }

    const result = await generateText({
      model: llmModel,
      system: finalSystem,
      messages: [{ role: "user", content: userPrompt }],
      maxOutputTokens: 4096,
    });

    return NextResponse.json({
      content: result.text,
      model,
      usage: {
        input: result.usage?.inputTokens || 0,
        output: result.usage?.outputTokens || 0,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
