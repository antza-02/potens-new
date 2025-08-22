-- =====================================================
-- CREATE USER INVITATIONS TABLE - For SuperAdmin invitations
-- =====================================================

-- Step 1: Create user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'city_owner', 'super_admin')),
  invited_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable RLS on user_invitations
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for user_invitations
-- Allow super admins to view all invitations
CREATE POLICY "Super admins can view all invitations" ON user_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Allow super admins to insert invitations
CREATE POLICY "Super admins can insert invitations" ON user_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Allow super admins to update invitations
CREATE POLICY "Super admins can update invitations" ON user_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Allow super admins to delete invitations
CREATE POLICY "Super admins can delete invitations" ON user_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_super_admin = true
    )
  );

-- Step 4: Grant permissions
GRANT ALL ON user_invitations TO anon, authenticated;
GRANT USAGE ON SEQUENCE user_invitations_id_seq TO anon, authenticated;

-- Step 5: Create a function to process invitations when users sign up
CREATE OR REPLACE FUNCTION process_user_invitation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's a pending invitation for this user
  UPDATE user_invitations 
  SET 
    status = 'accepted',
    updated_at = NOW()
  WHERE email = NEW.email AND status = 'pending';
  
  -- Update the user's profile with the invited role
  UPDATE profiles 
  SET 
    role = (
      SELECT role 
      FROM user_invitations 
      WHERE email = NEW.email AND status = 'accepted'
      LIMIT 1
    ),
    is_super_admin = (
      SELECT role = 'super_admin'
      FROM user_invitations 
      WHERE email = NEW.email AND status = 'accepted'
      LIMIT 1
    ),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger to process invitations
DROP TRIGGER IF EXISTS process_invitation_trigger ON auth.users;
CREATE TRIGGER process_invitation_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION process_user_invitation();

-- Step 7: Verify the setup
SELECT '=== VERIFICATION ===' as section;

SELECT 'Tables in public schema:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%invitation%'
ORDER BY table_name;

SELECT 'RLS policies on user_invitations:' as info;
SELECT policyname FROM pg_policies WHERE tablename = 'user_invitations';

SELECT 'User invitations table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_invitations'
ORDER BY ordinal_position;

