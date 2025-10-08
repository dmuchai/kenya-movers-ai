# Step Navigation Validation - Preventing Invalid Step Transitions

## Overview
Enhanced the mover registration form to validate required fields before allowing navigation to the next step. Previously, users could skip steps without completing required fields, leading to invalid submission attempts at the end.

## Problem
The original `handleNext` and `handleBack` functions allowed unrestricted navigation:

**Before:**
```typescript
const handleNext = () => {
  if (currentStep < STEPS.length) {
    setCurrentStep(currentStep + 1);
  }
};

const handleBack = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1);
  }
};
```

**Issues:**
1. ❌ **No validation** - Users could advance without completing required fields
2. ❌ **Poor UX** - Errors only discovered at final submission
3. ❌ **Wasted time** - Users complete later steps only to fail validation at the end
4. ❌ **Silent failures** - No feedback when trying to advance with incomplete data
5. ❌ **Data integrity** - Could reach later steps with invalid/incomplete data

## Solution Implemented

### 1. Created Comprehensive `validateStep` Function

**File:** `src/pages/MoverRegistration.tsx` (lines 89-162)

```typescript
/**
 * Validates registration data for a specific step
 * @param step - The step number (1-5) to validate
 * @param data - The registration data to validate
 * @returns Object with isValid flag and error message if validation fails
 */
const validateStep = (step: number, data: RegistrationData): { isValid: boolean; error?: string } => {
  switch (step) {
    case 1: // Business Information
      if (!data.business_name?.trim()) {
        return { isValid: false, error: 'Business name is required' };
      }
      if (!data.phone_primary?.trim()) {
        return { isValid: false, error: 'Primary phone number is required' };
      }
      // Validate phone format (Kenyan phone numbers)
      const phoneRegex = /^(\+254|0)[17]\d{8}$/;
      if (!phoneRegex.test(data.phone_primary.replace(/\s+/g, ''))) {
        return { isValid: false, error: 'Please enter a valid Kenyan phone number (+254 or 07XX/01XX)' };
      }
      // Validate email format if provided
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
      return { isValid: true };

    case 2: // Vehicle Information
      if (!data.vehicle_types || data.vehicle_types.length === 0) {
        return { isValid: false, error: 'Please select at least one vehicle type' };
      }
      return { isValid: true };

    case 3: // Service Area
      if (!data.primary_location) {
        return { isValid: false, error: 'Please select your primary operating location' };
      }
      const { latitude, longitude } = data.primary_location;
      // Validate coordinates are present and valid numbers
      if (
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        isNaN(latitude) ||
        isNaN(longitude)
      ) {
        return { isValid: false, error: 'Invalid location coordinates. Please select a valid location.' };
      }
      // Reject default (0, 0) coordinates
      if (latitude === 0 && longitude === 0) {
        return { isValid: false, error: 'Please select a real location. Default coordinates are not allowed.' };
      }
      // Validate location is within Kenya bounds (lat: -5 to 5, lng: 33 to 43)
      if (latitude < -5 || latitude > 5 || longitude < 33 || longitude > 43) {
        return { isValid: false, error: 'Please select a location within Kenya' };
      }
      return { isValid: true };

    case 4: // Documents
      // Check required documents: national_id, drivers_license, vehicle_logbook, insurance_certificate
      const requiredDocs = ['national_id', 'drivers_license', 'vehicle_logbook', 'insurance_certificate'];
      const missingDocs = requiredDocs.filter(doc => !data.documents[doc as keyof typeof data.documents]);
      if (missingDocs.length > 0) {
        return {
          isValid: false,
          error: `Please upload all required documents: ${missingDocs.map(d => d.replace(/_/g, ' ')).join(', ')}`
        };
      }
      return { isValid: true };

    case 5: // Review & Submit
      // Final validation - all previous steps should already be valid
      return { isValid: true };

    default:
      return { isValid: true };
  }
};
```

#### Validation Details by Step

##### Step 1: Business Information
- ✅ **Business name** - Required, must not be empty after trimming
- ✅ **Phone number** - Required, must match Kenyan format: `+254` or `0` followed by `7` or `1` and 8 digits
  - Valid examples: `+254712345678`, `0712345678`, `+254112345678`
  - Invalid examples: `12345`, `+254612345678`, `254712345678`
