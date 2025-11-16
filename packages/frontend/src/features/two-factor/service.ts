import { env } from '../../config/env';
import type { TwoFactorResponse } from './types';

export class TwoFactorService {
  private baseUrl = env.API_URL;

  /**
   * Get user's 2FA code
   */
  async get2FA(): Promise<TwoFactorResponse> {
    const response = await fetch(`${this.baseUrl}/api/two-factor`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch 2FA code');
    }

    return response.json();
  }

  /**
   * Save or update 2FA code
   */
  async save2FA(code: string): Promise<TwoFactorResponse> {
    const response = await fetch(`${this.baseUrl}/api/two-factor`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to save 2FA code');
    }

    return response.json();
  }

  /**
   * Delete 2FA code
   */
  async delete2FA(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/two-factor`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete 2FA code');
    }
  }
}

export const twoFactorService = new TwoFactorService();
