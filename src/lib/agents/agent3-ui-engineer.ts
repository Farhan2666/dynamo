import type { ContextProfile, LayoutSchema } from "@/types";
import { selectPattern } from "../layout-engine/patterns";

const WCAG_MIN_CONTRAST = 4.5;

function assessContrast(hex1: string, hex2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hex.replace("#", "").match(/.{2}/g)?.map((c) => {
      const v = parseInt(c, 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }) || [0, 0, 0];
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function generateLayout(context: ContextProfile): LayoutSchema {
  const mood = context.moodProfile || "balanced";
  const { sections, layout, animation } = selectPattern(context.niche, mood);

  const contrastScore = assessContrast(context.primaryColor, "#FFFFFF");

  return {
    layout,
    sections,
    animations: animation,
    twConfig: [
      `font-heading: ${context.primaryFont}`,
      `font-body: ${context.secondaryFont}`,
    ],
    wcagScore: Math.round(Math.min(contrastScore / WCAG_MIN_CONTRAST * 100, 100)),
  };
}
