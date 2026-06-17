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
};

const DEFAULT_MODEL: Record<string, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-haiku-20240307",
  mistral: "mistral-small-latest",
  google: "gemini-1.5-flash-latest",
  cohere: "command-r-v1:0",
  together: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  groq: "llama3-70b-8192",
  openrouter: "openai/gpt-4o-mini",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, model: userModel, systemPrompt, userPrompt, responseFormat } = body;

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Missing provider or apiKey" }, { status: 400 });
    }

    const baseUrl = API_BASES[provider];
    if (!baseUrl) {
      return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    const model = userModel || DEFAULT_MODEL[provider] || "gpt-4o-mini";

    if (provider === "anthropic") {
      return await proxyAnthropic(apiKey, model, systemPrompt, userPrompt);
    }

    return await proxyOpenAICompatible(baseUrl, apiKey, model, systemPrompt, userPrompt, provider, responseFormat);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function proxyOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  provider: string,
  responseFormat?: string
): Promise<NextResponse> {
  const supportsJsonMode = provider === "openai" || provider === "openrouter";

  const reqBody: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 4096,
  };

  if (responseFormat === "json" && supportsJsonMode) {
    reqBody.response_format = { type: "json_object" };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(reqBody),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `LLM API error (${res.status}): ${err.slice(0, 300)}` }, { status: res.status });
  }

  const data = await res.json();

  return NextResponse.json({
    content: data.choices?.[0]?.message?.content || "",
    model: data.model || model,
    usage: {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0,
    },
  });
}

async function proxyAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<NextResponse> {
  const res = await fetch(`${API_BASES.anthropic}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Anthropic API error (${res.status}): ${err.slice(0, 300)}` }, { status: res.status });
  }

  const data = await res.json();

  return NextResponse.json({
    content: data.content?.[0]?.text || "",
    model: data.model || model,
    usage: { input: data.usage?.input_tokens || 0, output: data.usage?.output_tokens || 0 },
  });
}
