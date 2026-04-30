'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

const plans = [
  {
    name: 'Starter',
    icon: 'fas fa-rocket',
    monthlyPrice: 149,
    description: 'For small teams',
    features: [
      { text: 'Up to 3 agents', included: true },
      { text: '2 channels', included: true },
      { text: '1,000 messages/mo', included: true },
      { text: 'Basic chatbot', included: true },
      { text: 'Email support', included: true },
      { text: 'Auto assignment', included: false },
      { text: 'Analytics', included: false },
      { text: 'Custom integrations', included: false },
    ],
    highlighted: false,
  },
  {
    name: 'Professional',
    icon: 'fas fa-briefcase',
    monthlyPrice: 399,
    description: 'For growing businesses',
    features: [
      { text: 'Up to 10 agents', included: true },
      { text: 'All channels', included: true },
      { text: '10,000 messages/mo', included: true },
      { text: 'Advanced chatbot', included: true },
      { text: 'Auto assignment', included: true },
      { text: 'Analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom integrations', included: false },
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    icon: 'fas fa-building',
    monthlyPrice: 999,
    description: 'For large teams',
    features: [
      { text: 'Unlimited agents', included: true },
      { text: 'All channels', included: true },
      { text: 'Unlimited messages', included: true },
      { text: 'AI chatbot', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Analytics', included: true },
    ],
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'Can I try OmniConnect before purchasing?',
    answer:
      'Yes! We offer a 14-day free trial on all plans with no credit card required. You can explore every feature and decide which plan fits your team best.',
  },
  {
    question: 'How does the billing cycle work?',
    answer:
      'You can choose between monthly or annual billing. Annual plans come with a 20% discount. Billing starts on the day you subscribe and renews automatically.',
  },
  {
    question: 'Can I upgrade or downgrade my plan at any time?',
    answer:
      'Absolutely. You can switch plans at any time from your dashboard. When upgrading, the price difference is prorated. Downgrades take effect at the next billing cycle.',
  },
  {
    question: 'What happens if I cancel my subscription?',
    answer:
      'You can cancel anytime. Your account will remain active until the end of the current billing period. After that, your data is retained for 30 days in case you decide to reactivate.',
  },
  {
    question: 'Do you offer custom plans for larger organizations?',
    answer:
      'Yes. Our Enterprise plan can be fully customized to meet your needs, including dedicated infrastructure, custom SLAs, and tailored onboarding. Contact our sales team for a quote.',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Header />
      <Breadcrumb
        title="Pricing Plans"
        items={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]}
      />

      <section className="bg-gray-bg py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="sub-title mb-3">Our Plans</span>
            <h2 className="text-3xl md:text-[42px] font-extrabold font-heading text-heading mt-3 mb-5 leading-tight">
              Choose Your Perfect Plan
            </h2>
            <p className="text-paragraph">
              Flexible pricing that scales with your business. Start small and grow without limits.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-16">
            <span
              className={`font-bold text-sm ${!annual ? 'text-heading' : 'text-paragraph'}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                annual ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                  annual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`font-bold text-sm ${annual ? 'text-heading' : 'text-paragraph'}`}
            >
              Annual
            </span>
            <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full">
              Save 20%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {plans.map((plan) => {
              const price = annual
                ? Math.round(plan.monthlyPrice * 0.8)
                : plan.monthlyPrice;

              return (
                <div
                  key={plan.name}
                  className={`rounded-card p-10 relative transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-primary text-white shadow-extra scale-105 z-10'
                      : 'bg-white border border-gray-200 shadow-card'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-white text-xs font-bold px-5 py-1.5 rounded-full uppercase tracking-wider">
                      Popular
                    </div>
                  )}

                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                      plan.highlighted ? 'bg-white/20' : 'bg-primary/10'
                    }`}
                  >
                    <i
                      className={`${plan.icon} text-2xl ${
                        plan.highlighted ? 'text-white' : 'text-primary'
                      }`}
                    />
                  </div>

                  <h3
                    className={`text-xl font-extrabold font-heading mb-2 ${
                      plan.highlighted ? 'text-white' : 'text-heading'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm mb-6 ${
                      plan.highlighted ? 'text-white/80' : 'text-paragraph'
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <span
                      className={`text-5xl font-extrabold font-heading ${
                        plan.highlighted ? 'text-white' : 'text-heading'
                      }`}
                    >
                      R$ {price}
                    </span>
                    <span
                      className={`text-sm ${
                        plan.highlighted ? 'text-white/70' : 'text-paragraph'
                      }`}
                    >
                      /{annual ? 'yr' : 'mo'}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-3">
                        <i
                          className={`${
                            feature.included
                              ? 'fas fa-check-circle text-green-400'
                              : 'fas fa-times-circle text-gray-300'
                          } text-base`}
                        />
                        <span
                          className={`text-sm ${
                            plan.highlighted
                              ? feature.included
                                ? 'text-white'
                                : 'text-white/50'
                              : feature.included
                                ? 'text-heading'
                                : 'text-gray-400'
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#"
                    className={`block text-center py-4 px-8 rounded-pill font-bold text-sm transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-white text-primary hover:bg-white/90'
                        : 'btn-primary-outline'
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              );
            })}
          </div>
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
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-bold font-heading text-heading text-[15px] pr-4">
                    {faq.question}
                  </span>
                  <i
                    className={`fas fa-chevron-down text-primary text-sm transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-60 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="px-6 text-paragraph text-sm leading-relaxed">
                    {faq.answer}
                  </p>
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
