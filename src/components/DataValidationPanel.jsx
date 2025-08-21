import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Target,
  AlertCircle,
  FileText,
  Users,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/components/ui/use-toast';
import dataValidationService from '@/services/dataValidationService';

const DataValidationPanel = ({ jobs, employees, onJobClick }) => {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    criticalIssues: true,
    insights: true,
    recommendations: false
  });
  const [selectedFilter, setSelectedFilter] = useState(null);

  // Run validation analysis
  const validationResults = useMemo(() => {
    const jobValidation = dataValidationService.validateAllJobs(jobs);
    const employeeValidation = dataValidationService.validateAllEmployees(employees);
    const insights = dataValidationService.getValidationInsights(jobValidation);
    const recommendations = dataValidationService.getImprovementRecommendations(jobValidation);

    return {
      jobs: jobValidation,
      employees: employeeValidation,
      insights,
      recommendations
    };
  }, [jobs, employees]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <XCircle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getCompletenessColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompletenessLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  const handleJobClick = (jobId) => {
    if (onJobClick) {
      onJobClick(jobId);
    }
  };

  const handleSummaryCardClick = (filterType) => {
    setSelectedFilter(selectedFilter === filterType ? null : filterType);
  };

  const getFilteredJobs = () => {
    if (!selectedFilter) return validationResults.jobs.validations;
    
    switch (selectedFilter) {
      case 'critical':
        return validationResults.jobs.validations.filter(v => v.hasCriticalIssues);
      case 'warnings':
        return validationResults.jobs.validations.filter(v => v.hasWarnings);
      case 'excellent':
        return validationResults.jobs.validations.filter(v => v.completenessScore >= 90);
      case 'completeness':
        return validationResults.jobs.validations.sort((a, b) => a.completenessScore - b.completenessScore);
      default:
        return validationResults.jobs.validations;
    }
  };

  const exportValidationReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: validationResults.jobs.summary,
      insights: validationResults.insights,
      recommendations: validationResults.recommendations,
      jobDetails: validationResults.jobs.validations.map(v => ({
        jobId: v.jobId,
        jobName: v.jobName,
        completenessScore: v.completenessScore,
        issues: v.issues.length,
        warnings: v.warnings.length,
        suggestions: v.suggestions.length
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-validation-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Validation Report Exported! 📊",
      description: "Your data validation report has been downloaded."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-orange-800">Data Quality Validation</CardTitle>
                <p className="text-orange-600 text-sm">Real-time data completeness and quality analysis</p>
              </div>
            </div>
            <Button
              onClick={exportValidationReport}
              variant="outline"
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Section */}
      <Collapsible open={expandedSections.summary} onOpenChange={() => toggleSection('summary')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Data Quality Summary</span>
                </CardTitle>
                {expandedSections.summary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
                             {/* Overall Score */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div 
                   className={`text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedFilter === 'completeness' ? 'ring-2 ring-blue-300' : ''}`}
                   onClick={() => handleSummaryCardClick('completeness')}
                 >
                   <div className="text-2xl font-bold text-blue-600">
                     {validationResults.jobs.summary.averageCompletenessScore.toFixed(1)}%
                   </div>
                   <div className="text-sm text-blue-600">Average Completeness</div>
                   <div className={`text-xs font-medium ${getCompletenessColor(validationResults.jobs.summary.averageCompletenessScore)}`}>
                     {getCompletenessLabel(validationResults.jobs.summary.averageCompletenessScore)}
                   </div>
                   <div className="text-xs text-blue-500 mt-1">Click to view all jobs</div>
                 </div>

                 <div 
                   className={`text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedFilter === 'critical' ? 'ring-2 ring-red-300' : ''}`}
                   onClick={() => handleSummaryCardClick('critical')}
                 >
                   <div className="text-2xl font-bold text-red-600">
                     {validationResults.jobs.summary.criticalIssuesCount}
                   </div>
                   <div className="text-sm text-red-600">Critical Issues</div>
                   <div className="text-xs text-red-500">
                     {validationResults.jobs.summary.jobsWithIssues} jobs affected
                   </div>
                   <div className="text-xs text-red-500 mt-1">Click to view affected jobs</div>
                 </div>

                 <div 
                   className={`text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedFilter === 'warnings' ? 'ring-2 ring-yellow-300' : ''}`}
                   onClick={() => handleSummaryCardClick('warnings')}
                 >
                   <div className="text-2xl font-bold text-yellow-600">
                     {validationResults.jobs.summary.jobsWithWarnings}
                   </div>
                   <div className="text-sm text-yellow-600">Jobs with Warnings</div>
                   <div className="text-xs text-yellow-500">
                     {((validationResults.jobs.summary.jobsWithWarnings / validationResults.jobs.summary.totalJobs) * 100).toFixed(1)}% of total
                   </div>
                   <div className="text-xs text-yellow-500 mt-1">Click to view affected jobs</div>
                 </div>

                 <div 
                   className={`text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedFilter === 'excellent' ? 'ring-2 ring-green-300' : ''}`}
                   onClick={() => handleSummaryCardClick('excellent')}
                 >
                   <div className="text-2xl font-bold text-green-600">
                     {validationResults.jobs.summary.completenessDistribution.excellent}
                   </div>
                   <div className="text-sm text-green-600">Excellent Jobs</div>
                   <div className="text-xs text-green-500">
                     {((validationResults.jobs.summary.completenessDistribution.excellent / validationResults.jobs.summary.totalJobs) * 100).toFixed(1)}% of total
                   </div>
                   <div className="text-xs text-green-500 mt-1">Click to view excellent jobs</div>
                 </div>
               </div>

              {/* Completeness Distribution */}
              <div>
                <h4 className="font-semibold mb-3">Data Completeness Distribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Excellent (90%+)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(validationResults.jobs.summary.completenessDistribution.excellent / validationResults.jobs.summary.totalJobs) * 100} className="w-32" />
                      <span className="text-sm font-medium text-green-600">
                        {validationResults.jobs.summary.completenessDistribution.excellent}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Good (70-89%)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(validationResults.jobs.summary.completenessDistribution.good / validationResults.jobs.summary.totalJobs) * 100} className="w-32" />
                      <span className="text-sm font-medium text-blue-600">
                        {validationResults.jobs.summary.completenessDistribution.good}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fair (50-69%)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(validationResults.jobs.summary.completenessDistribution.fair / validationResults.jobs.summary.totalJobs) * 100} className="w-32" />
                      <span className="text-sm font-medium text-yellow-600">
                        {validationResults.jobs.summary.completenessDistribution.fair}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Poor (&lt;50%)</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={(validationResults.jobs.summary.completenessDistribution.poor / validationResults.jobs.summary.totalJobs) * 100} className="w-32" />
                      <span className="text-sm font-medium text-red-600">
                        {validationResults.jobs.summary.completenessDistribution.poor}
                      </span>
                    </div>
                  </div>
                                 </div>
               </div>

               {/* Filtered Jobs Section */}
               {selectedFilter && (
                 <div className="mt-6">
                   <div className="flex items-center justify-between mb-4">
                     <h4 className="font-semibold text-lg">
                       {selectedFilter === 'critical' && 'Jobs with Critical Issues'}
                       {selectedFilter === 'warnings' && 'Jobs with Warnings'}
                       {selectedFilter === 'excellent' && 'Excellent Jobs (90%+)'}
                       {selectedFilter === 'completeness' && 'All Jobs by Completeness'}
                     </h4>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => setSelectedFilter(null)}
                       className="text-gray-500 hover:text-gray-700"
                     >
                       Clear Filter
                     </Button>
                   </div>
                   
                   <div className="space-y-3">
                     {getFilteredJobs().map((validation) => (
                       <div 
                         key={validation.jobId} 
                         className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                           validation.hasCriticalIssues 
                             ? 'border-red-200 bg-red-50' 
                             : validation.hasWarnings 
                               ? 'border-yellow-200 bg-yellow-50'
                               : validation.completenessScore >= 90
                                 ? 'border-green-200 bg-green-50'
                                 : 'border-gray-200 bg-gray-50'
                         }`}
                         onClick={() => handleJobClick(validation.jobId)}
                       >
                         <div className="flex items-center justify-between">
                           <div className="flex-1">
                             <h5 className="font-medium text-gray-900">{validation.jobName}</h5>
                             <div className="flex items-center space-x-4 mt-1">
                               <span className={`text-sm font-medium ${
                                 validation.completenessScore >= 90 ? 'text-green-600' :
                                 validation.completenessScore >= 70 ? 'text-blue-600' :
                                 validation.completenessScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                               }`}>
                                 {validation.completenessScore.toFixed(0)}% Complete
                               </span>
                               {validation.hasCriticalIssues && (
                                 <Badge variant="destructive" className="bg-red-100 text-red-800 text-xs">
                                   {validation.issues.length} Critical Issues
                                 </Badge>
                               )}
                               {validation.hasWarnings && !validation.hasCriticalIssues && (
                                 <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                                   {validation.warnings.length} Warnings
                                 </Badge>
                               )}
                               {validation.completenessScore >= 90 && (
                                 <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                   Excellent
                                 </Badge>
                               )}
                             </div>
                           </div>
                           <ExternalLink className="h-4 w-4 text-gray-400" />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </CardContent>
           </CollapsibleContent>
         </Card>
       </Collapsible>

      {/* Critical Issues Section */}
      <Collapsible open={expandedSections.criticalIssues} onOpenChange={() => toggleSection('criticalIssues')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Critical Issues ({validationResults.jobs.summary.criticalIssuesCount})</span>
                </CardTitle>
                {expandedSections.criticalIssues ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {validationResults.jobs.summary.criticalIssuesCount === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-600 font-medium">No critical issues found!</p>
                  <p className="text-gray-500 text-sm">All jobs have the essential data required for accurate analytics.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {validationResults.jobs.validations
                    .filter(v => v.hasCriticalIssues)
                    .map(validation => (
                      <div key={validation.jobId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-red-800">{validation.jobName}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              {validation.issues.length} Critical Issues
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleJobClick(validation.jobId)}
                              className="text-red-600 hover:bg-red-100"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {validation.issues.map((issue, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-red-800">{issue.message}</p>
                                {issue.impact && (
                                  <p className="text-xs text-red-600">Impact: {issue.impact}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Insights Section */}
      <Collapsible open={expandedSections.insights} onOpenChange={() => toggleSection('insights')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Data Quality Insights</span>
                </CardTitle>
                {expandedSections.insights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {validationResults.insights.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-600 font-medium">No insights to report!</p>
                  <p className="text-gray-500 text-sm">Your data quality is excellent.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {validationResults.insights.map((insight, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(insight.severity)}`}>
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(insight.severity)}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{insight.message}</h4>
                          {insight.recommendation && (
                            <p className="text-sm mb-2">{insight.recommendation}</p>
                          )}
                          {insight.impact && (
                            <p className="text-xs opacity-75">Impact: {insight.impact}</p>
                          )}
                          {insight.details && (
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">Common issues:</p>
                              <div className="space-y-1">
                                {insight.details.map((detail, idx) => (
                                  <div key={idx} className="text-xs">
                                    {detail.field}: {detail.count} occurrences
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Recommendations Section */}
      <Collapsible open={expandedSections.recommendations} onOpenChange={() => toggleSection('recommendations')}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  <span>Improvement Recommendations</span>
                </CardTitle>
                {expandedSections.recommendations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {validationResults.recommendations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-600 font-medium">No recommendations needed!</p>
                  <p className="text-gray-500 text-sm">Your data quality processes are working well.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {validationResults.recommendations.map((rec, index) => (
                    <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-green-800">{rec.title}</h4>
                          <p className="text-sm text-green-600">{rec.description}</p>
                        </div>
                        <Badge 
                          variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                          className={rec.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                        >
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-green-700 mb-2">Recommended Actions:</p>
                        <ul className="space-y-1">
                          {rec.actions.map((action, idx) => (
                            <li key={idx} className="text-xs text-green-600 flex items-center space-x-2">
                              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};

export default DataValidationPanel; 