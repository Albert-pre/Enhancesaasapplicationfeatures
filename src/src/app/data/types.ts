export interface Contract {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  compagnie: string;
  produit: string;
  formule: string;
  typeCommission: 'Précompte' | 'Linéaire';
  tauxCommission: number;
  dateSouscription: string;
  repartitionSouscriptionPct: number;
  dateEffet: string;
  repartitionEffetPct: number;
  tauxN1: number;
  primeBrute: number;
  repartitionSouscriptionEur: number;
  repartitionEffetEur: number;
  commissionN: number;
  commissionN1: number;
  statut: 'Actif' | 'Résilié' | 'En attente' | 'Suspendu';
}

export interface CommissionRule {
  id: string;
  compagnie: string;
  categorie: string;
  produit: string;
  typeCommission: 'Précompte' | 'Linéaire';
  commission1ereAnnee: number;
  commissionBase: number;
  commissionSuivi: number;
  commissionQualite: number;
  tauxN1: number;
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
  compagnie?: string;
}

export interface SimulationParams {
  compagnie: string;
  produit: string;
  formule: string;
  typeCommission: 'Précompte' | 'Linéaire';
  primeMensuelle: number;
  tauxCommission: number;
  tauxN1: number;
  duree: number;
  dateDebut: string;
}

export interface SimulationResult {
  mois: string;
  commissionN: number;
  commissionN1: number;
  cumulatif: number;
}
