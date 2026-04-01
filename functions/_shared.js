// Shared utilities for Google Sheets
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;
const SERVICE_ACCOUNT_EMAIL = process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.VITE_GOOGLE_PRIVATE_KEY;

const CONTRACTS_SHEET = 'Ctt brute';
const PL_SHEET = 'Contrats';
const COMMISSION_NET_FACTOR = 0.875;

// Initialize Google Sheets API
let sheets = null;

function initializeSheets() {
  if (!sheets) {
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

function isGoogleSheetsConfigured() {
  return Boolean(SPREADSHEET_ID && (API_KEY || (SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY)));
}

// Utility functions (copy from server.js)
function normalizeNumber(value) {
  if (value === null || value === undefined) return 0;
  const normalized = String(value)
    .replace(/\u00A0/g, ' ')
    .replace(/\s/g, '')
    .replace(/[€$]/g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeHeaderName(value = '') {
  return String(value)
    .replace(/\uFEFF/g, '')
    .replace(/^["']+|["']+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function headerIndexFromHeaders(headers = []) {
  const map = {};
  headers.forEach((h, i) => {
    const key = normalizeHeaderName(h);
    if (key) map[key] = i;
  });
  return map;
}

function idxAny(headerIndex, candidates = []) {
  for (const c of candidates) {
    const k = normalizeHeaderName(c);
    if (k in headerIndex) return headerIndex[k];
  }
  return -1;
}

function getCell(row, idx) {
  if (idx === undefined || idx === null || idx < 0) return '';
  return row[idx] ?? '';
}

function rowToContractFromCttBrute(row, headerIndex) {
  const iNom = idxAny(headerIndex, ['Contact - Nom', 'Contact- Nom', 'Contact Nom']);
  const iPrenom = idxAny(headerIndex, ['Contact - Prénom', 'Contact - Prenom', 'Contact Prenom']);
  const iAttribution = idxAny(headerIndex, ['Projet - Attribution', 'Projet Attribution', 'Attribution']);
  const iCompagnie = idxAny(headerIndex, ['Contrat - Compagnie', 'Contrat Compagnie', 'Compagnie']);
  const iProduit = idxAny(headerIndex, ['Contrat - Produit', 'Contrat Produit', 'Produit']);
  const iFormule = idxAny(headerIndex, ['Contrat - Formule', 'Contrat Formule', 'Formule']);
  const iSouscription = idxAny(headerIndex, ['Projet - Date de souscription', 'Date de souscription', 'Souscription']);
  const iEffet = idxAny(headerIndex, ["Contrat - Début d'effet", "Contrat - Debut d'effet", "Contrat - Debut d effet", "Date d'effet", "Date d effet"]);
  const iNumero = idxAny(headerIndex, ['Contrat - N° de contrat', 'Contrat - N° contrat', 'Contrat - No de contrat', 'N° de contrat', 'N° contrat', 'Numero contrat']);
  const iPrimeMens = idxAny(headerIndex, ['Contrat - Prime brute mensuelle', 'Prime brute mensuelle', 'Prime brute mensuel', 'Prime mensuelle']);
  const iTypeCom = idxAny(headerIndex, ['Contrat - Type de commissionnement', 'Type de commissionnement', 'Type commission']);
  const iTauxN = idxAny(headerIndex, ['Contrat - Commissionnement 1ère année (%)', 'Contrat - Commissionnement 1ére année (%)', 'Commissionnement 1ère année (%)', 'Commissionnement 1ére année (%)', 'Taux de Commission N', 'Taux N']);
  const iTauxN1 = idxAny(headerIndex, ['Contrat - Commissionnement années suivantes (%)', 'Commissionnement années suivantes (%)', 'Taux N+1']);
  const iNotes = idxAny(headerIndex, ['Contrat - Commentaire', 'Commentaire']);

  const nom = String(getCell(row, iNom)).trim();
  const prenom = String(getCell(row, iPrenom)).trim();
  const compagnie = String(getCell(row, iCompagnie)).trim();
  const produit = String(getCell(row, iProduit)).trim();
  const formule = String(getCell(row, iFormule)).trim();
  const attribution = String(getCell(row, iAttribution)).trim();
  const dateSouscription = String(getCell(row, iSouscription)).trim();
  const dateEffet = String(getCell(row, iEffet)).trim();
  const primeBrute = normalizeNumber(getCell(row, iPrimeMens));
  const tauxCommission = normalizeNumber(getCell(row, iTauxN));
  const tauxN1 = normalizeNumber(getCell(row, iTauxN1));
  const rawType = String(getCell(row, iTypeCom)).toLowerCase();
  const typeCommission = rawType.includes('précomp') || rawType.includes('precomp') ? 'Précompte' : 'Linéaire';

  const primeAnnuelle = primeBrute * 12;
  const commissionN = +(primeAnnuelle * (tauxCommission / 100) * COMMISSION_NET_FACTOR).toFixed(2);
  const commissionN1 = +(primeAnnuelle * (tauxN1 / 100) * COMMISSION_NET_FACTOR).toFixed(2);

  const commissionPrincipale = commissionN;
  const commissionSecondaire = 0;

  const id = String(getCell(row, iNumero)).trim() || `contract_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return {
    id,
    nom,
    prenom,
    compagnie,
    categorie: 'Santé',
    produit,
    formule,
    typeCommission,
    tauxCommission,
    tauxBase: tauxCommission,
    tauxSecondaire: 0,
    dateSouscription,
    dateEffet,
    tauxN1,
    primeBrute,
    commissionPrincipale,
    commissionSecondaire,
    commissionN,
    commissionN1,
    statut: 'Actif',
    notes: String(getCell(row, iNotes)).trim() || undefined,
    attribution,
  };
}

async function getAllContracts() {
  const sheetsAPI = initializeSheets();
  if (!isGoogleSheetsConfigured()) {
    return [];
  }
  try {
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONTRACTS_SHEET}!A1:CY`,
    });
    const rows = response.data.values || [];
    if (rows.length < 2) return [];
    const headerIndex = headerIndexFromHeaders(rows[0]);
    return rows.slice(1).map(r => rowToContractFromCttBrute(r, headerIndex)).filter(contract => contract.id);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return [];
  }
}

export { getAllContracts, isGoogleSheetsConfigured };