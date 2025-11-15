export type BrokerType = 'robinhood' | 'interactive_brokers' | 'td_ameritrade' | 'alpaca';

export interface BrokerInfo {
  id: BrokerType;
  name: string;
  status: 'available' | 'planned' | 'connected' | 'error';
}

export interface BrokerConnection {
  broker: BrokerType;
  accountId: string;
  connected: boolean;
  lastSync?: string;
}
