'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useState, useEffect, useRef } from 'react';
import { apiGet } from '@/lib/api';

type HomePlan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  maxAgents: number;
  maxChannels: number;
  maxMessages: number;
  features: string;
};

type PublicMetrics = {
  companies: number;
  activeCompanies: number;
  messages: number;
  connectedChannels: number;
  conversations: number;
};

type ChannelType = {
  type: string;
  label: string;
  icon: string;
  color: string;
};

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    started.current = false;
    setCount(0);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="gradient-text text-5xl font-extrabold font-heading">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const features = [
  { icon: 'fa-inbox', title: 'Unified Inbox', desc: 'All your customer messages from every channel in a single, organized inbox. Never miss a conversation again.' },
  { icon: 'fa-layer-group', title: 'Multi-Channel Support', desc: 'Connect WhatsApp, Instagram DM, Facebook Messenger, and more channels to one powerful dashboard.' },
  { icon: 'fa-user-check', title: 'Auto Assignment', desc: 'Automatically route conversations to the right team member based on skills, availability, and workload.' },
  { icon: 'fa-bolt', title: 'Real-time Chat', desc: 'Instant messaging with zero delays. See typing indicators, read receipts, and live conversation updates.' },
  { icon: 'fa-chart-pie', title: 'Analytics Dashboard', desc: 'Track response times, resolution rates, team performance, and customer satisfaction in real-time.' },
  { icon: 'fa-users-gear', title: 'Team Management', desc: 'Organize agents into teams, set permissions, monitor performance, and scale operations effortlessly.' },
];

const services = [
  { icon: 'fab fa-whatsapp', title: 'WhatsApp Business API', desc: 'Official API integration with message templates, broadcast lists, and automated responses for your business.' },
  { icon: 'fab fa-instagram', title: 'Instagram DM Integration', desc: 'Manage all Instagram direct messages, story replies, and mentions directly from your unified inbox.' },
  { icon: 'fab fa-facebook-messenger', title: 'Facebook Messenger', desc: 'Connect your Facebook pages and manage all Messenger conversations with full feature support.' },
  { icon: 'fas fa-robot', title: 'Chatbot Automation', desc: 'Build powerful chatbot flows with no code. Automate FAQs, lead capture, and customer onboarding.' },
  { icon: 'fas fa-credit-card', title: 'Payment Management', desc: 'Send payment links, track invoices, and process transactions directly within your chat conversations.' },
  { icon: 'fas fa-chart-line', title: 'Analytics & Reports', desc: 'Deep insights into conversation metrics, agent performance, and customer behavior with exportable reports.' },
];

const steps = [
  { icon: 'fa-plug', title: 'Connect Channels', desc: 'Link your WhatsApp, Instagram, and Facebook accounts in just a few clicks. No coding required.' },
  { icon: 'fa-comments', title: 'Manage Conversations', desc: 'All messages flow into your unified inbox. Assign, tag, and resolve conversations efficiently.' },
  { icon: 'fa-rocket', title: 'Grow Your Business', desc: 'Deliver faster responses, happier customers, and scale your support as your business grows.' },
];

function parsePlanFeatures(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value ? [value] : [];
  }
}

