'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-white shadow-primary py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto max-w-container px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <i className="fas fa-comments text-white text-lg"></i>
              </div>
              <span
                className={`text-2xl font-extrabold font-heading transition-colors duration-300 ${
                  scrolled ? 'text-heading' : 'text-white'
                }`}
              >
                Omni<span className="text-primary">Connect</span>
              </span>
            </div>
          </Link>

          <ul className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Home', href: '/' },
              { label: 'Features', href: '/#features' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`font-semibold text-[15px] transition-colors duration-300 hover:text-primary ${
                    scrolled ? 'text-heading' : 'text-white'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className={`font-bold text-sm transition-colors duration-300 hover:text-primary ${
                scrolled ? 'text-heading' : 'text-white'
              }`}
            >
              Login
            </Link>
            <Link href="/register" className="btn-primary-fill !py-3 !px-8">
              Start Free
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-2xl"
          >
            <i
              className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'} ${
                scrolled ? 'text-heading' : 'text-white'
              }`}
            ></i>
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-white shadow-card absolute top-full left-0 w-full">
            <div className="container mx-auto max-w-container px-4 py-6">
              <ul className="flex flex-col gap-4">
                {[
                  { label: 'Home', href: '/' },
                  { label: 'Features', href: '/#features' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'About', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="font-semibold text-heading hover:text-primary"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                <Link href="/login" className="font-bold text-heading hover:text-primary">
                  Login
                </Link>
                <Link href="/register" className="btn-primary-fill !py-3 !px-8">
                  Start Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
