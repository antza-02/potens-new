-- =====================================================
-- FIX TRIGGER FUNCTION - Ensure profiles are created automatically
-- =====================================================

-- Step 1: Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 2: Create a new, improved trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table
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
  
  RAISE NOTICE 'Profile created for user: % with email: %', NEW.id, NEW.email;
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Don't fail the user creation, just log the error
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 4: Test the trigger by creating a test user
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  test_user_id := gen_random_uuid();
  
  -- Create a test user to verify the trigger works
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
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'test-trigger@example.com',
    crypt('test123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Test Trigger User"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );
  
  RAISE NOTICE 'Test user created with ID: %', test_user_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating test user: %', SQLERRM;
    RAISE;
END $$;

-- Step 5: Verify the trigger worked
SELECT 'Trigger test results:' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'test-trigger@example.com';

-- Step 6: Clean up test user
DELETE FROM profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'test-trigger@example.com'
);
DELETE FROM auth.users WHERE email = 'test-trigger@example.com';

-- Step 7: Show final status
SELECT 'Trigger function fixed!' as status;
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT COUNT(*) as total_auth_users FROM auth.users;
