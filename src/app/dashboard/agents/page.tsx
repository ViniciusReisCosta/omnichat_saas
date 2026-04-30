'use client';

const agentStats = [
  { label: 'Total Agents', value: 24, icon: 'fas fa-users', color: '#1273eb' },
  { label: 'Online', value: 18, icon: 'fas fa-circle', color: '#10b981' },
  { label: 'Offline', value: 6, icon: 'fas fa-circle', color: '#9ca3af' },
];

const agents = [
  { name: 'João Santos', email: 'joao.santos@email.com', initials: 'JS', online: true, role: 'Admin', conversations: 42, avgResponse: '1m 23s' },
  { name: 'Maria Costa', email: 'maria.costa@email.com', initials: 'MC', online: true, role: 'Agent', conversations: 38, avgResponse: '2m 05s' },
  { name: 'Pedro Almeida', email: 'pedro.almeida@email.com', initials: 'PA', online: true, role: 'Agent', conversations: 31, avgResponse: '1m 45s' },
  { name: 'Ana Beatriz Souza', email: 'ana.souza@email.com', initials: 'AS', online: false, role: 'Agent', conversations: 0, avgResponse: '—' },
  { name: 'Carlos Eduardo Lima', email: 'carlos.lima@email.com', initials: 'CL', online: true, role: 'Admin', conversations: 27, avgResponse: '1m 10s' },
  { name: 'Fernanda Oliveira', email: 'fernanda.oliveira@email.com', initials: 'FO', online: true, role: 'Agent', conversations: 35, avgResponse: '2m 30s' },
  { name: 'Ricardo Mendes', email: 'ricardo.mendes@email.com', initials: 'RM', online: false, role: 'Agent', conversations: 0, avgResponse: '—' },
  { name: 'Isabela Rodrigues', email: 'isabela.rodrigues@email.com', initials: 'IR', online: true, role: 'Agent', conversations: 22, avgResponse: '1m 55s' },
];

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold text-heading">Team Agents</h2>
        <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          <i className="fas fa-user-plus text-xs" />
          Invite Agent
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {agentStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-[10px] shadow-card p-5 flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15` }}
            >
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
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Avg Response</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.email} className="border-b border-gray-50 hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">{agent.initials}</span>
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            agent.online ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">{agent.name}</p>
                        <p className="text-xs text-paragraph">{agent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        agent.online
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${agent.online ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {agent.online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        agent.role === 'Admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {agent.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-heading">{agent.conversations}</td>
                  <td className="px-6 py-4 text-sm text-paragraph">{agent.avgResponse}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-paragraph hover:text-primary hover:border-primary/30 transition-colors">
                        <i className="fas fa-pen text-xs" />
                      </button>
                      <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-paragraph hover:text-red-500 hover:border-red-200 transition-colors">
                        <i className="fas fa-trash text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
