# MoveLink Strategic Roadmap: MVP to Uber-Like Moving Platform
## Executive Analysis by AI Senior Engineering Consultant

**Date**: October 8, 2025  
**Current Status**: MVP Completed - Pre-Phase 1  
**Target Vision**: On-Demand Moving Platform (Uber/Bolt Model for Moving Services)

> **Status Note**: The current application is a functional MVP with basic quote generation and user authentication. Phase 1 (Marketplace Foundation) detailed below represents planned work for Months 1-3 to transform the MVP into a full two-sided marketplace.

---

## 🎯 EXECUTIVE SUMMARY

### Current State Assessment
Your app is a **solid MVP** with good fundamentals:
- ✅ **Strong Foundation**: Supabase + React + TypeScript + Capacitor
- ✅ **Core Features**: Quote generation, AI estimation, basic user auth
- ✅ **Legal Compliance**: Comprehensive privacy policy (Kenya DPA 2019)
- ✅ **Market Ready**: Google Play submission materials complete

### Gap Analysis: MVP → Uber-Like Platform
**Missing Critical Components** (Blocking Scale):
1. **Real-time mover tracking & availability** (GPS, geolocation)
2. **Dynamic pricing engine** (surge pricing, demand-based)
3. **Two-sided marketplace** (mover onboarding, verification, ratings)
4. **In-app payments** (M-Pesa, cards, escrow)
5. **Real-time booking & dispatch system**
6. **Live chat & notifications**
7. **Route optimization & fleet management**

**Estimated Timeline to Uber-Parity**: 
- **Phase 1 (Next 3 months)**: Core marketplace features
- **Phase 2 (Months 4-6)**: Real-time tracking & payments
- **Phase 3 (Months 7-12)**: AI optimization & scale infrastructure

---

## 📊 CURRENT ARCHITECTURE ASSESSMENT

### ✅ Strengths
1. **Modern Tech Stack**
   - React 18 + TypeScript (type safety)
   - Supabase (scalable backend, real-time capabilities)
   - Capacitor (cross-platform mobile)
   - TanStack Query (excellent data management)

2. **Good Engineering Practices**
   - Component-based architecture
   - Error boundaries
   - Performance monitoring stub
   - Clean separation of concerns

3. **Business Fundamentals**
   - User authentication (Supabase Auth)
   - Quote request workflow
   - Basic AI estimation logic
   - Google Maps integration (Places API)

### ⚠️ Critical Weaknesses

#### 1. **MONOLITHIC CLIENT-SIDE LOGIC**
```typescript
// Current: All logic in QuoteForm.tsx (400+ lines)
// Problem: Hard to maintain, test, scale
```
**Issue**: Quote generation, pricing, validation all in one component  
**Impact**: Cannot easily add mover-side features, testing nightmare  
**Fix**: Implement **Domain-Driven Design** with separate services

#### 2. **STATIC PRICING MODEL**
```typescript
// Current: generateAIQuoteEstimation() - hardcoded multipliers
const base = 12000
const sizeMultipliers = { 'Bedsitter': 0.7, '1BR': 1, ... }
```
**Issue**: No real AI, no market dynamics, no surge pricing  
**Impact**: Cannot compete with demand, loss of revenue optimization  
**Fix**: Implement **ML-based dynamic pricing engine**

#### 3. **NO REAL-TIME INFRASTRUCTURE**
**Missing**:
- Live mover location tracking
- Real-time availability updates
- Push notifications
- WebSocket connections

**Impact**: Cannot do on-demand bookings like Uber  
**Fix**: Implement **Supabase Realtime + Geolocation services**

#### 4. **WEAK MOVER-SIDE FEATURES**
```typescript
// Current: MoverDashboard is mostly placeholder
```
**Missing**:
- Mover onboarding & KYC
- Availability calendar
- Earnings dashboard
- Route optimization
- Job acceptance/rejection workflow

**Impact**: No mover retention, no supply-side growth  
**Fix**: Build **complete mover app** (separate or in-app)

#### 5. **NO PAYMENT INFRASTRUCTURE**
**Missing**:
- M-Pesa integration (critical for Kenya)
- Payment escrow
- Automatic payouts
- Commission tracking
- Refund handling

**Impact**: Manual payments → friction → churn  
**Fix**: Integrate **M-Pesa Daraja API + Stripe**

#### 6. **LIMITED DATA ARCHITECTURE**
**Current Schema Issues**:
- No mover profiles table
- No bookings/trips table
- No ratings/reviews table
- No real-time location tracking
- No earnings/transactions table

**Impact**: Cannot build two-sided marketplace  
**Fix**: Implement **comprehensive database schema**

---

## 🚀 STRATEGIC ROADMAP

### **PHASE 1: MARKETPLACE FOUNDATION (Months 1-3)**
**Goal**: Transform from quote generator to two-sided marketplace

#### 1.1 Database Schema Redesign
```sql
-- New Tables Needed
CREATE TABLE movers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  business_name TEXT NOT NULL,
  vehicle_types TEXT[], -- ['Pickup', 'Box Truck', 'Container']
  service_areas GEOGRAPHY[], -- PostGIS for geofencing
  availability_status TEXT, -- 'online', 'offline', 'busy'
  rating DECIMAL(3,2),
  total_moves INTEGER DEFAULT 0,
  verification_status TEXT, -- 'pending', 'verified', 'suspended'
  documents JSONB, -- KRA PIN, licenses, insurance
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES auth.users,
  mover_id UUID REFERENCES movers,
  quote_id UUID REFERENCES quotes,
  status TEXT, -- 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
  pickup_location GEOGRAPHY(POINT),
  dropoff_location GEOGRAPHY(POINT),
  scheduled_time TIMESTAMPTZ,
  estimated_price DECIMAL(10,2),
  final_price DECIMAL(10,2),
  distance_meters INTEGER,
  payment_status TEXT,
  tracking_data JSONB, -- Real-time location updates
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE payments (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings,
  amount DECIMAL(10,2),
  payment_method TEXT, -- 'mpesa', 'card', 'cash'
  transaction_id TEXT,
  status TEXT, -- 'pending', 'completed', 'failed', 'refunded'
  commission_amount DECIMAL(10,2),
  mover_payout_amount DECIMAL(10,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ratings (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings,
  rater_id UUID REFERENCES auth.users,
  rated_id UUID REFERENCES auth.users,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mover_locations (
  id UUID PRIMARY KEY,
  mover_id UUID REFERENCES movers,
  location GEOGRAPHY(POINT),
  heading DECIMAL(5,2), -- Direction in degrees
  speed DECIMAL(5,2), -- km/h
  accuracy DECIMAL(8,2), -- meters
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance

-- Geospatial indexes (GIST for geography types)
CREATE INDEX idx_movers_service_areas ON movers USING GIST(service_areas);
CREATE INDEX idx_bookings_pickup_location ON bookings USING GIST(pickup_location);
CREATE INDEX idx_bookings_dropoff_location ON bookings USING GIST(dropoff_location);
CREATE INDEX idx_mover_locations_location ON mover_locations USING GIST(location);

-- Foreign key indexes (critical for join performance)
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_mover_id ON bookings(mover_id);
CREATE INDEX idx_bookings_quote_id ON bookings(quote_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_ratings_booking_id ON ratings(booking_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);
CREATE INDEX idx_ratings_rated_id ON ratings(rated_id);
CREATE INDEX idx_mover_locations_mover_id ON mover_locations(mover_id);

-- Composite indexes for common query patterns
CREATE INDEX idx_bookings_mover_status ON bookings(mover_id, status);
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, status);
CREATE INDEX idx_bookings_status_scheduled ON bookings(status, scheduled_time);
CREATE INDEX idx_bookings_status_created ON bookings(status, created_at DESC);

-- Filtered index for finding available verified movers (sorted by rating)
CREATE INDEX idx_movers_available_verified ON movers(availability_status, rating DESC)
  WHERE verification_status = 'verified';

-- Composite index for mover earnings/dashboard queries
CREATE INDEX idx_bookings_mover_completed ON bookings(mover_id, completed_at DESC)
  WHERE status = 'completed';

-- Payment processing and reconciliation indexes
CREATE INDEX idx_payments_status_created ON payments(status, created_at DESC);
CREATE INDEX idx_payments_mover_status ON payments(mover_id, status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id); -- For M-Pesa lookups

-- Time-series indexes for analytics and tracking
CREATE INDEX idx_mover_locations_mover_time ON mover_locations(mover_id, timestamp DESC);
CREATE INDEX idx_bookings_completed_at ON bookings(completed_at DESC)
  WHERE completed_at IS NOT NULL;

-- Rating aggregation indexes
CREATE INDEX idx_ratings_rated_created ON ratings(rated_id, created_at DESC);
CREATE INDEX idx_ratings_booking_created ON ratings(booking_id, created_at DESC);
```

