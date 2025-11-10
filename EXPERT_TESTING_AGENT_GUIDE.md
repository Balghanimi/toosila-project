# Expert Testing Agent - Comprehensive Guide

**Version:** 1.0
**Date:** November 10, 2025
**Purpose:** Test complete user journeys and validate logic flow in the Toosila ride-sharing platform

---

## Table of Contents

1. [Mission & Responsibilities](#mission--responsibilities)
2. [Testing Methodology](#testing-methodology)
3. [Feature Testing Catalog](#feature-testing-catalog)
4. [User Journey Test Scenarios](#user-journey-test-scenarios)
5. [Expected Behavior Matrix](#expected-behavior-matrix)
6. [Edge Case Testing](#edge-case-testing)
7. [Integration Testing](#integration-testing)
8. [Regression Testing](#regression-testing)

---

## Mission & Responsibilities

### Core Mission
Verify that every feature in Toosila works as expected, user journeys are complete and logical, and the platform behaves reasonably in all scenarios including edge cases.

### Key Responsibilities
1. **Feature Validation** - Test each feature individually
2. **Journey Testing** - Test complete end-to-end user workflows
3. **Logic Verification** - Ensure behavior matches real-world expectations
4. **Edge Case Discovery** - Find and test unusual scenarios
5. **Integration Testing** - Verify features work together correctly
6. **Regression Testing** - Ensure new changes don't break existing functionality

### Testing Principles
- **User-Centric:** Always think from the user's perspective
- **Complete Journeys:** Test entire workflows, not just isolated features
- **Real-World Scenarios:** Use realistic test data and situations
- **Destructive Testing:** Try to break things intentionally
- **Documentation:** Record every finding with clear reproduction steps

---

## Testing Methodology

### Phase 1: Feature Discovery
1. List all features from README.md and codebase
2. Map features to user roles (passenger, driver, both)
3. Identify dependencies between features
4. Prioritize by criticality (P0, P1, P2)

### Phase 2: Test Case Design
1. For each feature, define:
   - **Happy path** - Expected normal usage
   - **Sad path** - Expected errors and edge cases
   - **Evil path** - Malicious or illogical attempts
2. Create test scenarios with specific inputs and expected outputs
3. Document preconditions and postconditions

### Phase 3: Execution
1. Set up test environment (user accounts, test data)
2. Execute test cases systematically
3. Record results: PASS, FAIL, BLOCKED
4. Screenshot/video evidence for failures
5. Note actual vs expected behavior

### Phase 4: Bug Reporting
1. Reproduce issue 3 times to confirm
2. Document:
   - Title: Clear one-sentence description
   - Severity: P0 (blocker), P1 (high), P2 (medium), P3 (low)
   - Steps to reproduce (numbered)
   - Expected result
   - Actual result
   - Browser/device info
3. Categorize: Logic error, UI bug, data issue, permission problem, etc.

### Phase 5: Verification & Regression
1. After fixes, retest failed cases
2. Run smoke test suite on related features
3. Verify no new issues introduced

---

## Feature Testing Catalog

### Authentication & User Management Features

#### Feature: User Registration
**Test Cases:**
1. **TC-AUTH-001:** Register as passenger
   - Input: Valid name, email, password, isDriver=false
   - Expected: Account created, redirected to home, logged in
   - Verify: Database record created, JWT token received

2. **TC-AUTH-002:** Register as driver
   - Input: Valid name, email, password, isDriver=true
   - Expected: Driver account created
   - Verify: is_driver=true in database

3. **TC-AUTH-003:** Register with duplicate email
   - Input: Email that already exists
   - Expected: Error "Email already registered"
   - Verify: No duplicate account created

4. **TC-AUTH-004:** Register with weak password
   - Input: Password < 6 characters
   - Expected: Validation error
   - Verify: Account not created

5. **TC-AUTH-005:** Register without name
   - Input: Empty name field
   - Expected: Validation error
   - Verify: Required field error shown

#### Feature: User Login
**Test Cases:**
1. **TC-AUTH-006:** Login with valid credentials
   - Input: Registered email + correct password
   - Expected: Logged in, redirected to home
   - Verify: JWT token in localStorage, user context populated

2. **TC-AUTH-007:** Login with wrong password
   - Input: Valid email + incorrect password
   - Expected: Error "Invalid credentials"
   - Verify: Not logged in

3. **TC-AUTH-008:** Login with non-existent email
   - Input: Unregistered email
   - Expected: Error "Invalid credentials"
   - Verify: Not logged in

4. **TC-AUTH-009:** Login with unverified email (if email verification enabled)
   - Input: Valid credentials, email not verified
   - Expected: Warning + option to resend verification
   - Verify: Limited access or blocked

#### Feature: Profile Management
**Test Cases:**
1. **TC-PROFILE-001:** View own profile
   - Action: Navigate to /profile
   - Expected: Display user info, stats, rating
   - Verify: Correct data shown

2. **TC-PROFILE-002:** Edit profile (name)
   - Action: Change name, save
   - Expected: Success message, name updated
   - Verify: Database updated, UI reflects change

3. **TC-PROFILE-003:** Change password
   - Input: Current password + new password + confirm
   - Expected: Password changed, logged out
   - Verify: Can login with new password

4. **TC-PROFILE-004:** View another user's profile (from booking/rating)
   - Action: Click on driver/passenger name
   - Expected: View their public profile (name, rating, review count)
   - Verify: Sensitive info (email, phone) hidden

---

### Offer Workflow Features (Driver Side)

#### Feature: Post Offer
**Test Cases:**
1. **TC-OFFER-001:** Post valid offer as driver
   - Input: Cities, future date/time, seats (1-4), price > 0
   - Expected: Offer created, visible in my offers
   - Verify: Database record created, offer is active

2. **TC-OFFER-002:** Attempt to post offer as passenger
   - Precondition: Logged in as passenger (isDriver=false)
   - Action: Try to access /post-offer
   - Expected: Access denied OR option not shown
   - Verify: Backend rejects with 403 if attempted

3. **TC-OFFER-003:** Post offer with past date
   - Input: departure_time < current time
   - Expected: Validation error "Departure time must be in future"
   - Verify: Offer not created

4. **TC-OFFER-004:** Post offer with 0 seats
   - Input: seats = 0
   - Expected: Validation error "Seats must be at least 1"
   - Verify: Offer not created

5. **TC-OFFER-005:** Post offer with negative price
   - Input: price = -100
   - Expected: Validation error "Price must be positive"
   - Verify: Offer not created

6. **TC-OFFER-006:** Post offer with empty cities
   - Input: fromCity = "" or toCity = ""
   - Expected: Validation error "Cities required"
   - Verify: Offer not created

7. **TC-OFFER-007:** Post duplicate offer (same route, time, driver)
   - Input: Exactly same as existing offer
   - Expected: Warning OR allowed (needs clarification)
   - Verify: Check business rule

#### Feature: View My Offers
**Test Cases:**
1. **TC-OFFER-008:** View all my offers as driver
   - Action: Navigate to my offers page
   - Expected: List of all my offers (active + inactive)
   - Verify: Only my offers shown, not other drivers'

2. **TC-OFFER-009:** Filter my offers by date
   - Action: Select date filter
   - Expected: Only offers matching date shown
   - Verify: Filtering works correctly

3. **TC-OFFER-010:** View offer with bookings
   - Action: Click on offer with bookings
   - Expected: See booking requests, can accept/reject
   - Verify: Booking count displayed

#### Feature: Edit Offer
**Test Cases:**
1. **TC-OFFER-011:** Edit own offer (change price)
   - Action: Update price, save
   - Expected: Offer updated, success message
   - Verify: Database updated, bookings notified (if any)

2. **TC-OFFER-012:** Edit offer with accepted bookings
   - Precondition: Offer has confirmed bookings
   - Action: Try to reduce seats
   - Expected: Warning OR prevent if seats < booked seats
   - Verify: Data consistency maintained

3. **TC-OFFER-013:** Attempt to edit another driver's offer
   - Action: Directly access edit endpoint for other's offer
   - Expected: 403 Forbidden
   - Verify: Ownership check enforced

#### Feature: Deactivate/Delete Offer
**Test Cases:**
1. **TC-OFFER-014:** Deactivate offer with no bookings
   - Action: Deactivate/delete offer
   - Expected: Offer removed from public listings
   - Verify: is_active = false, not deleted

2. **TC-OFFER-015:** Deactivate offer with pending bookings
   - Precondition: Offer has pending booking requests
   - Action: Deactivate offer
   - Expected: Warning + confirmation, bookings notified
   - Verify: Bookings auto-rejected or cancelled

3. **TC-OFFER-016:** Deactivate offer with confirmed bookings
   - Precondition: Offer has confirmed bookings
   - Action: Try to deactivate
   - Expected: Blocked OR require all bookings to be completed/cancelled first
   - Verify: Cannot delete active trips

---

### Booking Workflow Features

#### Feature: Browse Offers (Passenger Side)
**Test Cases:**
1. **TC-BROWSE-001:** View all available offers as passenger
   - Action: Navigate to /offers
   - Expected: List of active offers from all drivers
   - Verify: Only active offers shown

2. **TC-BROWSE-002:** Filter offers by city
   - Action: Select from/to city filter
   - Expected: Only matching offers shown
   - Verify: Filter works correctly

3. **TC-BROWSE-003:** Filter offers by date
   - Action: Select departure date
   - Expected: Offers on that date shown
   - Verify: Date filter accurate

4. **TC-BROWSE-004:** Filter offers by price range
   - Action: Set min/max price
   - Expected: Offers within range shown
   - Verify: Price filter works

5. **TC-BROWSE-005:** Filter offers by seat count
   - Action: Set minimum seats needed
   - Expected: Offers with >= seats shown
   - Verify: Seat filter works

6. **TC-BROWSE-006:** Sort offers (price, date, rating)
   - Action: Change sort option
   - Expected: List reorders accordingly
   - Verify: Sorting accurate

7. **TC-BROWSE-007:** View offer details
   - Action: Click on an offer
   - Expected: Modal/page with full details, driver info, book button
   - Verify: All info displayed correctly

#### Feature: Book Offer
**Test Cases:**
1. **TC-BOOK-001:** Book offer with available seats
   - Precondition: Logged in as passenger, offer has seats
   - Action: Click "Book Now", select seats (default 1), confirm
   - Expected: Booking created with status "pending", driver notified
   - Verify: Database record created, notification sent

2. **TC-BOOK-002:** Attempt to book offer with 0 seats
   - Precondition: Offer seats = 0
   - Action: Try to book
   - Expected: Button disabled OR error "No seats available"
   - Verify: Booking not created

3. **TC-BOOK-003:** Attempt to book own offer (if driver)
   - Precondition: Logged in as driver, viewing own offer
   - Action: Try to book
   - Expected: Button hidden OR error "Cannot book your own offer"
   - Verify: ViewOffers.js line 199-202 enforces this

4. **TC-BOOK-004:** Book offer twice (duplicate booking)
   - Action: Book same offer again
   - Expected: Error "You already have a booking for this offer"
   - Verify: UNIQUE constraint prevents duplicate

5. **TC-BOOK-005:** Book offer while not logged in
   - Precondition: Not authenticated
   - Action: Try to book
   - Expected: Redirect to login OR error "Please login first"
   - Verify: Auth required

6. **TC-BOOK-006:** Book offer with optional message
   - Action: Enter message in booking form, submit
   - Expected: Booking created with message
   - Verify: Message stored, visible to driver

7. **TC-BOOK-007:** Concurrent booking (race condition test)
   - Action: Two users book last seat simultaneously
   - Expected: One succeeds, one gets "No seats available" error
   - Verify: No overbooking, atomic operation

#### Feature: View My Bookings (Passenger)
**Test Cases:**
1. **TC-BOOK-008:** View all my bookings as passenger
   - Action: Navigate to /bookings, "My Bookings" tab
   - Expected: List of all my booking requests
   - Verify: Only my bookings shown

2. **TC-BOOK-009:** View booking with different statuses
   - Action: Check bookings with pending, confirmed, cancelled status
   - Expected: Status badges displayed correctly
   - Verify: Status colors match (yellow, green, red)

3. **TC-BOOK-010:** View booking details (driver info)
   - Action: Expand booking card
   - Expected: Driver name, contact info (if confirmed), route, time, price
   - Verify: All details accurate

4. **TC-BOOK-011:** Cancel pending booking
   - Precondition: Booking status = pending
   - Action: Click "Cancel Booking", confirm
   - Expected: Status → cancelled, driver notified, seats restored
   - Verify: Database updated, seat count increased

5. **TC-BOOK-012:** Cancel confirmed booking
   - Precondition: Booking status = confirmed
   - Action: Click "Cancel Booking"
   - Expected: Confirmation dialog (cancellation policy), status → cancelled
   - Verify: Driver notified, seats restored

6. **TC-BOOK-013:** Attempt to cancel completed booking
   - Precondition: Booking status = completed
   - Action: Try to cancel
   - Expected: Button hidden OR error "Cannot cancel completed ride"
   - Verify: Cannot cancel past rides

#### Feature: Manage Bookings (Driver Side)
**Test Cases:**
1. **TC-BOOK-014:** View bookings on my offers
   - Action: Navigate to /bookings, "Received Bookings" tab
   - Expected: List of all booking requests on my offers
   - Verify: Only bookings for my offers shown

2. **TC-BOOK-015:** Accept booking request
   - Precondition: Booking status = pending, seats available
   - Action: Click "Accept", confirm
   - Expected: Status → confirmed, passenger notified, seats decreased
   - Verify: Database updated, notification sent

3. **TC-BOOK-016:** Reject booking request
   - Precondition: Booking status = pending
   - Action: Click "Reject", confirm
   - Expected: Status → cancelled, passenger notified
   - Verify: Seats NOT restored (they were never reserved)

4. **TC-BOOK-017:** Accept booking when seats insufficient (if allowed to over-accept)
   - Precondition: Bookings already consume all seats
   - Action: Try to accept another booking
   - Expected: Error "Not enough seats available"
   - Verify: Overbooking prevented

5. **TC-BOOK-018:** View passenger details in booking
   - Action: Click on booking card
   - Expected: Passenger name, contact info, message
   - Verify: Info displayed correctly

6. **TC-BOOK-019:** Message passenger from booking
   - Action: Click "Message Passenger" button
   - Expected: Redirect to messages page with conversation open
   - Verify: Navigation works, correct recipient

---

### Demand Workflow Features (Rider Posts, Driver Responds)

#### Feature: Post Demand (Passenger Side)
**Test Cases:**
1. **TC-DEMAND-001:** Post valid demand as passenger
   - Input: Cities, date range (earliest/latest time), seats, budget (optional)
   - Expected: Demand created, visible in my demands
   - Verify: Database record created, demand is active

2. **TC-DEMAND-002:** Attempt to post demand as driver
   - Precondition: Logged in as driver
   - Action: Try to access demand posting
   - Expected: Access denied OR option not shown
   - Verify: Backend rejects with 403 if attempted

3. **TC-DEMAND-003:** Post demand with earliest_time > latest_time
   - Input: Invalid time range
   - Expected: Validation error "Earliest time must be before latest time"
   - Verify: Demand not created

4. **TC-DEMAND-004:** Post demand with past dates
   - Input: earliest_time < current time
   - Expected: Validation error "Time must be in future"
   - Verify: Demand not created

5. **TC-DEMAND-005:** Post demand with 0 seats
   - Input: seats = 0
   - Expected: Validation error
   - Verify: Demand not created

6. **TC-DEMAND-006:** Post demand with 0 budget
   - Input: budgetMax = 0 or negative
   - Expected: Validation error OR allowed if budget is optional
   - Verify: Check business rule

#### Feature: View Demands (Driver Side)
**Test Cases:**
1. **TC-DEMAND-007:** View all demands as driver
   - Action: Navigate to /demands
   - Expected: List of active demands from all passengers
   - Verify: Only active demands shown

2. **TC-DEMAND-008:** Filter demands by city
   - Action: Apply city filter
   - Expected: Matching demands shown
   - Verify: Filter works

3. **TC-DEMAND-009:** Filter demands by date range
   - Action: Select date range
   - Expected: Demands with overlapping time windows shown
   - Verify: Date logic correct

4. **TC-DEMAND-010:** View demand details
   - Action: Click on demand card
   - Expected: Passenger info, route, time window, seats, budget
   - Verify: All info displayed

#### Feature: Respond to Demand (Driver Side)
**Test Cases:**
1. **TC-DEMAND-011:** Send offer to demand
   - Precondition: Logged in as driver, viewing demand
   - Action: Click "Send Offer", fill form (price, seats, message), submit
   - Expected: Response created with status "pending", passenger notified
   - Verify: Database record created, notification sent

2. **TC-DEMAND-012:** Send offer with price > budgetMax
   - Input: offerPrice = 50000, budgetMax = 30000
   - Expected: Warning shown but allowed (per code line 45-53 in demandResponses.controller)
   - Verify: Warning logged, response created

3. **TC-DEMAND-013:** Send offer with insufficient seats
   - Input: available_seats < demand.seats
   - Expected: Error "Not enough seats available"
   - Verify: Response not created (enforced line 56-61)

4. **TC-DEMAND-014:** Send duplicate offer to same demand
   - Action: Respond to demand already responded to
   - Expected: Error "You already responded to this demand"
   - Verify: UNIQUE constraint + check at line 35-42

5. **TC-DEMAND-015:** Attempt to respond to own demand
   - Precondition: Logged in user is demand owner
   - Action: Try to respond
   - Expected: Error "Cannot respond to your own demand"
   - Verify: Check at line 30-32

6. **TC-DEMAND-016:** View my responses as driver
   - Action: Navigate to "My Responses" page/tab
   - Expected: List of all my responses (pending, accepted, rejected)
   - Verify: Only my responses shown

#### Feature: Manage Demand Responses (Passenger Side)
**Test Cases:**
1. **TC-DEMAND-017:** View responses to my demand
   - Action: Click "View Responses" on my demand
   - Expected: List of all driver responses
   - Verify: Only responses for my demand shown

2. **TC-DEMAND-018:** Accept response
   - Precondition: Response status = pending
   - Action: Click "Accept", confirm
   - Expected: Response status → accepted, driver notified, other responses auto-rejected, demand deactivated
   - Verify: Line 233-245 logic executed correctly

3. **TC-DEMAND-019:** Reject response
   - Precondition: Response status = pending
   - Action: Click "Reject", confirm
   - Expected: Response status → rejected, driver notified
   - Verify: Other responses still pending

4. **TC-DEMAND-020:** Accept multiple responses (should fail)
   - Action: Try to accept second response after accepting first
   - Expected: Error "Demand already has accepted response" OR first acceptance auto-rejected others
   - Verify: Only one acceptance allowed

5. **TC-DEMAND-021:** View accepted response becomes a booking (if applicable)
   - Action: Accept response, check bookings page
   - Expected: Booking created OR response acceptance IS the booking
   - Verify: Clarify if demand workflow creates booking or replaces it

---

### Messaging Features

#### Feature: Send Message
**Test Cases:**
1. **TC-MSG-001:** Send message to driver (from booking)
   - Precondition: Have booking with driver
   - Action: Click "Message Driver", type message, send
   - Expected: Message sent, appears in conversation
   - Verify: Database record created, recipient notified

2. **TC-MSG-002:** Send message to passenger (from booking)
   - Precondition: Have booking request from passenger
   - Action: Click "Message Passenger", send message
   - Expected: Message sent
   - Verify: Message delivered

3. **TC-MSG-003:** Send empty message
   - Action: Submit without content
   - Expected: Button disabled OR error "Message cannot be empty"
   - Verify: Empty message not sent

4. **TC-MSG-004:** Send message > 2000 characters
   - Action: Paste very long message
   - Expected: Error "Message too long (max 2000 characters)"
   - Verify: Character limit enforced (line 73 in init-db.sql)

5. **TC-MSG-005:** Send message to self
   - Action: Try to message own user ID
   - Expected: Error "Cannot message yourself"
   - Verify: Check prevented (messages.controller.js has this check)

#### Feature: View Conversations
**Test Cases:**
1. **TC-MSG-006:** View conversation list
   - Action: Navigate to /messages
   - Expected: List of all conversations with recent message preview
   - Verify: Sorted by recent activity

2. **TC-MSG-007:** View conversation thread
   - Action: Click on conversation
   - Expected: Full message history with that user
   - Verify: Messages in chronological order

3. **TC-MSG-008:** View unread message count
   - Action: Check notification badge
   - Expected: Count of unread messages shown
   - Verify: Count accurate, updates in real-time

4. **TC-MSG-009:** Mark messages as read
   - Action: Open conversation
   - Expected: Messages marked read, badge count decreases
   - Verify: is_read updated in database

---

### Rating Features

#### Feature: Rate User After Ride
**Test Cases:**
1. **TC-RATE-001:** Rate driver after completed ride
   - Precondition: Booking status = completed, not yet rated
   - Action: Click "Rate Driver", select stars (1-5), add comment (optional), submit
   - Expected: Rating created, driver's avg rating updated
   - Verify: Database record, calculation correct

2. **TC-RATE-002:** Rate passenger after completed ride
   - Precondition: Driver with completed booking
   - Action: Rate passenger
   - Expected: Rating created
   - Verify: Passenger can see rating

3. **TC-RATE-003:** Attempt to rate before ride completes
   - Precondition: Booking status = confirmed (not completed)
   - Action: Try to rate
   - Expected: Button hidden OR error "Cannot rate before ride completes"
   - Verify: Rating prevented

4. **TC-RATE-004:** Attempt to rate twice
   - Action: Rate same booking/user again
   - Expected: Error "You already rated this ride"
   - Verify: UNIQUE constraint prevents duplicate

5. **TC-RATE-005:** Rate with 0 stars
   - Action: Submit rating with 0 stars
   - Expected: Validation error "Rating must be 1-5"
   - Verify: CHECK constraint enforces (line 83 in init-db.sql)

6. **TC-RATE-006:** Rate with 6 stars
   - Action: Submit rating > 5
   - Expected: Validation error
   - Verify: CHECK constraint enforces

7. **TC-RATE-007:** Edit rating
   - Action: Update previously submitted rating
   - Expected: Rating updated (if allowed) OR error "Cannot edit rating"
   - Verify: Check business rule

8. **TC-RATE-008:** View user's average rating
   - Action: View user profile
   - Expected: Avg rating displayed (e.g., 4.7/5.0)
   - Verify: Calculation accurate

9. **TC-RATE-009:** View user's rating distribution
   - Action: View detailed ratings
   - Expected: Breakdown of 5-star, 4-star, etc. counts
   - Verify: Stats accurate

---

## User Journey Test Scenarios

### Journey 1: Complete Offer Workflow (Happy Path)

**Actors:** Alice (Driver), Bob (Passenger)

**Steps:**
1. **Alice registers as driver**
   - Alice goes to Toosila website
   - Clicks "Register"
   - Fills form: Name="Alice", Email="alice@example.com", Password="password123", Role="Driver"
   - Submits form
   - **Expected:** Account created, logged in automatically, sees driver-specific home page

2. **Alice posts an offer**
   - Alice clicks "Post Offer" from home or navigation
   - Fills form:
     - From: Baghdad
     - To: Erbil
     - Date: Tomorrow
     - Time: 10:00 AM
     - Seats: 3
     - Price: 25000 IQD per seat
   - Submits form
   - **Expected:** Offer created, confirmation message shown, offer appears in "My Offers"

3. **Bob registers as passenger**
   - Bob goes to Toosila website
   - Registers: Name="Bob", Email="bob@example.com", Role="Passenger"
   - **Expected:** Account created, logged in, sees passenger-specific home page

4. **Bob searches for offers**
   - Bob enters search criteria: Baghdad → Erbil, Tomorrow
   - Clicks "Search"
   - **Expected:** Alice's offer appears in results

5. **Bob books Alice's offer**
   - Bob clicks "Book Now" on Alice's offer
   - Enters optional message: "I'll be at Al-Tahrir Square. Can you pick me up there?"
   - Confirms booking
   - **Expected:** Booking created with status "pending", Alice receives notification

6. **Alice receives booking notification**
   - Alice sees notification badge or popup
   - Clicks notification or navigates to "Bookings → Received"
   - **Expected:** Bob's booking request displayed with his message

7. **Alice accepts booking**
   - Alice reviews Bob's request
   - Clicks "Accept"
   - **Expected:** Booking status → confirmed, Bob receives notification, available seats decrease by 1 (3 → 2)

8. **Bob receives confirmation**
   - Bob sees notification or checks bookings page
   - **Expected:** Booking status shows "Confirmed", Alice's contact info now visible

9. **Alice and Bob message each other**
   - Bob clicks "Message Driver"
   - Types: "Hi Alice, thanks for accepting! See you tomorrow at 10 AM."
   - Alice receives message notification
   - Alice replies: "Great! I'll be there."
   - **Expected:** Conversation works, both can see messages

10. **Ride happens (simulated by time passing)**
    - Assume ride completed
    - **Expected:** Booking status can be updated to "completed" (manually or automated)

11. **Bob rates Alice**
    - Bob navigates to bookings or receives prompt
    - Clicks "Rate Driver"
    - Selects 5 stars
    - Writes comment: "Excellent driver! Very punctual and friendly."
    - Submits rating
    - **Expected:** Rating saved, Alice's avg rating updates

12. **Alice rates Bob**
    - Alice rates Bob with 5 stars
    - Comment: "Great passenger, very polite!"
    - **Expected:** Rating saved, Bob's avg rating updates

**End-to-End Validation Points:**
- Alice can only see driver actions (post offer, view demands, respond to demands)
- Bob can only see passenger actions (book offers, post demands)
- Notification flow works at each step
- Seat count decreases correctly
- Ratings update user averages
- Messages are delivered and readable

---

### Journey 2: Complete Demand Workflow (Happy Path)

**Actors:** Carol (Passenger), Dave (Driver)

**Steps:**
1. **Carol registers as passenger**
   - Registers, logs in
   - **Expected:** Passenger home page shown

2. **Carol posts a demand**
   - Carol clicks "Request Ride" or similar
   - Fills form:
     - From: Basra
     - To: Najaf
     - Earliest time: Tomorrow 8:00 AM
     - Latest time: Tomorrow 6:00 PM (flexible window)
     - Seats: 2
     - Budget: 40000 IQD max
   - Submits demand
   - **Expected:** Demand created, appears in "My Demands"

3. **Dave registers as driver**
   - Registers as driver, logs in
   - **Expected:** Driver home page shown

4. **Dave discovers Carol's demand**
   - Dave navigates to "Demands" page (should show passenger ride requests)
   - Sees Carol's demand: Basra → Najaf, tomorrow, 2 seats, budget 40000 IQD
   - **Expected:** List of demands shown

5. **Dave responds to demand**
   - Dave clicks "Send Offer" on Carol's demand
   - Fills form:
     - Price: 35000 IQD per seat (within budget)
     - Available seats: 4 (more than Carol needs)
     - Message: "Hi Carol, I can take you tomorrow at 10 AM. Is that okay?"
   - Submits response
   - **Expected:** Response created with status "pending", Carol receives notification

6. **Carol receives response notification**
   - Carol sees notification
   - Navigates to "My Demands" → "View Responses"
   - **Expected:** Dave's response displayed with his offer details

7. **Carol reviews and accepts Dave's response**
   - Carol reviews Dave's price (35000 IQD), seats (4), and message
   - Clicks "Accept"
   - **Expected:**
     - Response status → accepted
     - All other responses (if any) → auto-rejected
     - Demand deactivated (is_active = false)
     - Dave receives acceptance notification

8. **Dave receives acceptance**
   - Dave sees notification
   - Checks "My Responses"
   - **Expected:** Carol's demand shows "Accepted" status

9. **Carol and Dave message each other**
   - Carol messages Dave to confirm pickup location
   - Dave replies with confirmation
   - **Expected:** Messaging works

10. **Ride happens and completion**
    - Ride completes
    - **Expected:** Can mark as completed

11. **Both rate each other**
    - Carol rates Dave 5 stars
    - Dave rates Carol 4 stars
    - **Expected:** Ratings saved, averages updated

**End-to-End Validation Points:**
- Demand workflow is separate from offer workflow
- Drivers see demands, passengers see offers
- Only one response can be accepted per demand
- Accepting one response auto-rejects others
- Demand deactivates after acceptance
- Notification flow works correctly

---

### Journey 3: Booking Cancellation (Sad Path)

**Actors:** Eve (Passenger), Frank (Driver)

**Steps:**
1. Eve books Frank's offer (status: pending)
2. Eve changes mind before Frank accepts
3. Eve navigates to "My Bookings"
4. Eve clicks "Cancel Booking", confirms
5. **Expected:** Booking status → cancelled, Frank receives notification, seats NOT restored (they weren't reserved yet)

**Alternative:**
1. Eve books Frank's offer
2. Frank accepts (status: confirmed, seats now reserved)
3. Eve needs to cancel after confirmation
4. Eve clicks "Cancel Booking"
5. **Expected:** Warning shown (e.g., "Cancelling a confirmed booking may affect your rating"), Eve confirms
6. **Expected:** Booking status → cancelled, Frank notified, seats restored to offer

---

### Journey 4: Driver Rejects Booking (Sad Path)

**Actors:** Grace (Passenger), Henry (Driver)

**Steps:**
1. Grace books Henry's offer (status: pending)
2. Henry reviews Grace's profile and decides not to accept
3. Henry clicks "Reject"
4. **Expected:** Booking status → cancelled, Grace receives notification with reason (if provided)

---

### Journey 5: Over-Booking Prevention (Edge Case)

**Actors:** Ivy, Jack, Kate (all Passengers), Leo (Driver)

**Setup:** Leo posts offer with 1 seat available

**Steps:**
1. Ivy books Leo's offer (status: pending, seats still showing 1?)
2. Jack simultaneously tries to book same offer
3. **Expected:** One of two scenarios:
   - **Scenario A:** Both bookings created as "pending", Leo must choose one to accept
   - **Scenario B:** First booking reserves seat, second booking fails with "No seats available"
4. **Verification:** Seats cannot go negative, no overbooking occurs

---

### Journey 6: Concurrent Response Acceptance (Edge Case)

**Actors:** Mia (Passenger), Ned & Olivia (Drivers)

**Setup:** Mia posts demand, receives responses from Ned and Olivia

**Steps:**
1. Mia reviews both responses
2. Mia accidentally or intentionally clicks "Accept" on both responses at nearly the same time
3. **Expected:** Only first acceptance processed, second fails with error "Demand already has accepted response"
4. **Verification:** Only one response can be accepted, others auto-rejected

---

## Expected Behavior Matrix

### User Role vs Action Matrix

| User Action | Passenger (isDriver=false) | Driver (isDriver=true) | Expected Result |
|-------------|---------------------------|----------------------|-----------------|
| View Home Page | ✅ Shows "Find Ride" + "Request Ride" | ✅ Shows "Post Offer" + "View Demands" | Role-specific options |
| Post Offer | ❌ Option hidden / 403 if attempted | ✅ Allowed | Permission enforced |
| View Offers List | ✅ Allowed (to book) | ❓ Unclear (should see demands?) | **LOGIC ISSUE** |
| Book Offer | ✅ Allowed | ❌ Blocked (line 199-202 ViewOffers.js) | Correct |
| Post Demand | ✅ Allowed | ❓ Unclear (should not post?) | **LOGIC ISSUE** |
| View Demands List | ❓ Unclear (own demands only?) | ✅ Allowed (to respond) | Needs clarification |
| Respond to Demand | ❌ Not allowed | ✅ Allowed | Correct |
| Accept Booking (on offer) | ❌ Not allowed | ✅ Allowed (own offers only) | Correct |
| Accept Response (on demand) | ✅ Allowed (own demands only) | ❌ Not allowed | Correct |
| Cancel Own Booking | ✅ Allowed | ❌ N/A | Correct |
| Rate Other User | ✅ After completed ride | ✅ After completed ride | Correct |
| Send Message | ✅ Allowed | ✅ Allowed | Correct |

---

## Edge Case Testing

### Edge Case 1: Zero Seats Available
**Scenario:** Offer has 0 seats left after all bookings accepted

**Test:**
1. Driver posts offer with 2 seats
2. Passenger A books, driver accepts (seats → 1)
3. Passenger B books, driver accepts (seats → 0)
4. Passenger C tries to book
5. **Expected:** Book button disabled OR error "No seats available"

### Edge Case 2: Negative Seat Count (Race Condition)
**Scenario:** Concurrent booking acceptances could cause negative seats

**Test:**
1. Driver posts offer with 1 seat
2. Two passengers (D and E) book simultaneously
3. Driver accepts both bookings in quick succession
4. **Expected:** Second acceptance fails with error OR seats protected by database transaction

### Edge Case 3: Past Departure Time
**Scenario:** User tries to book/post offer with past time

**Test:**
1. Wait for offer's departure time to pass
2. New passenger tries to book expired offer
3. **Expected:** Offer hidden from listings OR error "Offer has expired"

### Edge Case 4: User Deletes Account with Active Bookings
**Scenario:** User deletes account, what happens to their bookings?

**Test:**
1. Passenger books offer
2. Passenger deletes account
3. **Expected:** Bookings cascade deleted (ON DELETE CASCADE) OR booking orphaned
4. **Verification:** Driver sees booking cancelled or deleted

### Edge Case 5: Driver Changes Offer Price After Bookings
**Scenario:** Driver edits offer price after bookings accepted

**Test:**
1. Passenger books offer at 25000 IQD
2. Booking confirmed
3. Driver changes price to 30000 IQD
4. **Expected:** Existing bookings retain original price OR price update blocked if bookings exist

### Edge Case 6: Budget Exceeded in Demand Response
**Scenario:** Driver offers price > passenger's budget_max

**Test:**
1. Passenger posts demand with budget_max = 30000 IQD
2. Driver responds with offer_price = 40000 IQD
3. **Expected:** Warning logged but response created (line 45-53 demandResponses.controller.js)
4. **Question:** Should this be blocked instead of warned?

### Edge Case 7: Demand Time Window Already Passed
**Scenario:** Demand's latest_time has passed

**Test:**
1. Passenger posts demand with latest_time = tomorrow
2. Wait until tomorrow passes
3. Driver tries to respond
4. **Expected:** Response blocked OR demand auto-deactivated

### Edge Case 8: Rating Without Completed Ride
**Scenario:** User tries to rate before ride happens

**Test:**
1. Booking status = confirmed (not completed)
2. Passenger tries to rate driver
3. **Expected:** Rating blocked with error "Ride must be completed first"

### Edge Case 9: Self-Interaction Attempts
**Scenario:** User tries to interact with own entities in invalid ways

**Test Cases:**
- Book own offer (if account can be both driver and passenger)
- Respond to own demand
- Message self
- **Expected:** All blocked with appropriate errors

### Edge Case 10: Duplicate Offer Posting
**Scenario:** Driver posts same offer twice

**Test:**
1. Driver posts offer: Baghdad → Erbil, tomorrow 10 AM
2. Driver posts identical offer again
3. **Expected:** Allowed (no constraint) OR warning shown
4. **Question:** Should duplicates be prevented?

---

## Integration Testing

### Integration Test 1: Booking → Messaging Flow
**Test:** User books offer, then messages driver from booking page

**Steps:**
1. Passenger books offer
2. Clicks "Message Driver" button from booking card
3. **Expected:** Redirected to /messages with conversation open to driver
4. **Verify:** Correct recipient, ride context available

### Integration Test 2: Demand Response → Notification → Acceptance
**Test:** Full notification flow for demand workflow

**Steps:**
1. Driver responds to demand
2. Passenger receives notification (Socket.io)
3. Passenger clicks notification
4. **Expected:** Redirected to demands page with responses modal open
5. Passenger accepts response
6. Driver receives acceptance notification
7. **Verify:** All notifications delivered, all redirects work

### Integration Test 3: Rating → Profile Update
**Test:** Rating updates user's average rating in profile

**Steps:**
1. Passenger rates driver 5 stars
2. Navigate to driver's profile page
3. **Expected:** Rating average reflects new rating
4. **Verify:** Calculation accurate, count incremented

### Integration Test 4: Booking Cancellation → Seat Restoration
**Test:** Cancelling confirmed booking restores seats

**Steps:**
1. Passenger books offer (1 seat), driver accepts
2. Check offer: seats decreased by 1
3. Passenger cancels booking
4. Check offer: seats increased by 1
5. **Verify:** Seat count accurate, offer available again

### Integration Test 5: Demand Acceptance → Auto-Rejection
**Test:** Accepting one response auto-rejects others

**Steps:**
1. Passenger posts demand
2. Three drivers respond
3. Passenger accepts first response
4. Check other two responses: status = rejected
5. Check demand: is_active = false
6. **Verify:** Only one acceptance, others auto-rejected, demand deactivated

---

## Regression Testing

### Regression Test Suite (Run After Every Change)

#### Smoke Tests (Quick Validation)
1. User can register
2. User can login
3. Driver can post offer
4. Passenger can view offers
5. Passenger can book offer
6. Messages can be sent
7. Ratings can be submitted

#### Full Regression (Comprehensive)
1. Re-run all P0 (critical) test cases from feature catalog
2. Re-run all user journey scenarios
3. Spot-check P1 (high) test cases
4. Verify no new bugs introduced

#### Regression Checklist After Bug Fix
When a bug is fixed:
1. [ ] Re-test the exact scenario that failed
2. [ ] Test related features (same controller, same table)
3. [ ] Test opposite user role (if bug affected driver, test passenger)
4. [ ] Test edge cases around the fix
5. [ ] Run smoke test suite
6. [ ] Update test documentation if behavior changed

---

## Testing Tools & Environment

### Recommended Testing Tools
1. **Browser DevTools** - Network tab, Console, Elements inspector
2. **Postman / Insomnia** - API endpoint testing
3. **Database Client** - Direct database inspection (pgAdmin, DBeaver)
4. **Screenshot Tool** - Capture bugs for reporting
5. **Screen Recorder** - Video evidence for complex bugs

### Test Environment Setup
1. **Test Accounts:**
   - Create 5 passenger accounts
   - Create 5 driver accounts
   - Use realistic names and data

2. **Test Data:**
   - Create 10+ offers covering various routes and dates
   - Create 10+ demands
   - Create some bookings in different states

3. **Browser Testing:**
   - Primary: Chrome
   - Secondary: Firefox, Safari
   - Mobile: iOS Safari, Android Chrome

### Test Data Guidelines
- Use realistic Iraqi cities: Baghdad, Basra, Erbil, Najaf, Karbala, Mosul, Sulaymaniyah
- Use realistic prices: 15000-50000 IQD per seat
- Use realistic dates: Today, tomorrow, next week
- Use realistic seat counts: 1-4 seats

---

## Bug Reporting Template

### Bug Report Format

**Title:** [Component] Brief description

**Severity:** P0 / P1 / P2 / P3

**Environment:**
- Browser: Chrome 119
- OS: Windows 11
- Account: Passenger account (bob@example.com)

**Steps to Reproduce:**
1. Login as passenger
2. Navigate to /offers
3. Click "Book Now" on any offer
4. [specific action]

**Expected Result:**
Booking should be created with status "pending", driver should receive notification

**Actual Result:**
Error message "Cannot read property 'id' of undefined", no booking created

**Evidence:**
- Screenshot: [attach]
- Console errors: [paste]
- Network request: [paste]

**Additional Notes:**
This only happens when offer has 0 seats available. Works fine with seats > 0.

---

## Testing Metrics & Success Criteria

### Metrics to Track
1. **Test Coverage:** % of features tested
2. **Pass Rate:** % of tests passing
3. **Bug Density:** Bugs found per feature
4. **Critical Bug Rate:** % of P0/P1 bugs
5. **Regression Rate:** New bugs introduced by fixes

### Success Criteria
- ✅ 100% of P0 features tested and passing
- ✅ 95%+ of P1 features tested and passing
- ✅ No P0 bugs open at launch
- ✅ <5 P1 bugs open at launch
- ✅ All user journeys completable without errors
- ✅ All role permissions enforced
- ✅ All edge cases handled gracefully

---

**END OF EXPERT TESTING AGENT GUIDE**

**Usage:** Follow this guide systematically to test every feature and user journey. Document all findings clearly. Prioritize fixes based on severity. Retest after fixes to prevent regression.
