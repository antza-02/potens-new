-- =====================================================
-- COMPLETE PROFILES CLEANUP - Remove ALL policies and start fresh
-- =====================================================

-- Step 1: Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (this will remove everything)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON profiles';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create ONLY the essential policies
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 5: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;

-- Step 6: Verify the cleanup
SELECT '=== CLEANUP VERIFICATION ===' as section;
SELECT COUNT(*) as profiles_count FROM profiles;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Step 7: Show remaining policies (should be only 2)
SELECT '=== REMAINING POLICIES ===' as section;
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 8: Test basic access
SELECT '=== TESTING ACCESS ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role
FROM profiles p
LIMIT 3;

