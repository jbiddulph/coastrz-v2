-- Fix users table permissions with simpler RLS policies
-- Re-enable RLS with basic policies that don't cause recursion

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users;

-- Create simple policies that allow users to access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create a policy that allows all authenticated users to view all users
-- This is needed for admin functionality and debugging
CREATE POLICY "Authenticated users can view all profiles" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows all authenticated users to update all users
-- This is needed for admin functionality
CREATE POLICY "Authenticated users can update all profiles" ON users
  FOR UPDATE USING (auth.role() = 'authenticated'); 