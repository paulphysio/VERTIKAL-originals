-- Migration: Update shipping_zones table to support hierarchical structure
-- This adds country, state, city fields and delivery time estimates

-- Add new columns
ALTER TABLE shipping_zones
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS lga text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS delivery_time_min integer,
ADD COLUMN IF NOT EXISTS delivery_time_max integer,
ADD COLUMN IF NOT EXISTS is_active boolean default true,
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now()) not null,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Set default country for existing zones
UPDATE shipping_zones
SET country = 'Nigeria'
WHERE country IS NULL;

-- Set default delivery times for existing zones
UPDATE shipping_zones
SET delivery_time_min = 3, delivery_time_max = 5
WHERE delivery_time_min IS NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_shipping_zones_updated_at ON shipping_zones;
CREATE TRIGGER update_shipping_zones_updated_at
    BEFORE UPDATE ON shipping_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_shipping_zones_country ON shipping_zones(country);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_state ON shipping_zones(state);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_lga ON shipping_zones(lga);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_is_active ON shipping_zones(is_active);

-- Comment on columns
COMMENT ON COLUMN shipping_zones.country IS 'Country name (e.g., Nigeria)';
COMMENT ON COLUMN shipping_zones.state IS 'State or region name';
COMMENT ON COLUMN shipping_zones.lga IS 'Local Government Area name';
COMMENT ON COLUMN shipping_zones.city IS 'City or town name';
COMMENT ON COLUMN shipping_zones.delivery_time_min IS 'Minimum delivery time in days';
COMMENT ON COLUMN shipping_zones.delivery_time_max IS 'Maximum delivery time in days';
COMMENT ON COLUMN shipping_zones.is_active IS 'Whether this shipping zone is active for use';
