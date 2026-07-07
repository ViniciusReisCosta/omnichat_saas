import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="container mx-auto max-w-container px-4">
        <div className="py-[120px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Image src={logo} alt="CberHunt" className="h-10 w-auto mb-6 rounded-md bg-white p-1.5" />
            <p className="text-gray-400 mb-6 leading-relaxed">
              Centralize all your customer communications in a single, powerful platform. WhatsApp, Instagram, and Facebook Messenger — all in one inbox.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-extrabold font-heading text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/about' },
                { label: 'Features', href: '/#features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Contact', href: '/contact' },
                { label: 'Login', href: '/login' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
                  >
                    <i className="fas fa-angle-right text-primary text-xs"></i>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-extrabold font-heading text-white mb-6">Platform</h4>
            <ul className="space-y-3">
              {[
                'Unified Inbox',
                'WhatsApp Integration',
                'Instagram DM',
                'Facebook Messenger',
                'Auto Assignment',
                'Analytics Dashboard',
              ].map((item) => (
                <li key={item}>
                  <span className="text-gray-400 flex items-center gap-2">
                    <i className="fas fa-angle-right text-primary text-xs"></i>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-extrabold font-heading text-white mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-10 h-10 min-w-[40px] rounded-full bg-white/10 flex items-center justify-center">
                  <i className="fas fa-map-marker-alt text-primary text-sm"></i>
                </div>
                <div>
                  <strong className="text-white text-sm">Address:</strong>
                  <p className="text-gray-400 text-sm">São Paulo, Brazil</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-10 h-10 min-w-[40px] rounded-full bg-white/10 flex items-center justify-center">
                  <i className="fas fa-envelope text-primary text-sm"></i>
                </div>
                <div>
                  <strong className="text-white text-sm">Email:</strong>
                  <p className="text-gray-400 text-sm">contact@cberhunt.com</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-10 h-10 min-w-[40px] rounded-full bg-white/10 flex items-center justify-center">
                  <i className="fas fa-phone text-primary text-sm"></i>
                </div>
                <div>
                  <strong className="text-white text-sm">Phone:</strong>
                  <p className="text-gray-400 text-sm"> +55 83 998367208</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto max-w-container px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CberHunt. All Rights Reserved.
          </p>
          <ul className="flex gap-6">
            <li><Link href="/contact" className="text-gray-400 text-sm hover:text-white transition-colors">Support</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
