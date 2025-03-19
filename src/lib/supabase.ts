import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Function to set up RLS policies
export async function setupRLSPolicies() {
  try {
    // Enable RLS on api_keys table
    await supabase.rpc('enable_rls', { table_name: 'api_keys' })

    // Create policy for inserting API keys
    await supabase.rpc('create_policy', {
      table_name: 'api_keys',
      policy_name: 'Users can insert their own API keys',
      policy_definition: `
        CREATE POLICY "Users can insert their own API keys"
        ON api_keys
        FOR INSERT
        WITH CHECK (auth.uid() = user_id)
      `
    })

    // Create policy for selecting API keys
    await supabase.rpc('create_policy', {
      table_name: 'api_keys',
      policy_name: 'Users can view their own API keys',
      policy_definition: `
        CREATE POLICY "Users can view their own API keys"
        ON api_keys
        FOR SELECT
        USING (auth.uid() = user_id)
      `
    })

    // Create policy for deleting API keys
    await supabase.rpc('create_policy', {
      table_name: 'api_keys',
      policy_name: 'Users can delete their own API keys',
      policy_definition: `
        CREATE POLICY "Users can delete their own API keys"
        ON api_keys
        FOR DELETE
        USING (auth.uid() = user_id)
      `
    })

    // Enable RLS on payments table
    await supabase.rpc('enable_rls', { table_name: 'payments' })

    // Create policy for inserting payments
    await supabase.rpc('create_policy', {
      table_name: 'payments',
      policy_name: 'Users can insert their own payments',
      policy_definition: `
        CREATE POLICY "Users can insert their own payments"
        ON payments
        FOR INSERT
        WITH CHECK (auth.uid() = user_id)
      `
    })

    // Create policy for selecting payments
    await supabase.rpc('create_policy', {
      table_name: 'payments',
      policy_name: 'Users can view their own payments',
      policy_definition: `
        CREATE POLICY "Users can view their own payments"
        ON payments
        FOR SELECT
        USING (auth.uid() = user_id)
      `
    })

    // Create policy for updating payments
    await supabase.rpc('create_policy', {
      table_name: 'payments',
      policy_name: 'Users can update their own payments',
      policy_definition: `
        CREATE POLICY "Users can update their own payments"
        ON payments
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id)
      `
    })

    console.log('RLS policies set up successfully')
  } catch (error) {
    console.error('Error setting up RLS policies:', error)
    throw error
  }
}

// Call setupRLSPolicies when the app starts
setupRLSPolicies().catch(console.error)

export type User = Database['public']['Tables']['users']['Row']
export type ApiUsage = Database['public']['Tables']['api_usage']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type ApiPricing = Database['public']['Tables']['api_pricing']['Row'] 