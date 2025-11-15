# Features Directory

This directory contains feature-based modules for the Little John frontend. Each feature is self-contained with its own components, hooks, types, and utilities.

## Structure

Each feature directory follows a **flat structure**:

```
feature-name/
├── index.ts                  # Public exports
├── FeatureComponent.tsx      # Components (flat, no subdirectory)
├── AnotherComponent.tsx
├── useFeatureData.ts         # Hooks (optional)
├── types.ts                  # Feature-specific types (optional)
├── utils.ts                  # Feature-specific utilities (optional)
└── README.md                 # Feature documentation (optional)
```

**Important**: Keep all files flat in the feature directory - no `components/`, `hooks/`, or other subdirectories.

## Available Features

### Auth
User authentication and account management.

**Files:**
- `LoginForm.tsx` - Login form
- `SignUpForm.tsx` - Sign up form
- `UserProfile.tsx` - User profile
- `index.ts` - Public exports

### Dashboard
Main dashboard and overview.

**Files:**
- `Dashboard.tsx` - Main dashboard component
- `index.ts` - Public exports

### Portfolio (To be implemented)
Portfolio management and tracking.

### Agent (To be implemented)
AI agent control and configuration.

### Brokers (To be implemented)
Broker connections and management.

## Shared Resources

### Components (`src/components/ui/`)
Shared UI components (shadcn/ui) used across features.

### Hooks (`src/hooks/`)
Global hooks used by multiple features.

### Lib (`src/lib/`)
Shared utilities and helpers.

## Adding a New Feature

1. Create a new directory in `features/`
2. Add `index.ts` to export the feature's public API
3. Create `components/` directory for feature components
4. Add additional files as needed (hooks, types, utils)
5. Add route in `src/App.tsx`

Example:

```typescript
// features/my-feature/MyFeature.tsx
export function MyFeature() {
  return <div>My Feature</div>;
}

// features/my-feature/index.ts
export { MyFeature } from './MyFeature';

// App.tsx
import { MyFeature } from './features/my-feature';
```

## Best Practices

1. **Keep features isolated** - Each feature should be independent
2. **Flat structure** - All files in the feature directory, no subdirectories
3. **Colocate related code** - Keep components, hooks, and types together in the same directory
4. **Export through index.ts** - Keep feature internals private
5. **Use shared components** - Leverage `src/components/ui/` for common UI
6. **Type everything** - Use TypeScript for better DX
7. **Document complex features** - Add README.md for non-trivial features
