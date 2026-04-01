# Configuration Google Sheets API - Guide Complet

## 📋 Étapes pour Obtenir une API Key

### 1. Accéder à Google Cloud Console
- Allez sur : https://console.cloud.google.com/
- Connectez-vous avec votre compte Google

### 2. Créer un Nouveau Projet (si nécessaire)
- Cliquez sur le menu déroulant en haut à gauche
- Sélectionnez "Nouveau projet"
- Nommez-le (ex: "MonApp-Commissions")
- Cliquez sur "Créer"

### 3. Activer Google Sheets API
- Dans la barre de recherche, tapez "Google Sheets API"
- Cliquez sur "Google Sheets API" dans les résultats
- Cliquez sur "Activer"

### 4. Créer des Identifiants (API Key)
- Dans le menu de gauche, cliquez sur "Identifiants"
- Cliquez sur "+ CRÉER DES IDENTIFIANTS"
- Sélectionnez "Clé API"
- La clé API sera créée automatiquement
- **⚠️ IMPORTANT :** Cliquez sur "Restreindre la clé" pour la sécuriser

### 5. Restreindre la Clé API
- Dans les restrictions :
  - **Applications :** Sélectionnez "Sites web (pour les navigateurs)"
  - **Sites web :** Ajoutez votre domaine local : `http://localhost:5174/*`
  - **APIs :** Cochez "Google Sheets API"
- Cliquez sur "Enregistrer"

### 6. Partager Votre Sheet
- Ouvrez votre Google Sheet : https://docs.google.com/spreadsheets/d/18Y_09gXrbBzDqzbrAvAfiq2PpKvrXK-oXptLPHAvoDw/edit
- Cliquez sur "Partager" en haut à droite
- Ajoutez l'adresse email suivante comme éditeur :
  ```
  sheets-api-service@googlesheets.iam.gserviceaccount.com
  ```
- Ou rendez le sheet public en lecture/écriture (moins sécurisé)

### 7. Configurer les Variables d'Environnement
Créez un fichier `.env` dans la racine de votre projet :

```env
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=18Y_09gXrbBzDqzbrAvAfiq2PpKvrXK-oXptLPHAvoDw
VITE_GOOGLE_SHEETS_API_KEY=votre_clé_api_ici
```

### 8. Tester la Connexion
- Lancez votre app : `npm run dev`
- Ouvrez la console du navigateur (F12)
- Vérifiez qu'il n'y a pas d'erreurs liées à Google Sheets

## 🔧 Dépannage

### Erreur "API has not been used"
- Revenez sur Google Cloud Console
- Allez dans "API et services" > "Bibliothèque"
- Recherchez "Google Sheets API"
- Assurez-vous qu'elle est activée

### Erreur "The API key is not authorized"
- Vérifiez les restrictions de votre clé API
- Assurez-vous que "Google Sheets API" est cochée
- Ajoutez `http://localhost:5174` aux sites autorisés

### Erreur "Access denied"
- Partagez votre sheet avec l'adresse email du service API
- Ou rendez le sheet public temporairement pour tester

## 🔒 Sécurité
- **NE JAMAIS** committer votre `.env` avec la vraie clé API
- Utilisez des variables d'environnement pour la production
- Restreignez toujours vos clés API

## 📞 Support
Si vous avez des problèmes, vérifiez :
1. La clé API est correcte
2. L'API est activée
3. Le sheet est partagé correctement
4. Les variables d'environnement sont chargées