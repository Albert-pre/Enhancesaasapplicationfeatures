import { useState, useRef } from 'react';
import {
  Plus, Search, Upload, Download, FileSpreadsheet, X, Check,
  Pencil, Trash2, Eye, AlertTriangle, TrendingUp, Euro, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useApp } from '../context/AppContext';
import { Contract } from '../data/types';
import { formatCurrency, COMPANY_COLORS, CATEGORIES, computeCommissions } from '../data/mockData';

const STATUS_COLORS: Record<string, string> = {
  'Actif':      'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
  'Résilié':    'bg-red-50 text-red-700 border-red-200',
  'Suspendu':   'bg-slate-100 text-slate-600 border-slate-200',
};

function ContractModal({ contract, onClose, onSave, companies, commissionRules }: {
  contract: Partial<Contract> | null;
  onClose: () => void;
  onSave: (c: Contract) => void;
  companies: { nom: string }[];
  commissionRules: { id?: string; compagnie: string; produit: string; categorie: string; typeCommission: string; tauxTotal: number; tauxBase: number; tauxSecondaire: number; tauxQualite: number; tauxN1: number }[];
}) {
  const [form, setForm] = useState<Partial<Contract>>(contract || {
    statut: 'Actif', typeCommission: 'Pr��compte',
    tauxCommission: 35, tauxBase: 30, tauxSecondaire: 0, tauxN1: 10,
    categorie: 'Santé',
  });

  const companyRules = commissionRules.filter(r => r.compagnie === form.compagnie);

  const handleRuleSelect = (produit: string) => {
    const rule = companyRules.find(r => r.produit === produit);
    if (!rule) return;
    setForm(prev => ({
      ...prev,
      produit: rule.produit,
      categorie: rule.categorie,
      typeCommission: rule.typeCommission as 'Précompte' | 'Linéaire',
      tauxCommission: rule.tauxTotal,
      tauxBase: rule.tauxBase,
      tauxSecondaire: rule.tauxSecondaire,
      tauxN1: rule.tauxN1,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.compagnie || !form.produit) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    const primeBrute = Number(form.primeBrute) || 0;
    const tauxTotal = Number(form.tauxCommission) || 0;
    const tauxBase = Number(form.tauxBase) || 0;
    const tauxSecondaire = Number(form.tauxSecondaire) || 0;
    const tauxN1 = Number(form.tauxN1) || 0;
    const typeCommission = form.typeCommission || 'Précompte';

    const { commissionPrincipale, commissionSecondaire, commissionN, commissionN1 } =
      computeCommissions(primeBrute, typeCommission, tauxBase, tauxSecondaire, tauxTotal, tauxN1);

    onSave({
      id: form.id || `manual-${Date.now()}`,
      nom: form.nom || '',
      prenom: form.prenom || '',
      dateNaissance: form.dateNaissance,
      compagnie: form.compagnie || '',
      categorie: form.categorie || 'Santé',
      produit: form.produit || '',
      formule: form.formule || '',
      typeCommission,
      tauxCommission: tauxTotal,
      tauxBase,
      tauxSecondaire,
      dateSouscription: form.dateSouscription || new Date().toISOString().split('T')[0],
      dateEffet: form.dateEffet || new Date().toISOString().split('T')[0],
      tauxN1,
      primeBrute,
      commissionPrincipale,
      commissionSecondaire,
      commissionN,
      commissionN1,
      statut: form.statut || 'Actif',
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-slate-800 text-lg" style={{ fontWeight: 700 }}>
            {form.id ? 'Modifier le contrat' : 'Nouveau contrat'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Client */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3" style={{ fontWeight: 700 }}>Informations client</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Nom *</label>
                <input type="text" value={form.nom || ''} onChange={e => setForm(p => ({ ...p, nom: e.target.value.toUpperCase() }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Prénom</label>
                <input type="text" value={form.prenom || ''} onChange={e => setForm(p => ({ ...p, prenom: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Date de naissance</label>
                <input type="date" value={form.dateNaissance || ''} onChange={e => setForm(p => ({ ...p, dateNaissance: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Contrat */}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3" style={{ fontWeight: 700 }}>Contrat</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Compagnie *</label>
                <select value={form.compagnie || ''} onChange={e => setForm(p => ({ ...p, compagnie: e.target.value, produit: '' }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Sélectionner...</option>
                  {companies.map(c => <option key={c.nom} value={c.nom}>{c.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Produit *</label>
                <select value={form.produit || ''} onChange={e => handleRuleSelect(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Sélectionner...</option>
                  {companyRules.map(r => <option key={r.id || r.produit} value={r.produit}>{r.produit}</option>)}
                  <option value="__custom">Produit personnalisé...</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Catégorie</label>
                <select value={form.categorie || 'Santé'} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Formule</label>
                <input type="text" value={form.formule || ''} onChange={e => setForm(p => ({ ...p, formule: e.target.value }))}
                  placeholder="ex: Confort 3"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
          </div>

          {/* Commission */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3" style={{ fontWeight: 700 }}>Commission</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Type</label>
                <select value={form.typeCommission || 'Précompte'} onChange={e => setForm(p => ({ ...p, typeCommission: e.target.value as any }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                  <option value="Précompte">Précompte</option>
                  <option value="Linéaire">Linéaire</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Taux total N (%)</label>
                <input type="number" min="0" max="120" value={form.tauxCommission || 0} onChange={e => setForm(p => ({ ...p, tauxCommission: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Prime mensuelle (€)</label>
                <input type="number" min="0" value={form.primeBrute || ''} onChange={e => setForm(p => ({ ...p, primeBrute: Number(e.target.value) }))}
                  placeholder="100"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Taux base/souscription (%)</label>
                <input type="number" min="0" max="120" value={form.tauxBase || 0} onChange={e => setForm(p => ({ ...p, tauxBase: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Taux secondaire/effet (%)</label>
                <input type="number" min="0" max="50" value={form.tauxSecondaire || 0} onChange={e => setForm(p => ({ ...p, tauxSecondaire: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Taux N+1 (%)</label>
                <input type="number" min="0" max="30" value={form.tauxN1 || 0} onChange={e => setForm(p => ({ ...p, tauxN1: Number(e.target.value) }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            {/* Live commission preview */}
            {(form.primeBrute || 0) > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(() => {
                  const { commissionPrincipale, commissionSecondaire, commissionN, commissionN1 } =
                    computeCommissions(
                      form.primeBrute || 0,
                      form.typeCommission || 'Précompte',
                      form.tauxBase || 0,
                      form.tauxSecondaire || 0,
                      form.tauxCommission || 0,
                      form.tauxN1 || 0
                    );
                  return (
                    <>
                      <div className="bg-blue-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-blue-600" style={{ fontWeight: 500 }}>Comm. N</p>
                        <p className="text-sm text-blue-800" style={{ fontWeight: 700 }}>{formatCurrency(commissionN)}</p>
                      </div>
                      <div className="bg-violet-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-violet-600" style={{ fontWeight: 500 }}>Comm. N+1</p>
                        <p className="text-sm text-violet-800" style={{ fontWeight: 700 }}>{formatCurrency(commissionN1)}</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-emerald-600" style={{ fontWeight: 500 }}>Total 2 ans</p>
                        <p className="text-sm text-emerald-800" style={{ fontWeight: 700 }}>{formatCurrency(commissionN + commissionN1)}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Dates + Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Date souscription</label>
              <input type="date" value={form.dateSouscription || ''} onChange={e => setForm(p => ({ ...p, dateSouscription: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Date d'effet</label>
              <input type="date" value={form.dateEffet || ''} onChange={e => setForm(p => ({ ...p, dateEffet: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Statut</label>
              <select value={form.statut || 'Actif'} onChange={e => setForm(p => ({ ...p, statut: e.target.value as any }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                {['Actif', 'En attente', 'Résilié', 'Suspendu'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Check size={14} />
              {form.id ? 'Enregistrer' : 'Créer le contrat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Contrats() {
  const { contracts, companies, commissionRules, addContract, updateContract, deleteContract } = useApp();
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterCategorie, setFilterCategorie] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editContract, setEditContract] = useState<Partial<Contract> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = contracts.filter(c => {
    const matchSearch = !search || `${c.nom} ${c.prenom} ${c.produit} ${c.compagnie} ${c.formule}`.toLowerCase().includes(search.toLowerCase());
    const matchCompany = !filterCompany || c.compagnie === filterCompany;
    const matchCat = !filterCategorie || c.categorie === filterCategorie;
    const matchStatut = !filterStatut || c.statut === filterStatut;
    const matchType = !filterType || c.typeCommission === filterType;
    return matchSearch && matchCompany && matchCat && matchStatut && matchType;
  });

  const uniqueCompanies = [...new Set(contracts.map(c => c.compagnie))];

  const totalCommN = filtered.reduce((s, c) => s + c.commissionN, 0);
  const totalCommN1 = filtered.reduce((s, c) => s + c.commissionN1, 0);
  const totalPrime = filtered.reduce((s, c) => s + c.primeBrute, 0);

  const handleExportCSV = () => {
    const csv = Papa.unparse(contracts.map(c => ({
      'NOM': c.nom, 'PRENOM': c.prenom, 'DATE DE NAISSANCE': c.dateNaissance || '',
      'COMPAGNIE': c.compagnie, 'CATEGORIE': c.categorie, 'PRODUIT': c.produit, 'FORMULE': c.formule,
      'TYPE COMMISSION': c.typeCommission,
      'TAUX N (%)': c.tauxCommission, 'TAUX BASE (%)': c.tauxBase, 'TAUX SECONDAIRE (%)': c.tauxSecondaire, 'TAUX N+1 (%)': c.tauxN1,
      'DATE SOUSCRIPTION': c.dateSouscription, "DATE D'EFFET": c.dateEffet,
      'PRIME MENSUELLE (€)': c.primeBrute,
      'COMMISSION PRINCIPALE (€)': c.commissionPrincipale.toFixed(2),
      'COMMISSION SECONDAIRE (€)': c.commissionSecondaire.toFixed(2),
      'COMMISSION N (€)': c.commissionN.toFixed(2),
      'COMMISSION N+1 (€)': c.commissionN1.toFixed(2),
      'STATUT': c.statut,
    })));
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `contrats_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export CSV réalisé !');
  };

  const handleExportExcel = () => {
    const data = contracts.map(c => ({
      'NOM': c.nom, 'PRENOM': c.prenom, 'COMPAGNIE': c.compagnie,
      'CATEGORIE': c.categorie, 'PRODUIT': c.produit, 'FORMULE': c.formule,
      'TYPE': c.typeCommission, 'TAUX N (%)': c.tauxCommission,
      'DATE SOUSCRIPTION': c.dateSouscription, "DATE EFFET": c.dateEffet,
      'PRIME (€)': c.primeBrute,
      'COMM. PRINCIPALE (€)': c.commissionPrincipale.toFixed(2),
      'COMM. SECONDAIRE (€)': c.commissionSecondaire.toFixed(2),
      'COMM. N (€)': c.commissionN.toFixed(2),
      'COMM. N+1 (€)': c.commissionN1.toFixed(2),
      'STATUT': c.statut,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contrats');
    XLSX.writeFile(wb, `contrats_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export Excel réalisé !');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        let count = 0;
        results.data.forEach((row: any) => {
          const compagnie = row['COMPAGNIE'] || row['Compagnie'] || row['compagnie'] || '';
          if (!compagnie) return;
          const primeBrute = parseFloat((row['PRIME MENSUELLE (€)'] || row['PRIME (€)'] || row['primeBrute'] || '0').toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const tauxTotal = parseFloat((row['TAUX N (%)'] || row['TAUX COMMISSION (%)'] || '30').toString()) || 30;
          const tauxBase = parseFloat((row['TAUX BASE (%)'] || row['TAUX PRINCIPAL (%)'] || String(tauxTotal)).toString()) || tauxTotal;
          const tauxSecondaire = parseFloat((row['TAUX SECONDAIRE (%)'] || '0').toString()) || 0;
          const tauxN1 = parseFloat((row['TAUX N+1 (%)'] || '10').toString()) || 10;
          const typeCommission = (row['TYPE COMMISSION'] || 'Précompte') as 'Précompte' | 'Linéaire';
          const { commissionPrincipale, commissionSecondaire, commissionN, commissionN1 } =
            computeCommissions(primeBrute, typeCommission, tauxBase, tauxSecondaire, tauxTotal, tauxN1);

          addContract({
            id: `import-${Date.now()}-${count}`,
            nom: row['NOM'] || row['Nom'] || '',
            prenom: row['PRENOM'] || row['Prenom'] || row['Prénom'] || '',
            dateNaissance: row['DATE DE NAISSANCE'] || undefined,
            compagnie,
            categorie: row['CATEGORIE'] || row['Catégorie'] || 'Santé',
            produit: row['PRODUIT'] || row['Produit'] || '',
            formule: row['FORMULE'] || row['Formule'] || '',
            typeCommission,
            tauxCommission: tauxTotal,
            tauxBase,
            tauxSecondaire,
            dateSouscription: row['DATE SOUSCRIPTION'] || new Date().toISOString().split('T')[0],
            dateEffet: row["DATE D'EFFET"] || row['DATE EFFET'] || new Date().toISOString().split('T')[0],
            tauxN1,
            primeBrute,
            commissionPrincipale,
            commissionSecondaire,
            commissionN,
            commissionN1,
            statut: (row['STATUT'] || 'Actif') as Contract['statut'],
          });
          count++;
        });
        toast.success(`${count} contrat(s) importé(s) !`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: () => toast.error("Erreur lors de l'import")
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce contrat ?')) {
      deleteContract(id);
      toast.success('Contrat supprimé');
      if (selectedContract?.id === id) setSelectedContract(null);
    }
  };

  const handleSaveContract = (c: Contract) => {
    if (editContract?.id) {
      updateContract(c.id, c);
      toast.success('Contrat mis à jour');
    } else {
      addContract(c);
      toast.success('Contrat créé avec succès');
    }
    setShowModal(false);
    setEditContract(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-800" style={{ fontSize: 20, fontWeight: 700 }}>Gestion des Contrats</h2>
          <p className="text-slate-500 text-sm mt-0.5">{contracts.length} contrat(s) · {contracts.filter(c => c.statut === 'Actif').length} actifs</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleImportCSV} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Upload size={14} /><span className="hidden sm:inline">Importer</span>
          </button>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={14} /><span className="hidden sm:inline">CSV</span>
          </button>
          <button onClick={handleExportExcel}
            className="flex items-center gap-2 text-sm border border-emerald-200 rounded-xl px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
            <FileSpreadsheet size={14} /><span className="hidden sm:inline">Excel</span>
          </button>
          <button onClick={() => { setEditContract(null); setShowModal(true); }}
            className="flex items-center gap-2 text-sm bg-blue-600 text-white rounded-xl px-3 py-2.5 hover:bg-blue-700 transition-colors">
            <Plus size={14} /><span>Nouveau contrat</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total contrats', value: contracts.length.toString(), icon: FileSpreadsheet, color: '#2563eb' },
          { label: 'Primes mensuelles', value: formatCurrency(totalPrime), icon: Euro, color: '#7c3aed' },
          { label: 'Commissions N', value: formatCurrency(totalCommN), icon: TrendingUp, color: '#059669' },
          { label: 'Commissions N+1', value: formatCurrency(totalCommN1), icon: Clock, color: '#d97706' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: item.color }} />
                <p className="text-xs text-slate-500" style={{ fontWeight: 500 }}>{item.label}</p>
              </div>
              <p className="text-lg text-slate-800" style={{ fontWeight: 800, color: item.color }}>{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Rechercher nom, produit, compagnie..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          {[
            { value: filterCompany, onChange: setFilterCompany, options: uniqueCompanies, placeholder: 'Toutes compagnies' },
            { value: filterCategorie, onChange: setFilterCategorie, options: CATEGORIES, placeholder: 'Toutes catégories' },
            { value: filterStatut, onChange: setFilterStatut, options: ['Actif', 'En attente', 'Résilié', 'Suspendu'], placeholder: 'Tous statuts' },
            { value: filterType, onChange: setFilterType, options: ['Précompte', 'Linéaire'], placeholder: 'Tous types' },
          ].map((sel, i) => (
            <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none">
              <option value="">{sel.placeholder}</option>
              {sel.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          {(search || filterCompany || filterCategorie || filterStatut || filterType) && (
            <button onClick={() => { setSearch(''); setFilterCompany(''); setFilterCategorie(''); setFilterStatut(''); setFilterType(''); }}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 flex items-center gap-1">
              <X size={12} /> Effacer
            </button>
          )}
        </div>
      </div>

      {/* Table + Detail Panel */}
      <div className={`flex gap-4 ${selectedContract ? 'flex-col xl:flex-row' : ''}`}>
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden ${selectedContract ? 'xl:flex-1' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Client', 'Compagnie', 'Produit', 'Type', 'Prime', 'Comm. N', 'Comm. N+1', 'Statut', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(contract => (
                  <tr
                    key={contract.id}
                    onClick={() => setSelectedContract(prev => prev?.id === contract.id ? null : contract)}
                    className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${selectedContract?.id === contract.id ? 'bg-blue-50/60' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{contract.prenom} {contract.nom}</p>
                      {contract.dateNaissance && <p className="text-xs text-slate-400">{contract.dateNaissance}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: COMPANY_COLORS[contract.compagnie] || '#64748b', fontSize: 8, fontWeight: 800 }}>
                          {contract.compagnie.substring(0, 3)}
                        </div>
                        <span className="text-xs text-slate-600 whitespace-nowrap">{contract.compagnie}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{contract.formule || contract.produit}</p>
                      <p className="text-xs text-slate-400">{contract.categorie}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${contract.typeCommission === 'Précompte' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`} style={{ fontWeight: 600 }}>
                        {contract.typeCommission === 'Précompte' ? 'P' : 'L'} · {contract.tauxCommission}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{formatCurrency(contract.primeBrute)}/m</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-blue-700" style={{ fontWeight: 700 }}>{formatCurrency(contract.commissionN)}</p>
                      {contract.commissionSecondaire > 0 && (
                        <p className="text-xs text-violet-500">{formatCurrency(contract.commissionPrincipale)} + {formatCurrency(contract.commissionSecondaire)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap" style={{ fontWeight: 500 }}>{formatCurrency(contract.commissionN1)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[contract.statut]}`} style={{ fontWeight: 500 }}>
                        {contract.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditContract(contract); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(contract.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400 text-sm">Aucun contrat trouvé</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">{filtered.length} résultat(s) sur {contracts.length}</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">Total N: <span style={{ fontWeight: 700, color: '#2563eb' }}>{formatCurrency(totalCommN)}</span></span>
              <span className="text-slate-500">N+1: <span style={{ fontWeight: 700, color: '#7c3aed' }}>{formatCurrency(totalCommN1)}</span></span>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedContract && (
          <div className="xl:w-80 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Détail contrat</h3>
              <button onClick={() => setSelectedContract(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={15} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg mx-auto mb-2"
                  style={{ backgroundColor: COMPANY_COLORS[selectedContract.compagnie] || '#64748b', fontWeight: 800, fontSize: 11 }}>
                  {selectedContract.compagnie.substring(0, 3)}
                </div>
                <p className="text-slate-800" style={{ fontWeight: 700 }}>{selectedContract.prenom} {selectedContract.nom}</p>
                <p className="text-slate-500 text-sm">{selectedContract.formule || selectedContract.produit}</p>
                <p className="text-slate-400 text-xs">{selectedContract.compagnie} · {selectedContract.categorie}</p>
                <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full border ${STATUS_COLORS[selectedContract.statut]}`} style={{ fontWeight: 500 }}>
                  {selectedContract.statut}
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Type commission', value: selectedContract.typeCommission },
                  { label: 'Taux total N', value: `${selectedContract.tauxCommission}%` },
                  { label: 'Taux base (souscription)', value: `${selectedContract.tauxBase}%` },
                  { label: "Taux secondaire (effet)", value: `${selectedContract.tauxSecondaire}%` },
                  { label: 'Taux N+1', value: `${selectedContract.tauxN1}%` },
                  { label: 'Prime mensuelle', value: `${formatCurrency(selectedContract.primeBrute)}/mois` },
                  { label: 'Date souscription', value: selectedContract.dateSouscription },
                  { label: "Date d'effet", value: selectedContract.dateEffet },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">{label}</span>
                    <span className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-blue-600" style={{ fontWeight: 500 }}>Commission N</p>
                      {selectedContract.commissionSecondaire > 0 && (
                        <p className="text-xs text-blue-400 mt-0.5">
                          {formatCurrency(selectedContract.commissionPrincipale)} souscription
                          + {formatCurrency(selectedContract.commissionSecondaire)} effet
                        </p>
                      )}
                    </div>
                    <span className="text-blue-800" style={{ fontWeight: 800 }}>{formatCurrency(selectedContract.commissionN)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-violet-50 rounded-xl p-3">
                  <span className="text-xs text-violet-700">Commission N+1</span>
                  <span className="text-violet-800" style={{ fontWeight: 800 }}>{formatCurrency(selectedContract.commissionN1)}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 rounded-xl p-3">
                  <span className="text-xs text-emerald-700">Total 2 ans</span>
                  <span className="text-emerald-800" style={{ fontWeight: 800 }}>{formatCurrency(selectedContract.commissionN + selectedContract.commissionN1)}</span>
                </div>
              </div>

              <button onClick={() => { setEditContract(selectedContract); setShowModal(true); }}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Pencil size={13} />
                Modifier ce contrat
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ContractModal
          contract={editContract}
          onClose={() => { setShowModal(false); setEditContract(null); }}
          onSave={handleSaveContract}
          companies={companies}
          commissionRules={commissionRules as any}
        />
      )}
    </div>
  );
}