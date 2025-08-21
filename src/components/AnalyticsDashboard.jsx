import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Users, 
  Building2, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import DataValidationPanel from '@/components/DataValidationPanel';
import dataValidationService from '@/services/dataValidationService';

const AnalyticsDashboard = ({ jobs, employees }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [jobType, setJobType] = useState('all');
  const [sortBy, setSortBy] = useState('profit');
  const [dataQualityFilter, setDataQualityFilter] = useState('all');

  // Data validation results
  const validationResults = useMemo(() => {
    return dataValidationService.validateAllJobs(jobs);
  }, [jobs]);

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const filteredJobs = jobs.filter(job => {
      const matchesTimeRange = timeRange === 'all' || 
        (timeRange === 'this-month' && new Date(job.createdAt).getMonth() === new Date().getMonth()) ||
        (timeRange === 'this-quarter' && Math.floor(new Date(job.createdAt).getMonth() / 3) === Math.floor(new Date().getMonth() / 3)) ||
        (timeRange === 'this-year' && new Date(job.createdAt).getFullYear() === new Date().getFullYear());
      
      const matchesJobType = jobType === 'all' || job.jobType === jobType;
      
      // Data quality filtering
      const jobValidation = validationResults.validations.find(v => v.jobId === job.id);
      let matchesDataQuality = true;
      
      if (dataQualityFilter === 'excellent') {
        matchesDataQuality = jobValidation && jobValidation.completenessScore >= 90;
      } else if (dataQualityFilter === 'good') {
        matchesDataQuality = jobValidation && jobValidation.completenessScore >= 70;
      } else if (dataQualityFilter === 'issues') {
        matchesDataQuality = jobValidation && (jobValidation.hasCriticalIssues || jobValidation.hasWarnings);
      } else if (dataQualityFilter === 'critical') {
        matchesDataQuality = jobValidation && jobValidation.hasCriticalIssues;
      }
      
      return matchesTimeRange && matchesJobType && matchesDataQuality;
    });

    // Financial calculations
    const totalRevenue = filteredJobs.reduce((sum, job) => {
      const estimate = job.financials?.estimate?.totalEstimateAmount || 0;
      const fieldRevised = job.financials?.fieldRevised?.changeOrders?.reduce((sum, co) => sum + (co.totalValue || 0), 0) || 0;
      return sum + estimate + fieldRevised;
    }, 0);

    const totalCosts = filteredJobs.reduce((sum, job) => {
      const laborCosts = job.financials?.actual?.laborCosts?.reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0;
      const manualLaborCosts = job.financials?.actual?.manualLaborCosts?.reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0;
      const materialCosts = job.financials?.actual?.materialInvoices?.reduce((sum, inv) => sum + (inv.dollarAmount || 0) + (inv.salesTax || 0), 0) || 0;
      return sum + laborCosts + manualLaborCosts + materialCosts;
    }, 0);

    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Job performance metrics
    const jobPerformance = filteredJobs.map(job => {
      const estimate = job.financials?.estimate?.totalEstimateAmount || 0;
      const fieldRevised = job.financials?.fieldRevised?.changeOrders?.reduce((sum, co) => sum + (co.totalValue || 0), 0) || 0;
      const revenue = estimate + fieldRevised;
      
      const laborCosts = job.financials?.actual?.laborCosts?.reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0;
      const manualLaborCosts = job.financials?.actual?.manualLaborCosts?.reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0;
      const materialCosts = job.financials?.actual?.materialInvoices?.reduce((sum, inv) => sum + (inv.dollarAmount || 0) + (inv.salesTax || 0), 0) || 0;
      const totalCost = laborCosts + manualLaborCosts + materialCosts;
      
      const profit = revenue - totalCost;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      return {
        ...job,
        revenue,
        totalCost,
        profit,
        profitMargin,
        costVariance: estimate > 0 ? ((totalCost - estimate) / estimate) * 100 : 0
      };
    });

    // Sort jobs by selected criteria
    const sortedJobs = [...jobPerformance].sort((a, b) => {
      switch (sortBy) {
        case 'profit':
          return b.profit - a.profit;
        case 'profit-margin':
          return b.profitMargin - a.profitMargin;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'cost-variance':
          return Math.abs(b.costVariance) - Math.abs(a.costVariance);
        default:
          return b.profit - a.profit;
      }
    });

    // Employee productivity
    const employeeProductivity = employees.map(emp => {
      const employeeJobs = filteredJobs.filter(job => 
        job.financials?.actual?.laborCosts?.some(cost => cost.employeeId === emp.id) ||
        job.financials?.actual?.manualLaborCosts?.some(cost => cost.employeeId === emp.id)
      );
      
      const totalHours = employeeJobs.reduce((sum, job) => {
        const laborHours = job.financials?.actual?.laborCosts?.filter(cost => cost.employeeId === emp.id)
          .reduce((sum, cost) => sum + (cost.hours || 0), 0) || 0;
        const manualHours = job.financials?.actual?.manualLaborCosts?.filter(cost => cost.employeeId === emp.id)
          .reduce((sum, cost) => sum + (cost.hours || 0), 0) || 0;
        return sum + laborHours + manualHours;
      }, 0);
      
      const totalEarnings = employeeJobs.reduce((sum, job) => {
        const laborEarnings = job.financials?.actual?.laborCosts?.filter(cost => cost.employeeId === emp.id)
          .reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0;
        const manualEarnings = job.financials?.actual?.manualLaborCosts?.filter(cost => cost.employeeId === emp.id)
          .reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0;
        return sum + laborEarnings + manualEarnings;
      }, 0);
      
      return {
        ...emp,
        totalHours,
        totalEarnings,
        hourlyRate: totalHours > 0 ? totalEarnings / totalHours : 0,
        jobsWorked: employeeJobs.length
      };
    }).filter(emp => emp.totalHours > 0);

    // Material cost analysis
    const materialAnalysis = filteredJobs.reduce((analysis, job) => {
      const materialInvoices = job.financials?.actual?.materialInvoices || [];
      materialInvoices.forEach(invoice => {
        const costPerSqft = invoice.sqftDelivered > 0 ? invoice.dollarAmount / invoice.sqftDelivered : 0;
        analysis.totalMaterialCost += invoice.dollarAmount;
        analysis.totalSalesTax += invoice.salesTax || 0;
        analysis.totalSqft += invoice.sqftDelivered;
        analysis.averageCostPerSqft = analysis.totalSqft > 0 ? analysis.totalMaterialCost / analysis.totalSqft : 0;
      });
      return analysis;
    }, { totalMaterialCost: 0, totalSalesTax: 0, totalSqft: 0, averageCostPerSqft: 0 });

    // Performance trends
    const performanceTrends = {
      profitableJobs: jobPerformance.filter(job => job.profit > 0).length,
      breakEvenJobs: jobPerformance.filter(job => job.profit === 0).length,
      lossMakingJobs: jobPerformance.filter(job => job.profit < 0).length,
      averageProfitMargin: jobPerformance.length > 0 ? 
        jobPerformance.reduce((sum, job) => sum + job.profitMargin, 0) / jobPerformance.length : 0,
      averageCostVariance: jobPerformance.length > 0 ? 
        jobPerformance.reduce((sum, job) => sum + job.costVariance, 0) / jobPerformance.length : 0
    };

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      profitMargin,
      jobPerformance: sortedJobs,
      employeeProductivity,
      materialAnalysis,
      performanceTrends,
      totalJobs: filteredJobs.length
    };
  }, [jobs, employees, timeRange, jobType, sortBy, dataQualityFilter, validationResults]);

  const exportAnalytics = () => {
    // Create CSV data for export
    const csvData = analytics.jobPerformance.map(job => ({
      'Job Name': job.jobName,
      'Job Type': job.jobType,
      'Revenue': job.revenue.toFixed(2),
      'Total Cost': job.totalCost.toFixed(2),
      'Profit': job.profit.toFixed(2),
      'Profit Margin %': job.profitMargin.toFixed(2),
      'Cost Variance %': job.costVariance.toFixed(2)
    }));

    // Convert to CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${timeRange}-${jobType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Analytics Exported! 📊",
      description: "Your analytics data has been downloaded as a CSV file."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Analytics Dashboard</CardTitle>
                  <p className="text-white/80 mt-1">Comprehensive insights into your business performance</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Data Quality Indicator */}
                <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                  <div className={`w-3 h-3 rounded-full ${
                    validationResults.summary.criticalIssuesCount === 0 
                      ? 'bg-green-400' 
                      : validationResults.summary.averageCompletenessScore >= 70 
                        ? 'bg-yellow-400' 
                        : 'bg-red-400'
                  }`} />
                  <span className="text-white/90 text-sm font-medium">
                    {validationResults.summary.averageCompletenessScore.toFixed(0)}% Complete
                  </span>
                  {validationResults.summary.criticalIssuesCount > 0 && (
                    <Badge variant="destructive" className="bg-red-500 text-white text-xs">
                      {validationResults.summary.criticalIssuesCount} Critical
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={exportAnalytics}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Job Types</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profit">Sort by Profit</SelectItem>
                <SelectItem value="profit-margin">Sort by Profit Margin</SelectItem>
                <SelectItem value="revenue">Sort by Revenue</SelectItem>
                <SelectItem value="cost-variance">Sort by Cost Variance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dataQualityFilter} onValueChange={setDataQualityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data Quality</SelectItem>
                <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                <SelectItem value="good">Good (70%+)</SelectItem>
                <SelectItem value="issues">Has Issues</SelectItem>
                <SelectItem value="critical">Critical Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">${analytics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600">{analytics.totalJobs} jobs</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Costs</p>
                <p className="text-2xl font-bold text-blue-700">${analytics.totalCosts.toLocaleString()}</p>
                <p className="text-xs text-blue-600">All expenses</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${analytics.totalProfit >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Profit</p>
                <p className={`text-2xl font-bold ${analytics.totalProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  ${analytics.totalProfit.toLocaleString()}
                </p>
                <p className={`text-xs ${analytics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.profitMargin.toFixed(1)}% margin
                </p>
              </div>
              {analytics.totalProfit >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-purple-700">{analytics.performanceTrends.averageProfitMargin.toFixed(1)}%</p>
                <p className="text-xs text-purple-600">Per job</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800">Profitable Jobs</h3>
            <p className="text-3xl font-bold text-green-700">{analytics.performanceTrends.profitableJobs}</p>
            <p className="text-sm text-green-600">
              {analytics.totalJobs > 0 ? ((analytics.performanceTrends.profitableJobs / analytics.totalJobs) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-yellow-800">Break Even</h3>
            <p className="text-3xl font-bold text-yellow-700">{analytics.performanceTrends.breakEvenJobs}</p>
            <p className="text-sm text-yellow-600">
              {analytics.totalJobs > 0 ? ((analytics.performanceTrends.breakEvenJobs / analytics.totalJobs) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-800">Loss Making</h3>
            <p className="text-3xl font-bold text-red-700">{analytics.performanceTrends.lossMakingJobs}</p>
            <p className="text-sm text-red-600">
              {analytics.totalJobs > 0 ? ((analytics.performanceTrends.lossMakingJobs / analytics.totalJobs) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="jobs">Job Performance</TabsTrigger>
          <TabsTrigger value="employees">Employee Analytics</TabsTrigger>
          <TabsTrigger value="materials">Material Analysis</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="charts">Visual Charts</TabsTrigger>
          <TabsTrigger value="validation">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Job Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Costs</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                    <TableHead className="text-right">Variance %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.jobPerformance.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.jobName}</TableCell>
                      <TableCell>
                        <Badge variant={job.jobType === 'residential' ? 'default' : 'secondary'}>
                          {job.jobType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">${job.revenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${job.totalCost.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-medium ${job.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${job.profit.toLocaleString()}
                      </TableCell>
                      <TableCell className={`text-right ${job.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {job.profitMargin.toFixed(1)}%
                      </TableCell>
                      <TableCell className={`text-right ${Math.abs(job.costVariance) <= 10 ? 'text-green-600' : job.costVariance > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {job.costVariance.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge 
                            variant={job.profit > 0 ? 'default' : job.profit === 0 ? 'secondary' : 'destructive'}
                            className={job.profit > 0 ? 'bg-green-100 text-green-800' : job.profit === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                          >
                            {job.profit > 0 ? 'Profitable' : job.profit === 0 ? 'Break Even' : 'Loss'}
                          </Badge>
                          {/* Data Quality Indicator */}
                          {(() => {
                            const jobValidation = validationResults.validations.find(v => v.jobId === job.id);
                            if (jobValidation && jobValidation.hasCriticalIssues) {
                              return (
                                <Badge variant="destructive" className="bg-red-100 text-red-800 text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Data Issues
                                </Badge>
                              );
                            } else if (jobValidation && jobValidation.completenessScore < 70) {
                              return (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                  <Info className="h-3 w-3 mr-1" />
                                  Incomplete
                                </Badge>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Employee Productivity Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Total Hours</TableHead>
                    <TableHead className="text-right">Total Earnings</TableHead>
                    <TableHead className="text-right">Hourly Rate</TableHead>
                    <TableHead className="text-right">Jobs Worked</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.employeeProductivity.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell className="text-right">{emp.totalHours.toFixed(1)}h</TableCell>
                      <TableCell className="text-right">${emp.totalEarnings.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${emp.hourlyRate.toFixed(2)}/hr</TableCell>
                      <TableCell className="text-right">{emp.jobsWorked}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={emp.hourlyRate > 25 ? 'default' : emp.hourlyRate > 20 ? 'secondary' : 'destructive'}
                          className={emp.hourlyRate > 25 ? 'bg-green-100 text-green-800' : emp.hourlyRate > 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}
                        >
                          {emp.hourlyRate > 25 ? 'High' : emp.hourlyRate > 20 ? 'Medium' : 'Low'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <Package className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-blue-800">Total Material Cost</h3>
                <p className="text-3xl font-bold text-blue-700">${analytics.materialAnalysis.totalMaterialCost.toLocaleString()}</p>
                <p className="text-sm text-blue-600">All materials purchased</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <Activity className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-800">Total SqFt Delivered</h3>
                <p className="text-3xl font-bold text-green-700">{analytics.materialAnalysis.totalSqft.toLocaleString()}</p>
                <p className="text-sm text-green-600">Square footage delivered</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-purple-800">Avg Cost per SqFt</h3>
                <p className="text-3xl font-bold text-purple-700">${analytics.materialAnalysis.averageCostPerSqft.toFixed(2)}</p>
                <p className="text-sm text-purple-600">Average material cost</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-purple-600" />
                Material Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium">Material Costs</span>
                  <span className="font-bold text-blue-600">${analytics.materialAnalysis.totalMaterialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-medium">Sales Tax</span>
                  <span className="font-bold text-green-600">${analytics.materialAnalysis.totalSalesTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="font-medium">Total Material Expenses</span>
                  <span className="font-bold text-purple-600">
                    ${(analytics.materialAnalysis.totalMaterialCost + analytics.materialAnalysis.totalSalesTax).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Profitability Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Profit Margin</span>
                    <span className={`font-bold ${analytics.performanceTrends.averageProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.performanceTrends.averageProfitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Cost Variance</span>
                    <span className={`font-bold ${Math.abs(analytics.performanceTrends.averageCostVariance) <= 10 ? 'text-green-600' : analytics.performanceTrends.averageCostVariance > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {analytics.performanceTrends.averageCostVariance.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Profitable Jobs Ratio</span>
                    <span className="font-bold text-green-600">
                      {analytics.totalJobs > 0 ? ((analytics.performanceTrends.profitableJobs / analytics.totalJobs) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-600" />
                  Efficiency Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Jobs Analyzed</span>
                    <span className="font-bold text-blue-600">{analytics.totalJobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Revenue per Job</span>
                    <span className="font-bold text-blue-600">
                      ${analytics.totalJobs > 0 ? (analytics.totalRevenue / analytics.totalJobs).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Cost per Job</span>
                    <span className="font-bold text-blue-600">
                      ${analytics.totalJobs > 0 ? (analytics.totalCosts / analytics.totalJobs).toLocaleString() : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

                 <TabsContent value="charts" className="space-y-6">
           <AnalyticsCharts analytics={analytics} />
         </TabsContent>

         <TabsContent value="validation" className="space-y-6">
           <DataValidationPanel 
             jobs={jobs} 
             employees={employees}
             onJobClick={(jobId) => {
               // This would navigate to the job details
               console.log('Navigate to job:', jobId);
             }}
           />
         </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard; 