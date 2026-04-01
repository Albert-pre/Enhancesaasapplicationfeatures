import { google } from 'googleapis';
import type { Contract } from '../data/types';

// Google Sheets configuration
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SERVICE_ACCOUNT_EMAIL = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = import.meta.env.VITE_GOOGLE_PRIVATE_KEY;

// Sheet names
const CONTRACTS_SHEET = 'Ctt brute';
const CONTRACTS_RANGE = 'A:CY';

const SHEET_HEADERS = {
  contactIdentifiant: 'Contact - Identifiant',
  contactCivilite: 'Contact - Civilité',
  contactPrenom: 'Contact - Prénom',
  contactNom: 'Contact - Nom',
  contactVille: 'Contact - Ville',
  projetIdentifiant: 'Projet - Identifiant',
  projetType: 'Projet - Type',
  projetOrigine: 'Projet - Origine',
  projetStatut: 'Projet - Statut',
  projetDateSouscription: 'Projet - Date de souscription',
  projetAttribution: 'Projet - Attribution',
  contratCompagnie: 'Contrat - Compagnie',
  contratProduit: 'Contrat - Produit',
  contratFormule: 'Contrat - Formule',
  contratTypeCommissionnement: 'Contrat - Type de commissionnement',
  contratDateCreation: 'Contrat - Date de création',
  contratDebutSignature: 'Contrat - Début de signature',
  contratDebutEffet: "Contrat - Début d'effet",
  contratDateEcheance: "Contrat - Date d'échéance",
  contratDemandeResiliation: 'Contrat - Demande de résiliation',
  contratFinContrat: 'Contrat - Fin de contrat',
  contratMotifResiliation: 'Contrat - Motif de résiliation',
  contratNumero: 'Contrat - N° de contrat',
  contratPrimeBruteMensuelle: 'Contrat - Prime brute mensuelle',
  contratPrimeBruteAnnuelle: 'Contrat - Prime brute annuelle',
  contratCommissionnementPremiereAnnee: 'Contrat - Commissionnement 1ère année (%)',
  contratCommissionnementAnneesSuivantes: 'Contrat - Commissionnement années suivantes (%)',
  contratCommentaire: 'Contrat - Commentaire',
  assure1Type: 'Assuré 1 - Type',
  assure1Civilite: 'Assuré 1 - Civilité',
  assure1Prenom: 'Assuré 1 - Prénom',
  assure1Nom: 'Assuré 1 - Nom',
  assure1DateNaissance: 'Assuré 1 - Date de naissance',
} as const;

const ASSURE_TYPE_HEADERS = [
  'Assuré 1 - Type',
  'Assuré 2 - Type',
  'Assuré 3 - Type',
  'Assuré 4 - Type',
  'Assuré 5 - Type',
  'Assuré 6 - Type',
  'Assuré 7 - Type',
] as const;

const ASSURE_CIVILITE_HEADERS = [
  'Assuré 1 - Civilité',
  'Assuré 2 - Civilité',
  'Assuré 3 - Civilité',
  'Assuré 4 - Civilité',
  'Assuré 5 - Civilité',
  'Assuré 6 - Civilité',
  'Assuré 7 - Civilité',
] as const;

const ASSURE_PRENOM_HEADERS = [
  'Assuré 1 - Prénom',
  'Assuré 2 - Prénom',
  'Assuré 3 - Prénom',
  'Assuré 4 - Prénom',
  'Assuré 5 - Prénom',
  'Assuré 6 - Prénom',
  'Assuré 7 - Prénom',
] as const;

const ASSURE_NOM_HEADERS = [
  'Assuré 1 - Nom',
  'Assuré 2 - Nom',
  'Assuré 3 - Nom',
  'Assuré 4 - Nom',
  'Assuré 5 - Nom',
  'Assuré 6 - Nom',
  'Assuré 7 - Nom',
] as const;

const ASSURE_DATE_NAISSANCE_HEADERS = [
  'Assuré 1 - Date de naissance',
  'Assuré 2 - Date de naissance',
  'Assuré 3 - Date de naissance',
  'Assuré 4 - Date de naissance',
  'Assuré 5 - Date de naissance',
  'Assuré 6 - Date de naissance',
  'Assuré 7 - Date de naissance',
] as const;

