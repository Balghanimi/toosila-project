# Toosila Database - Complete Table Reference

## Table 1: users
Purpose: User accounts (passengers and drivers)

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- name: VARCHAR(255) NOT NULL
- email: VARCHAR(255) UNIQUE NOT NULL (Index: idx_users_email)
- password_hash: VARCHAR(255) NOT NULL
- is_driver: BOOLEAN DEFAULT false
- language_preference: VARCHAR(10) DEFAULT 'ar'
- rating_avg: DECIMAL(3,2) DEFAULT 0.00
- rating_count: INTEGER DEFAULT 0
- is_verified: BOOLEAN DEFAULT false
- verification_status: VARCHAR(20) DEFAULT 'unverified' (Index: idx_users_verification_status)
- verification_date: TIMESTAMP
- verified_by: UUID FK REFERENCES users(id)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## Table 2: categories
Purpose: Ride categories (cities)

Columns:
- id: SERIAL PRIMARY KEY
- name: VARCHAR(100) UNIQUE NOT NULL
- description: TEXT
- icon: VARCHAR(50)
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Default Data: 10 Iraqi cities

---

## Table 3: demands
Purpose: Passenger ride requests

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- passenger_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- from_city: VARCHAR(255) NOT NULL (Index)
- to_city: VARCHAR(255) NOT NULL (Index)
- earliest_time: TIMESTAMPTZ NOT NULL
- latest_time: TIMESTAMPTZ NOT NULL
- seats: INTEGER DEFAULT 1
- budget_max: DECIMAL(10,2)
- is_active: BOOLEAN DEFAULT true (Index)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## Table 4: offers
Purpose: Driver ride offers

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- driver_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- from_city: VARCHAR(255) NOT NULL (Index)
- to_city: VARCHAR(255) NOT NULL (Index)
- departure_time: TIMESTAMPTZ NOT NULL (Index)
- seats: INTEGER NOT NULL
- price: DECIMAL(10,2) NOT NULL
- is_active: BOOLEAN DEFAULT true (Index)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## Table 5: bookings
Purpose: Passenger bookings on driver offers

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- offer_id: UUID NOT NULL FK REFERENCES offers(id) ON DELETE CASCADE (Index)
- passenger_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- seats: INTEGER DEFAULT 1
- message: TEXT
- status: VARCHAR(20) DEFAULT 'pending' (Index)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- Unique Constraint: (offer_id, passenger_id)

Status Values: pending, accepted, rejected, cancelled

---

## Table 6: messages
Purpose: Communication between users

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- ride_type: VARCHAR(10) NOT NULL (Composite Index)
- ride_id: UUID NOT NULL (Composite Index)
- sender_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- content: TEXT NOT NULL CHECK (length(content) <= 2000)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

ride_type Values: offer, demand

---

## Table 7: ratings
Purpose: User ratings and reviews

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- ride_id: UUID NOT NULL (Index)
- from_user_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE
- to_user_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- rating: INTEGER CHECK (rating >= 1 AND rating <= 5)
- comment: TEXT
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- Unique Constraint: (ride_id, from_user_id)

---

## Table 8: refresh_tokens
Purpose: JWT refresh tokens for authentication

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- token: VARCHAR(255) NOT NULL
- expires_at: TIMESTAMP NOT NULL
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## Table 9: demand_responses
Purpose: Driver responses to passenger demands

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- demand_id: UUID NOT NULL FK REFERENCES demands(id) ON DELETE CASCADE (Index)
- driver_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- offer_price: DECIMAL(10,2) NOT NULL CHECK (offer_price >= 0)
- available_seats: INTEGER NOT NULL CHECK (1 <= available_seats <= 7)
- message: TEXT
- status: VARCHAR(20) DEFAULT 'pending' (Index)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- Unique Constraint: (demand_id, driver_id)
- Composite Index: (demand_id, status)

Status Values: pending, accepted, rejected, cancelled
Trigger: Auto-updates updated_at on UPDATE

---

## Table 10: notifications
Purpose: User notifications for system events

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- type: VARCHAR(50) NOT NULL CHECK (type IN (...)) (Index)
- title: VARCHAR(200) NOT NULL
- message: TEXT NOT NULL
- data: JSONB
- is_read: BOOLEAN DEFAULT FALSE (Partial Index WHERE is_read = FALSE)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP (Index DESC)
- Composite Index: (user_id, type, is_read, created_at DESC)

Type Values: demand_response, response_accepted, response_rejected, booking_created, booking_accepted, booking_rejected, new_message, trip_reminder

---

## Table 11: verification_documents
Purpose: ID verification documents (Iraqi ID, Passport)

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- document_type: VARCHAR(20) NOT NULL CHECK (type IN (iraqi_id, passport))
- document_number: VARCHAR(100)
- front_image_url: TEXT NOT NULL
- back_image_url: TEXT
- full_name: VARCHAR(255)
- date_of_birth: DATE
- issue_date: DATE
- expiry_date: DATE
- issuing_country: VARCHAR(100) DEFAULT 'Iraq'
- status: VARCHAR(20) DEFAULT 'pending' (Index)
- rejection_reason: TEXT
- submitted_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- reviewed_at: TIMESTAMP
- reviewed_by: UUID FK REFERENCES users(id)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Status Values: pending, approved, rejected

---

## Table 12: verification_audit_log
Purpose: Audit trail for verification actions

Columns:
- id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: UUID NOT NULL FK REFERENCES users(id) ON DELETE CASCADE (Index)
- document_id: UUID FK REFERENCES verification_documents(id) ON DELETE SET NULL (Index)
- action: VARCHAR(50) NOT NULL
- performed_by: UUID FK REFERENCES users(id)
- notes: TEXT
- metadata: JSONB
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Action Values: submitted, approved, rejected, resubmitted

---

## Summary of Indexes (26+)

### By Table:
Users: 2 indexes (email, verification_status)
Demands: 4 indexes (passenger_id, from_city, to_city, is_active)
Offers: 5 indexes (driver_id, from_city, to_city, departure_time, is_active)
Bookings: 3 indexes (passenger_id, offer_id, status)
Messages: 2 indexes (sender_id, ride_type+ride_id composite)
Ratings: 2 indexes (to_user_id, ride_id)
DemandResponses: 4 indexes (demand_id, driver_id, status, demand_id+status)
Notifications: 5 indexes (user_id, unread partial, created_at DESC, type, user_id+type+is_read+created_at)
RefreshTokens: 1 index (user_id)
VerificationDocuments: 2 indexes (user_id, status)
VerificationAuditLog: 2 indexes (user_id, document_id)

Total: 32+ indexes across all tables
