import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('Testing connection to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);
const { data, error } = await supabase.from('produtos').select('*').limit(1);
if (error) {
  console.log('Connection failed or table missing:', error);
} else {
  console.log('Connection successful! Data:', data);
}
