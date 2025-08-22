-- Check if trigger function exists
SELECT 'Checking trigger function...' as step;

SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- Check if trigger exists
SELECT 'Checking trigger...' as step;

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table = 'users';