// Commission calculation utilities
interface CommissionCalculation {
  commissionPrincipale: number;
  commissionSecondaire: number;
  commissionN: number;
  commissionN1: number;
  tauxCommission: number;
  tauxBase: number;
  tauxSecondaire: number;
  tauxN1: number;
}

export function calculateCommissions(
  primeMensuelle: number,
  commissionMensuelle: number,
  commissionAnnuelle: number,
  commissionPremiereAnnee: number,
  anneeRecurrente: number,
  typeCommission: 'Précompte' | 'Linéaire' = 'Précompte'
): CommissionCalculation {
  const primeAnnuelle = primeMensuelle * 12;

  // Use provided values or calculate from rates
  const commissionN = commissionPremiereAnnee || commissionAnnuelle || (commissionMensuelle * 12);
  const commissionN1 = anneeRecurrente || commissionN; // Default to same as N if not specified

  // Calculate rates as percentages
  const tauxCommission = primeAnnuelle > 0 ? (commissionN / primeAnnuelle) * 100 : 0;
  const tauxN1 = primeAnnuelle > 0 ? (commissionN1 / primeAnnuelle) * 100 : 0;

  // Split commissions based on type
  let commissionPrincipale: number;
  let commissionSecondaire: number;

  if (typeCommission === 'Précompte') {
    // 60% at subscription, 40% at effect date
    commissionPrincipale = commissionN * 0.6;
    commissionSecondaire = commissionN * 0.4;
  } else {
    // Linear: spread over 12 months
    commissionPrincipale = 0;
    commissionSecondaire = 0;
  }

  return {
    commissionPrincipale,
    commissionSecondaire,
    commissionN,
    commissionN1,
    tauxCommission,
    tauxBase: tauxCommission * 0.6,
    tauxSecondaire: tauxCommission * 0.4,
    tauxN1,
  };
}

// Column mapping for contracts sheet
const CONTRACT_COLUMNS = {
  nomPrenom: 'A', // Nom et Prénom
  ville: 'B', // Ville
  signature: 'C', // Signature (dateSouscription)
  dateEffet: 'D', // Date d'effet
  finContrat: 'E', // Fin de contrat
  numeroContrat: 'F', // N° de contrat (id)
  compagnie: 'G', // Compagnie
  cotisationMensuel: 'H', // cotisation mensuel (primeBrute)
  cotisationAnnuel: 'I', // Cotisation annuel
  commissionMensuel: 'J', // commission mensuel
  commissionAnnuel: 'K', // comission annuel
  commissionPremiereAnnee: 'L', // Commission annuel 1ére année (commissionN)
  anneeRecurrente: 'M', // Année récurrente (commissionN1)
  anneeRecu: 'N', // Année recu.
  statut: 'O', // Statut
  attribution: 'P', // Attribution
  pays: 'Q', // pays
  charge: 'R', // Charge
  depenses: 'S', // Dépenses
  frais: 'T', // Frais
  origine: 'U' // Origine
} as const;

// Initialize Google Sheets API
let sheets: any = null;
let headerIndexCache: Record<string, number> | null = null;

function initializeSheets() {
  if (!sheets) {
    // Try service account first, fallback to API key
    if (SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: SERVICE_ACCOUNT_EMAIL,
          private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheets = google.sheets({ version: 'v4', auth });
    } else if (API_KEY) {
      sheets = google.sheets({
        version: 'v4',
        auth: API_KEY
      });
    } else {
      console.warn('Google Sheets credentials not configured. Running in demo mode.');
    }
  }
  return sheets;
}

