import { NextRequest, NextResponse } from "next/server";
import { generateLayout } from "@/lib/agents/agent3-ui-engineer";
import { callLLM } from "@/lib/llm/api-call";
import type { ContextProfile, LayoutSchema, CopyElement } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { context, copy, settings } = await req.json();

    if (!context) {
      return NextResponse.json(
        { error: "Context profile required" },
        { status: 400 }
      );
    }

    if (settings?.apiKey && copy) {
      try {
        const copySummary = (copy as CopyElement[]).map((c: CopyElement) => `${c.type}: ${c.content}`).join("\n");
        const system = `You are a UI engineer. Design a landing page layout for ${context.niche} with mood ${context.moodProfile}.
Colors: primary ${context.primaryColor}, secondary ${context.secondaryColor}.

Output JSON with:
- layout (string): centered|asymmetric|split|full-width|grid
- sections (array of objects with: id, type, order, content (object), twClasses (string array), spacing)
- animations (object with type, intensity 1-5, springPhysics boolean)
- twConfig (string array)

Return ONLY valid JSON.`;

        const result = await callLLM({
          provider: settings.llmProvider,
          apiKey: settings.apiKey,
          model: settings.defaultModel,
          systemPrompt: system,
          userPrompt: `Design layout for ${context.niche}. Copy:\n${copySummary}`,
          responseFormat: "json",
        });

        const layout = JSON.parse(result.content) as LayoutSchema;
        return NextResponse.json({
          layout,
          llm: true,
          model: result.model,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        return NextResponse.json(
          { error: `LLM call failed: ${(e as Error).message.slice(0, 150)}` },
          { status: 502 }
        );
      }
    }

    const layout = generateLayout(context as ContextProfile);
    return NextResponse.json({
      layout,
      llm: false,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}