export default function HomePage() {
  const [plans, setPlans] = useState<HomePlan[]>([]);
  const [metrics, setMetrics] = useState<PublicMetrics>({
    companies: 0,
    activeCompanies: 0,
    messages: 0,
    connectedChannels: 0,
    conversations: 0,
  });
  const [channelTypes, setChannelTypes] = useState<ChannelType[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    apiGet<HomePlan[]>('/plans')
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoadingPlans(false));
    apiGet<PublicMetrics>('/public/metrics').then(setMetrics).catch(() => undefined);
    apiGet<ChannelType[]>('/channel-types').then(setChannelTypes).catch(() => undefined);
  }, []);

  const highlightedSlug = plans.some((plan) => plan.slug === 'professional')
    ? 'professional'
    : plans[Math.floor(plans.length / 2)]?.slug;
  const activeCompanyRatio = metrics.companies > 0 ? Math.min(1, metrics.activeCompanies / metrics.companies) : 0;

  return (
    <>
      <Header />

      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #040836 0%, #1273eb 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-60 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl" />
        </div>
        <div className="container mx-auto max-w-container px-4 relative z-10 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-5 py-2 rounded-pill bg-white/10 text-white text-sm font-semibold mb-6 backdrop-blur-sm border border-white/10">
                <i className="fas fa-sparkles mr-2"></i>
                #1 Multichannel Platform
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold font-heading text-white leading-tight mb-6">
                Manage All Your Customer Conversations{' '}
                <span className="gradient-text">in One Place</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
                Unify WhatsApp, Instagram DM, and Facebook Messenger into a single powerful inbox.
                Respond faster, collaborate better, and never lose a customer conversation again.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="btn-gradient">
                  Start Free Trial <i className="fas fa-arrow-right ml-2"></i>
                </Link>
                <Link href="#features" className="btn-light-fill">
                  View Features <i className="fas fa-arrow-down ml-2"></i>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg">
                {[
                  { value: metrics.activeCompanies, label: 'Active companies' },
                  { value: metrics.connectedChannels, label: 'Connected channels' },
                  { value: metrics.messages, label: 'Messages' },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-2xl font-extrabold font-heading text-white">{item.value.toLocaleString('pt-BR')}</p>
                    <p className="text-white/60 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-extra">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <i className="fas fa-inbox text-white text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Unified Inbox</p>
                      <p className="text-white/50 text-xs">{metrics.conversations.toLocaleString('pt-BR')} conversations in the database</p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></span>
                    </div>
                  </div>

                  {channelTypes.slice(0, 3).map((channel, i) => (
                    <div
                      key={channel.type}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/10 ${i === 0 ? 'bg-white/5' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
                        <i className={channel.icon}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-sm font-semibold">{channel.label}</p>
                          <span className="text-white/40 text-xs">Available</span>
                        </div>
                        <p className="text-white/50 text-xs truncate">Loaded from backend channel catalog</p>
                      </div>
                      <i className={`${channel.icon} text-sm`} style={{ color: channel.color }}></i>
                    </div>
                  ))}
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-card p-4 flex items-center gap-3 animate-bounce-slow">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <i className="fas fa-check text-green-500"></i>
                  </div>
                  <div>
                    <p className="text-heading font-bold text-sm">Connected Channels</p>
                    <p className="text-paragraph text-xs">{metrics.connectedChannels.toLocaleString('pt-BR')} active integrations</p>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fas fa-chart-line text-primary"></i>
                  </div>
                  <div>
                    <p className="text-heading font-bold text-sm">{metrics.messages.toLocaleString('pt-BR')} Messages</p>
                    <p className="text-paragraph text-xs">Stored in PostgreSQL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-20 fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,79.75,127.57,62.91,321.39,56.44Z" />
          </svg>
        </div>
      </section>

      <section className="py-16 bg-white relative -mt-1">
        <div className="container mx-auto max-w-container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { target: metrics.companies, suffix: '', label: 'Companies' },
              { target: metrics.messages, suffix: '', label: 'Messages Sent' },
              { target: metrics.connectedChannels, suffix: '', label: 'Connected Channels' },
              { target: metrics.conversations, suffix: '', label: 'Conversations' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                <span className="text-paragraph font-medium text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section-padding bg-white">
        <div className="container mx-auto max-w-container px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="sub-title mb-4">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading mt-4">
              Save Time with Powerful Features
            </h2>
            <p className="text-paragraph mt-4">
              Everything you need to manage customer conversations at scale, built for modern teams.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-shadow p-8 group hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-[70px] h-[70px] rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-300">
                  <i className={`fas ${f.icon} text-2xl text-primary group-hover:text-white transition-all duration-300`}></i>
                </div>
                <h4 className="text-xl font-extrabold font-heading mb-3">{f.title}</h4>
                <p className="text-paragraph leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-bg">
        <div className="container mx-auto max-w-container px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="sub-title mb-4">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading mt-4">
              Start in 3 Simple Steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center relative group">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center relative"
                  style={{ background: 'linear-gradient(45deg, #ee2852 0%, #1273eb 100%)' }}
                >
                  <span className="text-white text-2xl font-extrabold font-heading">{i + 1}</span>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[calc(100%-60px)] h-[2px] border-t-2 border-dashed border-primary/30" />
                )}
                <div className="card-shadow p-8 hover:-translate-y-2 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                    <i className={`fas ${s.icon} text-2xl text-primary`}></i>
                  </div>
                  <h4 className="text-xl font-extrabold font-heading mb-3">{s.title}</h4>
                  <p className="text-paragraph">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container mx-auto max-w-container px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div
                className="rounded-card aspect-square max-w-[500px] relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #040836 0%, #1273eb 100%)' }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-6 p-8 opacity-30">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                        <i className={`fas ${['fa-comments', 'fa-envelope', 'fa-chart-bar', 'fa-users', 'fa-cog', 'fa-bell', 'fa-shield', 'fa-code', 'fa-globe'][i]} text-white text-xl`}></i>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-play text-white text-2xl"></i>
                    </div>
                    <p className="text-white font-bold font-heading text-lg">Platform Overview</p>
                    <p className="text-white/60 text-sm">Loaded from live backend metrics</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -right-4 bg-white rounded-card shadow-card p-6 max-w-[200px]">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none" stroke="url(#grad)" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42 * activeCompanyRatio} ${2 * Math.PI * 42}`}
                    />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ee2852" />
                        <stop offset="100%" stopColor="#1273eb" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="gradient-text text-xl font-extrabold font-heading">{Math.round(activeCompanyRatio * 100)}%</span>
                  </div>
                </div>
                <p className="text-heading font-bold text-sm text-center">Active Companies</p>
              </div>
            </div>

            <div>
              <span className="sub-title mb-4">Who We Are</span>
              <h2 className="text-3xl md:text-4xl font-extrabold font-heading mt-4 mb-6">
                We Combine Technology with Communication
              </h2>
              <p className="text-paragraph leading-relaxed mb-8">
                CberHunt was built by a team obsessed with customer experience. We believe every business
                deserves enterprise-level communication tools — without the enterprise price tag. Our platform
                empowers teams of all sizes to deliver fast, personal, and consistent support across every channel.
              </p>
              <div className="space-y-5 mb-10">
                {[
                  { title: 'Intelligent Routing', desc: 'AI-powered conversation routing ensures customers always reach the right agent.' },
                  { title: 'Enterprise Security', desc: 'End-to-end encryption, GDPR compliance, and SOC 2 certified infrastructure.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-12 h-12 min-w-[48px] rounded-full bg-primary/10 flex items-center justify-center">
                      <i className="fas fa-check text-primary"></i>
                    </div>
                    <div>
                      <h5 className="font-extrabold font-heading text-heading mb-1">{item.title}</h5>
                      <p className="text-paragraph text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/about" className="btn-primary-fill">
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-bg">
        <div className="container mx-auto max-w-container px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="sub-title mb-4">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading mt-4">
              What We Bring To You
            </h2>
            <p className="text-paragraph mt-4">
              Comprehensive tools for every aspect of your multichannel customer communication.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s) => (
              <div
                key={s.title}
                className="card-shadow p-8 group hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-[70px] h-[70px] rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-all duration-300">
                  <i className={`${s.icon} text-2xl text-primary group-hover:text-white transition-all duration-300`}></i>
                </div>
                <h4 className="text-xl font-extrabold font-heading mb-3">{s.title}</h4>
                <p className="text-paragraph leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container mx-auto max-w-container px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="sub-title mb-4">Pricing Plans</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-heading mt-4">
              Choose Your Perfect Plan
            </h2>
            <p className="text-paragraph mt-4">
              Flexible pricing that scales with your business. All plans include a 14-day free trial.
            </p>
          </div>
          {loadingPlans ? (
            <div className="card-shadow p-10 text-center text-paragraph">
              Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="card-shadow p-10 text-center text-paragraph">
              No plans are configured yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan) => {
                const highlighted = plan.slug === highlightedSlug;
                const features = parsePlanFeatures(plan.features);

                return (
                  <div
                    key={plan.id}
                    className={`rounded-card p-8 transition-all duration-300 hover:-translate-y-2 relative ${
                      highlighted ? 'bg-primary text-white shadow-extra scale-[1.03]' : 'card-shadow'
                    }`}
                  >
                    {highlighted && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-pill text-white text-xs font-bold"
                        style={{ background: 'linear-gradient(45deg, #ee2852 0%, #1273eb 100%)' }}
                      >
                        Most Popular
                      </div>
                    )}
                    <div className="text-center mb-8">
                      <h4 className={`text-xl font-extrabold font-heading mb-4 ${highlighted ? 'text-white' : ''}`}>
                        {plan.name}
                      </h4>
                      <div className="flex items-end justify-center gap-1">
                        <span className={`text-5xl font-extrabold font-heading ${highlighted ? 'text-white' : 'gradient-text'}`}>
                          R$ {plan.price.toLocaleString('pt-BR')}
                        </span>
                        <span className={`text-sm mb-2 ${highlighted ? 'text-white/70' : 'text-paragraph'}`}>/month</span>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {features.map((feat) => (
                        <li key={feat} className="flex items-center gap-3">
                          <i className={`fas fa-check-circle ${highlighted ? 'text-white/80' : 'text-primary'}`}></i>
                          <span className={highlighted ? 'text-white/90' : 'text-paragraph'}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-center mt-auto">
                      <Link
                        href={`/register?plan=${plan.slug}`}
                        className={`w-full block text-center ${highlighted ? 'btn-light-fill' : 'btn-primary-outline'}`}
                      >
                        Get Started
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section
        className="section-padding relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #040836 0%, #1273eb 100%)' }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/5" />
          <div className="absolute bottom-10 right-20 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/3" />
        </div>
        <div className="container mx-auto max-w-container px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-heading text-white mb-6">
            Ready to Transform Your Customer Communication?
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
            {metrics.activeCompanies.toLocaleString('pt-BR')} active companies are configured to deliver customer experiences across every channel.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-light-fill">
              Start Free Trial <i className="fas fa-arrow-right ml-2"></i>
            </Link>
            <Link href="/contact" className="btn-gradient !border-2 !border-white/20">
              Talk to Sales <i className="fas fa-phone ml-2"></i>
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
