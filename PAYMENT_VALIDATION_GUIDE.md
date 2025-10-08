# Payment Amount Validation - Implementation Guide

## Overview
The `payments` table now includes strict validation to ensure financial consistency and prevent data integrity issues. All payment amounts must satisfy commission rate calculations and distribution rules.

## Validation Rules

### 1. Commission Calculation Validation
```sql
CONSTRAINT validate_commission_calculation CHECK (
  ABS(commission_amount - (amount * commission_rate / 100)) < 0.01
)
```

**Rule:** The `commission_amount` must equal the `amount` multiplied by `commission_rate` percentage, with a tolerance of 1 cent for rounding.

**Example:**
- Amount: 10000.00 KES
- Commission Rate: 15.00%
- Expected Commission: 10000 × 15 ÷ 100 = 1500.00 KES
- Valid range: 1499.99 to 1500.01 KES

### 2. Amount Distribution Validation
```sql
CONSTRAINT validate_amount_distribution CHECK (
  ABS(amount - (commission_amount + mover_payout_amount + insurance_fee)) < 0.01
)
```

**Rule:** The total `amount` must equal the sum of `commission_amount`, `mover_payout_amount`, and `insurance_fee`, with a tolerance of 1 cent for rounding.

**Example:**
- Amount: 10000.00 KES
- Commission: 1500.00 KES
- Insurance: 200.00 KES
- Mover Payout: 8300.00 KES
- Validation: 10000 = 1500 + 200 + 8300 ✓

## Helper Function

### `calculate_payment_distribution()`

A helper function is provided to correctly calculate the distribution:

```sql
SELECT * FROM calculate_payment_distribution(
  p_amount := 10000.00,           -- Total payment amount
  p_commission_rate := 15.00,     -- Commission percentage
  p_insurance_fee := 200.00       -- Optional insurance fee (default 0.00)
);
```

**Returns:**
```
commission_amount | mover_payout_amount | insurance_fee
------------------+---------------------+--------------
1500.00          | 8300.00             | 200.00
```

## Usage Examples

### Example 1: Creating a Payment (TypeScript)

#### ✅ CORRECT - Using Helper Function
```typescript
// Step 1: Calculate distribution
const { data: distribution } = await supabase
  .rpc('calculate_payment_distribution', {
    p_amount: 10000.00,
    p_commission_rate: 15.00,
    p_insurance_fee: 200.00
  })
  .single();

// Step 2: Insert payment with calculated values
const { data, error } = await supabase
  .from('payments')
  .insert({
    booking_id: bookingId,
    customer_id: customerId,
    mover_id: moverId,
    amount: 10000.00,
    commission_rate: 15.00,
    commission_amount: distribution.commission_amount,
    mover_payout_amount: distribution.mover_payout_amount,
    insurance_fee: distribution.insurance_fee,
    currency: 'KES',
    payment_method: 'mpesa',
    payment_status: 'pending'
  });
```

#### ✅ CORRECT - Manual Calculation
```typescript
const amount = 10000.00;
const commissionRate = 15.00;
const insuranceFee = 200.00;

// Calculate with proper rounding
const commissionAmount = Math.round(amount * commissionRate) / 100; // 1500.00
const moverPayoutAmount = amount - commissionAmount - insuranceFee; // 8300.00

const { data, error } = await supabase
  .from('payments')
  .insert({
    booking_id: bookingId,
    customer_id: customerId,
    mover_id: moverId,
    amount: amount,
    commission_rate: commissionRate,
    commission_amount: commissionAmount,
    mover_payout_amount: moverPayoutAmount,
    insurance_fee: insuranceFee,
    currency: 'KES',
    payment_method: 'mpesa',
    payment_status: 'pending'
  });
```

