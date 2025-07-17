-- Seed file to create initial admin user
-- Replace 'your-admin-email@example.com' with your actual admin email

-- First, make sure the user exists in auth.users (you'll need to sign up first)
-- Then run this to make them an admin:

-- UPDATE users 
-- SET role = 'admin' 
-- WHERE email = 'your-admin-email@example.com';

-- Or if you want to create a test admin user directly (for development only):
-- INSERT INTO users (id, email, role) 
-- VALUES (
--   gen_random_uuid(), 
--   'admin@coastrz.com', 
--   'admin'
-- );

-- Note: For production, you should:
-- 1. Sign up normally through your app
-- 2. Then manually update the role to 'admin' in the database
-- 3. Or use the Supabase dashboard to update the user role 