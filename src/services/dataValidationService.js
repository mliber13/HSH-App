// Data Validation Service for Construction Management Analytics
class DataValidationService {
  constructor() {
    this.validationRules = {
      job: {
        required: ['jobName', 'jobType', 'createdAt'],
        financials: {
          estimate: ['sqft', 'drywallMaterialRate', 'hangerRate', 'finisherRate', 'prepCleanRate'],
          fieldRevised: ['sqft'],
          actual: ['laborCosts', 'manualLaborCosts', 'materialInvoices', 'changeOrders']
        }
      },
      employee: {
        required: ['name', 'id'],
        optional: ['phone', 'email', 'hourlyRate']
      }
    };
  }

  // Validate a single job's data completeness
  validateJob(job) {
    const issues = [];
    const warnings = [];
    const suggestions = [];

    // Basic job information validation
    if (!job.jobName || job.jobName.trim() === '') {
      issues.push({
        type: 'error',
        category: 'basic_info',
        field: 'jobName',
        message: 'Job name is required',
        priority: 'high'
      });
    }

    if (!job.jobType) {
      issues.push({
        type: 'error',
        category: 'basic_info',
        field: 'jobType',
        message: 'Job type must be specified',
        priority: 'high'
      });
    }

    if (!job.createdAt) {
      issues.push({
        type: 'warning',
        category: 'basic_info',
        field: 'createdAt',
        message: 'Job creation date is missing',
        priority: 'medium'
      });
    }

    // Financial data validation
    const financials = job.financials || {};
    
    // Estimate validation
    const estimate = financials.estimate || {};
    if (!estimate.sqft || estimate.sqft === 0) {
      issues.push({
        type: 'error',
        category: 'estimate',
        field: 'sqft',
        message: 'Square footage is required for accurate cost estimation',
        priority: 'high',
        impact: 'Cost calculations will be inaccurate'
      });
    }

    if (!estimate.totalEstimateAmount || estimate.totalEstimateAmount === 0) {
      warnings.push({
        type: 'warning',
        category: 'estimate',
        field: 'totalEstimateAmount',
        message: 'Total estimate amount is missing',
        priority: 'medium',
        impact: 'Revenue calculations may be incomplete'
      });
    }

    // Field revised validation
    const fieldRevised = financials.fieldRevised || {};
    if (!fieldRevised.sqft || fieldRevised.sqft === 0) {
      suggestions.push({
        type: 'suggestion',
        category: 'field_revised',
        field: 'sqft',
        message: 'Field takeoff square footage not recorded',
        priority: 'low',
        impact: 'Field revised calculations may use estimate values'
      });
    }

    // Actual costs validation
    const actual = financials.actual || {};
    const laborCosts = actual.laborCosts || [];
    const manualLaborCosts = actual.manualLaborCosts || [];
    const materialInvoices = actual.materialInvoices || [];
    const changeOrders = actual.changeOrders || [];

    // Check if any actual costs are recorded
    const hasAnyActualCosts = laborCosts.length > 0 || 
                             manualLaborCosts.length > 0 || 
                             materialInvoices.length > 0 || 
                             changeOrders.length > 0;

    if (!hasAnyActualCosts) {
      warnings.push({
        type: 'warning',
        category: 'actual_costs',
        field: 'all',
        message: 'No actual costs recorded for this job',
        priority: 'medium',
        impact: 'Profit calculations will be based on estimates only'
      });
    }

    // Specific cost category validation
    if (laborCosts.length === 0) {
      suggestions.push({
        type: 'suggestion',
        category: 'actual_costs',
        field: 'laborCosts',
        message: 'No labor costs recorded',
        priority: 'low',
        impact: 'Consider adding time clock entries or manual labor costs'
      });
    }

    if (materialInvoices.length === 0) {
      suggestions.push({
        type: 'suggestion',
        category: 'actual_costs',
        field: 'materialInvoices',
        message: 'No material invoices recorded',
        priority: 'low',
        impact: 'Material costs not included in actual calculations'
      });
    }

    // Data consistency checks
    if (estimate.sqft && fieldRevised.sqft && Math.abs(estimate.sqft - fieldRevised.sqft) / estimate.sqft > 0.1) {
      warnings.push({
        type: 'warning',
        category: 'data_consistency',
        field: 'sqft_variance',
        message: `Significant variance between estimate (${estimate.sqft}) and field revised (${fieldRevised.sqft}) square footage`,
        priority: 'medium',
        impact: 'This may indicate scope changes or measurement errors'
      });
    }

    // Calculate data completeness score
    const completenessScore = this.calculateCompletenessScore(job);

    return {
      jobId: job.id,
      jobName: job.jobName,
      issues,
      warnings,
      suggestions,
      completenessScore,
      hasCriticalIssues: issues.some(issue => issue.priority === 'high'),
      hasWarnings: warnings.length > 0,
      hasSuggestions: suggestions.length > 0,
      totalIssues: issues.length + warnings.length + suggestions.length
    };
  }

