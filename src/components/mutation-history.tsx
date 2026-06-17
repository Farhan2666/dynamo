"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LayoutSchema, SectionType } from "@/types";
import { useGenerationStore } from "@/lib/store";

const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  features: "Features",
  testimonials: "Testimonials",
  pricing: "Pricing",
  cta: "CTA",
  faq: "FAQ",
  stats: "Stats",
  gallery: "Gallery",
  logos: "Logos",
  contact: "Contact",
  comparison: "Comparison",
  timeline: "Timeline",
  team: "Team",
};

const SECTION_COLORS: Record<SectionType, string> = {
  hero: "bg-purple-500",
  features: "bg-teal-500",
  testimonials: "bg-amber-500",
  pricing: "bg-emerald-500",
  cta: "bg-orange-500",
  faq: "bg-blue-500",
  stats: "bg-rose-500",
  gallery: "bg-pink-500",
  logos: "bg-indigo-400",
  contact: "bg-cyan-500",
  comparison: "bg-red-500",
  timeline: "bg-violet-500",
  team: "bg-lime-500",
};

interface MutationHistoryProps {
  history: LayoutSchema[];
  onSelect: (schema: LayoutSchema) => void;
}

export function MutationHistory({ history, onSelect }: MutationHistoryProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (history.length === 0) {
    return (
      <div className="p-6 text-center text-body-sm text-text-muted">
        <p>No mutations yet. Generate a page to start tracking layout DNA.</p>
      </div>
    );
  }

  const handleReset = () => {
    useGenerationStore.getState().resetAll();
  };

  const reversed = [...history].reverse();

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-surface-tertiary" />

      <AnimatePresence mode="popLayout">
        {reversed.map((schema, ri) => {
          const actualIdx = history.length - 1 - ri;
          const isCurrent = actualIdx === history.length - 1;
          const isExpanded = expanded === actualIdx;

          return (
            <motion.div
              key={actualIdx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: ri * 0.05 }}
              className="relative pl-10 pb-4"
            >
              <div
                className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 ${
                  isCurrent
                    ? "bg-brand-primary border-brand-primary shadow-glow"
                    : "bg-surface border-surface-tertiary"
                }`}
              />

              <div
                className={`p-3 rounded-soft border cursor-pointer transition-all ${
                  isCurrent
                    ? "bg-brand-primary/5 border-brand-primary/30"
                    : "bg-surface-secondary border-surface-tertiary hover:border-brand-primary/20"
                }`}
                onClick={() => {
                  setExpanded(isExpanded ? null : actualIdx);
                  onSelect(schema);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption font-mono text-text-muted">
                    v{actualIdx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium text-text-muted px-1.5 py-0.5 rounded bg-surface-tertiary">
                      {schema.layout}
                    </span>
                    <span className="text-[10px] font-medium text-text-muted">
                      {schema.sections.length} sections
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {schema.sections.map((s) => (
                    <span
                      key={s.id}
                      className={`inline-block w-2 h-2 rounded-full ${SECTION_COLORS[s.type] || "bg-gray-400"}`}
                      title={SECTION_LABELS[s.type] || s.type}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-surface-tertiary">
                        <div className="grid grid-cols-2 gap-1.5">
                          {schema.sections.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center gap-1.5 text-[10px]"
                            >
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${SECTION_COLORS[s.type] || "bg-gray-400"}`}
                              />
                              <span className="text-text-secondary truncate">
                                {SECTION_LABELS[s.type] || s.type}
                              </span>
                              <span className="text-text-muted ml-auto">
                                {s.spacing}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-[10px] text-text-muted">
                          <span>WCAG: {schema.wcagScore ?? "N/A"}%</span>
                          <span>Anim: {schema.animations.type}</span>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(schema);
                          }}
                          className="mt-2 w-full py-1 text-[10px] font-medium text-brand-primary bg-brand-primary/5 rounded-soft hover:bg-brand-primary/10 transition-colors"
                        >
                          Apply This Version
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="mt-4 pt-3 border-t border-surface-tertiary">
        <button
          onClick={handleReset}
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
  );
}
