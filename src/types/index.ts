export interface Project {
  id: string;
  userId: string;
  apiKeyEncrypted: string;
  llmProvider: LLMProvider;
  createdAt: Date;
}

export interface Generation {
  id: string;
  projectId: string;
  rawPrompt: string;
  contextProfile: ContextProfile;
  copyElements: CopyElement[];
  layoutSchema: LayoutSchema;
  wcagScore: number;
  variationsGenerated: number;
  regenHistory: string[];
}

export interface ContextProfile {
  niche: string;
  industryTags: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryFont: string;
  secondaryFont: string;
  layoutPriority: SectionType[];
  audiencePersona: string;
  moodProfile: string;
  language: string;
}

export interface CopyElement {
  type: "headline" | "subheader" | "cta" | "benefit" | "seo" | "story" | "microcopy" | "social_proof";
  content: string;
  variants: string[];
  tone?: string;
  hook?: string;
  audienceHook?: string;
}

export interface LayoutSchema {
  layout: "centered" | "asymmetric" | "split" | "full-width" | "grid" | "broken-grid" | "diagonal" | "bleed";
  sections: Section[];
  animations: AnimationSpec;
  twConfig: string[];
  wcagScore?: number;
  designSystem?: DesignSystem;
  asymmetryRules?: AsymmetryRule[];
  seo?: SEOData;
  analytics?: AnalyticsConfig;
}

export interface SEOData {
  title: string;
  description: string;
  ogImage: string;
}

export interface AnalyticsConfig {
  gaId: string;
  metaPixelId: string;
}

export interface DesignSystem {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryDark: string;
    accent: string;
    surface: string;
    surfaceSecondary: string;
    surfaceTertiary: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    border: string;
    ring: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    displayFont: string;
    monoFont: string;
    scale: {
      display: string;
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      body: string;
      small: string;
      caption: string;
    };
    weights: {
      heading: number;
      body: number;
      bold: number;
      display: number;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  spacing: {
    sectionPadding: Record<string, string>;
    containerMaxWidth: string;
    gridGap: string;
    stackGap: Record<string, string>;
    inlineGap: string;
    sectionOverlap: string;
  };
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
    glowAccent: string;
    inner: string;
  };
  asymmetry: AsymmetryConfig;
  glassEffect?: boolean;
  noiseTexture?: boolean;
  borderVariant?: "default" | "gradient" | "glow" | "none";
  cssEffects?: CSSEffects;
}

export interface CSSEffects {
  neonGlow?: boolean;
  crtScanlines?: boolean;
  glitchAnimation?: boolean;
  floatingParticles?: boolean;
  shimmer?: boolean;
  gradientMesh?: boolean;
  animatedGradient?: boolean;
  textShadow?: string;
  boxShadow?: string;
  animationKeyframes?: string;
}

export interface AsymmetryConfig {
  enabled: boolean;
  intensity: 1 | 2 | 3 | 4 | 5;
  patterns: string[];
  oddGrid: boolean;
  overlappingElements: boolean;
  staggeredHeaders: boolean;
  brokenGrid: boolean;
  diagonalSections: boolean;
  clippedCorners: boolean;
  floatingElements: boolean;
}

export interface AsymmetryRule {
  type: "offset-grid" | "overlap" | "diagonal-clip" | "stagger" | "broken-grid" | "floating" | "clipped-corner" | "bleed";
  targetSection?: string;
  params: Record<string, string | number | boolean>;
}

export interface Section {
  id: string;
  type: SectionType;
  order: number;
  content: Record<string, string>;
  twClasses: string[];
  spacing: SpacingScale;
}

export type SectionType =
  | "hero"
  | "features"
  | "testimonials"
  | "pricing"
  | "cta"
  | "faq"
  | "stats"
  | "gallery"
  | "logos"
  | "contact"
  | "comparison"
  | "timeline"
  | "team";

export interface AnimationSpec {
  type: "fade" | "slide" | "bounce" | "scale" | "none";
  intensity: 1 | 2 | 3 | 4 | 5;
  springPhysics?: boolean;
}

export type SpacingScale = "compact" | "comfortable" | "spacious" | "breathing";

export type LLMProvider =
  | "openai"
  | "anthropic"
  | "mistral"
  | "google"
  | "cohere"
  | "together"
  | "groq"
  | "openrouter"
  | "deepseek";

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  costPer1kTokens: number;
}

export interface DesignRule {
  niche: string;
  colorPalette: string[];
  fontPairing: { primary: string; secondary: string };
  motionProfile: string;
  layoutWeights: number[];
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  issues: ValidationIssue[];
}

export interface ValidationIssue {
  type: "contrast" | "uniqueness" | "speed" | "wcag";
  message: string;
  severity: "error" | "warning";
}

export interface MutationOptions {
  preserveNiche: boolean;
  preserveColors: boolean;
  strength: 1 | 2 | 3 | 4 | 5;
  mode: "professional" | "playful" | "surprise";
}

export interface SavedPage {
  id: string;
  name: string;
  prompt: string;
  contextProfile: ContextProfile | null;
  copyElements: CopyElement[];
  layoutSchema: LayoutSchema;
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  llmProvider: LLMProvider;
  apiKey: string;
  defaultModel: string;
  theme: "light" | "dark";
  historySize: number;
  skillInject?: boolean;
}
