import { NextRequest, NextResponse } from "next/server";
import { callLLM } from "@/lib/llm/api-call";
import type { LLMProvider } from "@/types";

const PROVIDER_MAP: Record<string, LLMProvider> = {
  openai: "openai",
  anthropic: "anthropic",
  google: "google",
  mistral: "mistral",
  groq: "groq",
  together: "together",
  openrouter: "openrouter",
  deepseek: "openrouter",
  cohere: "cohere",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, model, systemPrompt, userPrompt, responseFormat } = body;

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Missing provider or apiKey" }, { status: 400 });
    }

    const mappedProvider = PROVIDER_MAP[provider];
    if (!mappedProvider) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    const result = await callLLM({
      provider: mappedProvider,
      apiKey,
      model: model || "",
      systemPrompt,
      userPrompt,
      responseFormat,
    });

    return NextResponse.json({
      content: result.content,
      model: result.model,
      usage: result.usage,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
