-- Initialize Toosila Database Schema

-- Users table (according to architecture.md)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_driver BOOLEAN DEFAULT false,
    language_preference VARCHAR(10) DEFAULT 'ar',
    rating_avg DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demands table (according to architecture.md)
-- Updated to use INTEGER IDs instead of UUID
CREATE TABLE IF NOT EXISTS demands (
    id SERIAL PRIMARY KEY,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_city VARCHAR(255) NOT NULL,
    to_city VARCHAR(255) NOT NULL,
    earliest_time TIMESTAMPTZ NOT NULL,
    latest_time TIMESTAMPTZ NOT NULL,
    seats INTEGER DEFAULT 1,
    budget_max DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offers table (according to architecture.md)
-- Updated to use INTEGER IDs instead of UUID
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_city VARCHAR(255) NOT NULL,
    to_city VARCHAR(255) NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    seats INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (according to architecture.md)
-- Updated to use INTEGER IDs instead of UUID
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(offer_id, passenger_id)
);

-- Messages table (according to architecture.md)
-- Updated ride_id to INTEGER to reference demands/offers
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_type VARCHAR(10) NOT NULL, -- 'offer' or 'demand'
    ride_id INTEGER NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) <= 2000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table (according to architecture.md)
-- Updated ride_id to INTEGER to reference demands/offers
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id INTEGER NOT NULL, -- can be offer_id or demand_id (INTEGER)
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ride_id, from_user_id)
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demand responses table (responses from drivers to passenger demands)
-- Updated to use INTEGER IDs instead of UUID
CREATE TABLE IF NOT EXISTS demand_responses (
    id SERIAL PRIMARY KEY,
    demand_id INTEGER NOT NULL REFERENCES demands(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offer_price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL CHECK (available_seats >= 1 AND available_seats <= 7),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(demand_id, driver_id)
);

-- Notifications table (user notifications for various events)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_notification_type CHECK (type IN (
        'demand_response',
        'response_accepted',
        'response_rejected',
        'booking_created',
        'booking_accepted',
        'booking_rejected',
        'new_message',
        'trip_reminder'
    ))
);

-- Insert default categories (ride-sharing specific)
INSERT INTO categories (name, description, icon) VALUES
('بغداد', 'رحلات داخل بغداد', 'city'),
('أربيل', 'رحلات إلى أربيل', 'mountain'),
('البصرة', 'رحلات إلى البصرة', 'water'),
('الموصل', 'رحلات إلى الموصل', 'building'),
('كربلاء', 'رحلات إلى كربلاء', 'star'),
('النجف', 'رحلات إلى النجف', 'book'),
('السليمانية', 'رحلات إلى السليمانية', 'tree'),
('دهوك', 'رحلات إلى دهوك', 'mountain'),
('الناصرية', 'رحلات إلى الناصرية', 'river'),
('أخرى', 'رحلات أخرى', 'map')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_demands_passenger_id ON demands(passenger_id);
CREATE INDEX IF NOT EXISTS idx_demands_from_city ON demands(from_city);
CREATE INDEX IF NOT EXISTS idx_demands_to_city ON demands(to_city);
CREATE INDEX IF NOT EXISTS idx_demands_is_active ON demands(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_driver_id ON offers(driver_id);
CREATE INDEX IF NOT EXISTS idx_offers_from_city ON offers(from_city);
CREATE INDEX IF NOT EXISTS idx_offers_to_city ON offers(to_city);
CREATE INDEX IF NOT EXISTS idx_offers_departure_time ON offers(departure_time);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX IF NOT EXISTS idx_bookings_offer_id ON bookings(offer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_ride_type_ride_id ON messages(ride_type, ride_id);
CREATE INDEX IF NOT EXISTS idx_ratings_to_user_id ON ratings(to_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ride_id ON ratings(ride_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_demand_responses_demand_id ON demand_responses(demand_id);
CREATE INDEX IF NOT EXISTS idx_demand_responses_driver_id ON demand_responses(driver_id);
CREATE INDEX IF NOT EXISTS idx_demand_responses_status ON demand_responses(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type_read ON notifications(user_id, type, is_read, created_at DESC);
