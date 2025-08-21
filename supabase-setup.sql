-- Create venues table
CREATE TABLE venues (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  capacity INTEGER NOT NULL,
  description TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  venue_id BIGINT REFERENCES venues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table for user data with enhanced roles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'city_owner', 'super_admin')),
  city VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user activity log table
CREATE TABLE user_activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Venues policies
CREATE POLICY "Venues are viewable by everyone" ON venues
  FOR SELECT USING (is_active = true);

CREATE POLICY "Venues are insertable by city owners and super admins" ON venues
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('city_owner', 'super_admin')
    )
  );

CREATE POLICY "Venues are updatable by owners and super admins" ON venues
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Venues are deletable by super admins only" ON venues
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "City owners can view bookings for their venues" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM venues v
      JOIN profiles p ON p.id = auth.uid()
      WHERE v.id = bookings.venue_id 
      AND p.role = 'city_owner' 
      AND v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Super admins can update any booking" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Super admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- User activity log policies
CREATE POLICY "Users can view their own activity" ON user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all activity" ON user_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "System can insert activity logs" ON user_activity_log
  FOR INSERT WITH CHECK (true);

-- Insert sample venues data
INSERT INTO venues (name, type, city, price, rating, reviews, image, amenities, capacity, description) VALUES
('Keskuspuiston Sauna', 'Sauna', 'Helsinki', 25.00, 4.8, 124, 'helsinki sauna wooden interior', ARRAY['Towels provided', 'Changing room', 'Shower'], 8, 'Traditional Finnish sauna in the heart of Central Park'),
('Kaupungintalon Kokoushuone', 'Meeting Room', 'Tampere', 45.00, 4.6, 89, 'modern meeting room finland', ARRAY['Projector', 'WiFi', 'Whiteboard', 'Coffee machine'], 12, 'Modern meeting room with all necessary equipment'),
('Urheilupuiston Tenniskenttä', 'Tennis Court', 'Turku', 35.00, 4.7, 156, 'tennis court outdoor finland', ARRAY['Equipment rental', 'Lighting', 'Seating area'], 4, 'Professional outdoor tennis court with evening lighting'),
('Kulttuuritalon Studiotila', 'Creative Space', 'Oulu', 30.00, 4.9, 67, 'creative studio space finland', ARRAY['Sound system', 'Mirrors', 'Storage', 'Piano'], 20, 'Versatile creative space perfect for workshops and events'),
('Linnanmäen Konferenssikeskus', 'Conference Room', 'Helsinki', 80.00, 4.5, 203, 'conference center finland', ARRAY['AV equipment', 'Catering', 'WiFi', 'Parking'], 50, 'Professional conference center with modern amenities'),
('Sibelius-puiston Urheilukenttä', 'Sports Field', 'Espoo', 40.00, 4.4, 98, 'sports field finland', ARRAY['Lighting', 'Changing rooms', 'Equipment storage'], 30, 'Multi-purpose sports field for various activities');

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  user_id UUID,
  action TEXT,
  details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity_log (user_id, action, details)
  VALUES (user_id, action, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
