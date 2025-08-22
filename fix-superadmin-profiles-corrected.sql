-- =====================================================
-- FIX SUPERADMIN PROFILES - CORRECTED FOR ACTUAL SCHEMA
-- =====================================================

-- Step 1: Check current profiles table structure
SELECT '=== CURRENT PROFILES TABLE STRUCTURE ===' as section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Check current profiles data
SELECT '=== CURRENT PROFILES DATA ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.created_at,
  p.updated_at,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at;

-- Step 3: Check if we need to add is_super_admin column
SELECT '=== CHECKING IF is_super_admin COLUMN EXISTS ===' as section;
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name = 'is_super_admin';

-- Step 4: Add is_super_admin column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_super_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_super_admin column to profiles table';
    ELSE
        RAISE NOTICE 'is_super_admin column already exists';
    END IF;
END $$;

-- Step 5: Update superadmin profiles
UPDATE profiles 
SET 
  is_super_admin = true,
  role = 'admin',
  updated_at = NOW()
WHERE id IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
);

-- Step 6: Verify the update
SELECT '=== UPDATED SUPERADMIN PROFILES ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.is_super_admin,
  p.updated_at,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY u.email;

-- Step 7: Show all profiles with their roles and superadmin status
SELECT '=== ALL PROFILES WITH ROLES ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.is_super_admin,
  p.created_at,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.role DESC, p.created_at;

-- Step 8: Final verification
SELECT '=== FINAL VERIFICATION ===' as section;
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN p.role = 'admin' THEN 1 END) as admin_profiles,
  COUNT(CASE WHEN p.is_super_admin = true THEN 1 END) as superadmin_profiles
FROM profiles p;

