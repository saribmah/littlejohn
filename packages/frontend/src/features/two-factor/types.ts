export type TwoFactorAuth = {
  id: string;
  code: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TwoFactorResponse = {
  twoFactor: TwoFactorAuth | null;
};
