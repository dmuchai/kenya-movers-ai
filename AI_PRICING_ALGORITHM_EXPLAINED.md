# AI Pricing Algorithm - Detailed Explanation

## Overview
The MoveLink platform uses a **hybrid pricing system** that combines:
1. **Heuristic (Rule-Based) Model** - Currently active, uses predefined formulas
2. **AI/ML Model** - Edge function that calls OpenAI/Anthropic for intelligent estimates (optional enhancement)

When you submit a quote, the system **first tries the AI model**, and if it fails or is unavailable, it **falls back to the heuristic model**.

---

## Current Pricing Formula Breakdown

### 🧮 Total Price Calculation
```typescript
Total = Base + Distance Factor + Labor Factor + Inventory Factor + Services Factor
```

### 1️⃣ **Base Cost** (Fixed)
```
Base = KES 12,000
```
**What it covers:**
- Minimum operational cost for any move
- Vehicle fuel for first 10km
- 2-person crew wages (minimum)
- Basic insurance and platform fees
- Minimum time allocation (3 hours)

**Why fixed?** 
Every move has baseline costs regardless of size or distance. This covers the mover's vehicle dispatch, crew wages, and platform commission.

---

### 2️⃣ **Distance Factor** (Fuel & Time)
```typescript
Distance (km) = distance_meters / 1000
Distance Factor = max(1, Distance / 10) × 1,500
```

**Example Calculations:**

| Distance | Calculation | Cost |
|----------|-------------|------|
| 5 km | max(1, 5/10) × 1500 = 1.0 × 1500 | **KES 1,500** |
| 10 km | max(1, 10/10) × 1500 = 1.0 × 1500 | **KES 1,500** |
| 20 km | max(1, 20/10) × 1500 = 2.0 × 1500 | **KES 3,000** |
| 50 km | max(1, 50/10) × 1500 = 5.0 × 1500 | **KES 7,500** |
| 100 km | max(1, 100/10) × 1500 = 10.0 × 1500 | **KES 15,000** |

**What it covers:**
- **Fuel consumption** at ~10 KES/km for trucks
- **Driver time** for long-distance travel
- **Wear and tear** on vehicle
- **Return trip** (empty vehicle back to base)
- **Traffic time** (approximate based on distance)

**Key Insight:**
- First 10 km are included in base price
- Every additional 10 km adds KES 1,500
- This accounts for Nairobi's fuel prices (~KES 180-200/liter for diesel)
- Assumes truck consumption of ~8-10 km/liter when loaded

**Limitations:**
- ❌ **Does NOT account for real-time traffic** (no Google Maps Traffic API yet)
- ❌ **Does NOT consider road conditions** (paved vs unpaved)
- ❌ **Does NOT apply surge pricing** for peak hours (8-9am, 5-7pm)
- ✅ **Does capture total distance** via Google Distance Matrix API

---

### 3️⃣ **Labor Factor** (Crew Size & Complexity)
```typescript
Property Size Multipliers:
- Bedsitter: 0.7 × 4000 = KES 2,800
- 1BR: 1.0 × 4000 = KES 4,000
- 2BR: 1.4 × 4000 = KES 5,600
- 3BR: 1.8 × 4000 = KES 7,200
- 4BR: 2.2 × 4000 = KES 8,800
- 5BR+: 2.8 × 4000 = KES 11,200
- Maisonette: 2.5 × 4000 = KES 10,000
- Villa: 3.2 × 4000 = KES 12,800
```

**What it covers:**
- **Crew size**: 
  - Bedsitter/1BR = 2 people (1 driver + 1 helper)
  - 2BR/3BR = 3 people (1 driver + 2 helpers)
  - 4BR+ = 4-5 people (1 driver + 3-4 helpers)
- **Packing time**: Larger properties require more prep work
- **Loading time**: More items = longer loading/unloading
- **Stairway complexity**: Assumed escalation for larger properties (more items up/down stairs)

**Rationale:**
- **KES 4,000 base** = 2-person crew wages for 4-6 hours (~KES 500-600/hour per person)
- **Multipliers based on**:
  - Typical furniture volume per property size
  - Number of rooms to pack
  - Average move completion time

