-- =====================================================
-- COMPLETE AUTH FIX - Ensure all auth components work
-- =====================================================

-- Step 1: Drop and recreate the trigger function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 
    CASE 
      WHEN NEW.email = 'superadmin@potens.fi' THEN 'super_admin'
      WHEN NEW.email = 'admin@potens.fi' THEN 'city_owner'
      ELSE 'user'
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 3: Ensure profiles table has correct structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('user', 'city_owner', 'super_admin')) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 4: Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'super_admin');

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON venues TO anon, authenticated;
GRANT ALL ON bookings TO anon, authenticated;

-- Step 7: Verify setup
SELECT 'Auth setup complete!' as status;
SELECT COUNT(*) as profiles_count FROM profiles;
SELECT COUNT(*) as venues_count FROM venues;

-- Step 8: Show current profiles
SELECT id, full_name, role FROM profiles LIMIT 5;
