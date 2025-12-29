-- ================================================================
-- QUICK SERVICE HEAD ACCOUNT CREATION
-- ================================================================
-- This script creates a complete service head account in one go
-- After running this, you can login with: serv_head / 12345678

-- STEP 1: Create the auth user (must be done in Supabase Dashboard first)
-- Go to: Authentication > Users > Add User
-- Email: serv_head@campus.edu
-- Password: 12345678
-- Auto Confirm User: ✅ (check this)
-- Click "Create User" and COPY THE UUID

-- STEP 2: Run this SQL (replace YOUR_UUID_HERE with the actual UUID from step 1)
INSERT INTO public.users (
  id,
  user_id,
  fname,
  lname,
  email,
  role,
  email_verified,
  created_at
) VALUES (
  'YOUR_UUID_HERE',  -- ⚠️ REPLACE THIS with actual UUID from Supabase Dashboard
  'serv_head',
  'Service',
  'Head',
  'serv_head@campus.edu',
  'service_head',
  true,
  NOW()
);

-- STEP 3: Verify the account was created
SELECT id, user_id, fname, lname, email, role 
FROM public.users 
WHERE user_id = 'serv_head';

-- Expected output:
-- id: [your UUID]
-- user_id: serv_head
-- fname: Service
-- lname: Head
-- email: serv_head@campus.edu
-- role: service_head

-- ================================================================
-- LOGIN CREDENTIALS
-- ================================================================
-- After setup, login with:
-- Username: serv_head
-- Password: 12345678
-- ================================================================