  // Calculate a completeness score for a job (0-100)
  calculateCompletenessScore(job) {
    let score = 0;
    const maxScore = 100;
    const financials = job.financials || {};

    // Basic job info (20 points)
    if (job.jobName && job.jobName.trim() !== '') score += 10;
    if (job.jobType) score += 5;
    if (job.createdAt) score += 5;

    // Estimate data (30 points)
    const estimate = financials.estimate || {};
    if (estimate.sqft && estimate.sqft > 0) score += 15;
    if (estimate.totalEstimateAmount && estimate.totalEstimateAmount > 0) score += 15;

    // Field revised data (20 points)
    const fieldRevised = financials.fieldRevised || {};
    if (fieldRevised.sqft && fieldRevised.sqft > 0) score += 20;

    // Actual costs (30 points)
    const actual = financials.actual || {};
    const hasLaborCosts = (actual.laborCosts && actual.laborCosts.length > 0) || 
                         (actual.manualLaborCosts && actual.manualLaborCosts.length > 0);
    const hasMaterialCosts = actual.materialInvoices && actual.materialInvoices.length > 0;
    const hasChangeOrders = actual.changeOrders && actual.changeOrders.length > 0;

    if (hasLaborCosts) score += 10;
    if (hasMaterialCosts) score += 10;
    if (hasChangeOrders) score += 10;

    return Math.min(score, maxScore);
  }

  // Validate all jobs and return summary
  validateAllJobs(jobs) {
    const validations = jobs.map(job => this.validateJob(job));
    
    const summary = {
      totalJobs: jobs.length,
      jobsWithIssues: validations.filter(v => v.issues.length > 0).length,
      jobsWithWarnings: validations.filter(v => v.warnings.length > 0).length,
      jobsWithSuggestions: validations.filter(v => v.suggestions.length > 0).length,
      averageCompletenessScore: validations.reduce((sum, v) => sum + v.completenessScore, 0) / jobs.length,
      criticalIssuesCount: validations.reduce((sum, v) => sum + v.issues.filter(issue => issue.priority === 'high').length, 0),
      totalIssuesCount: validations.reduce((sum, v) => sum + v.totalIssues, 0),
      completenessDistribution: {
        excellent: validations.filter(v => v.completenessScore >= 90).length,
        good: validations.filter(v => v.completenessScore >= 70 && v.completenessScore < 90).length,
        fair: validations.filter(v => v.completenessScore >= 50 && v.completenessScore < 70).length,
        poor: validations.filter(v => v.completenessScore < 50).length
      }
    };

    return {
      validations,
      summary
    };
  }

