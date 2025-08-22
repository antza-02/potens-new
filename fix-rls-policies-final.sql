-- =====================================================
-- FINAL RLS POLICY FIX - Allow SuperAdmin access
-- =====================================================

-- Step 1: Drop all existing policies on profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Step 2: Create simpler, more permissive policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow super admins to view all profiles (simplified check)
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

-- Allow super admins to insert profiles (for invitations)
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

-- Step 3: Create a more permissive policy for superadmins (fallback)
-- This policy allows access if the user's email matches known superadmin emails
CREATE POLICY "Super admin email fallback" ON profiles
  FOR ALL USING (
    auth.jwt() ->> 'email' IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
  );

-- Step 4: Grant all permissions to authenticated users
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_activity_log TO authenticated;
GRANT ALL ON user_invitations TO authenticated;

-- Step 5: Verify the new policies
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

-- Step 6: Test the policies
SELECT '=== POLICY TEST ===' as section;
SELECT 
  'Current user context:' as info,
  auth.uid() as current_user_id,
  auth.jwt() ->> 'email' as current_user_email,
  auth.jwt() ->> 'role' as current_user_role;

-- Step 7: Check if superadmin profiles are accessible
SELECT '=== SUPERADMIN ACCESS TEST ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.is_super_admin,
  CASE 
    WHEN p.is_super_admin = true THEN 'SUPER ADMIN - Should be accessible'
    ELSE 'REGULAR USER'
  END as access_status
FROM profiles p
WHERE p.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY p.email;
