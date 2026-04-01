import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Contract, CommissionRule, Company, CashFlowEntry, PortfolioMetrics } from '../data/types';
import { CONTRACTS, COMMISSION_RULES, COMPANIES, MONTHS_FR } from '../data/mockData';
import { useAuth } from './AuthContext';
import { contractsService, type RemoteCommissionRule } from '../services/contractsService';
import { companiesService } from '../services/companiesService';
import { productsService } from '../services/productsService';

interface AppContextType {
  contracts: Contract[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  commissionRules: CommissionRule[];
  setCommissionRules: React.Dispatch<React.SetStateAction<CommissionRule[]>>;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;

  addContract: (contract: Contract) => Promise<void>;
  updateContract: (id: string, contract: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;

  addCommissionRule: (rule: CommissionRule) => Promise<void>;
  updateCommissionRule: (id: string, rule: Partial<CommissionRule>) => Promise<void>;
  deleteCommissionRule: (id: string) => Promise<void>;

  addCompany: (company: Company) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;

  // Data loading state
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;

  // Computed metrics
  totalRevenue: number;
  forecastRevenue: number;
  activeContractsCount: number;
  cashFlow: CashFlowEntry[];
  portfolioMetrics: PortfolioMetrics;
  renewalAlerts: RenewalAlert[];
}

interface RenewalAlert {
  contractId: string;
  nom: string;
  prenom: string;
  compagnie: string;
  produit: string;
  dateSouscription: string;
  moisRestants: number;
  commissionN1Attendue: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function mergeCommissionRulesWithDefaults(storedRules: CommissionRule[]): CommissionRule[] {
  if (!Array.isArray(storedRules) || storedRules.length === 0) return COMMISSION_RULES;

  const byId = new Map(storedRules.map(rule => [rule.id, rule]));

  return COMMISSION_RULES.map(defaultRule => {
    const stored = byId.get(defaultRule.id);
    if (!stored) return defaultRule;
    return {
      ...stored,
      // Always keep delay/reference metadata aligned with current code defaults.
      baseDelayMonths: defaultRule.baseDelayMonths ?? stored.baseDelayMonths,
      secondaryDelayMonths: defaultRule.secondaryDelayMonths ?? stored.secondaryDelayMonths,
      n1DelayMonths: defaultRule.n1DelayMonths ?? stored.n1DelayMonths,
      baseReference: defaultRule.baseReference ?? stored.baseReference,
      secondaryReference: defaultRule.secondaryReference ?? stored.secondaryReference,
      n1Reference: defaultRule.n1Reference ?? stored.n1Reference,
    };
  });
}

function normalizeRemoteCommissionRule(rule: RemoteCommissionRule): CommissionRule {
  const categorie = (rule.categorie || '').trim() || '*';
  const id =
    `${rule.compagnie}__${categorie}__${rule.produit}__${rule.sourceSheet || 'sheet'}`
      .replace(/\s+/g, '_')
      .replace(/[^\w.-]/g, '')
      .toLowerCase();

  return {
    id,
    compagnie: rule.compagnie,
    categorie,
    produit: rule.produit,
    typeCommission: rule.typeCommission,
    tauxTotal: Number(rule.tauxTotal || 0),
    tauxBase: Number(rule.tauxBase || 0),
    tauxSecondaire: Number(rule.tauxSecondaire || 0),
    tauxQualite: Number(rule.tauxQualite || 0),
    tauxN1: Number(rule.tauxN1 || 0),
    baseDelayMonths: rule.baseDelayMonths,
    secondaryDelayMonths: rule.secondaryDelayMonths,
    n1DelayMonths: rule.n1DelayMonths,
    baseReference: rule.baseReference,
    secondaryReference: rule.secondaryReference,
    n1Reference: rule.n1Reference,
  };
}

function parseFrDate(value: string | undefined): Date | null {
  if (!value) return null;
  if (value.includes('-')) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(p => Number(p));
  if (!dd || !mm || !yyyy) return null;
  const d = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function getReferenceDate(contract: Contract, reference?: 'souscription' | 'effet' | 'premiere_prime'): Date {
  const souscription = parseFrDate(contract.dateSouscription);
  const effet = parseFrDate(contract.dateEffet || contract.dateSouscription);

  if (reference === 'effet') return effet || souscription || new Date(NaN);
  if (reference === 'premiere_prime') {
    if (effet) return addMonths(effet, 1);
    if (souscription) return addMonths(souscription, 1);
    return new Date(NaN);
  }

  return souscription || effet || new Date(NaN);
}

function buildCashFlow(contracts: Contract[]): CashFlowEntry[] {
  const flowMap = new Map<string, { commissionPrincipale: number; commissionSecondaire: number; commissionN1: number }>();

  const getKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;

  contracts.forEach(contract => {
    if (contract.statut === 'Résilié') return;

    if (contract.typeCommission === 'Précompte') {
      // Commission principale (référence + délai configurable)
      const baseDate = addMonths(
        getReferenceDate(contract, contract.baseReference),
        contract.baseDelayMonths ?? 0
      );
      if (Number.isNaN(baseDate.getTime())) return;
      const k1 = getKey(baseDate.getFullYear(), baseDate.getMonth());
      const prev1 = flowMap.get(k1) || { commissionPrincipale: 0, commissionSecondaire: 0, commissionN1: 0 };
      flowMap.set(k1, { ...prev1, commissionPrincipale: prev1.commissionPrincipale + contract.commissionPrincipale });

      // Commission secondaire (référence + délai configurable)
      if (contract.commissionSecondaire > 0) {
        const secondaryDate = addMonths(
          getReferenceDate(contract, contract.secondaryReference),
          contract.secondaryDelayMonths ?? 4
        );
        if (Number.isNaN(secondaryDate.getTime())) return;
        const k2 = getKey(secondaryDate.getFullYear(), secondaryDate.getMonth());
        const prev2 = flowMap.get(k2) || { commissionPrincipale: 0, commissionSecondaire: 0, commissionN1: 0 };
        flowMap.set(k2, { ...prev2, commissionSecondaire: prev2.commissionSecondaire + contract.commissionSecondaire });
      }

      // Commission N+1 mensuelle (référence + délai configurable)
      const n1Start = addMonths(
        getReferenceDate(contract, contract.n1Reference),
        contract.n1DelayMonths ?? 12
      );
      if (Number.isNaN(n1Start.getTime())) return;
      const monthlyN1 = contract.commissionN1 / 12;
      for (let m = 0; m < 12; m++) {
        const d = new Date(n1Start);
        d.setMonth(d.getMonth() + m);
        const k = getKey(d.getFullYear(), d.getMonth());
        const prev = flowMap.get(k) || { commissionPrincipale: 0, commissionSecondaire: 0, commissionN1: 0 };
        flowMap.set(k, { ...prev, commissionN1: prev.commissionN1 + monthlyN1 });
      }

    } else {
      // Linéaire: versement mensuel sur 12 mois, puis N+1 idem
      const startDate = parseFrDate(contract.dateSouscription) || parseFrDate(contract.dateEffet);
      if (!startDate) return;
      const monthlyN = contract.commissionN / 12;
      const monthlyN1 = contract.commissionN1 / 12;

      for (let m = 0; m < 24; m++) {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + m);
        const k = getKey(d.getFullYear(), d.getMonth());
        const prev = flowMap.get(k) || { commissionPrincipale: 0, commissionSecondaire: 0, commissionN1: 0 };
        if (m < 12) {
          flowMap.set(k, { ...prev, commissionPrincipale: prev.commissionPrincipale + monthlyN });
        } else {
          flowMap.set(k, { ...prev, commissionN1: prev.commissionN1 + monthlyN1 });
        }
      }
    }
  });

  // Build sorted entries for the range 2025-01 to 2027-12
  const entries: CashFlowEntry[] = [];
  for (let year = 2025; year <= 2027; year++) {
    for (let month = 0; month < 12; month++) {
      const k = getKey(year, month);
      const flow = flowMap.get(k) || { commissionPrincipale: 0, commissionSecondaire: 0, commissionN1: 0 };
      const currentDate = new Date();
      const isHistorical = year < currentDate.getFullYear() ||
        (year === currentDate.getFullYear() && month < currentDate.getMonth());

      entries.push({
        year,
        month,
        label: `${MONTHS_FR[month]} ${year}`,
        commissionPrincipale: +flow.commissionPrincipale.toFixed(2),
        commissionSecondaire: +flow.commissionSecondaire.toFixed(2),
        commissionN1: +flow.commissionN1.toFixed(2),
        total: +(flow.commissionPrincipale + flow.commissionSecondaire + flow.commissionN1).toFixed(2),
        isHistorical,
      });
    }
  }

  return entries;
}

function computeRenewalAlerts(contracts: Contract[]): RenewalAlert[] {
  const today = new Date();
  const alerts: RenewalAlert[] = [];

  contracts
    .filter(c => c.statut === 'Actif')
    .forEach(c => {
      const souscDate = new Date(c.dateSouscription);
      const renewalDate = new Date(souscDate);
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      const diffMs = renewalDate.getTime() - today.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const moisRestants = Math.floor(diffDays / 30);

      if (moisRestants >= 0 && moisRestants <= 3) {
        alerts.push({
          contractId: c.id,
          nom: c.nom,
          prenom: c.prenom,
          compagnie: c.compagnie,
          produit: c.produit,
          dateSouscription: c.dateSouscription,
          moisRestants,
          commissionN1Attendue: c.commissionN1,
        });
      }
    });

  return alerts.sort((a, b) => a.moisRestants - b.moisRestants);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabaseConfigured = false; // Supabase replaced by Google Sheets
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for data - start empty, will load from Google Sheets
  const [contracts, setContracts] = useState<Contract[]>(() => {
    try {
      const stored = localStorage.getItem('commissspro_contracts');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(() => {
    try {
      const stored = localStorage.getItem('commissspro_rules');
      return stored ? mergeCommissionRulesWithDefaults(JSON.parse(stored)) : COMMISSION_RULES;
    } catch { return COMMISSION_RULES; }
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const stored = localStorage.getItem('commissspro_companies');
      return stored ? JSON.parse(stored) : COMPANIES;
    } catch { return COMPANIES; }
  });

  // Load data from Google Sheets API
  const loadData = useCallback(async (options?: { forceSync?: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      // Load contracts from Google Sheets
      const [contractsData, rulesData] = await Promise.all([
        contractsService.getAll({ refreshRules: options?.forceSync }).catch(() => []),
        contractsService.getCommissionRules({ refresh: options?.forceSync }).catch(() => null),
      ]);
      if (contractsData.length > 0) {
        setContracts(contractsData);
        // Store in localStorage as backup
        localStorage.setItem('commissspro_contracts', JSON.stringify(contractsData));
      }

      if (rulesData?.rules && rulesData.rules.length > 0) {
        const normalizedRules = rulesData.rules.map(normalizeRemoteCommissionRule);
        setCommissionRules(normalizedRules);
        localStorage.setItem('commissspro_rules', JSON.stringify(normalizedRules));
      }

      console.log('Loaded contracts from Google Sheets:', contractsData.length);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des données');
      // Fallback to localStorage or mock data
      try {
        const storedContracts = localStorage.getItem('commissspro_contracts');
        if (storedContracts) {
          setContracts(JSON.parse(storedContracts));
        }
      } catch (storageErr) {
        console.error('Error loading from localStorage:', storageErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await loadData({ forceSync: true });
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData({ forceSync: true });
  }, [loadData]);

  // Auto-sync every 2 minutes to keep dashboard forecasts up to date.
  useEffect(() => {
    const timer = window.setInterval(() => {
      loadData({ forceSync: true }).catch(() => {});
    }, 120000);
    return () => window.clearInterval(timer);
  }, [loadData]);

  // Persist contracts to localStorage (always, since we load from Google Sheets)
  useEffect(() => {
    localStorage.setItem('commissspro_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    if (!supabaseConfigured) {
      localStorage.setItem('commissspro_rules', JSON.stringify(commissionRules));
    }
  }, [commissionRules, supabaseConfigured]);

  useEffect(() => {
    if (!supabaseConfigured) {
      localStorage.setItem('commissspro_companies', JSON.stringify(companies));
    }
  }, [companies, supabaseConfigured]);

  // Contract operations - always use Google Sheets API
  const addContract = async (contract: Contract) => {
    try {
      const newContract = await contractsService.create(contract);
      setContracts(prev => [newContract, ...prev]);
    } catch (err) {
      console.error('Error adding contract:', err);
      throw err;
    }
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    try {
      const updatedContract = await contractsService.update(id, updates);
      setContracts(prev => prev.map(c => c.id === id ? updatedContract : c));
    } catch (err) {
      console.error('Error updating contract:', err);
      throw err;
    }
  };

  const deleteContract = async (id: string) => {
    try {
      await contractsService.delete(id);
      setContracts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting contract:', err);
      throw err;
    }
  };

  // Commission rule operations
  const addCommissionRule = async (rule: CommissionRule) => {
    if (supabaseConfigured && user) {
      try {
        const newRule = await productsService.create(rule, user.id);
        setCommissionRules(prev => [...prev, newRule]);
      } catch (err) {
        console.error('Error adding commission rule:', err);
        throw err;
      }
    } else {
      setCommissionRules(prev => [...prev, rule]);
    }
  };

  const updateCommissionRule = async (id: string, updates: Partial<CommissionRule>) => {
    if (supabaseConfigured && user) {
      try {
        const updatedRule = await productsService.update(id, updates);
        setCommissionRules(prev => prev.map(r => r.id === id ? updatedRule : r));
      } catch (err) {
        console.error('Error updating commission rule:', err);
        throw err;
      }
    } else {
      setCommissionRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    }
  };

  const deleteCommissionRule = async (id: string) => {
    if (supabaseConfigured && user) {
      try {
        await productsService.delete(id);
        setCommissionRules(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        console.error('Error deleting commission rule:', err);
        throw err;
      }
    } else {
      setCommissionRules(prev => prev.filter(r => r.id !== id));
    }
  };

  // Company operations
  const addCompany = async (company: Company) => {
    if (supabaseConfigured && user) {
      try {
        const newCompany = await companiesService.create(company, user.id);
        setCompanies(prev => [...prev, newCompany]);
      } catch (err) {
        console.error('Error adding company:', err);
        throw err;
      }
    } else {
      setCompanies(prev => [...prev, company]);
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    if (supabaseConfigured && user) {
      try {
        const updatedCompany = await companiesService.update(id, updates);
        setCompanies(prev => prev.map(c => c.id === id ? updatedCompany : c));
      } catch (err) {
        console.error('Error updating company:', err);
        throw err;
      }
    } else {
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  };

  const deleteCompany = async (id: string) => {
    if (supabaseConfigured && user) {
      try {
        await companiesService.delete(id);
        setCompanies(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Error deleting company:', err);
        throw err;
      }
    } else {
      setCompanies(prev => prev.filter(c => c.id !== id));
    }
  };

  const activeContracts = useMemo(
    () => contracts.filter(c => c.statut === 'Actif'),
    [contracts]
  );

  const totalRevenue = useMemo(
    () => activeContracts.reduce((sum, c) => sum + c.commissionN, 0),
    [activeContracts]
  );

  const forecastRevenue = useMemo(
    () => contracts.reduce((sum, c) => sum + c.commissionN + c.commissionN1, 0),
    [contracts]
  );

  const activeContractsCount = activeContracts.length;

  const cashFlow = useMemo(() => buildCashFlow(contracts), [contracts]);

  const renewalAlerts = useMemo(() => computeRenewalAlerts(contracts), [contracts]);

  const portfolioMetrics = useMemo((): PortfolioMetrics => {
    if (activeContracts.length === 0) {
      return {
        totalCommissionsN: 0,
        totalCommissionsN1: 0,
        totalContratsActifs: 0,
        primeMoyenne: 0,
        tauxMoyenPortefeuille: 0,
        concentrationMax: 0,
        renewalRate: 87,
      };
    }

    const totalsByCompany = new Map<string, number>();
    let totalN = 0;
    let totalN1 = 0;
    let totalPrime = 0;
    let totalTaux = 0;

    for (const c of activeContracts) {
      totalN += c.commissionN;
      totalN1 += c.commissionN1;
      totalPrime += c.primeBrute;
      totalTaux += c.tauxCommission;
      totalsByCompany.set(c.compagnie, (totalsByCompany.get(c.compagnie) || 0) + c.commissionN);
    }

    const primeMoyenne = totalPrime / activeContracts.length;
    const tauxMoyen = totalTaux / activeContracts.length;

    let maxCompany = 0;
    for (const comp of companies) {
      maxCompany = Math.max(maxCompany, totalsByCompany.get(comp.nom) || 0);
    }
    const concentrationMax = totalN > 0 ? (maxCompany / totalN) * 100 : 0;

    return {
      totalCommissionsN: totalN,
      totalCommissionsN1: totalN1,
      totalContratsActifs: activeContracts.length,
      primeMoyenne,
      tauxMoyenPortefeuille: tauxMoyen,
      concentrationMax,
      renewalRate: 87,
    };
  }, [activeContracts, companies]);

  return (
    <AppContext.Provider value={{
      contracts, setContracts,
      commissionRules, setCommissionRules,
      companies, setCompanies,
      addContract, updateContract, deleteContract,
      addCommissionRule, updateCommissionRule, deleteCommissionRule,
      addCompany, updateCompany, deleteCompany,
      loading, error, refreshData,
      totalRevenue, forecastRevenue, activeContractsCount,
      cashFlow, portfolioMetrics, renewalAlerts,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
