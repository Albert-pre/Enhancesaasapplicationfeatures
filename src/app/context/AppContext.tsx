import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Contract, CommissionRule, Company, CashFlowEntry, PortfolioMetrics } from '../data/types';
import { CONTRACTS, COMMISSION_RULES, COMPANIES, MONTHS_FR } from '../data/mockData';

interface AppContextType {
  contracts: Contract[];
  setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
  commissionRules: CommissionRule[];
  setCommissionRules: React.Dispatch<React.SetStateAction<CommissionRule[]>>;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;

  addContract: (contract: Contract) => void;
  updateContract: (id: string, contract: Partial<Contract>) => void;
  deleteContract: (id: string) => void;

  addCommissionRule: (rule: CommissionRule) => void;
  updateCommissionRule: (id: string, rule: Partial<CommissionRule>) => void;
  deleteCommissionRule: (id: string) => void;

  addCompany: (company: Company) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
  deleteCompany: (id: string) => void;

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

    const now = new Date();

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

  useEffect(() => { localStorage.setItem('commissspro_contracts', JSON.stringify(contracts)); }, [contracts]);
  useEffect(() => { localStorage.setItem('commissspro_rules', JSON.stringify(commissionRules)); }, [commissionRules]);
  useEffect(() => { localStorage.setItem('commissspro_companies', JSON.stringify(companies)); }, [companies]);

  const addContract = (contract: Contract) => setContracts(prev => [contract, ...prev]);
  const updateContract = (id: string, contract: Partial<Contract>) =>
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...contract } : c));
  const deleteContract = (id: string) => setContracts(prev => prev.filter(c => c.id !== id));

  const addCommissionRule = (rule: CommissionRule) => setCommissionRules(prev => [...prev, rule]);
  const updateCommissionRule = (id: string, rule: Partial<CommissionRule>) =>
    setCommissionRules(prev => prev.map(r => r.id === id ? { ...r, ...rule } : r));
  const deleteCommissionRule = (id: string) => setCommissionRules(prev => prev.filter(r => r.id !== id));

  const addCompany = (company: Company) => setCompanies(prev => [...prev, company]);
  const updateCompany = (id: string, company: Partial<Company>) =>
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...company } : c));
  const deleteCompany = (id: string) => setCompanies(prev => prev.filter(c => c.id !== id));

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
