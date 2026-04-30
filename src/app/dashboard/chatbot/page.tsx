'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

interface Rule {
  id: string;
  keyword: string;
  response: string;
  active: boolean;
}

export default function ChatbotPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [response, setResponse] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchRules = async () => {
    try {
      const data = await apiGet<Rule[]>('/chatbot/rules');
      setRules(data);
    } catch { /* empty */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleSubmit = async () => {
    if (!keyword.trim() || !response.trim()) return;
    try {
      if (editId) {
        await apiPut(`/chatbot/rules/${editId}`, { keyword, response });
      } else {
        await apiPost('/chatbot/rules', { keyword, response });
      }
      setKeyword('');
      setResponse('');
      setEditId(null);
      setShowForm(false);
      fetchRules();
    } catch { /* empty */ }
  };

  const handleToggle = async (rule: Rule) => {
    await apiPut(`/chatbot/rules/${rule.id}`, { active: !rule.active });
    fetchRules();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rule?')) return;
    await apiDelete(`/chatbot/rules/${id}`);
    fetchRules();
  };

  const handleTest = () => {
    if (!testInput.trim()) { setTestResult(null); return; }
    const lower = testInput.toLowerCase();
    const match = rules.find((r) => r.active && r.keyword.toLowerCase().split(',').map((k) => k.trim()).some((kw) => lower.includes(kw)));
    setTestResult(match ? match.response : 'No matching rule found.');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><i className="fas fa-spinner fa-spin text-primary text-2xl"></i></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-heading">Chatbot Rules</h1>
          <p className="text-paragraph text-sm mt-1">Configure automatic responses for your customers</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setKeyword(''); setResponse(''); }} className="bg-primary text-white px-6 py-3 rounded-pill font-bold text-sm hover:bg-primary/90 transition-all">
          <i className="fas fa-plus mr-2"></i>Add Rule
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4 text-sm text-blue-800">
        <i className="fas fa-info-circle mr-2"></i>
        The chatbot automatically replies when a customer message contains any configured keywords. Separate multiple keywords with commas.
      </div>

      {showForm && (
        <div className="bg-white rounded-[10px] shadow-card p-6">
          <h3 className="font-bold font-heading text-heading mb-4">{editId ? 'Edit Rule' : 'New Rule'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-heading mb-1">Keywords (comma-separated)</label>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="olá, oi, bom dia" className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-heading mb-1">Auto Response</label>
              <textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Type the automatic response..." rows={3} className="w-full border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSubmit} className="bg-primary text-white px-6 py-2 rounded-pill font-bold text-sm">
                {editId ? 'Update' : 'Save Rule'}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="border border-gray-300 text-heading px-6 py-2 rounded-pill font-bold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="bg-white rounded-[10px] shadow-card p-12 text-center">
            <i className="fas fa-robot text-4xl text-gray-300 mb-4"></i>
            <p className="text-paragraph">No chatbot rules configured yet. Add your first rule to get started!</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className={`bg-white rounded-[10px] shadow-card p-5 flex items-start justify-between gap-4 ${!rule.active ? 'opacity-60' : ''}`}>
              <div className="flex-1">
                <div className="flex flex-wrap gap-1 mb-2">
                  {rule.keyword.split(',').map((kw, i) => (
                    <span key={i} className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">{kw.trim()}</span>
                  ))}
                </div>
                <p className="text-paragraph text-sm">{rule.response}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleToggle(rule)} className={`w-12 h-6 rounded-full relative transition-colors ${rule.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${rule.active ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
                <button onClick={() => { setEditId(rule.id); setKeyword(rule.keyword); setResponse(rule.response); setShowForm(true); }} className="text-gray-400 hover:text-primary transition-colors p-1">
                  <i className="fas fa-edit"></i>
                </button>
                <button onClick={() => handleDelete(rule.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-[10px] shadow-card p-6">
        <h3 className="font-bold font-heading text-heading mb-4"><i className="fas fa-flask mr-2 text-primary"></i>Test Chatbot</h3>
        <div className="flex gap-3">
          <input value={testInput} onChange={(e) => setTestInput(e.target.value)} placeholder="Type a test message..." className="flex-1 border border-gray-200 rounded-md px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          <button onClick={handleTest} className="bg-primary text-white px-6 py-3 rounded-pill font-bold text-sm">Test</button>
        </div>
        {testResult && (
          <div className="mt-3 bg-gray-50 rounded-md p-4 text-sm">
            <i className="fas fa-robot text-primary mr-2"></i>{testResult}
          </div>
        )}
      </div>
    </div>
  );
}
