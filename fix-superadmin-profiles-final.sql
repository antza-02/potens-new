-- =====================================================
-- FIX SUPERADMIN PROFILES - FINAL CORRECTED VERSION
-- =====================================================

-- Step 1: Check current role constraints
SELECT '=== CURRENT ROLE CONSTRAINTS ===' as section;
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass 
  AND contype = 'c';

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

-- Step 3: Add is_super_admin column if it doesn't exist
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

-- Step 4: Update superadmin profiles using existing role values
UPDATE profiles 
SET 
  is_super_admin = true,
  updated_at = NOW()
WHERE id IN (
  SELECT u.id 
  FROM auth.users u 
  WHERE u.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
);

-- Step 5: Verify the update
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

-- Step 6: Show all profiles with their roles and superadmin status
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

-- Step 7: Final verification
SELECT '=== FINAL VERIFICATION ===' as section;
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN p.role = 'super_admin' THEN 1 END) as super_admin_role_profiles,
  COUNT(CASE WHEN p.is_super_admin = true THEN 1 END) as superadmin_profiles
FROM profiles p;

-- Step 8: Check if we need to update role constraints to allow 'admin'
SELECT '=== CHECKING ROLE CONSTRAINT VALUES ===' as section;
SELECT 
  enumlabel
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'profiles_role_check'
);

