-- =====================================================
-- DEBUG: Check Database Tables and Structure
-- =====================================================

-- Check what tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check venues table structure if it exists
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'venues'
ORDER BY ordinal_position;

-- Check if venues table has any data
SELECT COUNT(*) as venue_count FROM venues;

-- Check RLS policies on venues table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'venues';

-- Check if RLS is enabled on venues table
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'venues' 
  AND schemaname = 'public';

