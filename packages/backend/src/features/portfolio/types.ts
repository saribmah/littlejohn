export type PortfolioPerformance = {
  currentValue: number;
  dayChange: {
    value: number;
    percentage: number;
  };
  weekChange: {
    value: number;
    percentage: number;
  };
  monthChange: {
    value: number;
    percentage: number;
  };
  threeMonthChange: {
    value: number;
    percentage: number;
  };
  yearChange: {
    value: number;
    percentage: number;
  };
};

export type PortfolioPerformanceResponse = {
  performance: PortfolioPerformance;
  lastUpdated: string;
};

export type UpdatePortfolioInput = {
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

export type Position = {
  id: string;
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

export type PositionsResponse = {
  positions: Position[];
  totalValue: number;
};
