import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Package2, Tag, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { CommissionRule } from '../data/types';
import { CATEGORIES, COMPANY_COLORS } from '../data/mockData';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  'Santé':      { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   border: 'border-blue-100' },
  'Prévoyance': { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-100' },
  'Obsèques':   { bg: 'bg-slate-100', text: 'text-slate-600',  dot: 'bg-slate-400',  border: 'border-slate-200' },
  'Animaux':    { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  border: 'border-amber-100' },
};

const RATE_COLOR = (val: number) =>
  val >= 70 ? 'bg-violet-100 text-violet-800' :
  val >= 40 ? 'bg-blue-100 text-blue-800' :
  val >= 20 ? 'bg-emerald-100 text-emerald-700' :
  'bg-slate-100 text-slate-600';

function RuleModal({ rule, companies, onClose, onSave }: {
  rule: Partial<CommissionRule> | null;
  companies: { nom: string }[];
  onClose: () => void;
  onSave: (r: CommissionRule) => void;
}) {
  const [form, setForm] = useState<Partial<CommissionRule>>(rule || {
    typeCommission: 'Précompte',
    tauxTotal: 30, tauxBase: 25, tauxSecondaire: 5, tauxQualite: 0, tauxN1: 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.compagnie || !form.produit || !form.categorie) {
      toast.error('Remplir les champs obligatoires');
      return;
    }
    onSave({
      id: form.id || `rule-${Date.now()}`,
      compagnie: form.compagnie || '',
      categorie: form.categorie || '',
      produit: form.produit || '',
      typeCommission: form.typeCommission || 'Précompte',
      tauxTotal: Number(form.tauxTotal) || 0,
      tauxBase: Number(form.tauxBase) || 0,
      tauxSecondaire: Number(form.tauxSecondaire) || 0,
      tauxQualite: Number(form.tauxQualite) || 0,
      tauxN1: Number(form.tauxN1) || 0,
    });
  };

  const tauxVerified = Number(form.tauxBase || 0) + Number(form.tauxSecondaire || 0) + Number(form.tauxQualite || 0);
  const diff = Number(form.tauxTotal || 0) - tauxVerified;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-slate-800" style={{ fontWeight: 700 }}>
            {form.id ? 'Modifier la règle' : 'Nouvelle règle de commission'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Compagnie *</label>
              <select value={form.compagnie || ''} onChange={e => setForm(p => ({ ...p, compagnie: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">Sélectionner...</option>
                {companies.map(c => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Catégorie *</label>
              <select value={form.categorie || ''} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">Sélectionner...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Produit *</label>
              <input type="text" value={form.produit || ''} onChange={e => setForm(p => ({ ...p, produit: e.target.value }))}
                placeholder="Nom du produit"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Type de commission</label>
              <select value={form.typeCommission || 'Précompte'} onChange={e => setForm(p => ({ ...p, typeCommission: e.target.value as any }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="Précompte">Précompte</option>
                <option value="Linéaire">Linéaire</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 700 }}>Taux de commission</p>
              {diff !== 0 && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                  Écart: {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'tauxTotal',      label: 'Total N (%)' },
                { key: 'tauxBase',       label: 'Base/Souscription (%)' },
                { key: 'tauxSecondaire', label: "Secondaire/Effet (%)" },
                { key: 'tauxQualite',    label: 'Qualité (%)' },
                { key: 'tauxN1',         label: 'Taux N+1 (%)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-500 mb-1">{label}</label>
                  <div className="relative">
                    <input type="number" min="0" max="200" step="0.1"
                      value={(form as any)[key] ?? 0}
                      onChange={e => setForm(p => ({ ...p, [key]: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 pr-7 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Check size={14} />
              {form.id ? 'Enregistrer' : 'Créer la règle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Produits() {
  const { commissionRules, companies, addCommissionRule, updateCommissionRule, deleteCommissionRule } = useApp();
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState<Partial<CommissionRule> | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ 'Santé': true });

  const uniqueCompanies = [...new Set(commissionRules.map(r => r.compagnie))].sort();

  const filteredRules = commissionRules.filter(r => {
    const matchCompany = !selectedCompany || r.compagnie === selectedCompany;
    const matchCat = !selectedCategory || r.categorie === selectedCategory;
    return matchCompany && matchCat;
  });

  const groupedByCategory = CATEGORIES.reduce((acc, cat) => {
    const rules = filteredRules.filter(r => r.categorie === cat);
    if (rules.length > 0) acc[cat] = rules;
    return acc;
  }, {} as Record<string, CommissionRule[]>);

  const handleSaveRule = (rule: CommissionRule) => {
    if (editRule?.id) {
      updateCommissionRule(rule.id, rule);
      toast.success('Règle mise à jour');
    } else {
      addCommissionRule(rule);
      toast.success('Règle de commission créée');
    }
    setShowModal(false);
    setEditRule(null);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Stats by company
  const companyStats = uniqueCompanies.map(company => ({
    nom: company,
    color: COMPANY_COLORS[company] || '#64748b',
    count: commissionRules.filter(r => r.compagnie === company).length,
    avgTaux: commissionRules.filter(r => r.compagnie === company).reduce((s, r) => s + r.tauxTotal, 0) /
             Math.max(commissionRules.filter(r => r.compagnie === company).length, 1),
  }));

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-800" style={{ fontSize: 20, fontWeight: 700 }}>Produits & Règles de Commission</h2>
          <p className="text-slate-500 text-sm mt-0.5">{commissionRules.length} règles configurées · {uniqueCompanies.length} compagnies</p>
        </div>
        <button
          onClick={() => { setEditRule(null); setShowModal(true); }}
          className="flex items-center gap-2 text-sm bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          Nouvelle règle
        </button>
      </div>

      {/* Company Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {companyStats.slice(0, 9).map((cs, i) => (
          <div
            key={i}
            onClick={() => setSelectedCompany(prev => prev === cs.nom ? '' : cs.nom)}
            className={`bg-white rounded-2xl p-3.5 shadow-sm border cursor-pointer transition-all hover:shadow-md ${selectedCompany === cs.nom ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200/60'}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: cs.color, fontSize: 8, fontWeight: 800 }}>
                {cs.nom.substring(0, 3)}
              </div>
              <p className="text-xs text-slate-700 truncate" style={{ fontWeight: 600 }}>{cs.nom}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{cs.count} règles</span>
              <span className="text-xs text-blue-600" style={{ fontWeight: 700 }}>{cs.avgTaux.toFixed(0)}% moy</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setSelectedCompany('')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${!selectedCompany ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            style={{ fontWeight: 500 }}
          >Toutes</button>
          {uniqueCompanies.slice(0, 6).map(company => (
            <button key={company}
              onClick={() => setSelectedCompany(prev => prev === company ? '' : company)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedCompany === company ? 'text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              style={{ fontWeight: 500, backgroundColor: selectedCompany === company ? (COMPANY_COLORS[company] || '#2563eb') : '' }}
            >
              {company.split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${!selectedCategory ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            style={{ fontWeight: 500 }}
          >Toutes</button>
          {CATEGORIES.map(cat => {
            const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES['Santé'];
            return (
              <button key={cat}
                onClick={() => setSelectedCategory(prev => prev === cat ? '' : cat)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedCategory === cat ? `${style.bg} ${style.text}` : 'text-slate-600 hover:bg-slate-50'}`}
                style={{ fontWeight: 500 }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules grouped by category */}
      <div className="space-y-4">
        {Object.entries(groupedByCategory).map(([category, rules]) => {
          const style = CATEGORY_STYLES[category] || CATEGORY_STYLES['Santé'];
          const isExpanded = expandedCategories[category] !== false;

          // Group by company within category
          const byCompany = [...new Set(rules.map(r => r.compagnie))].map(comp => ({
            company: comp,
            rules: rules.filter(r => r.compagnie === comp),
          }));

          return (
            <div key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                  <h3 className="text-slate-800" style={{ fontWeight: 700 }}>{category}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${style.bg} ${style.text}`} style={{ fontWeight: 600 }}>
                    {rules.length} produit{rules.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-slate-400">{byCompany.length} compagnie{byCompany.length > 1 ? 's' : ''}</span>
                </div>
                {isExpanded ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-5 py-2.5 text-left text-xs text-slate-400 whitespace-nowrap" style={{ fontWeight: 600 }}>Produit</th>
                        <th className="px-4 py-2.5 text-left text-xs text-slate-400" style={{ fontWeight: 600 }}>Compagnie</th>
                        <th className="px-4 py-2.5 text-left text-xs text-slate-400" style={{ fontWeight: 600 }}>Type</th>
                        <th className="px-4 py-2.5 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>Total N</th>
                        <th className="px-4 py-2.5 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>À souscription</th>
                        <th className="px-4 py-2.5 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>À l'effet</th>
                        <th className="px-4 py-2.5 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>Qualité</th>
                        <th className="px-4 py-2.5 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>N+1</th>
                        <th className="px-4 py-2.5 text-right text-xs text-slate-400" style={{ fontWeight: 600 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {rules.map(rule => {
                        const compColor = COMPANY_COLORS[rule.compagnie] || '#64748b';
                        return (
                          <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                                  <Package2 size={12} className={style.text} />
                                </div>
                                <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{rule.produit}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: compColor }} />
                                <span className="text-xs text-slate-600" style={{ fontWeight: 500 }}>{rule.compagnie}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs px-2 py-1 rounded-lg ${rule.typeCommission === 'Précompte' ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'}`} style={{ fontWeight: 600 }}>
                                {rule.typeCommission === 'Précompte' ? 'Précompte' : 'Linéaire'}
                              </span>
                            </td>
                            {[rule.tauxTotal, rule.tauxBase, rule.tauxSecondaire, rule.tauxQualite, rule.tauxN1].map((val, i) => (
                              <td key={i} className="px-4 py-3 text-center">
                                {val > 0 ? (
                                  <span className={`inline-flex items-center justify-center min-w-[48px] text-xs px-2 py-1 rounded-lg ${RATE_COLOR(val)}`} style={{ fontWeight: 700 }}>
                                    {val}%
                                  </span>
                                ) : (
                                  <span className="text-slate-300 text-xs">—</span>
                                )}
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditRule(rule); setShowModal(true); }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                  <Pencil size={12} />
                                </button>
                                <button onClick={() => {
                                  if (confirm('Supprimer cette règle ?')) {
                                    deleteCommissionRule(rule.id);
                                    toast.success('Règle supprimée');
                                  }
                                }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(groupedByCategory).length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200/60">
            <Package2 size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500" style={{ fontWeight: 600 }}>Aucun produit trouvé</p>
            <p className="text-slate-400 text-sm mt-1">Ajustez les filtres ou créez une nouvelle règle</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info size={15} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-900" style={{ fontWeight: 700 }}>Guide des taux de commission</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {[
                { label: 'Total N', desc: 'Taux global versé en première année (à la souscription + à l\'effet)' },
                { label: 'À souscription', desc: 'Commission principale versée dès la signature du contrat' },
                { label: "À l'effet", desc: 'Commission secondaire versée à la date d\'entrée en vigueur' },
                { label: 'N+1', desc: 'Taux de renouvellement versé chaque année à partir de l\'an 2' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex gap-2">
                  <span className="text-xs bg-white text-blue-700 px-2 py-0.5 rounded-lg flex-shrink-0" style={{ fontWeight: 700 }}>{label}</span>
                  <span className="text-xs text-blue-700">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <RuleModal
          rule={editRule}
          companies={companies}
          onClose={() => { setShowModal(false); setEditRule(null); }}
          onSave={handleSaveRule}
        />
      )}
    </div>
  );
}
