export const env = {
  // Server
  PORT: process.env.PORT || '3000',
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Brokers
  ROBINHOOD_USERNAME: process.env.ROBINHOOD_USERNAME || '',
  ROBINHOOD_PASSWORD: process.env.ROBINHOOD_PASSWORD || '',
  ROBINHOOD_DEVICE_TOKEN: process.env.ROBINHOOD_DEVICE_TOKEN || '',

  IB_USERNAME: process.env.IB_USERNAME || '',
  IB_PASSWORD: process.env.IB_PASSWORD || '',
  IB_ACCOUNT_ID: process.env.IB_ACCOUNT_ID || '',

  TD_CLIENT_ID: process.env.TD_CLIENT_ID || '',
  TD_CLIENT_SECRET: process.env.TD_CLIENT_SECRET || '',
  TD_REFRESH_TOKEN: process.env.TD_REFRESH_TOKEN || '',

  ALPACA_API_KEY: process.env.ALPACA_API_KEY || '',
  ALPACA_SECRET_KEY: process.env.ALPACA_SECRET_KEY || '',
  ALPACA_BASE_URL: process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets',

  // Market Data
  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || '',
  POLYGON_API_KEY: process.env.POLYGON_API_KEY || '',
  IEX_CLOUD_API_KEY: process.env.IEX_CLOUD_API_KEY || '',

  // News
  NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  BENZINGA_API_KEY: process.env.BENZINGA_API_KEY || '',

  // LLM
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'openai',
  LLM_MODEL: process.env.LLM_MODEL || 'gpt-4',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',

  // Better Auth
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  // Agent
  DEFAULT_AGENT_MODE: process.env.DEFAULT_AGENT_MODE || 'co-pilot',
  MAX_DAILY_TRADES: parseInt(process.env.MAX_DAILY_TRADES || '10'),
  DEFAULT_RISK_TOLERANCE: process.env.DEFAULT_RISK_TOLERANCE || 'moderate',
} as const;
