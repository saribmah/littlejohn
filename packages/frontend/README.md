# Little John Frontend

React frontend for Little John portfolio management agent, built with Bun, React 19, and Tailwind CSS.

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 19
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create `.env` file:
```bash
VITE_API_URL=http://localhost:3000
```

## Development

Start the development server with hot reload:
```bash
bun dev
```

Build for production:
```bash
bun run build
```

Run production build:
```bash
bun start
```

Type check:
```bash
bun run type-check
```

Lint with oxlint:
```bash
bun run lint
```

Run all checks (type-check + lint):
```bash
bun run check
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/ui/    # Shared UI components (shadcn/ui)
├── features/         # Feature-based modules (flat structure)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── UserProfile.tsx
│   │   └── index.ts
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   └── index.ts
│   ├── portfolio/    # To be implemented
│   ├── agent/        # To be implemented
│   └── brokers/      # To be implemented
├── config/           # Configuration
├── hooks/            # Shared hooks
├── lib/              # Utilities
├── App.tsx           # Main app component
├── index.tsx         # Entry point
└── index.css         # Global styles
```

**Note**: Features use a flat structure - all files are in the feature directory without subdirectories.

## Features

### Auth
- Email/password login and signup
- User profile management
- Protected routes

### Dashboard
- Portfolio overview
- Agent status
- Quick actions
- Getting started guide

### Portfolio (Coming Soon)
- Portfolio tracking
- Position details
- Performance metrics

### Agent (Coming Soon)
- Agent configuration
- Trade proposals
- Activity monitoring

### Brokers (Coming Soon)
- Broker connections
- Account management
- Status monitoring

## Development Guidelines

Each feature is self-contained with:
- Components
- Hooks (optional)
- Types (optional)
- Utils (optional)

See `src/features/README.md` for detailed guidelines.

## UI Components

This project uses shadcn/ui components. Available components:
- Button
- Card
- Form
- Input
- Label
- Select

Add more components:
```bash
bunx shadcn@latest add [component-name]
```