function normalizeNumber(value: string | undefined): number {
  if (!value) return 0;
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeHeaderName(value: string): string {
  return value
    .replace(/\uFEFF/g, '')
    .replace(/^["']+|["']+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getValueFromRow(
  row: string[],
  headerIndex: Record<string, number>,
  headerName: string
): string {
  const index = headerIndex[normalizeHeaderName(headerName)];
  if (index === undefined) return '';
  return row[index] || '';
}

function findPrincipalInsured(row: string[], headerIndex: Record<string, number>) {
  for (let i = 0; i < ASSURE_TYPE_HEADERS.length; i++) {
    const type = getValueFromRow(row, headerIndex, ASSURE_TYPE_HEADERS[i]).toLowerCase();
    if (type.includes('principal')) {
      return {
        civilite: getValueFromRow(row, headerIndex, ASSURE_CIVILITE_HEADERS[i]),
        prenom: getValueFromRow(row, headerIndex, ASSURE_PRENOM_HEADERS[i]),
        nom: getValueFromRow(row, headerIndex, ASSURE_NOM_HEADERS[i]),
        dateNaissance: getValueFromRow(row, headerIndex, ASSURE_DATE_NAISSANCE_HEADERS[i]),
      };
    }
  }

  return {
    civilite: getValueFromRow(row, headerIndex, SHEET_HEADERS.assure1Civilite),
    prenom: getValueFromRow(row, headerIndex, SHEET_HEADERS.assure1Prenom),
    nom: getValueFromRow(row, headerIndex, SHEET_HEADERS.assure1Nom),
    dateNaissance: getValueFromRow(row, headerIndex, SHEET_HEADERS.assure1DateNaissance),
  };
}

async function getHeaderIndex(sheetsAPI: any): Promise<Record<string, number>> {
  if (headerIndexCache) {
    return headerIndexCache;
  }

  const headerResponse = await sheetsAPI.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${CONTRACTS_SHEET}!1:1`,
  });

  const headers = (headerResponse.data.values?.[0] || []) as string[];
  const indexMap: Record<string, number> = {};
  headers.forEach((header, index) => {
    const normalizedHeader = normalizeHeaderName(header || '');
    if (normalizedHeader) {
      indexMap[normalizedHeader] = index;
    }
  });

  headerIndexCache = indexMap;
  return indexMap;
}

// Check if Google Sheets is properly configured
export const isGoogleSheetsConfigured = () => {
  return Boolean(SPREADSHEET_ID && (API_KEY || (SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY)));
};

// Convert sheet row to contract object
function rowToContract(row: string[], headerIndex: Record<string, number>): Contract {
  const principalInsured = findPrincipalInsured(row, headerIndex);
  const contactNom = getValueFromRow(row, headerIndex, SHEET_HEADERS.contactNom);
  const contactPrenom = getValueFromRow(row, headerIndex, SHEET_HEADERS.contactPrenom);

  const nom = (principalInsured.nom || contactNom).trim();
  const prenom = (principalInsured.prenom || contactPrenom).trim();

  const compagnie = getValueFromRow(row, headerIndex, SHEET_HEADERS.contratCompagnie);
  const produit = getValueFromRow(row, headerIndex, SHEET_HEADERS.contratProduit);
  const formule = getValueFromRow(row, headerIndex, SHEET_HEADERS.contratFormule);
  const categorie = getValueFromRow(row, headerIndex, SHEET_HEADERS.projetType) || 'Santé';

  const typeCommissionRaw = getValueFromRow(row, headerIndex, SHEET_HEADERS.contratTypeCommissionnement).toLowerCase();
  const typeCommission: 'Précompte' | 'Linéaire' = typeCommissionRaw.includes('lin') ? 'Linéaire' : 'Précompte';

  const primeBrute = normalizeNumber(getValueFromRow(row, headerIndex, SHEET_HEADERS.contratPrimeBruteMensuelle));
  const primeAnnuelle = normalizeNumber(getValueFromRow(row, headerIndex, SHEET_HEADERS.contratPrimeBruteAnnuelle)) || (primeBrute * 12);
  const commissionnementN = normalizeNumber(getValueFromRow(row, headerIndex, SHEET_HEADERS.contratCommissionnementPremiereAnnee));
  const commissionnementN1 = normalizeNumber(getValueFromRow(row, headerIndex, SHEET_HEADERS.contratCommissionnementAnneesSuivantes));

  const commissionAnnuelleN = primeAnnuelle * (commissionnementN / 100);
  const commissionAnnuelleN1 = primeAnnuelle * (commissionnementN1 / 100);

  const calc = calculateCommissions(
    primeBrute,
    commissionAnnuelleN / 12,
    commissionAnnuelleN,
    commissionAnnuelleN,
    commissionAnnuelleN1,
    typeCommission
  );

  const projetStatut = getValueFromRow(row, headerIndex, SHEET_HEADERS.projetStatut).toLowerCase();
  const contratDemandeResiliation = getValueFromRow(row, headerIndex, SHEET_HEADERS.contratDemandeResiliation).toLowerCase();
  const contratMotifResiliation = getValueFromRow(row, headerIndex, SHEET_HEADERS.contratMotifResiliation).toLowerCase();
  const statutSource = `${projetStatut} ${contratDemandeResiliation} ${contratMotifResiliation}`;

  let mappedStatut: 'Actif' | 'Résilié' | 'En attente' | 'Suspendu' = 'Actif';
  if (statutSource.includes('résili') || statutSource.includes('resili') || statutSource.includes('termin')) {
    mappedStatut = 'Résilié';
  } else if (statutSource.includes('attente') || statutSource.includes('pending')) {
    mappedStatut = 'En attente';
  } else if (statutSource.includes('suspend')) {
    mappedStatut = 'Suspendu';
  }

  const dateSouscription =
    getValueFromRow(row, headerIndex, SHEET_HEADERS.contratDebutSignature) ||
    getValueFromRow(row, headerIndex, SHEET_HEADERS.projetDateSouscription);

  const dateEffet = getValueFromRow(row, headerIndex, SHEET_HEADERS.contratDebutEffet);

  const notes = [
    getValueFromRow(row, headerIndex, SHEET_HEADERS.contactCivilite),
    getValueFromRow(row, headerIndex, SHEET_HEADERS.contactVille),
    getValueFromRow(row, headerIndex, SHEET_HEADERS.projetOrigine),
    getValueFromRow(row, headerIndex, SHEET_HEADERS.projetAttribution),
    getValueFromRow(row, headerIndex, SHEET_HEADERS.contratCommentaire),
    getValueFromRow(row, headerIndex, SHEET_HEADERS.contratDateEcheance),
    getValueFromRow(row, headerIndex, SHEET_HEADERS.contratFinContrat),
  ].filter(Boolean).join(' | ');

  const contractId =
    getValueFromRow(row, headerIndex, SHEET_HEADERS.contratNumero) ||
    getValueFromRow(row, headerIndex, SHEET_HEADERS.projetIdentifiant) ||
    getValueFromRow(row, headerIndex, SHEET_HEADERS.contactIdentifiant) ||
    `contract_${Date.now()}`;

  return {
    id: contractId,
    nom,
    prenom,
    dateNaissance: principalInsured.dateNaissance || undefined,
    compagnie: compagnie || '',
    categorie,
    produit: produit || '',
    formule: formule || '',
    typeCommission,
    tauxCommission: calc.tauxCommission,
    tauxBase: calc.tauxBase,
    tauxSecondaire: calc.tauxSecondaire,
    dateSouscription: dateSouscription || '',
    dateEffet: dateEffet || '',
    tauxN1: calc.tauxN1,
    primeBrute,
    commissionPrincipale: calc.commissionPrincipale,
    commissionSecondaire: calc.commissionSecondaire,
    commissionN: calc.commissionN,
    commissionN1: calc.commissionN1,
    statut: mappedStatut,
    notes: notes || undefined,
  };
}

// Convert contract to sheet row
function contractToRow(contract: Contract, headerIndex: Record<string, number>): string[] {
  const maxIndex = Math.max(...Object.values(headerIndex), 0);
  const row = new Array(maxIndex + 1).fill('');
  const set = (headerName: string, value: string) => {
    const index = headerIndex[headerName];
    if (index !== undefined) {
      row[index] = value;
    }
  };

  const primeAnnuelle = contract.primeBrute * 12;

  set(SHEET_HEADERS.contratNumero, contract.id);
  set(SHEET_HEADERS.contratCompagnie, contract.compagnie);
  set(SHEET_HEADERS.contratProduit, contract.produit || contract.categorie);
  set(SHEET_HEADERS.contratFormule, contract.formule || '');
  set(SHEET_HEADERS.contratDebutSignature, contract.dateSouscription);
  set(SHEET_HEADERS.contratDebutEffet, contract.dateEffet);
  set(SHEET_HEADERS.contratPrimeBruteMensuelle, contract.primeBrute.toFixed(2));
  set(SHEET_HEADERS.contratPrimeBruteAnnuelle, primeAnnuelle.toFixed(2));
  set(SHEET_HEADERS.contratTypeCommissionnement, contract.typeCommission);
  set(SHEET_HEADERS.contratCommissionnementPremiereAnnee, contract.tauxCommission.toFixed(2));
  set(SHEET_HEADERS.contratCommissionnementAnneesSuivantes, contract.tauxN1.toFixed(2));
  set(SHEET_HEADERS.projetType, contract.categorie || 'Santé');
  set(SHEET_HEADERS.projetStatut, contract.statut);
  set(SHEET_HEADERS.contactNom, contract.nom);
  set(SHEET_HEADERS.contactPrenom, contract.prenom);
  set(SHEET_HEADERS.projetDateSouscription, contract.dateSouscription);
  set(SHEET_HEADERS.assure1Nom, contract.nom);
  set(SHEET_HEADERS.assure1Prenom, contract.prenom);
  if (contract.dateNaissance) {
    set(SHEET_HEADERS.assure1DateNaissance, contract.dateNaissance);
  }
  if (contract.notes) {
    set(SHEET_HEADERS.contratCommentaire, contract.notes);
  }

  return row;
}

export const googleSheetsService = {
  async getAllContracts(): Promise<Contract[]> {
    if (!isGoogleSheetsConfigured()) {
      console.warn('Google Sheets not configured, returning empty array');
      return [];
    }

    try {
      const sheetsAPI = initializeSheets();
      const headerIndex = await getHeaderIndex(sheetsAPI);
      const response = await sheetsAPI.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CONTRACTS_SHEET}!A2:${CONTRACTS_RANGE.split(':')[1]}`, // Skip header row
      });

      const rows = response.data.values || [];
      return rows.map((row: string[]) => rowToContract(row, headerIndex)).filter(contract => contract.id); // Filter out empty rows
    } catch (error) {
      console.error('Error fetching contracts from Google Sheets:', error);
      throw error;
    }
  },

  async getContractById(id: string): Promise<Contract | null> {
    if (!isGoogleSheetsConfigured()) {
      return null;
    }

    try {
      const contracts = await this.getAllContracts();
      return contracts.find(contract => contract.id === id) || null;
    } catch (error) {
      console.error('Error fetching contract by ID:', error);
      return null;
    }
  },

  async createContract(contract: Contract): Promise<Contract> {
    if (!isGoogleSheetsConfigured()) {
      throw new Error('Google Sheets not configured');
    }

    // Validate contract data
    if (!contract.nom || !contract.compagnie || contract.primeBrute <= 0) {
      throw new Error('Invalid contract data: missing required fields or invalid prime');
    }

    // Recalculate commissions to ensure consistency
    const calc = calculateCommissions(
      contract.primeBrute,
      contract.commissionPrincipale,
      contract.commissionN,
      contract.commissionN,
      contract.commissionN1,
      contract.typeCommission
    );

    const validatedContract = {
      ...contract,
      tauxCommission: calc.tauxCommission,
      tauxBase: calc.tauxBase,
      tauxSecondaire: calc.tauxSecondaire,
      commissionPrincipale: calc.commissionPrincipale,
      commissionSecondaire: calc.commissionSecondaire,
      commissionN: calc.commissionN,
      commissionN1: calc.commissionN1,
    };

    try {
      const sheetsAPI = initializeSheets();
      const headerIndex = await getHeaderIndex(sheetsAPI);

      // Generate new ID if not provided
      if (!validatedContract.id) {
        validatedContract.id = `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      const row = contractToRow(validatedContract, headerIndex);

      // Append to sheet
      await sheetsAPI.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CONTRACTS_SHEET}!${CONTRACTS_RANGE}`,
        valueInputOption: 'RAW',
        resource: {
          values: [row],
        },
      });

      return validatedContract;
    } catch (error) {
      console.error('Error creating contract in Google Sheets:', error);
      throw error;
    }
  },

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
    if (!isGoogleSheetsConfigured()) {
      throw new Error('Google Sheets not configured');
    }

    try {
      const sheetsAPI = initializeSheets();
      const headerIndex = await getHeaderIndex(sheetsAPI);

      // Get all contracts to find the row index
      const contracts = await this.getAllContracts();
      const contractIndex = contracts.findIndex(c => c.id === id);

      if (contractIndex === -1) {
        throw new Error('Contract not found');
      }

      const existingContract = contracts[contractIndex];
      const updatedContract = { ...existingContract, ...updates };

      // Validate and recalculate commissions
      if (updatedContract.primeBrute <= 0) {
        throw new Error('Invalid prime amount');
      }

      const calc = calculateCommissions(
        updatedContract.primeBrute,
        updatedContract.commissionPrincipale,
        updatedContract.commissionN,
        updatedContract.commissionN,
        updatedContract.commissionN1,
        updatedContract.typeCommission
      );

      const validatedContract = {
        ...updatedContract,
        tauxCommission: calc.tauxCommission,
        tauxBase: calc.tauxBase,
        tauxSecondaire: calc.tauxSecondaire,
        commissionPrincipale: calc.commissionPrincipale,
        commissionSecondaire: calc.commissionSecondaire,
        commissionN: calc.commissionN,
        commissionN1: calc.commissionN1,
      };

      const row = contractToRow(validatedContract, headerIndex);
      const rowNumber = contractIndex + 2; // +2 because we skip header and 0-indexed

      // Update the specific row
      await sheetsAPI.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CONTRACTS_SHEET}!A${rowNumber}:${CONTRACTS_RANGE.split(':')[1]}${rowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [row],
        },
      });

      return validatedContract;
    } catch (error) {
      console.error('Error updating contract in Google Sheets:', error);
      throw error;
    }
  },

  async deleteContract(id: string): Promise<void> {
    if (!isGoogleSheetsConfigured()) {
      throw new Error('Google Sheets not configured');
    }

    try {
      const sheetsAPI = initializeSheets();

      // Get all contracts to find the row index
      const contracts = await this.getAllContracts();
      const contractIndex = contracts.findIndex(c => c.id === id);

      if (contractIndex === -1) {
        throw new Error('Contract not found');
      }

      const rowNumber = contractIndex + 2; // +2 because we skip header and 0-indexed

      // Clear the row (Google Sheets doesn't have a direct delete row API for data)
      await sheetsAPI.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CONTRACTS_SHEET}!A${rowNumber}:${CONTRACTS_RANGE.split(':')[1]}${rowNumber}`,
      });
    } catch (error) {
      console.error('Error deleting contract from Google Sheets:', error);
      throw error;
    }
  },

  async bulkCreateContracts(contracts: Contract[]): Promise<Contract[]> {
    if (!isGoogleSheetsConfigured()) {
      throw new Error('Google Sheets not configured');
    }

    try {
      const sheetsAPI = initializeSheets();
      const headerIndex = await getHeaderIndex(sheetsAPI);

      // Generate IDs for contracts without them
      const contractsWithIds = contracts.map(contract => ({
        ...contract,
        id: contract.id || `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      const rows = contractsWithIds.map(contract => contractToRow(contract, headerIndex));

      // Append all rows at once
      await sheetsAPI.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CONTRACTS_SHEET}!${CONTRACTS_RANGE}`,
        valueInputOption: 'RAW',
        resource: {
          values: rows,
        },
      });

      return contractsWithIds;
    } catch (error) {
      console.error('Error bulk creating contracts in Google Sheets:', error);
      throw error;
    }
  },
};