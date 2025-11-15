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
- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Hono + Bun + TypeScript + Prisma
- **Sandbox**: Isolated per-user agent execution environment with browser automation
- **Database**: PostgreSQL with Prisma ORM

## Architecture Overview

Little John uses a three-tier architecture:

1. **Frontend**: User-facing dashboard for portfolio management and agent interaction
2. **Backend**: API server handling authentication, data persistence, and broker integrations
3. **Sandbox**: Per-user isolated environments where AI agents run with browser access

### Sandbox Architecture

Each user gets their own sandbox instance when accessing the dashboard:
- **Isolated Environment**: Sandboxed execution environment for each user's agent
- **Browser Automation**: Agent has access to a headless browser instance
- **Robinhood Integration**: Agent logs into user's Robinhood account via browser
- **Portfolio Access**: Reads real-time portfolio data and positions
- **Trade Execution**: Executes trades on behalf of the user via browser automation
- **User Communication**: Users interact with their agent through natural language queries

The agent can answer questions like:
- "What's my current portfolio value?"
- "Show me my positions in tech stocks"
- "Buy 10 shares of AAPL"
- "What's the performance of my portfolio this month?"

## Project Structure

```
littlejohn/
├── packages/
│   ├── backend/      # API server, auth, and broker integrations
│   ├── frontend/     # React UI for portfolio management
│   └── sandbox/      # Per-user agent runtime with browser automation
│       ├── src/
│       │   ├── browser/  # Browser automation (Playwright/Puppeteer)
│       │   ├── mcp/      # Model Context Protocol server
│       │   ├── routes/   # SSE endpoints for agent communication
│       │   └── app.ts    # Sandbox server
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
