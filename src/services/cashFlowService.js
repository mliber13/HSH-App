// Cash Flow Forecasting Service
class CashFlowService {
  constructor() {
    this.loadCashFlowData();
  }

  loadCashFlowData() {
    const stored = localStorage.getItem('cashFlowData');
    if (stored) {
      this.cashFlowData = JSON.parse(stored);
    } else {
      this.cashFlowData = {
        currentBalance: 50000,
        revenueProjections: {},
        expenseProjections: {},
        recurringExpenses: {
          payroll: {
            weekly: 15000,
            biweekly: false,
            description: 'Weekly Payroll'
          },
          vehiclePayments: {
            monthly: 2500,
            dueDay: 15,
            description: 'Vehicle Loan Payments'
          },
          insurance: {
            monthly: 800,
            dueDay: 1,
            description: 'Business Insurance'
          },
          rent: {
            monthly: 2000,
            dueDay: 1,
            description: 'Office Rent'
          },
          utilities: {
            monthly: 400,
            dueDay: 15,
            description: 'Utilities'
          }
        },
        paymentTerms: {
          customerPaymentDays: 30,
          supplierPaymentDays: 45,
          retainagePercentage: 10
        },
        scenarios: {
          optimistic: { revenueMultiplier: 1.1, expenseMultiplier: 0.95 },
          pessimistic: { revenueMultiplier: 0.9, expenseMultiplier: 1.05 },
          realistic: { revenueMultiplier: 1.0, expenseMultiplier: 1.0 }
        }
      };
      this.saveCashFlowData();
    }
  }

  saveCashFlowData() {
    localStorage.setItem('cashFlowData', JSON.stringify(this.cashFlowData));
  }

  // Revenue Projections
  addRevenueProjection(jobId, jobName, amount, billingDate, expectedPaymentDate, description = '') {
    if (!this.cashFlowData.revenueProjections[jobId]) {
      this.cashFlowData.revenueProjections[jobId] = [];
    }
    
    this.cashFlowData.revenueProjections[jobId].push({
      id: Date.now() + Math.random(),
      jobName,
      amount: parseFloat(amount),
      billingDate,
      expectedPaymentDate,
      description,
      status: 'projected', // projected, billed, received
      actualPaymentDate: null,
      actualAmount: null
    });
    
    this.saveCashFlowData();
  }

  updateRevenueStatus(jobId, projectionId, status, actualPaymentDate = null, actualAmount = null) {
    const projections = this.cashFlowData.revenueProjections[jobId];
    if (projections) {
      const projection = projections.find(p => p.id === projectionId);
      if (projection) {
        projection.status = status;
        projection.actualPaymentDate = actualPaymentDate;
        projection.actualAmount = actualAmount;
        this.saveCashFlowData();
      }
    }
  }

  // Expense Projections
  addExpenseProjection(category, amount, dueDate, description, supplier = '') {
    if (!this.cashFlowData.expenseProjections[category]) {
      this.cashFlowData.expenseProjections[category] = [];
    }
    
    this.cashFlowData.expenseProjections[category].push({
      id: Date.now() + Math.random(),
      amount: parseFloat(amount),
      dueDate,
      description,
      supplier,
      status: 'projected', // projected, paid
      actualPaymentDate: null,
      actualAmount: null
    });
    
    this.saveCashFlowData();
  }

  updateExpenseStatus(category, projectionId, status, actualPaymentDate = null, actualAmount = null) {
    const projections = this.cashFlowData.expenseProjections[category];
    if (projections) {
      const projection = projections.find(p => p.id === projectionId);
      if (projection) {
        projection.status = status;
        projection.actualPaymentDate = actualPaymentDate;
        projection.actualAmount = actualAmount;
        this.saveCashFlowData();
      }
    }
  }

  // Recurring Expenses
  updateRecurringExpense(category, data) {
    this.cashFlowData.recurringExpenses[category] = {
      ...this.cashFlowData.recurringExpenses[category],
      ...data
    };
    this.saveCashFlowData();
  }

