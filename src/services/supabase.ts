import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SmartCRM: Missing environment variables. Please check your .env file.');
}

// Safety check to ensure we aren't using the deleted project
if (supabaseUrl.includes('sdfljxwreevvpxspsyee')) {
  console.error('CRITICAL: SmartCRM is still pointing to the deleted "crm" project ref. Please update your .env file immediately.');
}

// SmartCRM validation
if (!supabaseUrl.includes('pntwjimzugroyyotlwvm')) {
  console.warn('Warning: Application is not pointing to the validated SmartCRM project.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
