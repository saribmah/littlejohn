/**
 * Trade Store
 * Zustand store for managing trades state
 */

import { create } from 'zustand';
import type { Trade, CreateTradeRequest, UpdateTradeRequest } from './types';
import { tradeService } from './service';

interface TradeState {
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
}

interface TradeActions {
  fetchTrades: () => Promise<void>;
  createTrade: (data: CreateTradeRequest) => Promise<Trade>;
  updateTrade: (id: string, data: UpdateTradeRequest) => Promise<Trade>;
  deleteTrade: (id: string) => Promise<void>;
  clearError: () => void;
}

type TradeStore = TradeState & TradeActions;

export const useTradeStore = create<TradeStore>((set, get) => ({
  // State
  trades: [],
  isLoading: false,
  error: null,

  // Actions
  fetchTrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await tradeService.getTrades();
      set({
        trades: data.trades,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch trades',
        isLoading: false,
      });
    }
  },

  createTrade: async (data: CreateTradeRequest) => {
    set({ error: null });
    try {
      const result = await tradeService.createTrade(data);

      // Add the new trade to the beginning of the list
      set((state) => ({
        trades: [result.trade, ...state.trades],
      }));

      return result.trade;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create trade';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateTrade: async (id: string, data: UpdateTradeRequest) => {
    set({ error: null });
    try {
      const result = await tradeService.updateTrade(id, data);

      // Update the trade in the list
      set((state) => ({
        trades: state.trades.map((trade) =>
          trade.id === id ? result.trade : trade
        ),
      }));

      return result.trade;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update trade';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteTrade: async (id: string) => {
    set({ error: null });
    try {
      await tradeService.deleteTrade(id);

      // Remove the trade from the list
      set((state) => ({
        trades: state.trades.filter((trade) => trade.id !== id),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete trade';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
