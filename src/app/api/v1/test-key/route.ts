import { NextRequest, NextResponse } from "next/server";

const API_BASES: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  mistral: "https://api.mistral.ai/v1",
  google: "https://generativelanguage.googleapis.com/v1beta",
  cohere: "https://api.cohere.ai/v1",
  together: "https://api.together.xyz/v1",
  groq: "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  deepseek: "https://api.deepseek.com/v1",
};

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();
    if (!apiKey || !provider) {
      return NextResponse.json({ error: "Missing provider or API key" }, { status: 400 });
    }
    const baseUrl = API_BASES[provider as string];
    if (!baseUrl) {
      return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }

    if (provider === "openrouter") {
      const res = await fetch(`${baseUrl}/auth/key`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: err.slice(0, 120) }, { status: 502 });
      }
      const data = await res.json();
      return NextResponse.json({ status: "ok", data: { label: data.data?.label || "OpenRouter key" } });
    }

    if (provider === "anthropic") {
      const res = await fetch(`${baseUrl}/messages`, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "claude-3-haiku-20240307", max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
      });
      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ success: false, error: err.slice(0, 120) }, { status: 502 });
      }
      const data = await res.json();
      const model = data.model || "claude-3-haiku";
      return NextResponse.json({ success: true, model });
    }

    if (provider === "google") {
      const res = await fetch(`${baseUrl}/models?key=${apiKey}`);
      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ success: false, error: err.slice(0, 120) }, { status: 502 });
      }
      return NextResponse.json({ success: true });
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: provider === "groq" ? "mixtral-8x7b-32768" : provider === "mistral" ? "mistral-small-latest" : provider === "cohere" ? "command" : "gpt-4o-mini",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 1,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: err.slice(0, 120) }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Connection failed" }, { status: 500 });
  }
}
