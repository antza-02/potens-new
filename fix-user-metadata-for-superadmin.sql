-- =====================================================
-- FIX USER METADATA FOR SUPERADMIN - Update auth.users metadata
-- =====================================================

-- Step 1: Check current user metadata
SELECT '=== CURRENT USER METADATA ===' as section;
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data,
  p.role,
  p.is_super_admin
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY u.email;

-- Step 2: Update user metadata to include role and superadmin status
UPDATE auth.users 
SET 
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'role', p.role,
      'is_super_admin', p.is_super_admin,
      'full_name', p.full_name
    ),
  updated_at = NOW()
FROM profiles p
WHERE auth.users.id = p.id
  AND auth.users.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com');

-- Step 3: Verify the metadata update
SELECT '=== UPDATED USER METADATA ===' as section;
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data,
  p.role,
  p.is_super_admin
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY u.email;

-- Step 4: Create a function to automatically sync metadata
CREATE OR REPLACE FUNCTION sync_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user metadata when profile changes
  UPDATE auth.users 
  SET 
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object(
        'role', NEW.role,
        'is_super_admin', COALESCE(NEW.is_super_admin, false),
        'full_name', NEW.full_name
      ),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to auto-sync metadata
DROP TRIGGER IF EXISTS sync_user_metadata_trigger ON profiles;
CREATE TRIGGER sync_user_metadata_trigger
  AFTER INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_user_metadata();

-- Step 6: Test the trigger by updating a profile
UPDATE profiles 
SET updated_at = NOW()
WHERE email IN (
  SELECT email FROM auth.users WHERE id = profiles.id
);

-- Step 7: Final verification
SELECT '=== FINAL VERIFICATION ===' as section;
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as metadata_role,
  u.raw_user_meta_data->>'is_super_admin' as metadata_superadmin,
  p.role as profile_role,
  p.is_super_admin as profile_superadmin
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN ('superadmin@potens.fi', 'anton.hietsilta@gmail.com')
ORDER BY u.email;

