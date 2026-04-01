import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { formatCurrency, MONTHS_FR } from '../data/mockData';
import { contractsService, type PLResponse } from '../services/contractsService';

export default function PL() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(-1);
  const [data, setData] = useState<PLResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    contractsService.getPL({ year: selectedYear, month: selectedMonth >= 0 ? selectedMonth : null })
      .then((res) => { if (mounted) setData(res); })
      .catch(() => {
        if (mounted) {
          setData(null);
          setError("Impossible de charger le P&L (API / Google Sheets). Vérifiez que le serveur backend est démarré.");
        }
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [selectedYear, selectedMonth]);

  const totals = data?.totals || { contrats: 0, commissions: 0, charge: 0, depenses: 0, frais: 0, resultat: 0 };
  const rows = data?.byCommercial || [];
  const rowsCompany = data?.byCompany || [];
  const monthLabel = selectedMonth >= 0 ? MONTHS_FR[selectedMonth] : 'Année';

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-800" style={{ fontSize: 20, fontWeight: 700 }}>P&L</h2>
          <p className="text-slate-500 text-sm mt-0.5">Commissions - Charges - Dépenses - Frais par commercial</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700"
          >
            <option value={-1}>Toute l'année</option>
            {MONTHS_FR.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60"><p className="text-xs text-slate-500">Production</p><p className="text-xl" style={{ fontWeight: 800 }}>{totals.contrats}</p></div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60"><p className="text-xs text-slate-500">Commissions</p><p className="text-xl" style={{ fontWeight: 800 }}>{formatCurrency(totals.commissions)}</p></div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60"><p className="text-xs text-slate-500">Charges</p><p className="text-xl text-amber-700" style={{ fontWeight: 800 }}>{formatCurrency(totals.charge)}</p></div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60"><p className="text-xs text-slate-500">Dépenses</p><p className="text-xl text-amber-700" style={{ fontWeight: 800 }}>{formatCurrency(totals.depenses)}</p></div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60"><p className="text-xs text-slate-500">Résultat net</p><p className={`text-xl ${totals.resultat >= 0 ? 'text-emerald-700' : 'text-red-700'}`} style={{ fontWeight: 800 }}>{formatCurrency(totals.resultat)}</p></div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/60">
        <p className="text-sm text-slate-800 mb-2" style={{ fontWeight: 700 }}>Méthode de calcul</p>
        <div className="text-sm text-slate-600 space-y-2">
          <div>
            <p className="text-slate-700" style={{ fontWeight: 600 }}>Périmètre & filtre de période</p>
            <p className="text-slate-600">
              Les lignes sont filtrées par <span className="text-slate-800" style={{ fontWeight: 600 }}>année/mois</span> sur la colonne <span className="text-slate-800" style={{ fontWeight: 600 }}>Signature</span> (date de souscription).
            </p>
          </div>
          <div>
            <p className="text-slate-700" style={{ fontWeight: 600 }}>Agrégation</p>
            <p className="text-slate-600">
              Les totaux sont calculés par addition des colonnes Sheets: <span className="text-slate-800" style={{ fontWeight: 600 }}>Commission annuel 1ére année</span>,
              <span className="text-slate-800" style={{ fontWeight: 600 }}> Charge</span>, <span className="text-slate-800" style={{ fontWeight: 600 }}>Dépenses</span>, <span className="text-slate-800" style={{ fontWeight: 600 }}>Frais</span>.
              La répartition se fait par <span className="text-slate-800" style={{ fontWeight: 600 }}>Attribution</span> (commercial) et par <span className="text-slate-800" style={{ fontWeight: 600 }}>Compagnie</span>.
            </p>
          </div>
          <div>
            <p className="text-slate-700" style={{ fontWeight: 600 }}>Résultat net</p>
            <p className="text-slate-600">
              \(Résultat\ net = Commissions - Charges - Dépenses - Frais\).
            </p>
          </div>
          <div>
            <p className="text-slate-700" style={{ fontWeight: 600 }}>Rappel commission (prévision)</p>
            <p className="text-slate-600">
              Quand on simule une commission à partir d’une prime mensuelle: <span className="text-slate-800" style={{ fontWeight: 600 }}>Prime brute mensuelle × (Taux/100) × 0,875</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-slate-800" style={{ fontWeight: 700 }}>Rendement — {monthLabel} {selectedYear}</p>
            <p className="text-xs text-slate-400">
              {loading ? 'Chargement…' : (data ? `Variation vs mois précédent: ${data.variations.vsPrevMonth ? formatCurrency(data.variations.vsPrevMonth.resultat) : '—'} · vs N-1: ${formatCurrency(data.variations.vsPrevYear.resultat)}` : 'Aucune donnée')}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr className="text-slate-500">
                <th className="text-left py-2">Commercial</th>
                <th className="text-right py-2">Contrats</th>
                <th className="text-right py-2">Commissions</th>
                <th className="text-right py-2">Charges</th>
                <th className="text-right py-2">Dépenses</th>
                <th className="text-right py-2">Frais</th>
                <th className="text-right py-2">Résultat net</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.commercial} className="border-b border-slate-50">
                  <td className="py-2">{row.commercial}</td>
                  <td className="py-2 text-right">{row.contrats}</td>
                  <td className="py-2 text-right">{formatCurrency(row.commissions)}</td>
                  <td className="py-2 text-right text-amber-700">{formatCurrency(row.charge)}</td>
                  <td className="py-2 text-right text-amber-700">{formatCurrency(row.depenses)}</td>
                  <td className="py-2 text-right text-amber-700">{formatCurrency(row.frais)}</td>
                  <td className={`py-2 text-right ${row.resultat >= 0 ? 'text-emerald-700' : 'text-red-700'}`} style={{ fontWeight: 700 }}>{formatCurrency(row.resultat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-200/60">
        <p className="text-sm text-slate-800 mb-3" style={{ fontWeight: 700 }}>Production par Compagnie — {monthLabel} {selectedYear}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100">
              <tr className="text-slate-500">
                <th className="text-left py-2">Compagnie</th>
                <th className="text-right py-2">Contrats</th>
                <th className="text-right py-2">Commissions</th>
                <th className="text-right py-2">Charges</th>
                <th className="text-right py-2">Dépenses</th>
                <th className="text-right py-2">Frais</th>
                <th className="text-right py-2">Résultat net</th>
              </tr>
            </thead>
            <tbody>
              {rowsCompany.map((row) => (
                <tr key={row.compagnie} className="border-b border-slate-50">
                  <td className="py-2">{row.compagnie}</td>
                  <td className="py-2 text-right">{row.contrats}</td>
                  <td className="py-2 text-right">{formatCurrency(row.commissions)}</td>
                  <td className="py-2 text-right text-amber-700">{formatCurrency(row.charge)}</td>
                  <td className="py-2 text-right text-amber-700">{formatCurrency(row.depenses)}</td>
                  <td className="py-2 text-right text-amber-700">{formatCurrency(row.frais)}</td>
                  <td className={`py-2 text-right ${row.resultat >= 0 ? 'text-emerald-700' : 'text-red-700'}`} style={{ fontWeight: 700 }}>{formatCurrency(row.resultat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-400">
        Aperçu global disponible dans le <NavLink to="/" className="text-blue-600 hover:underline">Dashboard</NavLink>.
      </div>
    </div>
  );
}
