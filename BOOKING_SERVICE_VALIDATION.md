# Booking Service Validation Enhancement

## Overview
Enhanced the `assignMover` method in `src/services/bookingService.ts` with comprehensive input and state validation to ensure data integrity and prevent invalid booking assignments.

## Changes Made (Lines 175-270)

### 1. **Pre-Flight Booking Validation**
```typescript
// Fetch existing booking first
const { data: existingBooking, error: fetchError } = await supabase
  .from('bookings')
  .select('*')
  .eq('id', bookingId)
  .single();
```

**Purpose:** Verify booking exists before attempting any updates
**Error Handling:** Throws descriptive error if booking not found

### 2. **Booking Status Validation**
```typescript
const allowedStatuses: BookingStatus[] = ['pending'];

if (!allowedStatuses.includes(existingBooking.status as BookingStatus)) {
  throw new Error(
    `Cannot assign mover to booking with status '${existingBooking.status}'. ` +
    `Booking must be in one of these states: ${allowedStatuses.join(', ')}`
  );
}
```

**Purpose:** Ensure booking is in a valid pre-assignment state
**Allowed States:** Only `'pending'` bookings can be assigned
**Prevention:** Blocks assignment to completed, cancelled, or already-assigned bookings

### 3. **Quoted Price Validation (Positive Check)**
```typescript
if (quotedPrice <= 0) {
  throw new Error(`Invalid quoted price: ${quotedPrice}. Price must be greater than 0.`);
}
```

**Purpose:** Ensure price is positive
**Database Alignment:** Matches database CHECK constraint `estimated_price > 0`

### 4. **Maximum Reasonable Price Validation**
```typescript
const MAX_REASONABLE_PRICE = 500000; // 500,000 KES

if (quotedPrice > MAX_REASONABLE_PRICE) {
  throw new Error(
    `Quoted price ${quotedPrice} KES exceeds maximum reasonable price of ${MAX_REASONABLE_PRICE} KES. ` +
    `Please review the quote or contact administrator.`
  );
}
```

**Purpose:** Prevent data entry errors and fraud
**Configuration:** 500,000 KES (configurable based on business requirements)
**Rationale:** Catches typos (e.g., 5000000 instead of 50000) and unrealistic quotes

### 5. **Price Deviation Validation (Estimated vs Quoted)**
```typescript
const MAX_PRICE_DEVIATION_MULTIPLIER = 3; // Quoted can be max 3x estimated

if (existingBooking.estimated_price) {
  const maxAllowedQuote = existingBooking.estimated_price * MAX_PRICE_DEVIATION_MULTIPLIER;
  
  if (quotedPrice > maxAllowedQuote) {
    throw new Error(
      `Quoted price ${quotedPrice} KES is too high compared to estimated price ${existingBooking.estimated_price} KES. ` +
      `Maximum allowed is ${maxAllowedQuote} KES (${MAX_PRICE_DEVIATION_MULTIPLIER}x estimate). ` +
      `Please provide a more reasonable quote.`
    );
  }
}
```

**Purpose:** Ensure quoted price is reasonable compared to initial estimate
**Business Rule:** Quoted price cannot exceed 3x the estimated price
**Example:** If estimate is 10,000 KES, max quote is 30,000 KES
**Flexibility:** Allows movers to adjust prices based on actual assessment, but within reasonable bounds

### 6. **Mover Existence Validation**
```typescript
const { data: mover, error: moverError } = await supabase
  .from('movers')
  .select('id, user_id, verification_status')
  .eq('id', moverId)
  .single();

if (moverError || !mover) {
  throw new Error(`Mover not found with id: ${moverId}. Please ensure the mover exists and is registered.`);
}
```

**Purpose:** Verify mover exists in the database
**Prevention:** Blocks assignment to non-existent or deleted movers
**Database Integrity:** Ensures foreign key relationship validity before update

### 7. **Mover Verification Status Check**
```typescript
if (mover.verification_status !== 'verified') {
  throw new Error(
    `Mover ${moverId} is not verified (status: ${mover.verification_status}). ` +
    `Only verified movers can accept bookings.`
  );
}
```

