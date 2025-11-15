# Little John

An intelligent agent for managing and evaluating investment portfolios using real-time news, market events, and portfolio management best practices.

## Overview

Little John is an AI-powered portfolio management agent that helps you make smarter investment decisions with your Robinhood sub-accounts. The agent operates in two modes:

### Manager Mode
The agent autonomously manages your portfolio based on your investment guidelines:
- Set your risk tolerance (conservative, moderate, aggressive)
- Define investment preferences (e.g., "AI-adjacent tech, energy, and data center companies")
- Agent automatically executes buy/sell decisions based on real-time market data and news
- Works within designated sub-accounts or isolated portfolios

### Co-Pilot Mode
The agent proposes trades with full context and rationale:
- Receives trade recommendations with supporting analysis
- Review news, events, and reasoning behind each proposed trade
- Simple Y/N approval before execution
- Maintains full control while leveraging AI insights

## Features

- Real-time market news and event monitoring
- Portfolio analysis and risk assessment
- Automated or semi-automated trade execution
- Multi-broker support (Robinhood, Interactive Brokers, TD Ameritrade, and more)
- Customizable investment strategies and risk profiles
- Trade rationale and context for informed decision-making

## Tech Stack

- **Runtime**: Bun
- **Frontend**: React + TypeScript
- **Backend**: Node.js/Bun + TypeScript
- **Sandbox**: Isolated execution environment for agent operations

## Project Structure

```
littlejohn/
├── packages/
│   ├── backend/      # API server and broker integrations
│   ├── frontend/     # React UI for portfolio management
│   └── sandbox/      # Isolated agent execution environment
└── agent.md          # Agent architecture and implementation details
```

## Getting Started

### Prerequisites

- Bun v1.2.17 or higher
- Trading account with supported broker (Robinhood, Interactive Brokers, TD Ameritrade, etc.)
- API access credentials for your broker
- Node.js 18+ (optional, for compatibility)

### Installation

```bash
bun install
```

### Development

Run the development server:

```bash
bun run index.ts
```

### Configuration

1. Set up your broker API credentials in `.env`
2. Select your broker integration (Robinhood, Interactive Brokers, etc.)
3. Configure your investment preferences and risk tolerance
4. Choose your operating mode (Manager or Co-Pilot)

## Documentation

For detailed information about the agent architecture, decision-making process, and implementation details, see [agent.md](./agent.md).

## Security & Risk Disclaimer

⚠️ **Important**: This application involves automated trading with real money. Please:
- Start with small amounts in an isolated sub-account
- Thoroughly test in Co-Pilot mode before using Manager mode
- Understand the risks of automated trading
- Never invest more than you can afford to lose
- Review all trades and agent decisions regularly
- Ensure proper API permissions and security settings with your broker

## License

MIT

---

This project was created using `bun init` in bun v1.2.17. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