#### ❌ INCORRECT - Inconsistent Values
```typescript
// This will FAIL with constraint violation
const { data, error } = await supabase
  .from('payments')
  .insert({
    booking_id: bookingId,
    customer_id: customerId,
    amount: 10000.00,
    commission_rate: 15.00,
    commission_amount: 1600.00,  // ❌ Should be 1500.00 (15% of 10000)
    mover_payout_amount: 8400.00, // ❌ Doesn't add up with commission
    insurance_fee: 0.00,
    // ... other fields
  });

// Error: new row violates check constraint "validate_commission_calculation"
```

### Example 2: Updating Commission Rate

When updating the commission rate, you must recalculate all dependent values:

```typescript
// ❌ INCORRECT - Only updating rate
await supabase
  .from('payments')
  .update({ commission_rate: 20.00 })
  .eq('id', paymentId);
// Error: constraint violation (commission_amount no longer matches rate)

// ✅ CORRECT - Recalculate all values
const payment = await supabase
  .from('payments')
  .select('amount, insurance_fee')
  .eq('id', paymentId)
  .single();

const { data: newDistribution } = await supabase
  .rpc('calculate_payment_distribution', {
    p_amount: payment.data.amount,
    p_commission_rate: 20.00,
    p_insurance_fee: payment.data.insurance_fee
  })
  .single();

await supabase
  .from('payments')
  .update({
    commission_rate: 20.00,
    commission_amount: newDistribution.commission_amount,
    mover_payout_amount: newDistribution.mover_payout_amount
  })
  .eq('id', paymentId);
```

### Example 3: Handling Refunds

When processing refunds, the original distribution constraints still apply:

```typescript
// Full refund
await supabase
  .from('payments')
  .update({
    is_refunded: true,
    refund_amount: payment.amount,
    refund_reason: 'Customer cancelled',
    refunded_at: new Date().toISOString(),
    payment_status: 'refunded'
  })
  .eq('id', paymentId);

// Partial refund - distribution still valid
// (no need to adjust commission_amount, etc. as original transaction is unchanged)
```

## Common Errors and Solutions

### Error 1: Commission Calculation Mismatch
```
ERROR: new row violates check constraint "validate_commission_calculation"
DETAIL: Failing row contains commission_amount that doesn't match rate
```

**Solution:** Ensure `commission_amount = amount × commission_rate ÷ 100`
```typescript
const commissionAmount = Math.round(amount * commissionRate) / 100;
```

### Error 2: Amount Distribution Mismatch
```
ERROR: new row violates check constraint "validate_amount_distribution"
DETAIL: Total amount doesn't equal sum of parts
```

**Solution:** Ensure `amount = commission_amount + mover_payout_amount + insurance_fee`
```typescript
const moverPayoutAmount = amount - commissionAmount - insuranceFee;
```

### Error 3: Rounding Issues
If you get constraint violations due to rounding:

```typescript
// ❌ WRONG - JavaScript floating point issues
const commissionAmount = amount * commissionRate / 100; // May have precision issues

// ✅ CORRECT - Round to 2 decimal places
const commissionAmount = Math.round(amount * commissionRate) / 100;
// OR
const commissionAmount = Number((amount * commissionRate / 100).toFixed(2));
```

## Service Layer Implementation

Create a payment service to handle calculations:

```typescript
// src/services/paymentService.ts
import { supabase } from '@/integrations/supabase/client';

interface PaymentDistribution {
  commission_amount: number;
  mover_payout_amount: number;
  insurance_fee: number;
}

export const paymentService = {
  /**
   * Calculate payment distribution using database helper function
   */
  async calculateDistribution(
    amount: number,
    commissionRate: number,
    insuranceFee: number = 0
  ): Promise<PaymentDistribution> {
    const { data, error } = await supabase
      .rpc('calculate_payment_distribution', {
        p_amount: amount,
        p_commission_rate: commissionRate,
        p_insurance_fee: insuranceFee
      })
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new payment with validated distribution
   */
  async createPayment(params: {
    bookingId: string;
    customerId: string;
    moverId: string;
    amount: number;
    commissionRate: number;
    insuranceFee?: number;
    paymentMethod: string;
    // ... other payment fields
  }) {
    // Calculate distribution
    const distribution = await this.calculateDistribution(
      params.amount,
      params.commissionRate,
      params.insuranceFee || 0
    );

    // Insert payment
    const { data, error } = await supabase
      .from('payments')
      .insert({
        booking_id: params.bookingId,
        customer_id: params.customerId,
        mover_id: params.moverId,
        amount: params.amount,
        commission_rate: params.commissionRate,
        commission_amount: distribution.commission_amount,
        mover_payout_amount: distribution.mover_payout_amount,
        insurance_fee: distribution.insurance_fee,
        payment_method: params.paymentMethod,
        payment_status: 'pending',
        currency: 'KES'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
```

