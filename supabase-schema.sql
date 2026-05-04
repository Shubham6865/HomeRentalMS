-- Create buildings table
CREATE TABLE buildings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  total_rooms INTEGER NOT NULL DEFAULT 6,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  aadhaar_number TEXT,
  room_number TEXT NOT NULL,
  start_date DATE NOT NULL,
  monthly_rent DECIMAL(10,2) NOT NULL DEFAULT 5000,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 10000,
  deposit_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_rate DECIMAL(5,2) NOT NULL DEFAULT 8.5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create electricity_bills table
CREATE TABLE electricity_bills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  billing_month DATE NOT NULL,
  previous_reading DECIMAL(10,2) NOT NULL,
  current_reading DECIMAL(10,2) NOT NULL,
  units_consumed DECIMAL(10,2) NOT NULL,
  unit_rate DECIMAL(5,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (for auth)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  user_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users on buildings" ON buildings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on tenants" ON tenants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on electricity_bills" ON electricity_bills FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users on users" ON users FOR ALL USING (auth.role() = 'authenticated');

-- Insert demo user (password: password123)
INSERT INTO users (email, password, user_metadata) VALUES
('owner@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '{"full_name": "Property Owner"}');
