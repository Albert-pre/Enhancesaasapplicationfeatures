const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

// Simple rate-limiting (protect API brute-force / abuse)
app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Basic hardening headers (no extra deps)
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Google Sheets configuration
const SPREADSHEET_ID = process.env.VITE_GOOGLE_SHEETS_SPREADSHEET_ID;
const API_KEY = process.env.VITE_GOOGLE_SHEETS_API_KEY;
const SERVICE_ACCOUNT_EMAIL = process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.VITE_GOOGLE_PRIVATE_KEY;

// Sheet names
// - Ctt brute: source de vérité pour la page "Contrats"
// - Contrats: onglet compta/charges utilisé uniquement par P&L
const CONTRACTS_SHEET = 'Ctt brute';
const PL_SHEET = 'Contrats';
const COMMISSION_NET_FACTOR = 0.875;

// Commission calculation utilities
// Mapping des commissions par compagnie (basé sur le script Google Apps Script)
const commissionMapping = {
  "SPVIE": { "annee1": 40.00, "recurrent": 10.00, "type": "Précompte" },
  "HARMONIE MUTUELLE": { "annee1": 15.00, "recurrent": 15.00, "type": "Précompte" },
  "AS SOLUTIONS": { "annee1": 30.00, "recurrent": 10.00, "type": "Précompte" },
  "SOLLY AZAR": { "annee1": 30.00, "recurrent": 10.00, "type": "Linéaire" },
  "NÉOLIANE": { "annee1": 43.00, "recurrent": 10.00, "type": "Précompte" },
  "ZENIOO": { "annee1": 30.00, "recurrent": 10.00, "type": "Précompte" },
  "APRIL_OBS1": { "annee1": 50.00, "recurrent": 10.00, "type": "Linéaire" },
  "APRIL_CAP1": { "annee1": 70.00, "recurrent": 10.00, "type": "Linéaire" },
  "APRIL_CAP2": { "annee1": 50.00, "recurrent": 10.00, "type": "Linéaire" },
  "APRIL_PRO": { "annee1": 20.00, "recurrent": 20.00, "type": "Linéaire" },
  "APRIL": { "annee1": 30.00, "recurrent": 10.00, "type": "Linéaire" },
  "ALPTIS": { "annee1": 30.00, "recurrent": 10.00, "type": "Linéaire" },
  "ENTORIA": { "annee1": 20.00, "recurrent": 20.00, "type": "Linéaire" },
  "AVA": { "annee1": 10.00, "recurrent": 10.00, "type": "Précompte" },
  "COVERITY": { "annee1": 20.00, "recurrent": 20.00, "type": "Linéaire" },
  "MALAKOFF HUMANIS": { "annee1": 15.00, "recurrent": 15.00, "type": "Précompte" },
  "ASAF&AFPS": { "annee1": 30.00, "recurrent": 10.00, "type": "Précompte" },
  "JOKER ASSURANCES": { "annee1": 20.00, "recurrent": 20.00, "type": "Linéaire" },
  "APICIL": { "annee1": 17.00, "recurrent": 17.00, "type": "Linéaire" },
  "ECA CAPITAL SENIOR": { "annee1": 40.00, "recurrent": 10.00, "type": "Précompte" },
  "ECA SÉRENISSIME": { "annee1": 30.00, "recurrent": 10.00, "type": "Précompte" },
  "ECA Autres": { "annee1": 30.00, "recurrent": 10.00, "type": "Précompte" },
  "CNP": { "annee1": 10.00, "recurrent": 10.00, "type": "Linéaire" },
  "KIASSURE SILVER": { "annee1": 20, "recurrent": 20, "type": "Linéaire" },
  "KIASSURE IZY": { "annee1": 30, "recurrent": 10, "type": "Précompte" },
  "KIASSURE INSTA": { "annee1": 42, "recurrent": 10, "type": "Précompte" },
  "FMA": { "annee1": 17.00, "recurrent": 17.00, "type": "Linéaire" }
};

