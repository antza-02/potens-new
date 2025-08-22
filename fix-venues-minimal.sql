-- =====================================================
-- MINIMAL VENUES ACCESS FIX - Only uses existing columns
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON venues;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON venues;
DROP POLICY IF EXISTS "Enable update for users based on owner_id" ON venues;
DROP POLICY IF EXISTS "Enable delete for users based on owner_id" ON venues;
DROP POLICY IF EXISTS "venues_select_policy" ON venues;
DROP POLICY IF EXISTS "venues_insert_policy" ON venues;
DROP POLICY IF EXISTS "venues_update_policy" ON venues;
DROP POLICY IF EXISTS "venues_delete_policy" ON venues;
DROP POLICY IF EXISTS "Allow public read access to active venues" ON venues;
DROP POLICY IF EXISTS "Allow authenticated users to insert venues" ON venues;
DROP POLICY IF EXISTS "Allow venue owners to update their venues" ON venues;
DROP POLICY IF EXISTS "Allow venue owners to delete their venues" ON venues;
DROP POLICY IF EXISTS "Allow public read access to venues" ON venues;
DROP POLICY IF EXISTS "Allow authenticated users to insert venues" ON venues;
DROP POLICY IF EXISTS "Allow venue owners to update their venues" ON venues;
DROP POLICY IF EXISTS "Allow venue owners to delete their venues" ON venues;

-- Create simple policies that allow public access (no owner_id dependency)
CREATE POLICY "Allow public read access to venues" ON venues
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert venues" ON venues
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow super admins to update venues" ON venues
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Allow super admins to delete venues" ON venues
  FOR DELETE USING (auth.jwt() ->> 'role' = 'super_admin');

-- Ensure RLS is enabled
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Verify the setup
SELECT 'Venues table setup complete!' as status;
SELECT COUNT(*) as total_venues FROM venues;
