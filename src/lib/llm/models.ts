import type { LLMProvider } from "@/types";

const MODEL_LISTS: Record<LLMProvider, string[]> = {
  openai: [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-3.5-turbo",
  ],
  anthropic: [
    "claude-3-5-sonnet-20240620",
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",
  ],
  mistral: [
    "mistral-large-latest",
    "mistral-medium-latest",
    "mistral-small-latest",
    "open-mistral-7b",
  ],
  google: [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
  ],
  cohere: [
    "command-r-plus",
    "command-r",
    "command",
  ],
  together: [
    "mixtral-8x22b-instruct",
    "mixtral-8x7b-instruct",
    "llama-3-70b-chat",
    "llama-3-8b-chat",
  ],
  groq: [
    "mixtral-8x7b-32768",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "gemma-7b-it",
  ],
  openrouter: [
    "auto",
    "openai/gpt-4o",
    "anthropic/claude-3.5-sonnet",
    "meta-llama/llama-3-70b-instruct",
    "mistralai/mixtral-8x22b-instruct",
  ],
};

export const DEFAULT_MODEL: Record<LLMProvider, string> = {
  openai: "gpt-4o",
  anthropic: "claude-3-5-sonnet-20240620",
  mistral: "mistral-large-latest",
  google: "gemini-1.5-pro",
  cohere: "command-r-plus",
  together: "mixtral-8x22b-instruct",
  groq: "mixtral-8x7b-32768",
  openrouter: "auto",
};

export function getModels(provider: LLMProvider): string[] {
  return MODEL_LISTS[provider] || [DEFAULT_MODEL[provider]];
}

export function getDefaultModel(provider: LLMProvider): string {
  return DEFAULT_MODEL[provider];
}
