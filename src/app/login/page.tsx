'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading, hasActiveAccess } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(hasActiveAccess ? '/dashboard' : '/billing');
    }
  }, [isAuthenticated, authLoading, router, hasActiveAccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      router.push(result.nextStep === 'dashboard' ? '/dashboard' : '/billing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Breadcrumb title="User Login" items={[{ label: 'Home', href: '/' }, { label: 'Login' }]} />

      <div className="bg-gray-bg py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/3 p-10 text-center text-white flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #040836 0%, #1273eb 100%)' }}>
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <i className="fas fa-user text-3xl text-white"></i>
                  </div>
                  <h4 className="text-xl font-extrabold font-heading text-white mb-4">Welcome Back</h4>
                  <p className="text-white/70 text-sm">Login to manage your conversations</p>
                </div>

                <div className="lg:w-2/3 p-10">
                  <h4 className="text-xl font-extrabold font-heading text-heading mb-6">Login to your account!</h4>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                      <i className="fas fa-exclamation-circle mr-2"></i>{error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email*" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password*" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />

                    <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-pill font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Logging in...</> : 'Login'}
                    </button>
                  </div>

                  <p className="text-center text-paragraph text-sm mt-6">
                    Not a member yet? <Link href="/register" className="text-primary font-bold hover:underline">Register now</Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
