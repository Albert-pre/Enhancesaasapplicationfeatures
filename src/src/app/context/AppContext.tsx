import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Contract, CommissionRule, Company } from '../data/types';
import { CONTRACTS, COMMISSION_RULES, COMPANIES } from '../data/mockData';

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
  totalRevenue: number;
  forecastRevenue: number;
  activeContractsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>(() => {
    const stored = localStorage.getItem('contracts');
    return stored ? JSON.parse(stored) : CONTRACTS;
  });

  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(() => {
    const stored = localStorage.getItem('commissionRules');
    return stored ? JSON.parse(stored) : COMMISSION_RULES;
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    const stored = localStorage.getItem('companies');
    return stored ? JSON.parse(stored) : COMPANIES;
  });

  useEffect(() => {
    localStorage.setItem('contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('commissionRules', JSON.stringify(commissionRules));
  }, [commissionRules]);

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  const addContract = (contract: Contract) => {
    setContracts(prev => [...prev, contract]);
  };

  const updateContract = (id: string, contract: Partial<Contract>) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...contract } : c));
  };

  const deleteContract = (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const addCommissionRule = (rule: CommissionRule) => {
    setCommissionRules(prev => [...prev, rule]);
  };

  const updateCommissionRule = (id: string, rule: Partial<CommissionRule>) => {
    setCommissionRules(prev => prev.map(r => r.id === id ? { ...r, ...rule } : r));
  };

  const deleteCommissionRule = (id: string) => {
    setCommissionRules(prev => prev.filter(r => r.id !== id));
  };

  const addCompany = (company: Company) => {
    setCompanies(prev => [...prev, company]);
  };

  const updateCompany = (id: string, company: Partial<Company>) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...company } : c));
  };

  const deleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
  };

  const totalRevenue = contracts
    .filter(c => c.statut === 'Actif')
    .reduce((sum, c) => sum + c.commissionN, 0);

  const forecastRevenue = contracts
    .reduce((sum, c) => sum + c.commissionN + c.commissionN1, 0);

  const activeContractsCount = contracts.filter(c => c.statut === 'Actif').length;

  return (
    <AppContext.Provider value={{
      contracts, setContracts,
      commissionRules, setCommissionRules,
      companies, setCompanies,
      addContract, updateContract, deleteContract,
      addCommissionRule, updateCommissionRule, deleteCommissionRule,
      addCompany, updateCompany, deleteCompany,
      totalRevenue, forecastRevenue, activeContractsCount,
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
