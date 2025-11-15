import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement Better Auth login API call
          // const response = await fetch('/api/auth/sign-in', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ email, password }),
          // });
          // const data = await response.json();
          
          // Temporary mock implementation
          console.log('Login:', { email, password });
          
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            email,
            name: email.split('@')[0],
          };
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },

      signup: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement Better Auth signup API call
          // const response = await fetch('/api/auth/sign-up', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ email, password, name }),
          // });
          // const data = await response.json();
          
          // Temporary mock implementation
          console.log('Signup:', { email, password, name });
          
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            email,
            name: name || email.split('@')[0],
          };
          
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Signup failed',
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
