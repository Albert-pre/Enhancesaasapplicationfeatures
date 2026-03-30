import { useState, useRef } from 'react';
import {
  Plus, Search, Upload, Download, FileSpreadsheet, Filter,
  Eye, Pencil, Trash2, X, Check, AlertCircle, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useApp } from '../context/AppContext';
import { Contract } from '../data/types';
import { formatCurrency } from '../data/mockData';

const STATUS_COLORS: Record<string, string> = {
  'Actif': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
  'Résilié': 'bg-red-50 text-red-700 border-red-200',
  'Suspendu': 'bg-slate-100 text-slate-600 border-slate-200',
};

const COMPANY_COLORS: Record<string, string> = {
  'ECA': '#2563eb',
  'ZENIOO': '#7c3aed',
  'HARMONIE MUTUELLE': '#059669',
  'APRIL': '#dc2626',
};

function ContractModal({ contract, onClose, onSave, companies }: {
  contract: Partial<Contract> | null;
  onClose: () => void;
  onSave: (c: Contract) => void;
  companies: { nom: string }[];
}) {
  const [form, setForm] = useState<Partial<Contract>>(contract || {
    statut: 'Actif', typeCommission: 'Précompte', tauxCommission: 35, tauxN1: 10,
    repartitionSouscriptionPct: 70, repartitionEffetPct: 30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.compagnie || !form.produit) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }
    const primeBrute = Number(form.primeBrute) || 0;
    const tauxCommission = Number(form.tauxCommission) || 0;
    const tauxN1 = Number(form.tauxN1) || 0;
    const repartitionSouscriptionPct = Number(form.repartitionSouscriptionPct) || 70;
    const commissionAnnuelle = primeBrute * 12 * (tauxCommission / 100);
    const commissionN = commissionAnnuelle * (repartitionSouscriptionPct / 100) * 1.225;
    const commissionN1 = primeBrute * 12 * (tauxN1 / 100);

    onSave({
      id: form.id || `manual-${Date.now()}`,
      nom: form.nom || '',
      prenom: form.prenom || '',
      dateNaissance: form.dateNaissance,
      compagnie: form.compagnie || '',
      produit: form.produit || '',
      formule: form.formule || form.produit || '',
      typeCommission: form.typeCommission || 'Précompte',
      tauxCommission,
      dateSouscription: form.dateSouscription || new Date().toISOString().split('T')[0],
      repartitionSouscriptionPct,
      dateEffet: form.dateEffet || new Date().toISOString().split('T')[0],
      repartitionEffetPct: Number(form.repartitionEffetPct) || 30,
      tauxN1,
      primeBrute,
      repartitionSouscriptionEur: commissionAnnuelle * (repartitionSouscriptionPct / 100),
      repartitionEffetEur: commissionAnnuelle * ((100 - repartitionSouscriptionPct) / 100),
      commissionN,
      commissionN1,
      statut: form.statut || 'Actif',
    });
  };

  const fields = [
    { key: 'nom', label: 'Nom *', type: 'text' },
    { key: 'prenom', label: 'Prénom', type: 'text' },
    { key: 'dateNaissance', label: 'Date de naissance', type: 'date' },
    { key: 'compagnie', label: 'Compagnie *', type: 'select', options: companies.map(c => c.nom) },
    { key: 'produit', label: 'Produit *', type: 'text' },
    { key: 'formule', label: 'Formule', type: 'text' },
    { key: 'typeCommission', label: 'Type commission', type: 'select', options: ['Précompte', 'Linéaire'] },
    { key: 'tauxCommission', label: 'Taux commission (%)', type: 'number' },
    { key: 'primeBrute', label: 'Prime mensuelle (€)', type: 'number' },
    { key: 'dateSouscription', label: 'Date souscription', type: 'date' },
    { key: 'dateEffet', label: "Date d'effet", type: 'date' },
    { key: 'tauxN1', label: 'Taux N+1 (%)', type: 'number' },
    { key: 'statut', label: 'Statut', type: 'select', options: ['Actif', 'En attente', 'Résilié', 'Suspendu'] },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-slate-800 text-lg" style={{ fontWeight: 600 }}>
            {form.id ? 'Modifier le contrat' : 'Nouveau contrat'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, type, options }) => (
              <div key={key}>
                <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>{label}</label>
                {type === 'select' ? (
                  <select
                    value={(form as any)[key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Sélectionner...</option>
                    {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={type}
                    value={(form as any)[key] || ''}
                    onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
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
  const { contracts, companies, addContract, updateContract, deleteContract, setContracts } = useApp();
  const [search, setSearch] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterProduit, setFilterProduit] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editContract, setEditContract] = useState<Partial<Contract> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = contracts.filter(c => {
    const matchSearch = !search || `${c.nom} ${c.prenom} ${c.formule} ${c.compagnie}`.toLowerCase().includes(search.toLowerCase());
    const matchCompany = !filterCompany || c.compagnie === filterCompany;
    const matchProduit = !filterProduit || c.produit === filterProduit;
    const matchStatut = !filterStatut || c.statut === filterStatut;
    return matchSearch && matchCompany && matchProduit && matchStatut;
  });

  const uniqueCompanies = [...new Set(contracts.map(c => c.compagnie))];
  const uniqueProduits = [...new Set(contracts.map(c => c.produit))];

  const handleExportCSV = () => {
    const csv = Papa.unparse(contracts.map(c => ({
      'NOM': c.nom,
      'PRENOM': c.prenom,
      'DATE DE NAISSANCE': c.dateNaissance || '',
      'COMPAGNIE': c.compagnie,
      'PRODUIT': c.produit,
      'FORMULE': c.formule,
      'TYPE COMMISSION': c.typeCommission,
      'TAUX COMMISSION (%)': c.tauxCommission,
      'DATE SOUSCRIPTION': c.dateSouscription,
      'DATE EFFET': c.dateEffet,
      'TAUX N+1 (%)': c.tauxN1,
      'PRIME BRUTE (€)': c.primeBrute,
      'COMMISSION N (€)': c.commissionN.toFixed(2),
      'COMMISSION N+1 (€)': c.commissionN1.toFixed(2),
      'STATUT': c.statut,
    })));
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `contrats_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Export CSV réalisé avec succès !');
  };

  const handleExportExcel = () => {
    const data = contracts.map(c => ({
      'NOM': c.nom, 'PRENOM': c.prenom, 'COMPAGNIE': c.compagnie,
      'PRODUIT': c.produit, 'FORMULE': c.formule,
      'TYPE COMMISSION': c.typeCommission, 'TAUX (%)': c.tauxCommission,
      'DATE SOUSCRIPTION': c.dateSouscription, "DATE D'EFFET": c.dateEffet,
      'PRIME (€)': c.primeBrute, 'COMMISSION N (€)': c.commissionN.toFixed(2),
      'COMMISSION N+1 (€)': c.commissionN1.toFixed(2), 'STATUT': c.statut,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contrats');
    XLSX.writeFile(wb, `contrats_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export Excel réalisé avec succès !');
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
          if (row['COMPAGNIE'] || row['Compagnie'] || row['compagnie']) {
            const compagnie = row['COMPAGNIE'] || row['Compagnie'] || row['compagnie'] || '';
            const primeBrute = parseFloat((row['PRIME BRUTE (€)'] || row['PRIME (€)'] || row['primeBrute'] || '0').toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
            const tauxCommission = parseFloat((row['TAUX COMMISSION (%)'] || row['TAUX (%)'] || '35').toString()) || 35;
            const tauxN1 = parseFloat((row['TAUX N+1 (%)'] || '10').toString()) || 10;
            const commissionN = parseFloat((row['COMMISSION N (€)'] || '0').toString().replace(/[^\d.,]/g, '').replace(',', '.')) || primeBrute * 12 * (tauxCommission / 100);
            const commissionN1 = parseFloat((row['COMMISSION N+1 (€)'] || '0').toString().replace(/[^\d.,]/g, '').replace(',', '.')) || primeBrute * 12 * (tauxN1 / 100);

            addContract({
              id: `import-${Date.now()}-${count}`,
              nom: row['NOM'] || row['Nom'] || '',
              prenom: row['PRENOM'] || row['Prenom'] || row['Prénom'] || '',
              compagnie,
              produit: row['PRODUIT'] || row['Produit'] || '',
              formule: row['FORMULE'] || row['Formule'] || '',
              typeCommission: (row['TYPE COMMISSION'] || 'Précompte') as 'Précompte' | 'Linéaire',
              tauxCommission,
              dateSouscription: row['DATE SOUSCRIPTION'] || new Date().toISOString().split('T')[0],
              repartitionSouscriptionPct: 70,
              dateEffet: row["DATE D'EFFET"] || row['DATE EFFET'] || new Date().toISOString().split('T')[0],
              repartitionEffetPct: 30,
              tauxN1,
              primeBrute,
              repartitionSouscriptionEur: primeBrute * 12 * (tauxCommission / 100) * 0.7,
              repartitionEffetEur: primeBrute * 12 * (tauxCommission / 100) * 0.3,
              commissionN,
              commissionN1,
              statut: (row['STATUT'] || 'Actif') as Contract['statut'],
            });
            count++;
          }
        });
        toast.success(`${count} contrat(s) importé(s) avec succès !`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: () => toast.error("Erreur lors de l'import du fichier")
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

  const totalCommN = filtered.reduce((s, c) => s + c.commissionN, 0);
  const totalCommN1 = filtered.reduce((s, c) => s + c.commissionN1, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-slate-800 text-xl" style={{ fontWeight: 700 }}>Gestion des Contrats</h2>
          <p className="text-slate-500 text-sm mt-0.5">{contracts.length} contrat(s) au total</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleImportCSV} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Upload size={14} />
            <span className="hidden sm:inline">Importer CSV</span>
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 text-sm border border-emerald-200 rounded-xl px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
            <FileSpreadsheet size={14} />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
          <button onClick={() => { setEditContract(null); setShowModal(true); }} className="flex items-center gap-2 text-sm bg-blue-600 text-white rounded-xl px-3 py-2.5 hover:bg-blue-700 transition-colors">
            <Plus size={14} />
            <span>Nouveau contrat</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total contrats', value: contracts.length.toString(), color: 'blue' },
          { label: 'Contrats actifs', value: contracts.filter(c => c.statut === 'Actif').length.toString(), color: 'emerald' },
          { label: 'Commission N', value: formatCurrency(totalCommN), color: 'violet' },
          { label: 'Commission N+1', value: formatCurrency(totalCommN1), color: 'amber' },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
            <p className="text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>{item.label}</p>
            <p className={`text-lg text-${item.color}-600`} style={{ fontWeight: 700 }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un client, produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none">
            <option value="">Toutes compagnies</option>
            {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterProduit} onChange={e => setFilterProduit(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none">
            <option value="">Tous produits</option>
            {uniqueProduits.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none">
            <option value="">Tous statuts</option>
            {['Actif', 'En attente', 'Résilié', 'Suspendu'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || filterCompany || filterProduit || filterStatut) && (
            <button onClick={() => { setSearch(''); setFilterCompany(''); setFilterProduit(''); setFilterStatut(''); }} className="text-sm text-slate-500 hover:text-slate-700 px-2">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Table + Detail */}
      <div className={`flex gap-4 ${selectedContract ? 'flex-col lg:flex-row' : ''}`}>
        {/* Table */}
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden ${selectedContract ? 'lg:flex-1' : 'w-full'}`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Client', 'Compagnie', 'Produit / Formule', 'Type', 'Prime', 'Commission N', 'N+1', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 whitespace-nowrap" style={{ fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(contract => (
                  <tr
                    key={contract.id}
                    onClick={() => setSelectedContract(prev => prev?.id === contract.id ? null : contract)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedContract?.id === contract.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{contract.prenom} {contract.nom}</p>
                      {contract.dateNaissance && <p className="text-xs text-slate-400">{contract.dateNaissance}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0"
                          style={{ backgroundColor: COMPANY_COLORS[contract.compagnie] || '#64748b', fontWeight: 700, fontSize: '9px' }}>
                          {contract.compagnie.substring(0, 3)}
                        </div>
                        <span className="text-sm text-slate-600 whitespace-nowrap">{contract.compagnie}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{contract.formule}</p>
                      <p className="text-xs text-slate-400">{contract.produit}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg ${contract.typeCommission === 'Précompte' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`} style={{ fontWeight: 500 }}>
                        {contract.typeCommission === 'Précompte' ? 'P' : 'L'} · {contract.tauxCommission}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{formatCurrency(contract.primeBrute)}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ fontWeight: 600, color: '#2563eb' }}>{formatCurrency(contract.commissionN)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{formatCurrency(contract.commissionN1)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[contract.statut]}`} style={{ fontWeight: 500 }}>
                        {contract.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { setEditContract(contract); setShowModal(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(contract.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
            <p className="text-xs text-slate-400">{filtered.length} résultat(s)</p>
            <p className="text-xs text-slate-500">Total comm. N: <span style={{ fontWeight: 600, color: '#2563eb' }}>{formatCurrency(totalCommN)}</span></p>
          </div>
        </div>

        {/* Detail panel */}
        {selectedContract && (
          <div className="lg:w-80 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Détail contrat</h3>
              <button onClick={() => setSelectedContract(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg mx-auto mb-2"
                  style={{ backgroundColor: COMPANY_COLORS[selectedContract.compagnie] || '#64748b', fontWeight: 700 }}>
                  {selectedContract.compagnie.substring(0, 2)}
                </div>
                <p className="text-slate-800" style={{ fontWeight: 600 }}>{selectedContract.prenom} {selectedContract.nom}</p>
                <p className="text-slate-500 text-sm">{selectedContract.formule}</p>
                <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full border ${STATUS_COLORS[selectedContract.statut]}`} style={{ fontWeight: 500 }}>
                  {selectedContract.statut}
                </span>
              </div>
              {[
                { label: 'Compagnie', value: selectedContract.compagnie },
                { label: 'Produit', value: selectedContract.produit },
                { label: 'Type commission', value: selectedContract.typeCommission },
                { label: 'Taux commission', value: `${selectedContract.tauxCommission}%` },
                { label: 'Prime mensuelle', value: formatCurrency(selectedContract.primeBrute) },
                { label: 'Date souscription', value: selectedContract.dateSouscription },
                { label: "Date d'effet", value: selectedContract.dateEffet },
                { label: 'Taux N+1', value: `${selectedContract.tauxN1}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{label}</span>
                  <span className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{value}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between items-center bg-blue-50 rounded-xl p-3">
                  <span className="text-xs text-blue-700">Commission N</span>
                  <span className="text-blue-800" style={{ fontWeight: 700 }}>{formatCurrency(selectedContract.commissionN)}</span>
                </div>
                <div className="flex justify-between items-center bg-violet-50 rounded-xl p-3">
                  <span className="text-xs text-violet-700">Commission N+1</span>
                  <span className="text-violet-800" style={{ fontWeight: 700 }}>{formatCurrency(selectedContract.commissionN1)}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 rounded-xl p-3">
                  <span className="text-xs text-emerald-700">Total</span>
                  <span className="text-emerald-800" style={{ fontWeight: 700 }}>{formatCurrency(selectedContract.commissionN + selectedContract.commissionN1)}</span>
                </div>
              </div>
              <button onClick={() => { setEditContract(selectedContract); setShowModal(true); }} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
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
        />
      )}
    </div>
  );
}
