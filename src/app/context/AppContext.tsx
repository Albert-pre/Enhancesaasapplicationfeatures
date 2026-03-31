import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Contract, CommissionRule, Company, CashFlowEntry, PortfolioMetrics } from '../data/types';
import { CONTRACTS, COMMISSION_RULES, COMPANIES, MONTHS_FR } from '../data/mockData';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { contractsService } from '../services/contractsService';
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

function buildCashFlow(contracts: Contract[]): CashFlowEntry[] {
  const flowMap = new Map<string, { commissionPrincipale: number; commissionSecondaire: number; commissionN1: number }>();

  const getKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;

  contracts.forEach(contract => {
    if (contract.statut === 'Résilié') return;

    if (contract.typeCommission === 'Précompte') {
      // Commission principale à la souscription
      const souscDate = new Date(contract.dateSouscription);
      const k1 = getKey(souscDate.getFullYear(), souscDate.getMonth());
      const prev1 = flowMap.get(k1) || { commissionPrincipale: 0, commissionSecondaire: 0, commissionN1: 0 };
      flowMap.set(k1, { ...prev1, commissionPrincipale: prev1.commissionPrincipale + contract.commissionPrincipale });

      // Commission secondaire à la date d'effet
      if (contract.commissionSecondaire > 0) {
        const effDate = new Date(contract.dateEffet);
        const k2 = getKey(effDate.getFullYear(), effDate.getMonth());
        const prev2 = flowMap.get(k2) || { commissionPrincipale: 0, commissionSecondaire: 0, commissionN1: 0 };
        flowMap.set(k2, { ...prev2, commissionSecondaire: prev2.commissionSecondaire + contract.commissionSecondaire });
      }

      // Commission N+1 mensuelle (étalée sur 12 mois, démarrant 12 mois après souscription)
      const n1Start = new Date(contract.dateSouscription);
      n1Start.setFullYear(n1Start.getFullYear() + 1);
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
      const startDate = new Date(contract.dateSouscription);
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
  const supabaseConfigured = isSupabaseConfigured();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for data
  const [contracts, setContracts] = useState<Contract[]>(() => {
    try {
      const stored = localStorage.getItem('commissspro_contracts');
      return stored ? JSON.parse(stored) : CONTRACTS;
    } catch { return CONTRACTS; }
  });

  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(() => {
    try {
      const stored = localStorage.getItem('commissspro_rules');
      return stored ? JSON.parse(stored) : COMMISSION_RULES;
    } catch { return COMMISSION_RULES; }
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const stored = localStorage.getItem('commissspro_companies');
      return stored ? JSON.parse(stored) : COMPANIES;
    } catch { return COMPANIES; }
  });

  // Load data from Supabase when user is authenticated
  const loadData = useCallback(async () => {
    if (!supabaseConfigured || !user) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [contractsData, companiesData, productsData] = await Promise.all([
        contractsService.getAll(),
        companiesService.getAll(),
        productsService.getAll(),
      ]);

      // If we have data from Supabase, use it; otherwise keep mock data
      if (contractsData.length > 0) {
        setContracts(contractsData);
      }
      if (companiesData.length > 0) {
        setCompanies(companiesData);
      }
      if (productsData.length > 0) {
        setCommissionRules(productsData);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erreur lors du chargement des donnees');
    } finally {
      setLoading(false);
    }
  }, [supabaseConfigured, user]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Load data on mount and when user changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Persist to localStorage when not using Supabase
  useEffect(() => {
    if (!supabaseConfigured) {
      localStorage.setItem('commissspro_contracts', JSON.stringify(contracts));
    }
  }, [contracts, supabaseConfigured]);

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

  // Contract operations
  const addContract = async (contract: Contract) => {
    if (supabaseConfigured && user) {
      try {
        const newContract = await contractsService.create(contract, user.id);
        setContracts(prev => [newContract, ...prev]);
      } catch (err) {
        console.error('Error adding contract:', err);
        throw err;
      }
    } else {
      setContracts(prev => [contract, ...prev]);
    }
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    if (supabaseConfigured && user) {
      try {
        const updatedContract = await contractsService.update(id, updates);
        setContracts(prev => prev.map(c => c.id === id ? updatedContract : c));
      } catch (err) {
        console.error('Error updating contract:', err);
        throw err;
      }
    } else {
      setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    }
  };

  const deleteContract = async (id: string) => {
    if (supabaseConfigured && user) {
      try {
        await contractsService.delete(id);
        setContracts(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Error deleting contract:', err);
        throw err;
      }
    } else {
      setContracts(prev => prev.filter(c => c.id !== id));
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

  const activeContracts = contracts.filter(c => c.statut === 'Actif');

  const totalRevenue = useMemo(() =>
    activeContracts.reduce((sum, c) => sum + c.commissionN, 0),
    [contracts]);

  const forecastRevenue = useMemo(() =>
    contracts.reduce((sum, c) => sum + c.commissionN + c.commissionN1, 0),
    [contracts]);

  const activeContractsCount = activeContracts.length;

  const cashFlow = useMemo(() => buildCashFlow(contracts), [contracts]);

  const renewalAlerts = useMemo(() => computeRenewalAlerts(contracts), [contracts]);

  const portfolioMetrics = useMemo((): PortfolioMetrics => {
    if (activeContracts.length === 0) return {
      totalCommissionsN: 0, totalCommissionsN1: 0, totalContratsActifs: 0,
      primeMoyenne: 0, tauxMoyenPortefeuille: 0, concentrationMax: 0, renewalRate: 87
    };

    const totalN = activeContracts.reduce((s, c) => s + c.commissionN, 0);
    const totalN1 = activeContracts.reduce((s, c) => s + c.commissionN1, 0);
    const primeMoyenne = activeContracts.reduce((s, c) => s + c.primeBrute, 0) / activeContracts.length;
    const tauxMoyen = activeContracts.reduce((s, c) => s + c.tauxCommission, 0) / activeContracts.length;

    // Concentration max (% d'une compagnie dans le total)
    const byCompany = companies.map(comp => ({
      nom: comp.nom,
      total: activeContracts.filter(c => c.compagnie === comp.nom).reduce((s, c) => s + c.commissionN, 0)
    }));
    const maxCompany = Math.max(...byCompany.map(c => c.total));
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
  }, [contracts, companies]);

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
