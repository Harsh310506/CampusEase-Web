import { supabase } from './src/supabase/supabaseClient';

/**
 * Script to create default Service Head account
 * Credentials:
 * Email: serv_head@campus.edu
 * Password: 12345678
 * Role: service_head
 */

async function createServiceHeadAccount() {
  console.log('Creating Service Head account...');

  try {
    // Step 1: Sign up the service head user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'serv_head@campus.edu',
      password: '12345678',
      options: {
        data: {
          role: 'service_head',
          full_name: 'Service Head',
        }
      }
    });

    if (signUpError) {
      console.error('Error creating auth account:', signUpError.message);
      
      // If user already exists, try to fetch and update
      if (signUpError.message.includes('already registered')) {
        console.log('User already exists. Attempting to update profile...');
        
        // Sign in to get the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'serv_head@campus.edu',
          password: '12345678',
        });

        if (signInError) {
          console.error('Error signing in:', signInError.message);
          return;
        }

        console.log('✅ Service Head account already exists and is accessible');
        console.log('📧 Email: serv_head@campus.edu');
        console.log('🔑 Password: 12345678');
        console.log('👤 User ID:', signInData.user?.id);
        return;
      }
      
      return;
    }

    console.log('✅ Auth account created successfully!');
    console.log('📧 Email: serv_head@campus.edu');
    console.log('🔑 Password: 12345678');
    console.log('👤 User ID:', authData.user?.id);

    // Step 2: Insert or update profile in your user table
    // Adjust this based on your actual table structure
    
    // Option A: If you have a 'profiles' table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user?.id,
        email: 'serv_head@campus.edu',
        role: 'service_head',
        full_name: 'Service Head',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.warn('Note: Could not create profile record:', profileError.message);
      console.log('You may need to manually create the profile record or adjust the table name');
    } else {
      console.log('✅ Profile record created successfully!');
    }

    console.log('\n🎉 Service Head account setup complete!');
    console.log('You can now login with:');
    console.log('  Email: serv_head@campus.edu');
    console.log('  Password: 12345678');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
createServiceHeadAccount();