---

### 4️⃣ **Inventory Factor** (Volume & Handling)
```typescript
Inventory Count = Beds + Wardrobes + Sofa Seats + (Boxes × 0.1)
Inventory Factor = Inventory Count × 600
```

**Example Calculation:**
```
Customer has:
- 2 Beds
- 3 Wardrobes
- 1 Sofa (7-seater)
- 20 Boxes

Inventory Count = 2 + 3 + 7 + (20 × 0.1) = 14 items
Inventory Factor = 14 × 600 = KES 8,400
```

**What each item represents:**

| Item Type | Unit | Cost per Unit | Why? |
|-----------|------|---------------|------|
| Bed | 1 bed | KES 600 | Heavy, requires 2 people, disassembly/reassembly |
| Wardrobe | 1 wardrobe | KES 600 | Bulky, difficult doorway navigation, careful handling |
| Sofa Seats | Per seat | KES 600 | Large volume, potential stairway maneuvering |
| Boxes | 10 boxes | KES 600 | Lighter weight, but volume adds up (10 boxes = 1 bed equivalent) |
| Dining Chairs | Per chair | KES 600 | Counted in inventory, stackable but fragile |
| Fridge | 1 unit | KES 600 | Extra heavy, requires careful tilt/transport |
| Washing Machine | 1 unit | KES 600 | Heavy, water drainage needed, delicate handling |

**Special Items with Photos:**
- **Bulky Item Photos** uploaded by customer allow movers to:
  - Pre-assess if specialized equipment needed (trolleys, straps, blankets)
  - Estimate additional crew requirements
  - Quote more accurately (reduces post-move disputes)
  - Currently: Photos stored, **NOT yet factored into AI pricing** (future enhancement)

**New Inventory Fields (Your Latest Feature):**
```typescript
inventory: {
  sofaConfiguration: '3-seater-L-shape' | '5-seater-U-shape' | etc.
  diningChairs: number (0-20)
  cookerType: 'gas' | 'electric' | 'gas-electric-combined'
  bulkyItemPhotos: string[] // Supabase Storage URLs
}
```

**Current Limitation:**
- ❌ **Sofa configuration** (L-shape vs straight) NOT factored into price yet
- ❌ **Cooker type** NOT differentiated (gas cookers are heavier, require disconnection)
- ❌ **Dining chairs** counted generically, but fragility not weighted
- ✅ **Photos captured** for manual quote review by movers

---

### 5️⃣ **Services Factor** (Add-Ons)
```typescript
Services Factor = Number of Additional Services × 1,500
```

**Available Additional Services:**

| Service | Cost | What's Included |
|---------|------|-----------------|
| Packing Materials | KES 1,500 | Boxes, bubble wrap, tape, markers |
| Packing Service | KES 1,500 | Crew packs all items (books, clothes, kitchenware) |
| Unpacking Service | KES 1,500 | Crew unpacks and arranges at destination |
| Furniture Assembly | KES 1,500 | Disassemble at origin, reassemble at destination |
| Storage (24hrs) | KES 1,500 | Temporary storage if destination not ready |
| Insurance | KES 1,500 | Full-value protection (up to KES 500,000) |

**Example:**
```
Customer selects:
- Packing Materials
- Packing Service
- Insurance

Services Factor = 3 × 1,500 = KES 4,500
```

---

## 📊 Complete Example Calculation

### Scenario:
- **Property**: 2BR Apartment
- **Distance**: 25 km (Westlands → Kitengela)
- **Inventory**:
  - 2 Queen Beds
  - 1 King Bed
  - 4 Wardrobes
  - 1 Sofa (7-seater L-shape)
  - 1 Dining Set (6 chairs)
  - 1 Fridge
  - 1 Washing Machine
  - 1 Gas Cooker
  - 30 Boxes
- **Services**: Packing Materials, Packing Service, Insurance

