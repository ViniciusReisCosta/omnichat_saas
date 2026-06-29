'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
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
                  <p className="text-white/70 text-sm mb-6">Login to manage your conversations</p>
                  <div className="flex gap-3">
                    {[{ icon: 'facebook-f', bg: '#3b5998' }, { icon: 'google', bg: '#dd4b39' }, { icon: 'linkedin-in', bg: '#0077b5' }].map((s) => (
                      <button key={s.icon} type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110" style={{ background: s.bg }}>
                        <i className={`fab fa-${s.icon} text-sm`}></i>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:w-2/3 p-10">
                  <h4 className="text-xl font-extrabold font-heading text-heading mb-6">Login to your account!</h4>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                      <i className="fas fa-exclamation-circle mr-2"></i>{error}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md mb-6 text-sm">
                    <strong>Demo accounts:</strong><br />
                    Super Admin: admin@cberhunt.com / admin123<br />
                    Company Admin: carlos@techbrasil.com / 123456<br />
                    Agent: maria@techbrasil.com / 123456
                  </div>

                  <div className="space-y-4">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email*" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password*" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-paragraph cursor-pointer">
                        <input type="checkbox" className="rounded" /> Remember Me
                      </label>
                      <a href="#" className="text-primary text-sm font-semibold hover:underline">Lost your password?</a>
                    </div>

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
