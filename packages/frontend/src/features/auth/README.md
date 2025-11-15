# Auth Feature

Authentication features for Little John using Zustand for state management.

## Components

- `LoginForm`: User login form with Zustand integration
- `SignUpForm`: User registration form with Zustand integration
- `UserProfile`: User profile display and management

## Store

### `useAuthStore`

Zustand store for managing authentication state with persistence.

**State:**
- `user: User | null` - Current authenticated user
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state for auth operations
- `error: string | null` - Error message from auth operations

**Actions:**
- `login(email, password)` - Authenticate user
- `signup(email, password, name?)` - Register new user
- `logout()` - Clear authentication state
- `clearError()` - Clear error messages
- `setUser(user)` - Manually set user state

**Persistence:**
The store persists `user` and `isAuthenticated` to localStorage, so users remain logged in across page refreshes.

## Usage

```tsx
import { useAuthStore } from './features/auth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  if (!isAuthenticated) {
    return <button onClick={() => login('user@example.com', 'password')}>Login</button>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Integration

Uses Better Auth for authentication. Routes are auto-mounted at `/api/auth/*` by the backend.

## API Integration

The auth feature integrates with Better Auth running on the backend at `/api/auth/*`.

**Service Functions** (`service.ts`):
- `signUp({ email, password, name })` - Register new user
- `signIn({ email, password })` - Authenticate user
- `signOut()` - End user session
- `getCurrentSession()` - Get current user session

**Configuration:**
Set `VITE_API_URL` in `.env` to point to your backend API (default: `http://localhost:3000`)

## TODO

- [ ] Add token refresh logic
- [ ] Add email verification flow
- [ ] Add password reset functionality
- [ ] Add OAuth providers (Google, GitHub, etc.)
