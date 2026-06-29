'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.png';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
          <p className="text-paragraph">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isSuperAdmin = user.role === 'super_admin';
  const isCompanyAdmin = user.role === 'company_admin';

  const navGroups = [
    {
      label: 'MAIN',
      items: [
        { href: '/dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
        { href: '/dashboard/inbox', icon: 'fas fa-inbox', label: 'Inbox' },
      ],
    },
    {
      label: 'MANAGEMENT',
      items: [
        ...(isSuperAdmin ? [{ href: '/dashboard/companies', icon: 'fas fa-building', label: 'Companies' }] : []),
        ...(!isSuperAdmin || isCompanyAdmin ? [{ href: '/dashboard/agents', icon: 'fas fa-users', label: 'Agents' }] : []),
        ...(isSuperAdmin ? [{ href: '/dashboard/agents', icon: 'fas fa-users', label: 'Agents' }] : []),
        { href: '/dashboard/channels', icon: 'fas fa-plug', label: 'Channels' },
        { href: '/dashboard/chatbot', icon: 'fas fa-robot', label: 'Chatbot' },
      ].filter((v, i, a) => a.findIndex((t) => t.href === v.href) === i),
    },
    {
      label: 'SETTINGS',
      items: [
        { href: '/dashboard/settings', icon: 'fas fa-cog', label: 'Settings' },
      ],
    },
  ];

  const sidebarWidth = collapsed ? 'w-16' : 'w-[260px]';
  const contentMargin = collapsed ? 'ml-16' : 'ml-[260px]';

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <aside className={`fixed top-0 left-0 h-full ${sidebarWidth} bg-dark z-50 flex flex-col transition-all duration-300`}>
        <div className="h-16 flex items-center justify-center px-3 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center justify-center">
            <Image
              src={logo}
              alt="CberHunt"
              priority
              className={
                collapsed
                  ? 'h-10 w-10 object-cover object-left rounded-md bg-white p-1'
                  : 'h-12 w-auto rounded-md bg-white p-1.5'
              }
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold px-3 mb-2">{group.label}</p>}
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all ${
                    isActive(item.href) ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className={`${item.icon} text-sm w-5 text-center`}></i>
                  {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-gray-500 text-xs capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors" title="Logout">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          ) : (
            <button onClick={logout} className="w-full flex items-center justify-center text-gray-400 hover:text-red-400 py-2">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          )}
        </div>

        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs shadow-md hover:bg-primary/90 transition-all">
          <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`}></i>
        </button>
      </aside>

      <div className={`${contentMargin} transition-all duration-300`}>
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-40">
          <div>
            <h2 className="text-lg font-bold font-heading text-heading capitalize">
              {pathname === '/dashboard' ? 'Dashboard' : pathname.split('/').pop()?.replace(/-/g, ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input type="text" placeholder="Search..." className="border border-gray-200 rounded-full px-4 py-2 text-sm w-48 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            <button className="relative text-gray-500 hover:text-primary transition-colors">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-white text-[10px] rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <span className="text-sm font-medium text-heading hidden md:block">{user.name}</span>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