#### 1.2 Mover Onboarding System
**Features to Build**:
```typescript
// src/features/mover-onboarding/
- MoverRegistrationWizard.tsx
  - Step 1: Business Information
  - Step 2: Vehicle & Equipment Details
  - Step 3: Service Areas (Map Selection)
  - Step 4: Document Upload (KRA, Insurance, License)
  - Step 5: Bank/M-Pesa Details
  - Step 6: Background Check Consent

// Backend: Verification Pipeline
- supabase/functions/verify-mover/
  - KRA PIN verification (iTax API)
  - Background check integration (CRB)
  - Document OCR & validation
  - Manual review queue for admins
```

#### 1.3 Real-Time Booking Flow
```typescript
// New Components Needed
src/features/booking/
  - BookingRequest.tsx         // Customer initiates
  - MoverMatchingEngine.tsx    // Find nearby available movers
  - BookingOffer.tsx           // Send to movers
  - MoverAcceptance.tsx        // Mover accepts/rejects
  - BookingTracking.tsx        // Live tracking during move
  - CompletionFlow.tsx         // Payment + Rating

// Real-time Events (Supabase Realtime)
- booking:created → notify nearby movers
- booking:accepted → lock mover, notify customer
- booking:started → begin GPS tracking
- booking:completed → trigger payment flow
```

#### 1.4 Production-Ready Event Processing System

**Critical Requirements for Reliable Real-Time Events:**

##### 1.4.1 Event Log & Idempotency
```sql
-- Event log table for idempotency and replay
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key TEXT UNIQUE NOT NULL, -- Unique event identifier
  event_type TEXT NOT NULL, -- 'booking:created', 'booking:accepted', etc.
  entity_id UUID NOT NULL, -- booking_id, mover_id, etc.
  entity_type TEXT NOT NULL, -- 'booking', 'mover', 'payment'
  sequence_number BIGINT, -- For ordering within entity
  payload JSONB NOT NULL,
  source TEXT, -- 'api', 'webhook', 'system', 'realtime'
  
  -- Processing tracking
  processed_at TIMESTAMPTZ,
  processing_attempts INTEGER DEFAULT 0,
  last_processing_error TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users,
  
  -- Constraints
  CONSTRAINT valid_sequence CHECK (sequence_number >= 0)
);

-- Indexes for event processing
CREATE INDEX idx_event_log_idempotency ON event_log(idempotency_key);
CREATE INDEX idx_event_log_entity ON event_log(entity_type, entity_id, sequence_number);
CREATE INDEX idx_event_log_unprocessed ON event_log(created_at)
  WHERE processed_at IS NULL;
CREATE INDEX idx_event_log_type_created ON event_log(event_type, created_at DESC);
```

##### 1.4.2 Event Handler with Idempotency
```typescript
// src/services/eventProcessor.ts

interface EventPayload {
  idempotency_key: string; // UUID or booking_id + event_type + timestamp
  event_type: string;
  entity_id: string;
  entity_type: string;
  sequence_number?: number;
  data: Record<string, any>;
  timestamp: string;
}

async function processEvent(event: EventPayload): Promise<void> {
  // Step 1: Check idempotency - already processed?
  const { data: existingEvent } = await supabase
    .from('event_log')
    .select('processed_at')
    .eq('idempotency_key', event.idempotency_key)
    .single();
  
  if (existingEvent?.processed_at) {
    console.log(`Event ${event.idempotency_key} already processed, skipping`);
    return; // Idempotent: already processed
  }
  
  // Step 2: Persist event to log (atomic operation)
  const { error: logError } = await supabase
    .from('event_log')
    .insert({
      idempotency_key: event.idempotency_key,
      event_type: event.event_type,
      entity_id: event.entity_id,
      entity_type: event.entity_type,
      sequence_number: event.sequence_number,
      payload: event.data,
      source: 'realtime'
    });
  
  if (logError?.code === '23505') {
    // Unique constraint violation: race condition, already logged
    console.log('Event already logged by concurrent process');
    return;
  }
  
  // Step 3: Check for sequence gaps (ordered delivery)
  if (event.sequence_number !== undefined) {
    const isSequenceValid = await validateEventSequence(
      event.entity_type,
      event.entity_id,
      event.sequence_number
    );
    
    if (!isSequenceValid) {
      console.warn(`Sequence gap detected for ${event.entity_id}, buffering event`);
      await bufferOutOfOrderEvent(event);
      return; // Wait for missing events
    }
  }
  
  try {
    // Step 4: Process event business logic
    await executeEventHandler(event);
    
    // Step 5: Mark as processed
    await supabase
      .from('event_log')
      .update({ processed_at: new Date().toISOString() })
      .eq('idempotency_key', event.idempotency_key);
    
    // Step 6: Check if buffered events can now be processed
    await processBufferedEvents(event.entity_type, event.entity_id);
    
  } catch (error) {
    // Step 7: Log error and retry logic handled separately
    await handleEventProcessingError(event, error);
    throw error; // Re-throw for retry mechanism
  }
}
```

##### 1.4.3 Ordered Event Delivery
```typescript
// Sequence validation and buffering
async function validateEventSequence(
  entityType: string,
  entityId: string,
  sequenceNumber: number
): Promise<boolean> {
  // Get last processed sequence for this entity
  const { data: lastEvent } = await supabase
    .from('event_log')
    .select('sequence_number')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .not('processed_at', 'is', null)
    .order('sequence_number', { ascending: false })
    .limit(1)
    .single();
  
  const expectedSequence = (lastEvent?.sequence_number ?? -1) + 1;
  
  if (sequenceNumber === expectedSequence) {
    return true; // Perfect order
  }
  
  if (sequenceNumber < expectedSequence) {
    console.log(`Duplicate/old event: ${sequenceNumber} < ${expectedSequence}`);
    return false; // Old event, ignore
  }
  
  // Gap detected: sequenceNumber > expectedSequence
  console.warn(`Gap detected: expected ${expectedSequence}, got ${sequenceNumber}`);
  return false; // Buffer and wait for missing events
}

// Buffer for out-of-order events
const eventBuffer = new Map<string, EventPayload[]>();

async function bufferOutOfOrderEvent(event: EventPayload): Promise<void> {
  const bufferKey = `${event.entity_type}:${event.entity_id}`;
  
  if (!eventBuffer.has(bufferKey)) {
    eventBuffer.set(bufferKey, []);
  }
  
  eventBuffer.get(bufferKey)!.push(event);
  
  // Set timeout to reconcile gaps after 30 seconds
  setTimeout(() => reconcileEventGaps(event.entity_type, event.entity_id), 30000);
}

async function processBufferedEvents(entityType: string, entityId: string): Promise<void> {
  const bufferKey = `${entityType}:${entityId}`;
  const buffered = eventBuffer.get(bufferKey) || [];
  
  if (buffered.length === 0) return;
  
  // Sort by sequence number
  buffered.sort((a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0));
  
  // Process in order
  for (const event of buffered) {
    const isValid = await validateEventSequence(
      event.entity_type,
      event.entity_id,
      event.sequence_number!
    );
    
    if (isValid) {
      await processEvent(event);
      // Remove from buffer
      const index = buffered.indexOf(event);
      buffered.splice(index, 1);
    } else {
      break; // Still gaps, stop processing
    }
  }
  
  // Clean up buffer if empty
  if (buffered.length === 0) {
    eventBuffer.delete(bufferKey);
  }
}
```

