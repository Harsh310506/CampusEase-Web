-- Service Head Setup Script
-- This script creates a default service head user with credentials
-- Username: serv_head
-- Password: 12345678

-- Step 1: Create the service head user in auth.users (via Supabase Dashboard or API)
-- Note: This should be done through Supabase Auth since direct auth.users modification is restricted
-- Go to: Authentication > Users > Add User
-- Email: serv_head@campus.edu
-- Password: 12345678
-- Or use the signUp function below

-- Step 2: After creating the auth user, insert the profile record
-- Replace 'YOUR_AUTH_USER_ID' with the actual UUID from auth.users after creating the account

-- Example insert for profiles table (adjust table name if different)
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
VALUES (
  'YOUR_AUTH_USER_ID', -- Replace with actual UUID from auth.users
  'serv_head@campus.edu',
  'service_head',
  'Service Head',
  NOW(),
  NOW()
);

-- Alternative: If your system uses a different user/profile structure, adjust accordingly
-- For example, if you have a 'users' table:
-- INSERT INTO users (id, email, role, name) 
-- VALUES ('YOUR_AUTH_USER_ID', 'serv_head@campus.edu', 'service_head', 'Service Head');

-- Step 3: Grant necessary permissions (if using RLS policies)
-- Ensure service_head role has access to report configuration tables
-- Example RLS policy:

-- Allow service_head to read all report field configs
CREATE POLICY "Service heads can view report field configs"
ON report_field_config
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- Allow service_head to insert report field configs
CREATE POLICY "Service heads can insert report field configs"
ON report_field_config
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- Allow service_head to update report field configs
CREATE POLICY "Service heads can update report field configs"
ON report_field_config
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- Allow service_head to delete report field configs
CREATE POLICY "Service heads can delete report field configs"
ON report_field_config
FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- Repeat similar policies for category_weights table
CREATE POLICY "Service heads can manage category weights"
ON category_weights
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- Repeat similar policies for impact_weights table
CREATE POLICY "Service heads can manage impact weights"
ON impact_weights
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- Repeat similar policies for occurrence_weights table
CREATE POLICY "Service heads can manage occurrence weights"
ON occurrence_weights
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'service_head' OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- IMPORTANT NOTES:
-- 1. The auth user MUST be created first through Supabase Dashboard or Auth API
-- 2. Replace 'YOUR_AUTH_USER_ID' with the actual UUID after creating the auth account
-- 3. Adjust table names (profiles/users) based on your actual schema
-- 4. The RLS policies assume role is stored in JWT token or accessible via auth.jwt()
-- 5. If role is stored differently, adjust the policy conditions accordingly
