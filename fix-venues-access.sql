-- =====================================================
-- FIX VENUES ACCESS - Allow public reading of venues
-- =====================================================

-- Drop existing policies that might be blocking access
DROP POLICY IF EXISTS "Enable read access for all users" ON venues;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON venues;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON venues;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON venues;
DROP POLICY IF EXISTS "venues_select_policy" ON venues;
DROP POLICY IF EXISTS "venues_insert_policy" ON venues;
DROP POLICY IF EXISTS "venues_update_policy" ON venues;
DROP POLICY IF EXISTS "venues_delete_policy" ON venues;

-- Create simple policies that allow public access to read venues
CREATE POLICY "Allow public read access to active venues" ON venues
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users to insert venues" ON venues
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow venue owners to update their venues" ON venues
  FOR UPDATE USING (auth.uid() = owner_id OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Allow venue owners to delete their venues" ON venues
  FOR DELETE USING (auth.uid() = owner_id OR auth.jwt() ->> 'role' = 'super_admin');

-- Ensure RLS is enabled
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Check if venues table has required columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'venues' 
  AND table_schema = 'public'
  AND column_name IN ('is_active', 'owner_id', 'created_at');

-- Add some sample venues if the table is empty
INSERT INTO venues (name, type, city, price, rating, reviews, image, amenities, capacity, description, is_active, owner_id)
SELECT 
  'Helsinki Central Park',
  'park',
  'Helsinki', 
  0,
  4.5,
  123,
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071',
  ARRAY['free_wifi', 'parking', 'restrooms'],
  200,
  'Beautiful central park in the heart of Helsinki',
  true,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM venues LIMIT 1);

INSERT INTO venues (name, type, city, price, rating, reviews, image, amenities, capacity, description, is_active, owner_id)
SELECT 
  'Tampere Sports Hall',
  'sports_facility',
  'Tampere',
  50,
  4.2,
  89,
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070',
  ARRAY['parking', 'equipment_rental', 'changing_rooms'],
  100,
  'Modern sports facility with all amenities',
  true,
  NULL
WHERE (SELECT COUNT(*) FROM venues) < 2;

INSERT INTO venues (name, type, city, price, rating, reviews, image, amenities, capacity, description, is_active, owner_id)
SELECT 
  'Turku Community Center',
  'community_center',
  'Turku',
  30,
  4.0,
  45,
  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069',
  ARRAY['free_wifi', 'kitchen', 'projector'],
  80,
  'Versatile community space for events and meetings',
  true,
  NULL
WHERE (SELECT COUNT(*) FROM venues) < 3;

-- Verify the setup
SELECT 'Venues table setup complete!' as status;
SELECT COUNT(*) as total_venues FROM venues;
SELECT COUNT(*) as active_venues FROM venues WHERE is_active = true;

