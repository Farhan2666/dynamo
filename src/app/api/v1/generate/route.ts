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
        const system = `You are a world-class UI engineer. Design a beautiful landing page layout for ${context.niche} (mood: ${context.moodProfile}).
Colors: primary ${context.primaryColor}, secondary ${context.secondaryColor}.
Fonts: heading ${context.primaryFont}, body ${context.secondaryFont}.

Output JSON with:
- layout (string): centered|asymmetric|split|full-width|grid
- sections (array): each section has: id, type, order, content (object with ALL fields filled), twClasses (string array), spacing (compact|comfortable|spacious|breathing)
- animations (object with type fade|slide|bounce|scale, intensity 1-5, springPhysics boolean)
- twConfig (string array)

For section types, populate ALL content fields:
- hero: headline, subheadline, cta, badge
- features: title, subtitle, feature_1_title, feature_1_desc, feature_2_title, feature_2_desc, feature_3_title, feature_3_desc
- testimonials: title, subtitle, quote_1, name_1, role_1, company_1, quote_2, name_2, role_2, company_2
- pricing: title, subtitle, plan_1_name, plan_1_desc, plan_1_price, plan_1_feat_1..4, plan_1_cta, plan_2_name, plan_2_desc, plan_2_price, plan_2_feat_1..4, plan_2_cta, plan_3_name, plan_3_desc, plan_3_price, plan_3_feat_1..4, plan_3_cta
- cta: headline, subheadline, button
- faq: title, subtitle, q_1, a_1, q_2, a_2, q_3, a_3
- stats: title, stat_1_value, stat_1_label, stat_2_value, stat_2_label, stat_3_value, stat_3_label, stat_4_value, stat_4_label
- gallery: title, subtitle, category_1..4, tag_1..6
- logos: title, logo_1..logo_6
- contact: title, subtitle, email, phone, address, hours, cta
- comparison: title, subtitle, row_1..6, our_val_1..6, their_val_1..6
- timeline: title, subtitle, year_1..5, event_1..5, desc_1..5
- team: title, subtitle, name_1..4, role_1..4, bio_1..4

Make content creative, specific to ${context.niche}, and persuasive. Return ONLY valid JSON.`;

        const result = await callLLM({
          provider: settings.llmProvider,
          apiKey: settings.apiKey,
          model: settings.defaultModel,
          systemPrompt: system,
          userPrompt: `Design a landing page layout for ${context.niche} targeting ${context.audiencePersona}. Use these copy elements as inspiration:\n${copySummary}. Generate ALL section content fields — do not leave anything empty.`,
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
