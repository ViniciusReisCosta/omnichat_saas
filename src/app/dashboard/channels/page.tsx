'use client';

const connectedChannels = [
  {
    name: 'WhatsApp Business',
    icon: 'fab fa-whatsapp',
    color: '#25D366',
    connected: true,
    detail: '+55 (11) 99876-5432',
    sent: 8420,
    received: 11230,
  },
  {
    name: 'Instagram DM',
    icon: 'fab fa-instagram',
    color: '#E4405F',
    connected: true,
    detail: '@cberhunt.br',
    sent: 3200,
    received: 5100,
  },
  {
    name: 'Facebook Messenger',
    icon: 'fab fa-facebook-messenger',
    color: '#1877F2',
    connected: false,
    detail: 'Not connected',
    sent: 0,
    received: 0,
  },
];

const futureChannels = [
  { name: 'Telegram', icon: 'fab fa-telegram', color: '#0088cc' },
  { name: 'Email', icon: 'fas fa-envelope', color: '#6366f1' },
  { name: 'SMS', icon: 'fas fa-sms', color: '#f59e0b' },
];

export default function ChannelsPage() {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-heading font-bold text-heading">Connected Channels</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {connectedChannels.map((ch) => (
          <div key={ch.name} className="bg-white rounded-[10px] shadow-card overflow-hidden">
            <div className="h-2" style={{ backgroundColor: ch.color }} />
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${ch.color}15` }}
                >
                  <i className={`${ch.icon} text-2xl`} style={{ color: ch.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-heading font-bold text-heading">{ch.name}</h3>
                  <p className="text-xs text-paragraph mt-0.5">{ch.detail}</p>
                </div>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    ch.connected
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {ch.connected ? 'Connected' : 'Not Connected'}
                </span>
              </div>

              {ch.connected ? (
                <>
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-paragraph mb-1">Messages Sent</p>
                      <p className="text-xl font-bold text-heading">{ch.sent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-paragraph mb-1">Messages Received</p>
                      <p className="text-xl font-bold text-heading">{ch.received.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <button className="flex-1 h-10 text-sm font-semibold text-heading border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <i className="fas fa-cog mr-2 text-xs" />
                      Configure
                    </button>
                    <button className="flex-1 h-10 text-sm font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                      <i className="fas fa-unlink mr-2 text-xs" />
                      Disconnect
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    className="w-full h-11 text-sm font-bold text-white rounded-lg transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: ch.color }}
                  >
                    <i className="fas fa-link mr-2 text-xs" />
                    Connect {ch.name}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-heading font-bold text-heading mb-4">Available Integrations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {futureChannels.map((ch) => (
            <div
              key={ch.name}
              className="bg-white rounded-[10px] shadow-card p-5 flex items-center gap-4 opacity-70"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${ch.color}15` }}
              >
                <i className={`${ch.icon} text-lg`} style={{ color: ch.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-heading font-bold text-heading">{ch.name}</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
