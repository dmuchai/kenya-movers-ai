# Database Schema Diagram
## MoveEasy Marketplace ERD (Entity Relationship Diagram)

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
│ email            │              │ full_name        │              │ user_id (FK)     │
│ phone            │              │ role             │              │ business_name    │
│ created_at       │              │ created_at       │              │ vehicle_types[]  │
└──────────────────┘              └──────────────────┘              │ verification_status│
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

3. PAYMENT FLOW
   Booking accepted → customer pays → 
   payment (status = 'held_escrow') → 
   move completed → 
   payment (status = 'completed', release escrow) → 
   payout to mover (amount - commission)

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