import type { ContextProfile, LayoutSchema, DesignSystem, Section, SpacingScale } from "@/types";
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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + amount;
  const toHex = (v: number) => Math.min(255, Math.round(v * factor)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - amount;
  const toHex = (v: number) => Math.max(0, Math.round(v * factor)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateDesignSystem(context: ContextProfile): DesignSystem {
  const { primaryColor, secondaryColor, moodProfile, primaryFont, secondaryFont } = context;
  const mood = moodProfile || "balanced";

  const isDark = assessContrast(primaryColor, "#FFFFFF") < 3;
  const surfaceLight = isDark ? "#1A1A2E" : "#FFFFFF";
  const surfaceSecondaryLight = isDark ? "#2A2A4A" : "#F8F8FE";
  const surfaceTertiaryLight = isDark ? "#3A3A5A" : "#EEEEF8";
  const textPrimary = isDark ? "#F5F5FF" : "#1A1A2E";
  const textSecondary = isDark ? "#AAAACA" : "#555570";
  const textMuted = isDark ? "#8888A0" : "#8888A0";
  const textInverse = isDark ? "#1A1A2E" : "#FFFFFF";

  const isEmpty = (c: string) => !c || c === "#000000";

  const intensityMap: Record<string, 1 | 2 | 3 | 4 | 5> = {
    playful: 5, creative: 5, energetic: 4,
    growth: 3, confident: 3, warm: 3,
    balanced: 2, professional: 2, trust: 2,
    calm: 1, compassionate: 1, stable: 1,
  };
  const asymmetryIntensity = intensityMap[mood] || 2;

  const displayFont = mood === "playful" || mood === "creative"
    ? (primaryFont === "Sora" ? "Space Grotesk" : primaryFont)
    : primaryFont;

  const designSystem: DesignSystem = {
    colors: {
      primary: primaryColor || "#6E56CF",
      primaryLight: isEmpty(primaryColor) ? "#8B75E0" : lighten(primaryColor || "#6E56CF", 0.15),
      primaryDark: isEmpty(primaryColor) ? "#5A3FAF" : darken(primaryColor || "#6E56CF", 0.15),
      secondary: secondaryColor || "#00C4B4",
      secondaryDark: isEmpty(secondaryColor) ? "#00A094" : darken(secondaryColor || "#00C4B4", 0.15),
      accent: mood === "energetic" ? "#FF7E33" : mood === "calm" ? "#8B9D6E" : mood === "playful" ? "#EC4899" : "#FF7E33",
      surface: surfaceLight,
      surfaceSecondary: surfaceSecondaryLight,
      surfaceTertiary: surfaceTertiaryLight,
      textPrimary,
      textSecondary,
      textMuted,
      textInverse,
      border: surfaceTertiaryLight,
      ring: `${primaryColor || "#6E56CF"}33`,
    },
    typography: {
      headingFont: primaryFont || "Sora",
      bodyFont: secondaryFont || "Inter",
      displayFont,
      monoFont: "JetBrains Mono",
      scale: {
        display: "text-5xl md:text-7xl lg:text-8xl",
        h1: "text-4xl md:text-5xl lg:text-6xl",
        h2: "text-3xl md:text-4xl lg:text-5xl",
        h3: "text-2xl md:text-3xl",
        h4: "text-xl md:text-2xl",
        body: "text-base md:text-lg",
        small: "text-sm",
        caption: "text-xs",
      },
      weights: {
        heading: 700,
        body: 400,
        bold: 600,
        display: 800,
      },
      letterSpacing: {
        tight: "-0.02em",
        normal: "normal",
        wide: "0.05em",
      },
      lineHeight: {
        tight: "1.1",
        normal: "1.5",
        relaxed: "1.75",
      },
    },
    spacing: {
      sectionPadding: {
        compact: "py-12 md:py-16",
        comfortable: "py-16 md:py-20",
        spacious: "py-20 md:py-28",
        breathing: "py-28 md:py-40",
      },
      containerMaxWidth: "max-w-7xl",
      gridGap: "gap-6 md:gap-8",
      stackGap: {
        tight: "space-y-4",
        normal: "space-y-6",
        relaxed: "space-y-8",
        loose: "space-y-12",
      },
      inlineGap: "gap-4",
      sectionOverlap: mood === "playful" || mood === "energetic" ? "-mt-16 md:-mt-24" : "",
    },
    radius: {
      none: "rounded-none",
      sm: "rounded-md",
      md: "rounded-lg",
      lg: "rounded-xl",
      xl: "rounded-2xl",
      full: "rounded-full",
    },
    shadows: {
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
      glow: `shadow-[0_0_24px_${primaryColor || "#6E56CF"}40]`,
      glowAccent: `shadow-[0_0_24px_${secondaryColor || "#00C4B4"}40]`,
      inner: "shadow-inner",
    },
    asymmetry: {
      enabled: asymmetryIntensity >= 2,
      intensity: asymmetryIntensity,
      patterns: [],
      oddGrid: asymmetryIntensity >= 3,
      overlappingElements: asymmetryIntensity >= 3,
      staggeredHeaders: asymmetryIntensity >= 2,
      brokenGrid: asymmetryIntensity >= 4,
      diagonalSections: asymmetryIntensity >= 4,
      clippedCorners: asymmetryIntensity >= 3,
      floatingElements: asymmetryIntensity >= 4,
    },
    glassEffect: mood === "playful" || mood === "creative" || mood === "calm",
    noiseTexture: mood === "professional" || mood === "confident",
    borderVariant: mood === "playful" || mood === "energetic" ? "gradient" : mood === "calm" ? "none" : "default",
  };

  return designSystem;
}

function applyAsymmetryToClasses(ds: DesignSystem, type: string, order: number, totalSections: number): string[] {
  const extraClasses: string[] = [];
  const { asymmetry } = ds;

  if (!asymmetry.enabled) return extraClasses;

  if (type === "hero" && asymmetry.clippedCorners) {
    extraClasses.push("relative");
    extraClasses.push("[clip-path:polygon(0_0,100%_0,100%_85%,0_100%)]");
    extraClasses.push("md:[clip-path:polygon(0_0,100%_0,100%_80%,0_100%)]");
  }

  if (type === "hero" && asymmetry.diagonalSections) {
    extraClasses.push("-skew-y-[2deg]");
    extraClasses.push("[transform-origin:top_left]");
    extraClasses.push("[&>*]:skew-y-[2deg]");
  }

  if (type === "features" && asymmetry.oddGrid) {
    extraClasses.push("md:grid-cols-3");
    extraClasses.push("[&>*:first-child]:md:col-span-2");
    extraClasses.push("[&>*:last-child]:md:col-span-3");
  }

  if (type === "features" && asymmetry.brokenGrid) {
    extraClasses.push("grid-flow-dense");
    extraClasses.push("[&>*:nth-child(3)]:md:row-span-2");
  }

  if (type === "testimonials" && asymmetry.staggeredHeaders) {
    extraClasses.push("md:grid-cols-[1.2fr_0.8fr]");
    extraClasses.push("[&>*:first-child]:md:translate-y-8");
  }

  if (type === "cta" && asymmetry.floatingElements) {
    extraClasses.push("relative");
    extraClasses.push("md:-mt-16");
    extraClasses.push("md:mb-16");
    extraClasses.push("z-10");
  }

  if (asymmetry.overlappingElements && order > 0 && order < totalSections - 1) {
    extraClasses.push("relative");
    if (order % 2 === 0) {
      extraClasses.push("md:translate-x-[2%]");
    } else {
      extraClasses.push("md:-translate-x-[2%]");
    }
  }

  if (asymmetry.diagonalSections && order % 2 === 1) {
    extraClasses.push("skew-y-[1deg]");
    extraClasses.push("[transform-origin:right_center]");
    extraClasses.push("[&>*]:-skew-y-[1deg]");
  }

  if (type === "stats" && asymmetry.oddGrid) {
    extraClasses.push("grid-cols-3");
    extraClasses.push("md:grid-cols-3");
    extraClasses.push("[&>*:last-child]:md:col-span-3");
    extraClasses.push("[&>*:last-child]:md:w-1/3");
    extraClasses.push("[&>*:last-child]:md:mx-auto");
  }

  if (ds.glassEffect) {
    extraClasses.push("backdrop-blur-xl");
    extraClasses.push("bg-white/70");
    extraClasses.push("dark:bg-[#1A1A2E]/70");
    extraClasses.push("border");
    extraClasses.push("border-white/20");
  }

  if (ds.noiseTexture) {
    extraClasses.push("noise-bg");
  }

  if (ds.borderVariant === "gradient" && (type === "features" || type === "pricing")) {
    extraClasses.push("border-0");
    extraClasses.push("relative");
    extraClasses.push("bg-gradient-to-br");
    extraClasses.push("from-surface");
    extraClasses.push("to-surface-secondary");
    extraClasses.push("before:absolute");
    extraClasses.push("before:inset-0");
    extraClasses.push("before:-z-10");
    extraClasses.push("before:rounded-[inherit]");
    extraClasses.push("before:p-[1px]");
    extraClasses.push("before:bg-gradient-to-br");
    extraClasses.push(`before:from-[${ds.colors.primary}]`);
    extraClasses.push(`before:to-[${ds.colors.secondary}]`);
  }

  return extraClasses;
}

export function generateLayout(context: ContextProfile): LayoutSchema {
  const mood = context.moodProfile || "balanced";
  const intensityMap: Record<string, 1 | 2 | 3 | 4 | 5> = {
    playful: 5, creative: 5, energetic: 4,
    growth: 3, confident: 3, warm: 3,
    balanced: 2, professional: 2, trust: 2,
    calm: 1, compassionate: 1, stable: 1,
  };
  const asymmetryIntensity = intensityMap[mood] || 2;

  const pattern = selectPattern(context.niche, mood, asymmetryIntensity);
  const designSystem = generateDesignSystem(context);
  const contrastScore = assessContrast(context.primaryColor, "#FFFFFF");

  const totalSections = pattern.sections.length;
  const enhancedSections: Section[] = pattern.sections.map((s, i) => {
    const baseClasses = [...s.twClasses];
    const asymmetryExtra = applyAsymmetryToClasses(designSystem, s.type, i, totalSections);

    const dsSpacing = designSystem.spacing.sectionPadding[s.spacing] || "py-16 md:py-20";
    const spacingClass = baseClasses.find(c => c.startsWith("py-"));
    const spacingReplaced = spacingClass
      ? baseClasses.map(c => c.startsWith("py-") ? dsSpacing : c)
      : [...baseClasses, dsSpacing];

    return {
      ...s,
      twClasses: [...spacingReplaced, ...asymmetryExtra],
    };
  });

  return {
    layout: pattern.layout,
    sections: enhancedSections,
    animations: pattern.animation,
    twConfig: [
      `font-heading: ${designSystem.typography.headingFont}`,
      `font-body: ${designSystem.typography.bodyFont}`,
      `font-display: ${designSystem.typography.displayFont}`,
      `font-mono: ${designSystem.typography.monoFont}`,
      `--brand-primary: ${designSystem.colors.primary}`,
      `--brand-primary-light: ${designSystem.colors.primaryLight}`,
      `--brand-primary-dark: ${designSystem.colors.primaryDark}`,
      `--brand-secondary: ${designSystem.colors.secondary}`,
      `--brand-accent: ${designSystem.colors.accent}`,
      `--ds-radius: ${designSystem.radius.md}`,
      `--ds-shadow: ${designSystem.shadows.md}`,
    ],
    wcagScore: Math.round(Math.min(contrastScore / WCAG_MIN_CONTRAST * 100, 100)),
    designSystem,
    asymmetryRules: pattern.asymmetryRules,
  };
}
