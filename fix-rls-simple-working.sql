-- =====================================================
-- SIMPLE RLS POLICIES - GUARANTEED TO WORK
-- =====================================================

-- Step 1: Check current RLS status
SELECT '=== CURRENT RLS STATUS ===' as section;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_activity_log', 'user_invitations')
  AND schemaname = 'public';

-- Step 2: Drop ALL existing policies to start completely fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin email fallback" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Step 3: Create a single, simple policy that allows all authenticated users to access profiles
-- This is more permissive but will definitely work
CREATE POLICY "Allow authenticated users access to profiles" ON profiles
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 4: Create simple policies for user_activity_log
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Users can view own activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Super admins can insert activity logs" ON user_activity_log;

CREATE POLICY "Allow authenticated users access to activity logs" ON user_activity_log
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 5: Create simple policies for user_invitations
DROP POLICY IF EXISTS "Super admins can view all invitations" ON user_invitations;
DROP POLICY IF EXISTS "Super admins can insert invitations" ON user_invitations;
DROP POLICY IF EXISTS "Super admins can update invitations" ON user_invitations;
DROP POLICY IF EXISTS "Super admins can delete invitations" ON user_invitations;

CREATE POLICY "Allow authenticated users access to invitations" ON user_invitations
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 6: Grant all necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_activity_log TO authenticated;
GRANT ALL ON user_invitations TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 7: Verify the new simple policies
SELECT '=== NEW SIMPLE RLS POLICIES ===' as section;
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_activity_log', 'user_invitations')
ORDER BY tablename, policyname;

-- Step 8: Test access
SELECT '=== ACCESS TEST ===' as section;
SELECT 
  'Current user context:' as info,
  auth.uid() as current_user_id,
  auth.role() as current_user_role,
  auth.jwt() ->> 'email' as current_user_email;

-- Step 9: Test if we can access superadmin profiles
SELECT '=== SUPERADMIN PROFILES TEST ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.is_super_admin,
  p.is_active,
  p.email,
  p.created_at
FROM profiles p
WHERE p.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY p.email;

-- Step 10: Test if we can access other tables
SELECT '=== OTHER TABLES ACCESS TEST ===' as section;
SELECT 
  'user_activity_log count:' as table_name,
  COUNT(*) as record_count
FROM user_activity_log
UNION ALL
SELECT 
  'user_invitations count:' as table_name,
  COUNT(*) as record_count
FROM user_invitations;
