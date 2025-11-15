export interface OnboardingProfile {
  id: string;
  userId: string;
  completed: boolean;
  robinhoodEmail?: string | null;
  robinhoodLinked: boolean;
  goal?: string | null;
  riskLevel?: string | null;
  period?: number | null;
  exclusions?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkRobinhoodInput {
  email: string;
  code: string;
}

export interface SetGoalInput {
  goal: 'fast' | 'steady' | 'experiment' | 'risk' | 'balanced';
}

export interface SetRiskInput {
  riskLevel: 'low' | 'medium' | 'high';
}

export interface SetPeriodInput {
  months: 6 | 24 | 48;
}

export interface SetExclusionsInput {
  exclusions: string[];
}