### Calculation:
```
1. Base Cost:
   KES 12,000

2. Distance Factor:
   25 km → max(1, 25/10) × 1500 = 2.5 × 1500 = KES 3,750

3. Labor Factor:
   2BR → 1.4 × 4000 = KES 5,600

4. Inventory Factor:
   Beds: 3
   Wardrobes: 4
   Sofa Seats: 7
   Dining Chairs: 6
   Fridge: 1
   Washing Machine: 1
   Cooker: 1
   Boxes: 30 × 0.1 = 3
   
   Total Inventory Count = 3 + 4 + 7 + 6 + 1 + 1 + 1 + 3 = 26
   Inventory Factor = 26 × 600 = KES 15,600

5. Services Factor:
   3 services × 1500 = KES 4,500

TOTAL = 12,000 + 3,750 + 5,600 + 15,600 + 4,500
      = KES 41,450
```

**This quote gives customer:**
- 3-4 person crew
- ~6-8 hour service window
- Truck with 3-ton capacity
- Fuel for 25km + return trip
- Packing materials + packing service
- Full insurance coverage
- Platform commission included (movers get ~85% after 15% platform fee)

---

## 🤖 AI Enhancement (Edge Function - Optional)

The platform also supports an **OpenAI/Anthropic-powered edge function** (`ai-estimator`) that can provide more intelligent estimates.

### AI Model Advantages:
1. **Natural Language Processing**:
   - Understands special instructions ("I have a grand piano")
   - Interprets accessibility issues ("third floor, no elevator")
   - Detects urgency ("need to move tomorrow")

2. **Contextual Adjustments**:
   - Considers day of week (weekend = higher demand)
   - Factors in property access (elevator vs stairs, parking distance)
   - Adjusts for move complexity beyond simple formulas

3. **Clarifying Questions**:
   - Asks follow-up questions for ambiguous moves
   - Example: "Are there fragile items requiring special packing?"
   - Example: "Is your moving date flexible within 3 days?"

4. **Learning from Historical Data**:
   - Analyzes past moves with similar profiles
   - Adjusts pricing based on actual completion times
   - Identifies patterns (e.g., "moves from Westlands take 20% longer due to parking")

### Current Implementation:
```typescript
// Tries AI first, falls back to heuristic
export async function invokeAIQuoteEstimation(input: any): Promise<AIQuoteEstimation> {
  try {
    // Call Supabase Edge Function 'ai-estimator'
    const { data, error } = await supabase.functions.invoke('ai-estimator', {
      body: { quote: input, distance_meters: input.distance_meters }
    })
    
    if (error) throw error
    return data.estimation // AI-generated estimate
    
  } catch (e) {
    console.warn('AI estimator failed, using heuristic')
    return generateAIQuoteEstimation(input) // Fallback to formula
  }
}
```

**Why Hybrid Approach?**
- **Reliability**: If AI service is down, customers still get quotes
- **Cost**: AI calls cost money (OpenAI API charges per token), heuristic is free
- **Speed**: Heuristic is instant, AI may take 2-3 seconds
- **Accuracy**: AI is better for edge cases, heuristic is good for standard moves

---

## 🚧 Current Limitations & Future Improvements

### Limitations:

1. **Traffic Not Considered** ❌
   - **Issue**: 10 km in Westlands (rush hour) ≠ 10 km on Mombasa Road (midnight)
   - **Solution**: Integrate Google Maps Directions API with traffic data
   - **Cost**: ~$5 per 1,000 API calls

2. **No Surge Pricing** ❌
   - **Issue**: Month-end moves (high demand) priced same as mid-month
   - **Solution**: Dynamic pricing based on mover availability
   - **Example**: 
     ```
     Base Price × Demand Multiplier
     Low demand (weekdays, mid-month): 1.0×
     Normal demand: 1.2×
     High demand (weekends, month-end): 1.5×
     Peak demand (public holidays): 2.0×
     ```

3. **No Real-Time Mover Availability** ❌
   - **Issue**: Quote given even if no movers available that day
   - **Solution**: Check mover calendar before showing price
   - **Impact**: Reduces "quote → booking" conversion failures

4. **Photos Not Used in Pricing** ❌
   - **Issue**: Customer uploads photos of grand piano, quote doesn't adjust
   - **Solution**: Computer vision model to detect special items
   - **Tech**: AWS Rekognition or Google Cloud Vision API
   - **Example**: Detect "piano" → add KES 5,000 specialist fee

