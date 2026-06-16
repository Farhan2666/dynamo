import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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
    if (!pattern) {
      return NextResponse.json({
        valid: true,
        format: "unknown",
        message: "Provider recognized, format unknown",
      });
    }

    const valid = pattern.test(key) && !key.endsWith("_test");

    return NextResponse.json({
      valid,
      format: provider,
      message: valid ? "Key format valid" : "Invalid key format",
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}
