-- Create Test Offer for Booking System Testing
-- This creates a fresh offer with 4 available seats for testing

-- Step 1: Find or create a test driver user
DO $$
DECLARE
    test_driver_id UUID;
BEGIN
    -- Try to find an existing driver
    SELECT id INTO test_driver_id
    FROM users
    WHERE is_driver = true
    LIMIT 1;

    -- If no driver exists, create one
    IF test_driver_id IS NULL THEN
        INSERT INTO users (
            name,
            email,
            password_hash,
            is_driver,
            language_preference,
            rating_avg,
            rating_count
        ) VALUES (
            'سائق تجريبي',
            'driver-test-' || FLOOR(RANDOM() * 10000)::TEXT || '@test.com',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIIRvQJe9u', -- bcrypt hash of 'Test123456'
            true,
            'ar',
            4.5,
            10
        ) RETURNING id INTO test_driver_id;

        RAISE NOTICE 'Created new test driver with ID: %', test_driver_id;
    ELSE
        RAISE NOTICE 'Using existing driver with ID: %', test_driver_id;
    END IF;

    -- Step 2: Create test offer
    INSERT INTO offers (
        driver_id,
        from_city,
        to_city,
        departure_time,
        seats,
        price,
        is_active
    ) VALUES (
        test_driver_id,
        'بغداد',
        'كربلاء',
        (CURRENT_TIMESTAMP + INTERVAL '2 days')::TIMESTAMPTZ,
        4,  -- 4 total seats
        12000,
        true
    );

    RAISE NOTICE 'Created test offer: بغداد → كربلاء, 4 seats, 12000 IQD';

END $$;

-- Verify the new offer with available_seats calculation
SELECT
    o.id,
    o.from_city || ' → ' || o.to_city as route,
    o.departure_time,
    o.seats as total_seats,
    (o.seats - COALESCE(SUM(b.seats) FILTER (WHERE b.status IN ('pending', 'accepted')), 0))::int as available_seats,
    o.price,
    u.name as driver_name
FROM offers o
JOIN users u ON o.driver_id = u.id
LEFT JOIN bookings b ON o.id = b.offer_id
WHERE o.is_active = true
GROUP BY o.id, u.name
ORDER BY o.created_at DESC
LIMIT 5;
