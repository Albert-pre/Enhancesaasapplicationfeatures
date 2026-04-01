import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, Euro, Download, RefreshCw, Zap, Info, ArrowRight } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { useApp } from '../context/AppContext';
import { SimulationParams, SimulationResult } from '../data/types';
import { formatCurrency, formatCurrencyFull, MONTHS_FR } from '../data/mockData';

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
              <span className="text-xs" style={{ fontWeight: 700 }}>{formatCurrencyFull(entry.value || 0)}</span>
            </div>
          )
        ))}
      </div>
    );
  }
  return null;
};

function calculateSimulation(params: SimulationParams): SimulationResult[] {
  const results: SimulationResult[] = [];
  let cumulative = 0;
  const startDate = new Date(params.dateDebut);
  const moisDebut = startDate.getMonth();
  const yearDebut = startDate.getFullYear();
  const primeAnnuelle = params.primeMensuelle * 12;
  const baseDelay = Math.max(0, params.baseDelayMonths ?? 0);
  const secondaryDelay = Math.max(0, params.secondaryDelayMonths ?? 4);
  const n1Delay = Math.max(0, params.n1DelayMonths ?? 12);
  const referenceOffset = (ref?: 'souscription' | 'effet' | 'premiere_prime') => {
    if (ref === 'effet') return 1;
    if (ref === 'premiere_prime') return 2;
    return 0;
  };

  const baseStart = referenceOffset(params.baseReference) + baseDelay;
  const secondaryStart = referenceOffset(params.secondaryReference) + secondaryDelay;
  const n1Start = referenceOffset(params.n1Reference) + n1Delay;

  if (params.typeCommission === 'Précompte') {
    // Mois 0: commission principale à la souscription
    // Mois 1-2 (variable): commission secondaire à la date d'effet (typiquement M+1 à M+2)
    // Mois 12+: N+1 mensuelle
    for (let i = 0; i < 24; i++) {
      const moisIndex = (moisDebut + i) % 12;
      const anneeOffset = Math.floor((moisDebut + i) / 12);
      const label = `${MONTHS_FR[moisIndex]} ${yearDebut + anneeOffset}`;

      let commPrincipale = 0;
      let commSecondaire = 0;
      let commN1 = 0;

      if (i === baseStart) {
        commPrincipale = primeAnnuelle * params.tauxBase / 100;
      }
      if (i === secondaryStart && params.tauxSecondaire > 0) {
        commSecondaire = primeAnnuelle * params.tauxSecondaire / 100;
      }
      if (i >= n1Start) {
        commN1 = params.primeMensuelle * params.tauxN1 / 100; // mensuelle
      }

      const total = commPrincipale + commSecondaire + commN1;
      cumulative += total;

      results.push({
        mois: label,
        commissionPrincipale: +commPrincipale.toFixed(2),
        commissionSecondaire: +commSecondaire.toFixed(2),
        commissionN1: +commN1.toFixed(2),
        total: +total.toFixed(2),
        cumulatif: +cumulative.toFixed(2),
      });
    }
  } else {
    // Linéaire: commission mensuelle régulière
    const commMensuelle = params.primeMensuelle * params.tauxTotal / 100;
    const commN1Mensuelle = params.primeMensuelle * params.tauxN1 / 100;

    for (let i = 0; i < Math.min(params.duree, 24); i++) {
      const moisIndex = (moisDebut + i) % 12;
      const anneeOffset = Math.floor((moisDebut + i) / 12);
      const label = `${MONTHS_FR[moisIndex]} ${yearDebut + anneeOffset}`;

      const commPrincipale = i < 12 ? commMensuelle : 0;
      const commN1 = i >= 12 ? commN1Mensuelle : 0;
      const total = commPrincipale + commN1;
      cumulative += total;

      results.push({
        mois: label,
        commissionPrincipale: +commPrincipale.toFixed(2),
        commissionSecondaire: 0,
        commissionN1: +commN1.toFixed(2),
        total: +total.toFixed(2),
        cumulatif: +cumulative.toFixed(2),
      });
    }
  }

  return results;
}

