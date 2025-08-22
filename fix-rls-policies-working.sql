-- =====================================================
-- FIX RLS POLICIES - WORKING VERSION FOR SUPERADMIN ACCESS
-- =====================================================

-- Step 1: Check current RLS status
SELECT '=== CURRENT RLS STATUS ===' as section;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'user_activity_log', 'user_invitations')
  AND schemaname = 'public';

-- Step 2: Drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin email fallback" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Step 3: Create simple, working policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow super admins to view all profiles (this is the key policy)
CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

-- Allow super admins to update all profiles
CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

-- Allow super admins to insert profiles
CREATE POLICY "Super admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

-- Allow super admins to delete profiles
CREATE POLICY "Super admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

-- Step 4: Create a more permissive fallback policy for known superadmin emails
-- This ensures access even if the profile lookup fails
CREATE POLICY "Super admin email fallback" ON profiles
  FOR ALL USING (
    auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
  );

-- Step 5: Create policies for user_activity_log
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Users can view own activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Super admins can insert activity logs" ON user_activity_log;

CREATE POLICY "Super admins can view all activity logs" ON user_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

CREATE POLICY "Users can view own activity logs" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can insert activity logs" ON user_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

-- Step 6: Create policies for user_invitations
DROP POLICY IF EXISTS "Super admins can view all invitations" ON user_invitations;
DROP POLICY IF EXISTS "Super admins can insert invitations" ON user_invitations;
DROP POLICY IF EXISTS "Super admins can update invitations" ON user_invitations;
DROP POLICY IF EXISTS "Super admins can delete invitations" ON user_invitations;

CREATE POLICY "Super admins can view all invitations" ON user_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can insert invitations" ON user_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can update invitations" ON user_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

CREATE POLICY "Super admins can delete invitations" ON user_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.is_super_admin = true
    )
  );

-- Step 7: Grant necessary permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_activity_log TO authenticated;
GRANT ALL ON user_invitations TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 8: Verify the new policies
SELECT '=== NEW RLS POLICIES ON PROFILES ===' as section;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 9: Test the policies
SELECT '=== POLICY TEST ===' as section;
SELECT 
  'Current user context:' as info,
  auth.uid() as current_user_id,
  auth.jwt() ->> 'email' as current_user_email;

-- Step 10: Check if superadmin profiles are accessible
SELECT '=== SUPERADMIN ACCESS TEST ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.is_super_admin,
  p.email,
  CASE 
    WHEN p.is_super_admin = true THEN 'SUPER ADMIN - Should be accessible'
    ELSE 'REGULAR USER'
  END as access_status
FROM profiles p
WHERE p.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY p.email;
