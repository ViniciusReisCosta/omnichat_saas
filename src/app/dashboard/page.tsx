'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type DashboardStats = {
  totalCompanies?: number;
  totalAgents: number;
  totalConversations: number;
  totalMessages: number;
  conversationsByStatus: Record<string, number>;
  conversationsByChannel: Record<string, number>;
  recentConversations: ConversationSummary[];
  messagesPerDay: { day: string; count: number }[];
};

type ConversationSummary = {
  id: string;
  customerName: string;
  channel: string;
  status: string;
  updatedAt: string;
  agent?: { name: string } | null;
  company?: { name: string } | null;
  messages?: { content: string; createdAt: string }[];
};

type AgentSummary = {
  id: string;
  name: string;
  online: boolean;
  _count?: { assignedConversations: number; messages: number };
};

const quickActions = [
  { label: 'Companies', icon: 'fas fa-building', href: '/dashboard/companies', superAdminOnly: true },
  { label: 'Agents', icon: 'fas fa-user-plus', href: '/dashboard/agents' },
  { label: 'Channels', icon: 'fas fa-plug', href: '/dashboard/channels' },
  { label: 'Inbox', icon: 'fas fa-inbox', href: '/dashboard/inbox' },
];

const channelColors: Record<string, string> = {
  whatsapp: '#25D366',
  instagram: '#E4405F',
  facebook: '#1877F2',
  email: '#6366f1',
  sms: '#f59e0b',
};

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function statusClass(status: string) {
  if (status === 'open') return 'bg-emerald-100 text-emerald-700';
  if (status === 'pending') return 'bg-amber-100 text-amber-700';
  if (status === 'closed') return 'bg-gray-100 text-gray-600';
  return 'bg-blue-100 text-blue-700';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiGet<DashboardStats>('/dashboard/stats'),
      apiGet<AgentSummary[]>('/agents'),
    ])
      .then(([statsData, agentsData]) => {
        setStats(statsData);
        setAgents(agentsData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const channelRows = useMemo(() => {
    if (!stats) return [];
    const total = Object.values(stats.conversationsByChannel).reduce((sum, value) => sum + value, 0);
    return Object.entries(stats.conversationsByChannel).map(([channel, count]) => ({
      name: channel,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: channelColors[channel] || '#1273eb',
    }));
  }, [stats]);

  const maxDayCount = Math.max(1, ...(stats?.messagesPerDay.map((item) => item.count) || [1]));
  const visibleActions = quickActions.filter((action) => !action.superAdminOnly || user?.role === 'super_admin');
  const onlineAgents = agents.filter((agent) => agent.online).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <i className="fas fa-spinner fa-spin text-primary text-2xl" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-white rounded-[10px] shadow-card p-8 text-center">
        <p className="text-sm text-red-600">{error || 'Dashboard data is unavailable.'}</p>
      </div>
    );
  }

  const cards = [
    ...(user?.role === 'super_admin'
      ? [{ label: 'Companies', value: stats.totalCompanies ?? 0, icon: 'fas fa-building', color: '#1273eb' }]
      : []),
    { label: 'Agents', value: stats.totalAgents, icon: 'fas fa-users', color: '#10b981' },
    { label: 'Conversations', value: stats.totalConversations, icon: 'fas fa-inbox', color: '#8b5cf6' },
    { label: 'Messages', value: stats.totalMessages, icon: 'fas fa-comments', color: '#f59e0b' },
    { label: 'Online Now', value: onlineAgents, icon: 'fas fa-circle', color: '#22c55e' },
  ].slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-[10px] shadow-card p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-xl`} style={{ color: stat.color }} />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-heading">{stat.value.toLocaleString('pt-BR')}</h3>
              <p className="text-sm text-paragraph">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-6">Messages Overview</h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {stats.messagesPerDay.map((item) => (
              <div key={`${item.day}-${item.count}`} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full relative flex items-end justify-center" style={{ height: 160 }}>
                  <div
                    className="w-full max-w-[40px] bg-primary rounded-t-md transition-all duration-500"
                    style={{ height: `${Math.max(5, (item.count / maxDayCount) * 100)}%` }}
                    title={`${item.count} messages`}
                  />
                </div>
                <span className="text-xs text-paragraph">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-6">Channel Distribution</h3>
          {channelRows.length === 0 ? (
            <p className="text-sm text-paragraph">No conversations yet.</p>
          ) : (
            <div className="space-y-5">
              {channelRows.map((channel) => (
                <div key={channel.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-heading capitalize">{channel.name}</span>
                    <span className="text-sm font-semibold" style={{ color: channel.color }}>
                      {channel.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${channel.percent}%`, backgroundColor: channel.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[10px] shadow-card">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-heading font-bold text-heading">Recent Conversations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8f9fb]">
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Channel</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Agent</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Last Message</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentConversations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-sm text-paragraph text-center">No conversations yet.</td>
                </tr>
              ) : (
                stats.recentConversations.map((conversation) => (
                  <tr key={conversation.id} className="border-b border-gray-50 hover:bg-[#f8f9fb] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-heading">{conversation.customerName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white capitalize" style={{ backgroundColor: channelColors[conversation.channel] || '#1273eb' }}>
                        {conversation.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-paragraph">{conversation.agent?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusClass(conversation.status)}`}>
                        {formatStatus(conversation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-paragraph max-w-[240px] truncate">{conversation.messages?.[0]?.content || 'No messages'}</td>
                    <td className="px-6 py-4 text-sm text-paragraph">{formatDate(conversation.updatedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-4">Active Agents</h3>
          <div className="space-y-3">
            {agents.length === 0 ? (
              <p className="text-sm text-paragraph">No agents found.</p>
            ) : (
              agents.slice(0, 6).map((agent) => (
                <div key={agent.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f8f9fb] transition-colors">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {agent.name.split(' ').map((name) => name[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${agent.online ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">{agent.name}</p>
                    <p className="text-xs text-paragraph">{agent.online ? 'Online' : 'Offline'}</p>
                  </div>
                  <span className="text-sm font-semibold text-heading">{agent._count?.assignedConversations ?? 0}</span>
                  <span className="text-xs text-paragraph">convs</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {visibleActions.map((action) => (
              <Link key={action.label} href={action.href} className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <i className={`${action.icon} text-primary text-lg`} />
                </div>
                <span className="text-sm font-medium text-heading">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