  // Get validation insights for analytics
  getValidationInsights(validationResults) {
    const insights = [];

    // Data quality insights
    if (validationResults.summary.averageCompletenessScore < 70) {
      insights.push({
        type: 'data_quality',
        severity: 'high',
        message: 'Overall data completeness is below recommended threshold',
        recommendation: 'Focus on completing missing job information and financial data',
        impact: 'Analytics accuracy may be compromised'
      });
    }

    if (validationResults.summary.criticalIssuesCount > 0) {
      insights.push({
        type: 'critical_issues',
        severity: 'high',
        message: `${validationResults.summary.criticalIssuesCount} critical data issues found`,
        recommendation: 'Address critical issues before relying on analytics for decision making',
        impact: 'Some calculations may be inaccurate or missing'
      });
    }

    // Common issues analysis
    const allIssues = validationResults.validations.flatMap(v => v.issues);
    const issueCounts = {};
    allIssues.forEach(issue => {
      const key = `${issue.category}.${issue.field}`;
      issueCounts[key] = (issueCounts[key] || 0) + 1;
    });

    const mostCommonIssues = Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (mostCommonIssues.length > 0) {
      insights.push({
        type: 'common_issues',
        severity: 'medium',
        message: 'Common data issues identified across multiple jobs',
        details: mostCommonIssues.map(([key, count]) => ({ field: key, count })),
        recommendation: 'Consider implementing data entry templates or validation rules'
      });
    }

    return insights;
  }

  // Generate improvement recommendations
  getImprovementRecommendations(validationResults) {
    const recommendations = [];

    // Data entry recommendations
    if (validationResults.summary.averageCompletenessScore < 80) {
      recommendations.push({
        category: 'data_entry',
        priority: 'high',
        title: 'Improve Data Entry Process',
        description: 'Implement mandatory fields and validation rules',
        actions: [
          'Add required field indicators in forms',
          'Implement real-time validation feedback',
          'Create data entry templates'
        ]
      });
    }

    // Training recommendations
    if (validationResults.summary.criticalIssuesCount > validationResults.summary.totalJobs * 0.3) {
      recommendations.push({
        category: 'training',
        priority: 'medium',
        title: 'User Training Needed',
        description: 'High number of critical issues suggests training opportunities',
        actions: [
          'Create data entry guidelines',
          'Provide training on financial data importance',
          'Set up regular data quality reviews'
        ]
      });
    }

    // Process recommendations
    if (validationResults.summary.jobsWithWarnings > validationResults.summary.totalJobs * 0.5) {
      recommendations.push({
        category: 'process',
        priority: 'medium',
        title: 'Review Data Collection Process',
        description: 'Many jobs have missing or incomplete data',
        actions: [
          'Audit current data collection workflow',
          'Identify bottlenecks in data entry',
          'Consider automated data collection where possible'
        ]
      });
    }

    return recommendations;
  }

  // Validate employee data
  validateEmployee(employee) {
    const issues = [];
    const warnings = [];

    if (!employee.name || employee.name.trim() === '') {
      issues.push({
        type: 'error',
        field: 'name',
        message: 'Employee name is required',
        priority: 'high'
      });
    }

    if (!employee.id) {
      issues.push({
        type: 'error',
        field: 'id',
        message: 'Employee ID is required',
        priority: 'high'
      });
    }

    if (!employee.hourlyRate || employee.hourlyRate <= 0) {
      warnings.push({
        type: 'warning',
        field: 'hourlyRate',
        message: 'Hourly rate not set',
        priority: 'medium',
        impact: 'Labor cost calculations may be inaccurate'
      });
    }

    return {
      employeeId: employee.id,
      employeeName: employee.name,
      issues,
      warnings,
      hasIssues: issues.length > 0,
      hasWarnings: warnings.length > 0
    };
  }

  // Validate all employees
  validateAllEmployees(employees) {
    const validations = employees.map(emp => this.validateEmployee(emp));
    
    return {
      validations,
      summary: {
        totalEmployees: employees.length,
        employeesWithIssues: validations.filter(v => v.hasIssues).length,
        employeesWithWarnings: validations.filter(v => v.hasWarnings).length,
        totalIssues: validations.reduce((sum, v) => sum + v.issues.length, 0),
        totalWarnings: validations.reduce((sum, v) => sum + v.warnings.length, 0)
      }
    };
  }
}

export default new DataValidationService(); 