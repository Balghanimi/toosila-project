-- Migration 010: Add Emergency Alert System
-- This migration adds SOS/Emergency button functionality for user safety

-- Create emergency_alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Alert Details
  alert_type VARCHAR(50) NOT NULL DEFAULT 'sos',
  severity VARCHAR(20) NOT NULL DEFAULT 'high',
  status VARCHAR(20) NOT NULL DEFAULT 'active',

  -- Location (at time of alert)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_accuracy DECIMAL(6, 2),

  -- Additional Info
  message TEXT,
  audio_recording_url TEXT,

  -- Response
  acknowledged_at TIMESTAMP,
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_alert_type CHECK (alert_type IN ('sos', 'panic', 'accident', 'harassment', 'other')),
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_alarm'))
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Contact Info
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  relationship VARCHAR(100),
  email VARCHAR(255),

  -- Settings
  notify_on_trip_start BOOLEAN DEFAULT false,
  notify_on_sos BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user ON emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created ON emergency_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_booking ON emergency_alerts(booking_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_active ON emergency_alerts(status, created_at DESC) WHERE status IN ('active', 'acknowledged');

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_notify ON emergency_contacts(user_id, notify_on_sos) WHERE notify_on_sos = true;

-- Add comments for documentation
COMMENT ON TABLE emergency_alerts IS 'SOS/Emergency alerts triggered by users during trips';
COMMENT ON TABLE emergency_contacts IS 'User emergency contacts to notify during SOS alerts';

COMMENT ON COLUMN emergency_alerts.alert_type IS 'Type of emergency: sos, panic, accident, harassment, other';
COMMENT ON COLUMN emergency_alerts.severity IS 'Severity level: low, medium, high, critical';
COMMENT ON COLUMN emergency_alerts.status IS 'Alert status: active, acknowledged, resolved, false_alarm';
COMMENT ON COLUMN emergency_alerts.latitude IS 'User latitude at time of alert';
COMMENT ON COLUMN emergency_alerts.longitude IS 'User longitude at time of alert';

COMMENT ON COLUMN emergency_contacts.notify_on_trip_start IS 'Send notification when user starts a trip';
COMMENT ON COLUMN emergency_contacts.notify_on_sos IS 'Send notification when user triggers SOS alert';
