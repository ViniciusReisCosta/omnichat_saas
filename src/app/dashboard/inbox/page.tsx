'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiGet, apiPost, apiPut } from '@/lib/api';

const CHANNEL_COLORS: Record<string, string> = {
  whatsapp: '#25D366',
  instagram: '#E4405F',
  facebook: '#1877F2',
};

const CHANNEL_ICONS: Record<string, string> = {
  whatsapp: 'fab fa-whatsapp',
  instagram: 'fab fa-instagram',
  facebook: 'fab fa-facebook-messenger',
};

const STATUS_COLORS: Record<string, string> = {
  open: '#25D366',
  pending: '#f59e0b',
  closed: '#9ca3af',
};

const QUICK_REPLIES = ['Obrigado!', 'Como posso ajudar?', 'Um momento, por favor'];

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  online?: boolean;
}

interface MessageData {
  id: string;
  content: string;
  senderType: string;
  senderId: string | null;
  sender: { id: string; name: string; email?: string; role?: string } | null;
  read: boolean;
  createdAt: string;
}

interface ConversationItem {
  id: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAvatar: string | null;
  channel: string;
  status: string;
  unreadCount: number;
  agentId: string | null;
  agent: Agent | null;
  createdAt: string;
  updatedAt: string;
  messages: MessageData[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AvatarCircle({
  initials,
  size = 40,
  channel,
}: {
  initials: string;
  size?: number;
  channel?: string;
}) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white font-heading font-bold"
        style={{
          fontSize: size * 0.35,
          background: 'linear-gradient(135deg, #1273eb 0%, #ee2852 100%)',
        }}
      >
        {initials}
      </div>
      {channel && CHANNEL_COLORS[channel] && (
        <div
          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white"
          style={{ backgroundColor: CHANNEL_COLORS[channel] }}
        >
          <i className={`${CHANNEL_ICONS[channel]} text-white`} style={{ fontSize: 8 }} />
        </div>
      )}
    </div>
  );
}