const DEFAULT_PARAMS: SimulationParams = {
  compagnie: 'ECA',
  produit: 'Cap Santé Senior',
  typeCommission: 'Précompte',
  primeMensuelle: 120,
  tauxTotal: 50,
  tauxBase: 30,
  tauxSecondaire: 18,
  tauxN1: 10,
  duree: 24,
  dateDebut: '2026-03-01',
  baseDelayMonths: 0,
  secondaryDelayMonths: 4,
  n1DelayMonths: 12,
  baseReference: 'souscription',
  secondaryReference: 'effet',
  n1Reference: 'effet',
};

type ChartView = 'cumulatif' | 'mensuel';

export default function Simulation() {
  const { commissionRules, companies } = useApp();
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [chartView, setChartView] = useState<ChartView>('cumulatif');
  const [compareMode, setCompareMode] = useState(false);
  const [params2, setParams2] = useState<SimulationParams>({ ...DEFAULT_PARAMS, typeCommission: 'Linéaire', tauxTotal: 15, tauxBase: 15, tauxSecondaire: 0, tauxN1: 15, produit: 'ZEN SANTÉ SENIOR Linéaire' });

  const companyRules = commissionRules.filter(r => r.compagnie === params.compagnie);
  const companyRules2 = commissionRules.filter(r => r.compagnie === params2.compagnie);

  const results = useMemo(() => calculateSimulation(params), [params]);
  const results2 = useMemo(() => compareMode ? calculateSimulation(params2) : [], [params2, compareMode]);

  const totalCommN = results.reduce((s, r) => s + r.commissionPrincipale + r.commissionSecondaire, 0);
  const totalCommN1 = results.reduce((s, r) => s + r.commissionN1, 0);
  const totalGlobal = results[results.length - 1]?.cumulatif || 0;

  const totalCommN2 = results2.reduce((s, r) => s + r.commissionPrincipale + r.commissionSecondaire, 0);
  const totalCommN1_2 = results2.reduce((s, r) => s + r.commissionN1, 0);
  const totalGlobal2 = results2[results2.length - 1]?.cumulatif || 0;

  const chartData = results.map((r, i) => ({
    mois: r.mois.split(' ')[0],
    'Principale': r.commissionPrincipale,
    'Secondaire': r.commissionSecondaire,
    'N+1': r.commissionN1,
    'Total': r.total,
    'Cumulatif': r.cumulatif,
    'Cumulatif 2': results2[i]?.cumulatif,
    'Total 2': results2[i]?.total,
  }));

  const handleRuleSelect = (rule: typeof companyRules[0]) => {
    setParams(prev => ({
      ...prev,
      produit: rule.produit,
      typeCommission: rule.typeCommission,
      tauxTotal: rule.tauxTotal,
      tauxBase: rule.tauxBase,
      tauxSecondaire: rule.tauxSecondaire,
      tauxN1: rule.tauxN1,
      baseDelayMonths: rule.baseDelayMonths ?? 0,
      secondaryDelayMonths: rule.secondaryDelayMonths ?? 4,
      n1DelayMonths: rule.n1DelayMonths ?? 12,
      baseReference: rule.baseReference ?? 'souscription',
      secondaryReference: rule.secondaryReference ?? 'effet',
      n1Reference: rule.n1Reference ?? 'effet',
    }));
    toast.success(`"${rule.produit}" appliqué`);
  };

  const handleRuleSelect2 = (rule: typeof companyRules2[0]) => {
    setParams2(prev => ({
      ...prev,
      produit: rule.produit,
      typeCommission: rule.typeCommission,
      tauxTotal: rule.tauxTotal,
      tauxBase: rule.tauxBase,
      tauxSecondaire: rule.tauxSecondaire,
      tauxN1: rule.tauxN1,
      baseDelayMonths: rule.baseDelayMonths ?? 0,
      secondaryDelayMonths: rule.secondaryDelayMonths ?? 4,
      n1DelayMonths: rule.n1DelayMonths ?? 12,
      baseReference: rule.baseReference ?? 'souscription',
      secondaryReference: rule.secondaryReference ?? 'effet',
      n1Reference: rule.n1Reference ?? 'effet',
    }));
    toast.success(`"${rule.produit}" appliqué pour scénario 2`);
  };

  const handleExport = () => {
    const csv = Papa.unparse(results.map(r => ({
      'Mois': r.mois,
      'Commission Principale (€)': r.commissionPrincipale.toFixed(2),
      'Commission Secondaire (€)': r.commissionSecondaire.toFixed(2),
      'Commission N+1 (€)': r.commissionN1.toFixed(2),
      'Total mois (€)': r.total.toFixed(2),
      'Cumulatif (€)': r.cumulatif.toFixed(2),
    })));
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `simulation_${params.produit.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Simulation exportée en CSV');
  };

  const ParamPanel = ({ p, setP, rules, label, color }: {
    p: SimulationParams;
    setP: React.Dispatch<React.SetStateAction<SimulationParams>>;
    rules: typeof companyRules;
    label: string;
    color: string;
  }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
      <h3 className="text-slate-800 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Calculator size={14} style={{ color }} />
        </div>
        {label}
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Compagnie</label>
          <select value={p.compagnie} onChange={e => setP(prev => ({ ...prev, compagnie: e.target.value, produit: '' }))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            {companies.filter(c => c.actif).map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Produit</label>
          <select value={p.produit} onChange={e => {
            const rule = rules.find(r => r.produit === e.target.value);
            if (rule) {
              setP(prev => ({
                ...prev,
                produit: rule.produit,
                typeCommission: rule.typeCommission,
                tauxTotal: rule.tauxTotal,
                tauxBase: rule.tauxBase,
                tauxSecondaire: rule.tauxSecondaire,
                tauxN1: rule.tauxN1,
                baseDelayMonths: rule.baseDelayMonths ?? 0,
                secondaryDelayMonths: rule.secondaryDelayMonths ?? 4,
                n1DelayMonths: rule.n1DelayMonths ?? 12,
                baseReference: rule.baseReference ?? 'souscription',
                secondaryReference: rule.secondaryReference ?? 'effet',
                n1Reference: rule.n1Reference ?? 'effet',
              }));
            } else {
              setP(prev => ({ ...prev, produit: e.target.value }));
            }
          }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option value="">Sélectionner...</option>
            {rules.map(r => <option key={r.id} value={r.produit}>{r.produit}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Type</label>
            <select value={p.typeCommission} onChange={e => setP(prev => ({ ...prev, typeCommission: e.target.value as any }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="Précompte">Précompte</option>
              <option value="Linéaire">Linéaire</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Date début</label>
            <input type="date" value={p.dateDebut} onChange={e => setP(prev => ({ ...prev, dateDebut: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>

        <div>
          <label className="flex justify-between text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>
            Prime mensuelle
            <span style={{ color, fontWeight: 700 }}>{formatCurrency(p.primeMensuelle)}/mois</span>
          </label>
          <input type="range" min="10" max="2000" step="10" value={p.primeMensuelle}
            onChange={e => setP(prev => ({ ...prev, primeMensuelle: Number(e.target.value) }))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-0.5"><span>10€</span><span>2 000€</span></div>
        </div>

        {/* Commission Rates */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'tauxTotal', label: 'Total N', suffix: '%', max: 120 },
            { key: 'tauxBase', label: 'Souscription', suffix: '%', max: 120 },
            { key: 'tauxSecondaire', label: 'Effet', suffix: '%', max: 50 },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>{field.label}</label>
              <div className="relative">
                <input type="number" min="0" max={field.max} step="0.5"
                  value={(p as any)[field.key]}
                  onChange={e => setP(prev => ({ ...prev, [field.key]: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="flex justify-between text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>
              Taux N+1 <span style={{ fontWeight: 700, color: '#7c3aed' }}>{p.tauxN1}%</span>
            </label>
            <input type="range" min="0" max="30" step="1" value={p.tauxN1}
              onChange={e => setP(prev => ({ ...prev, tauxN1: Number(e.target.value) }))}
              className="w-full accent-violet-600" />
          </div>
          {p.typeCommission === 'Linéaire' && (
            <div>
              <label className="flex justify-between text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>
                Durée <span style={{ fontWeight: 700 }}>{p.duree}m</span>
              </label>
              <input type="range" min="6" max="36" step="6" value={p.duree}
                onChange={e => setP(prev => ({ ...prev, duree: Number(e.target.value) }))}
                className="w-full accent-blue-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-800" style={{ fontSize: 20, fontWeight: 700 }}>Simulateur de Commissions</h2>
          <p className="text-slate-500 text-sm mt-0.5">Calcul en temps réel · Projection 24 mois</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2 transition-colors ${compareMode ? 'bg-violet-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <ArrowRight size={14} />
            <span className="hidden sm:inline">{compareMode ? 'Comparaison ON' : 'Comparer 2 scénarios'}</span>
          </button>
          <button onClick={() => { setParams(DEFAULT_PARAMS); toast.success('Réinitialisé'); }}
            className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={14} />
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={14} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${compareMode ? 'lg:grid-cols-5' : 'lg:grid-cols-5'} gap-5`}>
        {/* Param Panels */}
        <div className={`${compareMode ? 'lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start' : 'lg:col-span-2'}`}>
          <ParamPanel p={params} setP={setParams} rules={companyRules} label="Scénario 1" color="#2563eb" />
          {compareMode && (
            <ParamPanel p={params2} setP={setParams2} rules={companyRules2} label="Scénario 2" color="#7c3aed" />
          )}

          {/* Quick presets for scenario 1 */}
          {!compareMode && companyRules.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
              <h3 className="text-slate-800 mb-3 flex items-center gap-2" style={{ fontWeight: 700 }}>
                <Zap size={14} className="text-amber-500" />
                Produits {params.compagnie}
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {companyRules.map(rule => (
                  <button key={rule.id} onClick={() => handleRuleSelect(rule)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${params.produit === rule.produit ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-slate-50 border border-transparent text-slate-600'}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${params.produit === rule.produit ? 'bg-blue-500' : 'bg-slate-300'}`} />
                      <span className="truncate" style={{ fontWeight: params.produit === rule.produit ? 700 : 400 }}>{rule.produit}</span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <span className="text-slate-400 text-xs">{rule.tauxTotal}%</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${rule.typeCommission === 'Précompte' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600'}`} style={{ fontWeight: 600, fontSize: 9 }}>
                        {rule.typeCommission === 'Précompte' ? 'P' : 'L'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Commission N', value: formatCurrency(totalCommN), sub: `${params.tauxTotal}% taux total`, color: 'blue', value2: compareMode ? formatCurrency(totalCommN2) : null },
              { label: 'Commission N+1', value: formatCurrency(totalCommN1), sub: `${params.tauxN1}% renouvellement`, color: 'violet', value2: compareMode ? formatCurrency(totalCommN1_2) : null },
              { label: 'Total 24 mois', value: formatCurrency(totalGlobal), sub: 'Cumul projeté', color: 'emerald', value2: compareMode ? formatCurrency(totalGlobal2) : null },
            ].map((kpi, i) => (
              <div key={i} className={`bg-white rounded-2xl p-4 shadow-sm border border-${kpi.color}-100`}>
                <p className={`text-xl text-${kpi.color}-600`} style={{ fontWeight: 800 }}>{kpi.value}</p>
                {kpi.value2 && <p className="text-sm text-violet-500" style={{ fontWeight: 600 }}>{kpi.value2}</p>}
                <p className="text-xs text-slate-600 mt-1" style={{ fontWeight: 500 }}>{kpi.label}</p>
                <p className="text-xs text-slate-400">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Preview banner */}
          {params.typeCommission === 'Précompte' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <Info size={14} className="text-blue-500 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <span style={{ fontWeight: 700 }}>Précompte :</span>{' '}
                {formatCurrency(params.primeMensuelle * 12 * params.tauxBase / 100)} a {params.baseReference ?? 'souscription'} +{params.baseDelayMonths ?? 0} mois
                {params.tauxSecondaire > 0 && ` · ${formatCurrency(params.primeMensuelle * 12 * params.tauxSecondaire / 100)} a ${params.secondaryReference ?? 'effet'} +${params.secondaryDelayMonths ?? 4} mois`}
                {` · ${formatCurrency(params.primeMensuelle * params.tauxN1 / 100)}/mois des ${params.n1Reference ?? 'effet'} +${params.n1DelayMonths ?? 12} mois`}
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Projection des commissions</h3>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                {(['cumulatif', 'mensuel'] as const).map(mode => (
                  <button key={mode} onClick={() => setChartView(mode)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${chartView === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                    style={{ fontWeight: chartView === mode ? 600 : 400 }}>
                    {mode === 'mensuel' ? 'Mensuel' : 'Cumulatif'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {chartView === 'cumulatif' ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="simGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    {compareMode && (
                      <linearGradient id="simGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    )}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(1)}k€` : ''} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x={MONTHS_FR[new Date().getMonth()]} stroke="#f59e0b" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="Cumulatif" stroke="#2563eb" strokeWidth={2.5} fill="url(#simGrad1)" dot={false} name="Scénario 1" />
                  {compareMode && <Area type="monotone" dataKey="Cumulatif 2" stroke="#7c3aed" strokeWidth={2.5} fill="url(#simGrad2)" dot={false} strokeDasharray="5 3" name="Scénario 2" />}
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mois" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${v.toFixed(0)}€` : ''} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Principale" fill="#2563eb" radius={[3, 3, 0, 0]} maxBarSize={24} stackId="s1" name="Principale" />
                  <Bar dataKey="Secondaire" fill="#7c3aed" maxBarSize={24} stackId="s1" name="Secondaire" />
                  <Bar dataKey="N+1" fill="#059669" radius={[3, 3, 0, 0]} maxBarSize={24} stackId="s1" name="N+1" />
                  {compareMode && <Bar dataKey="Total 2" fill="#be185d" radius={[3, 3, 0, 0]} maxBarSize={24} name="Scénario 2" />}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Detail Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100">
              <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Détail mensuel — Scénario 1</h3>
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
                  <tr>
                    {['Mois', 'Comm. Principale', 'Comm. Secondaire', 'N+1', 'Total mois', 'Cumulatif'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs text-slate-400 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.map((r, i) => (
                    <tr key={i} className={`hover:bg-slate-50/50 ${r.total === 0 ? 'opacity-40' : ''} ${i === 11 ? 'border-b-2 border-blue-200' : ''}`}>
                      <td className="px-4 py-2.5 text-sm text-slate-700" style={{ fontWeight: 600 }}>
                        {r.mois}
                        {i === 11 && <span className="ml-1 text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">Fin N</span>}
                        {i === 12 && <span className="ml-1 text-xs text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">N+1</span>}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-blue-600" style={{ fontWeight: r.commissionPrincipale > 0 ? 700 : 400 }}>
                        {r.commissionPrincipale > 0 ? formatCurrencyFull(r.commissionPrincipale) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-violet-600" style={{ fontWeight: r.commissionSecondaire > 0 ? 700 : 400 }}>
                        {r.commissionSecondaire > 0 ? formatCurrencyFull(r.commissionSecondaire) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-emerald-600" style={{ fontWeight: r.commissionN1 > 0 ? 700 : 400 }}>
                        {r.commissionN1 > 0 ? formatCurrencyFull(r.commissionN1) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-800" style={{ fontWeight: r.total > 0 ? 700 : 400 }}>
                        {r.total > 0 ? formatCurrencyFull(r.total) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-emerald-700" style={{ fontWeight: 700 }}>
                        {formatCurrencyFull(r.cumulatif)}
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
