// Quick test for Google Sheets connection
async function testGoogleSheets() {
  try {
    console.log('🔍 Testing Google Sheets connection...');

    // Import the service dynamically to avoid build issues
    const { googleSheetsService } = await import('./src/app/services/googleSheetsService.js');

    const isConfigured = googleSheetsService.isGoogleSheetsConfigured();
    console.log('✅ Google Sheets configured:', isConfigured);

    if (isConfigured) {
      console.log('📊 Fetching contracts...');
      const contracts = await googleSheetsService.getAllContracts();
      console.log('✅ Found', contracts.length, 'contracts');

      if (contracts.length > 0) {
        console.log('📋 Sample contract:', contracts[0]);
      }
    }

    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGoogleSheets();