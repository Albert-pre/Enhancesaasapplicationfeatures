import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Euro, Calendar, Download, RefreshCw, Zap } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { useApp } from '../context/AppContext';
import { SimulationParams, SimulationResult } from '../data/types';
import { formatCurrency } from '../data/mockData';

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

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

function calculatePrecompte(primeMensuelle: number, tauxCommission: number, tauxN1: number, moisDebut: number): SimulationResult[] {
  const results: SimulationResult[] = [];
  let cumulative = 0;

  // Précompte: commission versée à la souscription (annualisée) et suivi N+1
  const primeAnnuelle = primeMensuelle * 12;
  const commissionPrecompte = primeAnnuelle * (tauxCommission / 100);
  const commissionN1Mensuelle = primeMensuelle * (tauxN1 / 100);

  for (let i = 0; i < 24; i++) {
    const moisIndex = (moisDebut + i) % 12;
    const annee = Math.floor((moisDebut + i) / 12);
    const label = `${MONTHS_FR[moisIndex]} ${2026 + annee}`;

    let commN = 0;
    let commN1 = 0;

    if (i === 0) {
      commN = commissionPrecompte * 0.7; // 70% à la souscription
    } else if (i === 3) {
      commN = commissionPrecompte * 0.3; // 30% à l'effet
    } else if (i >= 12) {
      commN1 = commissionN1Mensuelle; // N+1 à partir du mois 12
    }

    cumulative += commN + commN1;

    results.push({
      mois: label,
      commissionN: commN,
      commissionN1: commN1,
      cumulatif: cumulative,
    });
  }
  return results;
}

function calculateLineaire(primeMensuelle: number, tauxCommission: number, tauxN1: number, moisDebut: number, duree: number): SimulationResult[] {
  const results: SimulationResult[] = [];
  let cumulative = 0;

  const commissionMensuelle = primeMensuelle * (tauxCommission / 100);
  const commissionN1Mensuelle = primeMensuelle * (tauxN1 / 100);

  for (let i = 0; i < Math.min(duree, 24); i++) {
    const moisIndex = (moisDebut + i) % 12;
    const annee = Math.floor((moisDebut + i) / 12);
    const label = `${MONTHS_FR[moisIndex]} ${2026 + annee}`;

    const commN = commissionMensuelle;
    const commN1 = i >= 12 ? commissionN1Mensuelle : 0;

    cumulative += commN + commN1;

    results.push({
      mois: label,
      commissionN: commN,
      commissionN1: commN1,
      cumulatif: cumulative,
    });
  }
  return results;
}

