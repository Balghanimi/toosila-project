-- Migration 011: Add Driver Vehicles System
-- This migration adds vehicle information for drivers

-- Create driver_vehicles table
CREATE TABLE IF NOT EXISTS driver_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Vehicle Information
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  color VARCHAR(50),
  license_plate VARCHAR(20) NOT NULL,

  -- Vehicle Specifications
  seats INTEGER NOT NULL DEFAULT 4,
  vehicle_type VARCHAR(50),
  fuel_type VARCHAR(20),

  -- Documentation
  registration_number VARCHAR(100),
  registration_expiry DATE,
  registration_document_url TEXT,
  vehicle_image_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_year CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  CONSTRAINT valid_seats CHECK (seats >= 1 AND seats <= 50),
  CONSTRAINT valid_vehicle_type CHECK (vehicle_type IN ('Sedan', 'SUV', 'Van', 'Hatchback', 'Coupe', 'Pickup', 'Bus', 'Minivan', 'Other')),
  CONSTRAINT valid_fuel_type CHECK (fuel_type IN ('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG')),
  UNIQUE(license_plate)
);

-- Add vehicle_id to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS vehicle_id UUID REFERENCES driver_vehicles(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_driver ON driver_vehicles(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_license_plate ON driver_vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_active ON driver_vehicles(is_active);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_verified ON driver_vehicles(is_verified);
CREATE INDEX IF NOT EXISTS idx_driver_vehicles_primary ON driver_vehicles(driver_id, is_primary) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_offers_vehicle ON offers(vehicle_id);

-- Add comments for documentation
COMMENT ON TABLE driver_vehicles IS 'Vehicle information for drivers';
COMMENT ON COLUMN driver_vehicles.make IS 'Vehicle manufacturer (e.g., Toyota, Hyundai)';
COMMENT ON COLUMN driver_vehicles.model IS 'Vehicle model (e.g., Corolla, Sonata)';
COMMENT ON COLUMN driver_vehicles.year IS 'Manufacturing year';
COMMENT ON COLUMN driver_vehicles.license_plate IS 'Vehicle registration plate number (unique)';
COMMENT ON COLUMN driver_vehicles.seats IS 'Number of passenger seats available';
COMMENT ON COLUMN driver_vehicles.vehicle_type IS 'Type of vehicle: Sedan, SUV, Van, etc.';
COMMENT ON COLUMN driver_vehicles.fuel_type IS 'Fuel type: Petrol, Diesel, Electric, Hybrid, etc.';
COMMENT ON COLUMN driver_vehicles.is_primary IS 'Primary vehicle for this driver';
COMMENT ON COLUMN driver_vehicles.is_verified IS 'Whether vehicle has been verified by admin';

COMMENT ON COLUMN offers.vehicle_id IS 'Associated vehicle for this offer';
