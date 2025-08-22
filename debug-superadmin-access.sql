-- =====================================================
-- DEBUG SUPERADMIN ACCESS - Check why SuperAdmin button isn't showing
-- =====================================================

-- Step 1: Check current user profiles and their superadmin status
SELECT '=== CURRENT USER PROFILES ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.is_super_admin,
  p.is_active,
  p.email,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;

-- Step 2: Check RLS policies on profiles table
SELECT '=== RLS POLICIES ON PROFILES ===' as section;
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 3: Test if the current user can access their own profile
SELECT '=== TEST CURRENT USER ACCESS ===' as section;
SELECT 
  auth.uid() as current_user_id,
  auth.jwt() ->> 'role' as jwt_role,
  auth.jwt() ->> 'email' as jwt_email;

-- Step 4: Check if the superadmin profiles have the correct data
SELECT '=== SUPERADMIN PROFILES CHECK ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.is_super_admin,
  p.email,
  CASE 
    WHEN p.is_super_admin = true THEN 'SUPER ADMIN - Button should show'
    WHEN p.role = 'super_admin' THEN 'ROLE SUPER_ADMIN - Button should show'
    ELSE 'NOT SUPER ADMIN - Button will not show'
  END as button_status
FROM profiles p
WHERE p.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY p.email;

-- Step 5: Check if there are any RLS violations
SELECT '=== RLS VIOLATION CHECK ===' as section;
-- This will show if there are any policies that might be blocking access
SELECT 
  'Current policies that might block access:' as info,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND (cmd = 'SELECT' OR cmd = 'ALL')
ORDER BY policyname;

