'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';

type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  maxAgents: number;
  maxChannels: number;
  maxMessages: number;
  features: string;
};

function BillingContent() {
  const { user, loading: authLoading, isAuthenticated, hasActiveAccess, refreshUser, logout } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutState = searchParams.get('checkout');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    apiGet<Plan[]>('/plans')
      .then((data) => {
        setPlans(data);
        if (data[0]) setSelectedPlan(data[0].slug);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plans'))
      .finally(() => setLoadingPlans(false));
  }, []);

  useEffect(() => {
    if (hasActiveAccess) router.push('/dashboard');
  }, [hasActiveAccess, router]);

  useEffect(() => {
    if (checkoutState === 'success') {
      const timer = setInterval(() => {
        refreshUser().catch(() => undefined);
      }, 3000);

      refreshUser().catch(() => undefined);
      return () => clearInterval(timer);
    }
  }, [checkoutState, refreshUser]);

  const currentPlan = useMemo(
    () => plans.find((plan) => plan.slug === selectedPlan),
    [plans, selectedPlan]
  );
  const canManageBilling = user?.role === 'company_admin' || user?.role === 'super_admin';

  const handleCheckout = async () => {
    setSubmitting(true);
    setError('');

    try {
      const data = await apiPost<{ url: string }>('/payments/subscribe', { planSlug: selectedPlan });
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <>
      <Header />
      <Breadcrumb title="Billing" items={[{ label: 'Home', href: '/' }, { label: 'Billing' }]} />

      <section className="bg-gray-bg py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="bg-white rounded-card shadow-card p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-primary font-bold">Access Locked</p>
                  <h1 className="text-3xl font-extrabold font-heading text-heading mt-2">Finalize seu pagamento para liberar o dashboard</h1>
                  <p className="text-paragraph mt-3">
                    Sua conta foi criada com sucesso. O acesso ao sistema só é liberado após confirmação do pagamento no Stripe.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f8f9fb] px-5 py-4 min-w-[220px]">
                  <p className="text-xs uppercase text-paragraph font-semibold">Status atual</p>
                  <p className="text-lg font-bold text-heading capitalize">{user.company?.paymentStatus || 'pending'}</p>
                  <p className="text-sm text-paragraph mt-1">{user.company?.name}</p>
                </div>
              </div>
            </div>

            {checkoutState === 'success' && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-5 py-4">
                Pagamento enviado ao Stripe. Estamos aguardando a confirmação do webhook para liberar seu acesso.
              </div>
            )}

            {checkoutState === 'canceled' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4">
                O checkout foi cancelado. Você pode tentar novamente quando quiser.
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
                {error}
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.slug)}
                  className={`rounded-card border p-6 text-left transition-all ${
                    selectedPlan === plan.slug ? 'border-primary bg-primary text-white shadow-extra' : 'border-gray-200 bg-white shadow-card'
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-wider opacity-80">{plan.name}</p>
                  <p className="mt-4 text-4xl font-extrabold font-heading">
                    R$ {plan.price}
                    <span className="text-sm font-medium">/mês</span>
                  </p>
                  <p className={`mt-4 text-sm ${selectedPlan === plan.slug ? 'text-white/80' : 'text-paragraph'}`}>
                    {plan.maxAgents} agentes, {plan.maxChannels} canais, {plan.maxMessages.toLocaleString('pt-BR')} mensagens.
                  </p>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-card shadow-card p-8">
              <h2 className="text-2xl font-extrabold font-heading text-heading">Resumo</h2>
              <p className="text-paragraph mt-2">O checkout do Stripe será aberto com cartão de crédito para ativar sua assinatura.</p>

              <div className="mt-6 rounded-2xl bg-[#f8f9fb] p-5">
                <p className="text-sm text-paragraph">Plano selecionado</p>
                <p className="text-xl font-bold text-heading mt-1">{currentPlan?.name || 'Starter'}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loadingPlans || submitting || !canManageBilling}
                  className="bg-primary text-white px-6 py-3 rounded-pill font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Redirecionando...' : 'Pagar com cartao no Stripe'}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="btn-primary-outline"
                >
                  Sair
                </button>
              </div>
              {!canManageBilling && (
                <p className="text-sm text-paragraph mt-4">
                  Apenas o administrador da empresa pode concluir a assinatura. Entre em contato com o responsavel pela conta.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}
