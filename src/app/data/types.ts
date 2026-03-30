export interface Contract {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  compagnie: string;
  categorie: string;
  produit: string;
  formule: string;
  typeCommission: 'Précompte' | 'Linéaire';
  tauxCommission: number;
  tauxBase: number;       // % versé à la souscription (Commission principale N)
  tauxSecondaire: number; // % versé à la date d'effet (Commission secondaire N)
  dateSouscription: string;
  dateEffet: string;
  tauxN1: number;
  tauxN2?: number;
  tauxN3?: number;
  primeBrute: number;     // prime mensuelle en €
  commissionPrincipale: number; // € versé à la souscription
  commissionSecondaire: number; // € versé à la date d'effet
  commissionN: number;    // total commission année N
  commissionN1: number;   // commission année N+1 (annuelle)
  statut: 'Actif' | 'Résilié' | 'En attente' | 'Suspendu';
  notes?: string;
}

export interface CommissionRule {
  id: string;
  compagnie: string;
  categorie: string;
  produit: string;
  typeCommission: 'Précompte' | 'Linéaire';
  tauxTotal: number;       // Taux de Commission N (total)
  tauxBase: number;        // Commission principale N (% à la souscription)
  tauxSecondaire: number;  // Commission secondaire N (% à la date d'effet)
  tauxQualite: number;     // Taux qualité (hors base+secondaire)
  tauxN1: number;          // Taux N+1
  tauxN2?: number;
  tauxN3?: number;
}

export interface Company {
  id: string;
  nom: string;
  code: string;
  couleur: string;
  tauxDefaut: number;
  actif: boolean;
  contact?: string;
  email?: string;
}

export interface MonthlyRevenue {
  mois: string;
  annee: number;
  montant: number;
  prevu: number;
  type: 'réel' | 'prévu';
}

export interface CashFlowEntry {
  year: number;
  month: number;          // 0-11
  label: string;          // "Jan 2026"
  commissionPrincipale: number;
  commissionSecondaire: number;
  commissionN1: number;
  total: number;
  isHistorical: boolean;
}

export interface SimulationParams {
  compagnie: string;
  produit: string;
  typeCommission: 'Précompte' | 'Linéaire';
  primeMensuelle: number;
  tauxTotal: number;
  tauxBase: number;
  tauxSecondaire: number;
  tauxN1: number;
  duree: number;
  dateDebut: string;
}

export interface SimulationResult {
  mois: string;
  commissionPrincipale: number;
  commissionSecondaire: number;
  commissionN1: number;
  total: number;
  cumulatif: number;
}

export interface RenewalAlert {
  contractId: string;
  nom: string;
  prenom: string;
  compagnie: string;
  produit: string;
  dateSouscription: string;
  moisRestants: number;
  commissionN1Attendue: number;
}

export interface PortfolioMetrics {
  totalCommissionsN: number;
  totalCommissionsN1: number;
  totalContratsActifs: number;
  primeMoyenne: number;
  tauxMoyenPortefeuille: number;
  concentrationMax: number;
  renewalRate: number;
}
