# Service Head Role Setup Guide

## Overview

The Report Configuration functionality is now restricted to **Service Head** role instead of Admin. This allows dedicated service heads to manage report forms and ML weights without requiring full admin privileges.

---

## Default Credentials

**Email:** `serv_head@campus.edu`  
**Password:** `12345678`  
**Role:** `service_head`

---

## Setup Methods

### Method 1: Using Supabase Dashboard (Recommended)

1. **Navigate to Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard
   - Select your campus-ease project

2. **Create Auth User**
   - Go to **Authentication** → **Users**
   - Click **Add User** button
   - Fill in:
     - **Email:** `serv_head@campus.edu`
     - **Password:** `12345678`
     - **Auto Confirm User:** ✅ (check this box)
   - Click **Create User**

3. **Copy User ID**
   - After creation, copy the UUID shown in the user list
   - Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

4. **Add Profile Record**
   - Go to **Table Editor** → Select your users/profiles table
   - Click **Insert** → **Insert row**
   - Fill in:
     - **id:** (paste the UUID from step 3)
     - **email:** `serv_head@campus.edu`
     - **role:** `service_head`
     - **full_name:** `Service Head`
   - Click **Save**

5. **Verify Setup**
   - Try logging in with the credentials
   - Navigate to `/report-configuration` page
   - Verify access is granted

---

### Method 2: Using JavaScript Script

1. **Run the setup script**:
   ```bash
   node create_service_head.js
   ```

2. **Check console output**:
   - Should show: ✅ Auth account created successfully
   - Should show: ✅ Profile record created successfully
   - Note the User ID for reference

3. **Verify login**:
   - Open your app and try logging in
   - Email: `serv_head@campus.edu`
   - Password: `12345678`

**Note:** If you see "User already exists" message, the account was already created. You can use the credentials to log in directly.

---

### Method 3: Manual SQL (Advanced)

1. **Create auth user via Supabase Dashboard first** (Step 2 from Method 1)

2. **Get the user ID** and replace `YOUR_AUTH_USER_ID` in the SQL below

3. **Run in Supabase SQL Editor**:
   ```sql
   -- Insert profile record
   INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
   VALUES (
     'YOUR_AUTH_USER_ID', -- Replace with actual UUID
     'serv_head@campus.edu',
     'service_head',
     'Service Head',
     NOW(),
     NOW()
   );
   ```

---

## Access Control Changes

### Updated Routes

**Before:** Only `admin` could access Report Configuration  
**After:** Both `service_head` and `admin` can access Report Configuration

### Code Changes Made:

1. **App.tsx** - Added `ServiceHeadRoute` component:
   ```typescript
   function ServiceHeadRoute({ children }) {
     const { userData } = useUser();
     if (userData?.role === 'service_head' || userData?.role === 'admin') {
       return children;
     } else {
       return <Navigate to="/Index" replace />;
     }
   }
   ```

2. **App.tsx** - Updated route:
   ```typescript
   <Route path="/report-configuration" 
          element={<ServiceHeadRoute><ReportConfiguration /></ServiceHeadRoute>} />
   ```

3. **Header.tsx** - Updated navigation:
   ```typescript
   {(userData?.role === 'service_head' || userData?.role === 'admin') && (
     <Link to="/report-configuration">Report Config</Link>
   )}
   ```

---

## Database Permissions (RLS Policies)

If you're using Row Level Security in Supabase, you'll need to add policies to allow service heads to access configuration tables:

### Execute in Supabase SQL Editor:

```sql
-- Allow service_head to manage report_field_config
CREATE POLICY "Service heads can manage report fields"
ON report_field_config
FOR ALL
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('service_head', 'admin')
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('service_head', 'admin')
);

-- Allow service_head to manage category_weights
CREATE POLICY "Service heads can manage category weights"
ON category_weights
FOR ALL
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('service_head', 'admin')
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('service_head', 'admin')
);

-- Allow service_head to manage impact_weights
CREATE POLICY "Service heads can manage impact weights"
ON impact_weights
FOR ALL
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('service_head', 'admin')
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('service_head', 'admin')
);

-- Allow service_head to manage occurrence_weights
CREATE POLICY "Service heads can manage occurrence weights"
ON occurrence_weights
FOR ALL
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('service_head', 'admin')
)
WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('service_head', 'admin')
);
```

**Note:** Adjust the policy conditions based on how your app stores and checks user roles.

---

## Testing the Setup

### 1. Login as Service Head
- Open your app
- Login with:
  - Email: `serv_head@campus.edu`
  - Password: `12345678`

### 2. Verify Navigation
- Check that "Report Config" link appears in the header
- Admin-only links (Class Management, Faculty Management, etc.) should NOT appear

### 3. Access Report Configuration
- Click "Report Config" in the header
- Should navigate to `/report-configuration`
- Should see the configuration interface with two tabs:
  - Form Fields
  - ML Weights

### 4. Test Functionality
- Try adding a new field
- Try editing an existing field
- Try adjusting ML weights
- Click "Sync to ML Service"
- Verify all operations work correctly

### 5. Test Access Control
- Try accessing admin-only pages like `/class-management`
- Should be redirected to `/Index` (home page)

---

## Multiple Service Heads

To create additional service head accounts:

1. **Use Supabase Dashboard:**
   - Follow Method 1 above
   - Use different email addresses
   - Example: `serv_head2@campus.edu`, `serv_head3@campus.edu`

2. **Or modify the script:**
   - Edit `create_service_head.js`
   - Change the email and password
   - Run: `node create_service_head.js`

---

## Troubleshooting

### Issue: Cannot see "Report Config" link

**Solutions:**
1. Verify the user role is set to `service_head` in the database
2. Check that you're logged in with the service head account
3. Clear browser cache and reload
4. Check browser console for errors

### Issue: Access denied when opening Report Configuration page

**Solutions:**
1. Verify RLS policies are set correctly (see Database Permissions section)
2. Check that the role field matches exactly: `service_head` (not `serviceHead` or other variations)
3. Ensure the user profile record exists with correct role

### Issue: Cannot create auth user

**Solutions:**
1. Check that email isn't already registered
2. Verify password meets Supabase requirements (min 6 characters)
3. Try using Supabase Dashboard instead of script
4. Check Supabase project settings for auth configuration

### Issue: "User not allowed" error

**Solutions:**
1. Check Supabase email settings (Authentication → Providers → Email)
2. Ensure "Enable Email Signup" is enabled
3. Disable email confirmation requirement for testing
4. Use dashboard method to auto-confirm user

---

## Security Considerations

### Default Credentials

⚠️ **IMPORTANT:** Change the default password after first login!

1. Login with default credentials
2. Navigate to profile/settings page
3. Change password to something secure
4. Update password in your documentation

### Production Deployment

For production environments:

1. **Remove default credentials** from documentation
2. **Generate unique passwords** for each service head
3. **Enable MFA** (Multi-Factor Authentication) if available
4. **Audit access logs** regularly
5. **Rotate passwords** periodically
6. **Limit service head count** to necessary personnel only

### Access Scope

Service heads can:
- ✅ View and edit report field configurations
- ✅ Manage ML model weights
- ✅ Sync weights to ML service
- ❌ Access admin-only pages (class/faculty management)
- ❌ Modify user accounts
- ❌ Access system settings

---

## Summary

The Report Configuration system is now controlled by the **Service Head** role:

- ✅ Default account created: `serv_head@campus.edu` / `12345678`
- ✅ Access restricted to service_head and admin roles
- ✅ Navigation updated to show for service heads
- ✅ Route protection implemented
- ✅ Database policies configured

Service heads can now independently manage report forms and ML configurations without requiring full admin access, providing better separation of concerns and security.
