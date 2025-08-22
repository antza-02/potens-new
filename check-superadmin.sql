-- =====================================================
-- CHECK SUPER ADMIN USER DETAILS
-- =====================================================

-- Check what email is associated with the super admin profile
SELECT 'Super Admin Profile:' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  u.email_confirmed_at,
  u.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'super_admin';

-- Check if there are any users in auth.users
SELECT 'Auth Users Count:' as section;
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Check if the trigger is working by looking at recent auth.users
SELECT 'Recent Auth Users:' as section;
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if profiles table has the right structure
SELECT 'Profiles Table Structure:' as section;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