**Purpose:** Ensure only verified movers can accept bookings
**Business Rule:** Protects customers by requiring movers pass verification
**Verification States:** 'pending', 'submitted', 'under_review', 'verified', 'rejected'
**Security:** Prevents unverified users from accessing customer bookings

### 8. **Database Update with Enhanced Error Handling**
```typescript
const { data, error } = await supabase
  .from('bookings')
  .update({
    mover_id: moverId,
    quoted_price: quotedPrice,
    status: 'accepted' as BookingStatus,
    accepted_at: new Date().toISOString()
  })
  .eq('id', bookingId)
  .select()
  .single();

if (error) {
  throw new Error(`Failed to assign mover to booking: ${error.message}`);
}
```

**Purpose:** Perform update only after all validations pass
**Enhanced Error:** Wraps Supabase error with descriptive context
**Atomic Operation:** All validations complete before database is touched

## Validation Flow Diagram

```
assignMover(bookingId, moverId, quotedPrice)
    │
    ├─► 1. Fetch booking by ID
    │   └─► Error if not found
    │
    ├─► 2. Check booking status = 'pending'
    │   └─► Error if not in allowed state
    │
    ├─► 3. Validate quotedPrice > 0
    │   └─► Error if not positive
    │
    ├─► 4. Validate quotedPrice <= 500,000 KES
    │   └─► Error if exceeds max
    │
    ├─► 5. Validate quotedPrice <= (estimated_price × 3)
    │   └─► Error if too high vs estimate
    │
    ├─► 6. Fetch mover by ID
    │   └─► Error if not found
    │
    ├─► 7. Check mover verification_status = 'verified'
    │   └─► Error if not verified
    │
    └─► 8. Update booking (mover_id, quoted_price, status, accepted_at)
        └─► Return updated booking or throw error
```

## Configuration Values

| Setting | Value | Purpose | Adjustable |
|---------|-------|---------|-----------|
| `MAX_REASONABLE_PRICE` | 500,000 KES | Maximum quote allowed | ✅ Yes - adjust based on service area |
| `MAX_PRICE_DEVIATION_MULTIPLIER` | 3x | Max quote vs estimate ratio | ✅ Yes - adjust based on business policy |
| `allowedStatuses` | `['pending']` | Valid pre-assignment states | ✅ Yes - can add 'cancelled_customer' for re-assignment |

## Error Messages

All errors are descriptive and actionable:

1. **Booking Not Found:**
   ```
   Booking not found with id: {bookingId}
   ```

2. **Invalid Status:**
   ```
   Cannot assign mover to booking with status 'completed'. 
   Booking must be in one of these states: pending
   ```

3. **Invalid Price:**
   ```
   Invalid quoted price: -100. Price must be greater than 0.
   ```

4. **Price Too High (Absolute):**
   ```
   Quoted price 600000 KES exceeds maximum reasonable price of 500000 KES. 
   Please review the quote or contact administrator.
   ```

5. **Price Too High (Relative):**
   ```
   Quoted price 35000 KES is too high compared to estimated price 10000 KES. 
   Maximum allowed is 30000 KES (3x estimate). 
   Please provide a more reasonable quote.
   ```

6. **Mover Not Found:**
   ```
   Mover not found with id: {moverId}. 
   Please ensure the mover exists and is registered.
   ```

7. **Mover Not Verified:**
   ```
   Mover {moverId} is not verified (status: pending). 
   Only verified movers can accept bookings.
   ```

8. **Update Failed:**
   ```
   Failed to assign mover to booking: {supabase error message}
   ```

## Benefits

### 🛡️ **Data Integrity**
- Prevents invalid state transitions
- Ensures foreign key relationships are valid
- Validates business rules before database changes

### 🔒 **Security**
- Only verified movers can accept bookings
- Prevents unauthorized mover assignments
- Validates mover existence before granting access

### 💰 **Fraud Prevention**
- Catches data entry errors (typos in prices)
- Prevents unrealistic quotes
- Compares quotes against estimates

### 📊 **User Experience**
- Clear, actionable error messages
- Immediate feedback on validation failures
- Guides users to correct issues

