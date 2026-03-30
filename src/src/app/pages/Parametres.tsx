import { useState } from 'react';
import {
  Building2, Plus, Pencil, Trash2, X, Check, Settings,
  Shield, Bell, Database, Palette, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { Company } from '../data/types';

const PRESET_COLORS = [
  '#2563eb', '#7c3aed', '#059669', '#dc2626', '#d97706',
  '#0891b2', '#be185d', '#65a30d', '#7c3aed', '#1d4ed8',
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
          <h3 className="text-slate-800" style={{ fontWeight: 600 }}>
            {form.id ? 'Modifier la compagnie' : 'Nouvelle compagnie'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Nom complet *</label>
              <input type="text" value={form.nom || ''} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                placeholder="ex: ECA Assurances" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Code *</label>
              <input type="text" value={form.code || ''} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="ex: ECA" maxLength={5} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-2" style={{ fontWeight: 500 }}>Couleur</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button key={color} type="button" onClick={() => setForm(p => ({ ...p, couleur: color }))}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.couleur === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ backgroundColor: color }} />
              ))}
              <input type="color" value={form.couleur || '#2563eb'} onChange={e => setForm(p => ({ ...p, couleur: e.target.value }))}
                className="w-8 h-8 rounded-full cursor-pointer border-0 p-0" title="Couleur personnalisée" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>
              Taux de commission par défaut — <span style={{ color: form.couleur, fontWeight: 700 }}>{form.tauxDefaut || 30}%</span>
            </label>
            <input type="range" min="0" max="100" step="1" value={form.tauxDefaut || 30}
              onChange={e => setForm(p => ({ ...p, tauxDefaut: Number(e.target.value) }))}
              className="w-full accent-blue-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Contact</label>
              <input type="text" value={form.contact || ''} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1" style={{ fontWeight: 500 }}>Email</label>
              <input type="email" value={form.email || ''} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
            <span className="text-sm text-slate-700">Compagnie active</span>
            <button type="button" onClick={() => setForm(p => ({ ...p, actif: !p.actif }))}
              className={`w-10 h-6 rounded-full transition-colors ${form.actif ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${form.actif ? 'translate-x-4' : 'translate-x-0'}`} />
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
    lowPerformance: true,
  });
  const [generalSettings, setGeneralSettings] = useState({
    brokerName: 'Mon Cabinet de Courtage',
    siret: '123 456 789 00010',
    orias: 'N° 00 000 000',
    currency: 'EUR',
    fiscalYear: '2026',
    defaultCommissionType: 'Précompte',
  });

  const handleSaveCompany = (company: Company) => {
    if (editCompany?.id) {
      updateCompany(company.id, company);
      toast.success('Compagnie mise à jour');
    } else {
      addCompany(company);
      toast.success('Compagnie ajoutée avec succès');
    }
    setShowModal(false);
    setEditCompany(null);
  };

  const handleDeleteCompany = (id: string) => {
    if (confirm('Supprimer cette compagnie ? Les contrats associés ne seront pas affectés.')) {
      deleteCompany(id);
      toast.success('Compagnie supprimée');
    }
  };

  const handleSaveGeneral = () => {
    toast.success('Paramètres généraux enregistrés');
  };

  const handleSaveNotifs = () => {
    toast.success('Préférences de notifications enregistrées');
  };

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: 'compagnies', label: 'Compagnies', icon: Building2 },
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-slate-800 text-xl" style={{ fontWeight: 700 }}>Paramètres</h2>
        <p className="text-slate-500 text-sm mt-0.5">Configuration de votre espace courtier</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Compagnies actives', value: companies.filter(c => c.actif).length },
          { label: 'Règles configurées', value: commissionRules.length },
          { label: 'Contrats total', value: contracts.length },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 text-center">
            <p className="text-2xl text-blue-600" style={{ fontWeight: 700 }}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tab nav */}
        <div className="lg:w-52 flex-shrink-0">
          <nav className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm transition-colors border-b border-slate-100 last:border-0 ${activeTab === id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                style={{ fontWeight: activeTab === id ? 600 : 400 }}>
                <Icon size={16} />
                {label}
                {activeTab === id && <ChevronRight size={14} className="ml-auto text-blue-500" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'compagnies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Gestion des Compagnies</h3>
                <button onClick={() => { setEditCompany(null); setShowModal(true); }}
                  className="flex items-center gap-2 text-sm bg-blue-600 text-white rounded-xl px-3 py-2 hover:bg-blue-700 transition-colors">
                  <Plus size={14} />
                  Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {companies.map(company => {
                  const contractCount = contracts.filter(c => c.compagnie === company.nom).length;
                  const totalComm = contracts.filter(c => c.compagnie === company.nom).reduce((s, c) => s + c.commissionN, 0);
                  return (
                    <div key={company.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
                            style={{ backgroundColor: company.couleur, fontWeight: 700 }}>
                            {company.code}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-slate-800" style={{ fontWeight: 600 }}>{company.nom}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${company.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`} style={{ fontWeight: 500 }}>
                                {company.actif ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-slate-400">Taux défaut: <span style={{ fontWeight: 600, color: company.couleur }}>{company.tauxDefaut}%</span></span>
                              <span className="text-xs text-slate-400">{contractCount} contrat(s)</span>
                              {company.contact && <span className="text-xs text-slate-400 hidden sm:inline">{company.contact}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm" style={{ fontWeight: 700, color: company.couleur }}>
                              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalComm)}
                            </p>
                            <p className="text-xs text-slate-400">Commissions N</p>
                          </div>
                          <button onClick={() => { setEditCompany(company); setShowModal(true); }}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDeleteCompany(company.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {/* Commission rules for this company */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-2">Règles de commission configurées</p>
                        <div className="flex flex-wrap gap-1.5">
                          {commissionRules.filter(r => r.compagnie === company.nom).map(rule => (
                            <span key={rule.id} className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600" style={{ fontWeight: 500 }}>
                              {rule.produit} · {rule.commission1ereAnnee}%
                            </span>
                          ))}
                          {commissionRules.filter(r => r.compagnie === company.nom).length === 0 && (
                            <span className="text-xs text-slate-300">Aucune règle configurée</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 space-y-4">
              <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Paramètres Généraux</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Nom du cabinet</label>
                  <input type="text" value={generalSettings.brokerName}
                    onChange={e => setGeneralSettings(p => ({ ...p, brokerName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>SIRET</label>
                  <input type="text" value={generalSettings.siret}
                    onChange={e => setGeneralSettings(p => ({ ...p, siret: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Numéro ORIAS</label>
                  <input type="text" value={generalSettings.orias}
                    onChange={e => setGeneralSettings(p => ({ ...p, orias: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Exercice fiscal</label>
                  <select value={generalSettings.fiscalYear}
                    onChange={e => setGeneralSettings(p => ({ ...p, fiscalYear: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Devise</label>
                  <select value={generalSettings.currency}
                    onChange={e => setGeneralSettings(p => ({ ...p, currency: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="EUR">EUR — Euro</option>
                    <option value="USD">USD — Dollar US</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Type commission par défaut</label>
                  <select value={generalSettings.defaultCommissionType}
                    onChange={e => setGeneralSettings(p => ({ ...p, defaultCommissionType: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="Précompte">Précompte</option>
                    <option value="Linéaire">Linéaire</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Données</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Stockage local (localStorage)</span>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full" style={{ fontWeight: 500 }}>Actif</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Sauvegarde automatique</span>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full" style={{ fontWeight: 500 }}>Activée</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={handleSaveGeneral} className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm hover:bg-blue-700 transition-colors">
                  <Check size={14} />
                  Enregistrer les paramètres
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 space-y-4">
              <h3 className="text-slate-800" style={{ fontWeight: 600 }}>Préférences de Notifications</h3>
              <div className="space-y-3">
                {[
                  { key: 'newContract', label: 'Nouveau contrat créé', desc: 'Recevoir une notification à chaque création de contrat' },
                  { key: 'commissionReceived', label: 'Commission reçue', desc: 'Notification lors de l\'encaissement d\'une commission' },
                  { key: 'monthlyReport', label: 'Rapport mensuel automatique', desc: 'Résumé de vos revenus en début de mois' },
                  { key: 'lowPerformance', label: 'Alerte sous-performance', desc: 'Notification si les revenus sont en dessous des objectifs' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                    <div>
                      <p className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{label}</p>
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
                <button onClick={handleSaveNotifs} className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm hover:bg-blue-700 transition-colors">
                  <Check size={14} />
                  Enregistrer les préférences
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
