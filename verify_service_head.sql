-- ================================================================
-- COMPREHENSIVE SERVICE HEAD DEBUGGING SCRIPT
-- ================================================================
-- Run each section step by step to diagnose the login issue

-- ================================================================
-- STEP 1: Check if service head exists in users table
-- ================================================================
SELECT 
  id,
  user_id,
  fname,
  lname,
  email,
  role,
  created_at
FROM public.users 
WHERE user_id = 'serv_head' AND role = 'service_head';

-- Expected: 1 row with email 'serv_head@campus.edu'
-- If NO ROWS: The account doesn't exist, proceed to CREATE section below

-- ================================================================
-- STEP 2: Check if auth user exists (CRITICAL!)
-- ================================================================
-- This checks if the authentication account exists
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'serv_head@campus.edu';

-- Expected: 1 row with matching email
-- If NO ROWS: Auth account is missing! You MUST create it in Authentication dashboard
-- If email_confirmed_at is NULL: Email needs to be confirmed

-- ================================================================
-- STEP 3: Check if IDs match between tables
-- ================================================================
SELECT 
  u.id as users_table_id,
  u.email as users_email,
  a.id as auth_table_id,
  a.email as auth_email,
  CASE 
    WHEN u.id = a.id THEN '✓ IDs MATCH' 
    ELSE '✗ IDs DO NOT MATCH - THIS IS THE PROBLEM!'
  END as id_status
FROM public.users u
FULL OUTER JOIN auth.users a ON u.email = a.email
WHERE u.user_id = 'serv_head' OR a.email = 'serv_head@campus.edu';

-- Expected: IDs should match
-- If IDs don't match: You need to fix the ID mismatch (see FIX section)

-- ================================================================
-- FIX OPTION 1: Create missing auth user
-- ================================================================
-- If auth user doesn't exist, create it:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Enter:
--    Email: serv_head@campus.edu
--    Password: 12345678
--    ✓ Check "Auto Confirm User"
-- 4. Click "Create User"
-- 5. COPY the UUID shown
-- 6. Run the UPDATE query below

-- ================================================================
-- FIX OPTION 2: Update users table ID to match auth ID
-- ================================================================
-- If you created a new auth user, update the users table to match:
-- Replace YOUR_AUTH_UUID_HERE with the UUID from auth.users
/*
UPDATE public.users
SET id = 'YOUR_AUTH_UUID_HERE'
WHERE user_id = 'serv_head' AND role = 'service_head';
*/

-- ================================================================
-- FIX OPTION 3: Delete and recreate everything (LAST RESORT)
-- ================================================================
-- Only use this if nothing else works!
/*
-- Delete from users table
DELETE FROM public.users WHERE user_id = 'serv_head';

-- Then:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Delete the serv_head@campus.edu user if it exists
-- 3. Create new auth user (Email: serv_head@campus.edu, Password: 12345678, Auto Confirm)
-- 4. Copy the UUID
-- 5. Run the INSERT below

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
  'YOUR_NEW_UUID_HERE',  -- Replace with UUID from auth
  'serv_head',
  'Service',
  'Head',
  'serv_head@campus.edu',
  'service_head',
  true,
  NOW()
);
*/

-- ================================================================
-- VERIFICATION: Run this after applying any fix
-- ================================================================
SELECT 
  'Users Table' as source,
  id,
  user_id,
  email,
  role
FROM public.users 
WHERE user_id = 'serv_head'

UNION ALL

SELECT 
  'Auth Table' as source,
  id,
  email as user_id,
  email,
  'N/A' as role
FROM auth.users 
WHERE email = 'serv_head@campus.edu';

-- Expected: Both rows should have the SAME ID
