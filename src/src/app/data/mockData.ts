import { Contract, CommissionRule, Company, MonthlyRevenue } from './types';

export const COMPANIES: Company[] = [
  { id: 'eca', nom: 'ECA', code: 'ECA', couleur: '#2563eb', tauxDefaut: 30, actif: true, contact: 'Direction Commerciale', email: 'courtiers@eca.fr' },
  { id: 'zenioo', nom: 'ZENIOO', code: 'ZEN', couleur: '#7c3aed', tauxDefaut: 35, actif: true, contact: 'Service Partenaires', email: 'partenaires@zenioo.fr' },
  { id: 'harmonie', nom: 'HARMONIE MUTUELLE', code: 'HMU', couleur: '#059669', tauxDefaut: 25, actif: true, contact: 'Espace Courtier', email: 'courtier@harmonie-mutuelle.fr' },
  { id: 'april', nom: 'APRIL', code: 'APR', couleur: '#dc2626', tauxDefaut: 28, actif: false, contact: 'Réseau APRIL', email: 'reseau@april.fr' },
];

export const COMMISSION_RULES: CommissionRule[] = [
  // ECA - Santé
  { id: 'eca-cap-sante-senior', compagnie: 'ECA', categorie: 'Santé', produit: 'Cap Santé Senior', typeCommission: 'Précompte', commission1ereAnnee: 50, commissionBase: 30, commissionSuivi: 18, commissionQualite: 2, tauxN1: 10 },
  { id: 'eca-capital-senior', compagnie: 'ECA', categorie: 'Santé', produit: 'Capital Senior', typeCommission: 'Précompte', commission1ereAnnee: 40, commissionBase: 30, commissionSuivi: 18, commissionQualite: 2, tauxN1: 10 },
  { id: 'eca-capital-vitalite-senior', compagnie: 'ECA', categorie: 'Santé', produit: 'Capital Vitalité Senior', typeCommission: 'Précompte', commission1ereAnnee: 40, commissionBase: 30, commissionSuivi: 18, commissionQualite: 2, tauxN1: 10 },
  { id: 'eca-serenissia', compagnie: 'ECA', categorie: 'Santé', produit: 'Sérénissia', typeCommission: 'Précompte', commission1ereAnnee: 35, commissionBase: 25, commissionSuivi: 18, commissionQualite: 2, tauxN1: 10 },
  { id: 'eca-serenissime', compagnie: 'ECA', categorie: 'Santé', produit: 'Serenissime', typeCommission: 'Précompte', commission1ereAnnee: 30, commissionBase: 20, commissionSuivi: 18, commissionQualite: 5, tauxN1: 10 },
  { id: 'eca-santactif', compagnie: 'ECA', categorie: 'Santé', produit: 'Santactif', typeCommission: 'Précompte', commission1ereAnnee: 30, commissionBase: 20, commissionSuivi: 18, commissionQualite: 5, tauxN1: 10 },
  { id: 'eca-option-budget', compagnie: 'ECA', categorie: 'Santé', produit: 'Option budget', typeCommission: 'Précompte', commission1ereAnnee: 30, commissionBase: 20, commissionSuivi: 18, commissionQualite: 5, tauxN1: 10 },
  { id: 'eca-forticia', compagnie: 'ECA', categorie: 'Santé', produit: 'Forticia', typeCommission: 'Précompte', commission1ereAnnee: 50, commissionBase: 30, commissionSuivi: 18, commissionQualite: 2, tauxN1: 10 },
  { id: 'eca-libreco', compagnie: 'ECA', categorie: 'Santé', produit: 'Libreco', typeCommission: 'Précompte', commission1ereAnnee: 30, commissionBase: 20, commissionSuivi: 18, commissionQualite: 5, tauxN1: 10 },
  // ECA - Prévoyance
  { id: 'eca-assurax', compagnie: 'ECA', categorie: 'Prévoyance', produit: 'ASSURAX', typeCommission: 'Précompte', commission1ereAnnee: 100, commissionBase: 70, commissionSuivi: 18, commissionQualite: 10, tauxN1: 10 },
  { id: 'eca-assur-hospi', compagnie: 'ECA', categorie: 'Prévoyance', produit: 'ASSUR HOSPI', typeCommission: 'Précompte', commission1ereAnnee: 100, commissionBase: 70, commissionSuivi: 18, commissionQualite: 10, tauxN1: 10 },
  { id: 'eca-protection-juridique', compagnie: 'ECA', categorie: 'Prévoyance', produit: 'Protection juridique', typeCommission: 'Précompte', commission1ereAnnee: 100, commissionBase: 60, commissionSuivi: 18, commissionQualite: 10, tauxN1: 10 },
  // ECA - Obsèques
  { id: 'eca-obseques', compagnie: 'ECA', categorie: 'Obsèques', produit: 'Obsèques', typeCommission: 'Précompte', commission1ereAnnee: 60, commissionBase: 30, commissionSuivi: 18, commissionQualite: 5, tauxN1: 10 },
  // ECA - Animaux
  { id: 'eca-animaux', compagnie: 'ECA', categorie: 'Animaux', produit: 'Animaux', typeCommission: 'Précompte', commission1ereAnnee: 40, commissionBase: 30, commissionSuivi: 18, commissionQualite: 2, tauxN1: 10 },
  // ZENIOO
  { id: 'zen-zen-sante', compagnie: 'ZENIOO', categorie: 'Santé', produit: 'Zen Santé', typeCommission: 'Précompte', commission1ereAnnee: 35, commissionBase: 25, commissionSuivi: 10, commissionQualite: 0, tauxN1: 10 },
  // HARMONIE
  { id: 'hmu-harmonie-essentielle', compagnie: 'HARMONIE MUTUELLE', categorie: 'Santé', produit: 'Harmonie Essentielle', typeCommission: 'Linéaire', commission1ereAnnee: 25, commissionBase: 25, commissionSuivi: 25, commissionQualite: 0, tauxN1: 8 },
];

