'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { useFeedback } from '@/contexts/FeedbackContext';
import { userErrorMessage } from '@/lib/feedback-messages';

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
  const { toast } = useFeedback();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasActiveAccess = user?.hasActiveAccess === true;

  const loadCurrentUser = async () => {
    try {
      const data = await apiGet<User>('/auth/me');
      setUser(data);
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  useEffect(() => {
    loadCurrentUser()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiPost<AuthResponse>('/auth/login', { email, password });
    setUser(data.user);
    return data;
  };

  const register = async (formData: { name: string; email: string; password: string; companyName?: string }): Promise<AuthResponse> => {
    const data = await apiPost<AuthResponse>('/auth/register', formData);
    setUser(data.user);
    return data;
  };

  const refreshUser = async () => {
    await loadCurrentUser();
  };

  const logout = async () => {
    try {
      await apiPost('/auth/logout');
      toast({ type: 'success', title: 'Sessao encerrada' });
    } catch (err) {
      toast({
        type: 'warning',
        title: 'Sessao encerrada localmente',
        message: userErrorMessage(err, 'Nao foi possivel confirmar o logout no servidor.'),
      });
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