- ✅ **Email** - Optional, but if provided must be valid format

##### Step 2: Vehicle Information
- ✅ **Vehicle types** - At least one vehicle type must be selected
- Examples: Pickup Truck, Van, Moving Truck, etc.

##### Step 3: Service Area
- ✅ **Location exists** - `primary_location` must be set (not undefined)
- ✅ **Valid coordinates** - Both latitude and longitude must be numbers (not strings, not NaN)
- ✅ **Non-zero coordinates** - Rejects (0, 0) which is the invalid default
- ✅ **Geographic bounds** - Must be within Kenya:
  - Latitude: -5° to 5°
  - Longitude: 33° to 43°

##### Step 4: Documents
- ✅ **Required documents** - All 4 required documents must be uploaded:
  1. National ID
  2. Driver's License
  3. Vehicle Logbook
  4. Insurance Certificate
- Optional documents (not validated): KRA PIN Certificate, Business Permit, Good Conduct Certificate

##### Step 5: Review & Submit
- No additional validation (all previous steps already validated)

### 2. Updated `handleNext` to Validate Before Advancing

**File:** `src/pages/MoverRegistration.tsx` (lines 164-181)

**Before:**
```typescript
const handleNext = () => {
  if (currentStep < STEPS.length) {
    setCurrentStep(currentStep + 1);
  }
};
```

**After:**
```typescript
const handleNext = async () => {
  if (currentStep >= STEPS.length) {
    return; // Already on last step
  }

  // Validate current step before advancing
  const validation = validateStep(currentStep, registrationData);
  
  if (!validation.isValid) {
    toast({
      title: 'Validation Error',
      description: validation.error || 'Please complete all required fields before proceeding.',
      variant: 'destructive'
    });
    return; // Don't advance if validation fails
  }

  // Validation passed, advance to next step
  setCurrentStep(currentStep + 1);
};
```

