-- =====================================================
-- FIX RLS INFINITE RECURSION ERROR
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
DROP POLICY IF EXISTS "Allow authenticated users access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users access to activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Allow authenticated users access to invitations" ON user_invitations;
DROP POLICY IF EXISTS "Email-based profiles access" ON profiles;
DROP POLICY IF EXISTS "Debug profiles access" ON profiles;
DROP POLICY IF EXISTS "Email-based activity logs access" ON user_activity_log;
DROP POLICY IF EXISTS "Email-based invitations access" ON user_invitations;

-- Step 3: Create simple, non-recursive policies
-- NO SELF-REFERENTIAL QUERIES to avoid infinite recursion

-- Profiles table - Simple email-based policy
CREATE POLICY "Simple email-based access" ON profiles
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (
      -- Allow access to own profile
      auth.jwt() ->> 'email' = email OR
      -- Allow access to known superadmin emails
      auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
    )
  );

-- Step 4: Create policies for user_activity_log
CREATE POLICY "Simple activity logs access" ON user_activity_log
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (
      -- Allow superadmins to see all
      auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com') OR
      -- Allow users to see their own logs
      auth.uid() = user_id
    )
  );

-- Step 5: Create policies for user_invitations
CREATE POLICY "Simple invitations access" ON user_invitations
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
  );

-- Step 6: Grant all necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_activity_log TO authenticated;
GRANT ALL ON user_invitations TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 7: Test the new policies
SELECT '=== NEW POLICIES TEST ===' as section;
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

-- Step 8: Test access without recursion
SELECT '=== ACCESS TEST ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.is_super_admin,
  p.email,
  CASE 
    WHEN p.email = COALESCE(auth.jwt() ->> 'email', 'NO_EMAIL') THEN 'OWN PROFILE'
    WHEN p.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com') THEN 'SUPERADMIN'
    ELSE 'OTHER USER'
  END as access_status
FROM profiles p
WHERE p.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY p.email;

-- Step 9: If still having issues, show the nuclear option
SELECT '=== NUCLEAR OPTION ===' as section;
SELECT 'If policies still fail, run these commands:' as instruction;
SELECT 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;' as command;
SELECT 'ALTER TABLE user_activity_log DISABLE ROW LEVEL SECURITY;' as command;
SELECT 'ALTER TABLE user_invitations DISABLE ROW LEVEL SECURITY;' as command;
SELECT 'GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;' as command;
