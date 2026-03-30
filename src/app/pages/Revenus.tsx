import { useState, useMemo } from 'react';
import { Download, TrendingUp, Euro, Calendar, BarChart2, Activity, ArrowUpRight } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { useApp } from '../context/AppContext';
import { MONTHLY_REVENUE, formatCurrency, MONTHS_FR, COMPANY_COLORS } from '../data/mockData';

const MONTH_NAMES: Record<string, string> = {
  'Jan': 'Janvier', 'Fév': 'Février', 'Mar': 'Mars', 'Avr': 'Avril',
  'Mai': 'Mai', 'Jun': 'Juin', 'Jul': 'Juillet', 'Aoû': 'Août',
  'Sep': 'Septembre', 'Oct': 'Octobre', 'Nov': 'Novembre', 'Déc': 'Décembre'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1b38] text-white rounded-xl p-3 shadow-xl border border-white/10 text-sm min-w-[200px]">
        <p className="text-slate-300 mb-2 text-xs" style={{ fontWeight: 600 }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          entry.value != null && entry.value !== 0 && (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300 text-xs">{entry.name}</span>
              </div>
              <span className="text-xs" style={{ fontWeight: 700 }}>{formatCurrency(entry.value)}</span>
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

type ViewMode = 'mensuel' | 'cumulatif' | 'cashflow';
type YearFilter = 2025 | 2026;

export default function Revenus() {
  const { contracts, companies, cashFlow } = useApp();
  const [selectedYear, setSelectedYear] = useState<YearFilter>(2026);
  const [filterCompany, setFilterCompany] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('cumulatif');

  const yearData = MONTHLY_REVENUE.filter(d => d.annee === selectedYear);

  // ── Main Chart Data ──────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    let cumReal = 0;
    let cumPrevu = 0;
    return yearData.map(d => {
      cumReal += d.type === 'réel' ? d.montant : 0;
      cumPrevu += d.prevu;
      return {
        mois: d.mois,
        'Réel': d.type === 'réel' ? d.montant : null,
        'Prévision': d.prevu,
        'Cumulatif réel': d.type === 'réel' ? cumReal : null,
        'Cumulatif prévu': cumPrevu,
        type: d.type,
      };
    });
  }, [yearData]);

  // ── Cash Flow from contracts ─────────────────────────────────────────────────
  const cashFlowChartData = useMemo(() => {
    const yearEntries = cashFlow.filter(cf => cf.year === selectedYear);
    return yearEntries.map(cf => ({
      mois: MONTHS_FR[cf.month],
      'Principale': cf.commissionPrincipale,
      'Secondaire': cf.commissionSecondaire,
      'N+1': cf.commissionN1,
      'Total': cf.total,
    }));
  }, [cashFlow, selectedYear]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalReel = yearData.filter(d => d.type === 'réel').reduce((s, d) => s + d.montant, 0);
  const totalPrevu = yearData.reduce((s, d) => s + d.prevu, 0);
  const realMonths = yearData.filter(d => d.type === 'réel').length;
  const avgMensuel = realMonths > 0 ? totalReel / realMonths : 0;
  const bestMonth = yearData.filter(d => d.type === 'réel').reduce(
    (best, d) => d.montant > best.montant ? d : best, { mois: '-', montant: 0, annee: 2026, prevu: 0, type: 'réel' as const }
  );
  const tauxRealisation = totalPrevu > 0 ? (totalReel / (totalPrevu * (realMonths / 12))) * 100 : 0;

  // ── Company Revenue ──────────────────────────────────────────────────────────
  const companyRevenue = useMemo(() => {
    const filtered = filterCompany ? contracts.filter(c => c.compagnie === filterCompany) : contracts;
    return companies
      .map(company => ({
        name: company.nom,
        color: COMPANY_COLORS[company.nom] || company.couleur,
        commissionN: filtered.filter(c => c.compagnie === company.nom).reduce((s, c) => s + c.commissionN, 0),
        commissionN1: filtered.filter(c => c.compagnie === company.nom).reduce((s, c) => s + c.commissionN1, 0),
        nbContrats: filtered.filter(c => c.compagnie === company.nom && c.statut === 'Actif').length,
      }))
      .filter(c => c.commissionN > 0 || c.commissionN1 > 0)
      .sort((a, b) => b.commissionN - a.commissionN);
  }, [contracts, companies, filterCompany]);

  // ── Monthly Table ─────────────────────────────────────────────────────────────
  const tableData = useMemo(() => {
    return yearData.map(d => {
      const cfEntry = cashFlow.find(cf => cf.year === selectedYear && MONTHS_FR[cf.month] === d.mois);
      return {
        mois: d.mois,
        montantReel: d.type === 'réel' ? d.montant : 0,
        montantPrevu: d.prevu,
        commissionPrincipale: cfEntry?.commissionPrincipale ?? 0,
        commissionSecondaire: cfEntry?.commissionSecondaire ?? 0,
        commissionN1: cfEntry?.commissionN1 ?? 0,
        totalCF: cfEntry?.total ?? 0,
        type: d.type,
      };
    });
  }, [yearData, cashFlow, selectedYear]);

  const handleExportCSV = () => {
    const csv = Papa.unparse(tableData.map(d => ({
      'Mois': MONTH_NAMES[d.mois] || d.mois,
      'Année': selectedYear,
      'Montant réel (€)': d.montantReel.toFixed(2),
      'Prévision (€)': d.montantPrevu.toFixed(2),
      'Comm. Principale (€)': d.commissionPrincipale.toFixed(2),
      'Comm. Secondaire (€)': d.commissionSecondaire.toFixed(2),
      'Comm. N+1 (€)': d.commissionN1.toFixed(2),
      'Total flux (€)': d.totalCF.toFixed(2),
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
          <h2 className="text-slate-800" style={{ fontSize: 20, fontWeight: 700 }}>Suivi des Revenus</h2>
          <p className="text-slate-500 text-sm mt-0.5">Projections & flux de trésorerie basés sur vos contrats réels</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value) as YearFilter)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none">
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none">
            <option value="">Toutes compagnies</option>
            {companies.filter(c => c.actif).map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
          </select>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={14} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: `Réalisé ${selectedYear}`, value: formatCurrency(totalReel), icon: Euro, color: 'blue', trend: `${realMonths} mois` },
          { label: 'Objectif annuel', value: formatCurrency(totalPrevu), icon: TrendingUp, color: 'violet', trend: '+12% vs 2025' },
          { label: 'Moyenne mensuelle', value: formatCurrency(avgMensuel), icon: Calendar, color: 'emerald', trend: 'Réalisé' },
          { label: 'Taux de réalisation', value: `${tauxRealisation.toFixed(0)}%`, icon: BarChart2, color: tauxRealisation >= 100 ? 'emerald' : 'amber', trend: 'YTD proratisé' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          const colorMap: Record<string, string> = { blue: '#2563eb', violet: '#7c3aed', emerald: '#059669', amber: '#d97706' };
          return (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${colorMap[kpi.color]}15` }}>
                  <Icon size={16} style={{ color: colorMap[kpi.color] }} />
                </div>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                  {kpi.trend}
                </span>
              </div>
              <p className="text-xl text-slate-800" style={{ fontWeight: 800 }}>{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-0.5" style={{ fontWeight: 500 }}>{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Évolution des Revenus — {selectedYear}</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {viewMode === 'cashflow' ? 'Flux de commissions par type (données contrats)' : 'Commissions réelles et projections historiques'}
            </p>
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            {([
              { id: 'cumulatif' as ViewMode, label: 'Cumulatif' },
              { id: 'mensuel' as ViewMode, label: 'Mensuel' },
              { id: 'cashflow' as ViewMode, label: 'Cash-Flow' },
            ]).map(({ id, label }) => (
              <button key={id} onClick={() => setViewMode(id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${viewMode === id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                style={{ fontWeight: viewMode === id ? 600 : 400 }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          {viewMode === 'cashflow' ? (
            <BarChart data={cashFlowChartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(1)}k€` : ''} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span className="text-xs text-slate-600">{value}</span>} />
              <Bar dataKey="Principale" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={30} stackId="a" />
              <Bar dataKey="Secondaire" fill="#7c3aed" radius={[0, 0, 0, 0]} maxBarSize={30} stackId="a" />
              <Bar dataKey="N+1" fill="#059669" radius={[3, 3, 0, 0]} maxBarSize={30} stackId="a" />
            </BarChart>
          ) : viewMode === 'cumulatif' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="gradReelR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradPrevuR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k€` : ''} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Cumulatif réel" stroke="#2563eb" strokeWidth={2.5} fill="url(#gradReelR)" dot={{ r: 3, fill: '#2563eb' }} connectNulls={false} />
              <Area type="monotone" dataKey="Cumulatif prévu" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 3" fill="url(#gradPrevuR)" dot={false} />
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
          {viewMode === 'cashflow' ? (
            <>
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-2 bg-blue-500 rounded" /> Commission Principale</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-2 bg-violet-500 rounded" /> Commission Secondaire</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-2 bg-emerald-500 rounded" /> N+1</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-2 bg-blue-500 rounded" /> Réel</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-2 bg-blue-200 rounded" /> Prévision</span>
            </>
          )}
        </div>
      </div>

      {/* Company Revenue */}
      {companyRevenue.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
          <h3 className="text-slate-800 mb-5" style={{ fontWeight: 700 }}>Performance par Compagnie</h3>
          <div className="space-y-4">
            {companyRevenue.map((company, i) => {
              const totalAll = companyRevenue.reduce((s, c) => s + c.commissionN + c.commissionN1, 0);
              const companyTotal = company.commissionN + company.commissionN1;
              const pctWidth = totalAll > 0 ? (companyTotal / totalAll) * 100 : 0;
              const nPct = companyTotal > 0 ? (company.commissionN / companyTotal) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-36">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: company.color }} />
                      <p className="text-sm text-slate-700 truncate" style={{ fontWeight: 600 }}>{company.name}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 pl-5">{company.nbContrats} contrat{company.nbContrats > 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-slate-100 rounded-xl overflow-hidden flex">
                      <div
                        className="h-full rounded-xl transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${(company.commissionN / (totalAll || 1)) * 100}%`, backgroundColor: company.color }}
                      >
                        {(company.commissionN / (totalAll || 1)) * 100 > 15 && (
                          <span className="text-white text-xs" style={{ fontWeight: 600, fontSize: 10 }}>N</span>
                        )}
                      </div>
                      <div
                        className="h-full transition-all duration-700"
                        style={{ width: `${(company.commissionN1 / (totalAll || 1)) * 100}%`, backgroundColor: company.color, opacity: 0.35 }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 w-32">
                    <p className="text-sm" style={{ fontWeight: 700, color: company.color }}>{formatCurrency(company.commissionN)}</p>
                    <p className="text-xs text-slate-400">+ {formatCurrency(company.commissionN1)} N+1</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Tableau Mensuel Détaillé — {selectedYear}</h3>
            <p className="text-slate-400 text-xs mt-0.5">Réalisé vs Objectif · Flux de commissions par type</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Mois', 'Montant Réel', 'Objectif', 'Écart', 'Comm. Principale', 'Comm. Secondaire', 'N+1', 'Performance'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tableData.map((d, i) => {
                const ecart = d.montantReel - d.montantPrevu;
                const performance = d.montantPrevu > 0 ? (d.montantReel / d.montantPrevu) * 100 : 0;
                const isReal = d.montantReel > 0;
                return (
                  <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${!isReal ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isReal ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{MONTH_NAMES[d.mois]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ fontWeight: isReal ? 700 : 400, color: isReal ? '#1e40af' : '#94a3b8' }}>
                      {isReal ? formatCurrency(d.montantReel) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{formatCurrency(d.montantPrevu)}</td>
                    <td className="px-4 py-3.5 text-sm">
                      {isReal ? (
                        <span className={ecart >= 0 ? 'text-emerald-600' : 'text-red-500'} style={{ fontWeight: 600 }}>
                          {ecart >= 0 ? '+' : ''}{formatCurrency(ecart)}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-blue-600" style={{ fontWeight: d.commissionPrincipale > 0 ? 600 : 400 }}>
                      {d.commissionPrincipale > 0 ? formatCurrency(d.commissionPrincipale) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-violet-600" style={{ fontWeight: d.commissionSecondaire > 0 ? 600 : 400 }}>
                      {d.commissionSecondaire > 0 ? formatCurrency(d.commissionSecondaire) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-emerald-600" style={{ fontWeight: d.commissionN1 > 0 ? 600 : 400 }}>
                      {d.commissionN1 > 0 ? formatCurrency(d.commissionN1) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      {isReal ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${performance >= 100 ? 'bg-emerald-500' : performance >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(performance, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-600" style={{ fontWeight: 600 }}>{performance.toFixed(0)}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>Prévu</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3.5 text-sm text-slate-700" style={{ fontWeight: 700 }}>TOTAL</td>
                <td className="px-4 py-3.5 text-sm text-blue-700" style={{ fontWeight: 700 }}>{formatCurrency(totalReel)}</td>
                <td className="px-4 py-3.5 text-sm text-slate-700" style={{ fontWeight: 700 }}>{formatCurrency(totalPrevu)}</td>
                <td className="px-4 py-3.5 text-sm" style={{ fontWeight: 700, color: totalReel - totalPrevu >= 0 ? '#059669' : '#dc2626' }}>
                  {totalReel - totalPrevu >= 0 ? '+' : ''}{formatCurrency(totalReel - totalPrevu)}
                </td>
                <td className="px-4 py-3.5 text-xs text-blue-700" style={{ fontWeight: 700 }}>
                  {formatCurrency(tableData.reduce((s, d) => s + d.commissionPrincipale, 0))}
                </td>
                <td className="px-4 py-3.5 text-xs text-violet-700" style={{ fontWeight: 700 }}>
                  {formatCurrency(tableData.reduce((s, d) => s + d.commissionSecondaire, 0))}
                </td>
                <td className="px-4 py-3.5 text-xs text-emerald-700" style={{ fontWeight: 700 }}>
                  {formatCurrency(tableData.reduce((s, d) => s + d.commissionN1, 0))}
                </td>
                <td className="px-4 py-3.5" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
