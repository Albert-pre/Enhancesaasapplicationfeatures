import { Contract, CommissionRule, Company, MonthlyRevenue } from './types';

// ─── COMPANIES ────────────────────────────────────────────────────────────────
export const COMPANIES: Company[] = [
  { id: 'eca',       nom: 'ECA',              code: 'ECA',  couleur: '#2563eb', tauxDefaut: 40, actif: true,  contact: 'Direction Commerciale', email: 'courtiers@eca.fr' },
  { id: 'zenioo',   nom: 'ZENIOO',           code: 'ZEN',  couleur: '#7c3aed', tauxDefaut: 30, actif: true,  contact: 'Service Partenaires',   email: 'partenaires@zenioo.fr' },
  { id: 'neoliane', nom: 'NEOLIANE',         code: 'NEO',  couleur: '#0891b2', tauxDefaut: 44, actif: true,  contact: 'Réseau Courtiers',      email: 'courtiers@neoliane.fr' },
  { id: 'kiassure', nom: 'KIASSURE',         code: 'KIA',  couleur: '#be185d', tauxDefaut: 42, actif: true,  contact: 'Espace Partenaire',     email: 'partenaires@kiassure.fr' },
  { id: 'spvie',    nom: 'SPVIE',            code: 'SPV',  couleur: '#059669', tauxDefaut: 35, actif: true,  contact: 'Commercial SPVIE',      email: 'commercial@spvie.fr' },
  { id: 'alptis',   nom: 'ALPTIS',           code: 'ALP',  couleur: '#d97706', tauxDefaut: 40, actif: true,  contact: 'Réseau Alptis',         email: 'courtier@alptis.fr' },
  { id: 'sollyazar',nom: 'SOLLY AZAR',       code: 'SOL',  couleur: '#65a30d', tauxDefaut: 30, actif: true,  contact: 'Service Courtiers',     email: 'courtiers@sollyazar.fr' },
  { id: 'utwin',    nom: 'UTWIN',            code: 'UTW',  couleur: '#6366f1', tauxDefaut: 25, actif: false, contact: 'Partenaires UTWIN',     email: 'partenaires@utwin.fr' },
  { id: 'harmonie', nom: 'HARMONIE MUTUELLE',code: 'HMU',  couleur: '#0d9488', tauxDefaut: 25, actif: true,  contact: 'Espace Courtier',       email: 'courtier@harmonie-mutuelle.fr' },
];

