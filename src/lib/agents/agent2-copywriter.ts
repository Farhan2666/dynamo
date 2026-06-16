import type { ContextProfile, CopyElement } from "@/types";

const HEADLINE_TEMPLATES: Record<string, string[]> = {
  trust: [
    "Trusted by {audience} Worldwide",
    "Secure Your {audience} Future",
    "Built for {audience} Excellence",
  ],
  professional: [
    "Elevate Your {audience} Strategy",
    "The Professional {audience} Solution",
    "Streamline Your {audience} Workflow",
  ],
  calm: [
    "Find Your {audience} Balance",
    "Nurture Your {audience} Journey",
    "Peaceful {audience} Starts Here",
  ],
  growth: [
    "Unlock Your {audience} Potential",
    "Grow Your {audience} Skills",
    "Master {audience} Today",
  ],
  energetic: [
    "Transform Your {audience} Now",
    "Supercharge Your {audience}",
    "The {audience} Revolution Starts Here",
  ],
  playful: [
    "Make {audience} Magic",
    "Create {audience} That Pops",
    "Your {audience} Adventure Awaits",
  ],
  warm: [
    "Welcome to {audience} Joy",
    "Savor Every {audience} Moment",
    "Handcrafted {audience} for You",
  ],
  confident: [
    "The {audience} Authority",
    "Leading {audience} Innovation",
    "Redefining {audience} Standards",
  ],
  balanced: [
    "The Smarter {audience} Choice",
    "Your {audience} Journey Starts Here",
    "Transform Your {audience} Today",
  ],
};

const CTA_VERBS = [
  "Get Started", "Claim Your Spot", "Try Free", "Join Now",
  "Book a Call", "Start Building", "Get Access", "Launch Now",
  "Reserve Your Place", "See Pricing", "Start Trial", "Explore",
];

const BENEFIT_PATTERNS = [
  "Save {time} per week with automated {feature}",
  "Increase {metric} by up to {percent}%",
  "No {pain_point} required — {solution} instead",
  "Built for {audience}, trusted by {social_proof}",
  "From {pain_state} to {gain_state} in {duration}",
];

export function generateCopy(context: ContextProfile): CopyElement[] {
  const mood = context.moodProfile || "balanced";
  const audience = context.industryTags[0] || "your industry";
  const templates = HEADLINE_TEMPLATES[mood] || HEADLINE_TEMPLATES.balanced;

  const headlines = templates.map((t) =>
    t.replace(/{audience}/g, audience.charAt(0).toUpperCase() + audience.slice(1))
  );

  const ctas = CTA_VERBS.sort(() => Math.random() - 0.5).slice(0, 3);

  const benefits = BENEFIT_PATTERNS.slice(0, 3).map((p) =>
    p
      .replace(/{time}/g, ["10 hours", "5 days", "30 minutes"][Math.floor(Math.random() * 3)])
      .replace(/{metric}/g, ["conversion", "engagement", "revenue"][Math.floor(Math.random() * 3)])
      .replace(/{percent}/g, String([30, 50, 80][Math.floor(Math.random() * 3)]))
      .replace(/{pain_point}/g, ["technical skills", "design experience", "coding"][Math.floor(Math.random() * 3)])
      .replace(/{solution}/g, ["AI-powered generation", "smart templates", "one-click setup"][Math.floor(Math.random() * 3)])
      .replace(/{audience}/g, audience)
      .replace(/{social_proof}/g, ["industry leaders", "thousands", "fast-growing teams"][Math.floor(Math.random() * 3)])
      .replace(/{pain_state}/g, ["overwhelmed", "stuck", "struggling"][Math.floor(Math.random() * 3)])
      .replace(/{gain_state}/g, ["confident", "ahead", "in control"][Math.floor(Math.random() * 3)])
      .replace(/{duration}/g, ["days", "weeks", "sessions"][Math.floor(Math.random() * 3)])
  );

  const subheaderMap: Record<string, string> = {
    trust: "Enterprise-grade security meets seamless experience.",
    professional: "Streamlined tools for serious professionals.",
    calm: "Slow down and breathe — we've got this.",
    growth: "Every step forward counts. Start yours today.",
    energetic: "High energy. High impact. High results.",
    playful: "Serious fun for creative minds.",
    warm: "Made with care, delivered with love.",
    confident: "Because you deserve the best.",
    balanced: "Simple, smart, and made for you.",
  };

  return [
    {
      type: "headline",
      content: headlines[0],
      variants: headlines.slice(1),
    },
    {
      type: "subheader",
      content: subheaderMap[mood] || subheaderMap.balanced,
      variants: [],
    },
    {
      type: "cta",
      content: ctas[0],
      variants: ctas.slice(1),
    },
    {
      type: "benefit",
      content: benefits[0],
      variants: benefits.slice(1),
    },
    {
      type: "seo",
      content: `${headlines[0]} — ${subheaderMap[mood] || subheaderMap.balanced} Join ${audience} leaders today.`,
      variants: [],
    },
  ];
}
