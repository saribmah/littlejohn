/**
 * Backend API client for sandbox
 * Handles communication with the main backend server
 */

import { config } from '../config';

export type Position = {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayReturn: number;
  dayReturnPercent: number;
};

export type PortfolioPerformance = {
  currentValue: number;
  dayChangeValue: number;
  dayChangePercentage: number;
  weekChangeValue: number;
  weekChangePercentage: number;
  monthChangeValue: number;
  monthChangePercentage: number;
  threeMonthChangeValue: number;
  threeMonthChangePercentage: number;
  yearChangeValue: number;
  yearChangePercentage: number;
};

export class BackendClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.baseUrl = config.backendUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get portfolio performance for a user
   */
  async getPortfolioPerformance(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/portfolio/performance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio performance: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get positions for a user
   */
  async getPositions(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/portfolio/positions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch positions: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Update portfolio performance for a user
   */
  async updatePortfolio(userId: string, data: PortfolioPerformance) {
    const response = await fetch(`${this.baseUrl}/api/portfolio/sandbox/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        'X-User-Id': userId,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update portfolio: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create or update positions for a user
   */
  async updatePositions(userId: string, positions: Position[]) {
    const response = await fetch(`${this.baseUrl}/api/portfolio/sandbox/positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        'X-User-Id': userId,
      },
      body: JSON.stringify({ positions }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update positions: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export a default instance
export const backendClient = new BackendClient();
