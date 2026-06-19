import { NextRequest, NextResponse } from "next/server";
import { generateLayout } from "@/lib/agents/agent3-ui-engineer";
import { callLLMService } from "@/lib/llm/direct-call";
import type { ContextProfile, LayoutSchema, CopyElement } from "@/types";
import { getCuratedStyles, getCuratedColors, getCuratedFonts, formatCuratedPicks, getAntiSlopRules } from "@/lib/skill-loader";

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
        const lang = context.language || "en";
        const langNote = lang === "id"
          ? "BAHASA: Semua teks konten (headline, subheadline, title, description, dll) WAJIB dalam BAHASA INDONESIA. Jangan pakai bahasa Inggris sama sekali. Gunakan bahasa Indonesia yang alami dan menarik."
          : lang === "en"
          ? "LANGUAGE: All content text (headline, subheadline, title, descriptions, etc.) MUST be in ENGLISH."
          : `LANGUAGE: All content text (headline, subheadline, title, descriptions, etc.) MUST be in "${lang}". Use natural phrasing.`;
        const copySummary = (copy as CopyElement[]).map((c: CopyElement) => `${c.type}: ${c.content}`).join("\n");
        const skillInject = settings?.skillInject ?? true;
        const niche = context.niche;
        const tags = context.industryTags || [];
        const curatedStyles = skillInject ? formatCuratedPicks(getCuratedStyles(niche, tags), "RECOMMENDED STYLES") : "";
        const curatedColors = skillInject ? formatCuratedPicks(getCuratedColors(niche, tags), "RECOMMENDED COLOR PALETTES") : "";
        const curatedFonts = skillInject ? formatCuratedPicks(getCuratedFonts(niche, tags), "RECOMMENDED FONTS") : "";
        const antiSlopRef = skillInject ? getAntiSlopRules() : "";

        const skillBlock = skillInject ? `

=== CURATED FOR ${niche.toUpperCase()} ===
${curatedStyles}
${curatedColors}
${curatedFonts}

${antiSlopRef}
` : "";

        const system = `You are a UI engineer. Design a landing page for ${context.niche}.${skillBlock}
${langNote}
Colors: primary ${context.primaryColor}, secondary ${context.secondaryColor}.
Fonts: heading ${context.primaryFont}, body ${context.secondaryFont}.

WAJIB: Pilih warna dari rekomendasi di atas. Jangan #6366F1.
WAJIB: Pilih font dari rekomendasi di atas. Jangan Inter.
CTA spesifik untuk ${niche}, jangan "Get Started".
Layout asimetris — broken grid, staggered.
No buzzwords: cutting-edge, next-gen, revolutionary, seamless.
Semua field content WAJIB terisi.

JSON: {"layout":"centered|asymmetric|split|full-width|grid","sections":[{"id":"","type":"hero|features|testimonials|pricing|cta|faq|stats|gallery|logos|contact|comparison|timeline|team","order":1,"content":{},"twClasses":[],"spacing":"comfortable"}],"animations":{},"twConfig":[]}

Content keys: hero=headline,subheadline,cta,badge | features=title,subtitle,feature_1_title..3,feature_1_desc..3 | testimonials=title,subtitle,quote_1,name_1,role_1,company_1,quote_2,name_2,role_2,company_2 | pricing=title,subtitle,plan_1_name,plan_1_price,plan_1_feat_1..4,plan_1_cta,plan_2_name,plan_2_price,plan_2_feat_1..4,plan_2_cta,plan_3_name,plan_3_price,plan_3_feat_1..4,plan_3_cta | cta=headline,subheadline,button | faq=title,subtitle,q_1,a_1,q_2,a_2,q_3,a_3 | stats=title,stat_1_value,stat_1_label..4 | gallery=title,subtitle,category_1..4 | logos=title,logo_1..6 | contact=title,subtitle,email,phone,address,hours,cta | comparison=title,subtitle,row_1..6,our_val_1..6,their_val_1..6 | timeline=title,subtitle,year_1..5,event_1..5 | team=title,subtitle,name_1..4,role_1..4

ONLY valid JSON. No markdown.`;

        const langInstruction = lang === "id"
          ? "\n\nWAJIB: Semua teks di landing page HARUS dalam BAHASA INDONESIA — headline, subheadline, judul section, deskripsi, CTA, FAQ, testimonial, semua. Jangan ada satu kata pun bahasa Inggris."
          : lang === "en"
          ? "\n\nREQUIRED: All text on the landing page MUST be in ENGLISH."
          : `\n\nREQUIRED: All text on the landing page MUST be in "${lang}".`;
        const result = await callLLMService(
          settings.llmProvider,
          settings.apiKey,
          system,
          `Design a landing page layout for ${context.niche} targeting ${context.audiencePersona}. Use these copy elements as inspiration:\n${copySummary}. Generate ALL section content fields do not leave anything empty. Write like a human marketer, not an AI.${langInstruction}`,
          settings.defaultModel,
          "json",
        );

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
