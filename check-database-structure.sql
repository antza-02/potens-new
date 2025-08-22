-- =====================================================
-- CHECK DATABASE STRUCTURE - See what tables and permissions exist
-- =====================================================

-- Step 1: Check what tables exist in public schema
SELECT '=== EXISTING TABLES IN PUBLIC SCHEMA ===' as section;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Step 2: Check profiles table structure
SELECT '=== PROFILES TABLE STRUCTURE ===' as section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 3: Check if user_activity_log table exists
SELECT '=== USER ACTIVITY LOG TABLE CHECK ===' as section;
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'user_activity_log';

-- Step 4: Check current RLS policies on profiles
SELECT '=== CURRENT RLS POLICIES ON PROFILES ===' as section;
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 5: Check current user permissions
SELECT '=== CURRENT USER PERMISSIONS ===' as section;
SELECT 
  current_user,
  session_user,
  current_database(),
  current_schema();

-- Step 6: Check if service role has admin permissions
SELECT '=== SERVICE ROLE CHECK ===' as section;
SELECT 
  rolname,
  rolsuper,
  rolinherit,
  rolcreaterole,
  rolcreatedb,
  rolcanlogin
FROM pg_roles 
WHERE rolname LIKE '%service%' OR rolname LIKE '%anon%' OR rolname LIKE '%authenticated%';