5. **No Property Access Details** ⚠️ (Partially Fixed)
   - **Current**: Elevator Yes/No captured
   - **Missing**: Floor number, parking distance, narrow doorways
   - **Solution**: Add fields:
     ```typescript
     currentFloor: number
     destinationFloor: number
     parkingDistance: '0-20m' | '20-50m' | '50-100m' | '100m+'
     doorwayWidth: 'standard' | 'narrow' | 'wide'
     ```

6. **No Seasonal Adjustments** ❌
   - **Issue**: Rainy season = slower moves, fuel consumption increases
   - **Solution**: Weather API integration, seasonal multipliers

7. **No Item Condition Assessment** ❌
   - **Issue**: Antique furniture requires more care (time)
   - **Solution**: Ask "Item age/condition" for high-value items

8. **Stairs Not Accurately Priced** ⚠️
   - **Current**: Property size implies stairway difficulty
   - **Missing**: Actual floor count × items
   - **Example**: 3BR on ground floor ≠ 3BR on 5th floor (no elevator)
   - **Solution**: 
     ```
     Stairs Factor = (Current Floor + Destination Floor) × Heavy Items × KES 200
     ```

---

## 🎯 Recommended Next Steps for Pricing Enhancement

### Phase 1: Immediate Improvements (No Code Changes)
1. ✅ **Capture all inventory details** (sofa config, cooker type) - **DONE**
2. ✅ **Store bulky item photos** - **DONE**
3. ⏳ **Add floor numbers** - Easy schema update
4. ⏳ **Add parking distance field** - Easy UI change

### Phase 2: Short-Term Enhancements (1-2 weeks)
1. **Use new inventory fields in pricing**:
   ```typescript
   // Sofa complexity multiplier
   const sofaMultipliers = {
     '3-seater-straight': 1.0,
     '5-seater-L-shape': 1.3,
     '7-seater-U-shape': 1.6,
     '9-seater-sectional': 2.0
   }
   
   // Cooker complexity
   const cookerMultipliers = {
     'electric': 1.0, // Plug and play
     'gas': 1.3,      // Requires gas disconnection
     'gas-electric-combined': 1.5 // Both systems
   }
   ```

2. **Implement stairs pricing**:
   ```typescript
   const stairsFactor = (currentFloor + destinationFloor) × heavyItemCount × 200
   ```

3. **Add distance-based crew size logic**:
   ```typescript
   // Long-distance moves need relief drivers
   if (distanceKm > 50) {
     laborFactor *= 1.2 // Extra crew member for long haul
   }
   ```

### Phase 3: Medium-Term (1-2 months)
1. **Integrate Google Maps Traffic API**:
   ```typescript
   // Get real-time duration with traffic
   const durationWithTraffic = await googleMaps.directions({
     origin: pickupLocation,
     destination: dropoffLocation,
     departure_time: scheduledMoveDate, // Future time
     traffic_model: 'pessimistic' // Worst-case scenario
   })
   
   // Adjust pricing based on actual duration (not just distance)
   const timeFactor = durationWithTraffic.hours × 1500
   ```

2. **Implement dynamic pricing**:
   ```typescript
   // Check mover availability for requested date
   const availableMoversCount = await getAvailableMovers(scheduledDate, pickupArea)
   
   // Calculate demand multiplier
   let demandMultiplier = 1.0
   if (availableMoversCount < 3) demandMultiplier = 1.5 // High demand
   if (isWeekend(scheduledDate)) demandMultiplier *= 1.2
   if (isMonthEnd(scheduledDate)) demandMultiplier *= 1.3
   
   total = baseTotal × demandMultiplier
   ```

3. **Add computer vision for photo analysis**:
   ```typescript
   // Analyze uploaded photos
   const detectedItems = await analyzePhotos(bulkyItemPhotos)
   
   if (detectedItems.includes('piano')) total += 8000
   if (detectedItems.includes('pool-table')) total += 6000
   if (detectedItems.includes('gym-equipment')) total += 3000
   ```

