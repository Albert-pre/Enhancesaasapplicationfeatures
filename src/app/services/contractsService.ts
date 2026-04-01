import type { Contract as AppContract } from '../data/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface CommercialPerformance {
  commercial: string;
  contratsTotal: number;
  contratsActifs: number;
  primeMensuelleTotale: number;
  commissionN: number;
  commissionN1: number;
  commissionTotale: number;
}

export interface RemoteCommissionRule {
  key: string;
  compagnie: string;
  categorie?: string;
  produit: string;
  typeCommission: 'Précompte' | 'Linéaire';
  tauxTotal: number;
  tauxBase: number;
  tauxSecondaire: number;
  tauxQualite?: number;
  tauxN1: number;
  baseDelayMonths?: number;
  secondaryDelayMonths?: number;
  n1DelayMonths?: number;
  baseReference?: 'souscription' | 'effet' | 'premiere_prime';
  secondaryReference?: 'souscription' | 'effet' | 'premiere_prime';
  n1Reference?: 'souscription' | 'effet' | 'premiere_prime';
  sourceSheet?: string;
}

export interface CommissionRulesResponse {
  spreadsheetId: string;
  sheets: string[];
  count: number;
  updatedAt: number;
  rules?: RemoteCommissionRule[];
  sample?: RemoteCommissionRule[];
}

export interface SyncResponse {
  ok: boolean;
  syncedAt?: string;
  count?: number;
  error?: string;
}

export interface CommercialAccountingRow {
  commercial: string;
  contrats: number;
  commissions: number;
  charge: number;
  depenses: number;
  frais: number;
  resultat: number;
}

export interface CommercialAccountingResponse {
  sourceSpreadsheetId: string;
  count: number;
  rows: CommercialAccountingRow[];
}

export interface PLRowCommercial {
  commercial: string;
  contrats: number;
  commissions: number;
  charge: number;
  depenses: number;
  frais: number;
  resultat: number;
}

export interface PLRowCompany {
  compagnie: string;
  contrats: number;
  commissions: number;
  charge: number;
  depenses: number;
  frais: number;
  resultat: number;
}

export interface PLResponse {
  year: number;
  month: number | null;
  totals: {
    contrats: number;
    commissions: number;
    charge: number;
    depenses: number;
    frais: number;
    resultat: number;
  };
  byCommercial: PLRowCommercial[];
  byCompany: PLRowCompany[];
  variations: {
    vsPrevMonth: null | { commissions: number; resultat: number };
    vsPrevYear: { commissions: number; resultat: number };
  };
}

export const contractsService = {
  async getAll(options?: { refreshRules?: boolean }): Promise<AppContract[]> {
    try {
      const qs = options?.refreshRules ? '?refreshRules=1' : '';
      const response = await fetch(`${API_BASE_URL}/contracts${qs}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<AppContract | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${id}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching contract by ID:', error);
      return null;
    }
  },

  async create(contract: AppContract): Promise<AppContract> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contract),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<AppContract>): Promise<AppContract> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  },

  async bulkCreate(contracts: AppContract[]): Promise<AppContract[]> {
    // For bulk create, we'll create them one by one since the backend doesn't have bulk endpoint yet
    const results: AppContract[] = [];
    for (const contract of contracts) {
      try {
        const created = await this.create(contract);
        results.push(created);
      } catch (error) {
        console.error('Error creating contract in bulk:', error);
        // Continue with others
      }
    }
    return results;
  },

  async getCommercialPerformance(): Promise<CommercialPerformance[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/commercial-performance`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching commercial performance:', error);
      throw error;
    }
  },

  async getCommissionRules(options?: { refresh?: boolean }): Promise<CommissionRulesResponse> {
    try {
      const qs = options?.refresh ? '?refresh=1' : '';
      const response = await fetch(`${API_BASE_URL}/commission-rules${qs}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching commission rules:', error);
      throw error;
    }
  },

  async syncCommissionRules(): Promise<SyncResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sync/commission-rules`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error syncing commission rules:', error);
      throw error;
    }
  },

  async getCommercialAccounting(): Promise<CommercialAccountingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/commercial-accounting`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching commercial accounting:', error);
      throw error;
    }
  },

  async getPL(params: { year: number; month?: number | null }): Promise<PLResponse> {
    try {
      const qs = new URLSearchParams();
      qs.set('year', String(params.year));
      if (params.month !== undefined && params.month !== null) qs.set('month', String(params.month));
      const response = await fetch(`${API_BASE_URL}/pl?${qs.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching P&L:', error);
      throw error;
    }
  },
};
