// Test script to add a time entry and check labor costs
console.log('=== TESTING TIME ENTRY AND LABOR COSTS ===');

// Get current data
const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
const employees = JSON.parse(localStorage.getItem('employees') || '[]');

console.log('Current time entries:', timeEntries.length);
console.log('Current jobs:', jobs.length);
console.log('Current employees:', employees.length);

// Add a test time entry if we have jobs and employees
if (jobs.length > 0 && employees.length > 0) {
  const testJob = jobs[0];
  const testEmployee = employees[0];
  
  const testTimeEntry = {
    id: 'test-entry-' + Date.now(),
    employeeId: testEmployee.id,
    jobId: testJob.id,
    clockInTime: new Date().toISOString(),
    clockOutTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours later
    totalHours: 8,
    hourlyRate: testEmployee.hourlyRate,
    totalPay: 8 * testEmployee.hourlyRate,
    status: 'completed',
    date: new Date().toISOString().split('T')[0]
  };
  
  console.log('Adding test time entry:', testTimeEntry);
  
  // Add to localStorage
  const updatedTimeEntries = [...timeEntries, testTimeEntry];
  localStorage.setItem('timeEntries', JSON.stringify(updatedTimeEntries));
  
  console.log('Test time entry added!');
  console.log('Updated time entries:', updatedTimeEntries.length);
  
  // Calculate expected labor cost
  const expectedLaborCost = testTimeEntry.totalPay;
  console.log('Expected labor cost:', expectedLaborCost);
  
  // Check if employee is an Employee (gets taxed)
  if (testEmployee.employeeType === 'Employee') {
    const employerTax = expectedLaborCost * 0.17; // 17% tax
    const totalWithTax = expectedLaborCost + employerTax;
    console.log('Employee type: Employee - applying 17% employer tax');
    console.log('Original amount:', expectedLaborCost);
    console.log('Employer tax:', employerTax);
    console.log('Total with tax:', totalWithTax);
  } else {
    console.log('Employee type:', testEmployee.employeeType, '- no employer tax');
  }
} else {
  console.log('No jobs or employees found to test with');
}
