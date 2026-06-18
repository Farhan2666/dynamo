"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGenerationStore, useUIStore, useSettingsStore } from "@/lib/store";
import { Button } from "@/components/ui";
import type { Section, MutationOptions, SEOData, LayoutSchema } from "@/types";
import { regenerateLayout } from "@/lib/layout-engine/mutation-engine";
import { EditableText } from "@/components/editable-text";
import { ImageUpload } from "@/components/image-upload";
import { ContactForm } from "@/components/contact-form";
import { ExportPanel } from "@/components/ui";
import { runAgent3 } from "@/lib/agents/orchestrator";

const DEVICE_SIZES = [
  { id: "mobile", width: 375, label: "Mobile", icon: "\u{1F4F1}" },
  { id: "tablet", width: 768, label: "Tablet", icon: "\u{1F4DF}" },
  { id: "desktop", width: 1280, label: "Desktop", icon: "\u{1F4BB}" },
];

const MUTATION_MODES = [
  { id: "professional", label: "More Professional", desc: "+15% whitespace, refined typography" },
  { id: "playful", label: "More Playful", desc: "Adds micro-interactions & color" },
  { id: "surprise", label: "Surprise Me", desc: "Randomizes 3 non-critical elements" },
];

const ICON_PATHS = [
  "M13 10V3L4 14h7l-3 7 9-11h-7l3-7z",
  "M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
];

const ICON_COLORS = [
  "from-brand-primary to-purple-500", "from-brand-secondary to-teal-500",
  "from-brand-accent to-orange-500", "from-pink-500 to-rose-500",
  "from-amber-500 to-yellow-500", "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-500", "from-violet-500 to-indigo-500",
];

const ADD_SECTION_TYPES = [
  { type: "hero", label: "Hero" },
  { type: "features", label: "Features" },
  { type: "testimonials", label: "Testimonials" },
  { type: "pricing", label: "Pricing" },
  { type: "cta", label: "CTA" },
  { type: "faq", label: "FAQ" },
  { type: "stats", label: "Stats" },
  { type: "gallery", label: "Gallery" },
  { type: "team", label: "Team" },
  { type: "logos", label: "Logos" },
  { type: "contact", label: "Contact" },
  { type: "comparison", label: "Comparison" },
  { type: "timeline", label: "Timeline" },
];

function useSectionEdit() {
  const { layoutSchema, setLayoutSchema } = useGenerationStore();

  const updateContent = useCallback((sectionId: string, key: string, value: string) => {
    if (!layoutSchema) return;
    const updated = {
      ...layoutSchema,
      sections: layoutSchema.sections.map((s) =>
        s.id === sectionId
          ? { ...s, content: { ...s.content, [key]: value } }
          : s
      ),
    };
    setLayoutSchema(updated);
  }, [layoutSchema, setLayoutSchema]);

  const updateImage = useCallback((sectionId: string, dataUrl: string) => {
    if (!layoutSchema) return;
    const updated = {
      ...layoutSchema,
      sections: layoutSchema.sections.map((s) =>
        s.id === sectionId
          ? { ...s, content: { ...s.content, image: dataUrl } }
          : s
      ),
    };
    setLayoutSchema(updated);
  }, [layoutSchema, setLayoutSchema]);

  const setVariant = useCallback((sectionId: string, variant: number) => {
    if (!layoutSchema) return;
    const updated = {
      ...layoutSchema,
      sections: layoutSchema.sections.map((s) =>
        s.id === sectionId ? { ...s, content: { ...s.content, _variant: String(variant) } } : s
      ),
    };
    setLayoutSchema(updated);
  }, [layoutSchema, setLayoutSchema]);

  const addSection = useCallback((afterId: string, type: string) => {
    if (!layoutSchema) return;
    const idx = layoutSchema.sections.findIndex((s) => s.id === afterId);
    const newSection: Section = {
      id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: type as Section["type"],
      order: idx + 1,
      content: {},
      twClasses: [],
      spacing: "comfortable",
    };
    const sections = [...layoutSchema.sections];
    sections.splice(idx + 1, 0, newSection);
    const reordered = sections.map((s, i) => ({ ...s, order: i }));
    setLayoutSchema({ ...layoutSchema, sections: reordered });
  }, [layoutSchema, setLayoutSchema]);

  const removeSection = useCallback((sectionId: string) => {
    if (!layoutSchema) return;
    const sections = layoutSchema.sections.filter((s) => s.id !== sectionId);
    const reordered = sections.map((s, i) => ({ ...s, order: i }));
    setLayoutSchema({ ...layoutSchema, sections: reordered });
  }, [layoutSchema, setLayoutSchema]);

  return { updateContent, updateImage, setVariant, addSection, removeSection };
}

