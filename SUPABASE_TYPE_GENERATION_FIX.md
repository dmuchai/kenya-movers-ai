# Supabase Type Generation Fix

## Issue
The `src/integrations/supabase/database-generated.ts` file contained CLI prompt text instead of valid TypeScript type definitions:

```
Need to install the following packages:
supabase@2.48.3
Ok to proceed? (y) 
```

## Solution
Regenerated the proper TypeScript definitions from the Supabase project.

## Steps Taken

### 1. Identified Project Details
- **Supabase Project ID**: `eyfvvtpbttmsqubxglyg`
- **Supabase URL**: `https://eyfvvtpbttmsqubxglyg.supabase.co`
- Source: `.env.local` file

### 2. Cleared Invalid Content
Removed the CLI prompt text from the file.

### 3. Regenerated Types
Ran the Supabase CLI command:
```bash
npx supabase gen types typescript --project-id eyfvvtpbttmsqubxglyg > src/integrations/supabase/database-generated.ts
```

### 4. Verified Generated File
- ✅ File is now 3,127 lines of proper TypeScript definitions
- ✅ Exports `Database` type with complete schema
- ✅ Includes all tables (booking_requests, bookings, payments, movers, ratings, etc.)
- ✅ Includes all enums (booking_status_enum, payment_status_enum, etc.)
- ✅ TypeScript compilation passes with no errors

## Generated Type Structure

The file now properly exports:

### Main Types
```typescript
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: { ... }
    Views: { ... }
    Functions: { ... }
    Enums: { ... }
    CompositeTypes: { ... }
  }
}
```

### Tables Included
- `booking_requests`
- `bookings`
- `payments`
- `movers`
- `ratings`
- `mover_locations`
- `mover_availability_schedule`
- `notifications`
- `user_profiles`
- And more...

### Enums Included
- `availability_status_enum`: `"online" | "offline" | "busy"`
- `booking_status_enum`: `"pending" | "accepted" | "mover_en_route" | "in_progress" | "completed" | "cancelled_customer" | "cancelled_mover" | "cancelled_system" | "disputed"`
- `payment_method_enum`: `"mpesa" | "card" | "cash" | "bank_transfer"`
- `payment_status_enum`: `"pending" | "processing" | "completed" | "failed" | "refunded" | "held_escrow"`
- `rating_type_enum`: `"customer_to_mover" | "mover_to_customer"`
- `vehicle_type_enum`: `"pickup" | "box_truck_small" | "box_truck_medium" | "box_truck_large" | "container_truck" | "van"`
- `verification_status_enum`: `"pending" | "documents_submitted" | "verified" | "suspended" | "rejected"`

## Verification

### TypeScript Compilation
```bash
npm run type-check
```
**Result**: ✅ Passed with no errors

### File Size
- **Before**: 3 lines (invalid content)
- **After**: 3,127 lines (complete type definitions)

## Usage

The generated types can now be properly imported and used:

```typescript
import { Database } from '@/integrations/supabase/database-generated';

// Use specific table types
type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

// Use enum types
type BookingStatus = Database['public']['Enums']['booking_status_enum'];
type PaymentStatus = Database['public']['Enums']['payment_status_enum'];

// Type-safe Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Now all queries are fully typed
const { data, error } = await supabase
  .from('bookings')
  .select('*')
  .eq('status', 'pending'); // TypeScript knows valid status values
```

## Maintenance

### When to Regenerate Types

Regenerate the type definitions whenever the database schema changes:

1. After running new migrations
2. After adding/modifying tables
3. After changing column types
4. After adding/modifying enums

### How to Regenerate

**Option 1: Remote Project (Recommended)**
```bash
npx supabase gen types typescript --project-id eyfvvtpbttmsqubxglyg > src/integrations/supabase/database-generated.ts
```

**Option 2: Local Development**
```bash
# Start local Supabase first
npx supabase start

# Generate types from local instance
npx supabase gen types typescript --local > src/integrations/supabase/database-generated.ts
```

**Option 3: Using Supabase Management API**
```bash
# Requires SUPABASE_ACCESS_TOKEN environment variable
npx supabase gen types typescript --project-id eyfvvtpbttmsqubxglyg > src/integrations/supabase/database-generated.ts
```

### Automated Type Generation

Consider adding a script to `package.json`:

```json
{
  "scripts": {
    "types:generate": "npx supabase gen types typescript --project-id eyfvvtpbttmsqubxglyg > src/integrations/supabase/database-generated.ts",
    "types:generate:local": "npx supabase gen types typescript --local > src/integrations/supabase/database-generated.ts"
  }
}
```

Usage:
```bash
npm run types:generate
# or for local
npm run types:generate:local
```

## Related Files

- **Type Definitions**: `src/integrations/supabase/database-generated.ts` (regenerated)
- **Custom Types**: `src/types/database.ts` (manual type definitions)
- **Supabase Integration**: `src/integrations/supabase/types.ts` (re-exports and extensions)
- **Environment Config**: `.env.local` (Supabase credentials)

## Best Practices

### 1. Don't Manually Edit Generated File
The `database-generated.ts` file is auto-generated. Any manual changes will be lost when regenerated.

### 2. Extend Types in Separate Files
Create custom type extensions in `src/types/database.ts`:

```typescript
import { Database } from '@/integrations/supabase/database-generated';

// Extend generated types
export type Booking = Database['public']['Tables']['bookings']['Row'] & {
  // Add computed properties or custom fields
  formattedDate?: string;
};
```

### 3. Version Control
- ✅ Commit the generated file to version control
- ✅ Team members should regenerate after pulling schema changes
- ⚠️ Watch for merge conflicts if multiple people modify schema

### 4. CI/CD Integration
Consider adding type generation to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Generate Supabase Types
  run: npm run types:generate
  
- name: Type Check
  run: npm run type-check
```

## Troubleshooting

### Error: "Project not found"
- Verify project ID in `.env.local`
- Ensure you have access to the Supabase project
- Check authentication (may need to login: `npx supabase login`)

### Error: "Failed to generate types"
- Ensure migrations are applied to the remote database
- Check network connection
- Verify Supabase CLI is up to date: `npm install -g supabase@latest`

### Types Don't Match Database
- Make sure all migrations are applied
- Regenerate types after schema changes
- Check if you're connecting to the correct project

## Resources

- [Supabase Type Generation Docs](https://supabase.com/docs/guides/api/rest/generating-types)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [TypeScript with Supabase](https://supabase.com/docs/guides/api/rest/typescript-support)

## Next Steps

1. ✅ File regenerated successfully
2. ✅ TypeScript compilation verified
3. ✅ All types exported correctly
4. 📝 Consider adding `types:generate` script to package.json
5. 📝 Document type regeneration process for team members
6. 📝 Add pre-commit hook to verify types are up to date
