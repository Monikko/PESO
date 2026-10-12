import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findAndDeleteDuplicates() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  PESO Duplicate Removal (Batch Processing)');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Get all applicants
  const { data: applicants, error } = await supabase
    .from('applicants')
    .select('id, surname, first_name, middle_name, date_of_birth, created_at')
    .not('surname', 'is', null)
    .not('first_name', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching applicants:', error.message);
    return;
  }

  console.log(`📊 Total applicants fetched: ${applicants.length}\n`);

  // Group by name and DOB
  const groups = {};
  applicants.forEach(app => {
    const key = `${app.surname}|${app.first_name}|${app.middle_name || ''}|${app.date_of_birth || ''}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(app);
  });

  // Find duplicates and collect IDs to delete
  let totalDeleted = 0;
  let duplicateCount = 0;

  for (const [key, apps] of Object.entries(groups)) {
    if (apps.length > 1) {
      duplicateCount++;
      
      // Sort by created_at then by ID for stable sorting
      apps.sort((a, b) => {
        const dateCompare = new Date(a.created_at) - new Date(b.created_at);
        if (dateCompare !== 0) return dateCompare;
        return a.id.localeCompare(b.id);
      });

      const toKeep = apps[0];
      const toDelete = apps.slice(1);

      console.log(`${duplicateCount}. ${apps[0].surname}, ${apps[0].first_name} - ${apps.length} records`);
      console.log(`   Keeping: ${toKeep.id}`);

      // Delete each duplicate one by one
      for (const dup of toDelete) {
        console.log(`   Deleting: ${dup.id}`);
        
        const { error: deleteError } = await supabase
          .from('applicants')
          .delete()
          .eq('id', dup.id);

        if (deleteError) {
          console.error(`   ❌ Error deleting ${dup.id}:`, deleteError.message);
        } else {
          totalDeleted++;
          console.log(`   ✅ Deleted successfully`);
        }
      }
      console.log('');
    }
  }

  console.log('════════════════════════════════════════════════════════════════');
  console.log(`\n✅ Deleted ${totalDeleted} duplicate records from ${duplicateCount} sets\n`);

  // Verify
  console.log('🔍 Verifying cleanup...\n');
  const { count: finalCount } = await supabase
    .from('applicants')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Final applicant count: ${finalCount}\n`);
}

findAndDeleteDuplicates();
