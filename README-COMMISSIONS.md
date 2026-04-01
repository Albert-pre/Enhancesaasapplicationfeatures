# Test de Lecture Automatique des Commissions

## 📋 Description

Ce script permet de tester la lecture automatique des règles de commissions depuis votre fichier Google Sheets.

## 🚀 Utilisation

### 1. Convertir votre fichier commissions

Avant tout, assurez-vous que votre fichier commissions est un **Google Sheet natif** :

1. Ouvrez votre fichier : https://docs.google.com/spreadsheets/d/1TTAFE9ARMBwGxBr3dUzPDdjHG69xp8-1/edit
2. Faites `Fichier` → `Enregistrer sous Google Sheets`
3. Partagez le nouveau fichier avec : `sheets-api-service@phionic-operand-461910-c4.iam.gserviceaccount.com`
4. Récupérez le nouvel ID (dans l'URL : `/spreadsheets/d/<NOUVEL_ID>/edit`)

### 2. Mettre à jour la configuration

Ajoutez au fichier `.env` :
```env
VITE_GOOGLE_COMMISSIONS_SPREADSHEET_ID=<NOUVEL_ID>
```

### 3. Lancer le test

```bash
npm run test-commissions
```

## 📊 Ce que teste le script

- ✅ Connexion à Google Sheets API
- ✅ Lecture des 3 onglets (Feuille 1, Feuille 2, Feuille 3)
- ✅ Détection des colonnes importantes
- ✅ Extraction des règles de commission
- ✅ Création de l'index de recherche
- ✅ Test de l'API backend

## 📋 Colonnes attendues

Le script recherche les colonnes suivantes :

| Colonne | Obligatoire | Description |
|---------|-------------|-------------|
| Compagnie | ✅ | Nom de la compagnie d'assurance |
| Produit | ✅ | Nom du produit d'assurance |
| Contrats | ❌ | Catégorie de contrats (optionnel) |
| Type de commission (Linéaire/Précompte) | ❌ | Type de commissionnement |
| commissions de 1ère année | ❌ | Taux total commission année 1 |
| Commission de base | ❌ | Taux commission base |
| Commission de suivi | ❌ | Taux commission suivi |
| Commission qualité | ❌ | Taux commission qualité |
| Taux N+1 | ❌ | Taux commission années suivantes |

## 🔍 Résultats attendus

En cas de succès, vous verrez :

```
🔍 Test de lecture des commissions...
📁 Fichier: VOTRE_NOUVEL_ID
📋 Onglets: Feuille 1, Feuille 2, Feuille 3

📖 Lecture de l'onglet "Feuille 1"...
   ✓ 45 lignes trouvées
   📋 En-têtes détectés: compagnie, produit, commissions de 1ère année, ...
   🔍 Colonnes importantes:
      Compagnie: ✓
      Produit: ✓
      Taux total: ✓
      Commission base: ✓
      Commission suivi: ✓
   ✓ 42 règles valides extraites

📊 RÉSUMÉ
==================================================
✅ Total règles extraites: 125

📋 Exemples de règles trouvées:
   1. PREMUNIA / SANTÉ / PULSE
      Taux: 28% | Base: 16.8% | Suivi: 11.2% | Type: Précompte

✅ La lecture automatique des commissions est fonctionnelle!
💡 Les taux seront appliqués automatiquement sur les contrats via l'API /api/contracts
```

## ❌ En cas d'erreur

### Erreur "failedPrecondition" ou "not supported"

```
❌ Erreur lecture "Feuille 1": This operation is not supported for this document
💡 Ce fichier n'est probablement pas un Google Sheet natif.
💡 Solution: Fichier → Enregistrer sous Google Sheets
```

**Solution** : Convertissez votre fichier en Google Sheet natif.

### Erreur "Access denied"

```
❌ Erreur lecture "Feuille 1": Access denied
💡 Vérifiez que le compte service a accès au fichier
```

**Solution** : Partagez le fichier avec `sheets-api-service@phionic-operand-461910-c4.iam.gserviceaccount.com`

## 🌐 Test de l'API backend

Le script teste également l'API backend :

```bash
curl http://localhost:3001/api/commission-rules
```

Résultat attendu :
```json
{
  "spreadsheetId": "VOTRE_NOUVEL_ID",
  "sheets": ["Feuille 1", "Feuille 2", "Feuille 3"],
  "count": 125,
  "updatedAt": 1714123456789,
  "sample": [...]
}
```

## 🎯 Prochaines étapes

1. ✅ Convertir le fichier en Google Sheet natif
2. ✅ Mettre à jour l'ID dans `.env`
3. ✅ Lancer le test avec `npm run test-commissions`
4. ✅ Vérifier que l'API backend fonctionne
5. ✅ Les commissions s'appliqueront automatiquement sur tous les contrats

## 💡 Pour aller plus loin

Pour gérer les délais de versement ("4 mois après la prise d'effet", "12 mois après l'encaissement"), ajoutez des colonnes :
- `Délai commission base (mois)`
- `Référence délai base` (signature/effet/encaissement)
- `Délai commission suivi (mois)`
- `Référence délai suivi`
