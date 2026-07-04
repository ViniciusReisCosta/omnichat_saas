'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { apiGet } from '@/lib/api';

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

const faqs = [
  {
    question: 'Can I try CberHunt before purchasing?',
    answer: 'Accounts can be created from the registration page. Dashboard access is released after payment confirmation.',
  },
  {
    question: 'How does the billing cycle work?',
    answer: 'Subscriptions are handled through Stripe checkout when billing is configured for the selected plan.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Plan changes should be handled from the billing flow after Stripe prices are configured in the database.',
  },
  {
    question: 'What happens if payment fails?',
    answer: 'The account remains registered, but protected dashboard features require an active paid company status.',
  },
];

function parseFeatures(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value ? [value] : [];
  }
}

function planIcon(slug: string) {
  if (slug === 'enterprise') return 'fas fa-building';
  if (slug === 'professional') return 'fas fa-briefcase';
  return 'fas fa-rocket';
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<Plan[]>('/plans')
      .then(setPlans)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plans'))
      .finally(() => setLoading(false));
  }, []);

  const highlightedSlug = useMemo(() => {
    if (plans.some((plan) => plan.slug === 'professional')) return 'professional';
    return plans[Math.floor(plans.length / 2)]?.slug;
  }, [plans]);

  return (
    <>
      <Header />
      <Breadcrumb title="Pricing Plans" items={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]} />

      <section className="bg-gray-bg py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="sub-title mb-3">Our Plans</span>
            <h2 className="text-3xl md:text-[42px] font-extrabold font-heading text-heading mt-3 mb-5 leading-tight">
              Choose Your Perfect Plan
            </h2>
            <p className="text-paragraph">
              Pricing is loaded from the active plan records in the database.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`font-bold text-sm ${!annual ? 'text-heading' : 'text-paragraph'}`}>Monthly</span>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${annual ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${annual ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`font-bold text-sm ${annual ? 'text-heading' : 'text-paragraph'}`}>Annual</span>
            <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full">Save 20%</span>
          </div>

          {loading ? (
            <div className="bg-white rounded-card shadow-card p-12 text-center text-sm text-paragraph">
              <i className="fas fa-spinner fa-spin text-primary mr-2" />
              Loading plans...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-card p-6 text-center text-sm text-red-700">{error}</div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-card shadow-card p-12 text-center text-sm text-paragraph">
              No plans are configured yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {plans.map((plan) => {
                const highlighted = plan.slug === highlightedSlug;
                const price = annual ? Math.round(plan.price * 12 * 0.8) : plan.price;
                const features = parseFeatures(plan.features);

                return (
                  <div
                    key={plan.id}
                    className={`rounded-card p-10 relative transition-all duration-300 ${
                      highlighted ? 'bg-primary text-white shadow-extra scale-105 z-10' : 'bg-white border border-gray-200 shadow-card'
                    }`}
                  >
                    {highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-5 py-1.5 rounded-full uppercase tracking-wider">
                        Popular
                      </div>
                    )}

                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${highlighted ? 'bg-white/20' : 'bg-primary/10'}`}>
                      <i className={`${planIcon(plan.slug)} text-2xl ${highlighted ? 'text-white' : 'text-primary'}`} />
                    </div>

                    <h3 className={`text-xl font-extrabold font-heading mb-2 ${highlighted ? 'text-white' : 'text-heading'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm mb-6 ${highlighted ? 'text-white/80' : 'text-paragraph'}`}>
                      {plan.maxAgents} agents, {plan.maxChannels} channels, {plan.maxMessages.toLocaleString('pt-BR')} messages.
                    </p>

                    <div className="mb-8">
                      <span className={`text-5xl font-extrabold font-heading ${highlighted ? 'text-white' : 'text-heading'}`}>
                        R$ {price.toLocaleString('pt-BR')}
                      </span>
                      <span className={`text-sm ${highlighted ? 'text-white/70' : 'text-paragraph'}`}>
                        /{annual ? 'year' : 'month'}
                      </span>
                    </div>

                    <ul className="space-y-4 mb-10">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <i className="fas fa-check-circle text-green-400 text-base" />
                          <span className={`text-sm ${highlighted ? 'text-white' : 'text-heading'}`}>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={`/register?plan=${plan.slug}`}
                      className={`block text-center py-4 px-8 rounded-pill font-bold text-sm transition-all duration-300 ${
                        highlighted ? 'bg-white text-primary hover:bg-white/90' : 'btn-primary-outline'
                      }`}
                    >
                      Get Started
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="sub-title mb-3">FAQ</span>
            <h2 className="text-3xl md:text-[42px] font-extrabold font-heading text-heading mt-3 mb-5 leading-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-[800px] mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="bg-white border border-gray-200 rounded-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold font-heading text-heading text-[15px] pr-4">{faq.question}</span>
                  <i className={`fas fa-chevron-down text-primary text-sm transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-60 pb-6' : 'max-h-0'}`}>
                  <p className="px-6 text-paragraph text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
