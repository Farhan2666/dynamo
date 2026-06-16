"use client";

import type { LLMProvider } from "@/types";

interface ProviderConfig {
  name: string;
  baseUrl: string;
  defaultModel: string;
  keyPrefix: string;
  supportsStreaming: boolean;
}

const PROVIDER_MAP: Record<LLMProvider, ProviderConfig> = {
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    keyPrefix: "sk-",
    supportsStreaming: true,
  },
  anthropic: {
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-sonnet",
    keyPrefix: "sk-ant-",
    supportsStreaming: true,
  },
  mistral: {
    name: "Mistral",
    baseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-large",
    keyPrefix: "",
    supportsStreaming: true,
  },
  google: {
    name: "Google AI",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-1.5-pro",
    keyPrefix: "",
    supportsStreaming: false,
  },
  cohere: {
    name: "Cohere",
    baseUrl: "https://api.cohere.ai/v1",
    defaultModel: "command-r-plus",
    keyPrefix: "",
    supportsStreaming: false,
  },
  together: {
    name: "Together",
    baseUrl: "https://api.together.xyz/v1",
    defaultModel: "mixtral-8x22b",
    keyPrefix: "",
    supportsStreaming: true,
  },
  groq: {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "mixtral-8x7b-32768",
    keyPrefix: "",
    supportsStreaming: true,
  },
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "auto",
    keyPrefix: "",
    supportsStreaming: true,
  },
};

const COST_ESTIMATES: Record<LLMProvider, { input: number; output: number }> = {
  openai: { input: 0.03, output: 0.06 },
  anthropic: { input: 0.02, output: 0.04 },
  mistral: { input: 0.01, output: 0.02 },
  google: { input: 0.02, output: 0.04 },
  cohere: { input: 0.015, output: 0.03 },
  together: { input: 0.01, output: 0.02 },
  groq: { input: 0.005, output: 0.01 },
  openrouter: { input: 0.02, output: 0.04 },
};

export function getProviderConfig(provider: LLMProvider): ProviderConfig {
  return PROVIDER_MAP[provider];
}

export function getCostEstimate(provider: LLMProvider): { input: number; output: number } {
  return COST_ESTIMATES[provider];
}

export function estimateGenerationCost(
  provider: LLMProvider,
  promptTokens: number = 500,
  outputTokens: number = 2000
): number {
  const costs = COST_ESTIMATES[provider];
  return (promptTokens * costs.input + outputTokens * costs.output) / 1000;
}

export function validateApiKey(key: string): boolean {
  const regex = /^(sk|ds)-[A-Za-z0-9]{32,64}$/;
  return regex.test(key) && !key.endsWith("_test");
}
