import { useState, useMemo } from 'react';
import { Download, TrendingUp, TrendingDown, Calendar, Euro, Filter } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { useApp } from '../context/AppContext';
import { MONTHLY_REVENUE, formatCurrency } from '../data/mockData';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const MONTH_NAMES: Record<string, string> = {
  'Jan': 'Janvier', 'Fév': 'Février', 'Mar': 'Mars', 'Avr': 'Avril',
  'Mai': 'Mai', 'Jun': 'Juin', 'Jul': 'Juillet', 'Aoû': 'Août',
  'Sep': 'Septembre', 'Oct': 'Octobre', 'Nov': 'Novembre', 'Déc': 'Décembre'
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
            <span style={{ fontWeight: 600 }}>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(entry.value || 0)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Revenus() {
  const { contracts, companies } = useApp();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [filterCompany, setFilterCompany] = useState('');
  const [viewMode, setViewMode] = useState<'mensuel' | 'cumulatif'>('cumulatif');
  const [toggleView, setToggleView] = useState<'prevu' | 'reel' | 'tout'>('tout');

  const yearData = MONTHLY_REVENUE.filter(d => d.annee === selectedYear);

  const chartData = useMemo(() => {
    let cumulative = 0;
    let cumulativePrevu = 0;
    return yearData.map(d => {
      cumulative += d.type === 'réel' ? d.montant : 0;
      cumulativePrevu += d.prevu;
      return {
        mois: d.mois,
        'Réel': d.type === 'réel' ? d.montant : null,
        'Prévision': d.prevu,
        'Cumulatif réel': d.type === 'réel' ? cumulative : null,
        'Cumulatif prévu': cumulativePrevu,
        type: d.type,
      };
    });
  }, [yearData, selectedYear]);

  const totalReel = yearData.filter(d => d.type === 'réel').reduce((s, d) => s + d.montant, 0);
  const totalPrevu = yearData.reduce((s, d) => s + d.prevu, 0);
  const realMonths = yearData.filter(d => d.type === 'réel').length;
  const avgMensuel = realMonths > 0 ? totalReel / realMonths : 0;
  const bestMonth = yearData.filter(d => d.type === 'réel').reduce((best, d) => d.montant > best.montant ? d : best, { mois: '-', montant: 0 });
  const growth = selectedYear === 2026 ? 18.4 : 12.1;

  // Contract revenue by company
  const companyRevenue = companies.map(company => ({
    name: company.nom,
    color: company.couleur,
    commissionN: contracts.filter(c => c.compagnie === company.nom).reduce((s, c) => s + c.commissionN, 0),
    commissionN1: contracts.filter(c => c.compagnie === company.nom).reduce((s, c) => s + c.commissionN1, 0),
  })).filter(c => c.commissionN > 0 || c.commissionN1 > 0);

  // Monthly breakdown table
  const tableData = yearData.map(d => {
    const contractCommissions = contracts
      .filter(c => !filterCompany || c.compagnie === filterCompany)
      .filter(c => {
        const effectDate = new Date(c.dateEffet);
        return effectDate.getMonth() === MONTHS.indexOf(d.mois) && effectDate.getFullYear() === d.annee;
      })
      .reduce((s, c) => s + c.commissionN, 0);

    return {
      mois: d.mois,
      montantReel: d.type === 'réel' ? d.montant : 0,
      montantPrevu: d.prevu,
      contractCommissions,
      type: d.type,
    };
  });

  const handleExportCSV = () => {
    const csv = Papa.unparse(tableData.map(d => ({
      'Mois': MONTH_NAMES[d.mois] || d.mois,
      'Année': selectedYear,
      'Montant réel (€)': d.montantReel.toFixed(2),
      'Prévision (€)': d.montantPrevu.toFixed(2),
      'Type': d.montantReel > 0 ? 'Réel' : 'Prévu',
    })));
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `revenus_${selectedYear}.csv`;
    a.click();
    toast.success('Export CSV des revenus réalisé !');
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-800 text-xl" style={{ fontWeight: 700 }}>Suivi des Revenus</h2>
          <p className="text-slate-500 text-sm mt-0.5">Projections et historique des commissions</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none">
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none">
            <option value="">Toutes compagnies</option>
            {companies.filter(c => c.actif).map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
          </select>
          <button onClick={handleExportCSV} className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: `Réel ${selectedYear}`, value: formatCurrency(totalReel), sub: `${realMonths} mois`, icon: Euro, color: 'blue', trend: `+${growth}%` },
          { label: 'Prévision annuelle', value: formatCurrency(totalPrevu), sub: '12 mois', icon: TrendingUp, color: 'violet', trend: '+12%' },
          { label: 'Moyenne mensuelle', value: formatCurrency(avgMensuel), sub: 'Réel', icon: Calendar, color: 'emerald', trend: '+8%' },
          { label: 'Meilleur mois', value: formatCurrency(bestMonth.montant), sub: MONTH_NAMES[bestMonth.mois] || bestMonth.mois, icon: TrendingUp, color: 'amber', trend: '' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-${kpi.color}-50 flex items-center justify-center`}>
                  <Icon size={16} className={`text-${kpi.color}-600`} />
                </div>
                {kpi.trend && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                    {kpi.trend}
                  </span>
                )}
              </div>
              <p className="text-lg text-slate-800" style={{ fontWeight: 700 }}>{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5" style={{ fontWeight: 500 }}>{kpi.label}</p>
              <p className="text-xs text-slate-400">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Évolution des Revenus — {selectedYear}</h3>
            <p className="text-slate-400 text-xs mt-0.5">Commissions réelles et projections</p>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {(['mensuel', 'cumulatif'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${viewMode === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                style={{ fontWeight: 500 }}>
                {mode === 'mensuel' ? 'Mensuel' : 'Cumulatif'}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          {viewMode === 'cumulatif' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gradReel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPrevu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k€` : ''} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Cumulatif réel" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradReel)" dot={{ r: 3, fill: '#2563eb' }} connectNulls={false} />
              <Area type="monotone" dataKey="Cumulatif prévu" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" fill="url(#gradPrevu)" dot={false} />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k€` : ''} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Réel" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Prévision" fill="#dbeafe" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          )}
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-2 bg-blue-500 rounded" /> Réel
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-2 bg-blue-200 rounded" /> Prévision
          </span>
        </div>
      </div>

      {/* Company Revenue */}
      {companyRevenue.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <h3 className="text-slate-800 mb-4" style={{ fontWeight: 600 }}>Commissions par Compagnie</h3>
          <div className="space-y-3">
            {companyRevenue.map((company, i) => {
              const total = company.commissionN + company.commissionN1;
              const maxTotal = Math.max(...companyRevenue.map(c => c.commissionN + c.commissionN1));
              const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 flex-shrink-0">
                    <p className="text-sm text-slate-700 truncate" style={{ fontWeight: 500 }}>{company.name}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-1 h-8 rounded-lg overflow-hidden bg-slate-100">
                      <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${(company.commissionN / (maxTotal || 1)) * 100}%`, backgroundColor: company.color }} />
                      <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${(company.commissionN1 / (maxTotal || 1)) * 100}%`, backgroundColor: company.color, opacity: 0.4 }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm" style={{ fontWeight: 700, color: company.color }}>{formatCurrency(company.commissionN)}</p>
                    <p className="text-xs text-slate-400">+ {formatCurrency(company.commissionN1)} N+1</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Revenue Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Tableau Mensuel — {selectedYear}</h3>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
            {(['tout', 'reel', 'prevu'] as const).map(v => (
              <button key={v} onClick={() => setToggleView(v)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${toggleView === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                style={{ fontWeight: 500 }}>
                {v === 'tout' ? 'Tout' : v === 'reel' ? 'Réel' : 'Prévu'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Mois', 'Montant Réel', 'Prévision', 'Écart', 'Performance', 'Statut'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs text-slate-400 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableData
                .filter(d => toggleView === 'tout' ? true : toggleView === 'reel' ? d.montantReel > 0 : d.montantPrevu > 0)
                .map((d, i) => {
                const ecart = d.montantReel - d.montantPrevu;
                const performance = d.montantPrevu > 0 ? (d.montantReel / d.montantPrevu) * 100 : 0;
                const isReal = d.montantReel > 0;
                return (
                  <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${!isReal ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isReal ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{MONTH_NAMES[d.mois]}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ fontWeight: isReal ? 700 : 400, color: isReal ? '#1e40af' : '#94a3b8' }}>
                      {isReal ? formatCurrency(d.montantReel) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{formatCurrency(d.montantPrevu)}</td>
                    <td className="px-5 py-3.5 text-sm">
                      {isReal ? (
                        <span className={ecart >= 0 ? 'text-emerald-600' : 'text-red-500'} style={{ fontWeight: 500 }}>
                          {ecart >= 0 ? '+' : ''}{formatCurrency(ecart)}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      {isReal ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`h-full rounded-full ${performance >= 100 ? 'bg-emerald-500' : performance >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(performance, 100)}%` }} />
                          </div>
                          <span className="text-xs text-slate-600" style={{ fontWeight: 500 }}>{performance.toFixed(0)}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-2" />
                          <span className="text-xs text-slate-300">Prévu</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isReal ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`} style={{ fontWeight: 500 }}>
                        {isReal ? 'Réalisé' : 'Prévu'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-5 py-3 text-sm text-slate-600" style={{ fontWeight: 600 }}>TOTAL</td>
                <td className="px-5 py-3 text-sm text-blue-700" style={{ fontWeight: 700 }}>{formatCurrency(totalReel)}</td>
                <td className="px-5 py-3 text-sm text-slate-700" style={{ fontWeight: 700 }}>{formatCurrency(totalPrevu)}</td>
                <td className="px-5 py-3 text-sm" style={{ fontWeight: 600, color: totalReel - totalPrevu >= 0 ? '#059669' : '#dc2626' }}>
                  {totalReel - totalPrevu >= 0 ? '+' : ''}{formatCurrency(totalReel - totalPrevu)}
                </td>
                <td className="px-5 py-3" />
                <td className="px-5 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
