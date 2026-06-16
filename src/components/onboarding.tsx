"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  target: string;
  title: string;
  description: string;
  position: "bottom" | "top" | "left" | "right";
}

const STEPS: Step[] = [
  {
    target: "[data-onboarding='prompt']",
    title: "Describe Your Business",
    description: "Tell Dynamo about your brand, audience, and goals. The more specific, the better the result.",
    position: "bottom",
  },
  {
    target: "[data-onboarding='generate']",
    title: "Generate with AI",
    description: "Three AI agents work in sequence: Context Analyzer researches your market, Copywriter crafts your message, UI Engineer designs the layout.",
    position: "top",
  },
  {
    target: "[data-onboarding='colors']",
    title: "Refine Colors",
    description: "Adjust your color palette with real-time contrast checking. Lock colors you like and click Harmonize for AI suggestions.",
    position: "bottom",
  },
  {
    target: "[data-onboarding='mutations']",
    title: "Explore Layout DNA",
    description: "Every generation creates a mutation history. Browse past versions, compare layouts, and pick your favorite.",
    position: "left",
  },
  {
    target: "[data-onboarding='export']",
    title: "Export Your Page",
    description: "Export as HTML, CSS, or Tailwind JSX. Copy to clipboard and paste into your project.",
    position: "top",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const step = STEPS[currentStep];
    const el = document.querySelector(step.target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setVisible(false);
    onComplete();
  };

  const step = STEPS[currentStep];

  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return {};
    const gap = 12;
    switch (step.position) {
      case "bottom":
        return {
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.bottom + gap,
          transform: "translateX(-50%)",
        };
      case "top":
        return {
          left: targetRect.left + targetRect.width / 2,
          top: targetRect.top - gap,
          transform: "translateX(-50%) translateY(-100%)",
        };
      case "left":
        return {
          left: targetRect.left - gap,
          top: targetRect.top + targetRect.height / 2,
          transform: "translateX(-100%) translateY(-50%)",
        };
      case "right":
        return {
          left: targetRect.right + gap,
          top: targetRect.top + targetRect.height / 2,
          transform: "translateY(-50%)",
        };
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40"
            onClick={handleSkip}
          />

          {targetRect && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  position: "fixed",
                  left: targetRect.left - 4,
                  top: targetRect.top - 4,
                  width: targetRect.width + 8,
                  height: targetRect.height + 8,
                }}
                className="border-2 border-brand-primary rounded-medium pointer-events-none z-[101] shadow-glow"
              />

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  position: "fixed",
                  ...getTooltipStyle(),
                  zIndex: 102,
                }}
                className="w-72 bg-white rounded-medium shadow-strong border border-surface-tertiary p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-text-muted">
                    {currentStep + 1} / {STEPS.length}
                  </span>
                  <button
                    onClick={handleSkip}
                    className="text-caption text-text-muted hover:text-text-primary transition-colors"
                  >
                    Skip
                  </button>
                </div>
                <h4 className="font-heading font-bold text-body-sm mb-1">
                  {step.title}
                </h4>
                <p className="text-caption text-text-secondary leading-relaxed mb-4">
                  {step.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          i === currentStep ? "bg-brand-primary" : "bg-surface-tertiary"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={handleNext}
                    className="px-3 py-1.5 rounded-soft bg-brand-primary text-white text-caption font-medium hover:bg-[var(--brand-primary-dark)] transition-colors"
                  >
                    {currentStep < STEPS.length - 1 ? "Next" : "Done"}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