  // Cash Flow Calculations
  calculateCashFlowProjection(startDate, endDate, scenario = 'realistic') {
    const weeks = this.getWeeksBetween(startDate, endDate);
    const cashFlow = [];
    let runningBalance = this.cashFlowData.currentBalance;
    
    weeks.forEach(week => {
      const weekStart = new Date(week);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
      
      // Calculate revenue for this week
      const revenue = this.calculateWeeklyRevenue(weekStart, weekEnd, scenario);
      
      // Calculate expenses for this week
      const expenses = this.calculateWeeklyExpenses(weekStart, weekEnd, scenario);
      
      // Calculate net cash flow
      const netCashFlow = revenue - expenses;
      runningBalance += netCashFlow;
      
      cashFlow.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        revenue,
        expenses,
        netCashFlow,
        runningBalance,
        fundingNeeded: runningBalance < 0 ? Math.abs(runningBalance) : 0
      });
    });
    
    return cashFlow;
  }

  calculateWeeklyRevenue(startDate, endDate, scenario) {
    let totalRevenue = 0;
    const multiplier = this.cashFlowData.scenarios[scenario].revenueMultiplier;
    
    Object.values(this.cashFlowData.revenueProjections).forEach(jobProjections => {
      jobProjections.forEach(projection => {
        if (projection.status === 'projected' || projection.status === 'billed') {
          const paymentDate = new Date(projection.expectedPaymentDate);
          if (paymentDate >= startDate && paymentDate <= endDate) {
            totalRevenue += projection.amount * multiplier;
          }
        } else if (projection.status === 'received' && projection.actualPaymentDate) {
          const paymentDate = new Date(projection.actualPaymentDate);
          if (paymentDate >= startDate && paymentDate <= endDate) {
            totalRevenue += projection.actualAmount || projection.amount;
          }
        }
      });
    });
    
    return totalRevenue;
  }

  calculateWeeklyExpenses(startDate, endDate, scenario) {
    let totalExpenses = 0;
    const multiplier = this.cashFlowData.scenarios[scenario].expenseMultiplier;
    
    // Projected expenses
    Object.values(this.cashFlowData.expenseProjections).forEach(categoryProjections => {
      categoryProjections.forEach(projection => {
        if (projection.status === 'projected') {
          const dueDate = new Date(projection.dueDate);
          if (dueDate >= startDate && dueDate <= endDate) {
            totalExpenses += projection.amount * multiplier;
          }
        } else if (projection.status === 'paid' && projection.actualPaymentDate) {
          const paymentDate = new Date(projection.actualPaymentDate);
          if (paymentDate >= startDate && paymentDate <= endDate) {
            totalExpenses += projection.actualAmount || projection.amount;
          }
        }
      });
    });
    
    // Recurring expenses
    Object.entries(this.cashFlowData.recurringExpenses).forEach(([category, expense]) => {
      if (expense.weekly) {
        totalExpenses += expense.weekly * multiplier;
      } else if (expense.monthly) {
        const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        
        if (startDate <= monthEnd && endDate >= monthStart) {
          const dueDate = new Date(startDate.getFullYear(), startDate.getMonth(), expense.dueDay);
          if (dueDate >= startDate && dueDate <= endDate) {
            totalExpenses += expense.monthly * multiplier;
          }
        }
      }
    });
    
    return totalExpenses;
  }

  getWeeksBetween(startDate, endDate) {
    const weeks = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    while (current <= end) {
      weeks.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    
    return weeks;
  }

  // Funding Gap Analysis
  identifyFundingGaps(cashFlowProjection) {
    const gaps = [];
    let currentGap = null;
    
    cashFlowProjection.forEach((week, index) => {
      if (week.fundingNeeded > 0) {
        if (!currentGap) {
          currentGap = {
            startWeek: week.weekStart,
            maxFundingNeeded: week.fundingNeeded,
            weeks: []
          };
        }
        currentGap.weeks.push(week);
        currentGap.maxFundingNeeded = Math.max(currentGap.maxFundingNeeded, week.fundingNeeded);
      } else if (currentGap) {
        currentGap.endWeek = cashFlowProjection[index - 1].weekStart;
        gaps.push(currentGap);
        currentGap = null;
      }
    });
    
    if (currentGap) {
      currentGap.endWeek = cashFlowProjection[cashFlowProjection.length - 1].weekStart;
      gaps.push(currentGap);
    }
    
    return gaps;
  }

  // Scenario Analysis
  generateScenarioComparison(startDate, endDate) {
    const scenarios = ['optimistic', 'realistic', 'pessimistic'];
    const results = {};
    
    scenarios.forEach(scenario => {
      const cashFlow = this.calculateCashFlowProjection(startDate, endDate, scenario);
      const totalRevenue = cashFlow.reduce((sum, week) => sum + week.revenue, 0);
      const totalExpenses = cashFlow.reduce((sum, week) => sum + week.expenses, 0);
      const netCashFlow = totalRevenue - totalExpenses;
      const fundingGaps = this.identifyFundingGaps(cashFlow);
      
      results[scenario] = {
        totalRevenue,
        totalExpenses,
        netCashFlow,
        fundingGaps,
        finalBalance: cashFlow[cashFlow.length - 1]?.runningBalance || this.cashFlowData.currentBalance
      };
    });
    
    return results;
  }

  // Data Export/Import
  exportCashFlowData() {
    return this.cashFlowData;
  }

  importCashFlowData(data) {
    this.cashFlowData = { ...this.cashFlowData, ...data };
    this.saveCashFlowData();
  }

  // Utility Methods
  getRevenueProjections() {
    return this.cashFlowData.revenueProjections;
  }

  getExpenseProjections() {
    return this.cashFlowData.expenseProjections;
  }

  getRecurringExpenses() {
    return this.cashFlowData.recurringExpenses;
  }

  getPaymentTerms() {
    return this.cashFlowData.paymentTerms;
  }

  updatePaymentTerms(terms) {
    this.cashFlowData.paymentTerms = { ...this.cashFlowData.paymentTerms, ...terms };
    this.saveCashFlowData();
  }

  updateCurrentBalance(balance) {
    this.cashFlowData.currentBalance = parseFloat(balance);
    this.saveCashFlowData();
  }
}

export default new CashFlowService();