##### 1.4.4 Retry & Dead Letter Queue
```sql
-- Dead letter queue for failed events
CREATE TABLE event_dlq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_log_id UUID REFERENCES event_log(id),
  idempotency_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  failure_reason TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  payload JSONB NOT NULL,
  
  -- Resolution tracking
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dlq_unresolved ON event_dlq(created_at)
  WHERE resolved_at IS NULL;
CREATE INDEX idx_dlq_event_type ON event_dlq(event_type);
```

```typescript
// Retry logic with exponential backoff
async function handleEventProcessingError(
  event: EventPayload,
  error: any
): Promise<void> {
  // Increment processing attempts
  const { data: eventLog } = await supabase
    .from('event_log')
    .select('processing_attempts')
    .eq('idempotency_key', event.idempotency_key)
    .single();
  
  const attempts = (eventLog?.processing_attempts ?? 0) + 1;
  const maxRetries = 5;
  
  await supabase
    .from('event_log')
    .update({
      processing_attempts: attempts,
      last_processing_error: error.message
    })
    .eq('idempotency_key', event.idempotency_key);
  
  if (attempts >= maxRetries) {
    // Move to dead letter queue
    await supabase.from('event_dlq').insert({
      event_log_id: eventLog.id,
      idempotency_key: event.idempotency_key,
      event_type: event.event_type,
      entity_id: event.entity_id,
      failure_reason: error.message,
      retry_count: attempts,
      payload: event.data
    });
    
    // Alert operations team
    await sendAlert({
      level: 'critical',
      message: `Event ${event.event_type} failed after ${attempts} attempts`,
      details: { idempotency_key: event.idempotency_key, error: error.message }
    });
    
    return; // Don't retry further
  }
  
  // Exponential backoff: 2^attempts seconds
  const backoffMs = Math.pow(2, attempts) * 1000;
  
  setTimeout(async () => {
    console.log(`Retrying event ${event.idempotency_key}, attempt ${attempts + 1}`);
    await processEvent(event);
  }, backoffMs);
}
```

##### 1.4.5 Reconnection & Event Replay
```typescript
// Store client cursors for replay
interface ClientCursor {
  client_id: string;
  entity_type: string;
  last_processed_sequence: number;
  last_processed_timestamp: string;
  updated_at: string;
}

// On client reconnect, request missed events
async function handleReconnection(clientId: string): Promise<void> {
  // Fetch last cursor position
  const { data: cursor } = await supabase
    .from('client_cursors')
    .select('*')
    .eq('client_id', clientId)
    .single();
  
  if (!cursor) {
    console.log('No cursor found, starting fresh subscription');
    return;
  }
  
  // Fetch missed events since last processed
  const { data: missedEvents } = await supabase
    .from('event_log')
    .select('*')
    .eq('entity_type', cursor.entity_type)
    .gt('created_at', cursor.last_processed_timestamp)
    .order('sequence_number', { ascending: true });
  
  console.log(`Replaying ${missedEvents?.length ?? 0} missed events`);
  
  // Replay missed events in order
  for (const event of missedEvents || []) {
    await processEvent({
      idempotency_key: event.idempotency_key,
      event_type: event.event_type,
      entity_id: event.entity_id,
      entity_type: event.entity_type,
      sequence_number: event.sequence_number,
      data: event.payload,
      timestamp: event.created_at
    });
  }
  
  // Update cursor
  await updateClientCursor(clientId, cursor.entity_type, missedEvents);
}

// Update cursor after processing events
async function updateClientCursor(
  clientId: string,
  entityType: string,
  events: any[]
): Promise<void> {
  if (!events || events.length === 0) return;
  
  const lastEvent = events[events.length - 1];
  
  await supabase
    .from('client_cursors')
    .upsert({
      client_id: clientId,
      entity_type: entityType,
      last_processed_sequence: lastEvent.sequence_number,
      last_processed_timestamp: lastEvent.created_at,
      updated_at: new Date().toISOString()
    });
}
```

##### 1.4.6 Monitoring & Alerting
```typescript
// Monitor event processing health
interface EventProcessingMetrics {
  unprocessed_count: number;
  avg_processing_time_ms: number;
  error_rate: number;
  dlq_count: number;
  max_sequence_gap: number;
}

async function monitorEventProcessing(): Promise<EventProcessingMetrics> {
  // Count unprocessed events
  const { count: unprocessedCount } = await supabase
    .from('event_log')
    .select('*', { count: 'exact', head: true })
    .is('processed_at', null);
  
  // Count DLQ entries
  const { count: dlqCount } = await supabase
    .from('event_dlq')
    .select('*', { count: 'exact', head: true })
    .is('resolved_at', null);
  
  // Alert if thresholds exceeded
  if (unprocessedCount! > 100) {
    await sendAlert({
      level: 'warning',
      message: `${unprocessedCount} unprocessed events in queue`,
    });
  }
  
  if (dlqCount! > 10) {
    await sendAlert({
      level: 'critical',
      message: `${dlqCount} events in dead letter queue requiring attention`,
    });
  }
  
  return {
    unprocessed_count: unprocessedCount!,
    avg_processing_time_ms: 0, // TODO: Calculate from logs
    error_rate: 0, // TODO: Calculate from attempts
    dlq_count: dlqCount!,
    max_sequence_gap: 0 // TODO: Calculate from sequence checks
  };
}

// Run monitoring every minute
setInterval(monitorEventProcessing, 60000);
```

**Production Checklist:**
- ✅ Idempotency keys on all events
- ✅ Event log table with unique constraints
- ✅ Processed_at tracking to avoid duplicates
- ✅ Sequence numbers for ordered delivery
- ✅ Buffer for out-of-order events
- ✅ Gap detection and reconciliation
- ✅ Retry logic with exponential backoff (max 5 attempts)
- ✅ Dead letter queue for failed events
- ✅ Alerting for DLQ and processing delays
- ✅ Client cursors for reconnection replay
- ✅ Monitoring dashboard for event health
```

---

### **PHASE 2: REAL-TIME OPERATIONS (Months 4-6)**

#### 2.1 GPS Tracking & Geolocation
```typescript
// src/features/tracking/
- useGPSTracking.ts
  - Continuous location updates (every 30 seconds)
  - Battery-efficient background tracking
  - Offline queueing (sync when online)
  
// Backend: Location Processing
- supabase/functions/process-location/
  - Store in mover_locations table
  - Broadcast to customer's real-time channel
  - Trigger proximity alerts (e.g., "Mover 5 min away")

