# Toosila Workflow Documentation

**Version:** 1.0
**Date:** November 10, 2025
**Purpose:** Complete step-by-step documentation of all workflows in the Toosila ride-sharing platform

---

## Table of Contents

1. [Introduction](#introduction)
2. [User Roles Overview](#user-roles-overview)
3. [Workflow 1: Rider Finds Ride (Standard Offer Flow)](#workflow-1-rider-finds-ride-standard-offer-flow)
4. [Workflow 2: Driver Offers Ride (Inverse Demand Flow)](#workflow-2-driver-offers-ride-inverse-demand-flow)
5. [Workflow 3: Matching & Booking Process](#workflow-3-matching--booking-process)
6. [Workflow 4: Post-Ride Rating Flow](#workflow-4-post-ride-rating-flow)
7. [Workflow 5: Messaging Between Users](#workflow-5-messaging-between-users)
8. [Workflow Diagrams (Text-Based)](#workflow-diagrams-text-based)
9. [Business Rules Summary](#business-rules-summary)
10. [Common User Paths](#common-user-paths)

---

## Introduction

Toosila is a ride-sharing platform connecting drivers and passengers in Iraq. The platform supports two primary workflows:

1. **Standard Offer Flow:** Driver posts available ride → Passenger searches and books → Driver accepts/rejects
2. **Inverse Demand Flow:** Passenger posts ride request → Driver sees request and responds → Passenger accepts/rejects response

This document provides detailed step-by-step instructions for every workflow in the system.

---

## User Roles Overview

### Passenger (Rider)
**Definition:** A user who needs a ride from point A to point B.

**Account Type:** `is_driver = false`

**Primary Actions:**
- Browse available rides (offers) posted by drivers
- Book available rides
- Post ride requests (demands)
- Review driver responses to demands
- Accept/reject driver responses
- Rate drivers after completed rides
- Send messages to drivers

**Cannot Do:**
- Post ride offers (driver-only action)
- Respond to ride requests (driver-only action)
- Accept booking requests (they make bookings, not receive them)

---

### Driver
**Definition:** A user who offers rides to passengers.

**Account Type:** `is_driver = true`

**Primary Actions:**
- Post available rides (offers)
- View ride requests (demands) from passengers
- Respond to ride requests with counter-offers
- Accept/reject booking requests on their offers
- Rate passengers after completed rides
- Send messages to passengers

**Cannot Do:**
- Book rides (passenger-only action)
- Post ride requests (passenger-only action)
- Accept demand responses (they create responses, not receive them)

---

## Workflow 1: Rider Finds Ride (Standard Offer Flow)

### Overview
In this workflow, a driver posts an available ride, and passengers can search for it and book it.

### Actors
- **Driver:** The person offering the ride
- **Passenger:** The person looking for a ride

### Preconditions
- Both driver and passenger have registered accounts
- Driver is logged in with `is_driver = true`
- Passenger is logged in with `is_driver = false`

---

### Step 1: Driver Posts Offer

**Location:** `/post-offer` (Frontend), `POST /api/offers` (Backend)

**Actions:**
1. Driver logs into Toosila
2. Driver navigates to home page
3. Driver sees "Post Offer" button (only visible to drivers)
4. Driver clicks "Post Offer"
5. System displays offer creation form

**Form Fields:**
- **From City:** Departure city (e.g., Baghdad)
- **To City:** Destination city (e.g., Erbil)
- **Departure Date:** Date of travel
- **Departure Time:** Time of departure
- **Available Seats:** Number of seats available (1-7)
- **Price Per Seat:** Price in Iraqi Dinar (IQD)

**Driver Input Example:**
```
From: بغداد (Baghdad)
To: أربيل (Erbil)
Date: 2025-11-11
Time: 10:00 AM
Seats: 3
Price: 25000 IQD
```

6. Driver fills out form
7. Driver clicks "Submit" or "Post Offer"

**Backend Processing:**
```javascript
// File: server/controllers/offers.controller.js
// Function: createOffer

1. Validate input:
   - All required fields present
   - Cities are valid strings
   - Departure time is in the future (SHOULD validate, currently missing)
   - Seats > 0 and <= 7
   - Price > 0

2. Create offer in database:
   INSERT INTO offers (
     id, driver_id, from_city, to_city,
     departure_time, seats, price, is_active
   ) VALUES (
     gen_random_uuid(), req.user.id, 'بغداد', 'أربيل',
     '2025-11-11 10:00:00+00', 3, 25000, true
   )

3. Invalidate cache (offer cache, user stats)

4. Return success response
```

**Postconditions:**
- Offer created in `offers` table with `is_active = true`
- Offer visible in driver's "My Offers" page
- Offer visible to passengers searching for rides
- Driver can edit or deactivate offer

**Errors Handled:**
- "All fields are required" (if missing data)
- "Departure time must be in the future" (if past date - SHOULD be implemented)
- "Invalid seat count" (if seats < 1 or > 7)
- "Price must be positive" (if price <= 0)

---

### Step 2: Passenger Searches for Rides

**Location:** `/` (Home) → `/offers` (Frontend), `GET /api/offers` (Backend)

**Actions:**
1. Passenger logs into Toosila
2. Passenger lands on home page
3. Passenger sees search form with mode selection:
   - "Find Ride" (search offers) - DEFAULT for passengers
   - "Request Ride" (post demand)
4. Passenger enters search criteria (optional):
   - From City: Baghdad (optional)
   - To City: Erbil (optional)
   - Date: Tomorrow (optional)
5. Passenger clicks "Search Now" or "Browse Rides"

**Routing Logic:**
```javascript
// File: client/src/pages/Home.js
// Lines: 124-127

if (currentUser && currentUser.isDriver) {
  navigate('/demands'); // Driver sees demands
} else {
  navigate('/offers'); // Passenger sees offers
}
```

**Important:** If user is a driver, they are redirected to `/demands` instead of `/offers`. This is a KEY routing decision.

6. System redirects to `/offers` page
7. System fetches offers matching criteria

**Backend Processing:**
```javascript
// File: server/controllers/offers.controller.js
// Function: getOffers

GET /api/offers?fromCity=بغداد&toCity=أربيل&departureDate=2025-11-11&page=1&limit=20

1. Build filters from query params
2. Query database:
   SELECT o.*, u.name as driver_name, u.rating_avg
   FROM offers o
   JOIN users u ON o.driver_id = u.id
   WHERE o.is_active = true
     AND (o.from_city = 'بغداد' OR 'بغداد' IS NULL)
     AND (o.to_city = 'أربيل' OR 'أربيل' IS NULL)
     AND (DATE(o.departure_time) = '2025-11-11' OR '2025-11-11' IS NULL)
   ORDER BY o.departure_time ASC
   LIMIT 20 OFFSET 0

3. Return paginated results
```

**Display:**
- List of offers shown as cards
- Each card shows:
  - Route: Baghdad ← Erbil
  - Date: Tomorrow (or specific date)
  - Time: 10:00 AM
  - Seats: 3 available
  - Price: 25,000 IQD per seat
  - Driver name
  - Driver rating (if available)
  - "Book Now" button

**Filters Available:**
- City filters (from/to) - Quick filters for main cities
- Date filter
- Price range filter (min/max)
- Minimum seats filter
- Sort by: Date, Price (low to high), Price (high to low), Rating

---

### Step 3: Passenger Books Offer

**Location:** `/offers` (Frontend), `POST /api/bookings` (Backend)

**Actions:**
1. Passenger clicks "Book Now" on an offer
2. System checks:
   - User is logged in ✓
   - User is NOT a driver (line 199-202 in ViewOffers.js blocks drivers)
3. System displays booking confirmation modal

**Modal Content:**
- Offer details:
  - Route: Baghdad → Erbil
  - Date & Time: Tomorrow 10:00 AM
  - Seats available: 3
  - Price: 25,000 IQD
- Driver information:
  - Name: Alice
  - Rating: 4.8/5.0 (if available)
- Optional message field: "Message to driver (optional)"
- **Seats to book:** Defaulted to 1 (hardcoded in ViewOffers.js line 245)

**Passenger Input:**
```
Message: "Hi Alice, I'll be waiting at Al-Tahrir Square. Is that okay?"
Seats: 1 (default, not configurable in current UI)
```

4. Passenger fills optional message
5. Passenger clicks "Confirm Booking"

**Backend Processing:**
```javascript
// File: server/controllers/bookings.controller.js
// Function: createBooking

POST /api/bookings
Body: {
  offerId: "uuid-of-alice-offer",
  seats: 1,
  message: "Hi Alice, I'll be waiting at Al-Tahrir Square. Is that okay?"
}

1. Validate input:
   - Offer exists and is active
   - User is not the offer owner (passenger_id !== offer.driver_id)
   - Seats requested <= offer.seats (SHOULD validate)
   - No duplicate booking (UNIQUE constraint on offer_id + passenger_id)

2. Create booking:
   INSERT INTO bookings (
     id, offer_id, passenger_id, status, seats, message
   ) VALUES (
     gen_random_uuid(), offer_id, req.user.id, 'pending', 1, message
   )

3. Send notification to driver (Socket.io):
   io.to(driver_socket_id).emit('new_booking', {
     booking_id, passenger_name, from_city, to_city, message
   })

4. Return success response
```

**Postconditions:**
- Booking created with `status = 'pending'`
- Booking visible in passenger's "My Bookings" page
- Booking visible in driver's "Received Bookings" page
- Driver receives real-time notification
- **NOTE:** Seats on offer NOT yet decremented (they decrease when booking is accepted)

**Errors Handled:**
- "You already have a booking for this offer" (duplicate)
- "Cannot book your own offer" (if driver account)
- "Not enough seats available" (SHOULD be implemented)
- "Offer no longer available" (if deactivated)

---

### Step 4: Driver Reviews Booking Request

**Location:** `/bookings` (Frontend), `GET /api/bookings/my/offers` (Backend)

**Actions:**
1. Driver receives notification (browser notification or in-app badge)
2. Driver clicks notification OR navigates to "Bookings" page
3. Driver selects "Received Bookings" tab
4. System displays all booking requests on driver's offers

**Booking Card Display:**
- Route: Baghdad → Erbil
- Date & Time: Tomorrow 10:00 AM
- Seats requested: 1
- Price: 25,000 IQD
- Passenger information:
  - Name: Bob
  - Rating: 4.5/5.0 (if available)
- Passenger message: "Hi Alice, I'll be waiting at Al-Tahrir Square. Is that okay?"
- Status badge: PENDING (yellow)
- Actions:
  - ✅ Accept button
  - ❌ Reject button
  - 💬 Message Passenger button

5. Driver reads passenger's message
6. Driver decides to accept or reject

---

### Step 5A: Driver Accepts Booking

**Location:** `/bookings` (Frontend), `PUT /api/bookings/:id/status` (Backend)

**Actions:**
1. Driver clicks "Accept" button
2. System may show confirmation dialog (optional)
3. Driver confirms acceptance

**Backend Processing:**
```javascript
// File: server/controllers/bookings.controller.js
// Function: updateBookingStatus

PUT /api/bookings/{booking_id}/status
Body: {
  status: "confirmed"
}

1. Validate:
   - Booking exists
   - Current user is offer owner (req.user.id === offer.driver_id)
   - Booking status is 'pending' (can only accept pending)
   - Offer still has enough seats (SHOULD validate)

2. Update booking status:
   UPDATE bookings
   SET status = 'confirmed', updated_at = NOW()
   WHERE id = booking_id

3. Decrement seats on offer:
   UPDATE offers
   SET seats = seats - booking.seats
   WHERE id = offer_id

4. Send notification to passenger (Socket.io):
   io.to(passenger_socket_id).emit('booking_accepted', {
     booking_id, driver_name, from_city, to_city
   })

5. Return success response
```

**Postconditions:**
- Booking status changed from 'pending' to 'confirmed'
- Offer seats decreased by booked amount (3 → 2 if 1 seat booked)
- Passenger receives notification
- Passenger can now see driver's contact info
- Both parties can message each other
- Booking cannot be modified (only cancelled)

**Passenger Notification:**
- "Your booking has been accepted by Alice!"
- "Click here to view booking details"

---

### Step 5B: Driver Rejects Booking

**Location:** `/bookings` (Frontend), `PUT /api/bookings/:id/status` (Backend)

**Actions:**
1. Driver clicks "Reject" button
2. System may ask for rejection reason (optional, not currently implemented)
3. Driver confirms rejection

**Backend Processing:**
```javascript
PUT /api/bookings/{booking_id}/status
Body: {
  status: "cancelled"
}

1. Validate:
   - Booking exists
   - Current user is offer owner
   - Booking status is 'pending'

2. Update booking status:
   UPDATE bookings
   SET status = 'cancelled', updated_at = NOW()
   WHERE id = booking_id

3. DO NOT restore seats (they were never reserved)

4. Send notification to passenger:
   io.to(passenger_socket_id).emit('booking_rejected', {
     booking_id, driver_name
   })

5. Return success response
```

**Postconditions:**
- Booking status changed from 'pending' to 'cancelled'
- Offer seats remain unchanged (3 seats still available)
- Passenger receives notification
- Passenger can book a different offer

**Passenger Notification:**
- "Sorry, your booking request was not accepted by Alice."
- "You can search for other available rides."

---

### Step 6: Passenger Cancels Booking (Optional)

**Scenario:** Passenger cancels booking before or after driver accepts

**Location:** `/bookings` (Frontend), `PUT /api/bookings/:id/cancel` (Backend)

**Case 1: Cancel Pending Booking**
1. Booking status = 'pending'
2. Passenger clicks "Cancel Booking"
3. System confirms cancellation
4. Booking status → 'cancelled'
5. Driver receives notification
6. Seats NOT restored (they were never reserved)

**Case 2: Cancel Confirmed Booking**
1. Booking status = 'confirmed'
2. Passenger clicks "Cancel Booking"
3. System shows warning: "Cancelling a confirmed booking may affect your rating"
4. Passenger confirms
5. Booking status → 'cancelled'
6. Driver receives notification
7. Seats RESTORED to offer (2 → 3)

**Backend Processing:**
```javascript
// File: server/controllers/bookings.controller.js
// Function: cancelBooking

PUT /api/bookings/{booking_id}/cancel

1. Validate:
   - Booking exists
   - Current user is booking owner (passenger_id)
   - Booking status is 'pending' or 'confirmed' (not already cancelled/completed)

2. Update booking status to 'cancelled'

3. If booking was 'confirmed':
   - Restore seats to offer:
     UPDATE offers
     SET seats = seats + booking.seats
     WHERE id = offer_id

4. Send notification to driver

5. Return success response
```

**Postconditions:**
- Booking cancelled
- If confirmed, seats restored
- Driver notified
- Passenger can book again (no duplicate constraint violated)

---

### Step 7: Ride Completion

**Scenario:** Ride happens in real world, users mark it as completed

**Note:** Current implementation may not have explicit "Mark as Completed" feature. Completion may be:
- Automatic (after departure_time passes)
- Manual (admin action)
- Triggered by rating (when both rate, ride is considered complete)

**Ideal Flow:**
1. Ride departure time passes
2. System (or admin) marks booking as 'completed'
3. Both parties receive notification to rate each other

**Status Change:**
```
confirmed → completed
```

---

### Step 8: Passenger and Driver Rate Each Other

**See Workflow 4: Post-Ride Rating Flow for complete details**

**Summary:**
1. After ride completes, both see "Rate" button
2. Passenger rates driver (1-5 stars + optional comment)
3. Driver rates passenger (1-5 stars + optional comment)
4. Ratings update user averages
5. Ratings visible on profiles

---

## Workflow 2: Driver Offers Ride (Inverse Demand Flow)

### Overview
In this workflow, a passenger posts a ride request (demand), and drivers can see it and respond with counter-offers.

### Actors
- **Passenger:** The person requesting a ride
- **Driver:** The person responding to the request

### Preconditions
- Both passenger and driver have registered accounts
- Passenger is logged in with `is_driver = false`
- Driver is logged in with `is_driver = true`

---

### Step 1: Passenger Posts Demand (Ride Request)

**Location:** `/` (Home, demand mode) (Frontend), `POST /api/demands` (Backend)

**Actions:**
1. Passenger logs into Toosila
2. Passenger navigates to home page
3. Passenger selects "Request Ride" mode (if not default)
4. Passenger fills demand form

**Form Fields:**
- **From City:** Departure city
- **To City:** Destination city
- **Earliest Time:** Earliest acceptable departure time
- **Latest Time:** Latest acceptable departure time (creates a flexible window)
- **Seats Needed:** Number of seats required
- **Max Budget:** Maximum price willing to pay (optional)

**Passenger Input Example:**
```
From: البصرة (Basra)
To: النجف (Najaf)
Earliest Time: 2025-11-11 08:00 AM
Latest Time: 2025-11-11 06:00 PM  (flexible 10-hour window)
Seats: 2
Max Budget: 40000 IQD
```

5. Passenger clicks "Post Demand" or "Submit Request"

**Backend Processing:**
```javascript
// File: server/controllers/demands.controller.js
// Function: createDemand

POST /api/demands
Body: {
  fromCity: "البصرة",
  toCity: "النجف",
  earliestTime: "2025-11-11T08:00:00Z",
  latestTime: "2025-11-11T18:00:00Z",
  seats: 2,
  budgetMax: 40000
}

1. Validate input:
   - All required fields present
   - earliestTime < latestTime (SHOULD validate, currently missing)
   - Both times in the future (SHOULD validate)
   - Seats > 0
   - budgetMax > 0 (if provided)

2. Create demand in database:
   INSERT INTO demands (
     id, passenger_id, from_city, to_city,
     earliest_time, latest_time, seats, budget_max, is_active
   ) VALUES (
     gen_random_uuid(), req.user.id, 'البصرة', 'النجف',
     '2025-11-11 08:00:00+00', '2025-11-11 18:00:00+00',
     2, 40000, true
   )

3. Return success response
```

**Postconditions:**
- Demand created in `demands` table with `is_active = true`
- Demand visible in passenger's "My Demands" page
- Demand visible to drivers searching for ride requests
- Passenger can edit or deactivate demand

**Home.js Implementation Detail:**
```javascript
// File: client/src/pages/Home.js
// Lines: 139-167

// When user selects "demand" mode and clicks "Post Demand":
const demandData = {
  fromCity: pickupLocation.trim(),
  toCity: dropLocation.trim(),
  earliestTime: earliestDateTime.toISOString(),
  latestTime: latestDateTime.toISOString(), // earliestTime + 2 days
  seats: parseInt(availableSeats),
  budgetMax: parseFloat(pricePerSeat),
};

await demandsAPI.create(demandData);
navigate('/demands'); // Redirect to view demands
```

**Note:** latestTime is automatically set to earliestTime + 2 days (line 148-149)

---

### Step 2: Driver Discovers Demand

**Location:** `/demands` (Frontend), `GET /api/demands` (Backend)

**Actions:**
1. Driver logs into Toosila
2. Driver navigates to home page
3. System redirects driver to `/demands` page (based on routing logic in Home.js)
4. Driver sees list of all active demands

**Alternative Access:**
- Driver can also access via "Browse Demands" or similar menu option

**Backend Processing:**
```javascript
// File: server/controllers/demands.controller.js
// Function: getDemands

GET /api/demands?page=1&limit=20

1. Query database:
   SELECT d.*, u.name as passenger_name, u.rating_avg
   FROM demands d
   JOIN users u ON d.passenger_id = u.id
   WHERE d.is_active = true
   ORDER BY d.created_at DESC
   LIMIT 20 OFFSET 0

2. Return paginated results
```

**Display:**
- List of demands shown as cards
- Each card shows:
  - Route: Basra ← Najaf
  - Time window: From 8:00 AM to 6:00 PM
  - Seats needed: 2
  - Max budget: 40,000 IQD
  - Passenger name: Carol
  - Passenger rating (if available)
  - Actions:
    - 💼 "Send Offer" button
    - 📋 "View Responses" button (to see other drivers' responses)

**Filters Available:**
- City filters (from/to)
- Date range filter
- Advanced filters (all cities)

---

### Step 3: Driver Responds to Demand

**Location:** `/demands` (Frontend), `POST /api/demand-responses` (Backend)

**Actions:**
1. Driver clicks "Send Offer" on a demand
2. System displays response form modal

**Modal Content:**
- Demand details (recap):
  - Route: Basra → Najaf
  - Time window: 8:00 AM - 6:00 PM
  - Seats needed: 2
  - Budget: 40,000 IQD max
- Response form fields:
  - **Your Price:** Price per seat driver is offering
  - **Available Seats:** How many seats driver can provide
  - **Message:** Optional message to passenger

**Driver Input Example:**
```
Price: 35000 IQD per seat (within Carol's budget)
Available Seats: 4 (more than Carol needs)
Message: "Hi Carol, I can pick you up at 10 AM. Is that okay?"
```

3. Driver fills form
4. Driver clicks "Send Offer" or "Submit Response"

**Backend Processing:**
```javascript
// File: server/controllers/demandResponses.controller.js
// Function: createDemandResponse

POST /api/demand-responses
Body: {
  demandId: "uuid-of-carol-demand",
  offerPrice: 35000,
  availableSeats: 4,
  message: "Hi Carol, I can pick you up at 10 AM. Is that okay?"
}

1. Validate:
   - Demand exists and is active
   - Driver is not demand owner (driver_id !== demand.passenger_id) - line 30-32
   - No duplicate response from this driver (UNIQUE constraint + check line 35-42)
   - availableSeats >= demand.seats (enforced line 56-61)
   - offerPrice > 0

2. Optional warning (not error):
   - If offerPrice > demand.budgetMax:
     Log warning but still create response (line 45-53)

3. Create response:
   INSERT INTO demand_responses (
     id, demand_id, driver_id, offer_price,
     available_seats, message, status
   ) VALUES (
     gen_random_uuid(), demand_id, req.user.id,
     35000, 4, message, 'pending'
   )

4. Send notification to passenger (Socket.io):
   io.to(passenger_socket_id).emit('new_demand_response', {
     response_id, driver_name, from_city, to_city, offer_price
   })

5. Return success response
```

**Postconditions:**
- Response created with `status = 'pending'`
- Response visible in driver's "My Responses" page
- Response visible in passenger's "View Responses" for that demand
- Passenger receives real-time notification
- Driver cannot respond to same demand again (duplicate prevented)

**Errors Handled:**
- "You already responded to this demand" (duplicate)
- "Cannot respond to your own demand" (if somehow passenger account)
- "Not enough seats available" (if availableSeats < demand.seats)
- "Demand is no longer active" (if deactivated)

---

### Step 4: Passenger Reviews Responses

**Location:** `/demands` (Frontend), `GET /api/demand-responses/demand/:demandId` (Backend)

**Actions:**
1. Passenger receives notification (browser or in-app)
2. Passenger clicks notification OR navigates to "My Demands" page
3. Passenger clicks "View Responses" on their demand
4. System displays modal/page with all responses

**Response List Display:**
- For each response:
  - Driver name: Dave
  - Driver rating: 4.9/5.0
  - Price offered: 35,000 IQD per seat
  - Seats available: 4
  - Driver message: "Hi Carol, I can pick you up at 10 AM. Is that okay?"
  - Status badge: PENDING (yellow)
  - Actions:
    - ✅ Accept button
    - ❌ Reject button

**Backend Processing:**
```javascript
// File: server/controllers/demandResponses.controller.js
// Function: getResponsesByDemand

GET /api/demand-responses/demand/{demand_id}

1. Validate:
   - Demand exists
   - User is demand owner OR user is a driver who responded

2. Fetch responses:
   SELECT dr.*, u.name as driver_name, u.rating_avg
   FROM demand_responses dr
   JOIN users u ON dr.driver_id = u.id
   WHERE dr.demand_id = demand_id
   ORDER BY dr.created_at DESC

3. If user is driver (not owner):
   - Filter to show only their own response

4. Return responses with stats
```

**Display:**
- Count of responses: "You have received 3 responses"
- Stats: "2 pending, 1 rejected, 0 accepted"

5. Passenger reviews each response
6. Passenger decides which response to accept

---

### Step 5: Passenger Accepts Response

**Location:** `/demands` response modal (Frontend), `PATCH /api/demand-responses/:id/status` (Backend)

**Actions:**
1. Passenger clicks "Accept" on chosen response
2. System may show confirmation dialog
3. Passenger confirms acceptance

**Backend Processing:**
```javascript
// File: server/controllers/demandResponses.controller.js
// Function: updateResponseStatus

PATCH /api/demand-responses/{response_id}/status
Body: {
  status: "accepted"
}

1. Validate:
   - Response exists
   - Current user is demand owner (demand.passenger_id === req.user.id)
   - Response status is 'pending'

2. Update response status:
   UPDATE demand_responses
   SET status = 'accepted', updated_at = NOW()
   WHERE id = response_id

3. Auto-reject all other responses for this demand:
   UPDATE demand_responses
   SET status = 'rejected'
   WHERE demand_id = demand_id
     AND id != response_id
     AND status = 'pending'
   // Line 233-242

4. Deactivate the demand (no more responses needed):
   UPDATE demands
   SET is_active = false
   WHERE id = demand_id
   // Line 245

5. Send notifications:
   - To accepted driver: "Your response was accepted!"
   - To rejected drivers: "The passenger chose another driver"

6. Return success response
```

**Postconditions:**
- Chosen response status changed to 'accepted'
- All other responses auto-rejected
- Demand deactivated (`is_active = false`)
- Demand removed from public demand listings
- Accepted driver receives notification
- Rejected drivers receive notifications
- Passenger and driver can now message each other
- **Question:** Does this create a booking automatically, or is the response acceptance the final step?

**Driver Notification:**
- "Great news! Carol accepted your offer for Basra → Najaf."
- "Click here to view details"

**Rejected Drivers Notification:**
- "Your response to demand Basra → Najaf was not selected."

---

### Step 6: Passenger Rejects Response (Optional)

**Actions:**
1. Passenger clicks "Reject" on a response
2. Response status → 'rejected'
3. Driver receives notification
4. Other responses remain 'pending'
5. Demand remains active

**Note:** Rejecting individual responses doesn't affect the demand or other responses. Only accepting one response deactivates the demand.

---

### Step 7: Driver Cancels Own Response (Optional)

**Location:** Driver's "My Responses" page

**Actions:**
1. Driver navigates to "My Responses"
2. Driver finds response with status 'pending'
3. Driver clicks "Cancel" on their response

**Backend Processing:**
```javascript
PATCH /api/demand-responses/{response_id}/status
Body: {
  status: "cancelled"
}

1. Validate:
   - Response exists
   - Current user is response owner (driver_id)
   - Response status is 'pending' (cannot cancel accepted)

2. Update status to 'cancelled'

3. Return success
```

**Postconditions:**
- Response status → 'cancelled'
- Passenger sees one less response
- Response cannot be un-cancelled

---

### Step 8: Ride Completion & Rating

**Similar to Workflow 1, Step 7-8**

After the accepted driver and passenger complete the ride:
1. Ride marked as completed
2. Both parties rate each other
3. Ratings update averages
4. Workflow ends

**Question:** Does the demand workflow create a booking entry, or is the demand_response the record of the trip?

---

## Workflow 3: Matching & Booking Process

### Overview
This workflow focuses on the matching and booking mechanics that connect drivers and passengers.

---

### Matching Logic

#### Scenario 1: Passenger Searches for Matching Offer
**Criteria:**
- Route: From City + To City match
- Date: Departure date matches or is within range
- Seats: Offer has enough seats
- Price: Within passenger's budget (if specified)

**SQL Query Example:**
```sql
SELECT * FROM offers
WHERE from_city = 'Baghdad'
  AND to_city = 'Erbil'
  AND DATE(departure_time) = '2025-11-11'
  AND seats >= 1
  AND is_active = true
ORDER BY departure_time ASC
```

**Result:** List of matching offers displayed to passenger

---

#### Scenario 2: Driver Searches for Matching Demand
**Criteria:**
- Route: From City + To City match
- Time window: Driver's availability overlaps with demand's time window
- Seats: Driver has enough seats
- Price: Driver willing to accept demand's budget (optional)

**SQL Query Example:**
```sql
SELECT * FROM demands
WHERE from_city = 'Basra'
  AND to_city = 'Najaf'
  AND is_active = true
ORDER BY created_at DESC
```

**Result:** List of matching demands displayed to driver

---

### Booking Creation Process

#### Step-by-Step Booking Flow

**1. Pre-Booking Validation**
```javascript
// Frontend checks (ViewOffers.js)
- User is logged in ✓
- User is NOT a driver ✓ (line 199-202)
- User has not already booked this offer ✓ (checked by backend)

// Backend checks (bookings.controller.js)
- Offer exists and is active ✓
- User is not offer owner ✓
- Enough seats available ✓ (SHOULD be checked)
- No duplicate booking ✓ (database constraint)
```

**2. Booking Record Creation**
```sql
INSERT INTO bookings (
  id, offer_id, passenger_id, status, seats, message, created_at
) VALUES (
  gen_random_uuid(),
  'offer-uuid',
  'passenger-uuid',
  'pending',
  1,
  'Optional message',
  NOW()
);
```

**3. Notification Dispatch**
```javascript
// Socket.io real-time notification
io.to(driver_socket_id).emit('new_booking', {
  bookingId: booking.id,
  passengerName: user.name,
  fromCity: offer.fromCity,
  toCity: offer.toCity,
  message: booking.message,
  seatsRequested: booking.seats
});
```

**4. Status Update (when driver accepts)**
```sql
-- Update booking
UPDATE bookings
SET status = 'confirmed', updated_at = NOW()
WHERE id = booking_id;

-- Decrement seats
UPDATE offers
SET seats = seats - 1
WHERE id = offer_id;
```

**5. Seat Restoration (if booking cancelled after confirmation)**
```sql
UPDATE offers
SET seats = seats + 1
WHERE id = offer_id;
```

---

### Booking Status State Machine

```
[CREATED]
    |
    v
[PENDING] ----accept----> [CONFIRMED] ----complete----> [COMPLETED]
    |                          |
    |                          |
  reject                    cancel
    |                          |
    v                          v
[CANCELLED] <--------------[CANCELLED]
```

**Valid State Transitions:**
- pending → confirmed (driver accepts)
- pending → cancelled (driver rejects OR passenger cancels before acceptance)
- confirmed → completed (ride happens)
- confirmed → cancelled (passenger cancels after acceptance)

**Invalid State Transitions:**
- confirmed → pending (cannot undo acceptance)
- completed → any other state (cannot undo completion)
- cancelled → any other state (cannot undo cancellation)

---

## Workflow 4: Post-Ride Rating Flow

### Overview
After a ride completes, both passenger and driver can rate each other.

---

### Step 1: Ride Completion Trigger

**Possible Triggers:**
1. **Manual:** User clicks "Mark as Completed"
2. **Automatic:** System marks booking as completed after departure_time passes
3. **Admin:** Admin manually marks trip as completed

**Status Change:**
```sql
UPDATE bookings
SET status = 'completed'
WHERE id = booking_id;
```

---

### Step 2: Rating Prompt

**Actions:**
1. Both users see "Rate" button next to completed trip
2. Passenger sees "Rate Driver"
3. Driver sees "Rate Passenger"

**Display Locations:**
- Bookings page (next to completed booking)
- Profile page (pending ratings section)
- Notification/email reminder (optional)

---

### Step 3: Submit Rating

**Location:** Rating modal, `POST /api/ratings` (Backend)

**Actions:**
1. User clicks "Rate Driver" or "Rate Passenger"
2. System displays rating modal

**Modal Content:**
- Trip details (route, date)
- Other user's name and photo
- Star rating selector (1-5 stars)
- Comment textarea (optional, max 2000 chars)

**User Input Example:**
```
Stars: 5 ⭐⭐⭐⭐⭐
Comment: "Excellent driver! Very punctual and friendly. Highly recommended!"
```

3. User selects stars
4. User writes optional comment
5. User clicks "Submit Rating"

**Backend Processing:**
```javascript
// File: server/controllers/ratings.controller.js
// Function: createRating

POST /api/ratings
Body: {
  rideId: "booking-uuid",
  toUserId: "driver-uuid",
  rating: 5,
  comment: "Excellent driver! Very punctual and friendly."
}

1. Validate:
   - Booking exists and status = 'completed'
   - User participated in this booking (as passenger or driver)
   - User has not already rated this booking (UNIQUE constraint)
   - Rating is between 1 and 5 (CHECK constraint)
   - Comment length <= 2000 chars

2. Create rating:
   INSERT INTO ratings (
     id, ride_id, from_user_id, to_user_id,
     rating, comment, created_at
   ) VALUES (
     gen_random_uuid(), ride_id, req.user.id, to_user_id,
     5, comment, NOW()
   )

3. Update user's average rating:
   -- Calculate new average
   SELECT AVG(rating) as avg_rating, COUNT(*) as count
   FROM ratings
   WHERE to_user_id = rated_user_id

   -- Update user record
   UPDATE users
   SET rating_avg = avg_rating, rating_count = count
   WHERE id = rated_user_id

4. Send notification to rated user:
   "You received a new 5-star rating from [User]!"

5. Return success
```

**Postconditions:**
- Rating saved in `ratings` table
- Rated user's `rating_avg` and `rating_count` updated
- Rating visible on rated user's profile
- Rated user receives notification
- "Rate" button becomes "View Rating" or disappears

**Errors Handled:**
- "You already rated this ride" (duplicate)
- "Ride must be completed first" (if status != completed)
- "Rating must be between 1 and 5" (validation)
- "Comment too long" (> 2000 chars)

---

### Step 4: View Ratings

**Location:** User profile page

**Display:**
- Average rating: 4.8 / 5.0
- Total ratings: 47 ratings
- Rating distribution:
  - 5 stars: 35 (74%)
  - 4 stars: 10 (21%)
  - 3 stars: 2 (4%)
  - 2 stars: 0 (0%)
  - 1 star: 0 (0%)
- Recent reviews (pagination):
  - From: Bob (5 ⭐) - "Excellent driver! Very punctual..."
  - From: Carol (4 ⭐) - "Good ride, but a bit late..."

**Backend Query:**
```sql
-- Get user's ratings
SELECT r.*, u.name as from_user_name
FROM ratings r
JOIN users u ON r.from_user_id = u.id
WHERE r.to_user_id = user_id
ORDER BY r.created_at DESC
LIMIT 10 OFFSET 0;

-- Get rating distribution
SELECT rating, COUNT(*) as count
FROM ratings
WHERE to_user_id = user_id
GROUP BY rating
ORDER BY rating DESC;
```

---

### Step 5: Edit Rating (Optional)

**If Allowed:**
1. User navigates to "My Ratings Given"
2. User finds rating they submitted
3. User clicks "Edit"
4. User modifies stars and/or comment
5. Rating updated
6. Rated user's average recalculated

**Business Rule Question:** Should ratings be editable? If yes, for how long?

**Current Implementation:** Limited edit functionality (per MVP_QA_TESTING_REPORT.md line 153)

---

## Workflow 5: Messaging Between Users

### Overview
Passengers and drivers can send direct messages to each other.

---

### Step 1: Initiate Conversation

**Entry Points:**
1. **From Booking:** Click "Message Driver" or "Message Passenger" button on booking card
2. **From Demand Response:** Click "Message" on response
3. **From Messages Page:** Select user from conversation list or search

**Actions:**
1. User clicks message button
2. System navigates to `/messages` page
3. System opens conversation with selected user

**Routing:**
```javascript
// From Bookings.js line 354-358
navigate(`/messages`, {
  state: {
    recipientId: driver.id,
    recipientName: driver.name
  }
});
```

---

### Step 2: Send Message

**Location:** `/messages` (Frontend), `POST /api/messages` (Backend)

**Actions:**
1. User types message in text field
2. User clicks "Send" button or presses Enter

**Frontend Validation:**
- Message not empty
- Message length <= 2000 characters (enforced by database)

**Backend Processing:**
```javascript
// File: server/controllers/messages.controller.js
// Function: sendMessage

POST /api/messages
Body: {
  rideType: "offer",
  rideId: "offer-uuid",
  content: "Hi Alice, what time should I be ready?"
}

1. Validate:
   - Content not empty and <= 2000 chars (CHECK constraint in database)
   - Recipient is not self (cannot message yourself)
   - User has permission to message recipient (participated in same ride)

2. Create message:
   INSERT INTO messages (
     id, ride_type, ride_id, sender_id, content, created_at
   ) VALUES (
     gen_random_uuid(), 'offer', ride_id, req.user.id,
     'Hi Alice, what time should I be ready?', NOW()
   )

3. Send real-time notification (Socket.io):
   io.to(recipient_socket_id).emit('new_message', {
     messageId, senderId, senderName, content, rideInfo
   })

4. Return success
```

**Postconditions:**
- Message saved in `messages` table
- Message appears in conversation for both users
- Recipient receives real-time notification
- Unread message count increases for recipient

**Errors Handled:**
- "Message cannot be empty"
- "Message too long (max 2000 characters)"
- "Cannot message yourself"

---

### Step 3: View Conversation

**Location:** `/messages` (Frontend), `GET /api/messages/conversation/:userId` (Backend)

**Actions:**
1. User clicks on conversation in list OR opens from notification
2. System fetches all messages between two users
3. Messages displayed in chronological order

**Backend Processing:**
```javascript
GET /api/messages/conversation/{userId}

1. Validate:
   - User has permission to view this conversation

2. Fetch messages:
   SELECT m.*, u.name as sender_name
   FROM messages m
   JOIN users u ON m.sender_id = u.id
   WHERE (m.sender_id = req.user.id AND m.recipient_id = userId)
      OR (m.sender_id = userId AND m.recipient_id = req.user.id)
   ORDER BY m.created_at ASC

3. Mark messages as read:
   UPDATE messages
   SET is_read = true
   WHERE recipient_id = req.user.id
     AND sender_id = userId
     AND is_read = false

4. Return messages
```

**Display:**
- Message bubbles aligned left (received) and right (sent)
- Timestamp for each message
- Read status (optional: seen/delivered indicators)

---

### Step 4: Real-Time Updates

**Socket.io Events:**
```javascript
// When user connects
socket.on('connect', () => {
  socket.emit('join', { userId: currentUser.id });
});

// When new message received
socket.on('new_message', (data) => {
  // Update conversation UI
  appendMessageToConversation(data);
  updateUnreadCount(+1);
  showNotification(data.senderName + ': ' + data.content);
});

// When message read
socket.on('message_read', (data) => {
  // Update read status in UI
  markMessageAsRead(data.messageId);
});
```

---

### Step 5: View Conversation List

**Location:** `/messages` main page

**Display:**
- List of all conversations sorted by most recent
- For each conversation:
  - Other user's name and photo
  - Last message preview
  - Timestamp of last message
  - Unread count badge (if > 0)

**Backend Query:**
```sql
SELECT
  DISTINCT ON (conversation_partner)
  conversation_partner,
  last_message,
  last_message_time,
  unread_count
FROM (
  SELECT
    CASE WHEN sender_id = current_user_id
         THEN recipient_id
         ELSE sender_id
    END as conversation_partner,
    content as last_message,
    created_at as last_message_time,
    CASE WHEN recipient_id = current_user_id AND is_read = false
         THEN 1 ELSE 0
    END as unread_count
  FROM messages
  WHERE sender_id = current_user_id OR recipient_id = current_user_id
  ORDER BY created_at DESC
) conversations
ORDER BY conversation_partner, last_message_time DESC;
```

---

## Workflow Diagrams (Text-Based)

### Diagram 1: Standard Offer Workflow

```
DRIVER                          SYSTEM                          PASSENGER
  |                               |                                 |
  |--[Login]-------------------->|                                 |
  |<--[Show Driver Home]---------|                                 |
  |                               |                                 |
  |--[Click Post Offer]--------->|                                 |
  |<--[Show Offer Form]----------|                                 |
  |                               |                                 |
  |--[Submit Offer]--------------| -----[Create Offer in DB]       |
  |                               | -----[Mark as Active]           |
  |<--[Offer Created]------------|                                 |
  |                               |                                 |
  |                               |                [Login]--------->|
  |                               |<--------[Show Passenger Home]---|
  |                               |                                 |
  |                               |       [Search Offers]---------->|
  |                               |<------[Return Offer List]-------|
  |                               |                                 |
  |                               |           [Book Offer]--------->|
  |                               | -----[Create Booking (pending)] |
  |<--[Notification]--------------| -----[Send Notification]        |
  |                               |<--------[Booking Confirmed]-----|
  |                               |                                 |
  |--[View Booking]------------->|                                 |
  |<--[Show Booking Details]-----|                                 |
  |                               |                                 |
  |--[Accept Booking]-------------| -----[Update status:confirmed]  |
  |                               | -----[Decrease seats]           |
  |                               | -----[Send Notification]------->|
  |                               |                                 |
  |                               |      <-- RIDE HAPPENS -->       |
  |                               |                                 |
  |--[Rate Passenger]-------------| -----[Create Rating]            |
  |                               | -----[Update Avg Rating]------->|
  |                               |                                 |
  |                               |         [Rate Driver]---------->|
  |<--[Receive Rating]-----------| <------[Create Rating]----------|
  |                               |                                 |
  |                          [WORKFLOW END]                         |
```

---

### Diagram 2: Inverse Demand Workflow

```
PASSENGER                        SYSTEM                           DRIVER
  |                               |                                 |
  |--[Login]-------------------->|                                 |
  |<--[Show Passenger Home]------|                                 |
  |                               |                                 |
  |--[Click Request Ride]------->|                                 |
  |<--[Show Demand Form]---------|                                 |
  |                               |                                 |
  |--[Submit Demand]--------------| -----[Create Demand in DB]      |
  |                               | -----[Mark as Active]           |
  |<--[Demand Created]-----------|                                 |
  |                               |                                 |
  |                               |                 [Login]-------->|
  |                               |<---------[Show Driver Home]-----|
  |                               |                                 |
  |                               |      [Browse Demands]---------->|
  |                               |<-------[Return Demand List]-----|
  |                               |                                 |
  |                               |       [Send Response]---------->|
  |<--[Notification]--------------| <----[Create Response (pending)]|
  |                               | -----[Send Notification]        |
  |                               |                                 |
  |--[View Responses]----------->|                                 |
  |<--[Show Response List]-------|                                 |
  |                               |                                 |
  |--[Accept Response]------------| -----[Update: accepted]         |
  |                               | -----[Auto-reject others]       |
  |                               | -----[Deactivate demand]        |
  |                               | -----[Send Notification]------->|
  |                               |                                 |
  |                               |      <-- RIDE HAPPENS -->       |
  |                               |                                 |
  |--[Rate Driver]----------------| -----[Create Rating]            |
  |                               | -----[Update Avg Rating]------->|
  |                               |                                 |
  |                               |       [Rate Passenger]--------->|
  |<--[Receive Rating]-----------| <------[Create Rating]----------|
  |                               |                                 |
  |                          [WORKFLOW END]                         |
```

---

### Diagram 3: Booking Status Flow

```
                    [BOOKING CREATED]
                           |
                           v
                     +----------+
                     | PENDING  |
                     +----------+
                      /         \
                     /           \
              (accept)         (reject/cancel)
                   /               \
                  v                 v
            +-----------+      +-----------+
            | CONFIRMED |      | CANCELLED |
            +-----------+      +-----------+
                 |                   ^
                 |                   |
            (ride happens)      (cancel after
                 |               confirmation)
                 v                   |
            +-----------+            |
            | COMPLETED |------------+
            +-----------+
                 |
                 |
           (rate each other)
                 |
                 v
              [WORKFLOW END]
```

---

## Business Rules Summary

### Rule 1: User Roles
- Users are EITHER drivers OR passengers (no dual-role support currently)
- `is_driver` field determines user capabilities
- Role determines home page content and available actions

### Rule 2: Offer Management
- Only drivers can post offers
- Drivers can only edit/delete their own offers
- Offers can be deactivated but not hard-deleted
- Departure time SHOULD be in the future (validation recommended)
- Seats must be positive integer (1-7)
- Price must be positive

### Rule 3: Demand Management
- Only passengers can post demands
- Passengers can only edit/delete their own demands
- Demands have time windows (earliest → latest time)
- earliestTime SHOULD be < latestTime (validation recommended)
- budgetMax is optional but should be positive if provided
- Demand deactivates when response accepted

### Rule 4: Booking Logic
- Passengers book offers, not drivers
- One user cannot book same offer twice (UNIQUE constraint)
- User cannot book own offer (if dual-role ever supported)
- Booking starts as 'pending'
- Driver can accept or reject
- Passenger can cancel at any time (before or after acceptance)
- Seats decrease when booking accepted
- Seats restore when confirmed booking cancelled

### Rule 5: Demand Response Logic
- Drivers respond to demands, not passengers
- One driver cannot respond to same demand twice (UNIQUE constraint)
- Driver cannot respond to own demand
- Available seats MUST be >= demand seats
- Offer price CAN exceed budget (warning, not error)
- Only one response can be accepted per demand
- Accepting one response auto-rejects others
- Driver can cancel own pending response

### Rule 6: Rating Logic
- Both parties can rate each other after ride completes
- Rating range: 1-5 stars
- Cannot rate before ride completes
- Cannot rate same ride twice (UNIQUE constraint)
- Cannot rate self
- Ratings update user averages automatically

### Rule 7: Messaging Logic
- Users can message anyone they have a ride with
- Cannot message self
- Message length max 2000 characters
- Messages are real-time via Socket.io

---

## Common User Paths

### Path A: Passenger Books Ride Successfully
1. Passenger logs in
2. Searches for rides (Baghdad → Erbil, tomorrow)
3. Finds suitable offer
4. Books offer with optional message
5. Waits for driver acceptance
6. Driver accepts
7. Passenger and driver message each other
8. Ride happens
9. Both rate each other
10. Workflow complete

**Duration:** 1-2 days (assuming next-day ride)

---

### Path B: Driver Responds to Demand Successfully
1. Driver logs in
2. Browses demands
3. Finds suitable demand (Basra → Najaf)
4. Sends response with price and seats
5. Passenger receives notification
6. Passenger accepts driver's response
7. Other responses auto-rejected
8. Demand deactivated
9. Driver and passenger message each other
10. Ride happens
11. Both rate each other
12. Workflow complete

**Duration:** 1-2 days

---

### Path C: Booking Cancelled by Passenger
1-4. Same as Path A
5. Passenger changes plans
6. Passenger cancels booking (before driver acceptance)
7. Driver receives cancellation notification
8. Booking status → cancelled
9. No seat restoration (seats never reserved)
10. Passenger can book different offer

**Duration:** Hours to 1 day

---

### Path D: Booking Rejected by Driver
1-4. Same as Path A
5. Driver reviews booking, decides not to accept
6. Driver rejects booking
7. Passenger receives rejection notification
8. Booking status → cancelled
9. Passenger searches for alternative offer

**Duration:** Hours to 1 day

---

### Path E: Multiple Drivers Respond to Demand
1. Passenger posts demand
2. Driver A responds with offer price 30,000 IQD
3. Driver B responds with offer price 32,000 IQD
4. Driver C responds with offer price 28,000 IQD
5. Passenger reviews all three responses
6. Passenger accepts Driver C's response (lowest price)
7. Drivers A and B receive rejection notifications
8. Demand deactivated
9. Passenger and Driver C proceed with ride

**Duration:** Hours to 1 day

---

**END OF TOOSILA WORKFLOW DOCUMENTATION**

**Usage:** Use this documentation to understand complete user journeys, business logic, and system behavior. Cross-reference with code to validate implementation matches documentation.
