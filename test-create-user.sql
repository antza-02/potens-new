-- =====================================================
-- TEST: Create a new user account manually
-- =====================================================

-- Create a test user in auth.users
DO $$
DECLARE
  user_id UUID;
BEGIN
  user_id := gen_random_uuid();
  
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
    aud,
    role
  ) VALUES (
    user_id,
    '00000000-0000-0000-0000-000000000000',
    'test@example.com',
    crypt('test123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Test User"}',
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );

  RAISE NOTICE 'Test user created with ID: %', user_id;
  RAISE NOTICE 'Email: test@example.com';
  RAISE NOTICE 'Password: test123';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating test user: %', SQLERRM;
    RAISE;
END $$;

-- Check if the trigger created a profile
SELECT 'Checking if profile was created:' as section;
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'test@example.com';
