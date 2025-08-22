-- =====================================================
-- VERIFY AND FIX SUPER ADMIN ACCOUNT
-- =====================================================

-- Step 1: Check current super admin status
SELECT '=== CURRENT SUPER ADMIN STATUS ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  u.email_confirmed_at,
  u.encrypted_password IS NOT NULL as has_password,
  u.raw_user_meta_data
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'super_admin';

-- Step 2: Check if there are any constraint violations
SELECT '=== CHECKING FOR CONSTRAINT ISSUES ===' as section;
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'profiles'::regclass;

-- Step 3: Try to recreate the super admin with a fresh approach
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate new UUID
  new_user_id := gen_random_uuid();
  
  RAISE NOTICE 'Creating new super admin with ID: %', new_user_id;
  
  -- First, delete the old super admin
  DELETE FROM profiles WHERE role = 'super_admin';
  DELETE FROM auth.users WHERE email = 'superadmin@potens.fi';
  
  -- Create new super admin in auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'superadmin@potens.fi',
    crypt('superadmin123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Super Admin"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );
  
  RAISE NOTICE 'New super admin created successfully!';
  RAISE NOTICE 'Email: superadmin@potens.fi';
  RAISE NOTICE 'Password: superadmin123';
  RAISE NOTICE 'User ID: %', new_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating super admin: %', SQLERRM;
    RAISE;
END $$;

-- Step 4: Verify the new super admin
SELECT '=== NEW SUPER ADMIN VERIFICATION ===' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  u.email_confirmed_at,
  u.encrypted_password IS NOT NULL as has_password
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE u.email = 'superadmin@potens.fi';

-- Step 5: Show final counts
SELECT '=== FINAL STATUS ===' as section;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as total_auth_users FROM auth.users;
