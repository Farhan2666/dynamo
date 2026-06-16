"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useSettingsStore, useUIStore } from "@/lib/store";
import { Button, Input, Card, Badge } from "@/components/ui";
import type { LLMProvider } from "@/types";
import { getModels, getDefaultModel } from "@/lib/llm/models";

const PROVIDERS: Array<{
  id: LLMProvider;
  name: string;
  icon: string;
  cost: string;
  strength: string;
  color: string;
}> = [
  { id: "openai", name: "OpenAI", icon: "⚡", cost: "$0.03/1K", strength: "Balanced", color: "from-emerald-500 to-emerald-600" },
  { id: "anthropic", name: "Anthropic", icon: "🧠", cost: "$0.02/1K", strength: "Creative", color: "from-purple-500 to-purple-600" },
  { id: "mistral", name: "Mistral", icon: "🌪️", cost: "$0.01/1K", strength: "Speed", color: "from-blue-500 to-cyan-500" },
  { id: "google", name: "Google AI", icon: "🔬", cost: "$0.02/1K", strength: "Research", color: "from-blue-600 to-indigo-600" },
  { id: "cohere", name: "Cohere", icon: "🎯", cost: "$0.015/1K", strength: "Embeddings", color: "from-red-500 to-orange-500" },
  { id: "together", name: "Together", icon: "🤝", cost: "$0.01/1K", strength: "Open Models", color: "from-green-500 to-teal-500" },
  { id: "groq", name: "Groq", icon: "⚡", cost: "$0.005/1K", strength: "Low Latency", color: "from-orange-500 to-red-500" },
  { id: "openrouter", name: "OpenRouter", icon: "🔀", cost: "Varies", strength: "Aggregation", color: "from-pink-500 to-rose-500" },
];

function validateKey(key: string, provider: LLMProvider): boolean {
  if (!key || key.length < 8) return false;
  if (provider === "openai") return key.startsWith("sk-") && key.length >= 32;
  if (provider === "anthropic") return key.startsWith("sk-ant-") && key.length >= 32;
  return true;
}

export function SetupPageClient() {
  const { settings, updateSettings } = useSettingsStore();
  const { addToast } = useUIStore();
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleTest = useCallback(async () => {
    setTesting(true);
    try {
      const valid = validateKey(settings.apiKey, settings.llmProvider);
      if (!valid) {
        addToast("Invalid API key format for this provider", "error");
        setTesting(false);
        return;
      }
      const res = await fetch("/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "test connection",
          settings: {
            llmProvider: settings.llmProvider,
            apiKey: settings.apiKey,
            defaultModel: settings.defaultModel,
          },
        }),
      });
      if (res.ok) {
        addToast("API key validated — LLM responded", "success");
      } else {
        const err = await res.text();
        addToast(`API error: ${err.slice(0, 100)}`, "error");
      }
    } catch {
      addToast("Connection failed. Check your key & network.", "error");
    }
    setTesting(false);
  }, [settings, addToast]);

  const selectedProvider = PROVIDERS.find((p) => p.id === settings.llmProvider);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-body-sm text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to home
        </Link>
        <h1 className="font-heading text-heading-sm font-bold">API Setup</h1>
        <p className="text-body text-text-secondary mt-1">
          Bring your own key — no lock-in, no hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-8">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => updateSettings({ llmProvider: p.id, defaultModel: getDefaultModel(p.id) })}
            className={`
              flex flex-col items-center gap-1.5 p-3 rounded-soft border text-center transition-all
              ${settings.llmProvider === p.id
                ? "border-brand-primary bg-brand-primary/5 shadow-soft"
                : "border-surface-tertiary hover:border-text-muted hover:shadow-soft"
              }
            `}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs`}>
              {p.icon}
            </div>
            <span className="text-caption font-medium">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {selectedProvider && (
          <Card variant="default" padding="lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-lg">
                  {selectedProvider.name}
                </h3>
                <p className="text-body-sm text-text-secondary">
                  {selectedProvider.strength} · {selectedProvider.cost}
                </p>
              </div>
              <Badge variant="primary">{selectedProvider.id}</Badge>
            </div>

            <div className="space-y-4">
              <Input
                label="API Key"
                type={showKey ? "text" : "password"}
                placeholder={
                  selectedProvider.id === "openai"
                    ? "sk-..."
                    : selectedProvider.id === "anthropic"
                    ? "sk-ant-..."
                    : "Enter your API key"
                }
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                hint={`${selectedProvider.name} API key format: ${selectedProvider.id === "openai" ? "sk-*" : selectedProvider.id === "anthropic" ? "sk-ant-*" : "32+ characters"}`}
                error={
                  settings.apiKey && !validateKey(settings.apiKey, settings.llmProvider)
                    ? "Invalid key format"
                    : undefined
                }
              />

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? "Hide" : "Show"} Key
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={testing}
                  onClick={handleTest}
                  disabled={!settings.apiKey}
                >
                  Test Connection
                </Button>
              </div>

              <div>
                <label className="block text-caption font-medium text-text-muted mb-1.5">
                  Model
                </label>
                <div className="relative">
                  <select
                    value={settings.defaultModel}
                    onChange={(e) => updateSettings({ defaultModel: e.target.value })}
                    className="w-full appearance-none bg-surface border border-surface-tertiary rounded-soft px-3 py-2 text-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all cursor-pointer"
                  >
                    {getModels(settings.llmProvider).map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none"
                    viewBox="0 0 14 14" fill="none"
                  >
                    <path d="M4 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card variant="default" padding="lg">
          <h3 className="font-heading font-bold text-lg mb-2">
            Cost Simulator
          </h3>
          <p className="text-body-sm text-text-secondary mb-4">
            Estimated cost per generation based on your provider and prompt
            length.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Simple Prompt", prompt: '"fitness app"', cost: "$0.02" },
              { label: "Detailed Brief", prompt: '"SaaS for remote teams"', cost: "$0.05" },
              { label: "Complex Spec", prompt: '"fintech for Gen Z"', cost: "$0.12" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 rounded-soft bg-surface-secondary border border-surface-tertiary"
              >
                <div className="text-caption font-medium text-text-muted mb-1">
                  {item.label}
                </div>
                <div className="text-caption text-text-secondary mb-1">
                  {item.prompt}
                </div>
                <div className="font-semibold text-body-sm text-brand-primary">
                  {item.cost}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {settings.apiKey && (
          <div className="flex justify-end gap-3">
            <Link href="/">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Link href="/create">
              <Button variant="primary" size="lg">
                Continue to Creator
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
