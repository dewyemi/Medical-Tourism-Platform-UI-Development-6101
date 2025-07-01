-- Fix infinite recursion in user_profiles table policies
-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles_2024;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles_2024;
DROP POLICY IF EXISTS "Allow all inserts" ON user_profiles_2024;
DROP POLICY IF EXISTS "Public read access" ON user_profiles_2024;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for own profile" ON user_profiles_2024
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles_2024
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own profile" ON user_profiles_2024
FOR UPDATE USING (auth.uid() = user_id);

-- Ensure packages table has proper policies without user profile dependencies
DROP POLICY IF EXISTS "Enable read access for all users" ON packages;
DROP POLICY IF EXISTS "Public read access" ON packages;

-- Create simple public read policy for packages
CREATE POLICY "Allow public read access to packages" ON packages
FOR SELECT USING (true);

-- Create admin policies for packages management
CREATE POLICY "Allow admin insert packages" ON packages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles_2024 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'employee')
  )
);

CREATE POLICY "Allow admin update packages" ON packages
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles_2024 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'employee')
  )
);

CREATE POLICY "Allow admin delete packages" ON packages
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM user_profiles_2024 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'employee')
  )
);

-- Fix inquiries table policies
DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Users can insert own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Allow all inserts" ON inquiries;

CREATE POLICY "Enable read own inquiries" ON inquiries
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert own inquiries" ON inquiries
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix aftercare tables policies
DROP POLICY IF EXISTS "Users can manage own appointments" ON aftercare_appointments_2024;
DROP POLICY IF EXISTS "Allow all inserts" ON aftercare_appointments_2024;

CREATE POLICY "Enable read own appointments" ON aftercare_appointments_2024
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert own appointments" ON aftercare_appointments_2024
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update own appointments" ON aftercare_appointments_2024
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete own appointments" ON aftercare_appointments_2024
FOR DELETE USING (auth.uid() = user_id);

-- Fix aftercare reports policies
DROP POLICY IF EXISTS "Users can manage own reports" ON aftercare_reports_2024;
DROP POLICY IF EXISTS "Allow all inserts" ON aftercare_reports_2024;

CREATE POLICY "Enable read own reports" ON aftercare_reports_2024
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert own reports" ON aftercare_reports_2024
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update own reports" ON aftercare_reports_2024
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete own reports" ON aftercare_reports_2024
FOR DELETE USING (auth.uid() = user_id);

-- Fix mobile money transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON momo_transactions_2024;
DROP POLICY IF EXISTS "Allow all inserts" ON momo_transactions_2024;

CREATE POLICY "Enable read own transactions" ON momo_transactions_2024
FOR SELECT USING (
  -- Allow users to see their own transactions (match by phone or user_id if available)
  true -- For now, allow all reads since we don't have user_id in transactions
);

CREATE POLICY "Enable insert transactions" ON momo_transactions_2024
FOR INSERT WITH CHECK (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE user_profiles_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE aftercare_appointments_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE aftercare_reports_2024 ENABLE ROW LEVEL SECURITY;
ALTER TABLE momo_transactions_2024 ENABLE ROW LEVEL SECURITY;