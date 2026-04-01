import { google } from 'googleapis';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

// Configuration
const COMMISSIONS_SPREADSHEET_ID = 
  process.env.VITE_GOOGLE_COMMISSIONS_SPREADSHEET_ID ||
  process.env.GOOGLE_COMMISSIONS_SPREADSHEET_ID ||
  '1sewfASPU7ZuGp8wp-X7x_023_zw7pWzWk7f-XzdGptY';

const SERVICE_ACCOUNT_EMAIL = process.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.VITE_GOOGLE_PRIVATE_KEY;

const COMMISSION_SHEETS = ['Rémunération ECA', 'Feuille 1'];

function normalizeHeaderName(value = '') {
  return String(value)
    .replace(/\uFEFF/g, '')
    .replace(/^["']+|["']+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizeKey(value = '') {
  return String(value)
    .replace(/\uFEFF/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function normalizeNumber(value) {
  if (!value) return 0;
  const normalized = String(value).replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function testCommissionReading() {
  console.log('🔍 Test de lecture des commissions...');
  console.log('📁 Fichier:', COMMISSIONS_SPREADSHEET_ID);
  console.log('📋 Onglets:', COMMISSION_SHEETS.join(', '));
  console.log('');

  try {
    // Initialisation Google Sheets API
    let sheets;
    if (SERVICE_ACCOUNT_EMAIL && PRIVATE_KEY) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: SERVICE_ACCOUNT_EMAIL,
          private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      sheets = google.sheets({ version: 'v4', auth });
    } else {
      console.error('❌ Identifiants Google Sheets non configurés');
      console.log('Vérifiez vos variables d\'environnement:');
      console.log('- VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL');
      console.log('- VITE_GOOGLE_PRIVATE_KEY');
      return;
    }

    // Lecture de chaque feuille
    const allRules = [];
    
    for (const sheetName of COMMISSION_SHEETS) {
      console.log(`📖 Lecture de l'onglet "${sheetName}"...`);
      
      try {
        const resp = await sheets.spreadsheets.values.get({
          spreadsheetId: COMMISSIONS_SPREADSHEET_ID,
          range: `${sheetName}!A1:Z`,
        });

        const values = resp.data.values || [];
        console.log(`   ✓ ${values.length} lignes trouvées`);

        if (values.length < 2) {
          console.log(`   ⚠️  Onglet vide ou uniquement des en-têtes`);
          continue;
        }

        // Analyse des en-têtes
        const headers = values[0].map(h => normalizeHeaderName(h));
        console.log('   📋 En-têtes détectés:', headers.slice(0, 8).join(', '), '...');

        const idx = (headerLabel) => headers.indexOf(normalizeHeaderName(headerLabel));

        const iCompagnie = idx('Compagnie');
        const iCategorie = idx('Contrats');
        const iProduit = idx('Produit');
        const iType = idx('Type de commission (Linéaire/Précompte)');
        const iTauxTotal = idx('commissions de 1ère année') >= 0 ? idx('commissions de 1ère année') : idx('Commissions de 1ère année');
        const iBase = idx('Commission de base');
        const iSuivi = idx('Commission de suivi');
        const iQualite = idx('Commission qualité');
        const iN1 = idx('Taux N+1');

        console.log('   🔍 Colonnes importantes:');
        console.log(`      Compagnie: ${iCompagnie >= 0 ? '✓' : '❌'}`);
        console.log(`      Produit: ${iProduit >= 0 ? '✓' : '❌'}`);
        console.log(`      Taux total: ${iTauxTotal >= 0 ? '✓' : '❌'}`);
        console.log(`      Commission base: ${iBase >= 0 ? '✓' : '❌'}`);
        console.log(`      Commission suivi: ${iSuivi >= 0 ? '✓' : '❌'}`);

        if (iCompagnie < 0 || iProduit < 0) {
          console.log(`   ❌ Colonnes obligatoires manquantes`);
          continue;
        }

        // Analyse des règles
        let validRows = 0;
        for (let r = 1; r < values.length; r++) {
          const row = values[r];
          const compagnie = normalizeKey(row[iCompagnie] || '');
          const produit = normalizeKey(row[iProduit] || '');
          
          if (!compagnie || !produit) continue;
          validRows++;

          const categorie = iCategorie >= 0 ? normalizeKey(row[iCategorie] || '') : '';
          const typeCommissionRaw = iType >= 0 ? String(row[iType] || '') : '';
          const typeCommission = typeCommissionRaw.toLowerCase().includes('lin') ? 'Linéaire' : 'Précompte';

          const tauxTotal = iTauxTotal >= 0 ? normalizeNumber(row[iTauxTotal]) : 0;
          const tauxBase = iBase >= 0 ? normalizeNumber(row[iBase]) : 0;
          const tauxSuivi = iSuivi >= 0 ? normalizeNumber(row[iSuivi]) : 0;
          const tauxQualite = iQualite >= 0 ? normalizeNumber(row[iQualite]) : 0;
          const tauxN1 = iN1 >= 0 ? normalizeNumber(row[iN1]) : 0;

          const derivedTotal = tauxTotal || (tauxBase + tauxSuivi + tauxQualite);

          allRules.push({
            key: `${compagnie}__${categorie || '*'}__${produit}`,
            compagnie,
            categorie,
            produit,
            typeCommission,
            tauxTotal: derivedTotal,
            tauxBase: tauxBase || (typeCommission === 'Précompte' ? derivedTotal * 0.6 : derivedTotal),
            tauxSecondaire: tauxSuivi || (typeCommission === 'Précompte' ? derivedTotal * 0.4 : 0),
            tauxQualite,
            tauxN1,
            sourceSheet: sheetName,
          });
        }

        console.log(`   ✓ ${validRows} règles valides extraites`);
        console.log('');

      } catch (error) {
        console.error(`   ❌ Erreur lecture "${sheetName}":`, error.message);
        if (error.message.includes('failedPrecondition') || error.message.includes('not supported')) {
          console.log('   💡 Ce fichier n\'est probablement pas un Google Sheet natif.');
          console.log('   💡 Solution: Fichier → Enregistrer sous Google Sheets');
        }
        console.log('');
      }
    }

    // Résumé final
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(50));
    console.log(`✅ Total règles extraites: ${allRules.length}`);
    
    if (allRules.length > 0) {
      console.log('\n📋 Exemples de règles trouvées:');
      const sample = allRules.slice(0, 5);
      sample.forEach((rule, i) => {
        console.log(`   ${i+1}. ${rule.compagnie} / ${rule.categorie || '*'} / ${rule.produit}`);
        console.log(`      Taux: ${rule.tauxTotal}% | Base: ${rule.tauxBase}% | Suivi: ${rule.tauxSecondaire}% | Type: ${rule.typeCommission}`);
      });
      
      console.log('\n🎯 Index de recherche créé:');
      console.log(`   - Clés exactes (avec catégorie): ${allRules.filter(r => r.categorie !== '*').length}`);
      console.log(`   - Clés génériques (sans catégorie): ${allRules.filter(r => r.categorie === '*').length}`);
      
      console.log('\n✅ La lecture automatique des commissions est fonctionnelle!');
      console.log('💡 Les taux seront appliqués automatiquement sur les contrats via l\'API /api/contracts');
    } else {
      console.log('\n❌ Aucune règle trouvée');
      console.log('💡 Vérifiez:');
      console.log('   1. Que le fichier est bien un Google Sheet natif');
      console.log('   2. Que les colonnes "Compagnie" et "Produit" existent');
      console.log('   3. Que le compte service a accès au fichier');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Test de l'API backend
async function testBackendAPI() {
  console.log('\n🌐 Test de l\'API backend...');
  
  try {
    const response = await fetch('http://localhost:3001/api/commission-rules');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API répond correctement');
      console.log(`📊 ${data.count} règles chargées`);
      console.log(`📁 Fichier: ${data.spreadsheetId}`);
      console.log(`📋 Onglets: ${data.sheets.join(', ')}`);
    } else {
      const error = await response.json();
      console.log('❌ Erreur API:', response.status, error.error);
      if (error.hint) {
        console.log('💡', error.hint);
      }
    }
  } catch (error) {
    console.log('❌ Impossible de contacter l\'API backend');
    console.log('💡 Assurez-vous que le backend tourne sur http://localhost:3001');
  }
}

// Exécution
async function main() {
  await testCommissionReading();
  await testBackendAPI();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { testCommissionReading, testBackendAPI };
