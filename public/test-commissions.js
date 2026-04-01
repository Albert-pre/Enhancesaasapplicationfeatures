// Test script to verify commission calculations
async function testCommissionCalculations() {
  try {
    console.log('🔍 Testing commission calculations...');

    const response = await fetch('/api/contracts');
    const contracts = await response.json();

    console.log('📊 Testing calculations for first few contracts:');

    contracts.slice(0, 3).forEach((contract, index) => {
      console.log(`\n--- Contract ${index + 1} ---`);
      console.log(`Nom: ${contract.nom} ${contract.prenom}`);
      console.log(`Compagnie: ${contract.compagnie}`);
      console.log(`Prime brute: ${contract.primeBrute}€`);
      console.log(`Taux commission: ${contract.tauxCommission}%`);
      console.log(`Commission N: ${contract.commissionN}€`);
      console.log(`Commission N1: ${contract.commissionN1}€`);
      console.log(`Type: ${contract.typeCommission}`);
    });

    // Test specific known values
    const zeniOOContract = contracts.find(c => c.compagnie === 'ZENIOO');
    if (zeniOOContract) {
      console.log('\n🎯 ZENIOO Contract Test:');
      console.log(`Prime: ${zeniOOContract.primeBrute}€`);
      console.log(`Expected taux: 30% (from mapping)`);
      console.log(`Actual taux: ${zeniOOContract.tauxCommission}%`);
      console.log(`Expected commission N: ${(zeniOOContract.primeBrute * 12 * 0.30).toFixed(2)}€`);
      console.log(`Actual commission N: ${zeniOOContract.commissionN}€`);
    }

  } catch (error) {
    console.error('❌ Error testing calculations:', error);
  }
}

// Run test
testCommissionCalculations();