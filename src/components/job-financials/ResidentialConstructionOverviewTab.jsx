import React, { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calculator, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ResidentialConstructionOverviewTab = ({ job, onUpdateJob }) => {
  // Calculate estimate totals
  const estimateCalculations = useMemo(() => {
    const estimate = job?.financials?.residentialConstruction || {};
    const phases = estimate.phases || {};
    
    let totalEstimate = 0;
    const phaseTotals = {};
    
    Object.keys(phases).forEach(phaseKey => {
      const phase = phases[phaseKey];
      let phaseTotal = 0;
      
      Object.keys(phase.items || {}).forEach(itemKey => {
        const item = phase.items[itemKey];
        if (item.contractor.type === 'subcontractor') {
          phaseTotal += parseFloat(item.contractor.quoteAmount) || 0;
        } else {
          const laborTotal = (item.labor.quantity || 0) * (item.labor.ratePerUnit || 0) * (1 + (item.labor.waste || 0) / 100);
          const materialTotal = (item.material.quantity || 0) * (item.material.ratePerUnit || 0) * (1 + (item.material.waste || 0) / 100);
          phaseTotal += laborTotal + materialTotal;
        }
      });
      
      phaseTotals[phaseKey] = phaseTotal;
      totalEstimate += phaseTotal;
    });
    
    return {
      totalEstimate,
      phaseTotals
    };
  }, [job?.financials?.residentialConstruction]);

  // Calculate actual totals
  const actualCalculations = useMemo(() => {
    const actual = job?.financials?.actual || {};
    const phases = actual.phases || {};
    
    let totalActual = 0;
    const phaseTotals = {};
    
    Object.keys(phases).forEach(phaseKey => {
      const phase = phases[phaseKey];
      let phaseTotal = 0;
      
      Object.keys(phase.items || {}).forEach(itemKey => {
        const item = phase.items[itemKey];
        if (item.contractor.type === 'subcontractor') {
          phaseTotal += parseFloat(item.contractor.quoteAmount) || 0;
        } else {
          const laborTotal = (item.labor.quantity || 0) * (item.labor.ratePerUnit || 0) * (1 + (item.labor.waste || 0) / 100);
          const materialTotal = (item.material.quantity || 0) * (item.material.ratePerUnit || 0) * (1 + (item.material.waste || 0) / 100);
          phaseTotal += laborTotal + materialTotal;
        }
      });
      
      phaseTotals[phaseKey] = phaseTotal;
      totalActual += phaseTotal;
    });
    
    return {
      totalActual,
      phaseTotals
    };
  }, [job?.financials?.actual]);

  // Calculate variance
  const variance = useMemo(() => {
    const totalVariance = actualCalculations.totalActual - estimateCalculations.totalEstimate;
    const variancePercentage = estimateCalculations.totalEstimate > 0 
      ? (totalVariance / estimateCalculations.totalEstimate) * 100 
      : 0;
    
    const phaseVariances = {};
    Object.keys(estimateCalculations.phaseTotals).forEach(phaseKey => {
      const estimateTotal = estimateCalculations.phaseTotals[phaseKey] || 0;
      const actualTotal = actualCalculations.phaseTotals[phaseKey] || 0;
      const variance = actualTotal - estimateTotal;
      const variancePercentage = estimateTotal > 0 ? (variance / estimateTotal) * 100 : 0;
      
      phaseVariances[phaseKey] = {
        variance,
        variancePercentage,
        estimateTotal,
        actualTotal
      };
    });
    
    return {
      totalVariance,
      variancePercentage,
      phaseVariances
    };
  }, [estimateCalculations, actualCalculations]);

  // Trade category names
  const tradeCategoryNames = {
    sitework: 'Site Work',
    framing: 'Framing',
    electrical: 'Electrical',
    plumbing: 'Plumbing',
    hvac: 'HVAC',
    drywall: 'Drywall',
    flooring: 'Flooring',
    finish: 'Finish Work'
  };

  // Get variance color and icon
  const getVarianceDisplay = (variance, percentage) => {
    if (variance > 0) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: TrendingUp,
        label: 'Over Budget'
      };
    } else if (variance < 0) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: TrendingDown,
        label: 'Under Budget'
      };
    } else {
      return {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: CheckCircle,
        label: 'On Budget'
      };
    }
  };

  const totalVarianceDisplay = getVarianceDisplay(variance.totalVariance, variance.variancePercentage);
  const TotalVarianceIcon = totalVarianceDisplay.icon;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estimate Total */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span>Estimate Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${estimateCalculations.totalEstimate.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Original Estimate</p>
          </CardContent>
        </Card>

        {/* Actual Total */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Actual Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${actualCalculations.totalActual.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600 mt-1">Final Cost</p>
          </CardContent>
        </Card>

        {/* Variance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <TotalVarianceIcon className={`h-5 w-5 ${totalVarianceDisplay.color}`} />
              <span>Variance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${totalVarianceDisplay.color}`}>
              ${Math.abs(variance.totalVariance).toFixed(2)}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`${totalVarianceDisplay.bgColor} ${totalVarianceDisplay.color} border-0`}>
                {totalVarianceDisplay.label}
              </Badge>
              <span className="text-sm text-gray-600">
                ({variance.variancePercentage.toFixed(1)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phase-by-Phase Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Phase-by-Phase Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(tradeCategoryNames).map(phaseKey => {
              const phaseVariance = variance.phaseVariances[phaseKey];
              if (!phaseVariance) return null;
              
              const varianceDisplay = getVarianceDisplay(phaseVariance.variance, phaseVariance.variancePercentage);
              const VarianceIcon = varianceDisplay.icon;
              
              return (
                <div key={phaseKey} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">
                      {tradeCategoryNames[phaseKey]}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <VarianceIcon className={`h-4 w-4 ${varianceDisplay.color}`} />
                      <Badge className={`${varianceDisplay.bgColor} ${varianceDisplay.color} border-0`}>
                        {varianceDisplay.label}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-semibold text-blue-600">
                        ${phaseVariance.estimateTotal.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Estimate</div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-semibold text-green-600">
                        ${phaseVariance.actualTotal.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">Actual</div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className={`text-lg font-semibold ${varianceDisplay.color}`}>
                        ${Math.abs(phaseVariance.variance).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Variance ({phaseVariance.variancePercentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Project Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variance.totalVariance > 0 ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Over Budget</h4>
                </div>
                <p className="text-red-700 mt-2">
                  This project is ${Math.abs(variance.totalVariance).toFixed(2)} over the original estimate 
                  ({variance.variancePercentage.toFixed(1)}% over budget). Review the phase-by-phase breakdown 
                  above to identify areas where costs exceeded estimates.
                </p>
              </div>
            ) : variance.totalVariance < 0 ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Under Budget</h4>
                </div>
                <p className="text-green-700 mt-2">
                  Great job! This project came in ${Math.abs(variance.totalVariance).toFixed(2)} under the original estimate 
                  ({Math.abs(variance.variancePercentage).toFixed(1)}% under budget). This represents cost savings 
                  and efficient project management.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">On Budget</h4>
                </div>
                <p className="text-blue-700 mt-2">
                  Perfect! This project came in exactly on budget. The actual costs match the original estimate, 
                  demonstrating excellent project planning and cost control.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentialConstructionOverviewTab;
