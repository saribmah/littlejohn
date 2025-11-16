/**
 * Trade Service
 * API client for trade operations
 */

import { env } from '../../config/env';
import type {
  TradesResponse,
  TradeResponse,
  CreateTradeRequest,
  UpdateTradeRequest,
  TradeStatus,
} from './types';

export const tradeService = {
  /**
   * Get all trades for the authenticated user
   */
  async getTrades(): Promise<TradesResponse> {
    const response = await fetch(`${env.API_URL}/api/trades`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trades');
    }

    return response.json();
  },

  /**
   * Get a specific trade by ID
   */
  async getTrade(id: string): Promise<TradeResponse> {
    const response = await fetch(`${env.API_URL}/api/trades/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trade');
    }

    return response.json();
  },

  /**
   * Create a new trade
   */
  async createTrade(data: CreateTradeRequest): Promise<TradeResponse> {
    const response = await fetch(`${env.API_URL}/api/trades`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create trade');
    }

    return response.json();
  },

  /**
   * Update an existing trade
   */
  async updateTrade(id: string, data: UpdateTradeRequest): Promise<TradeResponse> {
    const response = await fetch(`${env.API_URL}/api/trades/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update trade');
    }

    return response.json();
  },

  /**
   * Delete a trade
   */
  async deleteTrade(id: string): Promise<void> {
    const response = await fetch(`${env.API_URL}/api/trades/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete trade');
    }
  },

  /**
   * Get trades by status
   */
  async getTradesByStatus(status: TradeStatus): Promise<TradesResponse> {
    const response = await fetch(`${env.API_URL}/api/trades/status/${status}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trades by status');
    }

    return response.json();
  },
};
