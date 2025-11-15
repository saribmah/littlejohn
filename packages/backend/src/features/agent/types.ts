export type AgentMode = 'manager' | 'co-pilot';

export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export interface AgentConfig {
  mode: AgentMode;
  broker: string;
  accountId: string;
  riskTolerance: RiskTolerance;
  investmentTheme: string;
  constraints: {
    maxPositionSize: number;
    maxDailyTrades: number;
    minCashReserve: number;
    stopLossPercent: number;
  };
  preferences: {
    sectors: string[];
    excludeSectors: string[];
    minMarketCap: number;
    preferredOrderType: 'market' | 'limit';
  };
}
