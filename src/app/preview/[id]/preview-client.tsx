"use client";

import { useState } from "react";
import { useGenerationStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui";
import type { Section, MutationOptions } from "@/types";
import { regenerateLayout } from "@/lib/layout-engine/mutation-engine";

const DEVICE_SIZES = [
  { id: "mobile", width: 375, label: "Mobile", icon: "📱" },
  { id: "tablet", width: 768, label: "Tablet", icon: "📟" },
  { id: "desktop", width: 1280, label: "Desktop", icon: "💻" },
];

const MUTATION_MODES = [
  { id: "professional", label: "More Professional", desc: "+15% whitespace, refined typography" },
  { id: "playful", label: "More Playful", desc: "Adds micro-interactions & color" },
  { id: "surprise", label: "Surprise Me", desc: "Randomizes 3 non-critical elements" },
];

function SectionPreview({ section, index }: { section: Section; index: number }) {
  const [hovered, setHovered] = useState(false);

  const bgVariants: Record<string, string> = {
    hero: "from-brand-dark to-brand-dark-light text-white",
    features: "bg-surface",
    testimonials: "bg-surface-secondary",
    pricing: "bg-surface",
    cta: "gradient-brand text-white",
    faq: "bg-surface-secondary",
    stats: "bg-brand-dark text-white",
    gallery: "bg-surface",
    logos: "bg-surface-secondary",
    contact: "bg-surface",
    comparison: "bg-surface-secondary",
    timeline: "bg-surface",
    team: "bg-surface-secondary",
  };

  return (
    <div
      className={`relative group transition-all duration-[var(--transition-base)] ${section.twClasses.join(" ")} ${bgVariants[section.type] || "bg-surface"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`absolute top-2 right-2 z-10 transition-opacity duration-[var(--transition-fast)] ${hovered ? "opacity-100" : "opacity-0"}`}
      >
        <button
          onClick={() => {}}
          className="px-2 py-1 rounded-soft bg-white/90 border border-surface-tertiary text-caption font-medium text-brand-primary shadow-soft hover:bg-white transition-all"
        >
          Redesign Section
        </button>
      </div>
      <div className="max-w-6xl mx-auto px-6">
        <SectionRenderer section={section} index={index} />
      </div>
    </div>
  );
}

function SectionRenderer({ section }: { section: Section; index: number }) {
  const { type, content } = section;

  switch (type) {
    case "hero":
      return (
        <div className="flex flex-col items-center text-center py-12 md:py-20">
          <h1 className="font-heading text-display font-bold mb-4 max-w-3xl">
            {content.headline || "Headline That Converts"}
          </h1>
          <p className="text-body-lg opacity-80 max-w-xl mb-8">
            {content.subheadline || "Compelling subheadline here"}
          </p>
          <Button variant="primary" size="lg">
            {content.cta || "Get Started"}
          </Button>
        </div>
      );
    case "features":
      return (
        <div className="py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-heading font-bold mb-3">{content.title || "Key Features"}</h2>
            <p className="text-body-lg text-text-secondary">{content.subtitle || ""}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-medium bg-surface border border-surface-tertiary shadow-soft">
                <div className="w-10 h-10 rounded-lg gradient-brand mb-4" />
                <h3 className="font-heading font-bold text-lg mb-2">
                  {content[`feature_${i}_title`] || `Capability ${i}`}
                </h3>
                <p className="text-body-sm text-text-secondary">
                  {content[`feature_${i}_desc`] || "Powerful feature designed to help you achieve more."}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    case "testimonials":
      return (
        <div className="py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-heading font-bold mb-3">{content.title || "Testimonials"}</h2>
            <p className="text-body-lg text-text-secondary">{content.subtitle || ""}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 rounded-medium bg-surface border border-surface-tertiary">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="16" height="16" viewBox="0 0 16 16" fill="#FF7E33">
                      <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.25l-3.52 1.85.67-3.93L2.3 5.64l3.94-.57L8 1.5z" />
                    </svg>
                  ))}
                </div>
                <p className="text-body text-text-secondary mb-4">&ldquo;{content[`quote_${i}`] || content.quote || "Great experience!"}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-tertiary" />
                  <div>
                    <div className="text-body-sm font-medium">{content[`author_${i}`] || "Customer"}</div>
                    <div className="text-caption text-text-muted">{content[`role_${i}`] || "Verified User"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "cta":
      return (
        <div className="py-12 md:py-16 text-center">
          <h2 className="font-heading text-heading font-bold mb-4">{content.headline || "Ready to Start?"}</h2>
          <p className="text-body-lg opacity-80 mb-8 max-w-lg mx-auto">{content.subheadline || "Join thousands of satisfied users today."}</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" size="lg">
              {content.button || content.cta || "Get Started Now"}
            </Button>
            <Button variant="ghost" size="lg">Learn More</Button>
          </div>
        </div>
      );
    case "pricing":
      return (
        <div className="py-12 md:py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-heading font-bold mb-3">{content.title || "Pricing"}</h2>
            <p className="text-body-lg text-text-secondary">{content.subtitle || ""}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: content.plan_1_name || "Basic", price: content.plan_1_price || "$9" },
              { name: content.plan_2_name || "Pro", price: content.plan_2_price || "$29" },
              { name: content.plan_3_name || "Enterprise", price: content.plan_3_price || "$99" },
            ].map((plan) => (
              <div key={plan.name} className="p-6 rounded-medium bg-surface border border-surface-tertiary shadow-soft text-center">
                <h3 className="font-heading font-bold text-lg mb-2">{plan.name}</h3>
                <div className="font-heading font-bold text-display mb-4">{plan.price}<span className="text-body-sm text-text-muted">/mo</span></div>
                <ul className="text-body-sm text-text-secondary space-y-2 mb-6">
                  <li>Feature A</li>
                  <li>Feature B</li>
                  <li>Feature C</li>
                </ul>
                <Button variant="outline" className="w-full">Choose Plan</Button>
              </div>
            ))}
          </div>
        </div>
      );
    case "faq":
      return (
        <div className="py-12 md:py-16 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-heading text-heading font-bold mb-3">{content.title || "FAQ"}</h2>
            <p className="text-body-lg text-text-secondary">{content.subtitle || ""}</p>
          </div>
          {[1, 2, 3].map((i) => (
            <details key={i} className="group border-b border-surface-tertiary py-4">
              <summary className="flex items-center justify-between cursor-pointer text-body font-medium">
                {content[`q_${i}`] || `Question ${i}?`}
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <p className="text-body-sm text-text-secondary mt-3">{content[`a_${i}`] || "Answer goes here."}</p>
            </details>
          ))}
        </div>
      );
    case "stats":
      return (
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
            {[
              { value: content.stat_1_value || "10K+", label: content.stat_1_label || "Users" },
              { value: content.stat_2_value || "99%", label: content.stat_2_label || "Uptime" },
              { value: content.stat_3_value || "50+", label: content.stat_3_label || "Countries" },
              { value: content.stat_4_value || "4.9", label: content.stat_4_label || "Rating" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-heading font-bold text-display">{stat.value}</div>
                <div className="text-body-sm opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className="py-12 text-center">
          <h2 className="font-heading text-heading-sm font-bold mb-2">{content.title || type}</h2>
          <p className="text-body text-text-secondary">{content.subtitle || ""}</p>
        </div>
      );
  }
}

export function PreviewPageClient() {
  const { layoutSchema, addMutation } = useGenerationStore();
  const { addToast } = useUIStore();
  const [device, setDevice] = useState("desktop");
  const [mutationStrength, setMutationStrength] = useState(3);
  const [showMutationPanel, setShowMutationPanel] = useState(false);

  const currentDevice = DEVICE_SIZES.find((d) => d.id === device) || DEVICE_SIZES[2];

  const handleRegenerate = async (mode: string) => {
    if (!layoutSchema) return;
    addToast(`Regenerating with "${mode}" mode...`, "info");
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    const options: MutationOptions = {
      preserveNiche: true,
      preserveColors: mode === "professional",
      strength: (mode === "surprise" ? mutationStrength : Math.max(2, mutationStrength - 1)) as 1 | 2 | 3 | 4 | 5,
      mode: mode as "professional" | "playful" | "surprise",
    };
    const mutated = regenerateLayout(layoutSchema, options);
    addMutation(mutated);
    useGenerationStore.getState().setLayoutSchema(mutated);
    addToast("Layout regenerated!", "success");
  };

  if (!layoutSchema) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="text-caption text-text-muted mb-2">No layout generated yet</div>
          <p className="text-body text-text-secondary mb-4">Go back and create a page first.</p>
          <a href="/create" className="text-brand-primary font-medium hover:underline">Create Page →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 h-12 border-b border-surface-tertiary bg-surface-secondary/50">
          <div className="flex items-center gap-1 bg-surface rounded-soft border border-surface-tertiary p-0.5">
            {DEVICE_SIZES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDevice(d.id)}
                className={`px-3 py-1 text-caption font-medium rounded-soft transition-all ${
                  device === d.id
                    ? "bg-white shadow-soft text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                {d.icon} {d.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
              WCAG AA ✓
            </span>
            <button
              onClick={() => setShowMutationPanel(!showMutationPanel)}
              className="px-3 py-1.5 rounded-soft border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
            >
              Mutation Panel
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F0F0F5]">
          <div
            className="mx-auto bg-white shadow-strong min-h-full transition-all duration-[var(--transition-base)]"
            style={{ maxWidth: currentDevice.width }}
          >
            {layoutSchema.sections.map((section, idx) => (
              <SectionPreview key={section.id} section={section} index={idx} />
            ))}
          </div>
        </div>
      </div>

      {showMutationPanel && (
        <div className="w-72 border-l border-surface-tertiary bg-surface overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-base mb-1">Mutation Engine</h3>
            <p className="text-caption text-text-muted mb-4">Adjust how your page looks.</p>
          </div>

          <div>
            <label className="text-caption font-medium text-text-muted mb-2 block">
              Mutation Strength: {mutationStrength}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={mutationStrength}
              onChange={(e) => setMutationStrength(Number(e.target.value))}
              className="w-full accent-brand-primary"
            />
            <div className="flex justify-between text-caption text-text-muted mt-1">
              <span>Subtle</span>
              <span>Extreme</span>
            </div>
          </div>

          <div className="space-y-2">
            {MUTATION_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleRegenerate(mode.id)}
                className="w-full text-left p-3 rounded-soft border border-surface-tertiary hover:border-brand-primary hover:bg-brand-primary/5 transition-all"
              >
                <div className="text-body-sm font-medium">{mode.label}</div>
                <div className="text-caption text-text-muted">{mode.desc}</div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-surface-tertiary">
            <Button variant="primary" className="w-full" onClick={() => handleRegenerate("surprise")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Regenerate
            </Button>
          </div>

          <div className="pt-4 space-y-2">
            <Button variant="secondary" className="w-full" size="sm">
              Export HTML
            </Button>
            <Button variant="ghost" className="w-full" size="sm">
              Export PNG
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
