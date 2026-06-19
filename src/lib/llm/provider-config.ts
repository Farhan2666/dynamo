export type SDKType = "openai" | "anthropic" | "gemini";

export interface ProviderEntry {
  sdkType: SDKType;
  baseURL?: string;
}

export const PROVIDER_CONFIG: Record<string, ProviderEntry> = {
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

export function supportsJsonMode(provider: string): boolean {
  return provider === "openai" || provider === "openrouter" || provider === "deepseek";
}
