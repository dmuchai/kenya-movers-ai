# Database Schema Diagram
## MoveEasy Marketplace ERD (Entity Relationship Diagram)

> **                              └──────────────────────────────────────────────────────────────┘

```

**DIAGRAM LEGEND:**
- `(PK)` = Primary Key
- `(FK)` = Foreign Key  
- `(UQ)` = Unique Constraint
- `(FK,UQ)` = Foreign Key with Unique Constraint (enforces 1:1 relationship)
- `◄───` = References/Points to
- `(NEW)` = New table added in this schema version

════════════════════════════════════════════════════════════════════════════════════════

KEY RELATIONSHIPS:

1. auth.users (1) → (1) profiles → (1) movers
   One user can have one mover profile
   
   ⚠️ FK & UNIQUE CONSTRAINT:
   • auth.users.id (PK)
     └─> profiles.id (FK references auth.users.id)
         └─> movers.user_id (FK references profiles.id + UNIQUE)
   
   IMPLEMENTATION:
   • movers.user_id references profiles.id (NOT auth.users.id)
   • movers.user_id MUST have UNIQUE constraint for 1:1 relationship
   • Prevents multiple mover profiles per user account
   • SQL: ALTER TABLE movers ADD CONSTRAINT movers_user_id_unique UNIQUE (user_id);ANT - Foreign Key & Unique Constraint:**  
> The `movers.user_id` column:
> 1. References `profiles.id` (NOT `auth.users.id`)
> 2. Must have a UNIQUE constraint to enforce 1:1 relationship  
> FK Chain: `auth.users.id` → `profiles.id` → `movers.user_id` (UNIQUE)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MOVEEASY DATABASE SCHEMA                              │
│                     Two-Sided Marketplace Platform                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐              ┌──────────────────┐              ┌──────────────────┐
│   auth.users     │              │    profiles      │              │     movers       │
│  (Supabase)      │              │   (existing)     │              │    (NEW)         │
├──────────────────┤              ├──────────────────┤              ├──────────────────┤
│ id (PK)          │◄─────────────│ id (PK, FK)      │◄─────────────│ id (PK)          │
│ email            │              │    FK→auth.users │              │ user_id (FK,UQ)  │
│ phone            │              │ full_name        │              │    FK→profiles   │
│ created_at       │              │ role             │              │ business_name    │
└──────────────────┘              │ created_at       │              │ vehicle_types[]  │
                                  └──────────────────┘              │ verification_status│
                                                                    │ availability_status│
                                                                    │ rating           │
                                                                    │ total_moves      │
                                                                    │ current_location │
                                                                    │ service_areas[]  │
                                                                    └──────────────────┘
                                                                           │
                                                                           │
                                        ┌──────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────┐              ┌──────────────────┐              ┌──────────────────┐
│     quotes       │              │    bookings      │              │ booking_requests │
│   (existing)     │              │     (NEW)        │              │     (NEW)        │
├──────────────────┤              ├──────────────────┤              ├──────────────────┤
│ id (PK)          │◄─────────────│ id (PK)          │◄─────────────│ id (PK)          │
│ user_id (FK)     │              │ booking_number   │              │ booking_id (FK)  │
│ pickup_location  │              │ customer_id (FK) │              │ mover_id (FK)    │
│ dropoff_location │              │ mover_id (FK)    │              │ status           │
│ property_size    │              │ quote_id (FK)    │              │ offered_price    │
│ created_at       │              │ status           │              │ sent_at          │
└──────────────────┘              │ pickup_location  │              │ expires_at       │
                                  │ dropoff_location │              └──────────────────┘
                                  │ scheduled_date   │
                                  │ estimated_price  │
                                  │ final_price      │
                                  │ tracking_data    │
                                  └──────────────────┘
                                         │   │
                    ┌────────────────────┘   └────────────────────┐
                    │                                              │
                    ▼                                              ▼
         ┌──────────────────┐                           ┌──────────────────┐
         │    payments      │                           │     ratings      │
         │     (NEW)        │                           │     (NEW)        │
         ├──────────────────┤                           ├──────────────────┤
         │ id (PK)          │                           │ id (PK)          │
         │ booking_id (FK)  │                           │ booking_id (FK)  │
         │ customer_id (FK) │                           │ rater_id (FK)    │
         │ mover_id (FK)    │                           │ rated_id (FK)    │
         │ amount           │                           │ rating_type      │
         │ payment_method   │                           │ rating (1-5)     │
         │ payment_status   │                           │ review_text      │
         │ commission_amt   │                           │ created_at       │
         │ mover_payout_amt │                           └──────────────────┘
         │ mpesa_txn_id     │
         │ is_held_escrow   │
         └──────────────────┘

┌──────────────────┐              ┌──────────────────┐              ┌──────────────────┐
│ mover_locations  │              │  notifications   │              │mover_availability│
│     (NEW)        │              │     (NEW)        │              │   schedule (NEW) │
├──────────────────┤              ├──────────────────┤              ├──────────────────┤
│ id (PK)          │              │ id (PK)          │              │ id (PK)          │
│ mover_id (FK)────┼──────────┐   │ user_id (FK)     │              │ mover_id (FK)────┼─┐
│ booking_id (FK)  │          │   │ booking_id (FK)  │              │ day_of_week      │ │
│ location (POINT) │          │   │ type             │              │ start_time       │ │
│ latitude         │          │   │ title            │              │ end_time         │ │
│ longitude        │          │   │ message          │              │ is_available     │ │
│ heading          │          │   │ is_read          │              │ specific_date    │ │
│ speed            │          │   │ created_at       │              └──────────────────┘ │
│ recorded_at      │          │   └──────────────────┘                                  │
└──────────────────┘          │                                                          │
                              │                                                          │
                              └──────────────────────────────────────────────────────────┘


════════════════════════════════════════════════════════════════════════════════════════

KEY RELATIONSHIPS:

1. auth.users (1) → (1) profiles → (1) movers
   One user can have one mover profile

2. auth.users (1) → (MANY) bookings
   One customer can create many bookings

3. movers (1) → (MANY) bookings
   One mover can accept many bookings

4. bookings (1) → (1) payments
   One booking has one payment transaction

5. bookings (1) → (2) ratings
   One booking can have two ratings (customer→mover, mover→customer)

6. movers (1) → (MANY) mover_locations
   One mover has many GPS tracking points

7. bookings (1) → (MANY) booking_requests
   One booking sent to multiple movers for acceptance

8. users (1) → (MANY) notifications
   One user receives many notifications

════════════════════════════════════════════════════════════════════════════════════════

CUSTOM TYPES (ENUMS):

┌────────────────────────┬─────────────────────────────────────────────────────┐
│ verification_status    │ pending, documents_submitted, verified,             │
│                        │ suspended, rejected                                 │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ availability_status    │ online, offline, busy                               │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ booking_status         │ pending, accepted, mover_en_route, in_progress,    │
│                        │ completed, cancelled_*, disputed                    │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ payment_status         │ pending, processing, completed, failed,             │
│                        │ refunded, held_escrow                               │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ payment_method         │ mpesa, card, cash, bank_transfer                    │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ vehicle_type           │ pickup, box_truck_small, box_truck_medium,          │
│                        │ box_truck_large, container_truck, van               │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ rating_type            │ customer_to_mover, mover_to_customer                │
└────────────────────────┴─────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════════════

UNIQUE CONSTRAINTS:

⚠️ Critical constraints to enforce data integrity and relationship cardinality:

┌────────────────────────┬─────────────────────────────────────────────────────┐
│ Table.Column           │ Purpose                                             │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ movers.user_id         │ ⭐ Ensures one mover profile per user (1:1)         │
│                        │ Prevents duplicate mover registrations              │
│                        │ SQL: UNIQUE (user_id)                               │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ profiles.id            │ Already unique (PK) - one profile per auth user    │
├────────────────────────┼─────────────────────────────────────────────────────┤
│ bookings.booking_number│ Unique human-readable booking reference             │
│                        │ SQL: UNIQUE (booking_number)                        │
└────────────────────────┴─────────────────────────────────────────────────────┘

**Implementation Example:**
```sql
-- Add UNIQUE constraint to movers.user_id
ALTER TABLE public.movers
ADD CONSTRAINT movers_user_id_unique UNIQUE (user_id);

