/**
 * Trade Types
 */

export enum TradeAction {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum TradeStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export interface Trade {
  id: string;
  symbol: string;
  amount: number;
  action: TradeAction;
  status: TradeStatus;
  price?: number;
  total?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradesResponse {
  trades: Trade[];
}

export interface TradeResponse {
  trade: Trade;
}

export interface CreateTradeRequest {
  symbol: string;
  amount: number;
  action: TradeAction;
  status?: TradeStatus;
  price?: number;
  total?: number;
  note?: string;
}

export interface UpdateTradeRequest {
  symbol?: string;
  amount?: number;
  action?: TradeAction;
  status?: TradeStatus;
  price?: number;
  total?: number;
  note?: string;
}