## Testing

### Unit Tests
```typescript
describe('Payment Distribution', () => {
  it('should calculate correct commission', async () => {
    const result = await supabase
      .rpc('calculate_payment_distribution', {
        p_amount: 10000,
        p_commission_rate: 15,
        p_insurance_fee: 200
      })
      .single();

    expect(result.data.commission_amount).toBe(1500);
    expect(result.data.mover_payout_amount).toBe(8300);
    expect(result.data.insurance_fee).toBe(200);
  });

  it('should reject invalid commission amount', async () => {
    const { error } = await supabase.from('payments').insert({
      // ... required fields ...
      amount: 10000,
      commission_rate: 15,
      commission_amount: 1600, // Wrong! Should be 1500
      mover_payout_amount: 8400,
      insurance_fee: 0
    });

    expect(error).toBeTruthy();
    expect(error.message).toContain('validate_commission_calculation');
  });

  it('should reject invalid distribution', async () => {
    const { error } = await supabase.from('payments').insert({
      // ... required fields ...
      amount: 10000,
      commission_rate: 15,
      commission_amount: 1500, // Correct
      mover_payout_amount: 8600, // Wrong! Doesn't add up
      insurance_fee: 0
    });

    expect(error).toBeTruthy();
    expect(error.message).toContain('validate_amount_distribution');
  });
});
```

## Migration Notes

### For Existing Data
If you have existing payments that don't satisfy these constraints:

```sql
-- Find invalid payments
SELECT 
  id,
  amount,
  commission_rate,
  commission_amount,
  mover_payout_amount,
  insurance_fee,
  ABS(commission_amount - (amount * commission_rate / 100)) as commission_diff,
  ABS(amount - (commission_amount + mover_payout_amount + insurance_fee)) as distribution_diff
FROM payments
WHERE 
  ABS(commission_amount - (amount * commission_rate / 100)) >= 0.01
  OR ABS(amount - (commission_amount + mover_payout_amount + insurance_fee)) >= 0.01;

-- Fix invalid payments (if needed)
UPDATE payments
SET 
  commission_amount = ROUND(amount * commission_rate / 100, 2),
  mover_payout_amount = amount - ROUND(amount * commission_rate / 100, 2) - insurance_fee
WHERE 
  ABS(commission_amount - (amount * commission_rate / 100)) >= 0.01
  OR ABS(amount - (commission_amount + mover_payout_amount + insurance_fee)) >= 0.01;
```

## Benefits

✅ **Data Integrity:** Prevents inconsistent financial records  
✅ **Audit Compliance:** Ensures calculations are always correct  
✅ **Error Prevention:** Catches bugs at database level  
✅ **Documentation:** Constraints serve as validation rules  
✅ **Trust:** Financial data is mathematically guaranteed to be correct

## Related Documentation

- [Supabase CHECK Constraints](https://supabase.com/docs/guides/database/tables#check-constraints)
- [PostgreSQL Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html)
- [Financial Calculations Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This#Don.27t_use_money)

---

**Date:** October 8, 2025  
**Migration File:** `20251008_part2_marketplace_schema.sql`  
**Status:** ✅ Active Validation
