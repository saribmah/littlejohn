import { env } from '../../config/env';
import type { PortfolioPerformanceResponse, PositionsResponse } from './types';

export const portfolioService = {
  async getPerformance(): Promise<PortfolioPerformanceResponse> {
    const response = await fetch(`${env.API_URL}/api/portfolio/performance`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch portfolio performance');
    }

    return response.json();
  },

  async getPositions(): Promise<PositionsResponse> {
    const response = await fetch(`${env.API_URL}/api/portfolio/positions`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch portfolio positions');
    }

    return response.json();
  },
};
