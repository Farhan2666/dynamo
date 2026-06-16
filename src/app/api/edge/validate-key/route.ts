import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const API_BASES: Record<string, string> = {
  openai: "https://api.openai.com/v1/models",
  anthropic: "https://api.anthropic.com/v1/messages",
  mistral: "https://api.mistral.ai/v1/models",
  groq: "https://api.groq.com/openai/v1/models",
  openrouter: "https://openrouter.ai/api/v1/models",
};

const KEY_PATTERNS: Record<string, RegExp> = {
  openai: /^sk-[A-Za-z0-9]{32,}$/,
  anthropic: /^sk-ant-[A-Za-z0-9]{32,}$/,
  mistral: /^[A-Za-z0-9]{32,}$/,
  openrouter: /^sk-or-[A-Za-z0-9]{32,}$/,
};

export async function POST(req: NextRequest) {
  try {
    const { key, provider } = await req.json();

    if (!key || !provider) {
      return NextResponse.json(
        { valid: false, error: "Key and provider required" },
        { status: 400 }
      );
    }

    const pattern = KEY_PATTERNS[provider as keyof typeof KEY_PATTERNS];
    if (!pattern || !pattern.test(key)) {
      return NextResponse.json({
        valid: false,
        format: "invalid",
        message: "Invalid key format",
      });
    }

    const baseUrl = API_BASES[provider as keyof typeof API_BASES];
    if (!baseUrl) {
      return NextResponse.json({ valid: true, message: "Format valid (live check skipped)" });
    }

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${key}`,
      };
      if (provider === "anthropic") {
        headers["x-api-key"] = key;
        headers["anthropic-version"] = "2023-06-01";
      }

      const res = await fetch(baseUrl, { headers, signal: AbortSignal.timeout(5000) });

      if (res.ok || res.status === 401 || res.status === 403 || res.status === 429) {
        return NextResponse.json({
          valid: res.ok,
          statusCode: res.status,
          message: res.ok ? "API key valid" : `API rejected key (HTTP ${res.status})`,
        });
      }

      return NextResponse.json({
        valid: false,
        statusCode: res.status,
        message: `API error (HTTP ${res.status})`,
      });
    } catch {
      return NextResponse.json({
        valid: true,
        message: "Key format valid (live check timed out)",
      });
    }
  } catch {
    return NextResponse.json(
      { valid: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}
