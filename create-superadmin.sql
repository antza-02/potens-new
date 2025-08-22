-- =====================================================
-- COMPREHENSIVE SUPER ADMIN CREATION SCRIPT
-- =====================================================
-- This script will:
-- 1. Disable triggers to prevent conflicts
-- 2. Clean up any existing data
-- 3. Create super admin manually
-- 4. Re-enable triggers for future users
-- =====================================================

-- Step 1: Disable the trigger temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Clean up any existing conflicting data
DELETE FROM profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'superadmin@potens.fi'
);
DELETE FROM auth.users WHERE email = 'superadmin@potens.fi';

-- Step 3: Create super admin account
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Generate a new UUID
  user_id := gen_random_uuid();
  
  RAISE NOTICE 'Creating super admin with ID: %', user_id;
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change_token_new,
    recovery_token,
    aud,
    role
  ) VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'superadmin@potens.fi',
    crypt('superadmin123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Super Admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    'authenticated',
    'authenticated'
  );

  -- Insert into profiles
  INSERT INTO profiles (id, full_name, role, created_at, updated_at)
  VALUES (user_id, 'Super Admin', 'super_admin', NOW(), NOW());
  
  RAISE NOTICE 'Super admin created successfully!';
  RAISE NOTICE 'Email: superadmin@potens.fi';
  RAISE NOTICE 'Password: superadmin123';
  RAISE NOTICE 'User ID: %', user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating super admin: %', SQLERRM;
    RAISE;
END $$;

-- Step 4: Re-create the trigger function (updated)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 
    CASE 
      WHEN NEW.email = 'superadmin@potens.fi' THEN 'super_admin'
      WHEN NEW.email = 'admin@potens.fi' THEN 'city_owner'
      ELSE 'user'
    END,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Re-create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 6: Verify the creation
SELECT 'Super admin verification:' as status;
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'superadmin@potens.fi';

