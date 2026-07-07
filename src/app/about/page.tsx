'use client';

import { useEffect, useRef, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';
import { apiGet } from '@/lib/api';

type PublicMetrics = {
  companies: number;
  activeCompanies: number;
  messages: number;
  connectedChannels: number;
  conversations: number;
};

const values = [
  {
    icon: 'fas fa-lightbulb',
    title: 'Innovation',
    description:
      'We constantly push the boundaries of communication technology, building smart solutions that anticipate your needs.',
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Reliability',
    description:
      'Our platform is built for dependable customer operations, keeping teams focused on active conversations.',
  },
  {
    icon: 'fas fa-eye',
    title: 'Transparency',
    description:
      'Clear pricing, open communication, and honest partnerships form the foundation of everything we do.',
  },
  {
    icon: 'fas fa-star',
    title: 'Customer First',
    description:
      'Every feature we build starts with a customer need. Your success drives our roadmap.',
  },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
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
    <div ref={ref} className="text-4xl md:text-5xl font-extrabold font-heading text-white">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

export default function AboutPage() {
  const [metrics, setMetrics] = useState<PublicMetrics>({
    companies: 0,
    activeCompanies: 0,
    messages: 0,
    connectedChannels: 0,
    conversations: 0,
  });

  useEffect(() => {
    apiGet<PublicMetrics>('/public/metrics').then(setMetrics).catch(() => undefined);
  }, []);

  const stats = [
    { icon: 'fas fa-building', value: metrics.companies, suffix: '', label: 'Companies' },
    { icon: 'fas fa-paper-plane', value: metrics.messages, suffix: '', label: 'Messages Delivered' },
    { icon: 'fas fa-plug', value: metrics.connectedChannels, suffix: '', label: 'Connected Channels' },
    { icon: 'fas fa-comments', value: metrics.conversations, suffix: '', label: 'Conversations' },
  ];

  return (
    <>
      <Header />
      <Breadcrumb
        title="About Us"
        items={[{ label: 'Home', href: '/' }, { label: 'About Us' }]}
      />

      <section className="py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div
                className="w-full aspect-[4/3] rounded-card"
                style={{
                  background: 'linear-gradient(135deg, #1273eb 0%, #040836 100%)',
                }}
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-card shadow-card p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="fas fa-users text-primary text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-heading text-heading">{metrics.activeCompanies.toLocaleString('pt-BR')}</div>
                  <div className="text-paragraph text-sm">Active Companies</div>
                </div>
              </div>
              <div className="absolute -top-6 -left-6 bg-white rounded-card shadow-card p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center">
                  <i className="fas fa-chart-line text-secondary text-xl" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold font-heading text-heading">{metrics.messages.toLocaleString('pt-BR')}</div>
                  <div className="text-paragraph text-sm">Messages</div>
                </div>
              </div>
            </div>

            <div>
              <span className="sub-title mb-3">Who We Are</span>
              <h2 className="text-3xl md:text-[42px] font-extrabold font-heading text-heading mt-3 mb-6 leading-tight">
                We Combine Technology with Communication Excellence
              </h2>
              <p className="text-paragraph mb-4 leading-relaxed">
                CberHunt was born from a simple belief: businesses deserve a smarter way to manage
                customer conversations. We built a platform that brings WhatsApp, Instagram, Facebook
                Messenger, and more into a single, intuitive inbox.
              </p>
              <p className="text-paragraph mb-8 leading-relaxed">
                Our mission is to help companies of every size deliver fast, personal, and consistent
                support across every channel — without the complexity. From startups to enterprises,
                we power the conversations that build lasting relationships.
              </p>
              <div className="space-y-4">
                {['Unified Multi-Channel Platform', 'Database-backed Workspaces'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <i className="fas fa-check text-white text-xs" />
                    </div>
                    <span className="font-bold font-heading text-heading">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-dark py-[80px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <i className={`${stat.icon} text-primary text-2xl`} />
                </div>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                <p className="text-gray-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="text-center max-w-[600px] mx-auto mb-16">
            <span className="sub-title mb-3">Our Values</span>
            <h2 className="text-3xl md:text-[42px] font-extrabold font-heading text-heading mt-3 mb-5 leading-tight">
              What Drives Us Forward
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-card shadow-card p-8 text-center group hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary transition-colors duration-300">
                  <i
                    className={`${value.icon} text-3xl text-primary group-hover:text-white transition-colors duration-300`}
                  />
                </div>
                <h4 className="text-lg font-extrabold font-heading text-heading mb-3">
                  {value.title}
                </h4>
                <p className="text-paragraph text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="container mx-auto max-w-container px-4 text-center">
          <h2 className="text-3xl md:text-[42px] font-extrabold font-heading text-white mb-5 leading-tight">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 max-w-[500px] mx-auto mb-10">
            {metrics.activeCompanies.toLocaleString('pt-BR')} active companies are configured in CberHunt to transform their customer communication.
          </p>
          <a href="/register" className="btn-light-fill">
            Start Your Free Trial
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
