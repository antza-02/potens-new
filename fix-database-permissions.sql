-- =====================================================
-- FIX DATABASE PERMISSIONS AND MISSING TABLES
-- =====================================================

-- Step 1: Create user_activity_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create is_active column in profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column to profiles table';
    ELSE
        RAISE NOTICE 'is_active column already exists';
    END IF;
END $$;

-- Step 3: Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 4: Grant permissions to the service role (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
        GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
        RAISE NOTICE 'Granted permissions to service_role';
    ELSE
        RAISE NOTICE 'service_role does not exist';
    END IF;
END $$;

-- Step 5: Create RLS policies for user_activity_log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Allow super admins to view all activity logs
CREATE POLICY "Super admins can view all activity logs" ON user_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Allow users to view their own activity logs
CREATE POLICY "Users can view own activity logs" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- Allow super admins to insert activity logs
CREATE POLICY "Super admins can insert activity logs" ON user_activity_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Step 6: Update existing profiles to have is_active = true
UPDATE profiles 
SET is_active = true 
WHERE is_active IS NULL;

-- Step 7: Verify the fixes
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

