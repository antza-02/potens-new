-- =====================================================
-- FIX SUPERADMIN PROFILES - Set is_super_admin to true
-- =====================================================

-- Step 1: Check current state of superadmin profiles
SELECT '=== CURRENT SUPERADMIN PROFILES ===' as section;
SELECT 
  id,
  email,
  full_name,
  is_super_admin,
  role,
  created_at
FROM profiles 
WHERE email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY email;

-- Step 2: Update superadmin profiles to set is_super_admin = true
UPDATE profiles 
SET 
  is_super_admin = true,
  updated_at = NOW()
WHERE email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com');

-- Step 3: Verify the update
SELECT '=== UPDATED SUPERADMIN PROFILES ===' as section;
SELECT 
  id,
  email,
  full_name,
  is_super_admin,
  role,
  updated_at
FROM profiles 
WHERE email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY email;

-- Step 4: Check if there are any other profiles that should be superadmin
SELECT '=== ALL PROFILES WITH is_super_admin = true ===' as section;
SELECT 
  id,
  email,
  full_name,
  is_super_admin,
  role,
  created_at
FROM profiles 
WHERE is_super_admin = true
ORDER BY email;

-- Step 5: Check for any profiles with role = 'superadmin' but is_super_admin = null
SELECT '=== PROFILES WITH ROLE SUPERADMIN BUT is_super_admin = NULL ===' as section;
SELECT 
  id,
  email,
  full_name,
  is_super_admin,
  role,
  created_at
FROM profiles 
WHERE role = 'superadmin' AND is_super_admin IS NULL
ORDER BY email;

-- Step 6: Update any profiles with role = 'superadmin' to also have is_super_admin = true
UPDATE profiles 
SET 
  is_super_admin = true,
  updated_at = NOW()
WHERE role = 'superadmin' AND is_super_admin IS NULL;

-- Step 7: Final verification
SELECT '=== FINAL VERIFICATION ===' as section;
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN is_super_admin = true THEN 1 END) as superadmin_profiles,
  COUNT(CASE WHEN role = 'superadmin' THEN 1 END) as role_superadmin_profiles
FROM profiles;

