-- =====================================================
-- TEST SUPABASE CONNECTION
-- =====================================================

-- Test basic database access
SELECT 'Testing database connection...' as step;
SELECT version() as postgres_version;

-- Test if we can access the venues table
SELECT 'Testing venues access...' as step;
SELECT COUNT(*) as venues_count FROM venues;

-- Test if we can access the profiles table
SELECT 'Testing profiles access...' as step;
SELECT COUNT(*) as profiles_count FROM profiles;

-- Test if auth.users is accessible
SELECT 'Testing auth.users access...' as step;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Show current user context
SELECT 'Current user context:' as step;
SELECT current_user, current_database();
