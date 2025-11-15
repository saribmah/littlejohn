import { create } from 'zustand';
import type { Goal, RiskLevel, Period } from './service';

export interface OnboardingData {
  linkRobinhood?: {
    email: string;
    code: string;
  };
  goal?: Goal;
  riskLevel?: RiskLevel;
  period?: Period;
  exclusions?: string[];
}

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  isLoading: boolean;
  error: string | null;
}

interface OnboardingActions {
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

const TOTAL_STEPS = 5;

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  // State
  currentStep: 0,
  data: {},
  isLoading: false,
  error: null,

  // Actions
  setCurrentStep: (step: number) => {
    if (step >= 0 && step < TOTAL_STEPS) {
      set({ currentStep: step, error: null });
    }
  },

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS - 1),
      error: null,
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
      error: null,
    })),

  updateData: (newData: Partial<OnboardingData>) =>
    set((state) => ({
      data: { ...state.data, ...newData },
    })),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      currentStep: 0,
      data: {},
      isLoading: false,
      error: null,
    }),
}));

export const STEP_TITLES = [
  'Link Robinhood Account',
  'Investment Goal',
  'Risk Tolerance',
  'Investment Period',
  'Exclusions',
];
