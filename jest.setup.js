// jest.setup.js
global.import = {
  meta: {
    env: {
      VITE_GOOGLE_SHEETS_SPREADSHEET_ID: 'test_spreadsheet_id',
      VITE_GOOGLE_SHEETS_API_KEY: 'test_api_key',
      VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL: 'test@example.com',
      VITE_GOOGLE_PRIVATE_KEY: 'test_private_key',
    },
  },
};