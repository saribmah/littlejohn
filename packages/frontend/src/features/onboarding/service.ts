const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type Goal = 'fast' | 'steady' | 'experiment' | 'risk' | 'balanced';
export type RiskLevel = 'low' | 'medium' | 'high';
export type Period = '6' | '24' | '48';

export interface LinkRobinhoodData {
  email: string;
  code: string;
}

export interface GoalData {
  goal: Goal;
}

export interface RiskData {
  riskLevel: RiskLevel;
}

export interface PeriodData {
  months: Period;
}

export interface ExclusionsData {
  exclusions: string[];
}

/**
 * Check if user needs to complete onboarding
 */
export async function checkShouldOnboard(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/onboarding/status`, {
      credentials: 'include',
    });

    if (!response.ok) return false;

    const data = await response.json();
    return !data.completed;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Complete Step 1: Link Robinhood account
 */
export async function completeLinkRobinhood(data: LinkRobinhoodData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/onboarding/link-robinhood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to link Robinhood account' }));
    throw new Error(error.error || 'Failed to link Robinhood account');
  }
}

/**
 * Complete Step 2: Set investment goal
 */
export async function completeGoal(data: GoalData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/onboarding/goal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to set investment goal' }));
    throw new Error(error.error || 'Failed to set investment goal');
  }
}

/**
 * Complete Step 3: Set risk tolerance
 */
export async function completeRisk(data: RiskData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/onboarding/risk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to set risk tolerance' }));
    throw new Error(error.error || 'Failed to set risk tolerance');
  }
}

/**
 * Complete Step 4: Set investment period
 */
export async function completePeriod(data: PeriodData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/onboarding/period`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ months: parseInt(data.months) }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to set investment period' }));
    throw new Error(error.error || 'Failed to set investment period');
  }
}

/**
 * Complete Step 5: Set exclusions (final step)
 */
export async function completeExclusions(data: ExclusionsData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/onboarding/exclusions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to set exclusions' }));
    throw new Error(error.error || 'Failed to set exclusions');
  }
}