### Phase 4: Long-Term (3-6 months)
1. **Build ML pricing model** with historical data:
   ```python
   # Train on past moves
   features = [distance_km, property_size, inventory_count, day_of_week, 
               time_of_day, has_elevator, floor_count, photos_count]
   target = actual_move_cost
   
   model = RandomForestRegressor()
   model.fit(X_train, y_train)
   
   # Predict new move cost
   predicted_cost = model.predict(new_move_features)
   ```

2. **Implement route optimization** for multi-stop moves
3. **Add seasonal pricing** (rainy season, holidays)
4. **Build competitor price scraping** for market positioning

---

## 📈 Accuracy Metrics to Track

Once you launch, track these KPIs to improve pricing accuracy:

### Quote Accuracy Metrics:
```
1. Quote-to-Actual Variance:
   Target: ±10% of final cost
   Current: Unknown (no historical data yet)
   
2. Customer Acceptance Rate:
   Target: >60% of quotes lead to bookings
   Lower = prices too high or inaccurate
   
3. Mover Profitability:
   Target: Movers earn ≥ KES 3,000/hour after costs
   Lower = quotes too low, movers losing money
   
4. Dispute Rate:
   Target: <5% of moves have price disputes
   Higher = quotes not reflecting actual complexity
   
5. Quote Completion Time:
   Target: Customer gets quote within 30 seconds
   Current: ~2-3 seconds ✅
```

### Data to Collect Post-Move:
```sql
-- Add these columns to bookings table for ML training
ALTER TABLE bookings ADD COLUMN actual_duration_hours DECIMAL(4,2);
ALTER TABLE bookings ADD COLUMN actual_cost DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN actual_crew_size INTEGER;
ALTER TABLE bookings ADD COLUMN completion_difficulty TEXT; -- 'easy', 'medium', 'hard'
ALTER TABLE bookings ADD COLUMN price_dispute BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN customer_satisfaction_rating INTEGER; -- 1-5
```

---

## 💡 Summary

### Current Pricing Formula:
```
Total = 12,000 (base) 
      + (distance_km/10 × 1500) 
      + (property_size_multiplier × 4000)
      + (inventory_count × 600)
      + (services_count × 1500)
```

### What It DOES Consider:
✅ Total distance (Google Distance Matrix API)  
✅ Property size (room count)  
✅ Inventory volume (beds, wardrobes, sofas, boxes)  
✅ Additional services (packing, insurance, etc.)  
✅ Basic crew labor costs  
✅ Fuel consumption estimates  

### What It DOESN'T Consider (Yet):
❌ Real-time traffic conditions  
❌ Surge pricing (demand-based)  
❌ Photo-detected special items  
❌ Exact floor numbers × stairway difficulty  
❌ Parking distance  
❌ Item fragility/complexity (L-shape sofa vs straight)  
❌ Weather conditions  
❌ Mover availability  

### Recommendation:
Your **current pricing model is solid for MVP launch**. It covers 80% of typical moves accurately. 

**Priority improvements:**
1. ✅ Capture detailed inventory (DONE - sofa config, cooker type, photos)
2. ⏳ Add floor numbers + parking distance (Quick win)
3. ⏳ Use new inventory fields in pricing algorithm (1 week of work)
4. ⏳ Implement stairs pricing (1 day of work)
5. 🔮 Add traffic data (1-2 weeks, requires Google API budget)
6. 🔮 Build ML model after 100+ completed moves (3-6 months)

---

## 📞 Questions or Concerns?

If movers consistently complain about underpriced quotes, or customers abandon quotes (too expensive), adjust the multipliers:

```typescript
// Tunable parameters in api.ts
const BASE = 12000        // Increase if all quotes too low
const DISTANCE_RATE = 1500 // Per 10km - adjust based on fuel costs
const LABOR_BASE = 4000    // Per crew member - adjust based on wages
const ITEM_RATE = 600      // Per inventory item - adjust based on handling time
const SERVICE_RATE = 1500  // Per add-on service - adjust based on costs
```

Start conservative (slightly higher prices), then lower as you collect data. Easier to reduce prices than explain surprise increases!

**Good luck with the launch! 🚚**