-- Verify constraint exists
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'movers' AND constraint_type = 'UNIQUE';
```

**Benefits:**
• Database-level enforcement (cannot be bypassed by application code)
• Prevents race conditions in concurrent mover registrations
• Maintains referential integrity in auth → profiles → movers chain
• Enables efficient lookups by user_id

════════════════════════════════════════════════════════════════════════════════════════

KEY FEATURES:

✅ PostGIS Integration
   - Geospatial queries for proximity search
   - Service area polygons
   - Distance calculations

✅ Real-Time Tracking
   - GPS location updates
   - Route visualization
   - Live booking status

✅ Two-Sided Marketplace
   - Separate customer/mover flows
   - Mover verification pipeline
   - Rating system

✅ Payment Processing
   - M-Pesa integration ready
   - Escrow management
   - Commission tracking

✅ Row Level Security (RLS)
   - Customer: View own bookings, movers in area
   - Mover: View assigned bookings, own profile
   - Admin: View all data

✅ Performance Optimization
   - 30+ indexes on key columns
   - Geographic indexes (GIST)
   - Composite indexes for common queries

════════════════════════════════════════════════════════════════════════════════════════

HELPER FUNCTIONS:

┌─────────────────────────────────┬──────────────────────────────────────────┐
│ find_nearby_movers()            │ Find movers within radius, sorted by    │
│                                 │ distance, with rating filter             │
├─────────────────────────────────┼──────────────────────────────────────────┤
│ calculate_distance_km()         │ Calculate distance between two points   │
├─────────────────────────────────┼──────────────────────────────────────────┤
│ is_location_in_service_area()   │ Check if location within mover's range  │
├─────────────────────────────────┼──────────────────────────────────────────┤
│ get_mover_stats()               │ Mover performance analytics             │
├─────────────────────────────────┼──────────────────────────────────────────┤
│ get_platform_stats()            │ Business intelligence & KPIs            │
└─────────────────────────────────┴──────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════════════════

TYPICAL DATA FLOW:

1. CUSTOMER BOOKING FLOW
   Customer → quotes (estimate) → bookings (create) → 
   booking_requests (sent to movers) → mover accepts → 
   booking status updates → mover_locations (tracking) → 
   booking completed → payments (process) → 
   ratings (both parties rate each other)

2. MOVER ONBOARDING FLOW
   User registers → movers (create profile) → 
   upload documents → admin verification → 
   verification_status = 'verified' → 
   set availability_status = 'online' → 
   start receiving booking_requests

3. PAYMENT FLOW & ESCROW RELEASE

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ INITIAL PAYMENT                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

   Booking accepted (status = 'accepted') → 
   Customer pays via M-Pesa/Card → 
   payment_status = 'held_escrow' + is_held_in_escrow = TRUE →
   booking_status = 'in_progress' (move day)

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ COMPLETION TRIGGERS (Deterministic State Transitions)                               │
└─────────────────────────────────────────────────────────────────────────────────────┘

   **PRIMARY PATH: Both-Party Confirmation (Required for escrow release)**
   
   Step 1: Mover marks delivered
           → booking_status = 'completed'
           → completed_at = NOW()
           → awaiting customer confirmation
   
   Step 2: Customer confirms delivery
           → booking.completion_signature captured
           → booking.customer_satisfaction_score recorded
           → TRIGGER escrow release sequence
   
   **ESCROW RELEASE SEQUENCE:**
   
   IF (booking_status = 'completed' AND completion_signature IS NOT NULL)
   OR (completed_at + 72 hours < NOW() AND has_dispute = FALSE)
   THEN:
     1. payment_status = 'completed'
     2. is_held_in_escrow = FALSE
     3. escrow_released_at = NOW()
     4. escrow_release_reason = 'both_party_confirmed' | 'auto_release_72h'
     5. Calculate and initiate mover payout:
        - mover_payout_amount = amount - commission_amount - insurance_fee
        - Transfer to mover's M-Pesa/bank account
        - commission_amount retained by platform
   
   **AUTO-RELEASE RULE (Fallback if customer doesn't respond):**
   
   • Timeout: 72 hours after completed_at timestamp
   • Condition: has_dispute = FALSE (no active dispute filed)
   • Action: Auto-release escrow using sequence above with reason 'auto_release_72h'
   • Notification: Customer receives "Auto-confirmed after 72h" message
   
   **PAYOUT TIMING:**
   
   • Escrow release triggers immediate payout processing
   • M-Pesa payouts: 0-24 hours (subject to M-Pesa availability)
   • Bank transfers: 1-3 business days
   • Commission retained by platform in real-time during escrow release

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ DISPUTE HANDLING (State Transitions & Escrow Hold)                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

   **DISPUTE FILING (Before or during 72h window):**
   
   Customer/Mover files dispute → 
     booking.has_dispute = TRUE
     booking.dispute_status = 'open'
     booking.dispute_reason = [customer input]
     booking_status remains 'completed' OR reverts to 'disputed'
     payment_status remains 'held_escrow' (ESCROW FROZEN)
   
   **STATE TRANSITIONS:**
   
   held_escrow → disputed_held (escrow frozen during investigation)
              ↓
   dispute_status = 'investigating' (admin reviews case, collects evidence)
              ↓
           RESOLUTION PATHS:
              ↓
   ┌──────────────────────┬───────────────────────┐
   │                      │                       │
   │ FAVOR MOVER          │ FAVOR CUSTOMER        │
   │ dispute_status =     │ dispute_status =      │
   │ 'resolved'           │ 'resolved'            │
   │                      │                       │
   │ payment_status =     │ payment_status =      │
   │ 'completed'          │ 'refunded'            │
   │ Release escrow       │ Return funds to       │
   │ to mover             │ customer              │
   │ (full payout)        │ (full/partial         │
   │                      │  refund based on      │
   │ booking_status =     │  ruling)              │
   │ 'completed'          │                       │
   │                      │ booking_status =      │
   └──────────────────────┘ 'cancelled_system'    │
                           OR 'disputed'          │
                           (marked resolved)      │
                                                  │
                           refund_amount set      │
                           refunded_at = NOW()    │
                           └────────────────────────┘
   
   **DISPUTE FIELDS & TIMEOUT:**
   
   • dispute_status: 'open' → 'investigating' → 'resolved'
   • dispute_reason: TEXT (customer/mover explanation)
   • reported_issues: TEXT[] (array of specific complaints)
   • Admin review SLA: 48-72 hours for resolution
   • If dispute unresolved after 7 days: escalate to manual arbitration
   
   **ESCROW PROTECTION:**
   
   • Once dispute filed, auto-release is DISABLED
   • Payment cannot be completed until dispute_status = 'resolved'
   • Dispute must be resolved by admin before any fund movement
   • No timeout-based auto-completion during active dispute

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ RELEVANT SCHEMA FIELDS                                                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

   **bookings table:**
     - booking_status: booking_status_enum
     - completed_at: TIMESTAMPTZ (trigger for 72h auto-release)
     - completion_signature: TEXT (customer confirmation proof)
     - has_dispute: BOOLEAN
     - dispute_status: TEXT ('open', 'investigating', 'resolved')
     - dispute_reason: TEXT
   
   **payments table:**
     - payment_status: payment_status_enum ('held_escrow' | 'completed' | 'refunded')
     - is_held_in_escrow: BOOLEAN
     - escrow_released_at: TIMESTAMPTZ
     - escrow_release_reason: TEXT ('both_party_confirmed' | 'auto_release_72h')
     - refund_amount: DECIMAL(10,2)
     - refunded_at: TIMESTAMPTZ

┌─────────────────────────────────────────────────────────────────────────────────────┐
│ IMPLEMENTATION NOTES                                                                │
└─────────────────────────────────────────────────────────────────────────────────────┘

   1. Use pg_cron to schedule hourly job checking for:
      - Payments with (completed_at + 72 hours < NOW() AND has_dispute = FALSE)
      - Auto-trigger escrow release for qualifying bookings
   
   2. Prevent race conditions:
      - Lock payment row during escrow release
      - Use transaction isolation for status updates
   
   3. Audit trail:
      - Log all state transitions in payments.metadata JSONB
      - Track who triggered release (customer, auto, admin)
   
   4. Both-party confirmation is MANDATORY unless:
      - 72h timeout reached AND no dispute filed
      - Admin manually overrides (with reason logged)

════════════════════════════════════════════════════════════════════════════════════════

INDEXES FOR PERFORMANCE:

Geographic Indexes (GIST):
  - movers.current_location
  - movers.service_areas
  - bookings.pickup_location
  - bookings.dropoff_location
  - mover_locations.location

Status Indexes:
  - movers(verification_status, availability_status)
  - bookings(status, scheduled_date)
  - payments(payment_status)

Relationship Indexes:
  - All foreign keys indexed
  - Composite indexes for common queries

════════════════════════════════════════════════════════════════════════════════════════
```

## Quick Table Reference

| Table | Primary Purpose | Key Columns |
|-------|----------------|-------------|
| **movers** | Mover profiles & business info | business_name, verification_status, rating |
| **bookings** | Customer move requests | customer_id, mover_id, status, scheduled_date |
| **payments** | Financial transactions | booking_id, amount, payment_status, commission |
| **ratings** | Two-way review system | booking_id, rating (1-5), review_text |
| **mover_locations** | Real-time GPS tracking | mover_id, location, recorded_at |
| **booking_requests** | Mover assignment queue | booking_id, mover_id, status, expires_at |
| **notifications** | In-app alerts | user_id, type, message, is_read |
| **mover_availability_schedule** | Working hours | mover_id, day_of_week, start_time, end_time |

## Schema Statistics

- **Total Tables**: 8 new + 2 existing = 10 tables
- **Total Columns**: ~150+ columns
- **Total Indexes**: 35+ indexes
- **Total Functions**: 10+ helper functions
- **Total RLS Policies**: 25+ security policies
- **Custom Types**: 7 enums

---

**Last Updated**: October 8, 2025  
**Schema Version**: 1.0.0