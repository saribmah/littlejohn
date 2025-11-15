export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Sign up a new user
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include', // Important for cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Sign up failed' }));
    throw new Error(error.message || 'Sign up failed');
  }

  const result = await response.json();
  
  return {
    token: result.token,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      image: result.user.image,
      emailVerified: result.user.emailVerified,
      createdAt: new Date(result.user.createdAt),
      updatedAt: new Date(result.user.updatedAt),
    },
  };
}

/**
 * Sign in an existing user
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Sign in failed' }));
    throw new Error(error.message || 'Invalid credentials');
  }

  const result = await response.json();
  
  return {
    token: result.token,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      image: result.user.image,
      emailVerified: result.user.emailVerified,
      createdAt: new Date(result.user.createdAt),
      updatedAt: new Date(result.user.updatedAt),
    },
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Sign out failed');
  }
}

/**
 * Get the current user session
 */
export async function getCurrentSession(): Promise<AuthResponse | null> {
  const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  
  if (!result.user) {
    return null;
  }

  return {
    token: result.token,
    user: {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      image: result.user.image,
      emailVerified: result.user.emailVerified,
      createdAt: new Date(result.user.createdAt),
      updatedAt: new Date(result.user.updatedAt),
    },
  };
}
