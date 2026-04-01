// Test Google Sheets connection
import { googleSheetsService } from './src/app/services/googleSheetsService.js';

async function testConnection() {
  try {
    console.log('🔍 Testing Google Sheets connection...');

    // Test if configured
    const isConfigured = googleSheetsService.isGoogleSheetsConfigured();
    console.log('✅ Google Sheets configured:', isConfigured);

    if (!isConfigured) {
      console.log('❌ Google Sheets not configured properly');
      return;
    }

    // Test fetching contracts
    console.log('📊 Fetching contracts from Google Sheets...');
    const contracts = await googleSheetsService.getAllContracts();
    console.log('✅ Successfully fetched contracts:', contracts.length, 'contracts');

    if (contracts.length > 0) {
      console.log('📋 First contract sample:', contracts[0]);
    }

    console.log('🎉 Google Sheets integration working perfectly!');

  } catch (error) {
    console.error('❌ Error testing Google Sheets:', error.message);
    console.log('🔧 Troubleshooting tips:');
    console.log('1. Check if your API key is valid');
    console.log('2. Verify the sheet is shared with the API service account');
    console.log('3. Make sure the sheet name is "Contrats"');
    console.log('4. Check browser console for CORS errors');
  }
}

testConnection();