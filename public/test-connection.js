// Test Google Sheets connection via backend API
async function testGoogleSheetsConnection() {
  try {
    console.log('🔍 Testing Google Sheets connection via backend API...');

    // Test health check first
    console.log('🏥 Checking backend health...');
    const healthResponse = await fetch('/api/health');
    if (!healthResponse.ok) {
      throw new Error(`Backend not responding: ${healthResponse.status}`);
    }
    const health = await healthResponse.json();
    console.log('✅ Backend is healthy:', health);

    // Test contracts endpoint
    console.log('📊 Fetching contracts from Google Sheets via API...');
    const contractsResponse = await fetch('/api/contracts');
    if (!contractsResponse.ok) {
      throw new Error(`API error: ${contractsResponse.status} ${contractsResponse.statusText}`);
    }
    const contracts = await contractsResponse.json();

    console.log('✅ Successfully connected to Google Sheets via API!');
    console.log('📋 Found', contracts.length, 'contracts');

    if (contracts.length > 0) {
      console.log('📄 Sample contract:', {
        id: contracts[0].id,
        nom: contracts[0].nom,
        compagnie: contracts[0].compagnie,
        primeBrute: contracts[0].primeBrute,
        statut: contracts[0].statut
      });
    } else {
      console.log('📝 No contracts found - make sure your sheet has data in the "Contrats" tab');
    }

  } catch (error) {
    console.error('❌ Error connecting to Google Sheets:', error.message);

    if (error.message.includes('Backend not responding')) {
      console.log('🔧 Backend server not running - Start the backend with: cd backend && npm run dev');
    } else if (error.message.includes('Access denied') || error.message.includes('403')) {
      console.log('🔧 Access denied - Make sure you shared the sheet with:');
      console.log('sheets-api-service@phonic-operand-461910-c4.iam.gserviceaccount.com');
    } else if (error.message.includes('Spreadsheet not found')) {
      console.log('🔧 Spreadsheet not found - Check SPREADSHEET_ID in backend/.env');
    } else {
      console.log('🔧 Other error - Check the full error details');
    }
  }
}

// Run test when page loads
window.addEventListener('load', () => {
  setTimeout(testGoogleSheetsConnection, 2000); // Wait for app to load
});