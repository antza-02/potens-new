-- =====================================================
-- FIX AUTHENTICATION CONTEXT + RLS POLICIES
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

-- Step 3: Create policies that work with null auth context
-- Use email-based policies instead of auth.uid() based ones

-- Profiles table - Allow access based on email in JWT
CREATE POLICY "Email-based profiles access" ON profiles
  FOR ALL USING (
    -- Allow if user is authenticated (has JWT)
    auth.role() = 'authenticated' AND
    -- And either the profile matches their email OR they're a known superadmin
    (
      auth.jwt() ->> 'email' = email OR
      auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
    )
  );

-- Alternative: Even more permissive policy for debugging
CREATE POLICY "Debug profiles access" ON profiles
  FOR ALL USING (
    auth.role() = 'authenticated'
  );

-- Step 4: Create policies for user_activity_log
CREATE POLICY "Email-based activity logs access" ON user_activity_log
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    (
      auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com') OR
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.email = auth.jwt() ->> 'email' 
        AND p.id = user_activity_log.user_id
      )
    )
  );

-- Step 5: Create policies for user_invitations
CREATE POLICY "Email-based invitations access" ON user_invitations
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
  );

-- Step 6: Grant all necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_activity_log TO authenticated;
GRANT ALL ON user_invitations TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 7: Test the authentication context
SELECT '=== AUTH CONTEXT TEST ===' as section;
SELECT 
  'Current auth context:' as info,
  auth.uid() as current_user_id,
  auth.role() as current_user_role,
  auth.jwt() as current_jwt,
  auth.jwt() ->> 'email' as current_user_email,
  auth.jwt() ->> 'sub' as current_user_sub;

-- Step 8: Test if we can access profiles with the new policies
SELECT '=== PROFILES ACCESS TEST ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.is_super_admin,
  p.email,
  CASE 
    WHEN p.email = COALESCE(auth.jwt() ->> 'email', 'NO_EMAIL') THEN 'MATCHES CURRENT USER'
    WHEN p.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com') THEN 'KNOWN SUPERADMIN'
    ELSE 'OTHER USER'
  END as access_status
FROM profiles p
WHERE p.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY p.email;

-- Step 9: Verify the new policies
SELECT '=== NEW POLICIES ===' as section;
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

-- Step 10: If still having issues, temporarily disable RLS for testing
SELECT '=== TEMPORARY RLS DISABLE OPTION ===' as section;
SELECT 'If policies still fail, run these commands:' as instruction;
SELECT 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;' as command;
SELECT 'ALTER TABLE user_activity_log DISABLE ROW LEVEL SECURITY;' as command;
SELECT 'ALTER TABLE user_invitations DISABLE ROW LEVEL SECURITY;' as command;
