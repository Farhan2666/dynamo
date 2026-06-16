import type { ContextProfile, LayoutSchema, AnimationSpec } from "@/types";
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

function getAnimationForMood(mood: string): AnimationSpec {
  const map: Record<string, AnimationSpec> = {
    calm: { type: "fade", intensity: 2, springPhysics: false },
    trust: { type: "fade", intensity: 2, springPhysics: false },
    professional: { type: "slide", intensity: 2, springPhysics: false },
    growth: { type: "slide", intensity: 3, springPhysics: false },
    energetic: { type: "bounce", intensity: 4, springPhysics: true },
    playful: { type: "bounce", intensity: 5, springPhysics: true },
    warm: { type: "scale", intensity: 3, springPhysics: true },
    confident: { type: "slide", intensity: 3, springPhysics: false },
    balanced: { type: "fade", intensity: 3, springPhysics: false },
  };
  return map[mood] || map.balanced;
}

export function generateLayout(
  context: ContextProfile
): LayoutSchema {
  const sections = selectPattern(context.niche, context.moodProfile);
  const animation = getAnimationForMood(context.moodProfile);

  const contrastScore = assessContrast(context.primaryColor, "#FFFFFF");

  return {
    layout: sections.length > 6 ? "full-width" : "asymmetric",
    sections,
    animations: animation,
    twConfig: [
      `text-${context.moodProfile === "calm" || context.moodProfile === "trust" ? "serif" : "sans"}`,
    ],
    wcagScore: Math.round(Math.min(contrastScore / WCAG_MIN_CONTRAST * 100, 100)),
  };
}