// ─── COMMISSION RULES (from CSV) ──────────────────────────────────────────────
export const COMMISSION_RULES: CommissionRule[] = [
  // ── NEOLIANE · Santé ────────────────────────────────────────────────────────
  { id: 'neo-quietude',   compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'QUIETUDE',                typeCommission: 'Précompte', tauxTotal: 44,  tauxBase: 36, tauxSecondaire: 8,  tauxQualite: 0,  tauxN1: 10, baseDelayMonths: 5, secondaryDelayMonths: 5, baseReference: 'effet', secondaryReference: 'effet' },
  { id: 'neo-dynamique',  compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'DYNAMIQUE',               typeCommission: 'Précompte', tauxTotal: 44,  tauxBase: 36, tauxSecondaire: 8,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-perf',       compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'PERFORMANCE',             typeCommission: 'Précompte', tauxTotal: 44,  tauxBase: 36, tauxSecondaire: 8,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-innov',      compagnie: 'NEOLIANE', categorie: 'Santé',     produit: "INNOV'SANTÉ",             typeCommission: 'Précompte', tauxTotal: 44,  tauxBase: 36, tauxSecondaire: 8,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-hospisante', compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'HOSPISANTE',              typeCommission: 'Précompte', tauxTotal: 44,  tauxBase: 36, tauxSecondaire: 8,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-optima',     compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'OPTIMA',                  typeCommission: 'Précompte', tauxTotal: 34,  tauxBase: 28, tauxSecondaire: 6,  tauxQualite: 0,  tauxN1: 13, tauxN2: 14, tauxN3: 15 },
  { id: 'neo-plenitude',  compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'PLÉNITUDE',               typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 30, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-altosante',  compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'ALTOSANTÉ',               typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 30, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-energik',    compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'ÉNERGIK',                 typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 30, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-pulse-p',    compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'PULSE Précompte',         typeCommission: 'Précompte', tauxTotal: 35,  tauxBase: 28, tauxSecondaire: 7,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-pulse-l',    compagnie: 'NEOLIANE', categorie: 'Santé',     produit: 'PULSE Linéaire',          typeCommission: 'Linéaire',  tauxTotal: 17,  tauxBase: 17, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 17 },
  // ── NEOLIANE · Obsèques ─────────────────────────────────────────────────────
  { id: 'neo-viagere',    compagnie: 'NEOLIANE', categorie: 'Obsèques',  produit: 'Viagère',                 typeCommission: 'Précompte', tauxTotal: 50,  tauxBase: 50, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-tempo15',    compagnie: 'NEOLIANE', categorie: 'Obsèques',  produit: 'Tempo 15',                typeCommission: 'Précompte', tauxTotal: 35,  tauxBase: 35, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-tempo20',    compagnie: 'NEOLIANE', categorie: 'Obsèques',  produit: 'Tempo 20',                typeCommission: 'Précompte', tauxTotal: 40,  tauxBase: 40, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  // ── NEOLIANE · Prévoyance ───────────────────────────────────────────────────
  { id: 'neo-multiacc',   compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Multi Accidents',         typeCommission: 'Précompte', tauxTotal: 70,  tauxBase: 50, tauxSecondaire: 20, tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-hospizen',   compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Hospi Zen',               typeCommission: 'Précompte', tauxTotal: 90,  tauxBase: 65, tauxSecondaire: 25, tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-tempodeces', compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Tempo Décès',             typeCommission: 'Précompte', tauxTotal: 70,  tauxBase: 50, tauxSecondaire: 20, tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-chienschat', compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Chiens/Chats',            typeCommission: 'Précompte', tauxTotal: 45,  tauxBase: 45, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-prev4en1',   compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Prévoyance 4en1',         typeCommission: 'Précompte', tauxTotal: 70,  tauxBase: 50, tauxSecondaire: 20, tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-depend',     compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Dépendance',              typeCommission: 'Précompte', tauxTotal: 45,  tauxBase: 40, tauxSecondaire: 5,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-soutfin',   compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Soutien Financier',       typeCommission: 'Précompte', tauxTotal: 70,  tauxBase: 50, tauxSecondaire: 20, tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-protgav',   compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Protection GAV',          typeCommission: 'Précompte', tauxTotal: 60,  tauxBase: 40, tauxSecondaire: 20, tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-soutdec',   compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Soutien Décès Accidentel',typeCommission: 'Précompte', tauxTotal: 105, tauxBase: 75, tauxSecondaire: 30, tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-soutjur',   compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Soutien Juridique',       typeCommission: 'Linéaire',  tauxTotal: 10,  tauxBase: 10, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-southosp',  compagnie: 'NEOLIANE', categorie: 'Prévoyance',produit: 'Soutien Hospi',           typeCommission: 'Précompte', tauxTotal: 40,  tauxBase: 40, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'neo-conforthosp',compagnie: 'NEOLIANE',categorie: 'Prévoyance',produit: 'Confort Hospi',           typeCommission: 'Précompte', tauxTotal: 90,  tauxBase: 65, tauxSecondaire: 25, tauxQualite: 0,  tauxN1: 10 },

  // ── ZENIOO · Santé ─────────────────────────────────────────────────────────
  { id: 'zen-senior-l',   compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ SENIOR Linéaire',       typeCommission: 'Linéaire',  tauxTotal: 15,  tauxBase: 15, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 15 },
  { id: 'zen-senior-p',   compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ SENIOR Précompte',      typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 30, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'zen-ciblee-l',   compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ CIBLÉE Linéaire',       typeCommission: 'Linéaire',  tauxTotal: 15,  tauxBase: 15, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 15 },
  { id: 'zen-ciblee-p',   compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ CIBLÉE Précompte',      typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 30, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'zen-proess-l1',  compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ PRO ESSENTIEL Lin.10%', typeCommission: 'Linéaire',  tauxTotal: 10,  tauxBase: 10, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'zen-proess-l2',  compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ PRO ESSENTIEL Lin.15%', typeCommission: 'Linéaire',  tauxTotal: 15,  tauxBase: 15, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 15 },
  { id: 'zen-proess-p1',  compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ PRO ESSENTIEL Pré.25%', typeCommission: 'Précompte', tauxTotal: 25,  tauxBase: 25, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 15 },
  { id: 'zen-proess-p2',  compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ PRO ESSENTIEL Pré.30%', typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 30, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'zen-eco-l1',     compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ ECO Linéaire 15%',      typeCommission: 'Linéaire',  tauxTotal: 15,  tauxBase: 15, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 15 },
  { id: 'zen-eco-l2',     compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ ECO Linéaire 22%',      typeCommission: 'Linéaire',  tauxTotal: 22,  tauxBase: 22, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 22 },
  { id: 'zen-eco-p1',     compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ ECO Précompte 30%',     typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 30, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'zen-eco-p2',     compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ ECO Précompte 35%',     typeCommission: 'Précompte', tauxTotal: 35,  tauxBase: 35, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'zen-flexi',      compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ FLEXI SENIOR',          typeCommission: 'Linéaire',  tauxTotal: 15,  tauxBase: 15, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 15 },
  { id: 'zen-equilib-l',  compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ ÉQUILIBRE Linéaire',    typeCommission: 'Linéaire',  tauxTotal: 15,  tauxBase: 15, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 15 },
  { id: 'zen-equilib-p',  compagnie: 'ZENIOO',   categorie: 'Santé',     produit: 'ZEN SANTÉ ÉQUILIBRE Précompte',   typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 30, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  // ── ZENIOO · Prévoyance ─────────────────────────────────────────────────────
  { id: 'zen-ijhospi',    compagnie: 'ZENIOO',   categorie: 'Prévoyance',produit: 'IJ Hospi Accident',       typeCommission: 'Précompte', tauxTotal: 70,  tauxBase: 70, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'zen-decacck',    compagnie: 'ZENIOO',   categorie: 'Prévoyance',produit: 'Décès Accident Zenioo',   typeCommission: 'Précompte', tauxTotal: 70,  tauxBase: 70, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },

  // ── KIASSURE · Santé ────────────────────────────────────────────────────────
  { id: 'kia-instassur',  compagnie: 'KIASSURE', categorie: 'Santé',     produit: 'INSTASSUR',               typeCommission: 'Précompte', tauxTotal: 40,  tauxBase: 32,   tauxSecondaire: 8,   tauxQualite: 0, tauxN1: 10 },
  { id: 'kia-golden',     compagnie: 'KIASSURE', categorie: 'Santé',     produit: 'GOLDEN SANTÉ',            typeCommission: 'Précompte', tauxTotal: 42,  tauxBase: 33.6, tauxSecondaire: 8.4, tauxQualite: 0, tauxN1: 10 },
  { id: 'kia-izy',        compagnie: 'KIASSURE', categorie: 'Santé',     produit: 'IZY SANTÉ',               typeCommission: 'Précompte', tauxTotal: 27,  tauxBase: 21.6, tauxSecondaire: 5.4, tauxQualite: 0, tauxN1: 10 },
  { id: 'kia-silver',     compagnie: 'KIASSURE', categorie: 'Santé',     produit: 'SILVER SANTÉ',            typeCommission: 'Linéaire',  tauxTotal: 20,  tauxBase: 20,   tauxSecondaire: 0,   tauxQualite: 0, tauxN1: 20 },
  // ── KIASSURE · Prévoyance ───────────────────────────────────────────────────
  { id: 'kia-goldenprev', compagnie: 'KIASSURE', categorie: 'Prévoyance',produit: 'GOLDEN PRÉVOYANCE',       typeCommission: 'Précompte', tauxTotal: 100, tauxBase: 80,   tauxSecondaire: 20,  tauxQualite: 0, tauxN1: 10 },

  // ── ECA · Santé ─────────────────────────────────────────────────────────────
  { id: 'eca-cap-senior', compagnie: 'ECA',      categorie: 'Santé',     produit: 'Cap Santé Senior',        typeCommission: 'Précompte', tauxTotal: 50,  tauxBase: 30, tauxSecondaire: 18, tauxQualite: 2,  tauxN1: 10 },
  { id: 'eca-capital',    compagnie: 'ECA',      categorie: 'Santé',     produit: 'Capital Senior',          typeCommission: 'Précompte', tauxTotal: 40,  tauxBase: 30, tauxSecondaire: 8,  tauxQualite: 2,  tauxN1: 10 },
  { id: 'eca-cap-vita',   compagnie: 'ECA',      categorie: 'Santé',     produit: 'Capital Vitalité Senior', typeCommission: 'Précompte', tauxTotal: 40,  tauxBase: 30, tauxSecondaire: 8,  tauxQualite: 2,  tauxN1: 10 },
  { id: 'eca-serenissia', compagnie: 'ECA',      categorie: 'Santé',     produit: 'Sérénissia',              typeCommission: 'Précompte', tauxTotal: 35,  tauxBase: 25, tauxSecondaire: 8,  tauxQualite: 2,  tauxN1: 10 },
  { id: 'eca-serenissime',compagnie: 'ECA',      categorie: 'Santé',     produit: 'Sérénissime',             typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 20, tauxSecondaire: 5,  tauxQualite: 5,  tauxN1: 10 },
  { id: 'eca-santactif',  compagnie: 'ECA',      categorie: 'Santé',     produit: 'Santactif',               typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 20, tauxSecondaire: 5,  tauxQualite: 5,  tauxN1: 10 },
  { id: 'eca-optbudget',  compagnie: 'ECA',      categorie: 'Santé',     produit: 'Option Budget',           typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 20, tauxSecondaire: 5,  tauxQualite: 5,  tauxN1: 10 },
  { id: 'eca-forticia',   compagnie: 'ECA',      categorie: 'Santé',     produit: 'Forticia',                typeCommission: 'Précompte', tauxTotal: 50,  tauxBase: 30, tauxSecondaire: 18, tauxQualite: 2,  tauxN1: 10 },
  { id: 'eca-libreco',    compagnie: 'ECA',      categorie: 'Santé',     produit: 'Libreco',                 typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 20, tauxSecondaire: 5,  tauxQualite: 5,  tauxN1: 10 },
  // ── ECA · Prévoyance ────────────────────────────────────────────────────────
  { id: 'eca-assurax',    compagnie: 'ECA',      categorie: 'Prévoyance',produit: 'ASSURAX',                 typeCommission: 'Précompte', tauxTotal: 100, tauxBase: 70, tauxSecondaire: 20, tauxQualite: 10, tauxN1: 10 },
  { id: 'eca-assurhospi', compagnie: 'ECA',      categorie: 'Prévoyance',produit: 'ASSUR HOSPI',             typeCommission: 'Précompte', tauxTotal: 100, tauxBase: 70, tauxSecondaire: 20, tauxQualite: 10, tauxN1: 10 },
  { id: 'eca-protjur',    compagnie: 'ECA',      categorie: 'Prévoyance',produit: 'Protection Juridique',    typeCommission: 'Précompte', tauxTotal: 100, tauxBase: 60, tauxSecondaire: 30, tauxQualite: 10, tauxN1: 10 },
  // ── ECA · Obsèques ──────────────────────────────────────────────────────────
  { id: 'eca-obseques',   compagnie: 'ECA',      categorie: 'Obsèques',  produit: 'Obsèques ECA',            typeCommission: 'Précompte', tauxTotal: 60,  tauxBase: 30, tauxSecondaire: 25, tauxQualite: 5,  tauxN1: 10 },
  // ── ECA · Animaux ───────────────────────────────────────────────────────────
  { id: 'eca-animaux',    compagnie: 'ECA',      categorie: 'Animaux',   produit: 'Animaux ECA',             typeCommission: 'Précompte', tauxTotal: 40,  tauxBase: 30, tauxSecondaire: 8,  tauxQualite: 2,  tauxN1: 10 },

  // ── SPVIE · Santé ───────────────────────────────────────────────────────────
  { id: 'spv-malin',      compagnie: 'SPVIE',    categorie: 'Santé',     produit: 'Santé Malin',             typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 24, tauxSecondaire: 6,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'spv-genius',     compagnie: 'SPVIE',    categorie: 'Santé',     produit: 'Santé Génius',            typeCommission: 'Précompte', tauxTotal: 35,  tauxBase: 28, tauxSecondaire: 7,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'spv-nova',       compagnie: 'SPVIE',    categorie: 'Santé',     produit: 'Santé Nova',              typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 24, tauxSecondaire: 6,  tauxQualite: 0,  tauxN1: 10 },
  { id: 'spv-smart',      compagnie: 'SPVIE',    categorie: 'Santé',     produit: 'SPVIE Smart Santé',       typeCommission: 'Précompte', tauxTotal: 35,  tauxBase: 28, tauxSecondaire: 7,  tauxQualite: 0,  tauxN1: 10 },

  // ── ALPTIS · Santé ──────────────────────────────────────────────────────────
  { id: 'alp-select',     compagnie: 'ALPTIS',   categorie: 'Santé',     produit: 'SANTÉ SELECT',            typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 20, tauxSecondaire: 10, tauxQualite: 0,  tauxN1: 10 },
  { id: 'alp-equilibre',  compagnie: 'ALPTIS',   categorie: 'Santé',     produit: 'ÉQUILIBRE',               typeCommission: 'Précompte', tauxTotal: 40,  tauxBase: 30, tauxSecondaire: 10, tauxQualite: 0,  tauxN1: 10 },
  { id: 'alp-protect',    compagnie: 'ALPTIS',   categorie: 'Santé',     produit: 'PROTECT',                 typeCommission: 'Précompte', tauxTotal: 40,  tauxBase: 30, tauxSecondaire: 10, tauxQualite: 0,  tauxN1: 10 },
  { id: 'alp-lumines',    compagnie: 'ALPTIS',   categorie: 'Santé',     produit: 'LUMINÉIS',                typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 20, tauxSecondaire: 10, tauxQualite: 0,  tauxN1: 10 },
  { id: 'alp-frontal',    compagnie: 'ALPTIS',   categorie: 'Santé',     produit: 'FRONTALIERS SUISSES',     typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 20, tauxSecondaire: 10, tauxQualite: 0,  tauxN1: 10 },

  // ── SOLLY AZAR · Santé ──────────────────────────────────────────────────────
  { id: 'sol-seniorste',  compagnie: 'SOLLY AZAR',categorie: 'Santé',    produit: 'Santé Senior',            typeCommission: 'Précompte', tauxTotal: 30,  tauxBase: 30, tauxSecondaire: 0,  tauxQualite: 0,  tauxN1: 10 },

  // ── HARMONIE · Santé ────────────────────────────────────────────────────────
  { id: 'hmu-essen',      compagnie: 'HARMONIE MUTUELLE', categorie: 'Santé', produit: 'Harmonie Essentielle', typeCommission: 'Linéaire', tauxTotal: 25, tauxBase: 25, tauxSecondaire: 0, tauxQualite: 0, tauxN1: 8 },
];

// ─── HELPER: compute commissions ─────────────────────────────────────────────
export function computeCommissions(
  primeMensuelle: number,
  typeCommission: 'Précompte' | 'Linéaire',
  tauxBase: number,
  tauxSecondaire: number,
  tauxTotal: number,
  tauxN1: number
) {
  const primeAnnuelle = primeMensuelle * 12;
  if (typeCommission === 'Précompte') {
    const commissionPrincipale = +(primeAnnuelle * tauxBase / 100).toFixed(2);
    const commissionSecondaire = +(primeAnnuelle * tauxSecondaire / 100).toFixed(2);
    const commissionN = +(primeAnnuelle * tauxTotal / 100).toFixed(2);
    const commissionN1 = +(primeAnnuelle * tauxN1 / 100).toFixed(2);
    return { commissionPrincipale, commissionSecondaire, commissionN, commissionN1 };
  } else {
    // Linéaire: versement mensuel (montant annuel / 12 chaque mois)
    const commissionN = +(primeAnnuelle * tauxTotal / 100).toFixed(2);
    const commissionN1 = +(primeAnnuelle * tauxN1 / 100).toFixed(2);
    return { commissionPrincipale: commissionN, commissionSecondaire: 0, commissionN, commissionN1 };
  }
}

// ─── CONTRACTS (données réalistes basées sur la CSV) ─────────────────────────
export const CONTRACTS: Contract[] = [
  // ── ZENIOO · ZEN SANTÉ SENIOR Précompte 30% ────────────────────────────────
  {
    id: 'zen-001', nom: 'MARTIN', prenom: 'Sophie', dateNaissance: '1958-03-15',
    compagnie: 'ZENIOO', categorie: 'Santé', produit: 'ZEN SANTÉ SENIOR Précompte', formule: 'Confort 3',
    typeCommission: 'Précompte', tauxCommission: 30, tauxBase: 30, tauxSecondaire: 0,
    dateSouscription: '2026-01-15', dateEffet: '2026-02-01', tauxN1: 10,
    primeBrute: 85,
    commissionPrincipale: 306.00, commissionSecondaire: 0, commissionN: 306.00, commissionN1: 102.00,
    statut: 'Actif'
  },
  {
    id: 'zen-002', nom: 'DUBOIS', prenom: 'Pierre', dateNaissance: '1952-07-22',
    compagnie: 'ZENIOO', categorie: 'Santé', produit: 'ZEN SANTÉ SENIOR Précompte', formule: 'Confort 2',
    typeCommission: 'Précompte', tauxCommission: 30, tauxBase: 30, tauxSecondaire: 0,
    dateSouscription: '2026-02-01', dateEffet: '2026-03-01', tauxN1: 10,
    primeBrute: 120,
    commissionPrincipale: 432.00, commissionSecondaire: 0, commissionN: 432.00, commissionN1: 144.00,
    statut: 'Actif'
  },
  {
    id: 'zen-003', nom: 'BERNARD', prenom: 'Isabelle', dateNaissance: '1961-11-05',
    compagnie: 'ZENIOO', categorie: 'Santé', produit: 'ZEN SANTÉ SENIOR Précompte', formule: 'Confort 4',
    typeCommission: 'Précompte', tauxCommission: 30, tauxBase: 30, tauxSecondaire: 0,
    dateSouscription: '2026-03-01', dateEffet: '2026-04-01', tauxN1: 10,
    primeBrute: 170,
    commissionPrincipale: 612.00, commissionSecondaire: 0, commissionN: 612.00, commissionN1: 204.00,
    statut: 'Actif'
  },
  {
    id: 'zen-004', nom: 'THOMAS', prenom: 'Claude', dateNaissance: '1955-02-18',
    compagnie: 'ZENIOO', categorie: 'Santé', produit: 'ZEN SANTÉ SENIOR Précompte', formule: 'Confort 3',
    typeCommission: 'Précompte', tauxCommission: 30, tauxBase: 30, tauxSecondaire: 0,
    dateSouscription: '2026-01-20', dateEffet: '2026-03-01', tauxN1: 10,
    primeBrute: 107,
    commissionPrincipale: 385.20, commissionSecondaire: 0, commissionN: 385.20, commissionN1: 128.40,
    statut: 'Actif'
  },
  {
    id: 'zen-005', nom: 'PETIT', prenom: 'Marie-Claire', dateNaissance: '1953-06-12',
    compagnie: 'ZENIOO', categorie: 'Santé', produit: 'ZEN SANTÉ SENIOR Précompte', formule: 'Privilège',
    typeCommission: 'Précompte', tauxCommission: 30, tauxBase: 30, tauxSecondaire: 0,
    dateSouscription: '2026-03-10', dateEffet: '2026-05-01', tauxN1: 10,
    primeBrute: 220,
    commissionPrincipale: 792.00, commissionSecondaire: 0, commissionN: 792.00, commissionN1: 264.00,
    statut: 'Actif'
  },
  {
    id: 'zen-006', nom: 'LEROY', prenom: 'Jean-Paul', dateNaissance: '1948-04-25',
    compagnie: 'ZENIOO', categorie: 'Santé', produit: 'ZEN SANTÉ SENIOR Précompte', formule: 'Confort 3',
    typeCommission: 'Précompte', tauxCommission: 30, tauxBase: 30, tauxSecondaire: 0,
    dateSouscription: '2026-04-05', dateEffet: '2026-05-01', tauxN1: 10,
    primeBrute: 177,
    commissionPrincipale: 637.20, commissionSecondaire: 0, commissionN: 637.20, commissionN1: 212.40,
    statut: 'En attente'
  },
  // ── ZENIOO · ECO Précompte 35% ─────────────────────────────────────────────
  {
    id: 'zen-007', nom: 'MOREAU', prenom: 'Christine', dateNaissance: '1970-08-14',
    compagnie: 'ZENIOO', categorie: 'Santé', produit: 'ZEN SANTÉ ECO Précompte 35%', formule: 'Eco+',
    typeCommission: 'Précompte', tauxCommission: 35, tauxBase: 35, tauxSecondaire: 0,
    dateSouscription: '2025-10-01', dateEffet: '2025-11-01', tauxN1: 10,
    primeBrute: 97,
    commissionPrincipale: 407.40, commissionSecondaire: 0, commissionN: 407.40, commissionN1: 116.40,
    statut: 'Actif'
  },
  // ── ZENIOO · Décès Accident ────────────────────────────────────────────────
  {
    id: 'zen-008', nom: 'SIMON', prenom: 'André', dateNaissance: '1956-01-08',
    compagnie: 'ZENIOO', categorie: 'Prévoyance', produit: 'Décès Accident Zenioo', formule: 'Protection +',
    typeCommission: 'Précompte', tauxCommission: 70, tauxBase: 70, tauxSecondaire: 0,
    dateSouscription: '2025-11-05', dateEffet: '2025-12-01', tauxN1: 10,
    primeBrute: 15,
    commissionPrincipale: 126.00, commissionSecondaire: 0, commissionN: 126.00, commissionN1: 18.00,
    statut: 'Actif'
  },
  // ── ECA · Cap Santé Senior Précompte 50% ────────────────────────────────────
  {
    id: 'eca-001', nom: 'LAMBERT', prenom: 'Jacqueline', dateNaissance: '1949-12-03',
    compagnie: 'ECA', categorie: 'Santé', produit: 'Cap Santé Senior', formule: 'Formule 3',
    typeCommission: 'Précompte', tauxCommission: 50, tauxBase: 30, tauxSecondaire: 18,
    dateSouscription: '2026-01-15', dateEffet: '2026-02-01', tauxN1: 10,
    primeBrute: 142,
    commissionPrincipale: 511.20, commissionSecondaire: 306.72, commissionN: 852.00, commissionN1: 170.40,
    statut: 'Actif'
  },
  // ── ECA · Capital Senior Précompte 40% ──────────────────────────────────────
  {
    id: 'eca-002', nom: 'PASCAL', prenom: 'Daniel', dateNaissance: '1957-09-20',
    compagnie: 'ECA', categorie: 'Santé', produit: 'Capital Senior', formule: 'Niveau 2',
    typeCommission: 'Précompte', tauxCommission: 40, tauxBase: 30, tauxSecondaire: 8,
    dateSouscription: '2025-09-01', dateEffet: '2025-10-01', tauxN1: 10,
    primeBrute: 125,
    commissionPrincipale: 450.00, commissionSecondaire: 120.00, commissionN: 600.00, commissionN1: 150.00,
    statut: 'Actif'
  },
  // ── ECA · Forticia Précompte 50% ────────────────────────────────────────────
  {
    id: 'eca-003', nom: 'ROUSSEAU', prenom: 'Denis', dateNaissance: '1963-07-08',
    compagnie: 'ECA', categorie: 'Santé', produit: 'Forticia', formule: 'Excellence',
    typeCommission: 'Précompte', tauxCommission: 50, tauxBase: 30, tauxSecondaire: 18,
    dateSouscription: '2025-10-01', dateEffet: '2025-11-01', tauxN1: 10,
    primeBrute: 95,
    commissionPrincipale: 342.00, commissionSecondaire: 205.20, commissionN: 570.00, commissionN1: 114.00,
    statut: 'Actif'
  },
  // ── ECA · Sérénissia Précompte 35% ──────────────────────────────────────────
  {
    id: 'eca-004', nom: 'FOURNIER', prenom: 'Hélène', dateNaissance: '1951-03-22',
    compagnie: 'ECA', categorie: 'Santé', produit: 'Sérénissia', formule: 'Essentielle',
    typeCommission: 'Précompte', tauxCommission: 35, tauxBase: 25, tauxSecondaire: 8,
    dateSouscription: '2025-11-15', dateEffet: '2026-01-01', tauxN1: 10,
    primeBrute: 78,
    commissionPrincipale: 234.00, commissionSecondaire: 74.88, commissionN: 327.60, commissionN1: 93.60,
    statut: 'Actif'
  },
  // ── ECA · ASSURAX Prévoyance 100% ───────────────────────────────────────────
  {
    id: 'eca-005', nom: 'GARCIA', prenom: 'Eduardo', dateNaissance: '1965-05-10',
    compagnie: 'ECA', categorie: 'Prévoyance', produit: 'ASSURAX', formule: 'Intégrale',
    typeCommission: 'Précompte', tauxCommission: 100, tauxBase: 70, tauxSecondaire: 20,
    dateSouscription: '2026-02-01', dateEffet: '2026-03-01', tauxN1: 10,
    primeBrute: 45,
    commissionPrincipale: 378.00, commissionSecondaire: 108.00, commissionN: 540.00, commissionN1: 54.00,
    statut: 'Actif'
  },
  // ── ECA · Obsèques 60% ──────────────────────────────────────────────────────
  {
    id: 'eca-006', nom: 'DUPONT', prenom: 'Marguerite', dateNaissance: '1945-09-17',
    compagnie: 'ECA', categorie: 'Obsèques', produit: 'Obsèques ECA', formule: 'Bien-Être',
    typeCommission: 'Précompte', tauxCommission: 60, tauxBase: 30, tauxSecondaire: 25,
    dateSouscription: '2026-02-10', dateEffet: '2026-03-01', tauxN1: 10,
    primeBrute: 28,
    commissionPrincipale: 100.80, commissionSecondaire: 84.00, commissionN: 201.60, commissionN1: 33.60,
    statut: 'Actif'
  },
  // ── ECA · Animaux 40% ───────────────────────────────────────────────────────
  {
    id: 'eca-007', nom: 'GIRARD', prenom: 'Michel', dateNaissance: '1944-11-30',
    compagnie: 'ECA', categorie: 'Animaux', produit: 'Animaux ECA', formule: 'Maxi+',
    typeCommission: 'Précompte', tauxCommission: 40, tauxBase: 30, tauxSecondaire: 8,
    dateSouscription: '2026-03-01', dateEffet: '2026-04-01', tauxN1: 10,
    primeBrute: 35,
    commissionPrincipale: 126.00, commissionSecondaire: 33.60, commissionN: 168.00, commissionN1: 42.00,
    statut: 'Actif'
  },
  // ── NEOLIANE · QUIETUDE Précompte 44% ───────────────────────────────────────
  {
    id: 'neo-001', nom: 'BONNET', prenom: 'Gérard', dateNaissance: '1950-04-12',
    compagnie: 'NEOLIANE', categorie: 'Santé', produit: 'QUIETUDE', formule: 'Quiétude Plus',
    typeCommission: 'Précompte', tauxCommission: 44, tauxBase: 36, tauxSecondaire: 8,
    dateSouscription: '2025-11-01', dateEffet: '2026-01-01', tauxN1: 10,
    primeBrute: 115,
    commissionPrincipale: 496.80, commissionSecondaire: 110.40, commissionN: 607.20, commissionN1: 138.00,
    statut: 'Actif'
  },
  {
    id: 'neo-002', nom: 'LEGRAND', prenom: 'Marie', dateNaissance: '1958-08-25',
    compagnie: 'NEOLIANE', categorie: 'Santé', produit: 'QUIETUDE', formule: 'Quiétude',
    typeCommission: 'Précompte', tauxCommission: 44, tauxBase: 36, tauxSecondaire: 8,
    dateSouscription: '2025-12-01', dateEffet: '2026-02-01', tauxN1: 10,
    primeBrute: 89,
    commissionPrincipale: 384.48, commissionSecondaire: 85.44, commissionN: 469.92, commissionN1: 106.80,
    statut: 'Actif'
  },
  // ── NEOLIANE · Hospi Zen Précompte 90% ──────────────────────────────────────
  {
    id: 'neo-003', nom: 'CHEVALIER', prenom: 'Philippe', dateNaissance: '1960-02-14',
    compagnie: 'NEOLIANE', categorie: 'Prévoyance', produit: 'Hospi Zen', formule: 'Premium',
    typeCommission: 'Précompte', tauxCommission: 90, tauxBase: 65, tauxSecondaire: 25,
    dateSouscription: '2026-01-20', dateEffet: '2026-03-01', tauxN1: 10,
    primeBrute: 22,
    commissionPrincipale: 171.60, commissionSecondaire: 66.00, commissionN: 237.60, commissionN1: 26.40,
    statut: 'Actif'
  },
  // ── NEOLIANE · Multi Accidents 70% ──────────────────────────────────────────
  {
    id: 'neo-004', nom: 'ROBIN', prenom: 'Isabelle', dateNaissance: '1967-06-30',
    compagnie: 'NEOLIANE', categorie: 'Prévoyance', produit: 'Multi Accidents', formule: 'Intégrale',
    typeCommission: 'Précompte', tauxCommission: 70, tauxBase: 50, tauxSecondaire: 20,
    dateSouscription: '2026-02-15', dateEffet: '2026-04-01', tauxN1: 10,
    primeBrute: 18,
    commissionPrincipale: 108.00, commissionSecondaire: 43.20, commissionN: 151.20, commissionN1: 21.60,
    statut: 'Actif'
  },
  // ── NEOLIANE · OPTIMA 34% ───────────────────────────────────────────────────
  {
    id: 'neo-005', nom: 'DAVID', prenom: 'Nicole', dateNaissance: '1956-11-07',
    compagnie: 'NEOLIANE', categorie: 'Santé', produit: 'OPTIMA', formule: 'Confort',
    typeCommission: 'Précompte', tauxCommission: 34, tauxBase: 28, tauxSecondaire: 6,
    dateSouscription: '2026-03-05', dateEffet: '2026-05-01', tauxN1: 13,
    primeBrute: 135,
    commissionPrincipale: 453.60, commissionSecondaire: 97.20, commissionN: 550.80, commissionN1: 210.60,
    statut: 'En attente'
  },
  // ── KIASSURE · GOLDEN SANTÉ Précompte 42% ───────────────────────────────────
  {
    id: 'kia-001', nom: 'LEFEBVRE', prenom: 'Patrick', dateNaissance: '1953-10-18',
    compagnie: 'KIASSURE', categorie: 'Santé', produit: 'GOLDEN SANTÉ', formule: 'Or Senior',
    typeCommission: 'Précompte', tauxCommission: 42, tauxBase: 33.6, tauxSecondaire: 8.4,
    dateSouscription: '2025-10-15', dateEffet: '2025-11-01', tauxN1: 10,
    primeBrute: 98,
    commissionPrincipale: 394.85, commissionSecondaire: 98.78, commissionN: 493.92, commissionN1: 117.60,
    statut: 'Actif'
  },
  {
    id: 'kia-002', nom: 'BLANC', prenom: 'Sylvie', dateNaissance: '1960-03-05',
    compagnie: 'KIASSURE', categorie: 'Santé', produit: 'GOLDEN SANTÉ', formule: 'Or Senior Plus',
    typeCommission: 'Précompte', tauxCommission: 42, tauxBase: 33.6, tauxSecondaire: 8.4,
    dateSouscription: '2026-01-10', dateEffet: '2026-02-01', tauxN1: 10,
    primeBrute: 145,
    commissionPrincipale: 584.64, commissionSecondaire: 146.16, commissionN: 730.80, commissionN1: 174.00,
    statut: 'Actif'
  },
  // ── KIASSURE · GOLDEN PRÉVOYANCE 100% ───────────────────────────────────────
  {
    id: 'kia-003', nom: 'HENRY', prenom: 'Robert', dateNaissance: '1954-07-22',
    compagnie: 'KIASSURE', categorie: 'Prévoyance', produit: 'GOLDEN PRÉVOYANCE', formule: 'Privilège',
    typeCommission: 'Précompte', tauxCommission: 100, tauxBase: 80, tauxSecondaire: 20,
    dateSouscription: '2026-03-10', dateEffet: '2026-04-01', tauxN1: 10,
    primeBrute: 28,
    commissionPrincipale: 268.80, commissionSecondaire: 67.20, commissionN: 336.00, commissionN1: 33.60,
    statut: 'En attente'
  },
  // ── KIASSURE · SILVER SANTÉ Linéaire 20% ────────────────────────────────────
  {
    id: 'kia-004', nom: 'GAUTIER', prenom: 'Martine', dateNaissance: '1968-12-15',
    compagnie: 'KIASSURE', categorie: 'Santé', produit: 'SILVER SANTÉ', formule: 'Argent',
    typeCommission: 'Linéaire', tauxCommission: 20, tauxBase: 20, tauxSecondaire: 0,
    dateSouscription: '2025-10-01', dateEffet: '2025-10-01', tauxN1: 20,
    primeBrute: 92,
    commissionPrincipale: 220.80, commissionSecondaire: 0, commissionN: 220.80, commissionN1: 220.80,
    statut: 'Actif'
  },
  // ── SPVIE · Santé Génius Précompte 35% ──────────────────────────────────────
  {
    id: 'spv-001', nom: 'LEMAIRE', prenom: 'Cécile', dateNaissance: '1962-04-18',
    compagnie: 'SPVIE', categorie: 'Santé', produit: 'Santé Génius', formule: 'Génius 3',
    typeCommission: 'Précompte', tauxCommission: 35, tauxBase: 28, tauxSecondaire: 7,
    dateSouscription: '2025-12-01', dateEffet: '2026-01-01', tauxN1: 10,
    primeBrute: 112,
    commissionPrincipale: 376.32, commissionSecondaire: 94.08, commissionN: 470.40, commissionN1: 134.40,
    statut: 'Actif'
  },
  {
    id: 'spv-002', nom: 'RENARD', prenom: 'Bruno', dateNaissance: '1958-09-03',
    compagnie: 'SPVIE', categorie: 'Santé', produit: 'Santé Génius', formule: 'Génius 2',
    typeCommission: 'Précompte', tauxCommission: 35, tauxBase: 28, tauxSecondaire: 7,
    dateSouscription: '2026-02-20', dateEffet: '2026-04-01', tauxN1: 10,
    primeBrute: 88,
    commissionPrincipale: 295.68, commissionSecondaire: 73.92, commissionN: 369.60, commissionN1: 105.60,
    statut: 'Actif'
  },
  // ── ALPTIS · ÉQUILIBRE Précompte 40% ────────────────────────────────────────
  {
    id: 'alp-001', nom: 'DUPUIS', prenom: 'Anne', dateNaissance: '1959-07-11',
    compagnie: 'ALPTIS', categorie: 'Santé', produit: 'ÉQUILIBRE', formule: 'Équilibre Plus',
    typeCommission: 'Précompte', tauxCommission: 40, tauxBase: 30, tauxSecondaire: 10,
    dateSouscription: '2025-11-01', dateEffet: '2025-12-01', tauxN1: 10,
    primeBrute: 102,
    commissionPrincipale: 367.20, commissionSecondaire: 122.40, commissionN: 489.60, commissionN1: 122.40,
    statut: 'Actif'
  },
  {
    id: 'alp-002', nom: 'MORIN', prenom: 'Jean', dateNaissance: '1954-02-28',
    compagnie: 'ALPTIS', categorie: 'Santé', produit: 'ÉQUILIBRE', formule: 'Équilibre',
    typeCommission: 'Précompte', tauxCommission: 40, tauxBase: 30, tauxSecondaire: 10,
    dateSouscription: '2026-03-15', dateEffet: '2026-04-01', tauxN1: 10,
    primeBrute: 78,
    commissionPrincipale: 280.80, commissionSecondaire: 93.60, commissionN: 374.40, commissionN1: 93.60,
    statut: 'En attente'
  },
  // ── SOLLY AZAR · Santé Senior 30% ───────────────────────────────────────────
  {
    id: 'sol-001', nom: 'FONTAINE', prenom: 'Lucette', dateNaissance: '1947-06-05',
    compagnie: 'SOLLY AZAR', categorie: 'Santé', produit: 'Santé Senior', formule: 'Premium',
    typeCommission: 'Précompte', tauxCommission: 30, tauxBase: 30, tauxSecondaire: 0,
    dateSouscription: '2025-12-01', dateEffet: '2026-01-01', tauxN1: 10,
    primeBrute: 95,
    commissionPrincipale: 342.00, commissionSecondaire: 0, commissionN: 342.00, commissionN1: 114.00,
    statut: 'Actif'
  },
  // ── HARMONIE MUTUELLE · Linéaire 25% ────────────────────────────────────────
  {
    id: 'hmu-001', nom: 'MERCIER', prenom: 'Sylvie', dateNaissance: '1966-04-18',
    compagnie: 'HARMONIE MUTUELLE', categorie: 'Santé', produit: 'Harmonie Essentielle', formule: 'Essentielle',
    typeCommission: 'Linéaire', tauxCommission: 25, tauxBase: 25, tauxSecondaire: 0,
    dateSouscription: '2025-12-01', dateEffet: '2026-01-01', tauxN1: 8,
    primeBrute: 110,
    commissionPrincipale: 330.00, commissionSecondaire: 0, commissionN: 330.00, commissionN1: 105.60,
    statut: 'Actif'
  },
  // ── En attente / pipeline ────────────────────────────────────────────────────
  {
    id: 'zen-009', nom: 'ROBERT', prenom: 'Famille', dateNaissance: '1960-09-30',
    compagnie: 'ZENIOO', categorie: 'Santé', produit: 'ZEN SANTÉ SENIOR Précompte', formule: 'Famille+',
    typeCommission: 'Précompte', tauxCommission: 30, tauxBase: 30, tauxSecondaire: 0,
    dateSouscription: '2026-05-01', dateEffet: '2026-06-01', tauxN1: 10,
    primeBrute: 350,
    commissionPrincipale: 1260.00, commissionSecondaire: 0, commissionN: 1260.00, commissionN1: 420.00,
    statut: 'En attente'
  },
];

// ─── MONTHLY REVENUE (historique 2025 + projection 2026) ──────────────────────
export const MONTHLY_REVENUE: MonthlyRevenue[] = [
  // 2025 — historique réel
  { mois: 'Jan', annee: 2025, montant: 3250, prevu: 3000, type: 'réel' },
  { mois: 'Fév', annee: 2025, montant: 2870, prevu: 2800, type: 'réel' },
  { mois: 'Mar', annee: 2025, montant: 4120, prevu: 3800, type: 'réel' },
  { mois: 'Avr', annee: 2025, montant: 3680, prevu: 3500, type: 'réel' },
  { mois: 'Mai', annee: 2025, montant: 3950, prevu: 3700, type: 'réel' },
  { mois: 'Jun', annee: 2025, montant: 4620, prevu: 4200, type: 'réel' },
  { mois: 'Jul', annee: 2025, montant: 5380, prevu: 4800, type: 'réel' },
  { mois: 'Aoû', annee: 2025, montant: 3280, prevu: 3500, type: 'réel' },
  { mois: 'Sep', annee: 2025, montant: 4350, prevu: 4000, type: 'réel' },
  { mois: 'Oct', annee: 2025, montant: 5120, prevu: 4500, type: 'réel' },
  { mois: 'Nov', annee: 2025, montant: 4980, prevu: 4000, type: 'réel' },
  { mois: 'Déc', annee: 2025, montant: 4550, prevu: 4100, type: 'réel' },
  // 2026 — réel Jan-Mar + prévisions Apr-Déc
  { mois: 'Jan', annee: 2026, montant: 5280, prevu: 5000, type: 'réel' },
  { mois: 'Fév', annee: 2026, montant: 4750, prevu: 4800, type: 'réel' },
  { mois: 'Mar', annee: 2026, montant: 6120, prevu: 5500, type: 'réel' },
  { mois: 'Avr', annee: 2026, montant: 0, prevu: 5800, type: 'prévu' },
  { mois: 'Mai', annee: 2026, montant: 0, prevu: 6200, type: 'prévu' },
  { mois: 'Jun', annee: 2026, montant: 0, prevu: 6500, type: 'prévu' },
  { mois: 'Jul', annee: 2026, montant: 0, prevu: 7100, type: 'prévu' },
  { mois: 'Aoû', annee: 2026, montant: 0, prevu: 5200, type: 'prévu' },
  { mois: 'Sep', annee: 2026, montant: 0, prevu: 5800, type: 'prévu' },
  { mois: 'Oct', annee: 2026, montant: 0, prevu: 6400, type: 'prévu' },
  { mois: 'Nov', annee: 2026, montant: 0, prevu: 5000, type: 'prévu' },
  { mois: 'Déc', annee: 2026, montant: 0, prevu: 5600, type: 'prévu' },
];

export const CATEGORIES = ['Santé', 'Prévoyance', 'Obsèques', 'Animaux'];

export const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export const COMPANY_COLORS: Record<string, string> = {
  'ECA': '#2563eb',
  'ZENIOO': '#7c3aed',
  'NEOLIANE': '#0891b2',
  'KIASSURE': '#be185d',
  'SPVIE': '#059669',
  'ALPTIS': '#d97706',
  'SOLLY AZAR': '#65a30d',
  'HARMONIE MUTUELLE': '#0d9488',
  'UTWIN': '#6366f1',
};

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

export const formatCurrencyFull = (amount: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

export const formatPercent = (value: number): string => `${value}%`;
