"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerationStore, useSettingsStore, useUIStore } from "@/lib/store";
import { Button, Card, Badge, ColorPicker, MutationHistory, ExportPanel, Onboarding, PageTransition, AnimatedSection } from "@/components/ui";
import { runAgent1, runAgent2, runAgent3, runAgent5 } from "@/lib/agents/orchestrator";
import { getScoreColor, getScoreLabel } from "@/lib/agents/agent5-reviewer";
import { mergeCopyIntoSections } from "@/lib/utils/copy-to-sections";
import { scoreHeadline, generateHeadlineVariants, countAllSectionWords, estimateReadingTime } from "@/lib/utils/page-analytics";
import { ConfettiCelebration, ShareButtons } from "@/components/page-enhancements";
import type { LayoutSchema } from "@/types";

const EXAMPLES = [
  { label: "Fitness App", prompt: "Startup fintech for Gen Z — neomorphic UI, slang copy" },
  { label: "Vegan Bakery", prompt: "Online pottery classes for seniors — warm, accessible design" },
  { label: "SaaS MVP", prompt: "Premium coaching service for executives — minimalist, high-trust" },
  { label: "Portfolio", prompt: "B2B SaaS for remote team management — professional, data-driven" },
];

export function CreatePageClient() {
  const router = useRouter();
  const {
    prompt,
    setPrompt,
    isGenerating,
    setIsGenerating,
    setContextProfile,
    setCopyElements,
    setLayoutSchema,
    contextProfile,
    copyElements,
    layoutSchema,
    mutationHistory,
    agentProgress,
    addMutation,
    setAgentProgress,
    setReviewReport,
    reviewReport,
    setVibeOverride,
    setLayoutDensity,
    vibeOverride,
    layoutDensity,
    addPromptHistory,
    promptHistory,
    headlineVariants,
    setHeadlineVariants,
    showHeadlineTester,
    setShowHeadlineTester,
  } = useGenerationStore();
  const { settings } = useSettingsStore();
  const { addToast, showOnboarding, setShowOnboarding, toggleMutationPanel, mutationPanelOpen } = useUIStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "mutations" | "export">("colors");
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  }, [prompt]);

  // Keyboard shortcuts
  const generateRef = useRef<() => void>(() => {});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "g" || e.key === "G") { e.preventDefault(); generateRef.current(); }
        if (e.key === "e" || e.key === "E") { e.preventDefault(); setActiveTab("export"); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!settings.apiKey) {
      addToast("Please set up your API key first", "error");
      router.push("/setup");
      return;
    }

    setIsGenerating(true);

    try {
      setAgentProgress("agent1", false);
      setAgentProgress("agent2", false);
      setAgentProgress("agent3", false);
      setAgentProgress("agent4", false);
      setAgentProgress("agent5", false);
      setReviewReport(null);

      const context = await runAgent1(prompt, settings);
      setContextProfile(context);
      setAgentProgress("agent1", true);

      const copy = await runAgent2(context, settings);
      setCopyElements(copy);
      setAgentProgress("agent2", true);

      setAgentProgress("agent4", true);
      const rawLayout = await runAgent3(context, copy, settings, vibeOverride);
      const mergedSections = mergeCopyIntoSections(rawLayout.sections, copy, context);
      const layout = { ...rawLayout, sections: mergedSections };
      setLayoutSchema(layout);
      addMutation(layout);
      setAgentProgress("agent3", true);

      // Agent 5: Self-Review
      const report = runAgent5(layout, copy, context);
      setReviewReport(report);
      setAgentProgress("agent5", true);

      // Save prompt history
      addPromptHistory(prompt, context.niche);

      // Score headline variants
      const hero = layout.sections.find((s) => s.type === "hero");
      if (hero?.content?.headline) {
        const variants = generateHeadlineVariants(hero.content.headline);
        const scored = variants.map((v) => scoreHeadline(v));
        setHeadlineVariants(scored);
      }

      // Confetti!
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);

      addToast(`Page generated! Quality score: ${report.overallScore}/100`, "success");
    } catch {
      addToast("Generation failed. Try a simpler prompt.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  generateRef.current = handleGenerate;

  const handleColorChange = (colors: { primary: string; secondary: string; accent: string }) => {
    if (contextProfile) {
      setContextProfile({
        ...contextProfile,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
      });
    }
  };

  const handleSelectMutation = (schema: LayoutSchema) => {
    setLayoutSchema(schema);
    addToast("Layout version applied", "success");
  };

  return (
    <PageTransition>
      <ConfettiCelebration active={showConfetti} />
      {showOnboarding && !useUIStore.getState().onboardingComplete && (
        <Onboarding onComplete={() => useUIStore.getState().completeOnboarding()} />
      )}

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-heading-sm font-bold">Create Page</h1>
          <p className="text-body text-text-secondary mt-1">
            Describe your brand and audience — three AI agents do the rest.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card variant="default" padding="lg" data-onboarding="prompt">
              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium text-text-secondary mb-2">
                    Describe Your Business
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Online pottery classes for seniors — warm, accessible, community-focused"
                    className="w-full px-3.5 py-3 text-body bg-surface border border-surface-tertiary rounded-soft resize-none min-h-[100px] transition-all duration-[var(--transition-fast)] placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                    maxLength={300}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-caption text-text-muted">
                      {prompt.length}/300 characters
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-caption text-text-muted hover:text-brand-primary transition-colors"
                      >
                        History ({promptHistory.length})
                      </button>
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-caption text-brand-primary hover:underline"
                      >
                        {showAdvanced ? "Hide" : "Show"} Advanced
                      </button>
                    </div>
                  </div>
                </div>

                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-2 gap-4 p-4 rounded-soft bg-surface-secondary border border-surface-tertiary"
                  >
                    <div>
                      <label className="block text-caption font-medium text-text-muted mb-1.5">
                        Vibe Override
                      </label>
                      <select
                        value={vibeOverride || ""}
                        onChange={(e) => setVibeOverride(e.target.value || null)}
                        className="w-full px-3 py-2 text-body-sm bg-surface border border-surface-tertiary rounded-soft focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                      >
                        <option value="">Auto-detect</option>
                        <option value="professional">Professional</option>
                        <option value="playful">Playful</option>
                        <option value="trust">Trust & Authority</option>
                        <option value="calm">Calm & Serene</option>
                        <option value="growth">Growth & Energy</option>
                        <option value="confident">Confident & Bold</option>
                        <option value="warm">Warm & Inviting</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-caption font-medium text-text-muted mb-1.5">
                        Layout Density
                      </label>
                      <select
                        value={layoutDensity || "auto"}
                        onChange={(e) => setLayoutDensity(e.target.value || null)}
                        className="w-full px-3 py-2 text-body-sm bg-surface border border-surface-tertiary rounded-soft focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                      >
                        <option value="auto">Auto</option>
                        <option value="compact">Compact</option>
                        <option value="comfortable">Comfortable</option>
                        <option value="spacious">Spacious</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {showHistory && promptHistory.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-3 rounded-soft bg-surface-secondary border border-surface-tertiary max-h-40 overflow-y-auto space-y-1"
                  >
                    <div className="text-caption font-medium text-text-muted mb-2">Prompt History</div>
                    {promptHistory.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => { setPrompt(h.prompt); setShowHistory(false); }}
                        className="w-full text-left px-2 py-1.5 rounded-soft text-caption text-text-secondary hover:bg-surface-tertiary transition-colors flex items-center justify-between gap-2"
                      >
                        <span className="truncate flex-1">{h.prompt}</span>
                        <Badge variant="primary">{h.niche}</Badge>
                      </button>
                    ))}
                  </motion.div>
                )}

                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.label}
                      onClick={() => setPrompt(ex.prompt)}
                      className="px-3 py-1.5 rounded-soft bg-surface-secondary border border-surface-tertiary text-caption font-medium text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  loading={isGenerating}
                  disabled={!prompt.trim() || !settings.apiKey}
                  onClick={handleGenerate}
                  data-onboarding="generate"
                >
                  {isGenerating ? "Agents at work..." : "Generate Page"}
                </Button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary font-mono">Ctrl+G</kbd> Generate
                  <span className="mx-1">·</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-tertiary font-mono">Ctrl+E</kbd> Export
                </div>
              </div>
            </Card>

            <AnimatePresence>
              {(isGenerating || contextProfile) && (
                <AnimatedSection>
                  <Card variant="default" padding="lg">
                    <h3 className="font-heading font-bold text-base mb-4">
                      Agent Progress
                    </h3>
                    <div className="space-y-3">
                      {[
                        { id: "agent1" as const, label: "Context Analyzer", desc: contextProfile ? "Niche detected, palette built" : "Analyzing market..." },
                        { id: "agent2" as const, label: "Copywriter", desc: "Crafting headlines, CTAs..." },
                        { id: "agent4" as const, label: "Research Analyst", desc: "Gathering industry data & trends..." },
                        { id: "agent3" as const, label: "UI Engineer", desc: "Assembling layout..." },
                        { id: "agent5" as const, label: "Quality Reviewer", desc: reviewReport ? `Score: ${reviewReport.overallScore}/100` : "Scoring quality..." },
                      ].map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center gap-3 p-3 rounded-soft bg-surface-secondary border border-surface-tertiary"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              agentProgress[agent.id]
                                ? "bg-emerald-100 text-emerald-600"
                                : isGenerating
                                ? "bg-amber-100 text-amber-600 animate-pulse-soft"
                                : "bg-surface-tertiary text-text-muted"
                            }`}
                          >
                            {agentProgress[agent.id] ? (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M11.667 3.5L5.25 9.917 2.333 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                                <path d="M7 1.5A5.5 5.5 0 0112.5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-body-sm font-medium">{agent.label}</div>
                            <div className="text-caption text-text-muted truncate">
                              {agentProgress[agent.id] ? "Complete" : agent.desc}
                            </div>
                          </div>
                          {agentProgress[agent.id] && (
                            <Badge variant="success">Done</Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {contextProfile && (
                      <div className="mt-4 p-4 rounded-soft bg-surface-secondary border border-surface-tertiary">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-body-sm font-semibold">Context Profile</h4>
                          <Badge variant="primary">{contextProfile.niche}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          {contextProfile.industryTags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-brand-primary/10 text-caption text-brand-primary border border-brand-primary/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-caption text-text-muted">Primary:</span>
                            <span
                              className="w-5 h-5 rounded border border-black/10"
                              style={{ backgroundColor: contextProfile.primaryColor }}
                            />
                            <span className="text-caption font-mono">{contextProfile.primaryColor}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-caption text-text-muted">Secondary:</span>
                            <span
                              className="w-5 h-5 rounded border border-black/10"
                              style={{ backgroundColor: contextProfile.secondaryColor }}
                            />
                            <span className="text-caption font-mono">{contextProfile.secondaryColor}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {reviewReport && !isGenerating && (
                      <div className="mt-4 p-4 rounded-soft bg-surface-secondary border border-surface-tertiary">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-body-sm font-semibold">Quality Report</h4>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm"
                              style={{ backgroundColor: getScoreColor(reviewReport.overallScore) + "20", color: getScoreColor(reviewReport.overallScore) }}
                            >
                              {reviewReport.overallScore}
                            </div>
                            <Badge variant="primary">{getScoreLabel(reviewReport.overallScore)}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {[
                            { label: "Conversion", value: reviewReport.conversionScore },
                            { label: "Language", value: reviewReport.languageScore },
                            { label: "Complete", value: reviewReport.completenessScore },
                            { label: "A11y", value: reviewReport.accessibilityScore },
                          ].map((m) => (
                            <div key={m.label} className="text-center p-2 rounded-soft bg-surface">
                              <div className="text-caption text-text-muted">{m.label}</div>
                              <div className="font-heading font-bold text-base" style={{ color: getScoreColor(m.value) }}>{m.value}</div>
                            </div>
                          ))}
                        </div>
                        {reviewReport.conversionMetrics.filter((m) => m.tips.length > 0).slice(0, 2).map((m) => (
                          <div key={m.category} className="text-caption text-text-muted mb-1">
                            <span className="font-medium">{m.category}:</span> {m.tips[0]}
                          </div>
                        ))}

                        {/* Word Count & Reading Time */}
                        {layoutSchema && (
                          <div className="mt-3 pt-3 border-t border-surface-tertiary flex items-center gap-4 text-caption text-text-muted">
                            <span>{countAllSectionWords(layoutSchema.sections)} words</span>
                            <span>·</span>
                            <span>~{estimateReadingTime(Object.values(layoutSchema.sections).map((s) => Object.values(s.content).join(" ")).join(" "))} min read</span>
                            <span>·</span>
                            <span>{layoutSchema.sections.length} sections</span>
                          </div>
                        )}

                        {/* Headline A/B Tester */}
                        {headlineVariants.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-surface-tertiary">
                            <button
                              onClick={() => setShowHeadlineTester(!showHeadlineTester)}
                              className="text-caption font-medium text-brand-primary hover:underline mb-2"
                            >
                              {showHeadlineTester ? "Hide" : "Show"} Headline A/B Test ({headlineVariants.length} variants)
                            </button>
                            {showHeadlineTester && (
                              <div className="space-y-2">
                                {headlineVariants.sort((a, b) => b.score - a.score).map((v, i) => (
                                  <div key={i} className={`p-2 rounded-soft border ${i === 0 ? "border-green-300 bg-green-50" : "border-surface-tertiary bg-surface"}`}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] font-medium text-text-muted">{i === 0 ? "Best" : `Variant ${i + 1}`}</span>
                                      <span className="text-[10px] font-bold" style={{ color: getScoreColor(v.score) }}>{v.score}/100</span>
                                    </div>
                                    <p className="text-body-sm font-medium text-text-primary">{v.text}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {v.reasons.map((r, ri) => (
                                        <span key={ri} className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-tertiary text-text-muted">{r}</span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Share buttons */}
                        <div className="mt-3 pt-3 border-t border-surface-tertiary">
                          <div className="text-caption text-text-muted mb-2">Share this page:</div>
                          <ShareButtons title={`Landing page for ${contextProfile?.niche || "business"}`} />
                        </div>
                      </div>
                    )}

                    {!isGenerating && contextProfile && (
                      <div className="mt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => useGenerationStore.getState().resetAll()}>
                          Start Over
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => router.push("/preview/demo")}
                        >
                          View Preview
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </Button>
                      </div>
                    )}
                  </Card>
                </AnimatedSection>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            {contextProfile && !isGenerating && (
              <>
                <Card variant="default" padding="md" data-onboarding="colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex rounded-soft bg-surface-secondary p-0.5 border border-surface-tertiary flex-1">
                      {(["colors", "mutations", "export"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 px-2 py-1 text-[10px] font-medium rounded-soft transition-all ${
                            activeTab === tab
                              ? "bg-white text-text-primary shadow-soft"
                              : "text-text-muted hover:text-text-secondary"
                          }`}
                        >
                          {tab === "colors" ? "Colors" : tab === "mutations" ? "DNA" : "Export"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === "colors" && contextProfile && (
                      <motion.div
                        key="colors"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                      >
                        <ColorPicker
                          colors={{
                            primary: contextProfile.primaryColor,
                            secondary: contextProfile.secondaryColor,
                            accent: "#FF7E33",
                          }}
                          onChange={handleColorChange}
                        />
                      </motion.div>
                    )}

                    {activeTab === "mutations" && (
                      <motion.div
                        key="mutations"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        data-onboarding="mutations"
                      >
                        <MutationHistory
                          history={mutationHistory}
                          onSelect={handleSelectMutation}
                        />
                      </motion.div>
                    )}

                    {activeTab === "export" && layoutSchema && contextProfile && (
                      <motion.div
                        key="export"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        data-onboarding="export"
                      >
                        <ExportPanel
                          layout={layoutSchema}
                          copy={copyElements}
                          context={contextProfile}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                <Card variant="default" padding="md">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="text-caption text-brand-primary hover:underline flex items-center gap-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M6 5.5v3M6 3.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      Show Onboarding
                    </button>
                    <button
                      onClick={toggleMutationPanel}
                      className="text-caption text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M6 2v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                      {mutationPanelOpen ? "Close" : "History"}
                    </button>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