function calculateCommissions(primeMensuelle, compagnie) {
  const primeAnnuelle = primeMensuelle * 12;
  const compKey = String(compagnie).toUpperCase().trim();
  const commissionData = commissionMapping[compKey];

  if (!commissionData) {
    // Compagnie non trouvée dans le mapping
    return {
      commissionPrincipale: 0,
      commissionSecondaire: 0,
      commissionN: 0,
      commissionN1: 0,
      tauxCommission: 0,
      tauxBase: 0,
      tauxSecondaire: 0,
      tauxN1: 0,
      typeCommission: 'Précompte'
    };
  }

  // Calcul des commissions selon les règles du script
  const commissionMensuel = primeMensuelle * (commissionData.annee1 / 100);
  const commissionAnnuelle = primeAnnuelle * (commissionData.annee1 / 100);
  const commissionAnnuelle1 = commissionAnnuelle * 0.875; // 87.5%
  const commissionRecurrente = primeAnnuelle * (commissionData.recurrent / 100);
  const commissionRecu = commissionRecurrente * 0.875; // 87.5%

  // Calcul des taux
  const tauxCommission = commissionData.annee1;
  const tauxN1 = commissionData.recurrent;

  // Split commissions based on type
  let commissionPrincipale, commissionSecondaire;

  if (commissionData.type === 'Précompte') {
    // Pour Précompte: commission principale = commissionAnnuelle1, commission secondaire = reste
    commissionPrincipale = commissionAnnuelle1;
    commissionSecondaire = commissionAnnuelle - commissionAnnuelle1;
  } else {
    // Pour Linéaire: pas de split, tout va dans commission principale
    commissionPrincipale = commissionAnnuelle;
    commissionSecondaire = 0;
  }

  return {
    commissionPrincipale,
    commissionSecondaire,
    commissionN: commissionAnnuelle,
    commissionN1: commissionRecurrente,
    tauxCommission,
    tauxBase: commissionData.type === 'Précompte' ? tauxCommission * 0.6 : tauxCommission,
    tauxSecondaire: commissionData.type === 'Précompte' ? tauxCommission * 0.4 : 0,
    tauxN1,
    typeCommission: commissionData.type
  };
}

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

function parseFrDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (raw.includes('/')) {
    const [dd, mm, yyyy] = raw.split('/').map(Number);
    if (dd && mm && yyyy) {
      const d = new Date(yyyy, mm - 1, dd);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
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

function columnToA1(colIndex0) {
  let n = colIndex0 + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function getCell(row, idx) {
  if (idx === undefined || idx === null || idx < 0) return '';
  return row[idx] ?? '';
}

// Initialize Google Sheets API
let sheets = null;

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

// Check if Google Sheets is properly configured
function isGoogleSheetsConfigured() {
  return Boolean(SPREADSHEET_ID && (API_KEY || (SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY)));
}

function rowToContractFromContrats(row, headerIndex) {
  const iNomPrenom = headerIndex[normalizeHeaderName('Nom et Prénom')];
  const iVille = headerIndex[normalizeHeaderName('Ville')];
  const iSignature = headerIndex[normalizeHeaderName('Signature')];
  const iEffet = headerIndex[normalizeHeaderName("Date d'effet")];
  const iNumero = headerIndex[normalizeHeaderName('N° de contrat')];
  const iCompagnie = headerIndex[normalizeHeaderName('Compagnie')];
  const iCotMens = headerIndex[normalizeHeaderName('cotisation mensuel')];
  const iStatut = headerIndex[normalizeHeaderName('Statut')];
  const iAttribution = headerIndex[normalizeHeaderName('Attribution')];
  const iCharge = headerIndex[normalizeHeaderName('Charge')];
  const iDepenses = headerIndex[normalizeHeaderName('Dépenses')] ?? headerIndex[normalizeHeaderName('Depenses')];
  const iFrais = headerIndex[normalizeHeaderName('Frais')];
  const iCommAn1 = headerIndex[normalizeHeaderName('Commission annuel 1ére année')] ?? headerIndex[normalizeHeaderName('Commission annuel 1ère année')];
  const iCommAnnuel = headerIndex[normalizeHeaderName('comission annuel')] ?? headerIndex[normalizeHeaderName('commission annuel')];

  const fullName = String(getCell(row, iNomPrenom)).trim();
  const [nom = '', prenom = ''] = fullName.includes(' ') ? [fullName.split(' ')[0], fullName.split(' ').slice(1).join(' ')] : [fullName, ''];
  const compagnie = String(getCell(row, iCompagnie)).trim();
  const primeBrute = normalizeNumber(getCell(row, iCotMens));
  const typeCommission = String(getCell(row, iStatut)).toLowerCase().includes('précomp') ? 'Précompte' : 'Linéaire';
  const dateSouscription = String(getCell(row, iSignature)).trim();
  const dateEffet = String(getCell(row, iEffet)).trim();
  const attribution = String(getCell(row, iAttribution)).trim();

  const commissionN = normalizeNumber(getCell(row, iCommAn1)) || normalizeNumber(getCell(row, iCommAnnuel));
  const commissionN1 = normalizeNumber(getCell(row, headerIndex[normalizeHeaderName('Année récurrente')])) || 0;

  return {
    id: String(getCell(row, iNumero)).trim() || `contract_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    nom,
    prenom,
    compagnie,
    categorie: 'Santé',
    produit: '',
    formule: '',
    typeCommission,
    tauxCommission: 0,
    tauxBase: 0,
    tauxSecondaire: 0,
    dateSouscription,
    dateEffet,
    tauxN1: 0,
    primeBrute,
    commissionPrincipale: commissionN,
    commissionSecondaire: 0,
    commissionN,
    commissionN1,
    statut: 'Actif',
    notes: String(getCell(row, iVille)).trim() || undefined,
    attribution,
    charge: normalizeNumber(getCell(row, iCharge)),
    depenses: normalizeNumber(getCell(row, iDepenses)),
    frais: normalizeNumber(getCell(row, iFrais)),
  };
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

  // Règle cabinet courtage: Prime brute mensuelle × (Taux/100) × 0.875
  const primeAnnuelle = primeBrute * 12;
  const commissionN = +(primeAnnuelle * (tauxCommission / 100) * COMMISSION_NET_FACTOR).toFixed(2);
  const commissionN1 = +(primeAnnuelle * (tauxN1 / 100) * COMMISSION_NET_FACTOR).toFixed(2);

  // Split basique (à raffiner si règles détaillées): tout en "principale"
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

// Convert contract to sheet row (adapted for new data structure with ~70+ columns)
function contractToRow(contract) {
  // Create array with ~70 columns, filling only the important ones
  const row = new Array(70).fill('');

  // Map contract properties to the correct column indices based on actual data structure
  row[0] = ''; // Contact - Identifiant (will be generated)
  row[1] = 'M.'; // Contact - Civilité (default)
  row[2] = contract.prenom || ''; // Contact - Prénom
  row[3] = contract.nom || ''; // Contact - Nom
  row[8] = ''; // Contact - Ville (extract from notes if available)
  row[24] = contract.notes || ''; // Projet - Attribution
  row[26] = contract.compagnie || ''; // Contrat - Compagnie
  row[27] = contract.produit || ''; // Contrat - Produit
  row[28] = contract.formule || ''; // Contrat - Formule
  row[34] = contract.dateSouscription || ''; // Contrat - Date de souscription
  row[36] = contract.dateEffet || ''; // Contrat - Début d'effet
  row[41] = contract.id || ''; // Contrat - N° de contrat
  row[42] = contract.primeBrute ? contract.primeBrute.toFixed(2).replace('.', ',') : ''; // Contrat - Prime brute mensuelle
  row[50] = contract.typeCommission || 'Linéaire'; // Contrat - Type de commissionnement
  row[51] = contract.tauxCommission ? contract.tauxCommission.toFixed(2).replace('.', ',') : ''; // Contrat - Commissionnement 1ère année (%)
  row[52] = contract.tauxN1 ? contract.tauxN1.toFixed(2).replace('.', ',') : ''; // Contrat - Commissionnement années suivantes (%)

  return row;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Commission rules endpoint (frontend expects it)
app.get('/api/commission-rules', (req, res) => {
  res.json({
    spreadsheetId: process.env.VITE_GOOGLE_COMMISSIONS_SPREADSHEET_ID || null,
    sheets: [],
    count: 0,
    updatedAt: Date.now(),
    rules: [],
    sample: [],
  });
});

app.get('/api/commercial-performance', async (req, res) => {
  try {
    if (!isGoogleSheetsConfigured()) {
      return res.status(503).json({ error: 'Google Sheets not configured' });
    }
    const contracts = await getAllContracts();
    const map = new Map();
    for (const c of contracts) {
      const commercial = (c.attribution || 'Non attribué').trim();
      const cur = map.get(commercial) || { commercial, contratsTotal: 0, contratsActifs: 0, primeMensuelleTotale: 0, commissionN: 0, commissionN1: 0, commissionTotale: 0 };
      cur.contratsTotal += 1;
      cur.contratsActifs += 1;
      cur.primeMensuelleTotale += c.primeBrute || 0;
      cur.commissionN += c.commissionN || 0;
      cur.commissionN1 += c.commissionN1 || 0;
      cur.commissionTotale = cur.commissionN + cur.commissionN1;
      map.set(commercial, cur);
    }
    res.json(Array.from(map.values()).sort((a, b) => b.commissionTotale - a.commissionTotale));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch commercial performance' });
  }
});

// P&L endpoint kept (used by P&L page)
app.get('/api/pl', async (req, res) => {
  try {
    if (!isGoogleSheetsConfigured()) {
      return res.status(503).json({ error: 'Google Sheets not configured' });
    }
    const year = Number(req.query.year);
    const month = req.query.month === undefined ? null : Number(req.query.month);
    if (!Number.isFinite(year)) return res.status(400).json({ error: 'Missing year' });

    const sheetsAPI = initializeSheets();
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PL_SHEET}!A1:AZ`,
    });
    const values = response.data.values || [];
    if (values.length < 2) return res.json({ year, month, totals: { contrats: 0, commissions: 0, charge: 0, depenses: 0, frais: 0, resultat: 0 }, byCommercial: [], byCompany: [], variations: { vsPrevMonth: null, vsPrevYear: { commissions: 0, resultat: 0 } } });
    const headerIndex = headerIndexFromHeaders(values[0]);

    const totals = { contrats: 0, commissions: 0, charge: 0, depenses: 0, frais: 0, resultat: 0 };
    const byCommercial = new Map();
    const byCompany = new Map();

    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      const sig = getCell(row, headerIndex[normalizeHeaderName('Signature')]);
      const d = parseFrDate(sig);
      if (!d) continue;
      if (d.getFullYear() !== year) continue;
      if (month != null && d.getMonth() !== month) continue;

      const attribution = String(getCell(row, headerIndex[normalizeHeaderName('Attribution')])).trim() || 'Non attribué';
      const compagnie = String(getCell(row, headerIndex[normalizeHeaderName('Compagnie')])).trim() || '—';
      const commissions = normalizeNumber(getCell(row, headerIndex[normalizeHeaderName('Commission annuel 1ére année')])) ||
        normalizeNumber(getCell(row, headerIndex[normalizeHeaderName('Commission annuel 1ère année')])) ||
        normalizeNumber(getCell(row, headerIndex[normalizeHeaderName('comission annuel')])) ||
        normalizeNumber(getCell(row, headerIndex[normalizeHeaderName('commission annuel')]));
      const charge = normalizeNumber(getCell(row, headerIndex[normalizeHeaderName('Charge')]));
      const depenses = normalizeNumber(getCell(row, headerIndex[normalizeHeaderName('Dépenses')]) || getCell(row, headerIndex[normalizeHeaderName('Depenses')]));
      const frais = normalizeNumber(getCell(row, headerIndex[normalizeHeaderName('Frais')]));

      totals.contrats += 1;
      totals.commissions += commissions;
      totals.charge += charge;
      totals.depenses += depenses;
      totals.frais += frais;

      const kc = attribution.toUpperCase();
      const ccur = byCommercial.get(kc) || { commercial: attribution, contrats: 0, commissions: 0, charge: 0, depenses: 0, frais: 0, resultat: 0 };
      ccur.contrats += 1;
      ccur.commissions += commissions;
      ccur.charge += charge;
      ccur.depenses += depenses;
      ccur.frais += frais;
      byCommercial.set(kc, ccur);

      const kcomp = compagnie.toUpperCase();
      const compCur = byCompany.get(kcomp) || { compagnie, contrats: 0, commissions: 0, charge: 0, depenses: 0, frais: 0, resultat: 0 };
      compCur.contrats += 1;
      compCur.commissions += commissions;
      compCur.charge += charge;
      compCur.depenses += depenses;
      compCur.frais += frais;
      byCompany.set(kcomp, compCur);
    }

    totals.resultat = totals.commissions - totals.charge - totals.depenses - totals.frais;
    const rowsCommercial = Array.from(byCommercial.values()).map(x => ({ ...x, resultat: x.commissions - x.charge - x.depenses - x.frais })).sort((a, b) => b.resultat - a.resultat);
    const rowsCompany = Array.from(byCompany.values()).map(x => ({ ...x, resultat: x.commissions - x.charge - x.depenses - x.frais })).sort((a, b) => b.resultat - a.resultat);

    res.json({
      year,
      month,
      totals,
      byCommercial: rowsCommercial,
      byCompany: rowsCompany,
      variations: { vsPrevMonth: null, vsPrevYear: { commissions: 0, resultat: 0 } },
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to build P&L' });
  }
});

// Get all contracts
app.get('/api/contracts', async (req, res) => {
  try {
    if (!isGoogleSheetsConfigured()) {
      return res.status(503).json({ error: 'Google Sheets not configured' });
    }
    const contracts = await getAllContracts();
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Get contract by ID
app.get('/api/contracts/:id', async (req, res) => {
  try {
    if (!isGoogleSheetsConfigured()) {
      return res.status(503).json({ error: 'Google Sheets not configured' });
    }

    const contracts = await getAllContracts();
    const contract = contracts.find(c => c.id === req.params.id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Create contract
app.post('/api/contracts', async (req, res) => {
  try {
    if (!isGoogleSheetsConfigured()) {
      return res.status(503).json({ error: 'Google Sheets not configured' });
    }

    const contract = req.body;

    // Validate contract data
    if (!contract.nom || !contract.compagnie || contract.primeBrute <= 0) {
      return res.status(400).json({ error: 'Invalid contract data: missing required fields or invalid prime' });
    }

    const sheetsAPI = initializeSheets();

    // Generate new ID if not provided
    const validatedContract = { ...contract };
    if (!validatedContract.id) {
      validatedContract.id = `CTT_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    }

    // Read headers to append a row respecting the real structure of "Ctt brute"
    const read = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONTRACTS_SHEET}!A1:CY1`,
    });
    const headers = (read.data.values?.[0] || []);
    const headerIndex = headerIndexFromHeaders(headers);
    const newRow = new Array(headers.length).fill('');

    const setIfPresent = (candidates, value) => {
      const idx = idxAny(headerIndex, candidates);
      if (idx >= 0) newRow[idx] = value ?? '';
    };

    setIfPresent(['Contrat - N° de contrat', 'N° de contrat'], validatedContract.id);
    setIfPresent(['Contact - Nom'], validatedContract.nom);
    setIfPresent(['Contact - Prénom', 'Contact - Prenom'], validatedContract.prenom);
    setIfPresent(['Projet - Attribution', 'Attribution'], validatedContract.attribution || '');
    setIfPresent(['Contrat - Compagnie', 'Compagnie'], validatedContract.compagnie);
    setIfPresent(['Contrat - Produit', 'Produit'], validatedContract.produit || '');
    setIfPresent(['Contrat - Formule', 'Formule'], validatedContract.formule || '');
    setIfPresent(['Projet - Date de souscription', 'Date de souscription'], validatedContract.dateSouscription || '');
    setIfPresent(["Contrat - Début d'effet", "Date d'effet"], validatedContract.dateEffet || '');
    setIfPresent(['Contrat - Prime brute mensuelle', 'Prime brute mensuelle'], String(validatedContract.primeBrute ?? ''));
    setIfPresent(['Contrat - Type de commissionnement', 'Type de commissionnement'], validatedContract.typeCommission || '');
    setIfPresent(['Contrat - Commissionnement 1ère année (%)', 'Contrat - Commissionnement 1ére année (%)'], String(validatedContract.tauxCommission ?? ''));
    setIfPresent(['Contrat - Commissionnement années suivantes (%)'], String(validatedContract.tauxN1 ?? ''));
    setIfPresent(['Contrat - Commentaire', 'Commentaire'], validatedContract.notes || '');

    await sheetsAPI.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONTRACTS_SHEET}!A:CY`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [newRow] },
    });

    // Return normalized object as the app expects
    const normalized = rowToContractFromCttBrute(newRow, headerIndex);
    res.status(201).json(normalized);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// Update contract
app.put('/api/contracts/:id', async (req, res) => {
  try {
    if (!isGoogleSheetsConfigured()) {
      return res.status(503).json({ error: 'Google Sheets not configured' });
    }

    const updates = req.body;
    const sheetsAPI = initializeSheets();

    // Read all rows once to locate the contract row in "Ctt brute"
    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONTRACTS_SHEET}!A1:CY`,
    });
    const values = response.data.values || [];
    if (values.length < 2) return res.status(404).json({ error: 'Contract not found' });
    const headers = values[0];
    const headerIndex = headerIndexFromHeaders(headers);
    const iNumero = idxAny(headerIndex, ['Contrat - N° de contrat', 'N° de contrat']);
    if (iNumero < 0) return res.status(500).json({ error: 'Missing contract number column in sheet' });

    const rowIdx1 = values.findIndex((r, i) => i > 0 && String(getCell(r, iNumero)).trim() === String(req.params.id).trim());
    if (rowIdx1 < 0) return res.status(404).json({ error: 'Contract not found' });
    const rowNumber = rowIdx1 + 1; // 1-indexed in Sheets
    const existingRow = values[rowIdx1];
    const existingContract = rowToContractFromCttBrute(existingRow, headerIndex);
    const updatedContract = { ...existingContract, ...updates };

    if ((Number(updatedContract.primeBrute) || 0) <= 0) {
      return res.status(400).json({ error: 'Invalid prime amount' });
    }

    const pendingUpdates = [];
    const setCell = (candidates, value) => {
      const idx = idxAny(headerIndex, candidates);
      if (idx < 0) return;
      const col = columnToA1(idx);
      pendingUpdates.push({
        range: `${CONTRACTS_SHEET}!${col}${rowNumber}`,
        values: [[value ?? '']],
      });
    };

    setCell(['Contact - Nom'], updatedContract.nom);
    setCell(['Contact - Prénom', 'Contact - Prenom'], updatedContract.prenom);
    setCell(['Projet - Attribution', 'Attribution'], updatedContract.attribution || '');
    setCell(['Contrat - Compagnie', 'Compagnie'], updatedContract.compagnie);
    setCell(['Contrat - Produit', 'Produit'], updatedContract.produit || '');
    setCell(['Contrat - Formule', 'Formule'], updatedContract.formule || '');
    setCell(['Projet - Date de souscription', 'Date de souscription'], updatedContract.dateSouscription || '');
    setCell(["Contrat - Début d'effet", "Date d'effet"], updatedContract.dateEffet || '');
    setCell(['Contrat - Prime brute mensuelle', 'Prime brute mensuelle'], String(updatedContract.primeBrute ?? ''));
    setCell(['Contrat - Type de commissionnement', 'Type de commissionnement'], updatedContract.typeCommission || '');
    setCell(['Contrat - Commissionnement 1ère année (%)', 'Contrat - Commissionnement 1ére année (%)'], String(updatedContract.tauxCommission ?? ''));
    setCell(['Contrat - Commissionnement années suivantes (%)'], String(updatedContract.tauxN1 ?? ''));
    setCell(['Contrat - Commentaire', 'Commentaire'], updatedContract.notes || '');

    await sheetsAPI.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: pendingUpdates,
      },
    });

    // Re-read updated row to return normalized contract
    const refreshed = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONTRACTS_SHEET}!A${rowNumber}:CY${rowNumber}`,
    });
    const refreshedRow = refreshed.data.values?.[0] || existingRow;
    res.json(rowToContractFromCttBrute(refreshedRow, headerIndex));
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// Delete contract
app.delete('/api/contracts/:id', async (req, res) => {
  try {
    if (!isGoogleSheetsConfigured()) {
      return res.status(503).json({ error: 'Google Sheets not configured' });
    }

    const sheetsAPI = initializeSheets();

    const response = await sheetsAPI.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONTRACTS_SHEET}!A1:CY`,
    });
    const values = response.data.values || [];
    if (values.length < 2) return res.status(404).json({ error: 'Contract not found' });
    const headerIndex = headerIndexFromHeaders(values[0]);
    const iNumero = idxAny(headerIndex, ['Contrat - N° de contrat', 'N° de contrat']);
    if (iNumero < 0) return res.status(500).json({ error: 'Missing contract number column in sheet' });

    const rowIdx1 = values.findIndex((r, i) => i > 0 && String(getCell(r, iNumero)).trim() === String(req.params.id).trim());
    if (rowIdx1 < 0) return res.status(404).json({ error: 'Contract not found' });
    const rowNumber = rowIdx1 + 1; // 1-indexed

    await sheetsAPI.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CONTRACTS_SHEET}!A${rowNumber}:CY${rowNumber}`,
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// Helper function to get all contracts (used internally)
async function getAllContracts() {
  const sheetsAPI = initializeSheets();
  const response = await sheetsAPI.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${CONTRACTS_SHEET}!A1:CY`,
  });

  const rows = response.data.values || [];
  if (rows.length < 2) return [];
  const headerIndex = headerIndexFromHeaders(rows[0]);
  return rows.slice(1).map(r => rowToContractFromCttBrute(r, headerIndex)).filter(contract => contract.id);
}

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Google Sheets configured: ${isGoogleSheetsConfigured()}`);
});