export default function Simulation() {
  const { commissionRules, companies } = useApp();
  const [params, setParams] = useState<SimulationParams>({
    compagnie: 'ECA',
    produit: 'Cap Santé Senior',
    formule: '',
    typeCommission: 'Précompte',
    primeMensuelle: 100,
    tauxCommission: 50,
    tauxN1: 10,
    duree: 24,
    dateDebut: new Date().toISOString().split('T')[0],
  });
  const [chartView, setChartView] = useState<'mensuel' | 'cumulatif'>('cumulatif');

  // Get products for selected company
  const companyRules = commissionRules.filter(r => r.compagnie === params.compagnie);
  const selectedRule = companyRules.find(r => r.produit === params.produit);

  const moisDebut = new Date(params.dateDebut).getMonth();

  const results: SimulationResult[] = useMemo(() => {
    if (params.typeCommission === 'Précompte') {
      return calculatePrecompte(params.primeMensuelle, params.tauxCommission, params.tauxN1, moisDebut);
    } else {
      return calculateLineaire(params.primeMensuelle, params.tauxCommission, params.tauxN1, moisDebut, params.duree);
    }
  }, [params]);

  const totalCommN = results.reduce((s, r) => s + r.commissionN, 0);
  const totalCommN1 = results.reduce((s, r) => s + r.commissionN1, 0);
  const totalGlobal = totalCommN + totalCommN1;
  const maxCumulatif = results.length > 0 ? results[results.length - 1].cumulatif : 0;

  const handleRuleSelect = (rule: typeof selectedRule) => {
    if (!rule) return;
    setParams(prev => ({
      ...prev,
      produit: rule.produit,
      typeCommission: rule.typeCommission,
      tauxCommission: rule.commission1ereAnnee,
      tauxN1: rule.tauxN1,
    }));
    toast.success(`Règle "${rule.produit}" appliquée automatiquement`);
  };

  const handleExport = () => {
    const csv = Papa.unparse(results.map((r, i) => ({
      'Mois': r.mois,
      'Commission N (€)': r.commissionN.toFixed(2),
      'Commission N+1 (€)': r.commissionN1.toFixed(2),
      'Total mois (€)': (r.commissionN + r.commissionN1).toFixed(2),
      'Cumulatif (€)': r.cumulatif.toFixed(2),
    })));
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `simulation_${params.produit}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Simulation exportée en CSV');
  };

  const handleReset = () => {
    setParams({
      compagnie: 'ECA', produit: 'Cap Santé Senior', formule: '',
      typeCommission: 'Précompte', primeMensuelle: 100, tauxCommission: 50,
      tauxN1: 10, duree: 24, dateDebut: new Date().toISOString().split('T')[0],
    });
    toast.success('Simulation réinitialisée');
  };

  const chartData = results.map(r => ({
    mois: r.mois.split(' ')[0],
    'Commission N': r.commissionN,
    'Commission N+1': r.commissionN1,
    'Cumulatif': r.cumulatif,
  }));

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800 text-xl" style={{ fontWeight: 700 }}>Simulateur de Commissions</h2>
          <p className="text-slate-500 text-sm mt-0.5">Calculez vos revenus en temps réel</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={14} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
            <h3 className="text-slate-800 mb-4 flex items-center gap-2" style={{ fontWeight: 600 }}>
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calculator size={14} className="text-blue-600" />
              </div>
              Paramètres du contrat
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Compagnie</label>
                <select value={params.compagnie} onChange={e => setParams(p => ({ ...p, compagnie: e.target.value, produit: '' }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  {companies.filter(c => c.actif).map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Produit</label>
                <select value={params.produit} onChange={e => {
                  const rule = commissionRules.find(r => r.compagnie === params.compagnie && r.produit === e.target.value);
                  setParams(p => ({
                    ...p, produit: e.target.value,
                    typeCommission: rule?.typeCommission || p.typeCommission,
                    tauxCommission: rule?.commission1ereAnnee || p.tauxCommission,
                    tauxN1: rule?.tauxN1 || p.tauxN1,
                  }));
                }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Sélectionner un produit...</option>
                  {companyRules.map(r => <option key={r.id} value={r.produit}>{r.produit} ({r.categorie})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Type commission</label>
                  <select value={params.typeCommission} onChange={e => setParams(p => ({ ...p, typeCommission: e.target.value as any }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="Précompte">Précompte</option>
                    <option value="Linéaire">Linéaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Date de début</label>
                  <input type="date" value={params.dateDebut} onChange={e => setParams(p => ({ ...p, dateDebut: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>
                  Prime mensuelle — <span className="text-blue-600" style={{ fontWeight: 700 }}>{formatCurrency(params.primeMensuelle)}</span>
                </label>
                <div className="relative">
                  <input type="range" min="10" max="1000" step="5" value={params.primeMensuelle}
                    onChange={e => setParams(p => ({ ...p, primeMensuelle: Number(e.target.value) }))}
                    className="w-full accent-blue-600" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>10€</span><span>1 000€</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>
                    Taux N — <span className="text-blue-600" style={{ fontWeight: 700 }}>{params.tauxCommission}%</span>
                  </label>
                  <input type="range" min="5" max="120" step="5" value={params.tauxCommission}
                    onChange={e => setParams(p => ({ ...p, tauxCommission: Number(e.target.value) }))}
                    className="w-full accent-blue-600" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>
                    Taux N+1 — <span className="text-violet-600" style={{ fontWeight: 700 }}>{params.tauxN1}%</span>
                  </label>
                  <input type="range" min="0" max="30" step="1" value={params.tauxN1}
                    onChange={e => setParams(p => ({ ...p, tauxN1: Number(e.target.value) }))}
                    className="w-full accent-violet-600" />
                </div>
              </div>

              {params.typeCommission === 'Linéaire' && (
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>
                    Durée — <span className="text-blue-600" style={{ fontWeight: 700 }}>{params.duree} mois</span>
                  </label>
                  <input type="range" min="6" max="36" step="6" value={params.duree}
                    onChange={e => setParams(p => ({ ...p, duree: Number(e.target.value) }))}
                    className="w-full accent-blue-600" />
                </div>
              )}
            </div>
          </div>

          {/* Quick presets */}
          {companyRules.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
              <h3 className="text-slate-800 mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <Zap size={14} className="text-amber-500" />
                Produits {params.compagnie}
              </h3>
              <div className="space-y-2">
                {companyRules.slice(0, 6).map(rule => (
                  <button key={rule.id} onClick={() => handleRuleSelect(rule)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-sm transition-colors ${params.produit === rule.produit ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-slate-50 border border-transparent text-slate-600'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${params.produit === rule.produit ? 'bg-blue-500' : 'bg-slate-300'}`} />
                      <span style={{ fontWeight: params.produit === rule.produit ? 600 : 400 }}>{rule.produit}</span>
                    </div>
                    <span className="text-xs text-slate-400">{rule.commission1ereAnnee}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* Result KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Commission N', value: formatCurrency(totalCommN), color: 'blue', sub: `${params.tauxCommission}% de la prime` },
              { label: 'Commission N+1', value: formatCurrency(totalCommN1), color: 'violet', sub: `${params.tauxN1}% annuel` },
              { label: 'Total 2 ans', value: formatCurrency(maxCumulatif), color: 'emerald', sub: 'Cumul projeté' },
            ].map((kpi, i) => (
              <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border border-${kpi.color}-100`}>
                <p className={`text-xl text-${kpi.color}-600`} style={{ fontWeight: 700 }}>{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-1" style={{ fontWeight: 500 }}>{kpi.label}</p>
                <p className="text-xs text-slate-400">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Projection des commissions</h3>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {(['mensuel', 'cumulatif'] as const).map(mode => (
                  <button key={mode} onClick={() => setChartView(mode)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${chartView === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                    style={{ fontWeight: 500 }}>
                    {mode === 'mensuel' ? 'Mensuel' : 'Cumulatif'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {chartView === 'cumulatif' ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k€` : ''} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Cumulatif" stroke="#2563eb" strokeWidth={2.5} fill="url(#simGrad)" dot={false} />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${v.toFixed(0)}€` : ''} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Commission N" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="Commission N+1" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Detail table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Détail mensuel</h3>
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-slate-100">
                    {['Mois', 'Commission N', 'Commission N+1', 'Total mois', 'Cumulatif'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-slate-400 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.map((r, i) => (
                    <tr key={i} className={`hover:bg-slate-50/50 ${(r.commissionN + r.commissionN1) === 0 ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-2.5 text-sm text-slate-700" style={{ fontWeight: 500 }}>{r.mois}</td>
                      <td className="px-4 py-2.5 text-sm text-blue-600" style={{ fontWeight: r.commissionN > 0 ? 600 : 400 }}>
                        {r.commissionN > 0 ? formatCurrency(r.commissionN) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-violet-600" style={{ fontWeight: r.commissionN1 > 0 ? 600 : 400 }}>
                        {r.commissionN1 > 0 ? formatCurrency(r.commissionN1) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-800" style={{ fontWeight: 600 }}>
                        {(r.commissionN + r.commissionN1) > 0 ? formatCurrency(r.commissionN + r.commissionN1) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-emerald-700" style={{ fontWeight: 600 }}>
                        {formatCurrency(r.cumulatif)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
