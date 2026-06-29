'use client';

import { useState, FormEvent } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/layout/Breadcrumb';

const contactCards = [
  {
    icon: 'fas fa-map-marker-alt',
    title: 'Our Office',
    text: 'São Paulo, SP - Brazil',
  },
  {
    icon: 'fas fa-envelope',
    title: 'Email Us',
    text: 'contact@cberhunt.com',
  },
  {
    icon: 'fas fa-phone',
    title: 'Call Us',
    text: '+55 83 998367208',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <>
      <Header />
      <Breadcrumb
        title="Contact Us"
        items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section className="py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-card shadow-card p-10 text-center group hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-[70px] h-[70px] rounded-full bg-primary flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary transition-colors duration-300">
                  <i className={`${card.icon} text-white text-2xl`} />
                </div>
                <h4 className="text-lg font-extrabold font-heading text-heading mb-2">
                  {card.title}
                </h4>
                <p className="text-paragraph">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-bg py-[120px]">
        <div className="container mx-auto max-w-container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="sub-title mb-3">Get In Touch</span>
              <h2 className="text-3xl md:text-[42px] font-extrabold font-heading text-heading mt-3 mb-6 leading-tight">
                Send Us a Message
              </h2>
              <p className="text-paragraph leading-relaxed mb-8">
                Have a question, feedback, or want to learn more about CberHunt? Fill out the form
                and our team will get back to you within 24 hours.
              </p>
              <div className="space-y-6">
                {contactCards.map((card) => (
                  <div key={card.title} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <i className={`${card.icon} text-primary`} />
                    </div>
                    <div>
                      <h5 className="font-bold font-heading text-heading text-sm">{card.title}</h5>
                      <p className="text-paragraph text-sm">{card.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-card shadow-card p-10">
              {submitted && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex items-center gap-3">
                  <i className="fas fa-check-circle text-green-500" />
                  <span className="text-green-700 font-medium text-sm">
                    Message sent successfully! We&apos;ll be in touch soon.
                  </span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border border-gray-200 rounded-md px-4 py-3 w-full focus:border-primary focus:outline-none transition"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border border-gray-200 rounded-md px-4 py-3 w-full focus:border-primary focus:outline-none transition"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="border border-gray-200 rounded-md px-4 py-3 w-full focus:border-primary focus:outline-none transition"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="border border-gray-200 rounded-md px-4 py-3 w-full focus:border-primary focus:outline-none transition"
                />
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="border border-gray-200 rounded-md px-4 py-3 w-full focus:border-primary focus:outline-none transition resize-none"
                />
                <button type="submit" className="btn-primary-fill w-full text-center">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden" style={{ height: '400px' }}>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #f7f7f7 0%, #e8e8e8 50%, #f7f7f7 100%)',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <i className="fas fa-map-marked-alt text-primary text-3xl" />
          </div>
          <h3 className="text-2xl font-extrabold font-heading text-heading mb-2">
            São Paulo, Brazil
          </h3>
          <p className="text-paragraph">Interactive map coming soon</p>
        </div>
        <div className="absolute inset-0 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle, #1273eb 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        </div>
      </section>

      <Footer />
    </>
  );
}
