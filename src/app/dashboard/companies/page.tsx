'use client';

import { useState } from 'react';

const companies = [
  { name: 'TechBrasil Soluções', initials: 'TB', color: '#1273eb', plan: 'Enterprise', planColor: 'bg-primary text-white', status: 'Active', agents: 45, messages: 12400, channels: 3 },
  { name: 'Nova Energia LTDA', initials: 'NE', color: '#10b981', plan: 'Professional', planColor: 'bg-emerald-100 text-emerald-700', status: 'Active', agents: 28, messages: 8750, channels: 2 },
  { name: 'Grupo Estrela Digital', initials: 'GE', color: '#8b5cf6', plan: 'Enterprise', planColor: 'bg-primary text-white', status: 'Active', agents: 62, messages: 21300, channels: 3 },
  { name: 'Sabor & Arte Gastronomia', initials: 'SA', color: '#f59e0b', plan: 'Starter', planColor: 'bg-amber-100 text-amber-700', status: 'Inactive', agents: 5, messages: 1200, channels: 1 },
  { name: 'Construtora Horizonte', initials: 'CH', color: '#ef4444', plan: 'Professional', planColor: 'bg-emerald-100 text-emerald-700', status: 'Active', agents: 18, messages: 5600, channels: 2 },
  { name: 'Educação Conecta Brasil', initials: 'EC', color: '#06b6d4', plan: 'Starter', planColor: 'bg-amber-100 text-amber-700', status: 'Active', agents: 8, messages: 3100, channels: 1 },
];

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');

  const filtered = companies.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchPlan = planFilter === 'All' || c.plan === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold text-heading">Companies</h2>
        <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors">
          <i className="fas fa-plus text-xs" />
          Add Company
        </button>
      </div>

      <div className="bg-white rounded-[10px] shadow-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-sm text-heading placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="h-10 px-4 rounded-lg border border-gray-200 text-sm text-heading bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option>All</option>
            <option>Starter</option>
            <option>Professional</option>
            <option>Enterprise</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((company) => (
          <div key={company.name} className="bg-white rounded-[10px] shadow-card p-6">
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${company.color}15` }}
              >
                <span className="text-base font-bold" style={{ color: company.color }}>
                  {company.initials}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-heading font-bold text-heading truncate">
                  {company.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${company.planColor}`}>
                    {company.plan}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      company.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {company.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-lg font-bold text-heading">{company.agents}</p>
                <p className="text-[11px] text-paragraph">Agents</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-heading">{company.messages.toLocaleString()}</p>
                <p className="text-[11px] text-paragraph">Messages</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-heading">{company.channels}</p>
                <p className="text-[11px] text-paragraph">Channels</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
              <button className="flex-1 h-9 text-xs font-semibold text-primary border border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all duration-200">
                View
              </button>
              <button className="flex-1 h-9 text-xs font-semibold text-heading border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Edit
              </button>
              <button
                className={`h-9 px-3 text-xs font-semibold rounded-lg transition-colors ${
                  company.status === 'Active'
                    ? 'text-red-500 border border-red-200 hover:bg-red-50'
                    : 'text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <i className={`fas ${company.status === 'Active' ? 'fa-ban' : 'fa-check'}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-paragraph">
          Showing {filtered.length} of {companies.length} companies
        </p>
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-paragraph hover:bg-gray-50 transition-colors">
            <i className="fas fa-chevron-left text-xs" />
          </button>
          <button className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-semibold">
            1
          </button>
          <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-paragraph hover:bg-gray-50 transition-colors">
            2
          </button>
          <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-paragraph hover:bg-gray-50 transition-colors">
            3
          </button>
          <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-paragraph hover:bg-gray-50 transition-colors">
            <i className="fas fa-chevron-right text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
