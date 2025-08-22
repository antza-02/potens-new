-- =====================================================
-- CHECK INVITATION TABLE CONSTRAINTS
-- =====================================================

-- Check the current table structure
SELECT '=== TABLE STRUCTURE ===' as section;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_invitations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check the check constraints
SELECT '=== CHECK CONSTRAINTS ===' as section;
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_invitations'::regclass 
  AND contype = 'c';

-- Check what status values currently exist
SELECT '=== CURRENT STATUS VALUES ===' as section;
SELECT 
  status,
  COUNT(*) as count
FROM user_invitations 
GROUP BY status
ORDER BY status;

-- Check the exact constraint definition
SELECT '=== CONSTRAINT DETAILS ===' as section;
SELECT 
  'user_invitations_status_check' as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conname = 'user_invitations_status_check';

-- Show all constraints on the table
SELECT '=== ALL CONSTRAINTS ===' as section;
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'user_invitations'::regclass
ORDER BY contype, conname;