**Key Changes:**
1. ✅ **Made async** - Function signature changed to `async` (allows for future async validation if needed)
2. ✅ **Validation check** - Calls `validateStep(currentStep, registrationData)` before advancing
3. ✅ **Early return** - Guards against being on last step
4. ✅ **User feedback** - Shows toast notification with specific error message
5. ✅ **Prevents navigation** - Returns early if validation fails (doesn't increment step)
6. ✅ **Advances only on success** - Only calls `setCurrentStep(currentStep + 1)` when validation passes

### 3. Kept `handleBack` Safe (No Changes Needed)

**File:** `src/pages/MoverRegistration.tsx` (lines 183-187)

```typescript
const handleBack = () => {
  if (currentStep > 1) {
    setCurrentStep(currentStep - 1);
  }
};
```

**Why no changes:**
- ✅ **Already safe** - Guards against going below step 1
- ✅ **No validation needed** - Going back doesn't require validation (user can fix data)
- ✅ **User-friendly** - Allows users to go back and correct mistakes

## User Experience Flow

### Scenario 1: Trying to Skip Step 1 (Business Info) Without Data

1. **User loads registration form**
   - Current step: 1 (Business Information)
   - Fields empty

2. **User clicks "Next" without filling fields**
   - `handleNext()` called
   - `validateStep(1, data)` runs
   - Returns: `{ isValid: false, error: 'Business name is required' }`

3. **Validation fails**
   - Toast notification appears:
     - Title: "Validation Error"
     - Description: "Business name is required"
   - Current step remains: 1 (doesn't advance)

4. **User fills business name, clicks "Next" again**
   - `validateStep(1, data)` runs
   - Returns: `{ isValid: false, error: 'Primary phone number is required' }`
   - Toast appears with phone error
   - Still on step 1

5. **User fills phone with invalid format: "12345"**
   - Clicks "Next"
   - Returns: `{ isValid: false, error: 'Please enter a valid Kenyan phone number (+254 or 07XX/01XX)' }`
   - Toast shows format error

6. **User corrects phone to "+254712345678"**
   - Clicks "Next"
   - All validations pass: `{ isValid: true }`
   - Advances to step 2 ✅

### Scenario 2: Trying to Skip Step 3 (Service Area) Without Location

1. **User on step 3 (Service Area)**
   - No location selected
   - `primary_location` is `undefined`

2. **User clicks "Next"**
   - `validateStep(3, data)` runs
   - Returns: `{ isValid: false, error: 'Please select your primary operating location' }`

3. **Toast notification appears**
   - User sees clear error message
   - Remains on step 3

4. **User searches and selects "Nairobi, Kenya"**
   - Location coordinates set: `{ latitude: -1.286389, longitude: 36.817223 }`

5. **User clicks "Next"**
   - All location validations pass
   - Advances to step 4 (Documents) ✅

### Scenario 3: Trying to Submit Without Uploading Documents

1. **User on step 4 (Documents)**
   - Only uploaded National ID
   - Missing: Driver's License, Vehicle Logbook, Insurance Certificate

2. **User clicks "Next"**
   - `validateStep(4, data)` runs
   - Checks all required documents
   - Returns: `{ isValid: false, error: 'Please upload all required documents: drivers license, vehicle logbook, insurance certificate' }`

3. **Toast shows missing documents**
   - User clearly sees what's needed

4. **User uploads all required documents**
   - Clicks "Next"
   - Validation passes
   - Advances to step 5 (Review) ✅

### Scenario 4: Going Back to Fix Data (Always Allowed)

1. **User on step 3 (Service Area)**
   - Realizes business name was wrong

2. **User clicks "Back"**
   - No validation triggered (going back is always allowed)
   - Returns to step 2

3. **User clicks "Back" again**
   - Returns to step 1

4. **User corrects business name**
   - Clicks "Next" to advance again
   - Validation runs for step 1
   - Passes, advances to step 2 ✅

## Benefits

### 1. Immediate Feedback
- ✅ **Instant validation** - Users know immediately what's wrong
- ✅ **Clear error messages** - Specific, actionable feedback
- ✅ **No silent failures** - Toast notifications ensure users see errors

### 2. Prevents Invalid State
- ✅ **Data integrity** - Later steps can trust earlier data is valid
- ✅ **No invalid submissions** - Cannot reach final step with incomplete data
- ✅ **Consistent state** - Each step guarantees its requirements are met

### 3. Better User Experience
- ✅ **Progressive validation** - Catches errors early in the process
- ✅ **Saves time** - Users don't complete later steps only to fail at the end
- ✅ **Reduced frustration** - Clear, immediate feedback on what's needed
- ✅ **Flexible correction** - Can always go back to fix data

### 4. Maintainability
- ✅ **Centralized validation** - All step validation logic in one function
- ✅ **Easy to extend** - Adding new validation rules is straightforward
- ✅ **Type-safe** - Full TypeScript support with clear return types
- ✅ **Testable** - Validation logic is pure and easy to unit test

### 5. Consistency with Individual Steps
- ✅ **Matches step behavior** - Validation aligns with individual step requirements
- ✅ **Duplicate protection** - Navigation validation + in-step validation (belt and suspenders)
- ✅ **Unified experience** - Same validation messages whether from step or navigation

## Technical Details

### Validation Return Type

```typescript
{ isValid: boolean; error?: string }
```

- **`isValid`**: Boolean flag indicating if validation passed
- **`error`**: Optional error message (present when `isValid` is false)

### Error Message Formatting

Document validation errors are user-friendly:
```typescript
// Internal names: ['national_id', 'drivers_license']
// Displayed as: "national id, drivers license"
missingDocs.map(d => d.replace(/_/g, ' ')).join(', ')
```

### Phone Number Validation

Kenyan phone number format:
```typescript
const phoneRegex = /^(\+254|0)[17]\d{8}$/;
```

**Breakdown:**
- `^` - Start of string
- `(\+254|0)` - Must start with "+254" or "0"
- `[17]` - Second digit must be 1 or 7 (Kenyan mobile prefixes)
- `\d{8}` - Followed by exactly 8 digits
- `$` - End of string

**Valid examples:**
- `+254712345678` (international format)
- `0712345678` (local format)
- `+254112345678` (landline)

**Invalid examples:**
- `254712345678` (missing + or 0)
- `+254612345678` (wrong prefix, should be 1 or 7)
- `071234567` (too short)
- `07123456789` (too long)

### Email Validation

Basic email format validation:
```typescript
/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

**Checks:**
- At least one character before `@`
- At least one character between `@` and `.`
- At least one character after `.`
- No whitespace characters

### Geographic Bounds (Kenya)

```typescript
// Kenya bounding box
if (latitude < -5 || latitude > 5 || longitude < 33 || longitude > 43) {
  return { isValid: false, error: 'Please select a location within Kenya' };
}
```

**Kenya coordinates:**
- **Latitude**: -5° (southernmost) to 5° (northernmost)
- **Longitude**: 33° (westernmost) to 43° (easternmost)

**Major cities:**
- Nairobi: -1.286389, 36.817223 ✅
- Mombasa: -4.043477, 39.668206 ✅
- Kisumu: -0.091702, 34.767956 ✅
- Nakuru: -0.303099, 36.080025 ✅

**Out of bounds examples:**
- London: 51.5074, -0.1278 ❌
- New York: 40.7128, -74.0060 ❌
- Johannesburg: -26.2041, 28.0473 ❌

## Testing Recommendations

### Manual Testing Checklist

#### Step 1: Business Information
- [ ] Try to advance with empty business name → Should show "Business name is required"
- [ ] Try to advance with empty phone → Should show "Primary phone number is required"
- [ ] Enter invalid phone "12345" → Should show format error
- [ ] Enter invalid phone "+254612345678" → Should show format error (wrong prefix)
- [ ] Enter valid phone "+254712345678" → Should advance
- [ ] Go back, enter invalid email "notanemail" → Should show email format error
- [ ] Correct email to "test@example.com" → Should advance

#### Step 2: Vehicle Information
- [ ] Try to advance without selecting vehicle type → Should show "Please select at least one vehicle type"
- [ ] Select a vehicle type → Should advance

#### Step 3: Service Area
- [ ] Try to advance without selecting location → Should show "Please select your primary operating location"
- [ ] Select location outside Kenya (if possible) → Should show "within Kenya" error
- [ ] Select valid Kenya location → Should advance

#### Step 4: Documents
- [ ] Try to advance with no documents → Should list all 4 required documents
- [ ] Upload only National ID → Should list remaining 3 documents
- [ ] Upload all 4 required documents → Should advance

#### Step 5: Review & Submit
- [ ] Should always be able to advance (final step)

#### Navigation
- [ ] On step 1, click "Back" → Should not go below step 1
- [ ] On any step, click "Back" → Should go back without validation
- [ ] Complete steps 1-3, go back to step 1, change data, advance again → Should re-validate

### Automated Testing

```typescript
describe('MoverRegistration - Step Navigation Validation', () => {
  describe('validateStep function', () => {
    it('should validate step 1 - business name required', () => {
      const data = { phone_primary: '+254712345678' } as RegistrationData;
      const result = validateStep(1, data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Business name is required');
    });

    it('should validate step 1 - phone required', () => {
      const data = { business_name: 'Test Movers' } as RegistrationData;
      const result = validateStep(1, data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Primary phone number is required');
    });

    it('should validate step 1 - phone format', () => {
      const data = { 
        business_name: 'Test Movers',
        phone_primary: '12345'
      } as RegistrationData;
      const result = validateStep(1, data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid Kenyan phone number');
    });

    it('should validate step 1 - email format (if provided)', () => {
      const data = { 
        business_name: 'Test Movers',
        phone_primary: '+254712345678',
        email: 'notanemail'
      } as RegistrationData;
      const result = validateStep(1, data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid email');
    });

    it('should pass step 1 validation with valid data', () => {
      const data = { 
        business_name: 'Test Movers',
        phone_primary: '+254712345678',
        email: 'test@example.com'
      } as RegistrationData;
      const result = validateStep(1, data);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate step 2 - vehicle types required', () => {
      const data = { vehicle_types: [] } as RegistrationData;
      const result = validateStep(2, data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please select at least one vehicle type');
    });

    it('should validate step 3 - location required', () => {
      const data = {} as RegistrationData;
      const result = validateStep(3, data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('primary operating location');
    });

    it('should validate step 3 - reject (0,0) coordinates', () => {
      const data = { 
        primary_location: { latitude: 0, longitude: 0, address: '' }
      } as RegistrationData;
      const result = validateStep(3, data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Default coordinates');
    });

    it('should validate step 3 - reject out of bounds', () => {
      const data = { 
        primary_location: { latitude: 40.7128, longitude: -74.0060, address: 'New York' }
      } as RegistrationData;
      const result = validateStep(3, data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('within Kenya');
    });

    it('should validate step 4 - required documents', () => {
      const data = { 
        documents: { national_id: new File([], 'id.pdf') }
      } as RegistrationData;
      const result = validateStep(4, data);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('drivers license');
      expect(result.error).toContain('vehicle logbook');
      expect(result.error).toContain('insurance certificate');
    });
  });

  describe('handleNext navigation', () => {
    it('should prevent advancing with invalid step 1 data', async () => {
      const { getByText } = render(<MoverRegistration />);
      
      // Try to advance without data
      const nextButton = getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(getByText(/Business name is required/)).toBeInTheDocument();
      });
      
      // Should still be on step 1
      expect(getByText('Business Information')).toBeInTheDocument();
    });

    it('should allow advancing with valid step 1 data', async () => {
      const { getByLabelText, getByText } = render(<MoverRegistration />);
      
      // Fill required fields
      fireEvent.change(getByLabelText('Business Name'), { 
        target: { value: 'Test Movers' } 
      });
      fireEvent.change(getByLabelText('Primary Phone'), { 
        target: { value: '+254712345678' } 
      });
      
      // Advance to next step
      fireEvent.click(getByText('Next'));
      
      await waitFor(() => {
        expect(getByText('Vehicle Information')).toBeInTheDocument();
      });
    });

    it('should allow going back without validation', () => {
      const { getByText } = render(<MoverRegistration />);
      
      // Should be on step 1
      expect(getByText('Business Information')).toBeInTheDocument();
      
      // Try to go back (should not go below step 1)
      const backButton = getByText('Back');
      fireEvent.click(backButton);
      
      // Should still be on step 1
      expect(getByText('Business Information')).toBeInTheDocument();
    });
  });
});
```

## Files Changed

**src/pages/MoverRegistration.tsx**
- Lines 89-162: Added `validateStep` function with comprehensive validation for all 5 steps
- Lines 164-181: Updated `handleNext` to be async, validate before advancing, show toast on failure
- Lines 183-187: Kept `handleBack` unchanged (already safe)

## Migration Notes

### No Breaking Changes
- ✅ **Backward compatible** - Existing form behavior improved, no functionality removed
- ✅ **No database changes** - Purely frontend validation
- ✅ **No API changes** - Backend submission logic unchanged

### User Impact
- ✅ **Better UX** - Users get immediate feedback on errors
- ✅ **Faster completion** - Errors caught early, not at final submission
- ✅ **Clear guidance** - Specific error messages tell users exactly what's needed

## Related Documentation

- [Location Validation Fix](./LOCATION_VALIDATION_FIX.md) - Comprehensive location validation
- [Business Info Step Validation](./ISVALID_FLAG_INTEGRATION.md) - In-step validation patterns
- [Form Validation Best Practices](./docs/FORM_VALIDATION.md)

## Verification

✅ **TypeScript Compilation**: Passed with no errors
✅ **Type Safety**: Proper return types and parameter types
✅ **Error Handling**: All validation errors have clear messages
✅ **User Feedback**: Toast notifications for all validation failures
✅ **Navigation Control**: Cannot advance with invalid data, can always go back
✅ **Step Independence**: Each step validates independently
✅ **Comprehensive Coverage**: All required fields validated across all steps

The registration form now provides robust step-by-step validation, ensuring data integrity and an excellent user experience! 🎉
