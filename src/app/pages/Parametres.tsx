import { useState } from 'react';
import {
  Building2, Plus, Pencil, Trash2, X, Check,
  Settings, Bell, ChevronRight, Database, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { Company } from '../data/types';
import { COMPANY_COLORS, formatCurrency } from '../data/mockData';

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#0891b2', '#be185d', '#059669',
  '#d97706', '#65a30d', '#0d9488', '#6366f1', '#dc2626',
];

function CompanyModal({ company, onClose, onSave }: {
  company: Partial<Company> | null;
  onClose: () => void;
  onSave: (c: Company) => void;
}) {
  const [form, setForm] = useState<Partial<Company>>(company || {
    actif: true, couleur: '#2563eb', tauxDefaut: 30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.code) {
      toast.error('Nom et code sont requis');
      return;
    }
    onSave({
      id: form.id || `company-${Date.now()}`,
      nom: form.nom || '',
      code: form.code || '',
      couleur: form.couleur || '#2563eb',
      tauxDefaut: Number(form.tauxDefaut) || 30,
      actif: form.actif !== false,
      contact: form.contact,
      email: form.email,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-slate-800" style={{ fontWeight: 700 }}>
            {form.id ? 'Modifier la compagnie' : 'Nouvelle compagnie'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Nom complet *</label>
              <input type="text" value={form.nom || ''} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                placeholder="ex: ECA Assurances"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Code *</label>
              <input type="text" value={form.code || ''} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="ex: ECA" maxLength={5}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-2" style={{ fontWeight: 500 }}>Couleur</label>
            <div className="flex flex-wrap gap-2 items-center">
              {PRESET_COLORS.map(color => (
                <button key={color} type="button" onClick={() => setForm(p => ({ ...p, couleur: color }))}
                  className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${form.couleur === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ backgroundColor: color }} />
              ))}
              <input type="color" value={form.couleur || '#2563eb'} onChange={e => setForm(p => ({ ...p, couleur: e.target.value }))}
                className="w-7 h-7 rounded-full cursor-pointer border-0 p-0" title="Couleur personnalisée" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>
              Taux par défaut — <span style={{ color: form.couleur, fontWeight: 700 }}>{form.tauxDefaut || 30}%</span>
            </label>
            <input type="range" min="0" max="100" step="1" value={form.tauxDefaut || 30}
              onChange={e => setForm(p => ({ ...p, tauxDefaut: Number(e.target.value) }))}
              className="w-full accent-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Contact</label>
              <input type="text" value={form.contact || ''} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Email</label>
              <input type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5">
            <div>
              <p className="text-sm text-slate-700" style={{ fontWeight: 500 }}>Compagnie active</p>
              <p className="text-xs text-slate-400">Visible dans les sélections</p>
            </div>
            <button type="button" onClick={() => setForm(p => ({ ...p, actif: !p.actif }))}
              className={`w-10 h-6 rounded-full transition-all duration-200 ${form.actif ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mx-1 ${form.actif ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm hover:bg-slate-50 transition-colors">
              Annuler
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <Check size={14} />
              {form.id ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type Tab = 'compagnies' | 'general' | 'notifications';

export default function Parametres() {
  const { companies, addCompany, updateCompany, deleteCompany, contracts, commissionRules } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('compagnies');
  const [showModal, setShowModal] = useState(false);
  const [editCompany, setEditCompany] = useState<Partial<Company> | null>(null);
  const [notifs, setNotifs] = useState({
    newContract: true,
    commissionReceived: true,
    monthlyReport: false,
    renewalAlert: true,
    lowPerformance: true,
  });
  const [generalSettings, setGeneralSettings] = useState({
    brokerName: 'Mon Cabinet de Courtage',
    siret: '123 456 789 00010',
    orias: 'N° 00 000 000',
    currency: 'EUR',
    fiscalYear: '2026',
    defaultCommissionType: 'Précompte',
    renewalAlertDays: '90',
  });

  const handleSaveCompany = (company: Company) => {
    if (editCompany?.id) {
      updateCompany(company.id, company);
      toast.success('Compagnie mise à jour');
    } else {
      addCompany(company);
      toast.success('Compagnie ajoutée');
    }
    setShowModal(false);
    setEditCompany(null);
  };

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: 'compagnies',    label: 'Compagnies',    icon: Building2 },
    { id: 'general',       label: 'Général',        icon: Settings },
    { id: 'notifications', label: 'Notifications',  icon: Bell },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h2 className="text-slate-800" style={{ fontSize: 20, fontWeight: 700 }}>Paramètres</h2>
        <p className="text-slate-500 text-sm mt-0.5">Configuration de votre espace CommissPro</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Compagnies actives', value: companies.filter(c => c.actif).length, color: '#2563eb' },
          { label: 'Règles configurées', value: commissionRules.length, color: '#7c3aed' },
          { label: 'Contrats total', value: contracts.length, color: '#059669' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 text-center">
            <p className="text-2xl" style={{ fontWeight: 800, color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tabs */}
        <div className="lg:w-52 flex-shrink-0">
          <nav className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors border-b border-slate-100 last:border-0 ${activeTab === id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                style={{ fontWeight: activeTab === id ? 700 : 400 }}>
                <Icon size={15} />
                {label}
                {activeTab === id && <ChevronRight size={13} className="ml-auto text-blue-500" />}
              </button>
            ))}
          </nav>

          {/* Data storage info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Database size={13} className="text-slate-500" />
              <span className="text-xs text-slate-600" style={{ fontWeight: 600 }}>Stockage local</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Contrats</span>
                <span className="text-xs text-emerald-600" style={{ fontWeight: 600 }}>Sauvegardés</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Règles</span>
                <span className="text-xs text-emerald-600" style={{ fontWeight: 600 }}>Sauvegardées</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Compagnies</span>
                <span className="text-xs text-emerald-600" style={{ fontWeight: 600 }}>Sauvegardées</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Companies Tab */}
          {activeTab === 'compagnies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Gestion des Compagnies</h3>
                <button onClick={() => { setEditCompany(null); setShowModal(true); }}
                  className="flex items-center gap-2 text-sm bg-blue-600 text-white rounded-xl px-3 py-2 hover:bg-blue-700 transition-colors">
                  <Plus size={14} />Ajouter
                </button>
              </div>

              <div className="space-y-3">
                {companies.map(company => {
                  const contractCount = contracts.filter(c => c.compagnie === company.nom).length;
                  const activeCount = contracts.filter(c => c.compagnie === company.nom && c.statut === 'Actif').length;
                  const totalComm = contracts.filter(c => c.compagnie === company.nom && c.statut === 'Actif').reduce((s, c) => s + c.commissionN, 0);
                  const ruleCount = commissionRules.filter(r => r.compagnie === company.nom).length;
                  const compColor = COMPANY_COLORS[company.nom] || company.couleur;

                  return (
                    <div key={company.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: compColor, fontWeight: 800, fontSize: 11 }}>
                            {company.code}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-slate-800" style={{ fontWeight: 700 }}>{company.nom}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${company.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`} style={{ fontWeight: 500 }}>
                                {company.actif ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="text-xs text-slate-400">Taux défaut: <span style={{ fontWeight: 700, color: compColor }}>{company.tauxDefaut}%</span></span>
                              <span className="text-xs text-slate-400">{activeCount}/{contractCount} contrats actifs</span>
                              <span className="text-xs text-slate-400">{ruleCount} règles</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm" style={{ fontWeight: 700, color: compColor }}>
                              {formatCurrency(totalComm)}
                            </p>
                            <p className="text-xs text-slate-400">Commissions N</p>
                          </div>
                          <button onClick={() => { setEditCompany(company); setShowModal(true); }}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => {
                            if (confirm('Supprimer cette compagnie ?')) {
                              deleteCompany(company.id);
                              toast.success('Compagnie supprimée');
                            }
                          }} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Commission rules preview */}
                      {commissionRules.filter(r => r.compagnie === company.nom).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-xs text-slate-400 mb-2">Produits configurés ({ruleCount})</p>
                          <div className="flex flex-wrap gap-1.5">
                            {commissionRules.filter(r => r.compagnie === company.nom).slice(0, 5).map(rule => (
                              <span key={rule.id} className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600" style={{ fontWeight: 500 }}>
                                {rule.produit.split(' ').slice(0, 3).join(' ')} · {rule.tauxTotal}%
                              </span>
                            ))}
                            {ruleCount > 5 && (
                              <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400" style={{ fontWeight: 500 }}>
                                +{ruleCount - 5} autres
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 space-y-4">
              <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Paramètres Généraux</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'brokerName', label: 'Nom du cabinet', type: 'text' },
                  { key: 'siret', label: 'SIRET', type: 'text' },
                  { key: 'orias', label: 'Numéro ORIAS', type: 'text' },
                  { key: 'renewalAlertDays', label: 'Alerte renouvellement (jours)', type: 'number' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>{label}</label>
                    <input type={type} value={(generalSettings as any)[key]}
                      onChange={e => setGeneralSettings(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                ))}
                {[
                  { key: 'fiscalYear', label: 'Exercice fiscal', options: ['2025', '2026', '2027'] },
                  { key: 'defaultCommissionType', label: 'Type commission par défaut', options: ['Précompte', 'Linéaire'] },
                ].map(({ key, label, options }) => (
                  <div key={key}>
                    <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>{label}</label>
                    <select value={(generalSettings as any)[key]}
                      onChange={e => setGeneralSettings(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className="text-slate-500" />
                  <p className="text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 700 }}>Données & Sécurité</p>
                </div>
                {[
                  { label: 'Stockage localStorage', status: 'Actif' },
                  { label: 'Sauvegarde automatique', status: 'Activée' },
                  { label: 'Chiffrement des données', status: 'Local uniquement' },
                ].map(({ label, status }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{label}</span>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full" style={{ fontWeight: 500 }}>{status}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button onClick={() => toast.success('Paramètres enregistrés')}
                  className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm hover:bg-blue-700 transition-colors">
                  <Check size={14} />
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 space-y-4">
              <h3 className="text-slate-800" style={{ fontWeight: 700 }}>Préférences de Notifications</h3>
              <div className="space-y-3">
                {[
                  { key: 'newContract', label: 'Nouveau contrat créé', desc: 'Notification à chaque création de contrat' },
                  { key: 'commissionReceived', label: 'Commission reçue', desc: "Notification lors d'un encaissement" },
                  { key: 'renewalAlert', label: 'Alerte renouvellement', desc: 'Contrats arrivant à 11 mois' },
                  { key: 'monthlyReport', label: 'Rapport mensuel automatique', desc: 'Résumé de vos revenus en début de mois' },
                  { key: 'lowPerformance', label: 'Alerte sous-performance', desc: "Si les revenus sont en dessous des objectifs" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                    <div>
                      <p className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <button type="button" onClick={() => setNotifs(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                      className={`w-10 h-6 rounded-full transition-all duration-200 flex-shrink-0 ml-4 ${(notifs as any)[key] ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform mx-1 ${(notifs as any)[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={() => toast.success('Préférences enregistrées')}
                  className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm hover:bg-blue-700 transition-colors">
                  <Check size={14} />
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CompanyModal
          company={editCompany}
          onClose={() => { setShowModal(false); setEditCompany(null); }}
          onSave={handleSaveCompany}
        />
      )}
    </div>
  );
}