function ConversationRow({
  convo,
  isActive,
  onClick,
}: {
  convo: ConversationItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const lastMsg = convo.messages[0];
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-l-[3px] ${
        isActive ? 'bg-primary/5 border-l-primary' : 'border-l-transparent hover:bg-gray-50'
      }`}
    >
      <AvatarCircle initials={getInitials(convo.customerName)} size={44} channel={convo.channel} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading font-bold text-heading text-[13px] truncate">
            {convo.customerName}
          </span>
          <span className="text-[11px] text-paragraph flex-shrink-0">
            {timeAgo(convo.updatedAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-[12px] text-paragraph truncate leading-tight">
            {lastMsg?.content || 'Sem mensagens'}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {convo.agent && (
              <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[8px] font-bold">
                {getInitials(convo.agent.name)}
              </span>
            )}
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: STATUS_COLORS[convo.status] || '#9ca3af' }}
            />
            {convo.unreadCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {convo.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function ChatBubble({ msg }: { msg: MessageData }) {
  if (msg.senderType === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] text-paragraph bg-white/80 px-3 py-1 rounded-full shadow-sm">
          {msg.content}
        </span>
      </div>
    );
  }

  const isAgent = msg.senderType === 'agent';
  const isBot = msg.senderType === 'bot';

  return (
    <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'} mb-3`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
          <i className="fa-solid fa-robot text-green-600" style={{ fontSize: 12 }} />
        </div>
      )}
      <div
        className={`max-w-[420px] px-3.5 py-2.5 shadow-sm ${
          isAgent
            ? 'bg-primary text-white rounded-lg rounded-tr-none'
            : isBot
              ? 'bg-green-50 border border-green-200 text-heading rounded-lg rounded-tl-none'
              : 'bg-white text-heading rounded-lg rounded-tl-none'
        }`}
      >
        {isBot && (
          <p className="text-[10px] font-bold text-green-600 mb-1">Bot</p>
        )}
        <p className="text-[13.5px] leading-relaxed">{msg.content}</p>
        <div
          className={`flex items-center gap-1.5 mt-1.5 ${isAgent ? 'justify-end' : 'justify-start'}`}
        >
          <span
            className={`text-[10px] ${
              isAgent ? 'text-white/60' : isBot ? 'text-green-500/70' : 'text-paragraph/60'
            }`}
          >
            {formatTime(msg.createdAt)}
          </span>
          {isAgent && (
            <i
              className={`fa-solid fa-check-double ${msg.read ? 'text-sky-200' : 'text-white/40'}`}
              style={{ fontSize: 10 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
          <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-2.5 bg-gray-100 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NewConversationForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { customerName: string; channel: string; customerPhone?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [phone, setPhone] = useState('');

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <h4 className="font-heading font-bold text-heading text-[13px] mb-3">Nova Conversa</h4>
      <input
        type="text"
        placeholder="Nome do cliente"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-heading placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all mb-2"
      />
      <select
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all mb-2"
      >
        <option value="whatsapp">WhatsApp</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
      </select>
      <input
        type="text"
        placeholder="Telefone (opcional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-heading placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all mb-3"
      />
      <div className="flex gap-2">
        <button
          onClick={() => name.trim() && onSubmit({ customerName: name, channel, customerPhone: phone || undefined })}
          disabled={!name.trim()}
          className="flex-1 py-2 bg-primary text-white text-[12px] font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          Criar
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2 bg-gray-200 text-heading text-[12px] font-bold rounded-lg hover:bg-gray-300 transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationItem | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showReassign, setShowReassign] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (channelFilter) params.set('channel', channelFilter);
      if (searchQuery) params.set('search', searchQuery);
      const data = await apiGet<ConversationItem[]>(`/api/conversations?${params.toString()}`);
      setConversations(data);
    } catch {
      /* network error — keep stale list */
    } finally {
      setLoading(false);
    }
  }, [statusFilter, channelFilter, searchQuery]);

  const fetchDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    try {
      const data = await apiGet<ConversationItem>(`/api/conversations/${id}`);
      setDetail(data);
    } catch {
      /* keep stale detail */
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedId) {
      fetchDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId, fetchDetail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [detail?.messages]);

  useEffect(() => {
    apiGet<Agent[]>('/api/agents').then(setAgents).catch(() => {});
  }, []);

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedId || sending) return;
    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);
    try {
      await apiPost(`/api/conversations/${selectedId}/messages`, {
        content,
        senderType: 'agent',
      });
      await fetchDetail(selectedId);
      fetchConversations();
    } catch {
      setMessageInput(content);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedId) return;
    try {
      await apiPut(`/api/conversations/${selectedId}`, { status });
      await fetchDetail(selectedId);
      fetchConversations();
    } catch {
      /* ignore */
    }
  };

  const reassignAgent = async (agentId: string) => {
    if (!selectedId) return;
    try {
      await apiPut(`/api/conversations/${selectedId}`, { agentId });
      await fetchDetail(selectedId);
      setShowReassign(false);
      fetchConversations();
    } catch {
      /* ignore */
    }
  };

  const createConversation = async (form: {
    customerName: string;
    channel: string;
    customerPhone?: string;
  }) => {
    try {
      await apiPost('/api/conversations', form);
      setShowNewForm(false);
      fetchConversations();
    } catch {
      /* ignore */
    }
  };

  const statusFilters: { key: string; label: string }[] = [
    { key: '', label: 'Todos' },
    { key: 'open', label: 'Abertos' },
    { key: 'pending', label: 'Pendentes' },
    { key: 'closed', label: 'Fechados' },
  ];

  const channelFilters: { key: string; label: string; color?: string }[] = [
    { key: '', label: 'Todos' },
    { key: 'whatsapp', label: 'WhatsApp', color: CHANNEL_COLORS.whatsapp },
    { key: 'instagram', label: 'Instagram', color: CHANNEL_COLORS.instagram },
    { key: 'facebook', label: 'Facebook', color: CHANNEL_COLORS.facebook },
  ];

  return (
    <div className="flex -m-6" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Panel 1 - Conversation List */}
      <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white text-[12px] font-bold rounded-lg hover:bg-primary/90 transition-all"
            >
              <i className="fa-solid fa-plus text-[10px]" />
              Nova Conversa
            </button>
          </div>
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-heading placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-1.5 mt-3">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  statusFilter === f.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-paragraph hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2.5">
            {channelFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setChannelFilter(f.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  channelFilter === f.key
                    ? 'bg-heading text-white'
                    : 'bg-transparent text-paragraph hover:bg-gray-100'
                }`}
              >
                {f.color && (
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: f.color }}
                  />
                )}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {showNewForm && (
          <NewConversationForm onSubmit={createConversation} onCancel={() => setShowNewForm(false)} />
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <SkeletonList />
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-paragraph">
              <i className="fa-regular fa-comment-dots text-3xl text-gray-300 mb-2" />
              <p className="text-[13px]">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            conversations.map((c) => (
              <ConversationRow
                key={c.id}
                convo={c}
                isActive={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Panel 2 - Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5]">
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-paragraph">
            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
              <i className="fa-regular fa-comments text-4xl text-gray-300" />
            </div>
            <p className="text-[15px] font-heading font-bold text-heading">
              Selecione uma conversa
            </p>
            <p className="text-[13px] mt-1">
              Escolha uma conversa na lista para visualizar as mensagens
            </p>
          </div>
        ) : detailLoading && !detail ? (
          <div className="flex-1 flex items-center justify-center">
            <i className="fa-solid fa-spinner fa-spin text-primary text-2xl" />
          </div>
        ) : detail ? (
          <>
            <div className="bg-white px-5 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <AvatarCircle
                  initials={getInitials(detail.customerName)}
                  size={40}
                  channel={detail.channel}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-heading text-[14px]">
                      {detail.customerName}
                    </span>
                    {CHANNEL_COLORS[detail.channel] && (
                      <span
                        className="px-2 py-0.5 rounded-full text-white text-[9px] font-bold uppercase"
                        style={{ backgroundColor: CHANNEL_COLORS[detail.channel] }}
                      >
                        <i
                          className={`${CHANNEL_ICONS[detail.channel]} mr-1`}
                          style={{ fontSize: 9 }}
                        />
                        {detail.channel}
                      </span>
                    )}
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border"
                      style={{
                        color: STATUS_COLORS[detail.status] || '#9ca3af',
                        borderColor: STATUS_COLORS[detail.status] || '#9ca3af',
                      }}
                    >
                      {detail.status}
                    </span>
                  </div>
                  {detail.agent && (
                    <p className="text-[11px] text-paragraph mt-0.5">
                      Agente: {detail.agent.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {detail.status !== 'closed' && (
                  <button
                    onClick={() => updateStatus('closed')}
                    title="Fechar Conversa"
                    className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-medium text-paragraph hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <i className="fa-solid fa-circle-check text-xs" />
                    Fechar
                  </button>
                )}
                {detail.status === 'closed' && (
                  <button
                    onClick={() => updateStatus('open')}
                    title="Reabrir Conversa"
                    className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-medium text-paragraph hover:bg-green-50 hover:text-green-600 transition-all"
                  >
                    <i className="fa-solid fa-rotate-left text-xs" />
                    Reabrir
                  </button>
                )}
                {detail.status !== 'pending' && detail.status !== 'closed' && (
                  <button
                    onClick={() => updateStatus('pending')}
                    title="Marcar como Pendente"
                    className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px] font-medium text-paragraph hover:bg-amber-50 hover:text-amber-600 transition-all"
                  >
                    <i className="fa-solid fa-clock text-xs" />
                    Pendente
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {detail.messages.map((msg) => (
                <ChatBubble key={msg.id} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex gap-2 mb-3">
                {QUICK_REPLIES.map((qr) => (
                  <button
                    key={qr}
                    onClick={() => setMessageInput(qr)}
                    className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[11px] text-paragraph hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >
                    {qr}
                  </button>
                ))}
              </div>
              <div className="flex items-end gap-2">
                <button className="w-9 h-9 rounded-lg flex items-center justify-center text-paragraph hover:bg-gray-100 hover:text-heading transition-all flex-shrink-0">
                  <i className="fa-solid fa-paperclip text-[15px]" />
                </button>
                <textarea
                  placeholder="Digite uma mensagem..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  rows={1}
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-heading placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                  style={{ minHeight: 40, maxHeight: 120 }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sending}
                  className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 flex-shrink-0"
                >
                  {sending ? (
                    <i className="fa-solid fa-spinner fa-spin text-sm" />
                  ) : (
                    <i className="fa-solid fa-paper-plane text-sm" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Panel 3 - Customer Details */}
      <div className="w-[300px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto">
        {detail ? (
          <>
            <div className="p-5 border-b border-gray-100 flex flex-col items-center text-center">
              <AvatarCircle
                initials={getInitials(detail.customerName)}
                size={64}
                channel={detail.channel}
              />
              <h3 className="font-heading font-bold text-heading text-[16px] mt-3">
                {detail.customerName}
              </h3>
              {detail.customerEmail && (
                <p className="text-[12px] text-paragraph mt-0.5">{detail.customerEmail}</p>
              )}
              {detail.customerPhone && (
                <p className="text-[12px] text-paragraph">{detail.customerPhone}</p>
              )}
            </div>

            <div className="p-5 border-b border-gray-100">
              <h4 className="font-heading font-bold text-heading text-[12px] uppercase tracking-wider mb-2.5">
                Canal
              </h4>
              <div className="flex items-center gap-2">
                {CHANNEL_ICONS[detail.channel] && (
                  <i
                    className={CHANNEL_ICONS[detail.channel]}
                    style={{ color: CHANNEL_COLORS[detail.channel], fontSize: 16 }}
                  />
                )}
                <div>
                  <p className="text-[13px] text-heading font-medium capitalize">
                    {detail.channel}
                  </p>
                  {detail.customerPhone && (
                    <p className="text-[11px] text-paragraph">{detail.customerPhone}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 border-b border-gray-100">
              <h4 className="font-heading font-bold text-heading text-[12px] uppercase tracking-wider mb-2.5">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold bg-[#25D366]">
                  Portuguese
                </span>
                {detail.status === 'open' && (
                  <span className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold bg-[#1273eb]">
                    Active
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-heading font-bold text-heading text-[12px] uppercase tracking-wider">
                  Agente Atribuído
                </h4>
                <button
                  onClick={() => setShowReassign(!showReassign)}
                  className="text-[11px] text-primary font-medium hover:underline"
                >
                  Reatribuir
                </button>
              </div>
              {detail.agent ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[11px] font-bold font-heading">
                    {getInitials(detail.agent.name)}
                  </div>
                  <div>
                    <p className="text-[13px] text-heading font-medium">{detail.agent.name}</p>
                    <p className="text-[11px] text-paragraph capitalize">{detail.agent.role}</p>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-paragraph">Nenhum agente atribuído</p>
              )}
              {showReassign && (
                <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                  {agents.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => reassignAgent(a.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-all border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold">
                        {getInitials(a.name)}
                      </div>
                      <div>
                        <p className="text-[12px] text-heading font-medium">{a.name}</p>
                        <p className="text-[10px] text-paragraph capitalize">{a.role}</p>
                      </div>
                    </button>
                  ))}
                  {agents.length === 0 && (
                    <p className="px-3 py-2 text-[12px] text-paragraph">
                      Nenhum agente disponível
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 border-b border-gray-100">
              <h4 className="font-heading font-bold text-heading text-[12px] uppercase tracking-wider mb-2.5">
                Informações
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Criado', value: formatDate(detail.createdAt) },
                  {
                    label: 'Canal',
                    value: detail.channel.charAt(0).toUpperCase() + detail.channel.slice(1),
                  },
                  {
                    label: 'Status',
                    value: detail.status.charAt(0).toUpperCase() + detail.status.slice(1),
                  },
                  { label: 'Mensagens', value: String(detail.messages.length) },
                ].map((info) => (
                  <div key={info.label} className="flex justify-between">
                    <span className="text-[12px] text-paragraph">{info.label}</span>
                    <span className="text-[12px] text-heading font-medium">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              <h4 className="font-heading font-bold text-heading text-[12px] uppercase tracking-wider mb-2.5">
                Ações
              </h4>
              <div className="space-y-2">
                {detail.status !== 'closed' ? (
                  <button
                    onClick={() => updateStatus('closed')}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-500 text-[12px] font-medium rounded-lg hover:bg-red-50 transition-all"
                  >
                    <i className="fa-solid fa-circle-xmark text-[11px]" />
                    Fechar Conversa
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus('open')}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-green-200 text-green-600 text-[12px] font-medium rounded-lg hover:bg-green-50 transition-all"
                  >
                    <i className="fa-solid fa-rotate-left text-[11px]" />
                    Reabrir Conversa
                  </button>
                )}
                {detail.status !== 'pending' && detail.status !== 'closed' && (
                  <button
                    onClick={() => updateStatus('pending')}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-amber-200 text-amber-600 text-[12px] font-medium rounded-lg hover:bg-amber-50 transition-all"
                  >
                    <i className="fa-solid fa-clock text-[11px]" />
                    Marcar como Pendente
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-paragraph p-6">
            <i className="fa-regular fa-user text-3xl text-gray-300 mb-2" />
            <p className="text-[13px] text-center">
              Selecione uma conversa para ver os detalhes do cliente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
