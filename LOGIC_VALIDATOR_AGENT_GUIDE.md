# Logic Validator Agent - Comprehensive Guide

**Version:** 1.0
**Date:** November 10, 2025
**Purpose:** Validate business logic consistency across the Toosila ride-sharing platform

---

## Table of Contents

1. [Mission & Responsibilities](#mission--responsibilities)
2. [Complete Workflow Understanding](#complete-workflow-understanding)
3. [Business Logic Rules](#business-logic-rules)
4. [User Role Permissions Matrix](#user-role-permissions-matrix)
5. [Validation Checklist](#validation-checklist)
6. [Common Logical Issues](#common-logical-issues)
7. [Database Schema Understanding](#database-schema-understanding)

---

## Mission & Responsibilities

### Core Mission
Ensure the Toosila ride-sharing platform maintains logical consistency across all workflows, user interactions, and business rules. Identify contradictions, impossible states, and workflow breaks that would confuse users or create unreasonable experiences.

### Key Responsibilities
1. **Workflow Validation** - Verify all user journeys are logically sound
2. **State Management** - Ensure entity states (offers, demands, bookings) transition correctly
3. **Permission Enforcement** - Validate role-based access controls
4. **Data Integrity** - Check for logical contradictions in data relationships
5. **UX Logic** - Identify unreasonable user experiences

---

## Complete Workflow Understanding

### 1. STANDARD OFFER WORKFLOW (Driver → Rider)

**STEP 1: Driver Posts Offer**
- Driver creates offer with:
  - Route: from_city → to_city
  - Departure time (specific timestamp)
  - Available seats
  - Price per seat
- Offer stored in `offers` table
- Offer is active by default (`is_active = true`)

**STEP 2: Rider Discovers Offer**
- Rider views offers page
- Can filter by: city, date, price range, seat count
- If rider is a driver account: **LOGICAL ISSUE** - Should drivers see offers or demands?

**STEP 3: Rider Books Offer**
- Rider clicks "Book Now" on an offer
- Creates booking in `bookings` table:
  - Status: 'pending'
  - References: offer_id, passenger_id
  - Seats requested: default 1 (hardcoded in ViewOffers.js line 245)
- **IMPORTANT**: No seat validation happens at booking creation!
- Driver receives notification (Socket.io)

**STEP 4: Driver Reviews Booking**
- Driver sees booking in "Bookings Received" tab
- Can: Accept (status → 'confirmed') or Reject (status → 'cancelled')
- **SEAT MANAGEMENT**: When does seat count decrease? (Validation needed)

**STEP 5: Ride Completion & Rating**
- After ride completes, both can rate each other
- Rating stored in `ratings` table
- Booking status → 'completed'

---

### 2. INVERSE DEMAND WORKFLOW (Rider → Driver)

**STEP 1: Rider Posts Demand**
- Rider creates demand with:
  - Route: from_city → to_city
  - Time range: earliest_time → latest_time (flexible window)
  - Seats needed
  - Budget maximum (optional)
- Demand stored in `demands` table
- Demand is active by default (`is_active = true`)

**STEP 2: Driver Discovers Demand**
- Driver views demands page (/demands)
- Can filter by: city, date range
- **ROUTING ISSUE**: Home.js line 124-127 shows drivers see demands, passengers see offers

**STEP 3: Driver Responds to Demand**
- Driver clicks "Send Offer" on demand
- Creates demand_response in `demand_responses` table:
  - offer_price: Driver's proposed price
  - available_seats: Driver's available seats
  - message: Optional message
  - status: 'pending'
- **DUPLICATE CHECK**: Database prevents duplicate responses (UNIQUE constraint)
- Rider receives notification

**STEP 4: Rider Reviews Responses**
- Rider views responses in demands page
- Can: Accept one response, Reject responses
- **AUTO-REJECTION LOGIC**: When rider accepts one response, all others auto-reject (demandResponses.controller.js line 233-242)
- **DEMAND DEACTIVATION**: Demand becomes inactive when response accepted (line 245)

**STEP 5: Ride Completion & Rating**
- Similar to offer workflow
- Both parties can rate after completion

---

### 3. USER ROLES & CAPABILITIES

#### Passenger (Rider) Role
**Can:**
- View offers (driver's posted rides)
- Book offers
- Post demands (ride requests)
- View responses to their demands
- Accept/reject demand responses
- Rate drivers after rides
- Send messages
- Cancel their own bookings (when pending/confirmed)

**Cannot:**
- Post offers (that's for drivers)
- Respond to demands (that's for drivers)
- Book their own offers (n/a)
- Accept bookings (they make bookings, not receive them)

#### Driver Role
**Can:**
- Post offers (available rides)
- View demands (rider requests)
- Respond to demands with counter-offers
- View booking requests on their offers
- Accept/reject bookings
- Rate passengers after rides
- Send messages
- Cancel/deactivate own offers

**Cannot:**
- Book offers (they create offers, not book them)
- Post demands (that's for riders)
- Accept demand responses (they create responses, not receive them)

---

## Business Logic Rules

### Rule 1: User Role Consistency
**Rule:** A user's `is_driver` status must determine what actions they can perform.

**Validation:**
- If `user.isDriver = true`: Should NOT be able to book offers
- If `user.isDriver = false`: Should NOT be able to post offers or respond to demands
- **FOUND IN CODE**: ViewOffers.js line 199-202 blocks drivers from booking (CORRECT)
- **ISSUE**: Home.js allows any user to switch modes (line 269-310), but validation happens later

### Rule 2: Entity Ownership
**Rule:** Users can only modify their own entities.

**Validation:**
- Offer: Only `offer.driver_id` can edit/delete
- Demand: Only `demand.passenger_id` can edit/delete
- Booking: Only passenger can cancel, only driver can accept/reject
- Demand Response: Only driver who created it can modify
- **FOUND IN CODE**: Controllers enforce this (offers.controller.js line 91-93)

### Rule 3: Status Transitions
**Rule:** Entity statuses must follow valid state machines.

**Bookings Status Flow:**
```
pending → confirmed (driver accepts)
pending → cancelled (driver rejects OR passenger cancels)
confirmed → completed (ride happens)
confirmed → cancelled (cancellation)
```

**INVALID TRANSITIONS:**
- completed → pending (cannot undo completion)
- cancelled → confirmed (cannot un-cancel)
- **VALIDATION NEEDED**: Check if code prevents invalid transitions

**Demand Response Status Flow:**
```
pending → accepted (rider accepts)
pending → rejected (rider rejects OR auto-rejected)
pending → cancelled (driver cancels own response)
```

**INVALID TRANSITIONS:**
- accepted → pending (cannot undo acceptance)
- accepted → deleted (line 297-298 blocks this - CORRECT)

### Rule 4: Seat Management
**Rule:** Available seats must decrease when bookings are accepted, increase when cancelled.

**Critical Questions:**
1. When does seat count decrease?
   - At booking creation? (RISKY - pending bookings reduce availability)
   - At booking acceptance? (SAFER - only confirmed bookings reduce availability)
2. What if seats run out while booking is pending?
3. Race condition: Multiple users booking last seat?

**VALIDATION NEEDED**: Trace seat management logic in codebase

### Rule 5: Duplicate Prevention
**Rule:** Users cannot perform the same action twice on the same entity.

**Database Constraints:**
- `bookings`: UNIQUE(offer_id, passenger_id) - prevents double-booking
- `demand_responses`: UNIQUE(demand_id, driver_id) - prevents duplicate responses
- `ratings`: UNIQUE(ride_id, from_user_id) - prevents duplicate ratings

**Application Logic:**
- demandResponses.controller.js line 34-42 checks for existing response (CORRECT)
- **QUESTION**: Does booking creation check seat availability?

### Rule 6: Time Logic
**Rule:** Ride times must be in the future and logically consistent.

**Validations Needed:**
- Offer departure_time > current time (prevents past rides)
- Demand earliest_time < latest_time (ensures valid range)
- Demand latest_time > current time (no point in expired demands)

**FOUND ISSUE**: Home.js line 147-149 creates latestTime = earliestTime + 2 days (reasonable)
**MISSING**: No validation that earliest_time is in the future

### Rule 7: Price Logic
**Rule:** Prices must be reasonable and consistent.

**Validations:**
- Offer price > 0 (no free rides in production)
- Demand budget_max > 0 (if specified)
- Demand response offer_price should be ≤ demand.budget_max (WARNING only, line 45-53)

**FOUND**: Code warns but allows higher prices (demandResponses.controller.js line 45-53)

### Rule 8: Notification Consistency
**Rule:** Users should be notified of actions relevant to them.

**When to Notify:**
- Rider books offer → notify driver
- Driver responds to demand → notify rider
- Driver accepts/rejects booking → notify rider
- Rider accepts/rejects response → notify driver

**FOUND IN CODE**: Socket.io notifications implemented (bookings.controller.js line 35-43)

---

## User Role Permissions Matrix

| Action | Passenger Can Do | Driver Can Do | Notes |
|--------|-----------------|---------------|-------|
| **POST Offer** | ❌ No | ✅ Yes | Driver creates available rides |
| **View Offers** | ✅ Yes | ❌ Should Not | **ISSUE**: Home routing logic unclear |
| **Book Offer** | ✅ Yes | ❌ No | ViewOffers.js blocks drivers (line 199) |
| **Accept/Reject Booking** | ❌ No | ✅ Yes | Only offer owner (driver) |
| **Cancel Own Booking** | ✅ Yes | ❌ N/A | Passenger can cancel pending/confirmed |
| **POST Demand** | ✅ Yes | ❌ Should Not | **ISSUE**: Home allows anyone to post |
| **View Demands** | ❌ Should Not | ✅ Yes | **ISSUE**: Who should see demands page? |
| **Respond to Demand** | ❌ No | ✅ Yes | Driver sends counter-offer |
| **Accept/Reject Response** | ✅ Yes | ❌ No | Only demand owner (passenger) |
| **Rate Other User** | ✅ Yes (after ride) | ✅ Yes (after ride) | Both can rate |
| **Send Messages** | ✅ Yes | ✅ Yes | Both can message |
| **View Own Bookings** | ✅ Yes | ✅ Yes | Different tabs: sent/received |

---

## Validation Checklist

### 1. Workflow Logic Validation

#### Offer Workflow
- [ ] Driver can only post offers if `is_driver = true`
- [ ] Passenger cannot see "Post Offer" option
- [ ] Booking creation checks seat availability
- [ ] Seat count decreases atomically (no race conditions)
- [ ] Driver can accept/reject only their own offer's bookings
- [ ] Accepted booking prevents double-acceptance
- [ ] Cancelled booking restores seats to offer

#### Demand Workflow
- [ ] Passenger can only post demands if `is_driver = false`
- [ ] Driver cannot see "Post Demand" option
- [ ] Response creation prevents duplicates
- [ ] Accepting one response auto-rejects others
- [ ] Accepted response deactivates demand
- [ ] Response price validation against budget
- [ ] Driver cannot respond to own demand (if role switching allowed)

### 2. State Machine Validation
- [ ] Booking status transitions follow valid flow
- [ ] No invalid status transitions (e.g., completed → pending)
- [ ] Response status transitions follow valid flow
- [ ] Offers can be deactivated but not deleted
- [ ] Demands can be deactivated but not deleted

### 3. Permission Validation
- [ ] Users can only edit/delete own entities
- [ ] Admin can modify any entity (if admin role exists)
- [ ] Drivers cannot book offers
- [ ] Passengers cannot respond to demands
- [ ] Role verification on both frontend and backend

### 4. Data Integrity Validation
- [ ] All foreign keys valid (offer_id, passenger_id, etc.)
- [ ] Unique constraints prevent duplicates
- [ ] Required fields are never null
- [ ] Price values are positive
- [ ] Seat counts are positive integers (1-7)
- [ ] Timestamps are in valid format and future-dated

### 5. UI/UX Logic Validation
- [ ] User sees appropriate pages for their role
- [ ] Button labels match their actions
- [ ] Success messages are accurate
- [ ] Error messages are helpful
- [ ] Loading states shown during async operations
- [ ] Navigation makes sense for user role

### 6. Edge Case Validation
- [ ] User tries to book offer with 0 seats available
- [ ] User tries to book own offer (if role switching)
- [ ] User tries to cancel already-cancelled booking
- [ ] Driver accepts booking after offer expired
- [ ] Multiple responses accepted simultaneously (race condition)
- [ ] Seat count goes negative
- [ ] Price is negative or zero
- [ ] Time is in the past

---

## Common Logical Issues

### Issue Type 1: Role Confusion
**Description:** User interface shows options inappropriate for user role.

**Examples:**
- Driver sees "Book Offer" button
- Passenger sees "Post Offer" button
- Driver lands on offers page instead of demands page

**Detection Method:**
- Check routing logic in Home.js (line 124-127)
- Check button rendering conditions (ViewOffers.js line 1082)
- Verify backend permission checks in controllers

### Issue Type 2: State Inconsistency
**Description:** Entity state doesn't match its actual status.

**Examples:**
- Booking shows "pending" but driver already accepted
- Offer shows 3 seats available but bookings total 5 seats
- Demand is "active" but response was already accepted

**Detection Method:**
- Check state update logic in controllers
- Verify database triggers/constraints
- Test concurrent actions

### Issue Type 3: Permission Bypass
**Description:** User can perform actions they shouldn't be allowed to.

**Examples:**
- Passenger bypasses frontend check and posts offer via API
- Driver accepts booking for someone else's offer
- User edits another user's entity

**Detection Method:**
- Test API endpoints directly with wrong user roles
- Check controller permission checks (line 91-93 in offers.controller)
- Verify ownership checks before mutations

### Issue Type 4: Race Conditions
**Description:** Concurrent actions create inconsistent state.

**Examples:**
- Two users book last seat simultaneously
- Seat count goes negative
- Response accepted while being rejected

**Detection Method:**
- Simulate concurrent API calls
- Check for database transactions
- Verify atomic operations (forUpdate locks)

**Known Issue from QA Report:** P1-01 Concurrent Booking Race Condition (MVP_QA_TESTING_REPORT.md line 513-540)

### Issue Type 5: Missing Validations
**Description:** System allows logically invalid data.

**Examples:**
- Offer created with past departure_time
- Demand with earliest_time > latest_time
- Negative price or seat count
- Empty city names

**Detection Method:**
- Check validation middleware (validate.js)
- Test boundary conditions
- Submit invalid data via API

### Issue Type 6: Workflow Breaks
**Description:** User journey cannot be completed logically.

**Examples:**
- User books offer but cannot message driver
- User accepts demand response but no booking created
- User completes ride but cannot rate
- Notification leads to non-existent page

**Detection Method:**
- Walk through complete user journeys
- Test every link and button
- Verify notification actions

### Issue Type 7: Contradictory Business Rules
**Description:** System implements conflicting rules.

**Examples:**
- "Drivers view offers" vs "Drivers respond to demands"
- "Accept booking" doesn't check seat availability
- "Auto-reject responses" but doesn't notify drivers
- Demand has budget_max but higher prices allowed

**Detection Method:**
- Document all business rules
- Identify conflicts
- Verify with product requirements

---

## Database Schema Understanding

### Key Tables & Relationships

#### `users` table
```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- is_driver (BOOLEAN) -- Critical role field
- rating_avg (DECIMAL)
- rating_count (INTEGER)
```

**Logical Constraint:** User cannot be both driver and passenger (no dual-role support)

#### `offers` table
```sql
- id (UUID, PK)
- driver_id (UUID, FK → users.id)
- from_city (VARCHAR)
- to_city (VARCHAR)
- departure_time (TIMESTAMPTZ) -- Specific time
- seats (INTEGER) -- Available seats
- price (DECIMAL) -- Price per seat
- is_active (BOOLEAN)
```

**Logical Constraints:**
- driver_id must reference user with is_driver = true
- departure_time should be > NOW()
- seats should be > 0
- price should be > 0

#### `demands` table
```sql
- id (UUID, PK)
- passenger_id (UUID, FK → users.id)
- from_city (VARCHAR)
- to_city (VARCHAR)
- earliest_time (TIMESTAMPTZ) -- Start of window
- latest_time (TIMESTAMPTZ) -- End of window
- seats (INTEGER) -- Seats needed
- budget_max (DECIMAL, nullable) -- Max price willing to pay
- is_active (BOOLEAN)
```

**Logical Constraints:**
- passenger_id must reference user with is_driver = false
- earliest_time < latest_time
- latest_time should be > NOW()
- seats should be > 0

#### `bookings` table
```sql
- id (UUID, PK)
- offer_id (UUID, FK → offers.id)
- passenger_id (UUID, FK → users.id)
- status (VARCHAR) -- pending, confirmed, cancelled, completed
- UNIQUE(offer_id, passenger_id) -- Prevents double booking
```

**Logical Constraints:**
- passenger_id ≠ offer.driver_id (user can't book own offer)
- Sum of confirmed bookings.seats ≤ offer.seats
- Status transitions must be valid

#### `demand_responses` table
```sql
- id (UUID, PK)
- demand_id (UUID, FK → demands.id)
- driver_id (UUID, FK → users.id)
- offer_price (DECIMAL)
- available_seats (INTEGER, CHECK >= 1 AND <= 7)
- status (VARCHAR) -- pending, accepted, rejected, cancelled
- UNIQUE(demand_id, driver_id) -- Prevents duplicate responses
```

**Logical Constraints:**
- driver_id ≠ demand.passenger_id (user can't respond to own demand)
- available_seats ≥ demand.seats (driver must have enough seats)
- Only one response can be 'accepted' per demand

#### `ratings` table
```sql
- id (UUID, PK)
- ride_id (UUID) -- Could be offer_id or demand_id
- from_user_id (UUID, FK → users.id)
- to_user_id (UUID, FK → users.id)
- rating (INTEGER, CHECK >= 1 AND <= 5)
- comment (TEXT)
- UNIQUE(ride_id, from_user_id) -- Prevents duplicate ratings
```

**Logical Constraints:**
- from_user_id ≠ to_user_id (user can't rate themselves)
- ride_id must reference completed booking

---

## Validation Process

### Step 1: Code Review
1. Read all controller files (offers, demands, bookings, demandResponses)
2. Read all model files to understand data access patterns
3. Read frontend pages (Home, ViewOffers, ViewDemands, Bookings)
4. Map out user flows from UI to API to database

### Step 2: Business Logic Analysis
1. List all business rules found in code
2. Identify contradictions
3. Check against real-world ride-sharing expectations
4. Document unreasonable behaviors

### Step 3: Permission Audit
1. For each API endpoint, verify role checks
2. Test cross-role actions (driver booking, passenger responding)
3. Check ownership validation
4. Test admin override capabilities

### Step 4: State Machine Verification
1. Document all possible states for each entity
2. Document valid state transitions
3. Find invalid transitions in code
4. Test edge cases

### Step 5: Data Integrity Check
1. Verify all foreign keys
2. Check unique constraints
3. Test boundary values
4. Simulate race conditions
5. Test cascading deletes

### Step 6: User Journey Testing
1. Walk through complete offer workflow
2. Walk through complete demand workflow
3. Test cross-workflow interactions
4. Test error recovery
5. Test notification flows

### Step 7: Report Generation
Document all findings in LOGIC_ISSUES_FOUND.md with:
- Issue description
- Why it's unreasonable/illogical
- Where it occurs (file:line)
- Severity (Critical/High/Medium/Low)
- Recommended fix

---

## Quick Reference: Key Files

### Backend Controllers
- `server/controllers/offers.controller.js` - Offer CRUD operations
- `server/controllers/demands.controller.js` - Demand CRUD operations
- `server/controllers/bookings.controller.js` - Booking management
- `server/controllers/demandResponses.controller.js` - Driver responses to demands

### Frontend Pages
- `client/src/pages/Home.js` - Main entry, mode selection, routing logic
- `client/src/pages/offers/ViewOffers.js` - Browse and book offers
- `client/src/pages/demands/ViewDemands.js` - Browse demands, send responses
- `client/src/pages/Bookings.js` - Manage bookings (sent/received)

### Database
- `server/scripts/init-db.sql` - Schema definition with constraints

### Key Logic Locations
- **Role-based routing**: Home.js lines 124-127
- **Driver blocking from booking**: ViewOffers.js lines 199-202
- **Duplicate response check**: demandResponses.controller.js lines 34-42
- **Auto-reject responses**: demandResponses.controller.js lines 233-242
- **Seat management**: bookings.controller.js (trace createBooking)
- **Ownership checks**: All controllers (pattern: `if offer.driverId !== req.user.id`)

---

## Success Criteria

A logically consistent system should have:

1. ✅ **Clear Role Separation** - Drivers and passengers have distinct, non-overlapping workflows
2. ✅ **Valid State Transitions** - No entity can enter an invalid state
3. ✅ **Enforced Permissions** - Users cannot perform unauthorized actions
4. ✅ **Data Integrity** - All foreign keys valid, no orphaned records
5. ✅ **Reasonable UX** - User interface matches user role and expectations
6. ✅ **Race Condition Safety** - Concurrent actions don't corrupt data
7. ✅ **Complete Workflows** - Every user journey can reach its conclusion
8. ✅ **Consistent Business Rules** - No contradictions in requirements

---

**END OF LOGIC VALIDATOR AGENT GUIDE**

**Next Steps:** Use this guide to perform systematic logic validation. Document all issues found in LOGIC_ISSUES_FOUND.md.
