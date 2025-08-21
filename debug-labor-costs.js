// Debug script to check labor costs
console.log('=== DEBUGGING LABOR COSTS ===');

// Check time entries
const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
console.log('Time entries in localStorage:', timeEntries.length);
console.log('Time entries:', timeEntries);

// Check piece rate entries
const pieceRateEntries = JSON.parse(localStorage.getItem('pieceRateEntries') || '[]');
console.log('Piece rate entries in localStorage:', pieceRateEntries.length);
console.log('Piece rate entries:', pieceRateEntries);

// Check jobs
const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
console.log('Jobs in localStorage:', jobs.length);

// Check specific job labor costs
jobs.forEach(job => {
  console.log(`Job ${job.id} (${job.jobName}):`);
  console.log('  - Labor costs:', job.financials?.actual?.laborCosts?.length || 0);
  console.log('  - Total labor cost:', job.financials?.actual?.totalLaborCost || 0);
  console.log('  - Labor costs details:', job.financials?.actual?.laborCosts || []);
});

// Check employees
const employees = JSON.parse(localStorage.getItem('employees') || '[]');
console.log('Employees in localStorage:', employees.length);
console.log('Employees:', employees.map(emp => ({ id: emp.id, name: `${emp.firstName} ${emp.lastName}`, hourlyRate: emp.hourlyRate })));
