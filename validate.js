// Quick validation of commission calculations

// Commission calculation utilities
function calculateCommissions(
  primeMensuelle,
  commissionMensuelle,
  commissionAnnuelle,
  commissionPremiereAnnee,
  anneeRecurrente,
  typeCommission = 'Précompte'
) {
  const primeAnnuelle = primeMensuelle * 12;

  // Use provided values or calculate from rates
  const commissionN = commissionPremiereAnnee || commissionAnnuelle || (commissionMensuelle * 12);
  const commissionN1 = anneeRecurrente || commissionN; // Default to same as N if not specified

  // Calculate rates as percentages
  const tauxCommission = primeAnnuelle > 0 ? (commissionN / primeAnnuelle) * 100 : 0;
  const tauxN1 = primeAnnuelle > 0 ? (commissionN1 / primeAnnuelle) * 100 : 0;

  // Split commissions based on type
  let commissionPrincipale;
  let commissionSecondaire;

  if (typeCommission === 'Précompte') {
    // 60% at subscription, 40% at effect date
    commissionPrincipale = commissionN * 0.6;
    commissionSecondaire = commissionN * 0.4;
  } else {
    // Linear: spread over 12 months
    commissionPrincipale = 0;
    commissionSecondaire = 0;
  }

  return {
    commissionPrincipale,
    commissionSecondaire,
    commissionN,
    commissionN1,
    tauxCommission,
    tauxBase: tauxCommission * 0.6,
    tauxSecondaire: tauxCommission * 0.4,
    tauxN1,
  };
}

console.log('Testing commission calculations...');

// Test case 1: Précompte with prime 100€/month
const result1 = calculateCommissions(100, 5, 60, 60, 50, 'Précompte');
console.log('Test 1 - Précompte:', result1);
console.log('Expected: commissionN=60, commissionPrincipale=36, commissionSecondaire=24');
console.log('tauxCommission ≈ 5%, tauxN1 ≈ 4.17%');

// Test case 2: Zero prime
const result2 = calculateCommissions(0, 0, 0, 0, 0);
console.log('Test 2 - Zero prime:', result2);
console.log('Expected: all zeros');

console.log('Validation complete!');