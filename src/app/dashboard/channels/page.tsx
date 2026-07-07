'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type Channel = {
  id: string;
  type: string;
  name: string;
  accountId?: string | null;
  connected: boolean;
  company?: { id: string; name: string } | null;
  _count?: { conversations: number };
};

type ChannelType = {
  type: string;
  label: string;
  icon: string;
  color: string;
};

const emptyForm = { type: '', name: '', accountId: '' };

function channelMeta(type: string, channelTypes: ChannelType[]) {
  return channelTypes.find((item) => item.type === type) || { label: type, icon: 'fas fa-plug', color: '#1273eb' };
}

export default function ChannelsPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelTypes, setChannelTypes] = useState<ChannelType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const canCreateChannel = (user?.role !== 'super_admin' || Boolean(user?.company?.id)) && channelTypes.length > 0;

  const loadChannels = async () => {
    setError('');
    try {
      const data = await apiGet<Channel[]>('/channels');
      setChannels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      loadChannels(),
      apiGet<ChannelType[]>('/channel-types').then((data) => {
        setChannelTypes(data);
        setForm((current) => ({ ...current, type: current.type || data[0]?.type || '' }));
      }),
    ]).catch(() => undefined);
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiPost('/channels', form);
      setForm(emptyForm);
      setShowForm(false);
      await loadChannels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create channel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleConnected = async (channel: Channel) => {
    try {
      const updated = await apiPut<Channel>(`/channels/${channel.id}`, { connected: !channel.connected });
      setChannels((current) => current.map((item) => item.id === channel.id ? { ...item, ...updated } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update channel');
    }
  };

  const handleDelete = async (channel: Channel) => {
    if (!confirm(`Delete ${channel.name}?`)) return;

    try {
      await apiDelete(`/channels/${channel.id}`);
      setChannels((current) => current.filter((item) => item.id !== channel.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete channel');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-heading font-bold text-heading">Connected Channels</h2>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          disabled={!canCreateChannel}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <i className="fas fa-plus text-xs" />
          Add Channel
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && canCreateChannel && (
        <form onSubmit={handleCreate} className="bg-white rounded-[10px] shadow-card p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={form.type}
              onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {channelTypes.map((meta) => (
                <option key={meta.type} value={meta.type}>{meta.label}</option>
              ))}
            </select>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Display name"
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
            <input
              value={form.accountId}
              onChange={(event) => setForm((current) => ({ ...current, accountId: event.target.value }))}
              placeholder="Account ID"
              className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
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

      {loading ? (
        <div className="bg-white rounded-[10px] shadow-card p-12 text-center text-sm text-paragraph">
          <i className="fas fa-spinner fa-spin text-primary mr-2" />
          Loading channels...
        </div>
      ) : channels.length === 0 ? (
        <div className="bg-white rounded-[10px] shadow-card p-12 text-center text-sm text-paragraph">
          No channels configured yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {channels.map((channel) => {
            const meta = channelMeta(channel.type, channelTypes);
            return (
              <div key={channel.id} className="bg-white rounded-[10px] shadow-card overflow-hidden">
                <div className="h-2" style={{ backgroundColor: meta.color }} />
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${meta.color}15` }}>
                      <i className={`${meta.icon} text-2xl`} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-heading font-bold text-heading truncate">{channel.name}</h3>
                      <p className="text-xs text-paragraph mt-0.5 truncate">{channel.accountId || meta.label}</p>
                      {channel.company?.name && <p className="text-[11px] text-paragraph mt-0.5 truncate">{channel.company.name}</p>}
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${channel.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {channel.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-paragraph mb-1">Conversations</p>
                      <p className="text-xl font-bold text-heading">{channel._count?.conversations ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-paragraph mb-1">Type</p>
                      <p className="text-xl font-bold text-heading capitalize">{channel.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleToggleConnected(channel)}
                      className="flex-1 h-10 text-sm font-semibold text-heading border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <i className={`fas ${channel.connected ? 'fa-unlink' : 'fa-link'} mr-2 text-xs`} />
                      {channel.connected ? 'Disconnect' : 'Connect'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(channel)}
                      className="h-10 px-4 text-sm font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete channel"
                    >
                      <i className="fas fa-trash text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div>
        <h3 className="text-lg font-heading font-bold text-heading mb-4">Available Integrations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {channelTypes.map((meta) => {
            const configured = channels.some((channel) => channel.type === meta.type);
            return (
              <div key={meta.type} className="bg-white rounded-[10px] shadow-card p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${meta.color}15` }}>
                  <i className={`${meta.icon} text-lg`} style={{ color: meta.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-heading font-bold text-heading">{meta.label}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${configured ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {configured ? 'Configured' : 'Available'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
