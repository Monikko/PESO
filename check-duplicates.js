import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDatabase() {
  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('applicants')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error getting count:', countError);
    return;
  }

  console.log(`\n📊 Total applicants in database: ${totalCount}\n`);

  // Get FERNANDEZ records
  const { data: fernandez, error: fernandezError } = await supabase
    .from('applicants')
    .select('id, surname, first_name, middle_name, date_of_birth, created_at')
    .eq('surname', 'FERNANDEZ')
    .order('created_at', { ascending: true });

  if (fernandezError) {
    console.error('Error getting FERNANDEZ:', fernandezError);
    return;
  }

  console.log(`\n👤 FERNANDEZ records: ${fernandez.length}`);
  fernandez.forEach((rec, i) => {
    console.log(`  ${i + 1}. ID: ${rec.id.substring(0, 8)}..., Created: ${new Date(rec.created_at).toLocaleString()}`);
  });
  console.log('');
}

checkDatabase();
