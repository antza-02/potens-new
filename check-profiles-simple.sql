-- Simple check: Does profiles table exist?
SELECT 'Checking if profiles table exists...' as step;

SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'profiles';
