import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Project,
  Generation,
  ContextProfile,
  LayoutSchema,
  CopyElement,
  UserSettings,
} from "@/types";
import type { ReviewReport } from "@/lib/agents/agent5-reviewer";
import type { HeadlineScore } from "@/lib/utils/page-analytics";

interface ProjectStore {
  currentProject: Project | null;
  generations: Generation[];
  isLoading: boolean;
  error: string | null;
  setProject: (project: Project) => void;
  addGeneration: (gen: Generation) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  currentProject: null,
  generations: [],
  isLoading: false,
  error: null,
  setProject: (project) => set({ currentProject: project }),
  addGeneration: (gen) =>
    set((state) => ({ generations: [gen, ...state.generations] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));

interface GenerationStore {
  prompt: string;
  contextProfile: ContextProfile | null;
  copyElements: CopyElement[];
  layoutSchema: LayoutSchema | null;
  mutationHistory: LayoutSchema[];
  isGenerating: boolean;
  agentProgress: { agent1: boolean; agent2: boolean; agent3: boolean; agent4: boolean; agent5: boolean };
  reviewReport: ReviewReport | null;
  vibeOverride: string | null;
  layoutDensity: string | null;
  promptHistory: Array<{ prompt: string; timestamp: number; niche: string }>;
  headlineVariants: HeadlineScore[];
  showHeadlineTester: boolean;
  setPrompt: (prompt: string) => void;
  setContextProfile: (profile: ContextProfile) => void;
  setCopyElements: (elements: CopyElement[]) => void;
  setLayoutSchema: (schema: LayoutSchema) => void;
  addMutation: (schema: LayoutSchema) => void;
  setIsGenerating: (val: boolean) => void;
  setAgentProgress: (agent: "agent1" | "agent2" | "agent3" | "agent4" | "agent5", done: boolean) => void;
  setReviewReport: (report: ReviewReport | null) => void;
  setVibeOverride: (vibe: string | null) => void;
  setLayoutDensity: (density: string | null) => void;
  addPromptHistory: (prompt: string, niche: string) => void;
  setHeadlineVariants: (variants: HeadlineScore[]) => void;
  setShowHeadlineTester: (show: boolean) => void;
  updateSectionContent: (sectionId: string, field: string, value: string) => void;
  regenerateSection: (sectionId: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  resetAll: () => void;
}

const initialGenState = {
  prompt: "",
  contextProfile: null,
  copyElements: [],
  layoutSchema: null,
  mutationHistory: [],
  isGenerating: false,
  agentProgress: { agent1: false, agent2: false, agent3: false, agent4: false, agent5: false },
  reviewReport: null,
  vibeOverride: null,
  layoutDensity: null,
  promptHistory: [],
  headlineVariants: [],
  showHeadlineTester: false,
};

export const useGenerationStore = create<GenerationStore>()(
  persist(
    (set) => ({
  ...initialGenState,
  setPrompt: (prompt) => set({ prompt }),
  setContextProfile: (profile) =>
    set({ contextProfile: profile, agentProgress: { agent1: true, agent2: false, agent3: false, agent4: false, agent5: false } }),
  setCopyElements: (elements) =>
    set({ copyElements: elements, agentProgress: { agent1: true, agent2: true, agent3: false, agent4: false, agent5: false } }),
  setLayoutSchema: (schema) =>
    set({ layoutSchema: schema, agentProgress: { agent1: true, agent2: true, agent3: true, agent4: true, agent5: false } }),
  addMutation: (schema) =>
    set((state) => ({ mutationHistory: [...state.mutationHistory, schema] })),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setAgentProgress: (agent, done) =>
    set((state) => ({
      agentProgress: { ...state.agentProgress, [agent]: done },
    })),
  setReviewReport: (report) =>
    set((state) => ({
      reviewReport: report,
      agentProgress: { ...state.agentProgress, agent5: true },
    })),
  setVibeOverride: (vibe) => set({ vibeOverride: vibe }),
  setLayoutDensity: (density) => set({ layoutDensity: density }),
  addPromptHistory: (prompt, niche) =>
    set((state) => ({
      promptHistory: [
        { prompt, timestamp: Date.now(), niche },
        ...state.promptHistory.filter((h) => h.prompt !== prompt),
      ].slice(0, 20),
    })),
  setHeadlineVariants: (variants) => set({ headlineVariants: variants }),
  setShowHeadlineTester: (show) => set({ showHeadlineTester: show }),
  updateSectionContent: (sectionId, field, value) =>
    set((state) => {
      if (!state.layoutSchema) return {};
      const sections = state.layoutSchema.sections.map((s) =>
        s.id === sectionId ? { ...s, content: { ...s.content, [field]: value } } : s
      );
      return { layoutSchema: { ...state.layoutSchema, sections } };
    }),
  regenerateSection: (sectionId: string) =>
    set((state) => {
      if (!state.layoutSchema) return {};
      void sectionId; // acknowledged
      return { isGenerating: true };
    }),
  reorderSections: (fromIndex, toIndex) =>
    set((state) => {
      if (!state.layoutSchema) return {};
      const sections = [...state.layoutSchema.sections];
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      const reordered = sections.map((s, i) => ({ ...s, order: i }));
      return { layoutSchema: { ...state.layoutSchema, sections: reordered } };
    }),
  resetAll: () => set(initialGenState),
}),
{
  name: "dynamo-generation",
  partialize: (state) => ({
    prompt: state.prompt,
    contextProfile: state.contextProfile,
    copyElements: state.copyElements,
    layoutSchema: state.layoutSchema,
    mutationHistory: state.mutationHistory,
    vibeOverride: state.vibeOverride,
    layoutDensity: state.layoutDensity,
    promptHistory: state.promptHistory,
    headlineVariants: state.headlineVariants,
  }),
}
));

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: {
        llmProvider: "anthropic",
        apiKey: "",
        defaultModel: "claude-3-5-sonnet-20240620",
        theme: "light",
        historySize: 10,
      },
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: "dynamo-settings",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);

interface UIStore {
  sidebarOpen: boolean;
  mutationPanelOpen: boolean;
  vibeSelector: string | null;
  showOnboarding: boolean;
  onboardingComplete: boolean;
  devicePreview: "desktop" | "tablet" | "phone";
  toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" | "warning" }>;
  toggleSidebar: () => void;
  toggleMutationPanel: () => void;
  setVibe: (vibe: string | null) => void;
  setShowOnboarding: (val: boolean) => void;
  completeOnboarding: () => void;
  setDevicePreview: (device: "desktop" | "tablet" | "phone") => void;
  addToast: (message: string, type: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  mutationPanelOpen: false,
  vibeSelector: null,
  showOnboarding: false,
  onboardingComplete: false,
  devicePreview: "desktop",
  toasts: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMutationPanel: () =>
    set((state) => ({ mutationPanelOpen: !state.mutationPanelOpen })),
  setVibe: (vibe) => set({ vibeSelector: vibe }),
  setShowOnboarding: (val) => set({ showOnboarding: val }),
  completeOnboarding: () => set({ showOnboarding: false, onboardingComplete: true }),
  setDevicePreview: (device) => set({ devicePreview: device }),
  addToast: (message, type) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: crypto.randomUUID(), message, type },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