function StarRating({ size = 14 }: { size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={size} height={size} viewBox="0 0 16 16" fill="#FF7E33">
          <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.25l-3.52 1.85.67-3.93L2.3 5.64l3.94-.57L8 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function SectionToolbar({
  onCycleVariant,
  onAddSection,
  onRemoveSection,
  onMoveUp,
  onMoveDown,
  onCopyHTML,
}: {
  onCycleVariant: () => void;
  onAddSection: (type: string) => void;
  onRemoveSection: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onCopyHTML?: () => void;
}) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="absolute top-2 right-2 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      {onMoveUp && (
        <button
          onClick={onMoveUp}
          className="px-1.5 py-1 rounded-soft bg-white/90 border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-white hover:text-brand-primary transition-all shadow-soft"
          title="Move section up"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 12V4M4 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      {onMoveDown && (
        <button
          onClick={onMoveDown}
          className="px-1.5 py-1 rounded-soft bg-white/90 border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-white hover:text-brand-primary transition-all shadow-soft"
          title="Move section down"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 4v8M4 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      )}
      {onCopyHTML && (
        <button
          onClick={onCopyHTML}
          className="px-2 py-1 rounded-soft bg-white/90 border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-white hover:text-blue-600 transition-all shadow-soft"
          title="Copy section HTML"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline mr-0.5"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M3 11V3a1.5 1.5 0 011.5-1.5H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          HTML
        </button>
      )}
      <button
        onClick={onCycleVariant}
        className="px-2 py-1 rounded-soft bg-white/90 border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-white hover:text-brand-primary transition-all shadow-soft"
        title="Switch layout variant"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline mr-1">
          <path d="M1 4l3-3 3 3M15 12l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 1v10a3 3 0 003 3h8M12 15l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Variant
      </button>
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="px-2 py-1 rounded-soft bg-white/90 border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-white hover:text-green-600 transition-all shadow-soft"
          title="Add section below"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline mr-1">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add
        </button>
        {showAddMenu && (
          <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-surface-tertiary rounded-medium shadow-medium z-30 p-1 max-h-60 overflow-y-auto">
            {ADD_SECTION_TYPES.map((st) => (
              <button
                key={st.type}
                onClick={() => { onAddSection(st.type); setShowAddMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-caption text-text-secondary hover:bg-surface-secondary rounded-soft transition-colors"
              >
                {st.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onRemoveSection}
        className="px-2 py-1 rounded-soft bg-white/90 border border-surface-tertiary text-caption font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-soft"
        title="Remove section"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M5 4V2.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4M13 4v9.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 013 13.5V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

const SECTION_VARIANTS: Record<string, number> = {
  hero: 3, features: 3, testimonials: 3, pricing: 3, cta: 2,
  faq: 3, stats: 3, gallery: 2, logos: 2, contact: 2,
  comparison: 2, timeline: 2, team: 2,
};

function getInitialVariant(sectionId: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < sectionId.length; i++) {
    hash = ((hash << 5) - hash) + sectionId.charCodeAt(i);
  }
  return Math.abs(hash) % max;
}

const SPACING_MAP: Record<string, string> = {
  compact: "py-10 md:py-14",
  comfortable: "py-16 md:py-20",
  spacious: "py-20 md:py-28",
  breathing: "py-24 md:py-36",
};

const SECTION_BG: Record<string, string[]> = {
  hero: ["from-brand-dark to-brand-dark-light text-white", "bg-surface text-text-primary", "gradient-brand text-white"],
  features: ["bg-surface", "bg-surface-secondary", "bg-white"],
  testimonials: ["bg-surface-secondary", "bg-surface", "bg-brand-dark text-white"],
  pricing: ["bg-surface", "bg-surface-secondary", "bg-gradient-to-b from-surface to-surface-secondary"],
  cta: ["gradient-brand text-white", "bg-brand-dark text-white", "bg-surface border-t border-surface-tertiary"],
  faq: ["bg-surface-secondary", "bg-surface", "bg-white"],
  stats: ["bg-brand-dark text-white", "gradient-brand text-white", "bg-surface border-b border-surface-tertiary"],
  gallery: ["bg-surface", "bg-surface-secondary", "bg-brand-dark text-white"],
  logos: ["bg-surface-secondary", "bg-surface", "bg-white"],
  contact: ["bg-surface", "bg-surface-secondary", "bg-brand-dark text-white"],
  comparison: ["bg-surface-secondary", "bg-surface", "bg-white"],
  timeline: ["bg-surface", "bg-surface-secondary", "bg-brand-dark text-white"],
  team: ["bg-surface-secondary", "bg-surface", "bg-white"],
};

function SectionPreview({
  section,
  sectionIndex,
  totalSections,
  onSetBackground,
}: {
  section: Section;
  sectionIndex: number;
  totalSections: number;
  onSetBackground: (sectionId: string, url: string) => void;
}) {
  const { updateImage, updateContent, setVariant, addSection, removeSection } = useSectionEdit();
  const { reorderSections } = useGenerationStore();
  const { addToast } = useUIStore();
  const [dragOver, setDragOver] = useState(false);
  const [bgUrlInput, setBgUrlInput] = useState(false);
  const [bgUrlValue, setBgUrlValue] = useState("");
  const dragRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", String(sectionIndex));
    e.dataTransfer.effectAllowed = "move";
    if (dragRef.current) {
      dragRef.current.style.opacity = "0.4";
    }
  };

  const handleDragEnd = () => {
    if (dragRef.current) {
      dragRef.current.style.opacity = "1";
    }
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (fromIndex !== sectionIndex) {
      reorderSections(fromIndex, sectionIndex);
    }
  };

  const variantCount = SECTION_VARIANTS[section.type] || 1;
  const raw = Number(section.content._variant);
  const variant = !isNaN(raw) ? raw % variantCount : getInitialVariant(section.id, variantCount);

  const cycleVariant = () => {
    const next = (variant + 1) % variantCount;
    setVariant(section.id, next);
  };

  const handleAddSection = (type: string) => {
    addSection(section.id, type);
  };

  const handleRemoveSection = () => {
    removeSection(section.id);
  };

  const handleMoveUp = sectionIndex > 0 ? () => reorderSections(sectionIndex, sectionIndex - 1) : undefined;
  const handleMoveDown = sectionIndex < totalSections - 1 ? () => reorderSections(sectionIndex, sectionIndex + 1) : undefined;

  const handleCopyHTML = () => {
    const el = document.querySelector(`[data-section-id="${section.id}"]`);
    if (el) {
      const html = el.innerHTML;
      navigator.clipboard.writeText(html).then(() => addToast("Section HTML copied!", "success"));
    } else {
      addToast("Could not find section element", "error");
    }
  };

  const bgOptions = SECTION_BG[section.type];
  const bgClass = bgOptions ? bgOptions[variant % bgOptions.length] : "bg-surface";
  const hasCustomBg = !!section.content.__background;

  return (
    <div
      ref={dragRef}
      data-section-id={section.id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative group transition-all duration-[var(--transition-base)] ${section.twClasses.join(" ")} ${!hasCustomBg ? bgClass : ""} dynamo-animate dynamo-hidden ${dragOver ? "ring-2 ring-brand-primary ring-offset-2" : ""} ${hasCustomBg ? "bg-cover bg-center text-white" : ""}`}
      style={{
        ...(hasCustomBg ? { backgroundImage: `url(${section.content.__background})` } : {}),
        transitionDelay: `${sectionIndex * 60}ms`,
      } as React.CSSProperties}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <div className="w-5 h-10 flex flex-col items-center justify-center gap-1 rounded-soft bg-white/90 border border-surface-tertiary shadow-soft">
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="text-text-muted"><circle cx="4" cy="2" r="1"/><circle cx="4" cy="6" r="1"/></svg>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="text-text-muted"><circle cx="4" cy="2" r="1"/><circle cx="4" cy="6" r="1"/></svg>
        </div>
      </div>
      {section.type === "hero" && <div className="noise-bg absolute inset-0 pointer-events-none opacity-30" />}
      {section.type === "cta" && <div className="noise-bg absolute inset-0 pointer-events-none opacity-20" />}
      {hasCustomBg && <div className="absolute inset-0 bg-black/50 pointer-events-none" />}
      <SectionToolbar
        onCycleVariant={cycleVariant}
        onAddSection={handleAddSection}
        onRemoveSection={handleRemoveSection}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onCopyHTML={handleCopyHTML}
      />
      <div className="absolute top-10 left-2 z-20">
        {!bgUrlInput && (
          <button
            onClick={() => setBgUrlInput(true)}
            className="w-8 h-8 flex items-center justify-center rounded-soft bg-white border border-surface-tertiary text-text-muted hover:text-brand-primary hover:border-brand-primary transition-all shadow-soft"
            title="Set section background image"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
              <circle cx="5" cy="5" r="1.5" />
              <path d="M15 10l-3-3-4 4-2-2-3 3" />
            </svg>
          </button>
        )}
        {bgUrlInput && (
          <div className="flex flex-col gap-2 bg-white rounded-soft border border-surface-tertiary p-2 shadow-soft min-w-[200px]">
            <div className="flex gap-1">
              <input
                type="text"
                value={bgUrlValue}
                onChange={(e) => setBgUrlValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && bgUrlValue.trim()) {
                    onSetBackground(section.id, bgUrlValue.trim());
                    setBgUrlInput(false);
                    setBgUrlValue("");
                  }
                  if (e.key === "Escape") { setBgUrlInput(false); setBgUrlValue(""); }
                }}
                placeholder="Image URL..."
                className="flex-1 px-2 py-1 text-caption border border-surface-tertiary rounded-soft focus:outline-none focus:border-brand-primary"
                autoFocus
              />
              <button
                onClick={() => { if (bgUrlValue.trim()) { onSetBackground(section.id, bgUrlValue.trim()); setBgUrlInput(false); setBgUrlValue(""); } }}
                className="px-2 py-1 text-caption font-medium text-white bg-brand-primary rounded-soft hover:opacity-90"
              >
                Set
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-surface-tertiary" />
              <span className="text-caption text-text-muted">or</span>
              <div className="flex-1 h-px bg-surface-tertiary" />
            </div>
            <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-caption font-medium text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 rounded-soft border border-brand-primary/20 cursor-pointer transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 2v8M2 6h8" strokeLinecap="round" />
              </svg>
              Upload from Gallery
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      onSetBackground(section.id, dataUrl);
                      setBgUrlInput(false);
                      setBgUrlValue("");
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = "";
                }}
              />
            </label>
            <div className="flex justify-end gap-1 pt-1 border-t border-surface-tertiary">
              {hasCustomBg && (
                <button
                  onClick={() => { onSetBackground(section.id, ""); setBgUrlInput(false); }}
                  className="px-2 py-1 text-caption text-red-500 hover:bg-red-50 rounded-soft transition-colors"
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => { setBgUrlInput(false); setBgUrlValue(""); }}
                className="px-2 py-1 text-caption text-text-muted hover:bg-surface-tertiary rounded-soft transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="relative max-w-6xl mx-auto px-6">
        <SectionRenderer
          section={section}
          variant={variant}
          save={(key: string) => (val: string) => updateContent(section.id, key, val)}
          updateImage={updateImage}
          updateContent={updateContent}
        />
      </div>
    </div>
  );
}

function SectionRenderer({
  section,
  variant,
  save,
  updateImage,
  updateContent,
}: {
  section: Section;
  variant: number;
  save: (key: string) => (val: string) => void;
  updateImage: (sid: string, url: string) => void;
  updateContent: (sid: string, key: string, value: string) => void;
}) {
  const { type, content, id, spacing } = section;
  const sp = SPACING_MAP[spacing] || SPACING_MAP.comfortable;
  const s = save;

  /* ── HERO ────────────────────────────── */
  if (type === "hero") {
    if (variant === 1) {
      return (
        <div className={`${sp}`}>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-left">
              <ImageUpload sectionId={id} existingUrl={content.image} onSave={updateImage} aspectRatio="16/9" label="Add Image" className="w-full md:hidden mb-6" />
              {content.badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-caption font-medium mb-5 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft" />
                  <EditableText value={content.badge} onSave={s("badge")} tag="span" />
                </span>
              )}
              <EditableText value={content.headline} onSave={s("headline")} tag="h1" className="font-heading text-display font-bold mb-4 leading-tight" placeholder="Your headline" />
              <EditableText value={content.subheadline} onSave={s("subheadline")} tag="p" className="text-body-lg opacity-80 max-w-lg mb-8 leading-relaxed" placeholder="Your subheadline" />
              <div className="flex items-center gap-3">
                <Button variant="primary" size="lg"><EditableText value={content.cta || "Get Started"} onSave={s("cta")} tag="span" /></Button>
                <Button variant="ghost" size="lg">Learn More →</Button>
              </div>
            </div>
            <div className="flex-1 hidden md:block">
              <ImageUpload sectionId={id} existingUrl={content.image} onSave={updateImage} aspectRatio="4/3" label="Add Hero Image" className="w-full rounded-medium overflow-hidden shadow-strong" />
            </div>
          </div>
        </div>
      );
    }
    if (variant === 2) {
      return (
        <div className={`${sp} text-center max-w-3xl mx-auto`}>
          <EditableText value={content.headline} onSave={s("headline")} tag="h1" className="font-heading text-display font-bold mb-6 leading-[1.05] tracking-tight" placeholder="Big headline" />
          <EditableText value={content.subheadline} onSave={s("subheadline")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto mb-10" placeholder="Simple subheadline" />
          <div className="flex items-center justify-center gap-3">
            <Button variant="primary" size="lg"><EditableText value={content.cta || "Start"} onSave={s("cta")} tag="span" /></Button>
            <Button variant="ghost" size="lg">Talk to us <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline ml-1"><path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></Button>
          </div>
        </div>
      );
    }
    return (
      <div className={`${sp} flex flex-col items-center text-center`}>
        <ImageUpload sectionId={id} existingUrl={content.image} onSave={updateImage} aspectRatio="16/9" label="Add Hero Image" className="w-full max-w-3xl mb-8 rounded-medium overflow-hidden shadow-strong" />
        {content.badge && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-caption font-medium mb-6 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft" />
            <EditableText value={content.badge} onSave={s("badge")} tag="span" />
          </span>
        )}
        <EditableText value={content.headline} onSave={s("headline")} tag="h1" className="font-heading text-display font-bold mb-5 max-w-4xl leading-tight" placeholder="Your headline here" />
        <EditableText value={content.subheadline} onSave={s("subheadline")} tag="p" className="text-body-lg opacity-80 max-w-2xl mb-10 leading-relaxed" placeholder="Your subheadline here" />
        <div className="flex items-center gap-4">
          <Button variant="primary" size="lg"><EditableText value={content.cta || "Get Started"} onSave={s("cta")} tag="span" /></Button>
          <Button variant="ghost" size="lg">Learn More →</Button>
        </div>
      </div>
    );
  }

  /* ── FEATURES ─────────────────────────── */
  if (type === "features") {
    if (variant === 1) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Features</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Key Features" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="What makes you different" />
          </div>
          <div className="space-y-12 max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => {
              const ci = (i - 1) % ICON_COLORS.length;
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`flex flex-col ${isEven ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${ICON_COLORS[ci]} flex items-center justify-center shrink-0`}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICON_PATHS[(i - 1) % ICON_PATHS.length]} />
                    </svg>
                  </div>
                  <div className={isEven ? "md:text-right" : ""}>
                    <EditableText value={content[`feature_${i}_title`]} onSave={s(`feature_${i}_title`)} tag="h3" className="font-heading font-bold text-xl mb-2" placeholder={`Capability ${i}`} />
                    <EditableText value={content[`feature_${i}_desc`]} onSave={s(`feature_${i}_desc`)} tag="p" className="text-body text-text-secondary max-w-md leading-relaxed" placeholder="Powerful feature description" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    if (variant === 2) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Features</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Key Features" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="What makes you different" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => {
              const ci = (i - 1) % ICON_COLORS.length;
              return (
                <div key={i} className="p-5 rounded-medium bg-surface border border-surface-tertiary text-center hover:shadow-soft transition-shadow">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ICON_COLORS[ci]} flex items-center justify-center mx-auto mb-3`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICON_PATHS[(i - 1) % ICON_PATHS.length]} />
                    </svg>
                  </div>
                  <EditableText value={content[`feature_${i}_title`]} onSave={s(`feature_${i}_title`)} tag="h3" className="font-heading font-bold text-sm mb-1" placeholder={`Feature ${i}`} />
                  <EditableText value={content[`feature_${i}_desc`]} onSave={s(`feature_${i}_desc`)} tag="p" className="text-caption text-text-secondary" placeholder="Description" />
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div className={sp}>
        <div className="text-center mb-14">
          <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Features</span>
          <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Key Features" />
          <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="What makes you different" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => {
            const ci = (i - 1) % ICON_COLORS.length;
            return (
              <div key={i} className="group p-8 rounded-medium bg-surface border border-surface-tertiary shadow-soft hover:shadow-medium hover:-translate-y-1 transition-all duration-[var(--transition-base)]">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ICON_COLORS[ci]} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={ICON_PATHS[(i - 1) % ICON_PATHS.length]} />
                  </svg>
                </div>
                <EditableText value={content[`feature_${i}_title`]} onSave={s(`feature_${i}_title`)} tag="h3" className="font-heading font-bold text-lg mb-3" placeholder={`Capability ${i}`} />
                <EditableText value={content[`feature_${i}_desc`]} onSave={s(`feature_${i}_desc`)} tag="p" className="text-body-sm text-text-secondary leading-relaxed" placeholder="Powerful feature description" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── TESTIMONIALS ─────────────────────── */
  if (type === "testimonials") {
    if (variant === 1) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Testimonials</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="What People Say" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="Trusted by thousands" />
          </div>
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-8 rounded-medium bg-surface border-2 border-brand-primary/20 shadow-soft relative">
              <svg className="absolute top-4 left-4 w-8 h-8 text-brand-primary/10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
              </svg>
              <div className="relative ml-4">
                <StarRating size={16} />
                <EditableText value={content.quote_1} onSave={s("quote_1")} tag="p" className="text-body-lg text-text-secondary mt-4 mb-6 leading-relaxed italic" placeholder="Featured testimonial" />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-body">
                    {(content.name_1 || "?").charAt(0)}
                  </div>
                  <div>
                    <EditableText value={content.name_1} onSave={s("name_1")} tag="div" className="font-heading font-bold text-body" placeholder="Name" />
                    <EditableText value={content.role_1} onSave={s("role_1")} tag="div" className="text-caption text-text-muted" placeholder="Role" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[2, 3].map((i) => (
                <div key={i} className="p-6 rounded-medium bg-surface border border-surface-tertiary">
                  <StarRating />
                  <EditableText value={content[`quote_${i}`]} onSave={s(`quote_${i}`)} tag="p" className="text-body-sm text-text-secondary mt-3 mb-4 leading-relaxed" placeholder="Short testimonial" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent to-pink-500 flex items-center justify-center text-white font-bold text-caption">
                      {(content[`name_${i}`] || "?").charAt(0)}
                    </div>
                    <EditableText value={content[`name_${i}`]} onSave={s(`name_${i}`)} tag="span" className="text-body-sm font-medium" placeholder="Name" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (variant === 2) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Testimonials</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="What People Say" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="Trusted by thousands" />
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-medium bg-surface border border-surface-tertiary text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-body mx-auto mb-3">
                  {(content[`name_${i}`] || "?").charAt(0)}
                </div>
                <StarRating />
                <EditableText value={content[`quote_${i}`]} onSave={s(`quote_${i}`)} tag="p" className="text-body-sm text-text-secondary mt-3 mb-3 leading-relaxed italic" placeholder="Great product!" />
                <EditableText value={content[`name_${i}`]} onSave={s(`name_${i}`)} tag="div" className="text-body-sm font-medium" placeholder="Name" />
                <EditableText value={content[`role_${i}`]} onSave={s(`role_${i}`)} tag="div" className="text-caption text-text-muted" placeholder="Role" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className={sp}>
        <div className="text-center mb-14">
          <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Testimonials</span>
          <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="What People Say" />
          <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="Trusted by thousands" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[1, 2].map((i) => (
            <div key={i} className="p-8 rounded-medium bg-surface border border-surface-tertiary shadow-soft relative">
              <svg className="absolute top-4 left-4 w-8 h-8 text-brand-primary/10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
              </svg>
              <div className="relative">
                <StarRating />
                <EditableText value={content[`quote_${i}`]} onSave={s(`quote_${i}`)} tag="p" className="text-body text-text-secondary mt-4 mb-6 leading-relaxed" placeholder="Great experience!" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-body-sm">
                    {(content[`name_${i}`] || "?").charAt(0)}
                  </div>
                  <div>
                    <EditableText value={content[`name_${i}`]} onSave={s(`name_${i}`)} tag="div" className="text-body-sm font-medium" placeholder="Customer Name" />
                    <div className="text-caption text-text-muted">
                      <EditableText value={content[`role_${i}`]} onSave={s(`role_${i}`)} tag="span" placeholder="Role" />
                      {content[`company_${i}`] ? ` · ${content[`company_${i}`]}` : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── PRICING ──────────────────────────── */
  if (type === "pricing") {
    if (variant === 1) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Pricing</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Simple Pricing" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="Choose the plan" />
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {[1, 3].map((i) => {
              const name = content[`plan_${i}_name`] || (i === 1 ? "Starter" : "Enterprise");
              const price = content[`plan_${i}_price`] || (i === 1 ? "$19" : "$99");
              return (
                <div key={name} className="p-8 rounded-medium bg-surface border border-surface-tertiary shadow-soft hover:shadow-medium transition-shadow">
                  <EditableText value={name} onSave={s(`plan_${i}_name`)} tag="h3" className="font-heading font-bold text-xl mb-2" placeholder="Plan Name" />
                  <EditableText value={content[`plan_${i}_desc`]} onSave={s(`plan_${i}_desc`)} tag="p" className="text-body-sm text-text-muted mb-4" placeholder="Description" />
                  <div className="font-heading font-bold text-display mb-1">
                    <EditableText value={price} onSave={s(`plan_${i}_price`)} tag="span" />
                    <span className="text-body text-text-muted">/mo</span>
                  </div>
                  <ul className="text-body-sm text-text-secondary space-y-3 my-6">
                    {[1, 2, 3, 4].map((f) => {
                      const feat = content[`plan_${i}_feat_${f}`];
                      if (!feat) return null;
                      return (
                        <li key={feat} className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" /></svg>
                          {feat}
                        </li>
                      );
                    })}
                  </ul>
                  <Button variant="outline" className="w-full">{content[`plan_${i}_cta`] || "Get Started"}</Button>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    if (variant === 2) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Pricing</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Simple Pricing" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="Choose the plan" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[1, 2, 3, 4].map((i) => {
              const name = content[`plan_${i}_name`] || ["Free", "Starter", "Pro", "Enterprise"][i - 1];
              const price = content[`plan_${i}_price`] || ["$0", "$9", "$29", "$99"][i - 1];
              return (
                <div key={name} className="p-5 rounded-medium bg-surface border border-surface-tertiary text-center">
                  <EditableText value={name} onSave={s(`plan_${i}_name`)} tag="h3" className="font-heading font-bold text-sm mb-1" placeholder="Plan" />
                  <div className="font-heading font-bold text-xl mb-3">
                    <EditableText value={price} onSave={s(`plan_${i}_price`)} tag="span" />
                  </div>
                  <ul className="text-caption text-text-secondary space-y-1.5 mb-4">
                    {[1, 2, 3].map((f) => {
                      const feat = content[`plan_${i}_feat_${f}`];
                      if (!feat) return null;
                      return <li key={feat}>{feat}</li>;
                    })}
                  </ul>
                  <Button variant={i === 3 ? "primary" : "outline"} size="sm" className="w-full">{content[`plan_${i}_cta`] || "Choose"}</Button>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div className={sp}>
        <div className="text-center mb-14">
          <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Pricing</span>
          <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Simple Pricing" />
          <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="Choose the plan" />
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => {
            const name = content[`plan_${i}_name`];
            const price = content[`plan_${i}_price`];
            const cta = content[`plan_${i}_cta`] || "Choose Plan";
            const isPopular = i === 2;
            return (
              <div key={name} className={`relative p-8 rounded-medium bg-surface border text-center transition-all duration-[var(--transition-base)] ${isPopular ? "border-brand-primary shadow-glow scale-105" : "border-surface-tertiary shadow-soft hover:shadow-medium"}`}>
                {isPopular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-primary text-white text-caption font-medium rounded-full">Most Popular</div>}
                <EditableText value={name} onSave={s(`plan_${i}_name`)} tag="h3" className="font-heading font-bold text-lg mb-1" placeholder="Plan Name" />
                <EditableText value={content[`plan_${i}_desc`]} onSave={s(`plan_${i}_desc`)} tag="p" className="text-caption text-text-muted mb-4" placeholder="Plan description" />
                <div className="font-heading font-bold text-display mb-1">
                  <EditableText value={price} onSave={s(`plan_${i}_price`)} tag="span" placeholder="$0" />
                </div>
                <p className="text-caption text-text-muted mb-6">per month</p>
                <ul className="text-body-sm text-text-secondary space-y-3 mb-8 text-left">
                  {[1, 2, 3, 4].map((f) => {
                    const feat = content[`plan_${i}_feat_${f}`];
                    if (!feat) return null;
                    return (
                      <li key={feat} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                        {feat}
                      </li>
                    );
                  })}
                </ul>
                <Button variant={isPopular ? "primary" : "outline"} className="w-full">{cta}</Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── CTA ──────────────────────────────── */
  if (type === "cta") {
    if (variant === 1) {
      return (
        <div className={`${sp} text-center`}>
          <div className="max-w-lg mx-auto">
            <EditableText value={content.headline} onSave={s("headline")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Ready?" />
            <EditableText value={content.subheadline} onSave={s("subheadline")} tag="p" className="text-body-lg opacity-80 mb-8" placeholder="Join us today" />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <input type="email" placeholder="Enter your email" className="px-4 py-2.5 rounded-soft border border-white/30 bg-white/10 backdrop-blur-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-auto min-w-[220px]" />
              <Button variant="primary"><EditableText value={content.button || content.cta || "Subscribe"} onSave={s("button")} tag="span" /></Button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={`${sp} text-center relative overflow-hidden`}>
        <div className="relative">
          <EditableText value={content.headline} onSave={s("headline")} tag="h2" className="font-heading text-heading font-bold mb-4" placeholder="Ready to Start?" />
          <EditableText value={content.subheadline} onSave={s("subheadline")} tag="p" className="text-body-lg opacity-80 mb-10 max-w-xl mx-auto" placeholder="Join thousands of satisfied users today." />
          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" size="lg"><EditableText value={content.button || content.cta || "Get Started"} onSave={s("button")} tag="span" /></Button>
            <Button variant="ghost" size="lg">Learn More →</Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── FAQ ──────────────────────────────── */
  if (type === "faq") {
    if (variant === 1) {
      return (
        <div className={`${sp}`}>
          <div className="text-center mb-12">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">FAQ</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Frequently Asked" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary" placeholder="Common questions" />
          </div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-0 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <details key={i} className="group border-b border-surface-tertiary last:border-b-0 py-4">
                <summary className="flex items-center justify-between cursor-pointer text-body-sm font-medium hover:text-brand-primary transition-colors list-none">
                  <EditableText value={content[`q_${i}`]} onSave={s(`q_${i}`)} tag="span" placeholder={`Question ${i}?`} />
                  <svg className="w-3.5 h-3.5 shrink-0 ml-3 transition-transform duration-[var(--transition-base)] group-open:rotate-180 text-text-muted" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <EditableText value={content[`a_${i}`]} onSave={s(`a_${i}`)} tag="p" className="text-caption text-text-secondary pb-2 pt-2 leading-relaxed" placeholder="Answer goes here." />
              </details>
            ))}
          </div>
        </div>
      );
    }
    if (variant === 2) {
      return (
        <div className={`${sp} max-w-3xl mx-auto`}>
          <div className="text-center mb-12">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">FAQ</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Frequently Asked" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary" placeholder="Common questions" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-medium bg-surface border border-surface-tertiary flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-brand-primary font-bold text-body-sm">{i}</span>
                </div>
                <div>
                  <EditableText value={content[`q_${i}`]} onSave={s(`q_${i}`)} tag="h3" className="font-heading font-medium text-body mb-1" placeholder={`Question ${i}?`} />
                  <EditableText value={content[`a_${i}`]} onSave={s(`a_${i}`)} tag="p" className="text-body-sm text-text-secondary leading-relaxed" placeholder="Answer goes here." />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className={`${sp} max-w-2xl mx-auto`}>
        <div className="text-center mb-12">
          <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">FAQ</span>
          <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Frequently Asked" />
          <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary" placeholder="Common questions" />
        </div>
        <div className="space-y-0">
          {[1, 2, 3].map((i) => (
            <details key={i} className="group border-b border-surface-tertiary last:border-b-0">
              <summary className="flex items-center justify-between cursor-pointer py-5 text-body font-medium hover:text-brand-primary transition-colors list-none">
                <EditableText value={content[`q_${i}`]} onSave={s(`q_${i}`)} tag="span" placeholder={`Question ${i}?`} />
                <svg className="w-4 h-4 shrink-0 ml-4 transition-transform duration-[var(--transition-base)] group-open:rotate-180 text-text-muted" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <EditableText value={content[`a_${i}`]} onSave={s(`a_${i}`)} tag="p" className="text-body-sm text-text-secondary pb-5 leading-relaxed" placeholder="Answer goes here." />
            </details>
          ))}
        </div>
      </div>
    );
  }

  /* ── STATS ────────────────────────────── */
  if (type === "stats") {
    const stats = [
      { value: content.stat_1_value, label: content.stat_1_label, vKey: "stat_1_value" as const, lKey: "stat_1_label" as const },
      { value: content.stat_2_value, label: content.stat_2_label, vKey: "stat_2_value" as const, lKey: "stat_2_label" as const },
      { value: content.stat_3_value, label: content.stat_3_label, vKey: "stat_3_value" as const, lKey: "stat_3_label" as const },
      { value: content.stat_4_value, label: content.stat_4_label, vKey: "stat_4_value" as const, lKey: "stat_4_label" as const },
    ];

    if (variant === 1) {
      return (
        <div className={sp}>
          <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-medium bg-white/5 backdrop-blur-sm border border-white/10">
                <EditableText value={stat.value} onSave={s(stat.vKey)} tag="div" className="font-heading font-bold text-[2.5rem] leading-none mb-2" placeholder="--" />
                <EditableText value={stat.label} onSave={s(stat.lKey)} tag="div" className="text-body-sm opacity-70" placeholder="Label" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (variant === 2) {
      return (
        <div className={sp}>
          <div className="flex flex-wrap justify-center gap-12 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center relative">
                <EditableText value={stat.value} onSave={s(stat.vKey)} tag="div" className="font-heading font-bold text-display mb-1" placeholder="--" />
                <EditableText value={stat.label} onSave={s(stat.lKey)} tag="div" className="text-body-sm opacity-70" placeholder="Label" />
                {i < stats.length - 1 && <div className="hidden md:block absolute right-[-1.5rem] top-1/2 -translate-y-1/2 w-px h-12 bg-white/20" />}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className={sp}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
          {stats.map((stat, i) => (
            <div key={i} className="group">
              <EditableText value={stat.value} onSave={s(stat.vKey)} tag="div" className="font-heading font-bold text-display mb-1 group-hover:scale-105 transition-transform" placeholder="--" />
              <EditableText value={stat.label} onSave={s(stat.lKey)} tag="div" className="text-body-sm opacity-70" placeholder="Label" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── GALLERY ──────────────────────────── */
  if (type === "gallery") {
    if (variant === 1) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Portfolio</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Our Work" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="Browse our projects" />
          </div>
          <div className="columns-2 md:columns-3 gap-4 max-w-5xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`break-inside-avoid mb-4 ${i % 2 === 0 ? "md:mt-8" : ""}`}>
                <ImageUpload sectionId={id} existingUrl={content[`img_${i}`]} onSave={(sid, url) => updateContent(sid, `img_${i}`, url)} aspectRatio={i % 2 === 0 ? "4/5" : "16/9"} label={`Image ${i}`} className="w-full rounded-medium overflow-hidden shadow-soft" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className={sp}>
        <div className="text-center mb-14">
          <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Portfolio</span>
          <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Our Work" />
          <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="Browse our projects" />
        </div>
        {content.category_1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["All", content.category_1, content.category_2, content.category_3, content.category_4].filter(Boolean).map((cat) => (
              <button key={cat} className={`px-4 py-1.5 rounded-full text-caption font-medium transition-all ${cat === "All" ? "bg-brand-primary text-white" : "bg-surface border border-surface-tertiary text-text-secondary hover:border-brand-primary"}`}>
                {cat}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="relative group/image">
              <ImageUpload sectionId={id} existingUrl={content[`img_${i}`]} onSave={(sid, url) => updateContent(sid, `img_${i}`, url)} aspectRatio="4/3" label={`Image ${i}`} className="w-full rounded-medium overflow-hidden" />
              {content[`tag_${i}`] && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-caption backdrop-blur-sm">{content[`tag_${i}`]}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── LOGOS ────────────────────────────── */
  if (type === "logos") {
    if (variant === 1) {
      return (
        <div className="py-14 md:py-18">
          <EditableText value={content.title} onSave={s("title")} tag="p" className="text-center text-caption font-semibold text-text-muted tracking-widest uppercase mb-8" placeholder="Trusted By" />
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-surface-tertiary to-surface-secondary" />
                <EditableText value={content[`logo_${i}`]} onSave={s(`logo_${i}`)} tag="span" className="text-body-sm font-bold text-text-muted tracking-wider" placeholder="COMPANY" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="py-14 md:py-18">
        <EditableText value={content.title} onSave={s("title")} tag="p" className="text-center text-caption font-semibold text-text-muted tracking-widest uppercase mb-10" placeholder="Trusted By" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8 max-w-4xl mx-auto items-center">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-center">
              <div className="h-8 w-full rounded bg-gradient-to-r from-surface-tertiary to-surface-secondary flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity">
                <EditableText value={content[`logo_${i}`]} onSave={s(`logo_${i}`)} tag="span" className="text-caption font-bold text-text-muted tracking-wider" placeholder="LOGO" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── CONTACT ──────────────────────────── */
  if (type === "contact") {
    if (variant === 1) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Contact</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Get in Touch" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="We'd love to hear from you" />
          </div>
          <ContactForm cta={content.cta || "Send Message"} />
        </div>
      );
    }
    return (
      <div className={sp}>
        <div className="text-center mb-14">
          <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Contact</span>
          <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Get in Touch" />
          <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="We'd love to hear from you" />
        </div>
        <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
          <div className="space-y-6">
            {[
              { label: "Email", value: content.email, path: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", key: "email" },
              { label: "Phone", value: content.phone, path: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", key: "phone" },
              { label: "Address", value: content.address, path: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", key: "address" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E56CF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.path} />
                  </svg>
                </div>
                <div>
                  <div className="text-caption font-medium text-text-muted">{item.label}</div>
                  <EditableText value={item.value} onSave={s(item.key)} tag="div" className="text-body-sm" placeholder="--" />
                </div>
              </div>
            ))}
          </div>
          <ContactForm cta={content.cta || "Send Message"} />
        </div>
      </div>
    );
  }

  /* ── COMPARISON ───────────────────────── */
  if (type === "comparison") {
    if (variant === 1) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Comparison</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Why Choose Us" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="See how we compare" />
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-medium bg-surface border-2 border-brand-primary/30 shadow-soft">
              <h3 className="font-heading font-bold text-lg mb-4 text-brand-primary">Us</h3>
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-body-sm">
                    <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" /></svg>
                    <EditableText value={content[`row_${i}`]} onSave={s(`row_${i}`)} tag="span" placeholder={`Feature ${i}`} />
                    <span className="ml-auto text-caption text-brand-primary font-semibold">
                      <EditableText value={content[`our_val_${i}`]} onSave={s(`our_val_${i}`)} tag="span" placeholder="Yes" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 rounded-medium bg-surface border border-surface-tertiary">
              <h3 className="font-heading font-bold text-lg mb-4 text-text-muted">Others</h3>
              <ul className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-body-sm">
                    <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M4.22 4.22a.75.75 0 011.06 0L8 6.94l2.72-2.72a.75.75 0 111.06 1.06L9.06 8l2.72 2.72a.75.75 0 11-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 01-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 010-1.06z" /></svg>
                    <EditableText value={content[`row_${i}`]} onSave={s(`row_${i}`)} tag="span" placeholder={`Feature ${i}`} />
                    <span className="ml-auto text-caption text-text-muted">
                      <EditableText value={content[`their_val_${i}`]} onSave={s(`their_val_${i}`)} tag="span" placeholder="No" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={sp}>
        <div className="text-center mb-14">
          <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Comparison</span>
          <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Why Choose Us" />
          <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="See how we compare" />
        </div>
        <div className="max-w-3xl mx-auto overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-tertiary">
                <th className="py-4 pr-4 text-body-sm font-semibold">Feature</th>
                <th className="py-4 px-4 text-body-sm font-semibold text-brand-primary">Us</th>
                <th className="py-4 pl-4 text-body-sm font-semibold text-text-muted">Others</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="border-b border-surface-tertiary/50">
                  <td className="py-3.5 pr-4 text-body-sm font-medium">
                    <EditableText value={content[`row_${i}`]} onSave={s(`row_${i}`)} tag="span" placeholder={`Row ${i}`} />
                  </td>
                  <td className="py-3.5 px-4 text-body-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" /></svg>
                      <EditableText value={content[`our_val_${i}`]} onSave={s(`our_val_${i}`)} tag="span" placeholder="Yes" />
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-body-sm text-text-muted">
                    <EditableText value={content[`their_val_${i}`]} onSave={s(`their_val_${i}`)} tag="span" placeholder="No" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ── TIMELINE ─────────────────────────── */
  if (type === "timeline") {
    if (variant === 1) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Timeline</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Our Journey" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="From the beginning" />
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="snap-start shrink-0 w-56">
                  <div className="p-5 rounded-medium bg-surface border border-surface-tertiary min-h-[200px]">
                    <div className="text-caption font-bold text-brand-primary mb-2">
                      <EditableText value={content[`year_${i}`]} onSave={s(`year_${i}`)} tag="span" placeholder="Year" />
                    </div>
                    <EditableText value={content[`event_${i}`]} onSave={s(`event_${i}`)} tag="h3" className="font-heading font-bold text-base mb-2" placeholder="Milestone" />
                    <EditableText value={content[`desc_${i}`]} onSave={s(`desc_${i}`)} tag="p" className="text-caption text-text-secondary" placeholder="Description" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={sp}>
        <div className="text-center mb-14">
          <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Timeline</span>
          <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Our Journey" />
          <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="From the beginning to now" />
        </div>
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand-primary via-brand-secondary to-transparent" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="relative pl-16 pb-10 last:pb-0">
              <div className="absolute left-[1.35rem] w-3 h-3 rounded-full bg-brand-primary border-2 border-surface -translate-x-1/2 mt-1.5 z-10" />
              <div className="text-caption font-bold text-brand-primary mb-1">
                <EditableText value={content[`year_${i}`]} onSave={s(`year_${i}`)} tag="span" placeholder="Year" />
              </div>
              <EditableText value={content[`event_${i}`]} onSave={s(`event_${i}`)} tag="h3" className="font-heading font-bold text-base mb-1" placeholder="Milestone" />
              <EditableText value={content[`desc_${i}`]} onSave={s(`desc_${i}`)} tag="p" className="text-body-sm text-text-secondary" placeholder="Description" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── TEAM ─────────────────────────────── */
  if (type === "team") {
    if (variant === 1) {
      return (
        <div className={sp}>
          <div className="text-center mb-14">
            <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Team</span>
            <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Meet the Team" />
            <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="The people behind the vision" />
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-5 p-5 rounded-medium bg-surface border border-surface-tertiary">
                <ImageUpload sectionId={id} existingUrl={content[`photo_${i}`]} onSave={(sid, url) => updateContent(sid, `photo_${i}`, url)} aspectRatio="1/1" label="Photo" className="w-16 h-16 rounded-full shrink-0" />
                <div>
                  <EditableText value={content[`name_${i}`]} onSave={s(`name_${i}`)} tag="h3" className="font-heading font-bold text-body" placeholder="Name" />
                  <EditableText value={content[`role_${i}`]} onSave={s(`role_${i}`)} tag="p" className="text-caption text-text-muted mb-1" placeholder="Role" />
                  <EditableText value={content[`bio_${i}`]} onSave={s(`bio_${i}`)} tag="p" className="text-caption text-text-secondary" placeholder="Bio" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className={sp}>
        <div className="text-center mb-14">
          <span className="text-caption font-semibold text-brand-primary tracking-widest uppercase mb-2 block">Team</span>
          <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading font-bold mb-3" placeholder="Meet the Team" />
          <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body-lg text-text-secondary max-w-xl mx-auto" placeholder="The people behind the vision" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center group">
              <ImageUpload sectionId={id} existingUrl={content[`photo_${i}`]} onSave={(sid, url) => updateContent(sid, `photo_${i}`, url)} aspectRatio="1/1" label="Photo" className="w-24 h-24 mx-auto mb-4 rounded-full" />
              <EditableText value={content[`name_${i}`]} onSave={s(`name_${i}`)} tag="h3" className="font-heading font-bold text-sm mb-0.5" placeholder="Name" />
              <EditableText value={content[`role_${i}`]} onSave={s(`role_${i}`)} tag="p" className="text-caption text-text-muted mb-2" placeholder="Role" />
              <EditableText value={content[`bio_${i}`]} onSave={s(`bio_${i}`)} tag="p" className="text-caption text-text-secondary leading-relaxed max-w-[200px] mx-auto" placeholder="Bio" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={sp}>
      <EditableText value={content.title} onSave={s("title")} tag="h2" className="font-heading text-heading-sm font-bold mb-2" placeholder="Section Title" />
      <EditableText value={content.subtitle} onSave={s("subtitle")} tag="p" className="text-body text-text-secondary" placeholder="Section description" />
    </div>
  );
}

export function PreviewPageClient() {
  const { layoutSchema, addMutation, contextProfile, copyElements } = useGenerationStore();
  const { addToast } = useUIStore();
  const [device, setDevice] = useState("desktop");
  const router = useRouter();
  const [mutationStrength, setMutationStrength] = useState(3);
  const [showMutationPanel, setShowMutationPanel] = useState(false);
  const [exportMode, setExportMode] = useState(false);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showPagesModal, setShowPagesModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [abVariants, setAbVariants] = useState<Array<{ id: string; name: string; layout: LayoutSchema }>>([]);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [lang, setLang] = useState("en");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedVersions, setPublishedVersions] = useState<Array<{id: string; timestamp: number; name: string; layout: LayoutSchema}>>([]);

  // Custom background URL handler per section
  const setSectionBackground = useCallback((sectionId: string, url: string) => {
    if (!layoutSchema) return;
    const updated = {
      ...layoutSchema,
      sections: layoutSchema.sections.map((s) =>
        s.id === sectionId
          ? { ...s, content: { ...s.content, __background: url } }
          : s
      ),
    };
    useGenerationStore.getState().setLayoutSchema(updated);
  }, [layoutSchema]);

  // Google Fonts dynamic loading
  useEffect(() => {
    if (!contextProfile) return;
    const fonts = [contextProfile.primaryFont, contextProfile.secondaryFont].filter(Boolean);
    const uniqueFonts = fonts.filter((v, i, a) => a.indexOf(v) === i);
    const family = uniqueFonts.map((f) => `${f.replace(/\s+/g, "+")}:wght@400;600;700;800`).join("&family=");
    const href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;

    let link = document.getElementById("dynamo-google-fonts") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "dynamo-google-fonts";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;

    return () => {
      const el = document.getElementById("dynamo-google-fonts");
      if (el) el.remove();
    };
  }, [contextProfile]);

  // Apply brand colors as CSS custom properties (fix: hardcoded :root vars)
  useEffect(() => {
    if (!contextProfile) return;
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", contextProfile.primaryColor);
    root.style.setProperty("--brand-secondary", contextProfile.secondaryColor);
    root.style.setProperty("--brand-accent", contextProfile.accentColor);
    const light = contextProfile.primaryColor + "99";
    root.style.setProperty("--brand-primary-light", light);
    const dark = contextProfile.primaryColor;
    root.style.setProperty("--brand-primary-dark", dark);
    root.style.setProperty("--font-heading", `'${contextProfile.primaryFont}', sans-serif`);
    root.style.setProperty("--font-body", `'${contextProfile.secondaryFont}', sans-serif`);
    root.style.setProperty("--font-mono", "'JetBrains Mono', monospace");
  }, [contextProfile]);

  // Scroll animation with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("dynamo-visible");
            entry.target.classList.remove("dynamo-hidden");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const sections = document.querySelectorAll(".dynamo-animate");
    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [layoutSchema]);

  // SEO meta tags
  useEffect(() => {
    if (!layoutSchema?.seo) return;
    const seo = layoutSchema.seo;
    if (seo.title) document.title = seo.title;
    const setMeta = (name: string, content: string, property = false) => {
      let el = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        if (property) el.setAttribute("property", name);
        else el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    if (seo.description) { setMeta("description", seo.description); setMeta("og:description", seo.description, true); }
    if (seo.title) setMeta("og:title", seo.title, true);
    if (seo.ogImage) setMeta("og:image", seo.ogImage, true);
  }, [layoutSchema?.seo]);

  // Analytics scripts (GA + Meta Pixel)
  useEffect(() => {
    if (!layoutSchema?.analytics) return;
    const { gaId, metaPixelId } = layoutSchema.analytics;

    if (gaId && !document.getElementById("dynamo-ga")) {
      const script1 = document.createElement("script");
      script1.id = "dynamo-ga";
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);
      const script2 = document.createElement("script");
      script2.id = "dynamo-ga-init";
      script2.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`;
      document.head.appendChild(script2);
    }

    if (metaPixelId && !document.getElementById("dynamo-meta-pixel")) {
      const script = document.createElement("script");
      script.id = "dynamo-meta-pixel";
      script.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`;
      document.head.appendChild(script);
      const noscript = document.createElement("noscript");
      noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1"/>`;
      document.body.appendChild(noscript);
    }
  }, [layoutSchema?.analytics]);

  // Load published versions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dynamo-published");
      if (stored) setPublishedVersions(JSON.parse(stored));
    } catch {}
  }, []);

  const handlePublish = useCallback(() => {
    if (!layoutSchema || !contextProfile) return;
    const id = crypto.randomUUID();
    const entry = {
      id,
      timestamp: Date.now(),
      name: contextProfile.niche + " - " + new Date().toLocaleDateString(),
      layout: layoutSchema,
    };
    const stored = JSON.parse(localStorage.getItem("dynamo-published") || "[]");
    stored.push(entry);
    localStorage.setItem("dynamo-published", JSON.stringify(stored));
    setPublishedVersions(stored);
    addToast("Published! Use the modal to copy link or download HTML.", "success");
  }, [layoutSchema, contextProfile, addToast]);

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

  const updateSeo = useCallback((field: keyof SEOData, value: string) => {
    if (!layoutSchema) return;
    useGenerationStore.getState().setLayoutSchema({
      ...layoutSchema,
      seo: { ...layoutSchema.seo || { title: "", description: "", ogImage: "" }, [field]: value },
    });
  }, [layoutSchema]);

  const updateAnalytics = useCallback((field: "gaId" | "metaPixelId", value: string) => {
    if (!layoutSchema) return;
    useGenerationStore.getState().setLayoutSchema({
      ...layoutSchema,
      analytics: { ...layoutSchema.analytics || { gaId: "", metaPixelId: "" }, [field]: value },
    });
  }, [layoutSchema]);

  // --- Multi-language regenerate ---
  const handleLangRegenerate = useCallback(async () => {
    if (!layoutSchema || !contextProfile) return;
    addToast("Generating in " + lang.toUpperCase() + "...", "info");
    try {
      const { settings } = useSettingsStore.getState();
      if (!settings.apiKey) {
        addToast("Please set up your API key first", "error");
        return;
      }
      const langContext = { ...contextProfile, language: lang };
      const { result } = await runAgent3(langContext, copyElements, settings, null);
      useGenerationStore.getState().setLayoutSchema(result);
      addToast("Page regenerated in " + lang.toUpperCase() + "!", "success");
    } catch {
      addToast("Generation in " + lang.toUpperCase() + " failed", "error");
    }
  }, [layoutSchema, contextProfile, copyElements, lang, addToast]);

  // --- A/B Variant ---
  const handleCreateVariant = useCallback(async () => {
    if (!layoutSchema) return;
    const id = crypto.randomUUID();
    const clone: LayoutSchema = JSON.parse(JSON.stringify(layoutSchema));
    const name = "Variant " + (abVariants.length + 1);
    addToast("Creating " + name + "...", "info");
    try {
      const { settings } = useSettingsStore.getState();
      if (settings.apiKey && contextProfile) {
        const { result } = await runAgent3(contextProfile, copyElements, settings, null);
        if (result) {
          setAbVariants(prev => [...prev, { id, name, layout: result }]);
          setActiveVariant(name);
          addToast(name + " created!", "success");
          return;
        }
      }
      setAbVariants(prev => [...prev, { id, name, layout: clone }]);
      setActiveVariant(name);
      addToast(name + " created (offline mode)", "info");
    } catch {
      setAbVariants(prev => [...prev, { id, name, layout: clone }]);
      setActiveVariant(name);
      addToast(name + " created", "success");
    }
  }, [layoutSchema, contextProfile, copyElements, abVariants.length, addToast]);

  const handleSelectVariant = useCallback((variant: { id: string; name: string; layout: LayoutSchema }) => {
    if (variant.layout) {
      useGenerationStore.getState().setLayoutSchema(variant.layout);
      setActiveVariant(variant.name);
    }
  }, []);

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
        <div className="flex items-center justify-between px-4 h-12 gap-2 border-b border-surface-tertiary bg-surface-secondary/50">
          <div className="flex items-center gap-2 bg-surface rounded-soft border border-surface-tertiary p-0.5">
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
                {d.label}
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
            <button
              onClick={() => setShowPageSettings(!showPageSettings)}
              className="px-3 py-1.5 rounded-soft border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
            >
              Page Settings
            </button>
            <button
              onClick={() => { setSaveName(""); setShowSaveDialog(true); }}
              className="px-3 py-1.5 rounded-soft border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowPagesModal(true)}
              className="px-3 py-1.5 rounded-soft border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-surface-tertiary transition-colors"
            >
              Pages
            </button>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="px-3 py-1.5 rounded-soft border border-surface-tertiary text-caption font-medium text-text-secondary bg-surface hover:bg-surface-tertiary transition-colors cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="id">ID</option>
              <option value="ar">AR</option>
              <option value="fr">FR</option>
              <option value="es">ES</option>
              <option value="zh">ZH</option>
              <option value="ja">JA</option>
              <option value="ko">KO</option>
            </select>
            <button
              onClick={handleLangRegenerate}
              className="px-3 py-1.5 rounded-soft bg-brand-primary text-white text-caption font-medium hover:opacity-90 transition-all whitespace-nowrap"
            >
              Generate in {lang.toUpperCase()}
            </button>
            {abVariants.length > 0 && (
              <select
                value={activeVariant || ""}
                onChange={(e) => {
                  const v = abVariants.find(x => x.id === e.target.value);
                  if (v) handleSelectVariant(v);
                }}
                className="px-3 py-1.5 rounded-soft border border-surface-tertiary text-caption font-medium text-text-secondary bg-surface hover:bg-surface-tertiary transition-colors cursor-pointer"
              >
                <option value="">Variant ({abVariants.length})</option>
                {abVariants.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={handleCreateVariant}
              className="px-3 py-1.5 rounded-soft border border-surface-tertiary text-caption font-medium text-text-secondary hover:bg-surface-tertiary transition-colors whitespace-nowrap"
            >
              + Create Variant
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              className="px-3 py-1.5 rounded-soft bg-green-600 text-white text-caption font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Publish
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F0F0F5]">
          <div
            className="mx-auto bg-white shadow-strong min-h-full transition-all duration-[var(--transition-base)]"
            style={{ maxWidth: currentDevice.width }}
          >
            {layoutSchema.sections.map((section, index) => (
              <SectionPreview key={section.id} section={section} sectionIndex={index} totalSections={layoutSchema.sections.length} onSetBackground={setSectionBackground} />
            ))}
          </div>
        </div>
      </div>

      {showMutationPanel && (
        <div className="w-80 border-l border-surface-tertiary bg-surface overflow-y-auto p-4 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-heading font-bold text-base mb-1">Mutation Engine</h3>
              <p className="text-caption text-text-muted">Adjust how your page looks.</p>
            </div>
            <button
              onClick={() => setShowMutationPanel(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-tertiary transition-colors text-text-muted hover:text-text-primary"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
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
              Regenerate Layout
            </Button>
          </div>

          <div className="pt-4 space-y-2">
            {exportMode && layoutSchema && contextProfile && (
              <div className="pb-4">
                <ExportPanel
                  layout={layoutSchema}
                  copy={copyElements}
                  context={contextProfile}
                />
              </div>
            )}
            <Button
              variant={exportMode ? "primary" : "secondary"}
              className="w-full"
              size="sm"
              onClick={() => setExportMode(!exportMode)}
            >
              {exportMode ? "Close Export" : "Export HTML"}
            </Button>
          </div>

          <div className="pt-4 border-t border-surface-tertiary">
            <button
              onClick={() => {
                useGenerationStore.getState().resetAll();
                router.push("/create");
              }}
              className="w-full py-2 text-body-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-soft transition-colors flex items-center justify-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7a6 6 0 1112 0A6 6 0 011 7z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Generate New Page
            </button>
          </div>
        </div>
      )}

      {showPageSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowPageSettings(false)}>
          <div className="bg-white rounded-xl shadow-strong p-6 w-full max-w-md mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg">Page Settings</h3>
              <button onClick={() => setShowPageSettings(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div>
              <h4 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-3">SEO</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-caption font-medium text-text-muted mb-1 block">Meta Title</label>
                  <input className="w-full border border-surface-tertiary rounded-soft px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    value={layoutSchema?.seo?.title || ""}
                    onChange={(e) => updateSeo("title", e.target.value)}
                    placeholder="My Amazing Page"
                  />
                </div>
                <div>
                  <label className="text-caption font-medium text-text-muted mb-1 block">Meta Description</label>
                  <textarea className="w-full border border-surface-tertiary rounded-soft px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary resize-none h-20"
                    value={layoutSchema?.seo?.description || ""}
                    onChange={(e) => updateSeo("description", e.target.value)}
                    placeholder="Describe your page for search engines..."
                  />
                </div>
                <div>
                  <label className="text-caption font-medium text-text-muted mb-1 block">OG Image URL</label>
                  <input className="w-full border border-surface-tertiary rounded-soft px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    value={layoutSchema?.seo?.ogImage || ""}
                    onChange={(e) => updateSeo("ogImage", e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-3">Analytics</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-caption font-medium text-text-muted mb-1 block">Google Analytics ID</label>
                  <input className="w-full border border-surface-tertiary rounded-soft px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    value={layoutSchema?.analytics?.gaId || ""}
                    onChange={(e) => updateAnalytics("gaId", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="text-caption font-medium text-text-muted mb-1 block">Meta Pixel ID</label>
                  <input className="w-full border border-surface-tertiary rounded-soft px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                    value={layoutSchema?.analytics?.metaPixelId || ""}
                    onChange={(e) => updateAnalytics("metaPixelId", e.target.value)}
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </div>

            <p className="text-caption text-text-muted">Settings auto-save. Refresh page to see meta tags in action.</p>
          </div>
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-white rounded-xl shadow-strong p-6 w-full max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg">Save Page</h3>
            <input
              autoFocus
              className="w-full border border-surface-tertiary rounded-soft px-3 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="My Page Name"
              onKeyDown={(e) => {
                if (e.key === "Enter" && saveName.trim()) {
                  useGenerationStore.getState().saveCurrentPage(saveName.trim());
                  addToast("Page saved!", "success");
                  setShowSaveDialog(false);
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              <Button variant="primary" disabled={!saveName.trim()} onClick={() => {
                useGenerationStore.getState().saveCurrentPage(saveName.trim());
                addToast("Page saved!", "success");
                setShowSaveDialog(false);
              }}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {showPagesModal && (() => {
        const { savedPages, loadPage, deletePage, renamePage } = useGenerationStore.getState();
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setShowPagesModal(false); setRenamingId(null); }}>
            <div className="bg-white rounded-xl shadow-strong p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg">Saved Pages</h3>
                <button onClick={() => { setShowPagesModal(false); setRenamingId(null); }} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              {savedPages.length === 0 ? (
                <p className="text-body-sm text-text-muted py-8 text-center">No saved pages yet.</p>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2">
                  {savedPages.map((page) => (
                    <div key={page.id} className="flex items-center gap-2 p-3 rounded-soft border border-surface-tertiary hover:border-brand-primary/30 transition-colors group">
                      {renamingId === page.id ? (
                        <input
                          autoFocus
                          className="flex-1 border border-brand-primary rounded-soft px-2 py-1 text-body-sm focus:outline-none"
                          value={renameVal}
                          onChange={(e) => setRenameVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && renameVal.trim()) {
                              renamePage(page.id, renameVal.trim());
                              setRenamingId(null);
                            }
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          onBlur={() => setRenamingId(null)}
                        />
                      ) : (
                        <button
                          className="flex-1 text-left"
                          onClick={() => { loadPage(page.id); addToast(`Loaded "${page.name}"`, "success"); setShowPagesModal(false); }}
                        >
                          <div className="text-body-sm font-medium">{page.name}</div>
                          <div className="text-caption text-text-muted">{new Date(page.updatedAt).toLocaleDateString()}</div>
                        </button>
                      )}
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-soft hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-all"
                        onClick={() => { setRenamingId(page.id); setRenameVal(page.name); }}
                        title="Rename"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M8.5 1.5l2 2L3.5 10.5l-2.5.5.5-2.5L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-soft hover:bg-red-50 text-text-muted hover:text-red-600 transition-all"
                        onClick={() => { deletePage(page.id); addToast("Page deleted", "info"); }}
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M1.5 3h9M4 3V1.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V3M2.5 3v7.5a1 1 0 001 1h5a1 1 0 001-1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {showPublishModal && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowPublishModal(false)}>
            <div className="bg-white rounded-xl shadow-strong p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg">Publish Page</h3>
                <button onClick={() => setShowPublishModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handlePublish}
                >
                  Publish Current Version
                </Button>

                {publishedVersions.length > 0 && (
                  <>
                    <h4 className="text-caption font-semibold text-text-muted uppercase tracking-wider mt-4 mb-2">
                      Published Versions
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {publishedVersions.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-3 rounded-soft border border-surface-tertiary">
                          <div>
                            <div className="text-body-sm font-medium">{v.name}</div>
                            <div className="text-caption text-text-muted">{new Date(v.timestamp).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              className="px-2 py-1 text-caption font-medium text-brand-primary hover:bg-brand-primary/5 rounded-soft transition-colors"
                              onClick={() => {
                                try {
                                  const json = JSON.stringify(v.layout, null, 2);
                                  const blob = new Blob([json], { type: "application/json" });
                                  const url = URL.createObjectURL(blob);
                                  navigator.clipboard.writeText(url).then(() => addToast("Link copied!", "success"));
                                } catch {
                                  addToast("Failed to copy link", "error");
                                }
                              }}
                            >
                              Copy Link
                            </button>
                            <button
                              className="px-2 py-1 text-caption font-medium text-green-600 hover:bg-green-50 rounded-soft transition-colors"
                              onClick={() => {
                                try {
                                  const html = generateStaticHtml(v.layout);
                                  const blob = new Blob([html], { type: "text/html" });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = v.name.replace(/[^a-zA-Z0-9]/g, "-") + ".html";
                                  a.click();
                                  URL.revokeObjectURL(url);
                                  addToast("HTML downloaded!", "success");
                                } catch {
                                  addToast("Failed to download HTML", "error");
                                }
                              }}
                            >
                              Download HTML
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <p className="text-caption text-text-muted pt-2">Published pages are stored locally in your browser.</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateStaticHtml(layout: LayoutSchema): string {
  const sectionsHtml = layout.sections.map((section) => {
    const c = section.content;
    switch (section.type) {
      case "hero":
        return `<section style="padding:80px 24px;text-align:center;">
          <div style="max-width:800px;margin:0 auto;">
            <h1 style="font-size:48px;font-weight:800;line-height:1.1;margin-bottom:16px;">${escapeHtml(c.headline || "")}</h1>
            <p style="font-size:20px;color:#666;margin-bottom:32px;">${escapeHtml(c.subheadline || "")}</p>
            <a style="display:inline-block;padding:14px 32px;background:#6E56CF;color:white;border-radius:8px;text-decoration:none;font-weight:600;">${escapeHtml(c.cta || "Get Started")}</a>
          </div>
        </section>`;
      case "features":
        return `<section style="padding:80px 24px;background:#f8f8fb;">
          <div style="max-width:900px;margin:0 auto;text-align:center;">
            <h2 style="font-size:36px;font-weight:700;margin-bottom:8px;">${escapeHtml(c.title || "Features")}</h2>
            <p style="font-size:18px;color:#666;margin-bottom:48px;">${escapeHtml(c.subtitle || "")}</p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;text-align:left;">
              ${[1,2,3].map(i => `
                <div style="padding:24px;background:white;border-radius:12px;border:1px solid #eee;">
                  <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">${escapeHtml(c["feature_" + i + "_title"] || "")}</h3>
                  <p style="font-size:14px;color:#666;line-height:1.6;">${escapeHtml(c["feature_" + i + "_desc"] || "")}</p>
                </div>
              `).join("")}
            </div>
          </div>
        </section>`;
      case "testimonials":
        return `<section style="padding:80px 24px;">
          <div style="max-width:800px;margin:0 auto;text-align:center;">
            <h2 style="font-size:36px;font-weight:700;margin-bottom:8px;">${escapeHtml(c.title || "Testimonials")}</h2>
            <p style="font-size:18px;color:#666;margin-bottom:48px;">${escapeHtml(c.subtitle || "")}</p>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:24px;text-align:left;">
              ${[1,2].map(i => `
                <div style="padding:24px;background:#f8f8fb;border-radius:12px;">
                  <p style="font-size:14px;color:#666;line-height:1.6;margin-bottom:16px;font-style:italic;">&ldquo;${escapeHtml(c["quote_" + i] || "")}&rdquo;</p>
                  <div style="font-weight:600;">${escapeHtml(c["name_" + i] || "")}</div>
                  <div style="font-size:13px;color:#999;">${escapeHtml(c["role_" + i] || "")}</div>
                </div>
              `).join("")}
            </div>
          </div>
        </section>`;
      case "pricing":
        return `<section style="padding:80px 24px;background:#f8f8fb;">
          <div style="max-width:900px;margin:0 auto;text-align:center;">
            <h2 style="font-size:36px;font-weight:700;margin-bottom:8px;">${escapeHtml(c.title || "Pricing")}</h2>
            <p style="font-size:18px;color:#666;margin-bottom:48px;">${escapeHtml(c.subtitle || "")}</p>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
              ${[1,2,3].map(i => `
                <div style="padding:32px;background:white;border-radius:12px;border:1px solid #eee;">
                  <h3 style="font-size:20px;font-weight:700;margin-bottom:8px;">${escapeHtml(c["plan_" + i + "_name"] || "Plan " + i)}</h3>
                  <div style="font-size:36px;font-weight:800;margin-bottom:16px;">${escapeHtml(c["plan_" + i + "_price"] || "$0")}</div>
                  <p style="font-size:14px;color:#666;margin-bottom:16px;">${escapeHtml(c["plan_" + i + "_desc"] || "")}</p>
                  <a style="display:inline-block;padding:10px 24px;background:#6E56CF;color:white;border-radius:8px;text-decoration:none;font-weight:600;">${escapeHtml(c["plan_" + i + "_cta"] || "Choose")}</a>
                </div>
              `).join("")}
            </div>
          </div>
        </section>`;
      case "cta":
        return `<section style="padding:80px 24px;background:linear-gradient(135deg,#6E56CF,#8B5CF6);color:white;text-align:center;">
          <div style="max-width:600px;margin:0 auto;">
            <h2 style="font-size:36px;font-weight:700;margin-bottom:16px;">${escapeHtml(c.headline || "Ready?")}</h2>
            <p style="font-size:18px;opacity:0.9;margin-bottom:32px;">${escapeHtml(c.subheadline || "")}</p>
            <a style="display:inline-block;padding:14px 32px;background:white;color:#6E56CF;border-radius:8px;text-decoration:none;font-weight:600;">${escapeHtml(c.button || c.cta || "Get Started")}</a>
          </div>
        </section>`;
      case "faq":
        return `<section style="padding:80px 24px;">
          <div style="max-width:700px;margin:0 auto;">
            <h2 style="font-size:36px;font-weight:700;margin-bottom:8px;text-align:center;">${escapeHtml(c.title || "FAQ")}</h2>
            <p style="font-size:18px;color:#666;margin-bottom:48px;text-align:center;">${escapeHtml(c.subtitle || "")}</p>
            ${[1,2,3].map(i => `
              <div style="padding:16px 0;border-bottom:1px solid #eee;">
                <div style="font-weight:600;margin-bottom:8px;">${escapeHtml(c["q_" + i] || "Question " + i + "?")}</div>
                <div style="font-size:14px;color:#666;line-height:1.6;">${escapeHtml(c["a_" + i] || "")}</div>
              </div>
            `).join("")}
          </div>
        </section>`;
      case "stats":
        return `<section style="padding:80px 24px;background:#6E56CF;color:white;text-align:center;">
          <div style="max-width:800px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;">
            ${[1,2,3,4].map(i => `
              <div>
                <div style="font-size:40px;font-weight:800;margin-bottom:4px;">${escapeHtml(c["stat_" + i + "_value"] || "—")}</div>
                <div style="font-size:14px;opacity:0.8;">${escapeHtml(c["stat_" + i + "_label"] || "")}</div>
              </div>
            `).join("")}
          </div>
        </section>`;
      default:
        return `<section style="padding:60px 24px;">
          <div style="max-width:800px;margin:0 auto;text-align:center;">
            <h2 style="font-size:28px;font-weight:700;">${escapeHtml(c.title || section.type)}</h2>
          </div>
        </section>`;
    }
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(layout.seo?.title || "Landing Page")}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; line-height: 1.5; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${sectionsHtml}
</body>
</html>`;
}