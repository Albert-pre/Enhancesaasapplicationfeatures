import { calculateCommissions } from './googleSheetsService';

describe('Commission Calculations', () => {
  test('should calculate commissions for Précompte type', () => {
    const result = calculateCommissions(100, 5, 60, 60, 50, 'Précompte');

    expect(result.commissionPrincipale).toBe(36); // 60 * 0.6
    expect(result.commissionSecondaire).toBe(24); // 60 * 0.4
    expect(result.commissionN).toBe(60);
    expect(result.commissionN1).toBe(50);
    expect(result.tauxCommission).toBeCloseTo(5, 1); // 60/1200 * 100 = 5%
    expect(result.tauxN1).toBeCloseTo(4.17, 1); // 50/1200 * 100 ≈ 4.17%
  });

  test('should handle zero prime', () => {
    const result = calculateCommissions(0, 0, 0, 0, 0);

    expect(result.tauxCommission).toBe(0);
    expect(result.tauxN1).toBe(0);
    expect(result.commissionN).toBe(0);
  });

  test('should use provided commission values', () => {
    const result = calculateCommissions(100, 10, 120, 120, 100);

    expect(result.commissionN).toBe(120);
    expect(result.commissionN1).toBe(100);
  });
});