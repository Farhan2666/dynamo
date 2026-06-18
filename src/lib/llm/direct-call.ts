import type { LLMResponse } from "./api-call";
import type { LLMProvider } from "@/types";
import { DEFAULT_MODEL } from "@/lib/llm/models";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { PROVIDER_CONFIG, supportsJsonMode } from "@/lib/llm/provider-config";

export async function callLLMService(
  provider: LLMProvider,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  model?: string,
  responseFormat?: "json" | "text"
): Promise<LLMResponse> {
  const resolvedModel = model || DEFAULT_MODEL[provider] || "gpt-4o-mini";
  const config = PROVIDER_CONFIG[provider];
  if (!config) throw new Error(`Unknown provider: ${provider}`);

  let llmModel;
  const opts = { apiKey, baseURL: config.baseURL || undefined };

  if (config.sdkType === "anthropic") {
    const client = createAnthropic(opts);
    llmModel = client(resolvedModel);
  } else if (config.sdkType === "gemini") {
    const client = createGoogleGenerativeAI(opts);
    llmModel = client(resolvedModel);
  } else {
    const client = createOpenAI(opts);
    llmModel = client.chat(resolvedModel);
  }

  const jsonOk = supportsJsonMode(provider);
  let finalSystem = systemPrompt;
  if (responseFormat === "json" && jsonOk) {
    finalSystem = `${systemPrompt}\n\nRespond with valid JSON only.`;
  }

  const result = await generateText({
    model: llmModel,
    system: finalSystem,
    messages: [{ role: "user", content: userPrompt }],
    maxOutputTokens: 4096,
  });

  return {
    content: result.text,
    model: resolvedModel,
    usage: {
      input: result.usage?.inputTokens || 0,
      output: result.usage?.outputTokens || 0,
    },
  };
}
