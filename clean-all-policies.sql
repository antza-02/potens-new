-- =====================================================
-- CLEAN ALL POLICIES - COMPLETE CLEANUP
-- =====================================================

-- Step 1: Drop ALL policies on all tables to start completely fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin email fallback" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users access to activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Allow authenticated users access to invitations" ON user_invitations;
DROP POLICY IF EXISTS "Email-based profiles access" ON profiles;
DROP POLICY IF EXISTS "Debug profiles access" ON profiles;
DROP POLICY IF EXISTS "Email-based activity logs access" ON user_activity_log;
DROP POLICY IF EXISTS "Email-based invitations access" ON user_invitations;
DROP POLICY IF EXISTS "Simple email-based access" ON profiles;
DROP POLICY IF EXISTS "Simple activity logs access" ON user_activity_log;
DROP POLICY IF EXISTS "Simple invitations access" ON user_invitations;

-- Step 2: Drop the problematic old policies that are still there
DROP POLICY IF EXISTS "Super admins can insert activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Users can view own activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Super admins can delete invitations" ON user_invitations;
DROP POLICY IF EXISTS "Super admins can insert invitations" ON user_invitations;
DROP POLICY IF EXISTS "Super admins can update invitations" ON user_invitations;
DROP POLICY IF EXISTS "Super admins can view all invitations" ON user_invitations;

-- Step 3: Create ONLY the simple, non-recursive policies
-- Profiles table
CREATE POLICY "Profiles access" ON profiles
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (
      auth.jwt() ->> 'email' = email OR
      auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
    )
  );

-- User activity log table
CREATE POLICY "Activity logs access" ON user_activity_log
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (
      auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com') OR
      auth.uid() = user_id
    )
  );

-- User invitations table
CREATE POLICY "Invitations access" ON user_invitations
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
  );

-- Step 4: Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_activity_log TO authenticated;
GRANT ALL ON user_invitations TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 5: Verify only the new policies exist
SELECT '=== FINAL POLICIES ===' as section;
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

-- Step 6: Test access
SELECT '=== ACCESS TEST ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.is_super_admin,
  p.email,
  'CLEAN ACCESS' as status
FROM profiles p
WHERE p.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY p.email;

-- Step 7: If you want to be extra safe, temporarily disable RLS
SELECT '=== EXTRA SAFETY OPTION ===' as section;
SELECT 'If you want to be 100% sure, run these commands:' as instruction;
SELECT 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;' as command;
SELECT 'ALTER TABLE user_activity_log DISABLE ROW LEVEL SECURITY;' as command;
SELECT 'ALTER TABLE user_invitations DISABLE ROW LEVEL SECURITY;' as command;
