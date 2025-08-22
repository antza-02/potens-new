-- Simple check: Does auth.users table exist?
SELECT 'Checking auth.users table...' as step;

SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'auth' 
  AND table_name = 'users'
ORDER BY ordinal_position;
