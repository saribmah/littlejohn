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

  /**
   * Get 2FA code for a user
   * @param userId - User ID
   * @param use - If true, marks the 2FA code as used (enabled=false)
   */
  async get2FACode(userId: string, use: boolean = false): Promise<{ code: string | null; enabled: boolean }> {
    const url = new URL(`${this.baseUrl}/api/two-factor/user/${userId}`);
    if (use) {
      url.searchParams.set('use', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch 2FA code: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.twoFactor) {
      return { code: null, enabled: false };
    }

    return {
      code: data.twoFactor.code,
      enabled: data.twoFactor.enabled
    };
  }

  /**
   * Create a new trade
   */
  async createTrade(userId: string, trade: {
    symbol: string;
    amount: number;
    action: 'BUY' | 'SELL';
    status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
    price?: number;
    total?: number;
    note?: string;
  }) {
    const response = await fetch(`${this.baseUrl}/api/trades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        'X-User-Id': userId,
      },
      body: JSON.stringify(trade),
    });

    if (!response.ok) {
      throw new Error(`Failed to create trade: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get all trades for a user
   */
  async getTrades(userId: string) {
    const response = await fetch(`${this.baseUrl}/api/trades`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trades: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export a default instance
export const backendClient = new BackendClient();