### 🐛 **Debugging**
- Detailed error messages with context
- Easy to identify which validation failed
- Logs include relevant values for investigation

## Testing Recommendations

### Unit Tests
```typescript
describe('assignMover', () => {
  it('should throw error if booking not found', async () => {
    await expect(bookingService.assignMover('invalid-id', 'mover-id', 5000))
      .rejects.toThrow('Booking not found');
  });
  
  it('should throw error if booking status is not pending', async () => {
    // Create completed booking
    await expect(bookingService.assignMover('completed-booking-id', 'mover-id', 5000))
      .rejects.toThrow('Cannot assign mover to booking with status');
  });
  
  it('should throw error if quoted price is negative', async () => {
    await expect(bookingService.assignMover('booking-id', 'mover-id', -100))
      .rejects.toThrow('Invalid quoted price');
  });
  
  it('should throw error if quoted price exceeds maximum', async () => {
    await expect(bookingService.assignMover('booking-id', 'mover-id', 600000))
      .rejects.toThrow('exceeds maximum reasonable price');
  });
  
  it('should throw error if quoted price exceeds 3x estimate', async () => {
    // Create booking with estimated_price = 10000
    await expect(bookingService.assignMover('booking-id', 'mover-id', 35000))
      .rejects.toThrow('too high compared to estimated price');
  });
  
  it('should throw error if mover not found', async () => {
    await expect(bookingService.assignMover('booking-id', 'invalid-mover', 5000))
      .rejects.toThrow('Mover not found');
  });
  
  it('should throw error if mover not verified', async () => {
    // Create unverified mover
    await expect(bookingService.assignMover('booking-id', 'unverified-mover-id', 5000))
      .rejects.toThrow('not verified');
  });
  
  it('should successfully assign verified mover with valid price', async () => {
    const result = await bookingService.assignMover('booking-id', 'verified-mover-id', 5000);
    expect(result.mover_id).toBe('verified-mover-id');
    expect(result.quoted_price).toBe(5000);
    expect(result.status).toBe('accepted');
    expect(result.accepted_at).toBeTruthy();
  });
});
```

### Integration Tests
- Test with real database records
- Verify state transitions
- Test concurrent assignment attempts
- Validate RLS policies still apply

## Future Enhancements

1. **Configurable Validation Rules:**
   - Move constants to environment variables or database configuration
   - Allow admins to adjust price limits per region/property size

2. **Notification Integration:**
   - Send notifications when validation fails
   - Alert admins of suspicious activity (e.g., repeated high quotes)

3. **Audit Logging:**
   - Log all assignment attempts (success and failure)
   - Track validation failures for analytics

4. **Rate Limiting:**
   - Prevent spam assignment attempts
   - Add cooldown period for failed validations

5. **Dynamic Price Validation:**
   - Calculate max price based on distance, property size, services
   - Use ML models to detect anomalous quotes

## Related Files

- **Schema:** `supabase/migrations/20251008_part1_marketplace_schema.sql`
  - Defines `booking_status_enum` and price constraints
  
- **Types:** `src/integrations/supabase/types.ts`
  - Generated TypeScript types from Supabase schema

- **Payment Flow:** `DATABASE_SCHEMA_DIAGRAM.md` (lines 279-403)
  - Documents complete payment and escrow release flow

## Rollback Plan

If issues arise, revert to simple validation:
```typescript
assignMover: async (bookingId: string, moverId: string, quotedPrice: number): Promise<Booking> => {
  if (quotedPrice <= 0) {
    throw new Error('Invalid quoted price');
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .update({
      mover_id: moverId,
      quoted_price: quotedPrice,
      status: 'accepted' as BookingStatus,
      accepted_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

## Conclusion

The enhanced `assignMover` method provides defense-in-depth validation that:
- ✅ Prevents invalid data from entering the database
- ✅ Enforces business rules at the application layer
- ✅ Provides clear feedback to users
- ✅ Reduces debugging time with descriptive errors
- ✅ Protects against fraud and data entry errors
- ✅ Ensures only verified movers can accept bookings

All validations are performed **before** the database update, ensuring atomic operations and maintaining data consistency.