export const CONTRACTS: Contract[] = [
  // ZENIOO contracts from CSV
  {
    id: 'zen-001', nom: 'MARTIN', prenom: 'Sophie', dateNaissance: '1958-03-15',
    compagnie: 'ZENIOO', produit: 'SANTE', formule: 'Zen Santé',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2026-03-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-05-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 85,
    repartitionSouscriptionEur: 218.66, repartitionEffetEur: 93.71,
    commissionN: 312.38, commissionN1: 89.25, statut: 'Actif'
  },
  {
    id: 'zen-002', nom: 'DUBOIS', prenom: 'Pierre', dateNaissance: '1952-07-22',
    compagnie: 'ZENIOO', produit: 'SANTE', formule: 'Zen Santé',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2026-04-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-06-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 120,
    repartitionSouscriptionEur: 308.70, repartitionEffetEur: 132.30,
    commissionN: 441.00, commissionN1: 126.00, statut: 'Actif'
  },
  {
    id: 'zen-003', nom: 'BERNARD', prenom: 'Isabelle', dateNaissance: '1961-11-05',
    compagnie: 'ZENIOO', produit: 'SANTE', formule: 'Zen Santé',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2026-05-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-07-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 170,
    repartitionSouscriptionEur: 437.33, repartitionEffetEur: 187.43,
    commissionN: 624.75, commissionN1: 178.50, statut: 'Actif'
  },
  {
    id: 'zen-004', nom: 'THOMAS', prenom: 'Claude', dateNaissance: '1955-02-18',
    compagnie: 'ZENIOO', produit: 'SANTE', formule: 'Zen Santé',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2026-03-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-07-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 107,
    repartitionSouscriptionEur: 275.26, repartitionEffetEur: 117.97,
    commissionN: 393.23, commissionN1: 112.35, statut: 'Actif'
  },
  {
    id: 'zen-005', nom: 'ROBERT', prenom: 'Famille', dateNaissance: '1960-09-30',
    compagnie: 'ZENIOO', produit: 'SANTE', formule: 'Zen Santé',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2026-07-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-07-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 350,
    repartitionSouscriptionEur: 900.38, repartitionEffetEur: 385.88,
    commissionN: 1286.25, commissionN1: 367.50, statut: 'En attente'
  },
  {
    id: 'zen-006', nom: 'PETIT', prenom: 'Marie-Claire', dateNaissance: '1953-06-12',
    compagnie: 'ZENIOO', produit: 'SANTE', formule: 'Zen Santé',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2026-03-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-10-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 220,
    repartitionSouscriptionEur: 565.95, repartitionEffetEur: 242.55,
    commissionN: 808.50, commissionN1: 231.00, statut: 'Actif'
  },
  {
    id: 'zen-007', nom: 'LEROY', prenom: 'Jean-Paul', dateNaissance: '1948-04-25',
    compagnie: 'ZENIOO', produit: 'SANTE', formule: 'Zen Santé',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2026-05-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-10-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 177,
    repartitionSouscriptionEur: 455.33, repartitionEffetEur: 195.14,
    commissionN: 650.48, commissionN1: 185.85, statut: 'Actif'
  },
  {
    id: 'zen-008', nom: 'MOREAU', prenom: 'Christine', dateNaissance: '1970-08-14',
    compagnie: 'ZENIOO', produit: 'SANTE', formule: 'Zen Santé',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2026-10-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-12-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 97,
    repartitionSouscriptionEur: 249.53, repartitionEffetEur: 106.94,
    commissionN: 356.48, commissionN1: 101.85, statut: 'En attente'
  },
  {
    id: 'zen-009', nom: 'SIMON', prenom: 'André', dateNaissance: '1956-01-08',
    compagnie: 'ZENIOO', produit: 'SANTE', formule: 'Zen Santé',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2026-11-01', repartitionSouscriptionPct: 70,
    dateEffet: '2027-01-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 100,
    repartitionSouscriptionEur: 257.25, repartitionEffetEur: 110.25,
    commissionN: 367.50, commissionN1: 105.00, statut: 'En attente'
  },
  // ECA contracts
  {
    id: 'eca-001', nom: 'LAMBERT', prenom: 'Jacqueline', dateNaissance: '1949-12-03',
    compagnie: 'ECA', produit: 'Santé', formule: 'Cap Santé Senior',
    typeCommission: 'Précompte', tauxCommission: 50,
    dateSouscription: '2026-01-15', repartitionSouscriptionPct: 70,
    dateEffet: '2026-02-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 142,
    repartitionSouscriptionEur: 498.33, repartitionEffetEur: 213.57,
    commissionN: 711.90, commissionN1: 170.40, statut: 'Actif'
  },
  {
    id: 'eca-002', nom: 'GARCIA', prenom: 'Eduardo', dateNaissance: '1957-05-20',
    compagnie: 'ECA', produit: 'Prévoyance', formule: 'ASSURAX',
    typeCommission: 'Précompte', tauxCommission: 100,
    dateSouscription: '2026-02-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-03-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 45,
    repartitionSouscriptionEur: 378.00, repartitionEffetEur: 162.00,
    commissionN: 540.00, commissionN1: 54.00, statut: 'Actif'
  },
  {
    id: 'eca-003', nom: 'DUPONT', prenom: 'Marguerite', dateNaissance: '1945-09-17',
    compagnie: 'ECA', produit: 'Obsèques', formule: 'Obsèques',
    typeCommission: 'Précompte', tauxCommission: 60,
    dateSouscription: '2026-02-10', repartitionSouscriptionPct: 70,
    dateEffet: '2026-03-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 28,
    repartitionSouscriptionEur: 141.12, repartitionEffetEur: 60.48,
    commissionN: 201.60, commissionN1: 33.60, statut: 'Actif'
  },
  {
    id: 'eca-004', nom: 'ROUSSEAU', prenom: 'Denis', dateNaissance: '1963-07-08',
    compagnie: 'ECA', produit: 'Santé', formule: 'Forticia',
    typeCommission: 'Précompte', tauxCommission: 50,
    dateSouscription: '2025-10-01', repartitionSouscriptionPct: 70,
    dateEffet: '2025-11-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 95,
    repartitionSouscriptionEur: 399.00, repartitionEffetEur: 171.00,
    commissionN: 570.00, commissionN1: 114.00, statut: 'Actif'
  },
  {
    id: 'eca-005', nom: 'FOURNIER', prenom: 'Hélène', dateNaissance: '1951-03-22',
    compagnie: 'ECA', produit: 'Santé', formule: 'Sérénissia',
    typeCommission: 'Précompte', tauxCommission: 35,
    dateSouscription: '2025-11-15', repartitionSouscriptionPct: 70,
    dateEffet: '2026-01-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 78,
    repartitionSouscriptionEur: 204.12, repartitionEffetEur: 87.48,
    commissionN: 291.60, commissionN1: 93.60, statut: 'Actif'
  },
  {
    id: 'eca-006', nom: 'GIRARD', prenom: 'Michel', dateNaissance: '1944-11-30',
    compagnie: 'ECA', produit: 'Animaux', formule: 'Animaux',
    typeCommission: 'Précompte', tauxCommission: 40,
    dateSouscription: '2026-03-01', repartitionSouscriptionPct: 70,
    dateEffet: '2026-04-01', repartitionEffetPct: 30,
    tauxN1: 10, primeBrute: 35,
    repartitionSouscriptionEur: 117.60, repartitionEffetEur: 50.40,
    commissionN: 168.00, commissionN1: 42.00, statut: 'Actif'
  },
  // HARMONIE
  {
    id: 'hmu-001', nom: 'MERCIER', prenom: 'Sylvie', dateNaissance: '1966-04-18',
    compagnie: 'HARMONIE MUTUELLE', produit: 'Santé', formule: 'Harmonie Essentielle',
    typeCommission: 'Linéaire', tauxCommission: 25,
    dateSouscription: '2025-12-01', repartitionSouscriptionPct: 100,
    dateEffet: '2026-01-01', repartitionEffetPct: 0,
    tauxN1: 8, primeBrute: 110,
    repartitionSouscriptionEur: 330.00, repartitionEffetEur: 0,
    commissionN: 330.00, commissionN1: 105.60, statut: 'Actif'
  },
];

