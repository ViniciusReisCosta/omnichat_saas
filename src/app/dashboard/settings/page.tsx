'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiDelete, apiGet, apiPath, apiPost, apiPut } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type CompanySettings = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  plan: string;
  active: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'canceled';
  businessHoursStart: string;
  businessHoursEnd: string;
  welcomeMessage: string;
  _count?: {
    users: number;
    conversations: number;
    channels: number;
  };
};

type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  maxAgents: number;
  maxChannels: number;
  maxMessages: number;
};

type NotificationPreferences = {
  id: string;
  emailNotifications: boolean;
  browserNotifications: boolean;
  newMessageAlerts: boolean;
  assignmentAlerts: boolean;
  paymentReminders: boolean;
};

type ApiKeyRecord = {
  id: string;
  name: string;
  keyPrefix: string;
  active: boolean;
  createdAt: string;
  lastUsedAt?: string | null;
  revokedAt?: string | null;
};

type CreatedApiKey = ApiKeyRecord & { token: string };

type Invoice = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  hostedInvoiceUrl?: string | null;
  createdAt: string;
};

const tabs = ['General', 'Notifications', 'Billing', 'API'];

const emptyCompany: CompanySettings = {
  id: '',
  name: '',
  email: '',
  phone: '',
  address: '',
  plan: 'starter',
  active: false,
  paymentStatus: 'pending',
  businessHoursStart: '08:00',
  businessHoursEnd: '18:00',
  welcomeMessage: '',
};

