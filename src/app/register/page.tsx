'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const { register, isAuthenticated, loading: authLoading, hasActiveAccess } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await register({ name, email, password, companyName: companyName || undefined });
      router.push(result.nextStep === 'dashboard' ? '/dashboard' : '/billing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Breadcrumb title="Register Account" items={[{ label: 'Home', href: '/' }, { label: 'Register' }]} />

      <div className="bg-gray-bg py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/3 p-10 text-center text-white flex flex-col items-center justify-center" style={{ background: 'linear-gradient(45deg, #ee2852 0%, #1273eb 50%)' }}>
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6">
                    <i className="fas fa-user-plus text-3xl text-white"></i>
                  </div>
                  <h4 className="text-xl font-extrabold font-heading text-white mb-4">Get Started</h4>
                  <p className="text-white/70 text-sm">Create your account and start managing conversations</p>
                </div>

                <div className="lg:w-2/3 p-10">
                  <h4 className="text-xl font-extrabold font-heading text-heading mb-6">Create your account</h4>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
                      <i className="fas fa-exclamation-circle mr-2"></i>{error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name*" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email*" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company Name*" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password*" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password*" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required />
                    </div>

                    <button type="submit" disabled={loading} className="w-full text-white py-3 rounded-pill font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(45deg, #ee2852 0%, #1273eb 50%)' }}>
                      {loading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Creating account...</> : 'Register'}
                    </button>
                  </div>

                  <p className="text-center text-paragraph text-sm mt-6">
                    Already a member? <Link href="/login" className="text-primary font-bold hover:underline">Login here</Link>
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
