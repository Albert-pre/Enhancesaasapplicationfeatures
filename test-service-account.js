// Test Google Sheets connection with service account
import { googleSheetsService } from './src/app/services/googleSheetsService.js';

async function testServiceAccountConnection() {
  try {
    console.log('🔐 Testing Google Sheets connection with Service Account...');

    // Check if configured
    const isConfigured = googleSheetsService.isGoogleSheetsConfigured();
    console.log('✅ Google Sheets configured:', isConfigured);

    if (!isConfigured) {
      console.log('❌ Google Sheets not configured properly');
      console.log('Check your .env file for SERVICE_ACCOUNT_EMAIL and PRIVATE_KEY');
      return;
    }

    // Test fetching contracts
    console.log('📊 Fetching contracts from Google Sheets...');
    const contracts = await googleSheetsService.getAllContracts();
    console.log('✅ Successfully fetched contracts:', contracts.length, 'contracts');

    if (contracts.length > 0) {
      console.log('📋 First contract sample:', contracts[0]);
    } else {
      console.log('📝 No contracts found in the sheet. Make sure your sheet has data in the "Contrats" tab.');
    }

    console.log('🎉 Service Account authentication working perfectly!');

  } catch (error) {
    console.error('❌ Error testing Google Sheets:', error.message);

    if (error.message.includes('Access denied') || error.message.includes('403')) {
      console.log('🔧 Access denied - Make sure you shared the sheet with:');
      console.log('sheets-api-service@phonic-operand-461910-c4.iam.gserviceaccount.com');
      console.log('And gave it "Editor" permissions');
    } else if (error.message.includes('Spreadsheet not found') || error.message.includes('404')) {
      console.log('🔧 Spreadsheet not found - Check your SPREADSHEET_ID in .env');
      console.log('Current ID: 18Y_09gXrbBzDqzbrAvAfiq2PpKvrXK-oXptLPHAvoDw');
    } else {
      console.log('🔧 Other error - Check browser console for more details');
    }
  }
}

testServiceAccountConnection();