// Map Integration
- Replace Google Maps with Mapbox (better pricing for real-time)
- Live polyline tracking
- ETA calculations with traffic data
```

#### 2.2 Dynamic Pricing Engine
```typescript
// src/features/pricing/
- DynamicPricingService.ts
  - Base Price Calculation (distance, property size)
  - Demand Multiplier (time of day, day of week)
  - Surge Pricing (high demand areas)
  - Seasonal Adjustments (holiday seasons)
  - Competitor Price Monitoring (scraping)

// ML Model (Python microservice or Supabase Edge Function with Deno)
supabase/functions/pricing-ml/
  - Train on historical bookings data
  - Features: time, location, distance, weather, inventory size
  - Predict optimal price to maximize booking rate + revenue
  - A/B test pricing strategies

// Example Logic
function calculateDynamicPrice(booking: BookingRequest): number {
  const basePrice = calculateBasePrice(booking)
  const demandMultiplier = getDemandMultiplier(booking.pickup_area, booking.time)
  const surgeMultiplier = getSurgeMultiplier(booking.pickup_area)
  
  return basePrice * demandMultiplier * surgeMultiplier
}
```

#### 2.3 Payment Integration
```typescript
// M-Pesa Integration (Daraja API)
src/services/mpesa/
  - MpesaService.ts
    - STK Push (customer payment initiation)
    - Payment verification
    - Webhook handling (async payment confirmation)
    - Refund processing

// Payment Flow
1. Customer books → generate payment request
2. STK Push to customer's phone
3. Customer enters M-Pesa PIN
4. Payment held in escrow (your account)
5. Move completes → release to mover (minus commission)
6. Daily/weekly batch payouts to movers

// Fallback: Card Payments (Stripe)
- For corporate clients
- For users without M-Pesa

// Commission Structure
const COMMISSION_RATE = 0.15 // 15% platform fee
const INSURANCE_FEE = 0.02   // 2% for damage insurance fund
```

#### 2.3.1 Escrow Holding & Release Policy

**Recommended Escrow Holding Period: 48 Hours**

```typescript
// Escrow State Machine
enum EscrowStatus {
  HELD = 'held_escrow',           // Payment captured, held for 48h
  RELEASED = 'released',          // Released to mover after successful completion
  REFUNDED = 'refunded',          // Refunded to customer (cancellation/dispute)
  DISPUTED = 'disputed_held'      // Held during dispute resolution
}

// Escrow Release Rules
const ESCROW_POLICIES = {
  // Standard holding period after completion
  STANDARD_HOLD_HOURS: 48,
  
  // Auto-release if no dispute filed within holding period
  AUTO_RELEASE_ENABLED: true,
  
  // Early release for highly-rated movers (>4.8 rating, >100 moves)
  EARLY_RELEASE_HOURS: 24,
  EARLY_RELEASE_CRITERIA: {
    min_rating: 4.8,
    min_completed_moves: 100
  },
  
  // Extended hold for first-time movers
  EXTENDED_HOLD_HOURS: 72,
  EXTENDED_HOLD_CRITERIA: {
    completed_moves: 0
  }
};

// Implementation
async function determineEscrowHoldingPeriod(
  moverId: string,
  bookingId: string
): Promise<number> {
  const mover = await getMoverProfile(moverId);
  
  // Early release for trusted movers
  if (mover.rating >= 4.8 && mover.total_completed_moves >= 100) {
    return ESCROW_POLICIES.EARLY_RELEASE_HOURS;
  }
  
  // Extended hold for new movers
  if (mover.total_completed_moves === 0) {
    return ESCROW_POLICIES.EXTENDED_HOLD_HOURS;
  }
  
  // Standard 48-hour hold
  return ESCROW_POLICIES.STANDARD_HOLD_HOURS;
}

async function scheduleEscrowRelease(paymentId: string): Promise<void> {
  const payment = await getPayment(paymentId);
  const holdHours = await determineEscrowHoldingPeriod(
    payment.mover_id,
    payment.booking_id
  );
  
  const releaseAt = new Date(payment.completed_at);
  releaseAt.setHours(releaseAt.getHours() + holdHours);
  
  // Update payment with release timestamp
  await supabase
    .from('payments')
    .update({
      escrow_status: 'held_escrow',
      held_until: releaseAt.toISOString()
    })
    .eq('id', paymentId);
  
  // Schedule automatic release (use pg_cron or background job)
  await scheduleJob('release-escrow', releaseAt, { paymentId });
}
```

#### 2.3.2 Dispute Resolution Process

**Dispute Status Lifecycle:**
```
none → pending → under_review → evidence_collection → resolved
```

##### Dispute Schema
```sql
-- Add dispute columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dispute_status TEXT 
  CHECK (dispute_status IN ('none', 'pending', 'under_review', 'evidence_collection', 'resolved'))
  DEFAULT 'none';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dispute_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dispute_filed_by UUID REFERENCES auth.users;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dispute_filed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dispute_resolved_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dispute_resolution TEXT; -- 'refund_customer', 'payout_mover', 'partial_refund'

-- Dispute evidence table
CREATE TABLE dispute_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES auth.users NOT NULL,
  evidence_type TEXT NOT NULL, -- 'photo', 'video', 'document', 'statement'
  file_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for dispute queries
CREATE INDEX idx_bookings_dispute_status ON bookings(dispute_status)
  WHERE dispute_status != 'none';
CREATE INDEX idx_dispute_evidence_booking ON dispute_evidence(booking_id);
```

##### Dispute Process Implementation
```typescript
// 1. Customer/Mover Files Dispute
async function fileDispute(
  bookingId: string,
  filedBy: string, // user_id
  reason: string,
  evidence: DisputeEvidence[]
): Promise<void> {
  const booking = await getBooking(bookingId);
  
  // Validation: Can only file dispute within holding period
  if (booking.completed_at) {
    const completedAt = new Date(booking.completed_at);
    const now = new Date();
    const hoursSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);
    
    const payment = await getPaymentByBooking(bookingId);
    const holdHours = await determineEscrowHoldingPeriod(booking.mover_id, bookingId);
    
    if (hoursSinceCompletion > holdHours) {
      throw new Error(
        `Dispute window closed. Disputes must be filed within ${holdHours} hours of completion.`
      );
    }
  }
  
  // Update booking dispute status
  await supabase
    .from('bookings')
    .update({
      dispute_status: 'pending',
      dispute_reason: reason,
      dispute_filed_by: filedBy,
      dispute_filed_at: new Date().toISOString()
    })
    .eq('id', bookingId);
  
  // Update payment to freeze escrow
  await supabase
    .from('payments')
    .update({
      escrow_status: 'disputed_held'
    })
    .eq('booking_id', bookingId);
  
  // Store evidence
  for (const ev of evidence) {
    await supabase
      .from('dispute_evidence')
      .insert({
        booking_id: bookingId,
        submitted_by: filedBy,
        evidence_type: ev.type,
        file_url: ev.fileUrl,
        description: ev.description
      });
  }
  
  // Notify admin team for review
  await notifyAdminTeam({
    type: 'new_dispute',
    bookingId,
    reason,
    priority: 'high'
  });
  
  // Notify other party
  const otherPartyId = filedBy === booking.customer_id ? booking.mover_id : booking.customer_id;
  await sendNotification(otherPartyId, {
    title: 'Dispute Filed',
    body: 'A dispute has been filed for your booking. You have 24 hours to submit evidence.',
    action: 'view_dispute'
  });
}

// 2. Evidence Collection Period (24 hours for each party)
const EVIDENCE_COLLECTION_PERIOD_HOURS = 24;

