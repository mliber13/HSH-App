import { useCallback } from 'react';

// Employer tax rate for employees (17%)
const EMPLOYER_TAX_RATE = 0.17;

export const useJobLaborCosts = () => {
  // Calculate labor costs for a single job
  const calculateLaborCostsForSingleJob = useCallback((job, allTimeEntries, allPieceRateEntries, allEmployees) => {
    const jobTimeEntries = allTimeEntries.filter(entry => entry.jobId === job.id && entry.clockOutTime);
    const jobPieceRateEntries = allPieceRateEntries.filter(entry => entry.jobId === job.id && entry.status === 'completed');

    // Calculate hourly labor costs
    const hourlyLaborCosts = [];
    const hourlyLaborMap = new Map();

    jobTimeEntries.forEach(entry => {
      const employee = allEmployees.find(emp => emp.id === entry.employeeId);
      if (employee && entry.totalHours) {
        const cost = entry.totalHours * employee.hourlyRate;
        const key = `hourly-${employee.firstName}-${employee.lastName}`;
        
        if (hourlyLaborMap.has(key)) {
          const existing = hourlyLaborMap.get(key);
          existing.amount += cost;
          existing.hours += entry.totalHours;
        } else {
          hourlyLaborMap.set(key, {
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: 'hourly',
            hours: entry.totalHours,
            rate: employee.hourlyRate,
            amount: cost,
            employerTax: cost * EMPLOYER_TAX_RATE
          });
        }
      }
    });

    // Convert map to array
    hourlyLaborMap.forEach((value) => {
      hourlyLaborCosts.push(value);
    });

    // Calculate piece rate labor costs
    const pieceRateLaborCosts = [];
    const pieceRateLaborMap = new Map();

    jobPieceRateEntries.forEach(entry => {
      const employee = allEmployees.find(emp => emp.id === entry.employeeId);
      if (employee && entry.totalEarnings) {
        const key = `piece-${employee.firstName}-${employee.lastName}`;
        
        if (pieceRateLaborMap.has(key)) {
          const existing = pieceRateLaborMap.get(key);
          existing.amount += entry.totalEarnings;
          existing.quantity += entry.completionPercentage || 0;
        } else {
          pieceRateLaborMap.set(key, {
            employeeId: employee.id,
            employeeName: `${employee.firstName} ${employee.lastName}`,
            type: 'piece_rate',
            quantity: entry.completionPercentage || 0,
            rate: entry.pieceRate || 0,
            amount: entry.totalEarnings,
            employerTax: entry.totalEarnings * EMPLOYER_TAX_RATE
          });
        }
      }
    });

    // Convert map to array
    pieceRateLaborMap.forEach((value) => {
      pieceRateLaborCosts.push(value);
    });

    // Calculate totals
    const totalHourlyCost = hourlyLaborCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const totalPieceRateCost = pieceRateLaborCosts.reduce((sum, cost) => sum + cost.amount, 0);
    const totalLaborCost = totalHourlyCost + totalPieceRateCost;
    const totalEmployerTax = (totalHourlyCost + totalPieceRateCost) * EMPLOYER_TAX_RATE;

    return {
      hourlyLaborCosts,
      pieceRateLaborCosts,
      totalHourlyCost,
      totalPieceRateCost,
      totalLaborCost,
      totalEmployerTax,
      allLaborCosts: [...hourlyLaborCosts, ...pieceRateLaborCosts]
    };
  }, []);

  // Recalculate all job labor costs
  const recalculateAllJobLaborCosts = useCallback((jobs, timeEntries, pieceRateEntries, employees, updateJob) => {
    jobs.forEach(job => {
      const laborCosts = calculateLaborCostsForSingleJob(job, timeEntries, pieceRateEntries, employees);
      
      updateJob(job.id, {
        financials: {
          ...job.financials,
          actual: {
            ...job.financials?.actual,
            laborCost: laborCosts.totalLaborCost,
            laborCostBreakdown: laborCosts
          }
        }
      });
    });
  }, [calculateLaborCostsForSingleJob]);

  // Reset all job labor costs
  const resetAllJobLaborCosts = useCallback((jobs, updateJob) => {
    jobs.forEach(job => {
      updateJob(job.id, {
        financials: {
          ...job.financials,
          actual: {
            ...job.financials?.actual,
            laborCost: 0,
            laborCostBreakdown: {
              hourlyLaborCosts: [],
              pieceRateLaborCosts: [],
              totalHourlyCost: 0,
              totalPieceRateCost: 0,
              totalLaborCost: 0,
              totalEmployerTax: 0,
              allLaborCosts: []
            }
          }
        }
      });
    });
  }, []);

  return {
    calculateLaborCostsForSingleJob,
    recalculateAllJobLaborCosts,
    resetAllJobLaborCosts
  };
};
