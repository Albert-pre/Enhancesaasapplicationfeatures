import { useState, useMemo } from 'react';
import {
  Euro, FileText, Target, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Clock,
  CheckCircle2, Activity, ChevronRight, RefreshCw, Layers
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { useApp } from '../context/AppContext';
import { MONTHLY_REVENUE, formatCurrency, COMPANY_COLORS, MONTHS_FR } from '../data/mockData';
import { NavLink } from 'react-router';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1b38] text-white rounded-xl p-3 shadow-xl border border-white/10 text-sm min-w-[180px]">
        <p className="text-slate-300 mb-2 text-xs" style={{ fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          entry.value != null && entry.value !== 0 && (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300 text-xs">{entry.name}</span>
              </div>
              <span className="text-xs" style={{ fontWeight: 600 }}>{formatCurrency(entry.value)}</span>
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

const STATUS_DOT: Record<string, string> = {
  'Actif': 'bg-emerald-500',
  'En attente': 'bg-amber-400',
  'Résilié': 'bg-red-500',
  'Suspendu': 'bg-slate-400',
};
const STATUS_BADGE: Record<string, string> = {
  'Actif': 'bg-emerald-50 text-emerald-700',
  'En attente': 'bg-amber-50 text-amber-700',
  'Résilié': 'bg-red-50 text-red-700',
  'Suspendu': 'bg-slate-100 text-slate-600',
};

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const { contracts, companies, totalRevenue, forecastRevenue, activeContractsCount, cashFlow, portfolioMetrics, renewalAlerts } = useApp();

  const yearData = MONTHLY_REVENUE.filter(d => d.annee === selectedYear);

  // Combine static historical data with contract-based cash flow
  const mainChartData = useMemo(() => {
    return yearData.map(d => {
      const cfEntry = cashFlow.find(cf => cf.year === selectedYear && MONTHS_FR[cf.month] === d.mois);
      const contractBased = cfEntry ? cfEntry.total : 0;
      return {
        mois: d.mois,
        'Réel': d.type === 'réel' ? d.montant : null,
        'Prévision': d.prevu,
        'Contrats': contractBased > 0 ? contractBased : null,
      };
    });
  }, [yearData, cashFlow, selectedYear]);

  // Next 6 months cash flow (upcoming payments)
  const upcomingCashFlow = useMemo(() => {
    const now = new Date();
    return cashFlow
      .filter(cf => {
        const cfDate = new Date(cf.year, cf.month, 1);
        const diff = (cfDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return diff >= 0 && diff <= 6;
      })
      .slice(0, 6);
  }, [cashFlow]);

  // Company breakdown
  const companyBreakdown = useMemo(() => {
    return companies
      .filter(c => c.actif)
      .map(company => {
        const total = contracts
          .filter(c => c.compagnie === company.nom && c.statut === 'Actif')
          .reduce((sum, c) => sum + c.commissionN, 0);
        const count = contracts.filter(c => c.compagnie === company.nom && c.statut === 'Actif').length;
        return { name: company.nom, value: total, color: COMPANY_COLORS[company.nom] || company.couleur, count };
      })
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [contracts, companies]);

  // Product breakdown
  const productBreakdown = [
    { name: 'Santé',      value: contracts.filter(c => c.categorie === 'Santé').reduce((s, c) => s + c.commissionN, 0),      color: '#2563eb' },
    { name: 'Prévoyance', value: contracts.filter(c => c.categorie === 'Prévoyance').reduce((s, c) => s + c.commissionN, 0), color: '#7c3aed' },
    { name: 'Obsèques',   value: contracts.filter(c => c.categorie === 'Obsèques').reduce((s, c) => s + c.commissionN, 0),   color: '#0891b2' },
    { name: 'Animaux',    value: contracts.filter(c => c.categorie === 'Animaux').reduce((s, c) => s + c.commissionN, 0),    color: '#f59e0b' },
  ].filter(p => p.value > 0);

  const recentContracts = [...contracts].slice(0, 6);

  const prevYear2025Total = MONTHLY_REVENUE.filter(d => d.annee === 2025).reduce((s, d) => s + d.montant, 0);
  const currentReal = MONTHLY_REVENUE.filter(d => d.annee === 2026 && d.type === 'réel').reduce((s, d) => s + d.montant, 0);

  const totalN1 = contracts.reduce((s, c) => s + c.commissionN1, 0);
  const pipeline = contracts.filter(c => c.statut === 'En attente').reduce((s, c) => s + c.commissionN, 0);

  const kpis = [
    {
      label: 'Commissions Actives',
      value: formatCurrency(totalRevenue),
      change: '+18.4%',
      positive: true,
      icon: Euro,
      gradient: 'from-blue-500 to-blue-700',
      sub: `${activeContractsCount} contrats actifs`,
    },
    {
      label: 'Prévisions N+1',
      value: formatCurrency(totalN1),
      change: '+22.1%',
      positive: true,
      icon: TrendingUp,
      gradient: 'from-violet-500 to-violet-700',
      sub: 'Renouvellements attendus',
    },
    {
      label: 'Pipeline En attente',
      value: formatCurrency(pipeline),
      change: `${contracts.filter(c => c.statut === 'En attente').length} dossiers`,
      positive: true,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      sub: 'À valider',
    },
    {
      label: 'Taux de Renouvellement',
      value: `${portfolioMetrics.renewalRate}%`,
      change: '-2.3%',
      positive: false,
      icon: RefreshCw,
      gradient: 'from-emerald-500 to-teal-600',
      sub: 'Objectif 90%',
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-800" style={{ fontSize: 20, fontWeight: 700 }}>Vue d'ensemble</h2>
          <p className="text-slate-500 text-sm mt-0.5">Tableau de bord — <span style={{ fontWeight: 600 }}>Mars 2026</span></p>
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
        </div>
      </div>

      {/* Renewal Alert Banner */}
      {renewalAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-amber-800" style={{ fontWeight: 600 }}>
              {renewalAlerts.length} contrat{renewalAlerts.length > 1 ? 's' : ''} arrivent à renouvellement dans les 3 mois
            </p>
            <p className="text-xs text-amber-600 mt-0.5 truncate">
              {renewalAlerts.slice(0, 3).map(a => `${a.prenom} ${a.nom} (${a.moisRestants === 0 ? 'ce mois' : `${a.moisRestants} mois`})`).join(' · ')}
            </p>
          </div>
          <NavLink to="/contrats" className="text-xs text-amber-700 hover:underline flex-shrink-0" style={{ fontWeight: 600 }}>
            Voir →
          </NavLink>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${kpi.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`} style={{ fontWeight: 500 }}>
                  {kpi.positive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-2xl text-slate-800" style={{ fontWeight: 800 }}>{kpi.value}</p>
              <p className="text-sm text-slate-600 mt-1" style={{ fontWeight: 500 }}>{kpi.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Revenus Mensuels {selectedYear}</h3>
              <p className="text-slate-400 text-xs mt-0.5">Réalisé · Prévisions · Projection contrats</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <div className="w-3 h-1 bg-blue-500 rounded" />Réel
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <div className="w-3 h-1 bg-amber-400 rounded" style={{ borderTop: '2px dashed #f59e0b', background: 'none', height: 0 }} />Prévision
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={mainChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gradReel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPrevu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k€` : ''} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Réel" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradReel)" dot={{ r: 3, fill: '#2563eb' }} connectNulls={false} />
              <Area type="monotone" dataKey="Prévision" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" fill="url(#gradPrevu)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Company Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="mb-4">
            <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Répartition Compagnies</h3>
            <p className="text-slate-400 text-xs mt-0.5">Commissions actives</p>
          </div>
          {companyBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={companyBreakdown} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value">
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
                  const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
                  return (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-slate-600 truncate">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                        </div>
                        <span className="text-xs text-slate-500 w-8 text-right" style={{ fontWeight: 600 }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Upcoming Cash Flow + Portfolio + Recent Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Cash Flow — KEY PRO FEATURE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Flux de trésorerie</h3>
              <p className="text-slate-400 text-xs">6 prochains mois · Basé sur vos contrats</p>
            </div>
          </div>
          <div className="space-y-2">
            {upcomingCashFlow.map((cf, i) => {
              const maxTotal = Math.max(...upcomingCashFlow.map(c => c.total), 1);
              const pct = (cf.total / maxTotal) * 100;
              const isHighest = cf.total === maxTotal;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500" style={{ fontWeight: 500 }}>{cf.label}</span>
                    <div className="text-right">
                      <span className="text-xs text-slate-800" style={{ fontWeight: 700 }}>{formatCurrency(cf.total)}</span>
                      {isHighest && <span className="ml-1 text-xs text-blue-500">↑</span>}
                    </div>
                  </div>
                  <div className="h-5 bg-slate-100 rounded-lg overflow-hidden flex">
                    {cf.commissionPrincipale > 0 && (
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(cf.commissionPrincipale / maxTotal) * 100}%` }}
                        title={`Principale: ${formatCurrency(cf.commissionPrincipale)}`}
                      />
                    )}
                    {cf.commissionSecondaire > 0 && (
                      <div
                        className="h-full bg-violet-400 transition-all duration-500"
                        style={{ width: `${(cf.commissionSecondaire / maxTotal) * 100}%` }}
                        title={`Secondaire: ${formatCurrency(cf.commissionSecondaire)}`}
                      />
                    )}
                    {cf.commissionN1 > 0 && (
                      <div
                        className="h-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${(cf.commissionN1 / maxTotal) * 100}%` }}
                        title={`N+1: ${formatCurrency(cf.commissionN1)}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1 text-xs text-slate-400"><div className="w-2 h-2 bg-blue-500 rounded" />Principale</span>
            <span className="flex items-center gap-1 text-xs text-slate-400"><div className="w-2 h-2 bg-violet-400 rounded" />Secondaire</span>
            <span className="flex items-center gap-1 text-xs text-slate-400"><div className="w-2 h-2 bg-emerald-400 rounded" />N+1</span>
          </div>
        </div>

        {/* Portfolio + Product */}
        <div className="space-y-4">
          {/* Portfolio Health */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Layers size={14} className="text-emerald-600" />
              </div>
              <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Santé Portefeuille</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Prime moyenne', value: formatCurrency(portfolioMetrics.primeMoyenne), color: 'text-slate-800' },
                { label: 'Taux moy. portefeuille', value: `${portfolioMetrics.tauxMoyenPortefeuille.toFixed(1)}%`, color: 'text-blue-600' },
                { label: 'Concentration max', value: `${portfolioMetrics.concentrationMax.toFixed(0)}%`, color: portfolioMetrics.concentrationMax > 50 ? 'text-amber-600' : 'text-emerald-600' },
                { label: 'Taux renouvellement', value: `${portfolioMetrics.renewalRate}%`, color: 'text-slate-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={`text-sm ${color}`} style={{ fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Mix */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
            <h3 className="text-slate-800 mb-3" style={{ fontWeight: 700 }}>Mix Produits</h3>
            <div className="space-y-2">
              {productBreakdown.map((item, i) => {
                const total = productBreakdown.reduce((s, p) => s + p.value, 0);
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">{item.name}</span>
                      <span style={{ fontWeight: 700, color: item.color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Derniers Contrats</h3>
            <NavLink to="/contrats" className="text-xs text-blue-600 hover:underline" style={{ fontWeight: 600 }}>
              Tout voir →
            </NavLink>
          </div>
          <div className="space-y-2.5">
            {recentContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: COMPANY_COLORS[contract.compagnie] || '#64748b', fontSize: 9, fontWeight: 800 }}
                  >
                    {contract.compagnie.substring(0, 3)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-800 truncate" style={{ fontWeight: 600 }}>{contract.prenom} {contract.nom}</p>
                    <p className="text-xs text-slate-400 truncate">{contract.produit}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-blue-600" style={{ fontWeight: 700 }}>{formatCurrency(contract.commissionN)}</p>
                  <div className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_BADGE[contract.statut]}`} style={{ fontWeight: 500 }}>
                    {contract.statut}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Annual Forecast BarChart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Prévisions Annuelles {selectedYear}</h3>
            <p className="text-slate-400 text-xs mt-0.5">Réalisé vs objectif — projection mensuelle</p>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-xs text-slate-400">Objectif annuel</p>
              <p className="text-lg text-slate-800" style={{ fontWeight: 700 }}>
                {formatCurrency(yearData.reduce((s, d) => s + d.prevu, 0))}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Réalisé YTD</p>
              <p className="text-lg text-blue-600" style={{ fontWeight: 700 }}>
                {formatCurrency(yearData.filter(d => d.type === 'réel').reduce((s, d) => s + d.montant, 0))}
              </p>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mainChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k€` : ''} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Réel" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={38} />
            <Bar dataKey="Prévision" fill="#dbeafe" radius={[4, 4, 0, 0]} maxBarSize={38} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
