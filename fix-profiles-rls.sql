-- =====================================================
-- FIX PROFILES RLS POLICIES - Resolve schema query error
-- =====================================================

-- Step 1: Check current RLS status on profiles
SELECT '=== CURRENT PROFILES RLS STATUS ===' as section;
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' 
  AND schemaname = 'public';

-- Step 2: Check current policies on profiles
SELECT '=== CURRENT PROFILES POLICIES ===' as section;
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

-- Step 3: Drop all existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- Step 4: Create simple, permissive policies for profiles
CREATE POLICY "Allow users to view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow super admins to view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Allow super admins to update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Step 5: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;

-- Step 7: Verify the setup
SELECT '=== VERIFICATION ===' as section;
SELECT COUNT(*) as profiles_count FROM profiles;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Step 8: Test a simple query to profiles
SELECT '=== TESTING PROFILES ACCESS ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role
FROM profiles p
LIMIT 3;
