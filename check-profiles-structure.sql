-- Check profiles table structure
SELECT 'Checking profiles table structure...' as step;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if profiles table has any data
SELECT 'Checking profiles data...' as step;
SELECT COUNT(*) as profiles_count FROM profiles;
