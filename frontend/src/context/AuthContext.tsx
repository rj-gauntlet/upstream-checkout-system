import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import apiClient from '../api/client';
import type { User, AuthTokens } from '../types';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, first_name: string, last_name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User & { profile: Partial<User['profile']> }>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me/');
      setUser(response.data);
    } catch {
      localStorage.removeItem('auth_tokens');
      setTokens(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const storedTokens = localStorage.getItem('auth_tokens');
    if (storedTokens) {
      try {
        const parsed = JSON.parse(storedTokens) as AuthTokens;
        setTokens(parsed);
        loadUser().finally(() => setLoading(false));
      } catch {
        localStorage.removeItem('auth_tokens');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const mergeCart = async () => {
    try {
      await apiClient.post('/cart/merge/');
    } catch {
      // No guest cart to merge — that's fine
    }
  };

  const login = async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login/', { username, password });
    const newTokens: AuthTokens = response.data;
    localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
    setTokens(newTokens);
    await loadUser();
    await mergeCart();
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ) => {
    const response = await apiClient.post('/auth/register/', {
      username,
      email,
      password,
      first_name,
      last_name,
    });
    const { tokens: newTokens, user: newUser } = response.data;
    localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
    setTokens(newTokens);
    setUser(newUser);
    await mergeCart();
  };

  const logout = () => {
    localStorage.removeItem('auth_tokens');
    setTokens(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User & { profile: Partial<User['profile']> }>) => {
    const response = await apiClient.patch('/auth/me/', data);
    setUser(response.data);
  };

  return (
    <AuthContext.Provider value={{ user, tokens, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