// Monthly revenue data 2025-2026
export const MONTHLY_REVENUE: MonthlyRevenue[] = [
  // 2025 Historical
  { mois: 'Jan', annee: 2025, montant: 3200, prevu: 3000, type: 'réel' },
  { mois: 'Fév', annee: 2025, montant: 2850, prevu: 2800, type: 'réel' },
  { mois: 'Mar', annee: 2025, montant: 4100, prevu: 3800, type: 'réel' },
  { mois: 'Avr', annee: 2025, montant: 3600, prevu: 3500, type: 'réel' },
  { mois: 'Mai', annee: 2025, montant: 3900, prevu: 3700, type: 'réel' },
  { mois: 'Jun', annee: 2025, montant: 4500, prevu: 4200, type: 'réel' },
  { mois: 'Jul', annee: 2025, montant: 5200, prevu: 4800, type: 'réel' },
  { mois: 'Aoû', annee: 2025, montant: 3100, prevu: 3500, type: 'réel' },
  { mois: 'Sep', annee: 2025, montant: 4250, prevu: 4000, type: 'réel' },
  { mois: 'Oct', annee: 2025, montant: 4800, prevu: 4500, type: 'réel' },
  { mois: 'Nov', annee: 2025, montant: 3950, prevu: 4000, type: 'réel' },
  { mois: 'Déc', annee: 2025, montant: 4200, prevu: 4100, type: 'réel' },
  // 2026 - Real + Forecast
  { mois: 'Jan', annee: 2026, montant: 4750, prevu: 4500, type: 'réel' },
  { mois: 'Fév', annee: 2026, montant: 3980, prevu: 4000, type: 'réel' },
  { mois: 'Mar', annee: 2026, montant: 5820, prevu: 5500, type: 'réel' },
  { mois: 'Avr', annee: 2026, montant: 0, prevu: 5200, type: 'prévu' },
  { mois: 'Mai', annee: 2026, montant: 0, prevu: 5800, type: 'prévu' },
  { mois: 'Jun', annee: 2026, montant: 0, prevu: 6100, type: 'prévu' },
  { mois: 'Jul', annee: 2026, montant: 0, prevu: 6500, type: 'prévu' },
  { mois: 'Aoû', annee: 2026, montant: 0, prevu: 4800, type: 'prévu' },
  { mois: 'Sep', annee: 2026, montant: 0, prevu: 5300, type: 'prévu' },
  { mois: 'Oct', annee: 2026, montant: 0, prevu: 5900, type: 'prévu' },
  { mois: 'Nov', annee: 2026, montant: 0, prevu: 4500, type: 'prévu' },
  { mois: 'Déc', annee: 2026, montant: 0, prevu: 5100, type: 'prévu' },
];

export const CATEGORIES = ['Santé', 'Prévoyance', 'Obsèques', 'Animaux'];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const formatPercent = (value: number): string => {
  return `${value}%`;
};