async function requestEvidenceFromParty(
  bookingId: string,
  partyId: string
): Promise<void> {
  await supabase
    .from('bookings')
    .update({ dispute_status: 'evidence_collection' })
    .eq('id', bookingId);
  
  await sendNotification(partyId, {
    title: 'Submit Dispute Evidence',
    body: 'You have 24 hours to submit evidence for the dispute.',
    action: 'submit_evidence'
  });
  
  // Set deadline
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + EVIDENCE_COLLECTION_PERIOD_HOURS);
  
  await scheduleJob('escalate-to-review', deadline, { bookingId });
}

// 3. Admin Review & Resolution
async function resolveDispute(
  bookingId: string,
  resolution: 'refund_customer' | 'payout_mover' | 'partial_refund',
  partialRefundPercentage?: number,
  notes?: string
): Promise<void> {
  const booking = await getBooking(bookingId);
  const payment = await getPaymentByBooking(bookingId);
  
  // Update dispute status
  await supabase
    .from('bookings')
    .update({
      dispute_status: 'resolved',
      dispute_resolved_at: new Date().toISOString(),
      dispute_resolution: resolution
    })
    .eq('id', bookingId);
  
  // Execute resolution
  switch (resolution) {
    case 'refund_customer':
      await refundPayment(payment.id, payment.amount, 'dispute_resolved_customer_favor');
      await supabase
        .from('payments')
        .update({ escrow_status: 'refunded' })
        .eq('id', payment.id);
      break;
      
    case 'payout_mover':
      await releaseEscrowToMover(payment.id);
      await supabase
        .from('payments')
        .update({ escrow_status: 'released' })
        .eq('id', payment.id);
      break;
      
    case 'partial_refund':
      if (!partialRefundPercentage) throw new Error('Partial refund percentage required');
      
      const refundAmount = payment.amount * (partialRefundPercentage / 100);
      const moverPayoutAmount = payment.amount - refundAmount - payment.commission_amount;
      
      await refundPayment(payment.id, refundAmount, 'dispute_partial_refund');
      await payoutToMover(payment.mover_id, moverPayoutAmount);
      
      await supabase
        .from('payments')
        .update({ 
          escrow_status: 'resolved',
          refund_amount: refundAmount,
          mover_payout_amount: moverPayoutAmount
        })
        .eq('id', payment.id);
      break;
  }
  
  // Notify both parties
  await notifyDisputeResolution(booking, resolution, notes);
}

// Dispute Timeouts
const DISPUTE_TIMEOUTS = {
  EVIDENCE_SUBMISSION: 24, // hours
  ADMIN_REVIEW: 72,        // hours
  ESCALATION: 168          // hours (7 days) - escalate to senior review
};
```

#### 2.3.3 Partial Completion & Milestone-Based Releases

```typescript
// Milestone-based escrow for large moves
interface MoveCompletion {
  booking_id: string;
  milestone: 'loading' | 'in_transit' | 'unloading' | 'completed';
  release_percentage: number;
  confirmed_by: 'customer' | 'mover' | 'both';
}

const MILESTONE_RELEASE_SCHEDULE = {
  loading: 25,      // 25% after loading confirmed
  in_transit: 0,    // 0% during transit (held)
  unloading: 50,    // 50% after unloading confirmed
  completed: 25     // Final 25% after customer confirmation
};

async function processMilestoneRelease(
  bookingId: string,
  milestone: string
): Promise<void> {
  const payment = await getPaymentByBooking(bookingId);
  const releasePercentage = MILESTONE_RELEASE_SCHEDULE[milestone];
  
  if (releasePercentage === 0) return;
  
  const releaseAmount = 
    (payment.amount - payment.commission_amount) * (releasePercentage / 100);
  
  await payoutToMover(payment.mover_id, releaseAmount);
  
  // Track milestone completion
  await supabase
    .from('booking_milestones')
    .insert({
      booking_id: bookingId,
      milestone,
      release_percentage: releasePercentage,
      release_amount: releaseAmount,
      completed_at: new Date().toISOString()
    });
}

// Pro-rata refunds for partial completion
async function calculateProRataRefund(
  bookingId: string,
  completedPercentage: number
): Promise<number> {
  const payment = await getPaymentByBooking(bookingId);
  
  // Customer pays only for completed portion
  const chargeAmount = payment.amount * (completedPercentage / 100);
  const refundAmount = payment.amount - chargeAmount;
  
  return refundAmount;
}
```

#### 2.3.4 Cancellation Windows & Refund Rules

```sql
-- Add cancellation tracking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Payment refund tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- Indexes
CREATE INDEX idx_bookings_cancelled_by ON bookings(cancelled_by);
CREATE INDEX idx_payments_refunded ON payments(refunded_at)
  WHERE refunded_at IS NOT NULL;
```

```typescript
// Cancellation Policy
enum CancellationWindow {
  BEFORE_ACCEPTANCE = 'before_acceptance',      // Before mover accepts
  BEFORE_DISPATCH = 'before_dispatch',          // After acceptance, before mover en route
  AFTER_DISPATCH = 'after_dispatch',            // Mover already en route
  NO_SHOW = 'no_show'                           // Customer not present at pickup
}

const CANCELLATION_POLICIES = {
  // Full refund: Before mover accepts or >24h before scheduled time
  BEFORE_ACCEPTANCE: {
    refund_percentage: 100,
    cancellation_fee: 0
  },
  
  // Full refund: >24h before scheduled time (even if accepted)
  BEFORE_DISPATCH_24H: {
    refund_percentage: 100,
    cancellation_fee: 0
  },
  
  // Partial refund: <24h but before mover dispatched
  BEFORE_DISPATCH_LATE: {
    refund_percentage: 50,
    cancellation_fee_percentage: 50 // Charge 50% of booking amount
  },
  
  // Minimal refund: Mover already en route
  AFTER_DISPATCH: {
    refund_percentage: 25,
    cancellation_fee_percentage: 75,
    include_transport_compensation: true
  },
  
  // No refund: Customer no-show
  NO_SHOW: {
    refund_percentage: 0,
    cancellation_fee_percentage: 100,
    mover_compensation: 100 // Mover gets full payment
  }
};

