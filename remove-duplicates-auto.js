/**
 * Automatic Duplicate Removal Script for Supabase
 * This version automatically deletes duplicates without prompting
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase credentials not found!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findDuplicatesManual() {
  const { data: applicants, error } = await supabase
    .from('applicants')
    .select('id, surname, first_name, middle_name, date_of_birth, created_at')
    .not('surname', 'is', null)
    .not('first_name', 'is', null)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Error fetching applicants:', error.message);
    return [];
  }

  const groups = {};
  applicants.forEach(app => {
    const key = `${app.surname}|${app.first_name}|${app.middle_name || ''}|${app.date_of_birth || ''}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(app);
  });

  const duplicates = [];
  Object.entries(groups).forEach(([key, apps]) => {
    if (apps.length > 1) {
      // Sort by created_at first, then by id (UUID) for stable sorting
      apps.sort((a, b) => {
        const dateCompare = new Date(a.created_at) - new Date(b.created_at);
        if (dateCompare !== 0) return dateCompare;
        return a.id.localeCompare(b.id); // Use UUID as tiebreaker
      });
      
      duplicates.push({
        surname: apps[0].surname,
        first_name: apps[0].first_name,
        middle_name: apps[0].middle_name,
        date_of_birth: apps[0].date_of_birth,
        count: apps.length,
        records: apps
      });
    }
  });

  return duplicates;
}

function displayDuplicates(duplicates) {
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! Your database is clean.\n');
    return false;
  }

  console.log(`\n📊 Found ${duplicates.length} set(s) of duplicates:\n`);
  
  const totalDuplicates = duplicates.reduce((sum, dup) => sum + dup.count, 0);
  const toDelete = duplicates.reduce((sum, dup) => sum + (dup.count - 1), 0);
  const toKeep = duplicates.length;

  duplicates.forEach((dup, index) => {
    console.log(`${index + 1}. ${dup.surname}, ${dup.first_name} ${dup.middle_name || ''} - ${dup.count} records`);
  });

  console.log(`\n📈 Summary:`);
  console.log(`   Total applicant records: ${totalDuplicates}`);
  console.log(`   Records to keep (oldest): ${toKeep}`);
  console.log(`   Records to delete (newer): ${toDelete}`);
  console.log('');

  return true;
}

async function deleteDuplicates(duplicates) {
  const idsToDelete = [];
  
  duplicates.forEach(dup => {
    dup.records.slice(1).forEach(rec => {
      idsToDelete.push(rec.id);
    });
  });

  if (idsToDelete.length === 0) {
    console.log('✅ No records to delete.\n');
    return true;
  }

  console.log(`\n🗑️  Deleting ${idsToDelete.length} duplicate records...`);

  const { error } = await supabase
    .from('applicants')
    .delete()
    .in('id', idsToDelete);

  if (error) {
    console.error('❌ Error deleting duplicates:', error.message);
    return false;
  }

  console.log(`✅ Successfully deleted ${idsToDelete.length} duplicate records!\n`);
  return true;
}

async function verifyCleanup() {
  console.log('🔍 Verifying cleanup...\n');
  
  const duplicates = await findDuplicatesManual();
  
  if (duplicates.length === 0) {
    console.log('✅ Verification complete! No duplicates found.\n');
    console.log('🎉 Your database is now clean!\n');
    return true;
  } else {
    console.log(`⚠️  Warning: Still found ${duplicates.length} set(s) of duplicates.\n`);
    return false;
  }
}

async function main() {
  console.log('════════════════════════════════════════════════════════════════════════════════');
  console.log('  PESO Duplicate Applicant Removal Tool (Automatic Mode)');
  console.log('════════════════════════════════════════════════════════════════════════════════\n');

  try {
    const duplicates = await findDuplicatesManual();
    const hasDuplicates = displayDuplicates(duplicates);
    
    if (!hasDuplicates) {
      return;
    }

    console.log('⚠️  Proceeding with automatic deletion in 3 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const success = await deleteDuplicates(duplicates);
    
    if (!success) {
      console.log('\n❌ Deletion failed. Please check the error above.\n');
      return;
    }

    await verifyCleanup();

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  }
}

main();
