-- =====================================================
-- TEMPORARILY DISABLE RLS FOR TESTING
-- =====================================================

-- Step 1: Disable RLS on profiles table temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Disable RLS on user_activity_log table temporarily
ALTER TABLE user_activity_log DISABLE ROW LEVEL SECURITY;

-- Step 3: Disable RLS on user_invitations table temporarily
ALTER TABLE user_invitations DISABLE ROW LEVEL SECURITY;

-- Step 4: Grant all permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 5: Verify RLS is disabled
SELECT '=== RLS STATUS ===' as section;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_activity_log', 'user_invitations')
  AND schemaname = 'public';

-- Step 6: Test access
SELECT '=== TEST ACCESS ===' as section;
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_super_admin = true THEN 1 END) as superadmin_profiles
FROM profiles;

-- IMPORTANT: This is for testing only. Re-enable RLS after testing with:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
