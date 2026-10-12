/**
 * Interactive Duplicate Removal Script for Supabase
 * 
 * This script helps you:
 * 1. Review duplicate applicants
 * 2. Safely remove duplicates (keeping the oldest record)
 * 3. Verify the cleanup
 * 
 * Usage: node remove-duplicates.js
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase credentials not found!');
  console.error('Please make sure you have a .env file with:');
  console.error('  VITE_SUPABASE_URL=your_url');
  console.error('  VITE_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Step 1: Find and display duplicates
async function findDuplicates() {
  console.log('\n🔍 Searching for duplicate applicants...\n');

  const { data, error } = await supabase.rpc('find_duplicates', {});

  if (error) {
    // If the function doesn't exist, use a manual query
    console.log('Using manual query to find duplicates...');
    return await findDuplicatesManual();
  }

  return data;
}

async function findDuplicatesManual() {
  // Get all applicants
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

  // Group by name and DOB
  const groups = {};
  applicants.forEach(app => {
    const key = `${app.surname}|${app.first_name}|${app.middle_name || ''}|${app.date_of_birth || ''}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(app);
  });

  // Find duplicates
  const duplicates = [];
  Object.entries(groups).forEach(([key, apps]) => {
    if (apps.length > 1) {
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

// Step 2: Display duplicates
function displayDuplicates(duplicates) {
  if (duplicates.length === 0) {
    console.log('✅ No duplicates found! Your database is clean.\n');
    return false;
  }

  console.log(`\n📊 Found ${duplicates.length} set(s) of duplicates:\n`);
  console.log('═'.repeat(80));

  duplicates.forEach((dup, index) => {
    console.log(`\n${index + 1}. ${dup.surname}, ${dup.first_name} ${dup.middle_name || ''}`);
    console.log(`   Date of Birth: ${dup.date_of_birth || 'N/A'}`);
    console.log(`   Duplicate Count: ${dup.count} records`);
    console.log(`   Records:`);
    
    dup.records.forEach((rec, i) => {
      const keepLabel = i === 0 ? ' ← WILL BE KEPT' : ' ← WILL BE DELETED';
      console.log(`     ${i + 1}. ID: ${rec.id}, Created: ${new Date(rec.created_at).toLocaleString()}${keepLabel}`);
    });
  });

  console.log('\n' + '═'.repeat(80));
  
  // Calculate totals
  const totalDuplicates = duplicates.reduce((sum, dup) => sum + dup.count, 0);
  const toDelete = duplicates.reduce((sum, dup) => sum + (dup.count - 1), 0);
  const toKeep = duplicates.length;

  console.log(`\n📈 Summary:`);
  console.log(`   Total applicant records: ${totalDuplicates}`);
  console.log(`   Records to keep (oldest): ${toKeep}`);
  console.log(`   Records to delete (newer): ${toDelete}`);
  console.log('');

  return true;
}

// Step 3: Delete duplicates
async function deleteDuplicates(duplicates) {
  const idsToDelete = [];
  
  duplicates.forEach(dup => {
    // Skip the first (oldest) record, add the rest to delete list
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

// Step 4: Verify cleanup
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

// Main function
async function main() {
  console.log('═'.repeat(80));
  console.log('  PESO Duplicate Applicant Removal Tool');
  console.log('═'.repeat(80));
  console.log('\n⚠️  WARNING: This will permanently delete duplicate records!');
  console.log('   The OLDEST record for each duplicate will be kept.\n');

  try {
    // Step 1: Find duplicates
    const duplicates = await findDuplicatesManual();
    
    // Step 2: Display duplicates
    const hasDuplicates = displayDuplicates(duplicates);
    
    if (!hasDuplicates) {
      rl.close();
      return;
    }

    // Step 3: Confirm deletion
    const answer = await question('❓ Do you want to delete these duplicates? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Operation cancelled. No records were deleted.\n');
      rl.close();
      return;
    }

    // Step 4: Delete duplicates
    const success = await deleteDuplicates(duplicates);
    
    if (!success) {
      console.log('\n❌ Deletion failed. Please check the error above.\n');
      rl.close();
      return;
    }

    // Step 5: Verify cleanup
    await verifyCleanup();

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
main();
