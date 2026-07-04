'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Company {
  id: string;
  name: string;
  plan: string;
  active: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'canceled';
}

interface User {
  id: string;
  name: string;
  role: string;
  hasActiveAccess: boolean;
  company: Company | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasActiveAccess: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: { name: string; email: string; password: string; companyName?: string }) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthResponse {
  user: User;
  nextStep: 'dashboard' | 'payment';
  paymentRequired?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasActiveAccess = user?.hasActiveAccess === true;

  const loadCurrentUser = async () => {
    const res = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
    if (!res.ok) {
      setUser(null);
      throw new Error('Invalid token');
    }

    const data = await res.json();
    setUser(data);
  };

  useEffect(() => {
    loadCurrentUser()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    setUser(data.user);
    return data;
  };

  const register = async (formData: { name: string; email: string; password: string; companyName?: string }): Promise<AuthResponse> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    setUser(data.user);
    return data;
  };

  const refreshUser = async () => {
    await loadCurrentUser();
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, hasActiveAccess: !!hasActiveAccess, login, register, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