async function calculateCancellationRefund(
  bookingId: string,
  cancelledBy: string
): Promise<CancellationResult> {
  const booking = await getBooking(bookingId);
  const payment = await getPaymentByBooking(bookingId);
  
  const now = new Date();
  const scheduledTime = new Date(booking.scheduled_date);
  const hoursUntilMove = (scheduledTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  let policy: any;
  let window: CancellationWindow;
  
  // Determine cancellation window
  if (booking.status === 'pending') {
    // Before mover accepted
    policy = CANCELLATION_POLICIES.BEFORE_ACCEPTANCE;
    window = CancellationWindow.BEFORE_ACCEPTANCE;
    
  } else if (booking.status === 'accepted' && hoursUntilMove > 24) {
    // More than 24h before move
    policy = CANCELLATION_POLICIES.BEFORE_DISPATCH_24H;
    window = CancellationWindow.BEFORE_DISPATCH;
    
  } else if (booking.status === 'accepted' && booking.status !== 'mover_en_route') {
    // Less than 24h, mover not dispatched yet
    policy = CANCELLATION_POLICIES.BEFORE_DISPATCH_LATE;
    window = CancellationWindow.BEFORE_DISPATCH;
    
  } else if (booking.status === 'mover_en_route' || booking.status === 'in_progress') {
    // Mover already dispatched or in progress
    policy = CANCELLATION_POLICIES.AFTER_DISPATCH;
    window = CancellationWindow.AFTER_DISPATCH;
    
  } else {
    throw new Error('Cannot cancel booking in current state');
  }
  
  // Calculate refund and fee
  const refundAmount = payment.amount * (policy.refund_percentage / 100);
  const cancellationFee = payment.amount * ((policy.cancellation_fee_percentage || 0) / 100);
  
  return {
    window,
    refund_amount: refundAmount,
    cancellation_fee: cancellationFee,
    mover_compensation: policy.mover_compensation 
      ? payment.amount - payment.commission_amount 
      : cancellationFee * 0.8, // Mover gets 80% of cancellation fee
    policy_applied: policy
  };
}

async function processCancellation(
  bookingId: string,
  cancelledBy: string,
  reason: string
): Promise<void> {
  const booking = await getBooking(bookingId);
  const cancellation = await calculateCancellationRefund(bookingId, cancelledBy);
  
  // Update booking
  const cancellationStatus = cancelledBy === booking.customer_id 
    ? 'cancelled_customer' 
    : 'cancelled_mover';
  
  await supabase
    .from('bookings')
    .update({
      status: cancellationStatus,
      cancelled_at: new Date().toISOString(),
      cancelled_by: cancelledBy,
      cancellation_fee: cancellation.cancellation_fee,
      cancellation_reason: reason
    })
    .eq('id', bookingId);
  
  // Process refund if applicable
  if (cancellation.refund_amount > 0) {
    await refundPayment(
      booking.payment_id, 
      cancellation.refund_amount,
      `Cancellation: ${cancellation.window}`
    );
  }
  
  // Compensate mover if applicable
  if (cancellation.mover_compensation > 0 && booking.mover_id) {
    await payoutToMover(
      booking.mover_id,
      cancellation.mover_compensation,
      'Cancellation compensation'
    );
  }
  
  // Update payment record
  await supabase
    .from('payments')
    .update({
      refund_amount: cancellation.refund_amount,
      refund_reason: `Cancellation in ${cancellation.window} window`,
      refunded_at: cancellation.refund_amount > 0 ? new Date().toISOString() : null,
      mover_payout_amount: cancellation.mover_compensation
    })
    .eq('booking_id', bookingId);
  
  // Notify both parties
  await notifyCancellation(booking, cancellation, cancelledBy, reason);
}

// Handle no-show scenario
async function handleNoShow(bookingId: string): Promise<void> {
  const booking = await getBooking(bookingId);
  const payment = await getPaymentByBooking(bookingId);
  
  // Mark as no-show cancellation
  await processCancellation(
    bookingId,
    booking.customer_id,
    'Customer no-show at pickup location'
  );
  
  // Full payment to mover as compensation
  await payoutToMover(
    booking.mover_id,
    payment.amount - payment.commission_amount,
    'No-show compensation'
  );
  
  // Potentially penalize customer (reduce trust score, temporary booking restriction)
  await applyNoShowPenalty(booking.customer_id);
}
```

#### 2.3.5 Database Schema Changes Summary

```sql
-- ============================================================================
-- PAYMENT & DISPUTE ENHANCEMENT MIGRATION
-- ============================================================================

-- 1. Add escrow holding tracking to payments table
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS escrow_status TEXT 
    CHECK (escrow_status IN ('held_escrow', 'released', 'refunded', 'disputed_held', 'resolved'))
    DEFAULT 'held_escrow',
  ADD COLUMN IF NOT EXISTS held_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS release_reason TEXT;

-- 2. Add dispute tracking to bookings table
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS dispute_status TEXT 
    CHECK (dispute_status IN ('none', 'pending', 'under_review', 'evidence_collection', 'resolved'))
    DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
  ADD COLUMN IF NOT EXISTS dispute_filed_by UUID REFERENCES auth.users,
  ADD COLUMN IF NOT EXISTS dispute_filed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dispute_resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dispute_resolution TEXT;

-- 3. Add cancellation tracking to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users,
  ADD COLUMN IF NOT EXISTS cancellation_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 4. Add refund tracking to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS refund_reason TEXT,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

-- 5. Create dispute evidence table
CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES auth.users NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('photo', 'video', 'document', 'statement')),
  file_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create booking milestones table (for partial releases)
CREATE TABLE IF NOT EXISTS booking_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  milestone TEXT NOT NULL CHECK (milestone IN ('loading', 'in_transit', 'unloading', 'completed')),
  release_percentage DECIMAL(5,2) NOT NULL CHECK (release_percentage BETWEEN 0 AND 100),
  release_amount DECIMAL(10,2),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_by UUID REFERENCES auth.users
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_escrow_status ON payments(escrow_status);
CREATE INDEX IF NOT EXISTS idx_payments_held_until ON payments(held_until)
  WHERE escrow_status = 'held_escrow';
  
CREATE INDEX IF NOT EXISTS idx_bookings_dispute_status ON bookings(dispute_status)
  WHERE dispute_status != 'none';
CREATE INDEX IF NOT EXISTS idx_bookings_dispute_filed_at ON bookings(dispute_filed_at)
  WHERE dispute_filed_at IS NOT NULL;
  
CREATE INDEX IF NOT EXISTS idx_bookings_cancelled_by ON bookings(cancelled_by)
  WHERE cancelled_by IS NOT NULL;
  