function Toggle({ enabled, disabled = false, onClick }: { enabled: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 ${enabled ? 'bg-primary' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function normalizePlanName(plan: string) {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('General');
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [form, setForm] = useState<CompanySettings>(emptyCompany);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [apiKeyName, setApiKeyName] = useState('Production key');
  const [createdApiKey, setCreatedApiKey] = useState<CreatedApiKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [appOrigin, setAppOrigin] = useState('');

  const canEditCompany = user?.role === 'company_admin' || user?.role === 'super_admin';

  useEffect(() => {
    setAppOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const companyId = user?.company?.id;
    if (!companyId) {
      setLoading(false);
      return;
    }

    Promise.all([
      apiGet<CompanySettings>(`/companies/${companyId}`),
      apiGet<Plan[]>('/plans'),
      apiGet<NotificationPreferences>('/notification-preferences'),
      apiGet<ApiKeyRecord[]>('/api-keys'),
      apiGet<Invoice[]>('/invoices'),
    ])
      .then(([companyData, planData, preferencesData, apiKeysData, invoicesData]) => {
        setCompany(companyData);
        setForm({ ...emptyCompany, ...companyData });
        setPlans(planData);
        setNotificationPreferences(preferencesData);
        setApiKeys(apiKeysData);
        setInvoices(invoicesData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, [user?.company?.id]);

  const currentPlan = useMemo(() => plans.find((plan) => plan.slug === company?.plan), [company?.plan, plans]);
  const webhookPath = apiPath('/payments/webhook');
  const webhookUrl = webhookPath.startsWith('http') ? webhookPath : `${appOrigin}${webhookPath}`;

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!company) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await apiPut<CompanySettings>(`/companies/${company.id}`, {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        address: form.address || null,
        businessHoursStart: form.businessHoursStart,
        businessHoursEnd: form.businessHoursEnd,
        welcomeMessage: form.welcomeMessage,
      });
      setCompany(updated);
      setForm({ ...emptyCompany, ...updated });
      setSuccess('Settings saved.');
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationPreference = async (key: keyof Omit<NotificationPreferences, 'id'>) => {
    if (!notificationPreferences) return;
    const updated = await apiPut<NotificationPreferences>('/notification-preferences', {
      ...notificationPreferences,
      [key]: !notificationPreferences[key],
    });
    setNotificationPreferences(updated);
  };

  const createApiKey = async () => {
    const created = await apiPost<CreatedApiKey>('/api-keys', { name: apiKeyName });
    setCreatedApiKey(created);
    setApiKeys((current) => [created, ...current]);
  };

  const revokeApiKey = async (id: string) => {
    await apiDelete(`/api-keys/${id}`);
    setApiKeys((current) => current.map((key) => key.id === id ? { ...key, active: false, revokedAt: new Date().toISOString() } : key));
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <i className="fas fa-spinner fa-spin text-primary text-2xl" />
      </div>
    );
  }

  if (!user?.company) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-heading font-bold text-heading">Settings</h2>
        <div className="bg-white rounded-[10px] shadow-card p-8 text-sm text-paragraph">
          No company workspace is associated with this account.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold text-heading">Settings</h2>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="flex items-center gap-1 bg-white rounded-[10px] shadow-card p-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab ? 'bg-primary text-white' : 'text-paragraph hover:text-heading hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'General' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-[10px] shadow-card p-6">
            <h3 className="text-base font-heading font-bold text-heading mb-5">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  disabled={!canEditCompany}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  disabled={!canEditCompany}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone || ''}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  disabled={!canEditCompany}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">Address</label>
                <textarea
                  value={form.address || ''}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  disabled={!canEditCompany}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-heading resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-heading mb-1.5">Welcome Message</label>
                <textarea
                  value={form.welcomeMessage || ''}
                  onChange={(event) => setForm((current) => ({ ...current, welcomeMessage: event.target.value }))}
                  disabled={!canEditCompany}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-heading resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={!canEditCompany || saving}
                className="px-8 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[10px] shadow-card p-6">
            <h3 className="text-base font-heading font-bold text-heading mb-5">Business Hours</h3>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">Start</label>
                <input
                  type="time"
                  value={form.businessHoursStart}
                  onChange={(event) => setForm((current) => ({ ...current, businessHoursStart: event.target.value }))}
                  disabled={!canEditCompany}
                  className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-1.5">End</label>
                <input
                  type="time"
                  value={form.businessHoursEnd}
                  onChange={(event) => setForm((current) => ({ ...current, businessHoursEnd: event.target.value }))}
                  disabled={!canEditCompany}
                  className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'Notifications' && (
        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-5">Notification Preferences</h3>
          <div className="space-y-1">
            {[
              { label: 'Email notifications', key: 'emailNotifications' },
              { label: 'Browser notifications', key: 'browserNotifications' },
              { label: 'New message alerts', key: 'newMessageAlerts' },
              { label: 'Assignment alerts', key: 'assignmentAlerts' },
              { label: 'Payment reminders', key: 'paymentReminders' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-heading">{item.label}</p>
                  <p className="text-xs text-paragraph mt-0.5">Stored in your workspace preferences.</p>
                </div>
                <Toggle
                  enabled={Boolean(notificationPreferences?.[item.key as keyof Omit<NotificationPreferences, 'id'>])}
                  disabled={!canEditCompany || !notificationPreferences}
                  onClick={() => updateNotificationPreference(item.key as keyof Omit<NotificationPreferences, 'id'>)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Billing' && company && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[10px] shadow-card p-6">
              <h3 className="text-base font-heading font-bold text-heading mb-4">Current Plan</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-heading font-bold text-heading">
                  R$ {currentPlan?.price?.toLocaleString('pt-BR') ?? '0'}
                </span>
                <span className="text-sm text-paragraph">/month</span>
              </div>
              <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary mb-4">
                {currentPlan?.name || normalizePlanName(company.plan)}
              </span>
              <p className="text-sm text-paragraph mb-5 capitalize">Payment status: {company.paymentStatus}</p>
              <Link href="/pricing" className="inline-flex w-full h-11 items-center justify-center text-sm font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200">
                View Plans
              </Link>
            </div>

            <div className="bg-white rounded-[10px] shadow-card p-6">
              <h3 className="text-base font-heading font-bold text-heading mb-4">Usage Snapshot</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-2xl font-heading font-bold text-heading">{company._count?.users ?? 0}</p>
                  <p className="text-xs text-paragraph">Users</p>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-heading">{company._count?.channels ?? 0}</p>
                  <p className="text-xs text-paragraph">Channels</p>
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-heading">{company._count?.conversations ?? 0}</p>
                  <p className="text-xs text-paragraph">Convs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[10px] shadow-card p-6">
            <h3 className="text-base font-heading font-bold text-heading mb-2">Billing History</h3>
            {invoices.length === 0 ? (
              <p className="text-sm text-paragraph">No invoices found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 text-left text-xs font-semibold uppercase text-paragraph">Date</th>
                      <th className="py-3 text-left text-xs font-semibold uppercase text-paragraph">Amount</th>
                      <th className="py-3 text-left text-xs font-semibold uppercase text-paragraph">Status</th>
                      <th className="py-3 text-left text-xs font-semibold uppercase text-paragraph">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 text-sm text-heading">{new Date(invoice.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 text-sm text-heading">
                          {invoice.amount.toLocaleString('pt-BR', { style: 'currency', currency: invoice.currency.toUpperCase() })}
                        </td>
                        <td className="py-3 text-sm text-heading capitalize">{invoice.status}</td>
                        <td className="py-3 text-sm">
                          {invoice.hostedInvoiceUrl ? (
                            <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="text-primary font-medium hover:underline">
                              Open
                            </a>
                          ) : (
                            <span className="text-paragraph">Unavailable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'API' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[10px] shadow-card p-6">
            <h3 className="text-base font-heading font-bold text-heading mb-5">API Key</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={apiKeyName}
                onChange={(event) => setApiKeyName(event.target.value)}
                disabled={!canEditCompany}
                className="h-11 flex-1 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={createApiKey}
                disabled={!canEditCompany || !apiKeyName.trim()}
                className="h-11 px-6 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Create Key
              </button>
            </div>

            {createdApiKey && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-xs uppercase font-bold text-emerald-700 mb-2">New API key</p>
                <input
                  value={createdApiKey.token}
                  readOnly
                  className="w-full h-10 px-3 rounded-lg border border-emerald-200 bg-white text-sm text-heading"
                />
              </div>
            )}

            <div className="mt-5 divide-y divide-gray-100">
              {apiKeys.length === 0 ? (
                <p className="text-sm text-paragraph">No API keys created yet.</p>
              ) : (
                apiKeys.map((key) => (
                  <div key={key.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-heading">{key.name}</p>
                      <p className="text-xs text-paragraph mt-0.5">
                        {key.keyPrefix}... - {key.active ? 'Active' : 'Revoked'} - {new Date(key.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {key.active && (
                      <button
                        type="button"
                        onClick={() => revokeApiKey(key.id)}
                        disabled={!canEditCompany}
                        className="h-9 px-4 text-sm font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-[10px] shadow-card p-6">
            <h3 className="text-base font-heading font-bold text-heading mb-5">Webhook URL</h3>
            <input
              type="url"
              value={webhookUrl}
              readOnly
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-heading bg-gray-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
