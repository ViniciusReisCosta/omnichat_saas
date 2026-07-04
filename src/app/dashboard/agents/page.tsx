'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Agent = {
  id: string;
  name: string;
  email: string;
  role: string;
  online: boolean;
  company?: { id: string; name: string } | null;
  _count?: {
    assignedConversations: number;
    messages: number;
  };
};

const emptyForm = { name: '', email: '', password: '', role: 'agent' };

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function roleLabel(role: string) {
  return role.replace(/_/g, ' ');
}

export default function AgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const canManageAgents = user?.role === 'super_admin' || user?.role === 'company_admin';

  const loadAgents = async () => {
    setError('');
    try {
      const data = await apiGet<Agent[]>('/agents');
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const stats = useMemo(() => {
    const online = agents.filter((agent) => agent.online).length;
    return [
      { label: 'Total Agents', value: agents.length, icon: 'fas fa-users', color: '#1273eb' },
      { label: 'Online', value: online, icon: 'fas fa-circle', color: '#10b981' },
      { label: 'Offline', value: agents.length - online, icon: 'fas fa-circle', color: '#9ca3af' },
    ];
  }, [agents]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiPost('/agents', form);
      setForm(emptyForm);
      setShowForm(false);
      await loadAgents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create agent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleOnline = async (agent: Agent) => {
    try {
      await apiPut(`/agents/${agent.id}`, { online: !agent.online });
      setAgents((current) => current.map((item) => item.id === agent.id ? { ...item, online: !agent.online } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agent');
    }
  };

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Delete ${agent.name}?`)) return;

    try {
      await apiDelete(`/agents/${agent.id}`);
      setAgents((current) => current.filter((item) => item.id !== agent.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete agent');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-heading font-bold text-heading">Team Agents</h2>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          disabled={!canManageAgents}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <i className="fas fa-user-plus text-xs" />
          Invite Agent
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && canManageAgents && (
        <form onSubmit={handleCreate} className="bg-white rounded-[10px] shadow-card p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Full name"
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Temporary password"
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            <div className="flex gap-3">
              <select
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                className="h-10 flex-1 px-4 rounded-lg border border-gray-200 text-sm text-heading bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="agent">Agent</option>
                <option value="company_admin">Company admin</option>
              </select>
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-4 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-[10px] shadow-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-sm`} style={{ color: stat.color }} />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-heading">{stat.value}</h3>
              <p className="text-xs text-paragraph">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[10px] shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8f9fb]">
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Agent</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Conversations</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Messages</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-paragraph">
                    <i className="fas fa-spinner fa-spin text-primary mr-2" />
                    Loading agents...
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-paragraph">No agents found.</td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-gray-50 hover:bg-[#f8f9fb] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">{initials(agent.name)}</span>
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${agent.online ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-heading">{agent.name}</p>
                          <p className="text-xs text-paragraph">{agent.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${agent.online ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${agent.online ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {agent.online ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${agent.role === 'company_admin' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                        {roleLabel(agent.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-heading">{agent._count?.assignedConversations ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-paragraph">{agent._count?.messages ?? 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleOnline(agent)}
                          disabled={!canManageAgents}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-paragraph hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-50"
                          title={agent.online ? 'Set offline' : 'Set online'}
                        >
                          <i className="fas fa-power-off text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(agent)}
                          disabled={!canManageAgents || agent.id === user?.id}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-paragraph hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50"
                          title="Delete agent"
                        >
                          <i className="fas fa-trash text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
