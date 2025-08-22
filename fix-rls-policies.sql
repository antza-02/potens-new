-- =====================================================
-- FIX RLS POLICIES - Allow SuperAdmin operations
-- =====================================================

-- Step 1: Check current RLS policies on profiles
SELECT '=== CURRENT RLS POLICIES ON PROFILES ===' as section;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 2: Drop existing restrictive policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Step 3: Create comprehensive RLS policies for profiles
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow super admins to view all profiles
CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Allow super admins to update all profiles
CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Allow super admins to insert profiles (for user invitation)
CREATE POLICY "Super admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Allow super admins to delete profiles
CREATE POLICY "Super admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Step 4: Create comprehensive RLS policies for user_activity_log
-- Drop existing policies
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Users can view own activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Super admins can insert activity logs" ON user_activity_log;

-- Create new policies
CREATE POLICY "Super admins can view all activity logs" ON user_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Users can view own activity logs" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can insert activity logs" ON user_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Step 5: Grant additional permissions
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON user_activity_log TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 6: Verify the new policies
SELECT '=== NEW RLS POLICIES ON PROFILES ===' as section;
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

SELECT '=== NEW RLS POLICIES ON USER_ACTIVITY_LOG ===' as section;
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'user_activity_log'
ORDER BY policyname;

-- Step 7: Test super admin permissions
SELECT '=== SUPER ADMIN PERMISSIONS TEST ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.is_super_admin,
  CASE 
    WHEN p.is_super_admin = true THEN 'SUPER ADMIN - Has full permissions'
    ELSE 'REGULAR USER - Limited permissions'
  END as permission_status
FROM profiles p
WHERE p.id = auth.uid();

