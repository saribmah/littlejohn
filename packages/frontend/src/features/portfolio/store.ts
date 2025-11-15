import { create } from 'zustand';
import type { PortfolioPerformance, Position } from './types';
import { portfolioService } from './service';

interface PortfolioState {
  performance: PortfolioPerformance | null;
  lastUpdated: string | null;
  positions: Position[];
  isLoading: boolean;
  isLoadingPositions: boolean;
  error: string | null;
}

interface PortfolioActions {
  fetchPerformance: () => Promise<void>;
  fetchPositions: () => Promise<void>;
  clearError: () => void;
}

type PortfolioStore = PortfolioState & PortfolioActions;

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  // State
  performance: null,
  lastUpdated: null,
  positions: [],
  isLoading: false,
  isLoadingPositions: false,
  error: null,

  // Actions
  fetchPerformance: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await portfolioService.getPerformance();
      set({
        performance: data.performance,
        lastUpdated: data.lastUpdated,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio performance',
        isLoading: false,
      });
    }
  },

  fetchPositions: async () => {
    set({ isLoadingPositions: true, error: null });
    try {
      const data = await portfolioService.getPositions();
      set({
        positions: data.positions,
        isLoadingPositions: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch portfolio positions',
        isLoadingPositions: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
