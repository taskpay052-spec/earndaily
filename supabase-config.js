// supabase-config.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Your Supabase credentials
const SUPABASE_URL = 'https://aknrniwnbugfqyhlrxja.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pYZ7WIdWmBHRh5sHPxIfDA_RXfbL95w';

// Create and export Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to check if user is logged in
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// Helper function to get user profile from database
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data;
}

// Helper function to check if user is activated
export async function isUserActivated(userId) {
  const profile = await getUserProfile(userId);
  return profile?.is_activated || false;
}

// Helper function to activate user account
export async function activateUserAccount(userId, transactionCode, phoneNumber) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_activated: true,
      activation_date: new Date().toISOString(),
      activation_code: transactionCode
    })
    .eq('id', userId)
    .select();
  
  if (error) throw error;
  
  // Record transaction
  await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: 199,
      transaction_code: transactionCode,
      type: 'activation',
      status: 'completed',
      phone_number: phoneNumber || null
    });
  
  return data;
}
