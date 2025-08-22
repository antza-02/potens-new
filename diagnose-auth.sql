-- =====================================================
-- COMPREHENSIVE AUTH DIAGNOSTIC SCRIPT
-- =====================================================

-- Check if profiles table exists and its structure
SELECT '=== PROFILES TABLE ===' as section;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'profiles';

-- Check profiles table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if profiles table has data
SELECT COUNT(*) as profiles_count FROM profiles;

-- Check auth.users table structure
SELECT '=== AUTH.USERS TABLE ===' as section;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if trigger function exists
SELECT '=== TRIGGER FUNCTION ===' as section;
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- Check if trigger exists
SELECT '=== TRIGGER ===' as section;
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table = 'users';

-- Check RLS on profiles table
SELECT '=== PROFILES RLS ===' as section;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' 
  AND schemaname = 'public';

-- Check RLS policies on profiles
SELECT '=== PROFILES POLICIES ===' as section;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check for any errors in recent logs
SELECT '=== RECENT ERRORS ===' as section;
SELECT 'Note: Detailed error logs not available in this view' as info;
