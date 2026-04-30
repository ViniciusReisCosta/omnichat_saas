'use client';

import { useState } from 'react';

const tabs = ['General', 'Notifications', 'Billing', 'API'];

const businessHours = [
  { day: 'Monday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Tuesday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Wednesday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Thursday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Friday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Saturday', enabled: false, start: '09:00', end: '13:00' },
  { day: 'Sunday', enabled: false, start: '', end: '' },
];

const notifications = [
  { label: 'Email notifications', description: 'Receive email for important updates', enabled: true },
  { label: 'Push notifications', description: 'Browser push notifications', enabled: true },
  { label: 'New message alerts', description: 'Alert when new messages arrive', enabled: true },
  { label: 'Assignment alerts', description: 'Notify when conversations are assigned', enabled: false },
  { label: 'Payment reminders', description: 'Billing and payment due notifications', enabled: true },
];

const billingHistory = [
  { date: '01/04/2025', description: 'Enterprise Plan - Monthly', amount: 'R$ 899,00', status: 'Paid' },
  { date: '01/03/2025', description: 'Enterprise Plan - Monthly', amount: 'R$ 899,00', status: 'Paid' },
  { date: '01/02/2025', description: 'Enterprise Plan - Monthly', amount: 'R$ 899,00', status: 'Paid' },
  { date: '15/01/2025', description: 'Additional Agents (5)', amount: 'R$ 245,00', status: 'Paid' },
  { date: '01/01/2025', description: 'Enterprise Plan - Monthly', amount: 'R$ 899,00', status: 'Paid' },
];

function Toggle({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        on ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

function GeneralTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] shadow-card p-6">
        <h3 className="text-base font-heading font-bold text-heading mb-5">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Company Name</label>
            <input
              type="text"
              defaultValue="OmniConnect Brasil"
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Email</label>
            <input
              type="email"
              defaultValue="admin@omniconnect.com.br"
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Phone</label>
            <input
              type="tel"
              defaultValue="+55 (11) 3456-7890"
              className="w-full h-11 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-1.5">Address</label>
            <textarea
              defaultValue="Av. Paulista, 1234 - Bela Vista, São Paulo - SP, 01310-100"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-heading resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button className="px-8 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[10px] shadow-card p-6">
        <h3 className="text-base font-heading font-bold text-heading mb-5">Business Hours</h3>
        <div className="space-y-3">
          {businessHours.map((bh) => (
            <div key={bh.day} className="flex items-center gap-4 py-2">
              <div className="w-28">
                <span className="text-sm font-medium text-heading">{bh.day}</span>
              </div>
              <Toggle enabled={bh.enabled} />
              {bh.enabled ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    defaultValue={bh.start}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <span className="text-sm text-paragraph">to</span>
                  <input
                    type="time"
                    defaultValue={bh.end}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              ) : (
                <span className="text-sm text-paragraph">Closed</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="bg-white rounded-[10px] shadow-card p-6">
      <h3 className="text-base font-heading font-bold text-heading mb-5">Notification Preferences</h3>
      <div className="space-y-1">
        {notifications.map((n) => (
          <div key={n.label} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-heading">{n.label}</p>
              <p className="text-xs text-paragraph mt-0.5">{n.description}</p>
            </div>
            <Toggle enabled={n.enabled} />
          </div>
        ))}
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-4">Current Plan</h3>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-heading font-bold text-heading">R$ 899</span>
            <span className="text-sm text-paragraph">/month</span>
          </div>
          <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary mb-4">
            Enterprise
          </span>
          <p className="text-sm text-paragraph mb-5">Renewal date: May 1, 2025</p>
          <button className="w-full h-11 text-sm font-semibold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200">
            Upgrade Plan
          </button>
        </div>

        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="text-base font-heading font-bold text-heading mb-4">Payment Method</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-8 rounded bg-gray-100 flex items-center justify-center">
              <i className="fab fa-cc-visa text-xl text-[#1a1f71]" />
            </div>
            <div>
              <p className="text-sm font-medium text-heading">**** **** **** 4242</p>
              <p className="text-xs text-paragraph">Expires 12/2026</p>
            </div>
          </div>
          <button className="w-full h-11 text-sm font-semibold text-heading border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Update Payment Method
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[10px] shadow-card">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-heading font-bold text-heading">Billing History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8f9fb]">
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-paragraph uppercase tracking-wider px-6 py-3">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-[#f8f9fb] transition-colors">
                  <td className="px-6 py-4 text-sm text-paragraph">{item.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-heading">{item.description}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-heading">{item.amount}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary text-sm font-medium hover:underline">
                      <i className="fas fa-download mr-1 text-xs" />
                      PDF
                    </button>
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

function APITab() {
  const [showKey, setShowKey] = useState(false);
  const apiKey = 'sk_live_omni_7f3a9b2c4d5e6f1a8b9c0d1e2f3a4b5c';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[10px] shadow-card p-6">
        <h3 className="text-base font-heading font-bold text-heading mb-5">API Key</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-11 px-4 rounded-lg bg-[#f0f2f5] flex items-center">
            <code className="text-sm text-heading">
              {showKey ? apiKey : '••••••••••••••••••••••••••••••••••••'}
            </code>
          </div>
          <button
            onClick={() => setShowKey(!showKey)}
            className="h-11 px-4 rounded-lg border border-gray-200 text-sm text-heading hover:bg-gray-50 transition-colors"
          >
            <i className={`fas ${showKey ? 'fa-eye-slash' : 'fa-eye'} mr-2 text-xs`} />
            {showKey ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={() => navigator.clipboard?.writeText(apiKey)}
            className="h-11 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <i className="fas fa-copy mr-2 text-xs" />
            Copy
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[10px] shadow-card p-6">
        <h3 className="text-base font-heading font-bold text-heading mb-5">Webhook URL</h3>
        <div className="flex items-center gap-3">
          <input
            type="url"
            defaultValue="https://api.omniconnect.com.br/webhooks/v1"
            className="flex-1 h-11 px-4 rounded-lg border border-gray-200 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button className="h-11 px-6 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
            Save
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[10px] shadow-card p-6">
        <h3 className="text-base font-heading font-bold text-heading mb-5">API Usage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-[#f0f2f5]">
            <p className="text-xs text-paragraph mb-1">Requests Today</p>
            <p className="text-2xl font-heading font-bold text-heading">3,247</p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '32%' }} />
            </div>
            <p className="text-xs text-paragraph mt-1">32% of daily limit</p>
          </div>
          <div className="p-4 rounded-xl bg-[#f0f2f5]">
            <p className="text-xs text-paragraph mb-1">Requests This Month</p>
            <p className="text-2xl font-heading font-bold text-heading">87,412</p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '58%' }} />
            </div>
            <p className="text-xs text-paragraph mt-1">58% of monthly limit</p>
          </div>
          <div className="p-4 rounded-xl bg-[#f0f2f5]">
            <p className="text-xs text-paragraph mb-1">Avg Response Time</p>
            <p className="text-2xl font-heading font-bold text-heading">142ms</p>
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '14%' }} />
            </div>
            <p className="text-xs text-paragraph mt-1">Excellent</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold text-heading">Settings</h2>

      <div className="flex items-center gap-1 bg-white rounded-[10px] shadow-card p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'text-paragraph hover:text-heading hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'General' && <GeneralTab />}
      {activeTab === 'Notifications' && <NotificationsTab />}
      {activeTab === 'Billing' && <BillingTab />}
      {activeTab === 'API' && <APITab />}
    </div>
  );
}
