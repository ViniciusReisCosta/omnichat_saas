'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Company = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  plan: string;
  active: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'canceled';
  createdAt: string;
  _count?: {
    users: number;
    conversations: number;
    channels: number;
  };
};

const emptyForm = { name: '', email: '', phone: '', plan: 'starter' };

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function colorFromId(id: string) {
  const colors = ['#1273eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
  return colors[id.length % colors.length];
}

function planClass(plan: string) {
  if (plan === 'enterprise') return 'bg-primary text-white';
  if (plan === 'professional') return 'bg-emerald-100 text-emerald-700';
  return 'bg-amber-100 text-amber-700';
}

export default function CompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const canManageCompanies = user?.role === 'super_admin';

  const loadCompanies = async () => {
    setError('');
    try {
      const data = await apiGet<Company[]>('/companies');
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const matchSearch = company.name.toLowerCase().includes(search.toLowerCase()) || company.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? company.active : !company.active);
      const matchPlan = planFilter === 'all' || company.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    });
  }, [companies, planFilter, search, statusFilter]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiPost('/companies', form);
      setForm(emptyForm);
      setShowForm(false);
      await loadCompanies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (company: Company) => {
    try {
      const updated = await apiPut<Company>(`/companies/${company.id}`, { active: !company.active });
      setCompanies((current) => current.map((item) => item.id === company.id ? { ...item, ...updated } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-heading font-bold text-heading">Companies</h2>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          disabled={!canManageCompanies}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <i className="fas fa-plus text-xs" />
          Add Company
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && canManageCompanies && (
        <form onSubmit={handleCreate} className="bg-white rounded-[10px] shadow-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Company name"
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Billing email"
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Phone"
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <select
              value={form.plan}
              onChange={(event) => setForm((current) => ({ ...current, plan: event.target.value }))}
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="h-10 px-4 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-[10px] shadow-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm text-heading placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={planFilter}
            onChange={(event) => setPlanFilter(event.target.value)}
            className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All plans</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-[10px] shadow-card p-12 text-center text-sm text-paragraph">
          <i className="fas fa-spinner fa-spin text-primary mr-2" />
          Loading companies...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-[10px] shadow-card p-12 text-center text-sm text-paragraph">
          No companies found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((company) => {
            const color = colorFromId(company.id);
            return (
              <div key={company.id} className="bg-white rounded-[10px] shadow-card p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                    <span className="text-base font-bold" style={{ color }}>{initials(company.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-heading font-bold text-heading truncate">{company.name}</h4>
                    <p className="text-xs text-paragraph truncate mt-0.5">{company.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${planClass(company.plan)}`}>
                        {company.plan}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${company.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {company.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                        {company.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-heading">{company._count?.users ?? 0}</p>
                    <p className="text-[11px] text-paragraph">Users</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-heading">{company._count?.conversations ?? 0}</p>
                    <p className="text-[11px] text-paragraph">Convs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-heading">{company._count?.channels ?? 0}</p>
                    <p className="text-[11px] text-paragraph">Channels</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(company)}
                    disabled={!canManageCompanies}
                    className={`flex-1 h-9 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                      company.active
                        ? 'text-red-500 border border-red-200 hover:bg-red-50'
                        : 'text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <i className={`fas ${company.active ? 'fa-ban' : 'fa-check'} mr-1`} />
                    {company.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-sm text-paragraph">
        Showing {filtered.length} of {companies.length} companies
      </p>
    </div>
  );
}
