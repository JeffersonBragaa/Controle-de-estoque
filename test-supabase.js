require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Error: Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing connection to Supabase...', supabaseUrl);
  const { data, error } = await supabase.from('produtos').select('*').limit(1);
  if (error) {
    console.log('Connection failed or table missing:', error);
  } else {
    console.log('Connection successful! Data:', data);
  }
}
test();
