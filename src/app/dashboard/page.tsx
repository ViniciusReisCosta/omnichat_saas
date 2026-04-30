'use client';

const stats = [
  { label: 'Total Companies', value: '127', icon: 'fas fa-building', color: '#1273eb', change: '+12%' },
  { label: 'Active Agents', value: '843', icon: 'fas fa-users', color: '#10b981', change: '+8%' },
  { label: 'Messages Today', value: '12,459', icon: 'fas fa-comments', color: '#8b5cf6', change: '+23%' },
  { label: 'Revenue', value: 'R$ 45,200', icon: 'fas fa-dollar-sign', color: '#f59e0b', change: '+15%' },
];

const weeklyData = [
  { day: 'Mon', height: 60 },
  { day: 'Tue', height: 80 },
  { day: 'Wed', height: 45 },
  { day: 'Thu', height: 90 },
  { day: 'Fri', height: 70 },
  { day: 'Sat', height: 40 },
  { day: 'Sun', height: 55 },
];

const channels = [
  { name: 'WhatsApp', percent: 45, color: '#25D366' },
  { name: 'Instagram', percent: 30, color: '#E4405F' },
  { name: 'Facebook', percent: 25, color: '#1877F2' },
];

const conversations = [
  { customer: 'Ana Carolina Silva', channel: 'WhatsApp', channelColor: '#25D366', agent: 'João Santos', status: 'open', statusColor: 'bg-emerald-100 text-emerald-700', message: 'Olá, preciso de ajuda com meu pedido...', time: '2 min' },
  { customer: 'Rafael Oliveira', channel: 'Instagram', channelColor: '#E4405F', agent: 'Maria Costa', status: 'pending', statusColor: 'bg-amber-100 text-amber-700', message: 'Quando vai chegar minha encomenda?', time: '5 min' },
  { customer: 'Fernanda Lima', channel: 'Facebook', channelColor: '#1877F2', agent: 'Pedro Almeida', status: 'open', statusColor: 'bg-emerald-100 text-emerald-700', message: 'Vocês têm esse produto em estoque?', time: '8 min' },
  { customer: 'Lucas Mendes', channel: 'WhatsApp', channelColor: '#25D366', agent: 'Ana Beatriz', status: 'closed', statusColor: 'bg-gray-100 text-gray-600', message: 'Obrigado pelo atendimento!', time: '15 min' },
  { customer: 'Juliana Rocha', channel: 'Instagram', channelColor: '#E4405F', agent: 'João Santos', status: 'open', statusColor: 'bg-emerald-100 text-emerald-700', message: 'Qual o prazo de entrega para SP?', time: '22 min' },
  { customer: 'Bruno Ferreira', channel: 'WhatsApp', channelColor: '#25D366', agent: 'Maria Costa', status: 'pending', statusColor: 'bg-amber-100 text-amber-700', message: 'Gostaria de fazer uma troca...', time: '30 min' },
];

const agents = [
  { name: 'João Santos', online: true, messages: 42 },
  { name: 'Maria Costa', online: true, messages: 38 },
  { name: 'Pedro Almeida', online: true, messages: 31 },
  { name: 'Ana Beatriz', online: false, messages: 0 },
  { name: 'Carlos Eduardo', online: true, messages: 27 },
];

const quickActions = [
  { label: 'Add Company', icon: 'fas fa-building', href: '/dashboard/companies' },
  { label: 'Invite Agent', icon: 'fas fa-user-plus', href: '/dashboard/agents' },
  { label: 'Connect Channel', icon: 'fas fa-plug', href: '/dashboard/channels' },
  { label: 'View Reports', icon: 'fas fa-chart-bar', href: '/dashboard' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-[10px] shadow-card p-6 flex items-center gap-4"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <i className={`${stat.icon} text-xl`} style={{ color: stat.color }} />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-heading">{stat.value}</h3>
              <p className="text-sm text-paragraph">{stat.label}</p>
              <span
                className="text-xs font-semibold"
                style={{ color: stat.color }}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-6">Messages Overview</h3>
          <div className="flex items-end justify-between gap-3 h-48">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full relative flex items-end justify-center" style={{ height: 160 }}>
                  <div
                    className="w-full max-w-[40px] bg-primary rounded-t-md transition-all duration-500"
                    style={{ height: `${d.height}%` }}
                  />
                </div>
                <span className="text-xs text-paragraph">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-6">Channel Distribution</h3>
          <div className="space-y-5">
            {channels.map((ch) => (
              <div key={ch.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-heading">{ch.name}</span>
                  <span className="text-sm font-semibold" style={{ color: ch.color }}>
                    {ch.percent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${ch.percent}%`, backgroundColor: ch.color }}
                  />
                </div>
              </div>
            ))}
          </div>
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
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conv, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-heading">{conv.customer}</td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: conv.channelColor }}
                    >
                      {conv.channel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-paragraph">{conv.agent}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${conv.statusColor}`}>
                      {conv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-paragraph max-w-[200px] truncate">{conv.message}</td>
                  <td className="px-6 py-4 text-sm text-paragraph">{conv.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-4">Active Agents</h3>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f8f9fb] transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {agent.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      agent.online ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-heading truncate">{agent.name}</p>
                  <p className="text-xs text-paragraph">
                    {agent.online ? 'Online' : 'Offline'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-heading">{agent.messages}</span>
                <span className="text-xs text-paragraph">msgs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <i className={`${action.icon} text-primary text-lg`} />
                </div>
                <span className="text-sm font-medium text-heading">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
