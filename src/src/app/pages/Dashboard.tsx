import { useState } from 'react';
import {
  TrendingUp, TrendingDown, Euro, FileText, Users, Target,
  ArrowUpRight, ArrowDownRight, Calendar, Filter, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { MONTHLY_REVENUE, formatCurrency } from '../data/mockData';

const COMPANY_COLORS: Record<string, string> = {
  'ECA': '#2563eb',
  'ZENIOO': '#7c3aed',
  'HARMONIE MUTUELLE': '#059669',
  'APRIL': '#dc2626',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1f3d] text-white rounded-xl p-3 shadow-xl border border-white/10 text-sm">
        <p className="text-slate-300 mb-2" style={{ fontWeight: 500 }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300">{entry.name}:</span>
            <span style={{ fontWeight: 600 }}>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const { contracts, totalRevenue, forecastRevenue, activeContractsCount, companies } = useApp();

  const yearData = MONTHLY_REVENUE.filter(d => d.annee === selectedYear);

  const chartData = yearData.map(d => ({
    mois: d.mois,
    Réel: d.type === 'réel' ? d.montant : null,
    Prévision: d.prevu,
  }));

  // Company breakdown
  const companyBreakdown = companies
    .filter(c => c.actif)
    .map(company => {
      const total = contracts
        .filter(c => c.compagnie === company.nom && c.statut === 'Actif')
        .reduce((sum, c) => sum + c.commissionN, 0);
      return { name: company.nom, value: total, color: company.couleur };
    })
    .filter(c => c.value > 0);

  // Product breakdown
  const productBreakdown = [
    { name: 'Santé', value: contracts.filter(c => c.produit.toLowerCase().includes('sante') || c.produit === 'Santé').reduce((s, c) => s + c.commissionN, 0), color: '#2563eb' },
    { name: 'Prévoyance', value: contracts.filter(c => c.produit === 'Prévoyance').reduce((s, c) => s + c.commissionN, 0), color: '#7c3aed' },
    { name: 'Obsèques', value: contracts.filter(c => c.produit === 'Obsèques').reduce((s, c) => s + c.commissionN, 0), color: '#059669' },
    { name: 'Animaux', value: contracts.filter(c => c.produit === 'Animaux').reduce((s, c) => s + c.commissionN, 0), color: '#f59e0b' },
  ].filter(p => p.value > 0);

  const prevYearTotal = MONTHLY_REVENUE.filter(d => d.annee === 2025).reduce((s, d) => s + d.montant, 0);
  const currentYearReal = MONTHLY_REVENUE.filter(d => d.annee === 2026 && d.type === 'réel').reduce((s, d) => s + d.montant, 0);
  const growthRate = prevYearTotal > 0 ? ((currentYearReal - prevYearTotal / 4) / (prevYearTotal / 4)) * 100 : 0;

  const recentContracts = contracts.slice(0, 5);

  const kpis = [
    {
      label: 'Commissions Totales',
      value: formatCurrency(totalRevenue),
      change: '+18.4%',
      positive: true,
      icon: Euro,
      bg: 'from-blue-500 to-blue-600',
      sub: 'Contrats actifs',
    },
    {
      label: 'Prévisions Annuelles',
      value: formatCurrency(forecastRevenue),
      change: '+12.1%',
      positive: true,
      icon: Target,
      bg: 'from-violet-500 to-violet-600',
      sub: 'Toutes compagnies',
    },
    {
      label: 'Contrats Actifs',
      value: activeContractsCount.toString(),
      change: '+3',
      positive: true,
      icon: FileText,
      bg: 'from-emerald-500 to-emerald-600',
      sub: 'Ce mois-ci',
    },
    {
      label: 'Taux de Renouvellement',
      value: '87%',
      change: '-2.3%',
      positive: false,
      icon: RefreshCw,
      bg: 'from-amber-500 to-amber-600',
      sub: 'Objectif 90%',
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-800 text-xl" style={{ fontWeight: 700 }}>Vue d'ensemble</h2>
          <p className="text-slate-500 text-sm mt-0.5">Suivi de vos commissions en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <button className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={14} />
            <span className="hidden sm:inline">Filtres</span>
          </button>
          <button className="flex items-center gap-2 text-sm bg-blue-600 text-white rounded-xl px-3 py-2 hover:bg-blue-700 transition-colors">
            <Calendar size={14} />
            <span className="hidden sm:inline">Mars 2026</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${kpi.bg} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${kpi.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`} style={{ fontWeight: 500 }}>
                  {kpi.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-2xl text-slate-800" style={{ fontWeight: 700 }}>{kpi.value}</p>
              <p className="text-sm text-slate-500 mt-1" style={{ fontWeight: 500 }}>{kpi.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Revenus Mensuels {selectedYear}</h3>
              <p className="text-slate-400 text-xs mt-0.5">Réel vs Prévisions</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <div className="w-3 h-0.5 bg-blue-500 rounded" />
                Réel
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <div className="w-3 h-0.5 bg-amber-400 rounded border-dashed border-t" style={{ borderStyle: 'dashed' }} />
                Prévision
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="colorReel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPrevu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k€` : ''} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Réel" stroke="#2563eb" strokeWidth={2.5} fill="url(#colorReel)" dot={{ r: 3, fill: '#2563eb' }} connectNulls={false} />
              <Area type="monotone" dataKey="Prévision" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" fill="url(#colorPrevu)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Company Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="mb-5">
            <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Par Compagnie</h3>
            <p className="text-slate-400 text-xs mt-0.5">Répartition des commissions</p>
          </div>
          {companyBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={companyBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {companyBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {companyBreakdown.map((item, i) => {
                  const total = companyBreakdown.reduce((s, c) => s + c.value, 0);
                  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-slate-600 truncate max-w-[100px]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                        </div>
                        <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <h3 className="text-slate-800 mb-4" style={{ fontWeight: 600 }}>Par Produit</h3>
          <div className="space-y-3">
            {productBreakdown.map((item, i) => {
              const total = productBreakdown.reduce((s, p) => s + p.value, 0);
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.name}</span>
                    <span style={{ fontWeight: 600 }} className="text-slate-800">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent contracts */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Derniers Contrats</h3>
            <a href="/contrats" className="text-xs text-blue-600 hover:underline" style={{ fontWeight: 500 }}>Voir tout →</a>
          </div>
          <div className="space-y-3">
            {recentContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs"
                    style={{ backgroundColor: COMPANY_COLORS[contract.compagnie] || '#64748b', fontWeight: 700 }}
                  >
                    {contract.compagnie.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{contract.prenom} {contract.nom}</p>
                    <p className="text-xs text-slate-400">{contract.formule} · {contract.compagnie}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{formatCurrency(contract.commissionN)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    contract.statut === 'Actif' ? 'bg-emerald-50 text-emerald-700' :
                    contract.statut === 'En attente' ? 'bg-amber-50 text-amber-700' :
                    contract.statut === 'Résilié' ? 'bg-red-50 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`} style={{ fontWeight: 500 }}>
                    {contract.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forecast Bar Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Prévisions de Commissions — {selectedYear}</h3>
            <p className="text-slate-400 text-xs mt-0.5">Projection mensuelle des revenus</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total prévu</p>
            <p className="text-lg text-slate-800" style={{ fontWeight: 700 }}>
              {formatCurrency(yearData.reduce((s, d) => s + d.prevu, 0))}
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k€` : ''} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Réel" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Prévision" fill="#dbeafe" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
