-- =====================================================
-- COMPREHENSIVE DATABASE FIX - Fix all SuperAdmin issues
-- =====================================================

-- Step 1: Create missing tables and columns
CREATE TABLE IF NOT EXISTS user_activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to profiles table
DO $$
BEGIN
    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column to profiles table';
    END IF;

    -- Add email column if it doesn't exist (for easier access)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column to profiles table';
    END IF;
END $$;

-- Step 2: Update existing profiles with email from auth.users
UPDATE profiles 
SET email = (
  SELECT email 
  FROM auth.users 
  WHERE auth.users.id = profiles.id
)
WHERE email IS NULL;

-- Step 3: Set all existing profiles as active
UPDATE profiles 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 5: Create RLS policies for user_activity_log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Users can view own activity logs" ON user_activity_log;
DROP POLICY IF EXISTS "Super admins can insert activity logs" ON user_activity_log;

-- Create new policies
CREATE POLICY "Super admins can view all activity logs" ON user_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

CREATE POLICY "Users can view own activity logs" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can insert activity logs" ON user_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Step 6: Create a view to easily access user data with emails
CREATE OR REPLACE VIEW user_profiles_with_email AS
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.is_super_admin,
  p.is_active,
  p.city,
  p.phone,
  p.created_at,
  p.updated_at,
  u.email
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id;

-- Step 7: Grant access to the view
GRANT SELECT ON user_profiles_with_email TO anon, authenticated;

-- Step 8: Create a function to sync email from auth.users to profiles
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the email in profiles when auth.users email changes
  UPDATE profiles 
  SET email = NEW.email, updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger to auto-sync email
DROP TRIGGER IF EXISTS sync_profile_email_trigger ON auth.users;
CREATE TRIGGER sync_profile_email_trigger
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_profile_email();

-- Step 10: Verify the fixes
SELECT '=== VERIFICATION ===' as section;

SELECT 'Tables in public schema:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

SELECT 'Profiles columns:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles' ORDER BY column_name;

SELECT 'RLS policies on profiles:' as info;
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';

SELECT 'RLS policies on user_activity_log:' as info;
SELECT policyname FROM pg_policies WHERE tablename = 'user_activity_log';

SELECT 'User profiles with emails:' as info;
SELECT COUNT(*) as total_profiles, COUNT(email) as profiles_with_email FROM user_profiles_with_email;