CREATE INDEX IF NOT EXISTS idx_payments_refunded_at ON payments(refunded_at)
  WHERE refunded_at IS NOT NULL;
  
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_booking ON dispute_evidence(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_milestones_booking ON booking_milestones(booking_id);

-- 8. Add constraints
ALTER TABLE bookings
  ADD CONSTRAINT valid_cancellation_fee CHECK (cancellation_fee >= 0),
  ADD CONSTRAINT cancellation_requires_cancelled_by CHECK (
    (status LIKE 'cancelled%' AND cancelled_by IS NOT NULL) OR
    (status NOT LIKE 'cancelled%')
  );

ALTER TABLE payments
  ADD CONSTRAINT valid_refund_amount CHECK (refund_amount >= 0 AND refund_amount <= amount),
  ADD CONSTRAINT held_until_future CHECK (held_until IS NULL OR held_until > created_at);

-- 9. Backfill existing records (if any)
-- Set default escrow_status for existing payments
UPDATE payments 
SET escrow_status = 'held_escrow' 
WHERE escrow_status IS NULL AND payment_status = 'completed';

UPDATE payments 
SET escrow_status = 'refunded' 
WHERE escrow_status IS NULL AND is_refunded = TRUE;

-- Set default dispute_status for existing bookings
UPDATE bookings 
SET dispute_status = 'none' 
WHERE dispute_status IS NULL;

-- 10. Add foreign key constraints with proper cascading
ALTER TABLE dispute_evidence
  ADD CONSTRAINT fk_dispute_evidence_booking 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

ALTER TABLE booking_milestones
  ADD CONSTRAINT fk_booking_milestones_booking 
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- 11. Create trigger for auto-release scheduling
CREATE OR REPLACE FUNCTION schedule_escrow_auto_release()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.escrow_status = 'held_escrow' AND NEW.held_until IS NOT NULL THEN
    -- Schedule background job to release escrow at held_until timestamp
    -- (Implementation depends on your job scheduler: pg_cron, Supabase Edge Functions, etc.)
    PERFORM pg_notify('escrow_release_scheduled', json_build_object(
      'payment_id', NEW.id,
      'release_at', NEW.held_until
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_schedule_escrow_release
AFTER UPDATE OF held_until ON payments
FOR EACH ROW
EXECUTE FUNCTION schedule_escrow_auto_release();

-- 12. Add audit columns for compliance
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS last_status_change_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS status_change_history JSONB DEFAULT '[]'::jsonb;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS dispute_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN payments.escrow_status IS 'Current escrow state for this payment';
COMMENT ON COLUMN payments.held_until IS 'Timestamp when escrow will auto-release (if no dispute)';
COMMENT ON COLUMN bookings.dispute_status IS 'Current dispute resolution status';
COMMENT ON COLUMN bookings.cancellation_fee IS 'Fee charged to cancelling party';
COMMENT ON COLUMN dispute_evidence.evidence_type IS 'Type of evidence: photo, video, document, statement';

-- End of migration
```

**Migration Steps:**
1. **Test on staging database** with sample data
2. **Backup production database** before applying
3. **Apply schema changes** during low-traffic period
4. **Run backfill queries** to update existing records
5. **Verify indexes created** (`\di` in psql)
6. **Test auto-release trigger** with test payment
7. **Monitor query performance** after deployment
8. **Update application code** to use new columns/statuses

**Rollback Plan:**
```sql
-- If issues arise, can rollback by:
DROP TRIGGER IF EXISTS trigger_schedule_escrow_release ON payments;
DROP FUNCTION IF EXISTS schedule_escrow_auto_release();
DROP TABLE IF EXISTS booking_milestones;
DROP TABLE IF EXISTS dispute_evidence;

-- Remove added columns (if no production data relies on them)
ALTER TABLE payments DROP COLUMN IF EXISTS escrow_status;
ALTER TABLE payments DROP COLUMN IF EXISTS held_until;
-- (etc.)
```

#### 2.4 Push Notifications
```typescript
// Use Firebase Cloud Messaging (FCM)
src/services/notifications/
  - NotificationService.ts
    - Send to specific users
    - Send to geofenced areas (broadcast to nearby movers)
    - Rich notifications (actions: Accept/Reject)

// Notification Types
- New booking request (to movers)
- Booking accepted (to customer)
- Mover arriving soon (proximity-based)
- Payment confirmation
- Rating reminder
- Promotional offers
```

---

### **PHASE 3: AI OPTIMIZATION & SCALE (Months 7-12)**

#### 3.1 Advanced AI Features
```typescript
// Intelligent Matching Algorithm
- ML model to predict best mover for each job
  - Factors: rating, distance, completion rate, vehicle type
  - Optimize for customer satisfaction + mover earnings
  
// Demand Forecasting
- Predict high-demand times/areas
- Pre-position movers (incentivize them to be in right place)

// Route Optimization
- Multi-stop bookings
- Optimize mover's daily route (like Uber Eats batching)
- Reduce empty return trips

// Fraud Detection
- Detect fake bookings
- Identify suspicious mover behavior
- Prevent rating manipulation
```

#### 3.2 Advanced Mover Features
```typescript
// Earnings Optimization
- Show heat maps of high-demand areas
- Suggest optimal working hours
- Gamification (badges, leaderboards)

// Fleet Management (for moving companies)
- Manage multiple vehicles
- Dispatch system
- Driver assignment

// Advanced Scheduling
- Pre-booking (schedule moves weeks in advance)
- Recurring moves (corporate contracts)
```

#### 3.3 Analytics & Business Intelligence
```typescript
// Admin Dashboard
- Real-time bookings monitoring
- Revenue tracking
- Mover performance metrics
- Customer churn analysis
- Geographic demand heat maps

// Reporting
- Financial reports (revenue, commissions, payouts)
- Operational KPIs (avg move time, cancellation rate)
- Growth metrics (DAU, MAU, retention)
```

---

## 🏗️ TECHNICAL IMPROVEMENTS NEEDED NOW

### 1. **Refactor to Feature-Based Architecture**
```
src/
  features/
    auth/
      - components/
      - hooks/
      - services/
    quotes/
      - components/
      - hooks/
      - services/
    bookings/
      - components/
      - hooks/
      - services/
    movers/
      - components/
      - hooks/
      - services/
    payments/
      - components/
      - hooks/
      - services/
  shared/
    - components/
    - hooks/
    - utils/
    - types/
```

### 2. **State Management Upgrade**
```typescript
// Current: Prop drilling + React Query
// Problem: Hard to manage complex real-time state

// Solution: Add Zustand or Redux Toolkit
npm install zustand

// Example: Real-time booking state
import create from 'zustand'

interface BookingStore {
  activeBooking: Booking | null
  moverLocation: Location | null
  subscribeToBooking: (bookingId: string) => void
  unsubscribe: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  activeBooking: null,
  moverLocation: null,
  subscribeToBooking: (bookingId) => {
    const channel = supabase
      .channel(`booking:${bookingId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings',
        filter: `id=eq.${bookingId}` 
      }, (payload) => {
        set({ activeBooking: payload.new as Booking })
      })
      .subscribe()
  },
  unsubscribe: () => {
    supabase.removeAllChannels()
  }
}))
```

### 3. **Add Comprehensive Testing**
```typescript
// Current: No tests (CRITICAL GAP)
// Add: Jest + React Testing Library + Playwright

// Unit Tests
src/features/pricing/__tests__/
  - DynamicPricingService.test.ts
  - calculateBasePrice.test.ts

// Integration Tests
src/features/bookings/__tests__/
  - BookingFlow.integration.test.ts
  - PaymentFlow.integration.test.ts

// E2E Tests
e2e/
  - customer-booking-flow.spec.ts
  - mover-acceptance-flow.spec.ts

// Target: 80% code coverage before scaling
```

### 4. **Add Monitoring & Observability**
```typescript
// Add Sentry for error tracking
npm install @sentry/react

// Add PostHog for product analytics
npm install posthog-js

// Add custom performance monitoring
src/lib/monitoring/
  - PerformanceMonitor.ts
    - Track booking completion time
    - Track API latencies
    - Track user funnel drop-offs
    - Alert on anomalies (e.g., spike in cancellations)
```

### 5. **Security Hardening**
```typescript
// Current Gaps:
- No rate limiting on API calls
- No input sanitization
- No CSRF protection
- No API key rotation

// Fixes:
- Add Supabase Edge Function rate limiting
- Add Zod schema validation on all inputs
- Add helmet.js for security headers
- Rotate API keys quarterly
- Add WAF (Cloudflare) in front of app

// Example: Input Validation
import { z } from 'zod'

const BookingSchema = z.object({
  pickup: z.string().min(5).max(200),
  dropoff: z.string().min(5).max(200),
  scheduledTime: z.date().min(new Date()),
  propertySize: z.enum(['Bedsitter', '1BR', '2BR', '3BR', '4BR', '5BR+'])
})

function validateBookingInput(input: unknown) {
  return BookingSchema.parse(input) // Throws if invalid
}
```

---

## 💰 BUSINESS MODEL RECOMMENDATIONS

### Revenue Streams
1. **Commission on Bookings** (Primary)
   - 15-20% of booking value
   - Tiered rates (higher volume → lower commission)

2. **Premium Mover Subscriptions**
   - $50/month: Priority placement in search
   - $100/month: Advanced analytics + lower commission (12%)

3. **Insurance Upsell**
   - Customer pays 5% extra for full damage coverage
   - You keep 2%, rest goes to insurance fund

4. **Corporate Partnerships**
   - B2B contracts with HR depts for employee relocations
   - Flat monthly fee + discounted per-move rate

5. **Advertising**
   - Featured movers (pay for top placement)
   - Partner ads (furniture stores, storage facilities)

### Pricing Strategy
```typescript
// Dynamic Pricing Tiers
Low Demand:  basePrice * 1.0   (attract customers)
Normal:      basePrice * 1.2   (standard)
High Demand: basePrice * 1.5   (surge, but not too high)
Peak:        basePrice * 2.0   (maximum surge, rare)

// Customer Acquisition Cost (CAC) Target: $10
// Lifetime Value (LTV) Target: $150 (10 moves at $15 commission each)
// Target LTV:CAC Ratio: 15:1
```

---

## 🎯 IMMEDIATE ACTION ITEMS (Next 30 Days)

### Week 1-2: Foundation
- [ ] Design complete database schema (all tables above)
- [ ] Set up development/staging/production environments
- [ ] Implement feature-based folder structure
- [ ] Add unit testing framework (Jest)
- [ ] Add error monitoring (Sentry)

### Week 3-4: Core Features
- [ ] Build mover registration wizard
- [ ] Implement mover profile pages
- [ ] Create booking request flow (customer → mover)
- [ ] Add basic push notifications (FCM setup)
- [ ] Integrate M-Pesa STK Push (test mode)

---

## 📈 SUCCESS METRICS TO TRACK

### Customer Metrics
- **Booking Conversion Rate**: % of quotes → actual bookings
- **Time to Book**: Minutes from quote to confirmed booking
- **Customer Retention**: % returning for 2nd move
- **NPS Score**: Net Promoter Score

### Mover Metrics
- **Acceptance Rate**: % of requests accepted by movers
- **Average Earnings**: Per mover per week
- **Mover Churn Rate**: % leaving platform per month
- **Online Hours**: Avg hours movers are available per day

### Platform Metrics
- **GMV (Gross Merchandise Value)**: Total booking value
- **Take Rate**: Your commission % of GMV
- **Liquidity**: Avg time for booking to be matched with mover
- **Completion Rate**: % of bookings that complete successfully

### Target Metrics (6 Months)
- **1000 active customers**
- **200 verified movers**
- **50 bookings per day**
- **$50K GMV per month**
- **$7.5K platform revenue per month** (15% commission)

---

## 🚨 RISKS & MITIGATION

### Risk 1: Mover Supply Problem
**Risk**: Not enough movers on platform → customers can't book  
**Mitigation**: 
- Aggressive mover recruitment (referral bonuses)
- Lower commission initially (10% for first 3 months)
- Guarantee minimum earnings per hour for early adopters

### Risk 2: Trust & Safety
**Risk**: Theft, damage, fraud by movers  
**Mitigation**:
- Mandatory background checks (CRB)
- Insurance requirement for all movers
- Escrow payment system (released after completion)
- Two-way ratings (movers can rate customers too)
- 24/7 support hotline

### Risk 3: Cash Burn
**Risk**: High CAC, slow revenue ramp  
**Mitigation**:
- Focus on organic growth (SEO, referrals)
- Start in 1-2 neighborhoods (dense urban areas)
- Expand only after proving unit economics

### Risk 4: Competition (Uber, Bolt entering moving space)
**Risk**: Deep-pocketed competitors copy your model  
**Mitigation**:
- Build strong mover relationships (loyalty programs)
- Focus on niche: only moving (not ride-hailing + moving)
- Build defensible moat: verified mover network, AI pricing

### Risk 5: Regulatory Compliance
**Risk**: NTSA regulations for commercial transport, PSV licensing requirements  
**Mitigation**:
- Consult with NTSA on platform compliance requirements
- Require all movers to have valid PSV permits (Public Service Vehicle)
- Include compliance checks in mover verification process
- Maintain updated documentation of all regulatory requirements
- Build relationships with transport authority officials

### Risk 6: Insurance & Liability
**Risk**: Damage to property, injuries during moves, insufficient coverage  
**Mitigation**:
- Require comprehensive mover insurance (minimum coverage thresholds)
- Platform insurance policy as backstop for catastrophic incidents
- Clear liability terms in user agreements (who pays what in different scenarios)
- **Critical**: Insurance upsell (see line 1655 - 5% customer premium for full damage coverage)
- Partner with insurance providers for platform-wide coverage

### Risk 7: Data Privacy Violations (Kenya DPA 2019)
**Risk**: Non-compliance with Kenya Data Protection Act, data breaches, GDPR violations  
**Mitigation**:
- Conduct Data Protection Impact Assessment (DPIA)
- Appoint Data Protection Officer (DPO)
- Regular security audits and penetration testing
- Comprehensive data breach response plan
- Encrypt all PII (Personally Identifiable Information)
- Clear consent mechanisms for data collection
- User data export/deletion capabilities (data subject rights)

### Risk 8: Chicken-and-Egg Problem (No supply → no demand)
**Risk**: Customers won't join without movers, movers won't join without customers  
**Mitigation**:
- **Pre-launch**: Secure 10-15 committed movers with signed contracts
- Guaranteed minimum earnings for first month (e.g., KES 30,000 minimum)
- Geo-fence initial launch to dense area (e.g., Westlands - see line 1923)
- Customer pre-registration with waitlist (build demand before launch)
- Launch with "invite-only" beta (controlled growth, ensure supply matches demand)
- Double-side incentives: customer referral bonus + mover referral bonus

---

## 🎓 RECOMMENDED LEARNING RESOURCES

### Real-Time Systems
- "Designing Data-Intensive Applications" by Martin Kleppmann
- Supabase Realtime docs: https://supabase.com/docs/guides/realtime

### Marketplace Dynamics
- "Platform Revolution" by Parker, Van Alstyne, Choudary
- "Blitzscaling" by Reid Hoffman

### Mobile Development
- React Native (consider switching from Capacitor for better performance)
- "Mobile Design Patterns" by Theresa Neil

### Payment Systems
- Safaricom M-Pesa Daraja API docs
- "Designing Secure Payment Systems" courses on Pluralsight

---

## 💡 COMPETITIVE POSITIONING

### Your Advantages
1. **Kenya-First**: Deep local knowledge (M-Pesa, local regulations)
2. **Niche Focus**: Only moving (not trying to be everything)
3. **AI Pricing**: Better price transparency vs. traditional movers
4. **Verified Network**: Rigorous mover screening

### Differentiation Strategy
- **"The Uber of Moving"** is baseline expectation
- **Your Unique Value Prop**: "Transparent, AI-Powered Moving with Verified Professionals"
- **Marketing Angle**: "No more haggling, no surprises, insurance included"

---

## 🎬 CONCLUSION

### You Have a STRONG MVP Foundation
Your current app is production-ready for a quote generation service. Good work on legal compliance and basic features.

### To Reach Uber-Parity, You Need:
1. **Two-sided marketplace** (biggest gap)
2. **Real-time infrastructure** (GPS, notifications)
3. **Payment automation** (M-Pesa critical)
4. **Dynamic pricing** (AI/ML required)
5. **Comprehensive testing** (cannot scale without this)

### Recommended Path Forward:
**Option A - Fast Growth**: Raise seed round ($200K-500K), hire 2-3 engineers, execute 12-month roadmap  
**Option B - Bootstrap**: Focus on Phase 1 (marketplace), launch in 1 neighborhood, prove model, then raise  

**My Recommendation**: **Option B** (Bootstrap)
- Validate demand before scaling infrastructure
- Prove unit economics in small market first
- Avoid premature optimization (don't build real-time tracking until you have 100 daily bookings)

### Next Call to Action:
1. **Prioritize database schema redesign** (foundation for everything)
2. **Build mover onboarding flow** (solve supply-side first)
3. **Implement basic booking flow** (no real-time yet, just request → accept)
4. **Launch in 1 area** (e.g., Westlands, Nairobi)
5. **Get 20 verified movers + 100 customers** (prove model)
6. **Then** build real-time features

---

**Final Thought**: You're building in a massive market (moving is $18B in Kenya). Your MVP is solid. Focus on marketplace dynamics first, technology scaling second. Uber didn't start with real-time tracking—they started with "get a black car on-demand." Build your core loop first, optimize later.

**Good luck! 🚀**

---
*Document prepared by AI Strategic Consultant*  
*For questions or implementation guidance, feel free to ask.*
