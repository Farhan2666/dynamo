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
  agentProgress: { agent1: boolean; agent2: boolean; agent3: boolean };
  setPrompt: (prompt: string) => void;
  setContextProfile: (profile: ContextProfile) => void;
  setCopyElements: (elements: CopyElement[]) => void;
  setLayoutSchema: (schema: LayoutSchema) => void;
  addMutation: (schema: LayoutSchema) => void;
  setIsGenerating: (val: boolean) => void;
  setAgentProgress: (agent: "agent1" | "agent2" | "agent3", done: boolean) => void;
  resetAll: () => void;
}

const initialGenState = {
  prompt: "",
  contextProfile: null,
  copyElements: [],
  layoutSchema: null,
  mutationHistory: [],
  isGenerating: false,
  agentProgress: { agent1: false, agent2: false, agent3: false },
};

export const useGenerationStore = create<GenerationStore>((set) => ({
  ...initialGenState,
  setPrompt: (prompt) => set({ prompt }),
  setContextProfile: (profile) =>
    set({ contextProfile: profile, agentProgress: { agent1: true, agent2: false, agent3: false } }),
  setCopyElements: (elements) =>
    set({ copyElements: elements, agentProgress: { agent1: true, agent2: true, agent3: false } }),
  setLayoutSchema: (schema) =>
    set({ layoutSchema: schema, agentProgress: { agent1: true, agent2: true, agent3: true } }),
  addMutation: (schema) =>
    set((state) => ({ mutationHistory: [...state.mutationHistory, schema] })),
  setIsGenerating: (val) => set({ isGenerating: val }),
  setAgentProgress: (agent, done) =>
    set((state) => ({
      agentProgress: { ...state.agentProgress, [agent]: done },
    })),
  resetAll: () => set(initialGenState),
}));

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
  toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;
  toggleSidebar: () => void;
  toggleMutationPanel: () => void;
  setVibe: (vibe: string | null) => void;
  setShowOnboarding: (val: boolean) => void;
  completeOnboarding: () => void;
  addToast: (message: string, type: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  mutationPanelOpen: false,
  vibeSelector: null,
  showOnboarding: false,
  onboardingComplete: false,
  toasts: [],
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMutationPanel: () =>
    set((state) => ({ mutationPanelOpen: !state.mutationPanelOpen })),
  setVibe: (vibe) => set({ vibeSelector: vibe }),
  setShowOnboarding: (val) => set({ showOnboarding: val }),
  completeOnboarding: () => set({ showOnboarding: false, onboardingComplete: true }),
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
