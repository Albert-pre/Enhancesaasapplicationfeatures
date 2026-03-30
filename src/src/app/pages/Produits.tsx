import { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, X, Check, Package2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { CommissionRule } from '../data/types';
import { CATEGORIES } from '../data/mockData';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Santé': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'Prévoyance': { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  'Obsèques': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' },
  'Animaux': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

function RuleModal({ rule, companies, onClose, onSave }: {
  rule: Partial<CommissionRule> | null;
  companies: { nom: string }[];
  onClose: () => void;
  onSave: (r: CommissionRule) => void;
}) {
  const [form, setForm] = useState<Partial<CommissionRule>>(rule || {
    typeCommission: 'Précompte',
    commission1ereAnnee: 30,
    commissionBase: 20,
    commissionSuivi: 18,
    commissionQualite: 5,
    tauxN1: 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.compagnie || !form.produit || !form.categorie) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    onSave({
      id: form.id || `rule-${Date.now()}`,
      compagnie: form.compagnie || '',
      categorie: form.categorie || '',
      produit: form.produit || '',
      typeCommission: form.typeCommission || 'Précompte',
      commission1ereAnnee: Number(form.commission1ereAnnee) || 0,
      commissionBase: Number(form.commissionBase) || 0,
      commissionSuivi: Number(form.commissionSuivi) || 0,
      commissionQualite: Number(form.commissionQualite) || 0,
      tauxN1: Number(form.tauxN1) || 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-slate-800" style={{ fontWeight: 600 }}>
            {form.id ? 'Modifier la règle' : 'Nouvelle règle de commission'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Compagnie *</label>
              <select value={form.compagnie || ''} onChange={e => setForm(p => ({ ...p, compagnie: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">Sélectionner...</option>
                {companies.map(c => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Catégorie *</label>
              <select value={form.categorie || ''} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
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
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Type de commission</label>
              <select value={form.typeCommission || 'Précompte'} onChange={e => setForm(p => ({ ...p, typeCommission: e.target.value as any }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="Précompte">Précompte</option>
                <option value="Linéaire">Linéaire</option>
              </select>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Taux de commission</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'commission1ereAnnee', label: '1ère année (%)' },
                { key: 'commissionBase', label: 'Base (%)' },
                { key: 'commissionSuivi', label: 'Suivi (%)' },
                { key: 'commissionQualite', label: 'Qualité (%)' },
                { key: 'tauxN1', label: 'Taux N+1 (%)' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-500 mb-1">{label}</label>
                  <div className="relative">
                    <input type="number" min="0" max="200" value={(form as any)[key] || 0}
                      onChange={e => setForm(p => ({ ...p, [key]: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 pr-8 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
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

  const uniqueCompanies = [...new Set(commissionRules.map(r => r.compagnie))];
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

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cette règle de commission ?')) {
      deleteCommissionRule(id);
      toast.success('Règle supprimée');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-800 text-xl" style={{ fontWeight: 700 }}>Produits & Règles de Commission</h2>
          <p className="text-slate-500 text-sm mt-0.5">{commissionRules.length} règle(s) configurée(s)</p>
        </div>
        <button
          onClick={() => { setEditRule(null); setShowModal(true); }}
          className="flex items-center gap-2 text-sm bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          Nouvelle règle
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setSelectedCompany('')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!selectedCompany ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            style={{ fontWeight: 500 }}
          >
            Toutes
          </button>
          {uniqueCompanies.map(company => (
            <button
              key={company}
              onClick={() => setSelectedCompany(prev => prev === company ? '' : company)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCompany === company ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              style={{ fontWeight: 500 }}
            >
              {company}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!selectedCategory ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            style={{ fontWeight: 500 }}
          >
            Toutes catégories
          </button>
          {CATEGORIES.map(cat => {
            const colors = CATEGORY_COLORS[cat] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' };
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(prev => prev === cat ? '' : cat)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory === cat ? `${colors.bg} ${colors.text}` : 'text-slate-600 hover:bg-slate-50'}`}
                style={{ fontWeight: 500 }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules grouped by category */}
      <div className="space-y-5">
        {Object.entries(groupedByCategory).map(([category, rules]) => {
          const colors = CATEGORY_COLORS[category] || { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' };
          return (
            <div key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              {/* Category Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <h3 className="text-slate-800" style={{ fontWeight: 600 }}>{category}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`} style={{ fontWeight: 500 }}>
                    {rules.length} produit{rules.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Rules Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-left text-xs text-slate-400" style={{ fontWeight: 600 }}>Produit</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-400" style={{ fontWeight: 600 }}>Compagnie</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-400" style={{ fontWeight: 600 }}>Type</th>
                      <th className="px-4 py-3 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>1ère année</th>
                      <th className="px-4 py-3 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>Base</th>
                      <th className="px-4 py-3 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>Suivi</th>
                      <th className="px-4 py-3 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>Qualité</th>
                      <th className="px-4 py-3 text-center text-xs text-slate-400" style={{ fontWeight: 600 }}>N+1</th>
                      <th className="px-4 py-3 text-right text-xs text-slate-400" style={{ fontWeight: 600 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rules.map(rule => (
                      <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.bg}`}>
                              <Package2 size={13} className={colors.text} />
                            </div>
                            <span className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{rule.produit}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-600">{rule.compagnie}</td>
                        <td className="px-4 py-3.5">
                          <span className={`text-xs px-2 py-1 rounded-lg ${rule.typeCommission === 'Précompte' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`} style={{ fontWeight: 500 }}>
                            {rule.typeCommission}
                          </span>
                        </td>
                        {[rule.commission1ereAnnee, rule.commissionBase, rule.commissionSuivi, rule.commissionQualite, rule.tauxN1].map((val, i) => (
                          <td key={i} className="px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[48px] text-sm px-2 py-1 rounded-lg ${
                              val >= 50 ? 'bg-emerald-50 text-emerald-700' :
                              val >= 25 ? 'bg-blue-50 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`} style={{ fontWeight: 600 }}>
                              {val}%
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditRule(rule); setShowModal(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => handleDelete(rule.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {Object.keys(groupedByCategory).length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200/60">
            <Package2 size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500" style={{ fontWeight: 500 }}>Aucun produit trouvé</p>
            <p className="text-slate-400 text-sm mt-1">Ajoutez une règle de commission pour commencer</p>
            <button onClick={() => { setEditRule(null); setShowModal(true); }} className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors">
              <Plus size={14} />
              Créer une règle
            </button>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
        <Tag size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p style={{ fontWeight: 600 }}>Règles de commission ECA</p>
          <p className="text-blue-600 mt-1 text-xs">
            Commission de base versée à la création (produits senior) ou au 1er prélèvement (autres). 
            Commission de suivi versée 12 mois après le 1er encaissement. 
            Commission qualité versée après la 14ème cotisation.
          </p>
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
