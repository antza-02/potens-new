-- =====================================================
-- COMPREHENSIVE USER CHECK
-- =====================================================

-- Check all profiles in public schema
SELECT '=== PUBLIC PROFILES ===' as section;
SELECT 
  id,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Check all users in auth.users
SELECT '=== AUTH.USERS ===' as section;
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Check if there are other profiles tables
SELECT '=== OTHER PROFILES TABLES ===' as section;
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%profile%'
ORDER BY table_schema, table_name;

-- Check if there are other user-related tables
SELECT '=== USER-RELATED TABLES ===' as section;
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
  OR table_name LIKE '%profile%'
ORDER BY table_schema, table_name;

-- Check current user and database
SELECT '=== CURRENT CONTEXT ===' as section;
SELECT 
  current_user,
  current_database(),
  current_schema();
