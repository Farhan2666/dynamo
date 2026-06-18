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
  type: "headline" | "subheader" | "cta" | "benefit" | "seo";
  content: string;
  variants: string[];
}

export interface LayoutSchema {
  layout: "centered" | "asymmetric" | "split" | "full-width" | "grid";
  sections: Section[];
  animations: AnimationSpec;
  twConfig: string[];
  wcagScore?: number;
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
  | "openrouter";

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

export interface UserSettings {
  llmProvider: LLMProvider;
  apiKey: string;
  defaultModel: string;
  theme: "light" | "dark";
  historySize: number;
}
