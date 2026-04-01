const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://d1cca04b.premunia-6ku.pages.dev",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

function normalizeHeaderName(v = "") {
  return String(v)
    .replace(/\uFEFF/g, "")
    .replace(/^["']+|["']+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function idxAny(headerMap, names) {
  for (const n of names) {
    const k = normalizeHeaderName(n);
    if (k in headerMap) return headerMap[k];
  }
  return -1;
}

function getCell(row, idx) {
  return idx >= 0 ? row[idx] ?? "" : "";
}

function normalizeNumber(v) {
  if (v == null) return 0;
  const s = String(v)
    .replace(/\u00A0/g, " ")
    .replace(/\s/g, "")
    .replace(/[€$]/g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function parseFrDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (s.includes("/")) {
    const [dd, mm, yyyy] = s.split("/").map(Number);
    if (!dd || !mm || !yyyy) return null;
    const d = new Date(Date.UTC(yyyy, mm - 1, dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---- Google auth (Service Account) ----
function b64url(input) {
  const str = typeof input === "string" ? input : JSON.stringify(input);
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function signRS256(unsigned, privateKeyPemRaw) {
  // Nettoyage robuste de la clé
  const pemNormalized = String(privateKeyPemRaw || "")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "")
    .trim();

  const base64Body = pemNormalized
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");

  if (!base64Body) {
    throw new Error("PRIVATE_KEY body is empty after normalization");
  }

  let binary;
  try {
    binary = atob(base64Body);
  } catch (e) {
    throw new Error("Invalid PRIVATE_KEY base64 content");
  }

  const keyBytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));

  const key = await crypto.subtle.importKey(
    "pkcs8",
    keyBytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );

  const bytes = new Uint8Array(signature);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return btoa(out).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
async function getAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const unsigned = `${b64url(header)}.${b64url(payload)}`;
  const signature = await signRS256(unsigned, env.GOOGLE_PRIVATE_KEY);
  const jwt = `${unsigned}.${signature}`;

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!resp.ok) throw new Error(`OAuth token error: ${resp.status}`);
  const data = await resp.json();
  return data.access_token;
}

async function sheetsValues(env, range) {
  const token = await getAccessToken(env);
  const sid = env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${encodeURIComponent(range)}`;
  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Sheets error ${resp.status}: ${txt}`);
  }
  const data = await resp.json();
  return data.values || [];
}

function mapContracts(values) {
  if (!values.length) return [];
  const headers = values[0];
  const map = {};
  headers.forEach((h, i) => (map[normalizeHeaderName(h)] = i));

  const iNom = idxAny(map, ["Contact - Nom"]);
  const iPrenom = idxAny(map, ["Contact - Prénom", "Contact - Prenom"]);
  const iAttr = idxAny(map, ["Projet - Attribution", "Attribution"]);
  const iComp = idxAny(map, ["Contrat - Compagnie", "Compagnie"]);
  const iProd = idxAny(map, ["Contrat - Produit", "Produit"]);
  const iForm = idxAny(map, ["Contrat - Formule", "Formule"]);
  const iSous = idxAny(map, ["Projet - Date de souscription"]);
  const iEff = idxAny(map, ["Contrat - Début d'effet", "Date d'effet"]);
  const iNum = idxAny(map, ["Contrat - N° de contrat", "N° de contrat"]);
  const iPrime = idxAny(map, ["Contrat - Prime brute mensuelle", "Prime brute mensuelle"]);
  const iType = idxAny(map, ["Contrat - Type de commissionnement"]);
  const iTauxN = idxAny(map, ["Contrat - Commissionnement 1ère année (%)", "Contrat - Commissionnement 1ére année (%)"]);
  const iTauxN1 = idxAny(map, ["Contrat - Commissionnement années suivantes (%)"]);

  const NET = 0.875;

  return values.slice(1).map((r) => {
    const primeBrute = normalizeNumber(getCell(r, iPrime));
    const tauxCommission = normalizeNumber(getCell(r, iTauxN));
    const tauxN1 = normalizeNumber(getCell(r, iTauxN1));
    const primeAnnuelle = primeBrute * 12;

    return {
      id: String(getCell(r, iNum)).trim() || `ctt_${crypto.randomUUID()}`,
      nom: String(getCell(r, iNom)).trim(),
      prenom: String(getCell(r, iPrenom)).trim(),
      compagnie: String(getCell(r, iComp)).trim(),
      categorie: "Santé",
      produit: String(getCell(r, iProd)).trim(),
      formule: String(getCell(r, iForm)).trim(),
      typeCommission: String(getCell(r, iType)).toLowerCase().includes("précomp") ? "Précompte" : "Linéaire",
      tauxCommission,
      tauxBase: tauxCommission,
      tauxSecondaire: 0,
      dateSouscription: String(getCell(r, iSous)).trim(),
      dateEffet: String(getCell(r, iEff)).trim(),
      tauxN1,
      primeBrute,
      commissionPrincipale: +(primeAnnuelle * (tauxCommission / 100) * NET).toFixed(2),
      commissionSecondaire: 0,
      commissionN: +(primeAnnuelle * (tauxCommission / 100) * NET).toFixed(2),
      commissionN1: +(primeAnnuelle * (tauxN1 / 100) * NET).toFixed(2),
      statut: "Actif",
      attribution: String(getCell(r, iAttr)).trim(),
    };
  });
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (request.method === "OPTIONS") {
        return new Response(null, { headers: CORS_HEADERS });
      }

      if (url.pathname === "/api/health") {
        return json({
          status: "OK",
          worker: "up",
          hasEmail: !!env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          hasKey: !!env.GOOGLE_PRIVATE_KEY,
          hasSheet: !!env.GOOGLE_SHEETS_SPREADSHEET_ID,
          now: new Date().toISOString(),
        });
      }

      if (url.pathname === "/api/contracts") {
        const values = await sheetsValues(env, "Ctt brute!A1:CY");
        return json(mapContracts(values));
      }

      if (url.pathname === "/api/commercial-performance") {
        const values = await sheetsValues(env, "Ctt brute!A1:CY");
        const contracts = mapContracts(values);
        const agg = new Map();
        for (const c of contracts) {
          const k = (c.attribution || "Non attribué").trim();
          const cur = agg.get(k) || {
            commercial: k,
            contratsTotal: 0,
            contratsActifs: 0,
            primeMensuelleTotale: 0,
            commissionN: 0,
            commissionN1: 0,
            commissionTotale: 0,
          };
          cur.contratsTotal++;
          cur.contratsActifs++;
          cur.primeMensuelleTotale += c.primeBrute || 0;
          cur.commissionN += c.commissionN || 0;
          cur.commissionN1 += c.commissionN1 || 0;
          cur.commissionTotale = cur.commissionN + cur.commissionN1;
          agg.set(k, cur);
        }
        return json([...agg.values()].sort((a, b) => b.commissionTotale - a.commissionTotale));
      }

      if (url.pathname === "/api/pl") {
        const year = Number(url.searchParams.get("year"));
        const monthRaw = url.searchParams.get("month");
        const month = monthRaw == null ? null : Number(monthRaw);
        if (!Number.isFinite(year)) return json({ error: "Missing year" }, 400);

        const values = await sheetsValues(env, "Contrats!A1:AZ");
        if (values.length < 2) {
          return json({
            year, month,
            totals: { contrats: 0, commissions: 0, charge: 0, depenses: 0, frais: 0, resultat: 0 },
            byCommercial: [],
            byCompany: [],
            variations: { vsPrevMonth: null, vsPrevYear: { commissions: 0, resultat: 0 } },
          });
        }

        const headers = values[0];
        const map = {};
        headers.forEach((h, i) => (map[normalizeHeaderName(h)] = i));

        const iSig = idxAny(map, ["Signature"]);
        const iAttr = idxAny(map, ["Attribution"]);
        const iComp = idxAny(map, ["Compagnie"]);
        const iCom = idxAny(map, ["Commission annuel 1ére année", "Commission annuel 1ère année", "comission annuel", "commission annuel"]);
        const iCh = idxAny(map, ["Charge"]);
        const iDep = idxAny(map, ["Dépenses", "Depenses"]);
        const iFr = idxAny(map, ["Frais"]);

        const totals = { contrats: 0, commissions: 0, charge: 0, depenses: 0, frais: 0, resultat: 0 };
        const byCommercial = new Map();
        const byCompany = new Map();

        for (const r of values.slice(1)) {
          const d = parseFrDate(getCell(r, iSig));
          if (!d) continue;
          if (d.getUTCFullYear() !== year) continue;
          if (month != null && d.getUTCMonth() !== month) continue;

          const commercial = String(getCell(r, iAttr)).trim() || "Non attribué";
          const compagnie = String(getCell(r, iComp)).trim() || "—";
          const commissions = normalizeNumber(getCell(r, iCom));
          const charge = normalizeNumber(getCell(r, iCh));
          const depenses = normalizeNumber(getCell(r, iDep));
          const frais = normalizeNumber(getCell(r, iFr));

          totals.contrats++;
          totals.commissions += commissions;
          totals.charge += charge;
          totals.depenses += depenses;
          totals.frais += frais;

          const c = byCommercial.get(commercial) || { commercial, contrats: 0, commissions: 0, charge: 0, depenses: 0, frais: 0, resultat: 0 };
          c.contrats++; c.commissions += commissions; c.charge += charge; c.depenses += depenses; c.frais += frais;
          byCommercial.set(commercial, c);

          const co = byCompany.get(compagnie) || { compagnie, contrats: 0, commissions: 0, charge: 0, depenses: 0, frais: 0, resultat: 0 };
          co.contrats++; co.commissions += commissions; co.charge += charge; co.depenses += depenses; co.frais += frais;
          byCompany.set(compagnie, co);
        }

        totals.resultat = totals.commissions - totals.charge - totals.depenses - totals.frais;
        const rowsCommercial = [...byCommercial.values()].map((x) => ({ ...x, resultat: x.commissions - x.charge - x.depenses - x.frais }));
        const rowsCompany = [...byCompany.values()].map((x) => ({ ...x, resultat: x.commissions - x.charge - x.depenses - x.frais }));

        return json({
          year,
          month,
          totals,
          byCommercial: rowsCommercial,
          byCompany: rowsCompany,
          variations: { vsPrevMonth: null, vsPrevYear: { commissions: 0, resultat: 0 } },
        });
      }

      if (url.pathname === "/api/commission-rules") {
        return json({ spreadsheetId: null, sheets: [], count: 0, updatedAt: Date.now(), rules: [], sample: [] });
      }

      return json({ error: "Not found" }, 404);
    } catch (e) {
      return json({ error: "Worker error", details: String(e?.message || e) }, 500);
    }
  },
};