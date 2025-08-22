-- =====================================================
-- FIX SUPER ADMIN USER - Ensure auth.users entry exists
-- =====================================================

-- First, let's see what we have
SELECT 'Current Super Admin Profile:' as section;
SELECT * FROM profiles WHERE role = 'super_admin';

-- Check if there's a corresponding auth.users entry
SELECT 'Checking auth.users for super admin:' as section;
SELECT 
  id,
  email,
  email_confirmed_at
FROM auth.users 
WHERE id IN (SELECT id FROM profiles WHERE role = 'super_admin');

-- If no auth.users entry exists, create one
DO $$
DECLARE
  profile_id UUID;
BEGIN
  -- Get the super admin profile ID
  SELECT id INTO profile_id FROM profiles WHERE role = 'super_admin' LIMIT 1;
  
  IF profile_id IS NOT NULL THEN
    -- Check if user exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = profile_id) THEN
      -- Create the auth.users entry
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
        profile_id,
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
      
      RAISE NOTICE 'Created auth.users entry for super admin with ID: %', profile_id;
      RAISE NOTICE 'Email: superadmin@potens.fi';
      RAISE NOTICE 'Password: superadmin123';
    ELSE
      RAISE NOTICE 'Super admin already exists in auth.users';
    END IF;
  ELSE
    RAISE NOTICE 'No super admin profile found';
  END IF;
END $$;

-- Verify the setup
SELECT 'Verification:' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  u.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'super_admin';
