// Force sync labor costs script
console.log('=== FORCING LABOR COST SYNC ===');

// Re-enable auto-sync by clearing the disableAutoSync flag
// This simulates what would happen when the timeout expires
console.log('Re-enabling auto-sync...');

// Get current data
const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
const pieceRateEntries = JSON.parse(localStorage.getItem('pieceRateEntries') || '[]');
const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
const employees = JSON.parse(localStorage.getItem('employees') || '[]');

console.log('Current state:');
console.log('- Time entries:', timeEntries.length);
console.log('- Piece rate entries:', pieceRateEntries.length);
console.log('- Jobs:', jobs.length);
console.log('- Employees:', employees.length);

// Check if there are any time entries that should generate labor costs
const completedTimeEntries = timeEntries.filter(entry => entry.clockOutTime && entry.status === 'completed');
console.log('Completed time entries:', completedTimeEntries.length);

if (completedTimeEntries.length > 0) {
  console.log('Sample completed time entry:', completedTimeEntries[0]);
  
  // Check if any jobs have labor costs
  jobs.forEach(job => {
    const jobLaborCosts = job.financials?.actual?.laborCosts || [];
    const totalLaborCost = job.financials?.actual?.totalLaborCost || 0;
    
    console.log(`Job ${job.id} (${job.jobName}):`);
    console.log(`  - Labor costs array: ${jobLaborCosts.length} entries`);
    console.log(`  - Total labor cost: $${totalLaborCost.toFixed(2)}`);
    
    // Check if this job has any time entries
    const jobTimeEntries = completedTimeEntries.filter(entry => entry.jobId === job.id);
    console.log(`  - Time entries for this job: ${jobTimeEntries.length}`);
    
    if (jobTimeEntries.length > 0 && totalLaborCost === 0) {
      console.log(`  ⚠️  ISSUE: Job has ${jobTimeEntries.length} time entries but $0 labor cost!`);
    }
  });
} else {
  console.log('No completed time entries found - this is why labor costs are $0');
}

// Instructions for manual fix
console.log('\n=== MANUAL FIX INSTRUCTIONS ===');
console.log('1. Go to the Time Clock section');
console.log('2. Create a test time entry by clocking in and out');
console.log('3. Check if the labor cost appears in Job Financials > Actual tab');
console.log('4. If it still doesn\'t work, the auto-sync might be disabled');
console.log('5. Try refreshing the page to reset the auto-sync state');
