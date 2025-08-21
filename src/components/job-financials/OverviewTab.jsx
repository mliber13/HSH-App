import React, { useMemo } from 'react';
import { DollarSign, Calculator, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OverviewTab = ({ job, onUpdateJob }) => {
  // Get actual stored data from Estimate tab
  const estimateCalculations = useMemo(() => {
    const estimate = job?.financials?.estimate || {};
    const sqft = estimate.sqft || 0;
    const drywallMaterialRate = estimate.drywallMaterialRate || 0;
    const hangerRate = estimate.hangerRate || 0;
    const finisherRate = estimate.finisherRate || 0;
    const prepCleanRate = estimate.prepCleanRate || 0;
    const drywallSalesTaxRate = estimate.drywallSalesTaxRate || 0;
    const totalEstimateAmount = estimate.totalEstimateAmount || 0;

    const materialCost = sqft * drywallMaterialRate;
    const hangerCost = sqft * hangerRate;
    const finisherCost = sqft * finisherRate;
    const prepCleanCost = sqft * prepCleanRate;
    const salesTax = materialCost * (drywallSalesTaxRate / 100);
    
    // Calculate labor costs with estimated tax rate (assuming 15% for payroll taxes, benefits, etc.)
    const estimatedTaxRate = 0.15; // 15% for payroll taxes, benefits, workers comp, etc.
    const hangerCostWithTax = hangerCost * (1 + estimatedTaxRate);
    const finisherCostWithTax = finisherCost * (1 + estimatedTaxRate);
    const prepCleanCostWithTax = prepCleanCost * (1 + estimatedTaxRate);
    const totalLaborCost = hangerCostWithTax + finisherCostWithTax + prepCleanCostWithTax;
    const totalMaterialCost = materialCost + salesTax;
    
    const calculatedTotalEstimate = materialCost + hangerCost + finisherCost + prepCleanCost + salesTax;
    const totalEstimate = totalEstimateAmount > 0 ? totalEstimateAmount : calculatedTotalEstimate;
    const totalCost = totalMaterialCost + totalLaborCost; // Use labor costs with tax included
    const profitAmount = totalEstimate - totalCost;
    const profitPercentage = totalCost > 0 ? (profitAmount / totalCost) * 100 : 0;

    return {
      materialCost,
      hangerCost,
      finisherCost,
      prepCleanCost,
      salesTax,
      totalLaborCost,
      totalMaterialCost,
      totalCost,
      totalEstimate,
      profitAmount,
      profitPercentage
    };
  }, [job?.financials?.estimate]);

  // Get actual stored data from Field Revised tab
  const fieldRevisedCalculations = useMemo(() => {
    const fieldRevised = job?.financials?.fieldRevised || {};
    const sqft = fieldRevised.sqft || 0;
    const drywallMaterialRate = fieldRevised.drywallMaterialRate || 0;
    const hangerRate = fieldRevised.hangerRate || 0;
    const finisherRate = fieldRevised.finisherRate || 0;
    const prepCleanRate = fieldRevised.prepCleanRate || 0;
    const drywallSalesTaxRate = fieldRevised.drywallSalesTaxRate || 0;
    const fieldChangeOrders = fieldRevised.fieldChangeOrders || [];

    const materialCost = sqft * drywallMaterialRate;
    const hangerCost = sqft * hangerRate;
    const finisherCost = sqft * finisherRate;
    const prepCleanCost = sqft * prepCleanRate;
    const salesTax = materialCost * (drywallSalesTaxRate / 100);
    
    // Calculate labor costs with estimated tax rate (assuming 15% for payroll taxes, benefits, etc.)
    const estimatedTaxRate = 0.15; // 15% for payroll taxes, benefits, workers comp, etc.
    const hangerCostWithTax = hangerCost * (1 + estimatedTaxRate);
    const finisherCostWithTax = finisherCost * (1 + estimatedTaxRate);
    const prepCleanCostWithTax = prepCleanCost * (1 + estimatedTaxRate);
    const totalLaborCost = hangerCostWithTax + finisherCostWithTax + prepCleanCostWithTax;
    const totalMaterialCost = materialCost + salesTax;
    
    const fieldChangeOrderTotal = fieldChangeOrders.reduce((sum, co) => sum + (co.totalValue || 0), 0);
    const totalFieldRevised = totalMaterialCost + totalLaborCost + fieldChangeOrderTotal; // Use labor costs with tax included

    return {
      materialCost,
      hangerCost,
      finisherCost,
      prepCleanCost,
      salesTax,
      totalLaborCost,
      totalMaterialCost,
      fieldChangeOrderTotal,
      totalFieldRevised,
      fieldChangeOrders
    };
  }, [job?.financials?.fieldRevised]);

  // Get actual stored data from Actual tab
  const actualCalculations = useMemo(() => {
    const actual = job?.financials?.actual || {};
    const totalMaterialCost = actual.totalMaterialCost || 0;
    const totalSalesTax = actual.totalSalesTax || 0;
    const totalLaborCost = actual.totalLaborCost || 0;
    const totalManualLaborCost = actual.totalManualLaborCost || 0;
    const totalChangeOrderValue = actual.totalChangeOrderValue || 0;
    const totalFieldChangeOrderValue = actual.totalFieldChangeOrderValue || 0;
    const totalActual = actual.totalActual || 0;

    return {
      totalMaterialCost,
      totalSalesTax,
      totalLaborCost,
      totalManualLaborCost,
      totalChangeOrderValue,
      totalFieldChangeOrderValue,
      totalActual
    };
  }, [job?.financials?.actual]);



  return (
    <div className="space-y-6">
      {/* Cost Breakdown Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Calculator className="h-5 w-5 mr-2" />
              Estimate Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-700">Material Cost:</span>
              <span className="font-semibold">${estimateCalculations.materialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Sales Tax:</span>
              <span className="font-semibold">${estimateCalculations.salesTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-blue-800">
                <span>Total Material Cost:</span>
                <span>${estimateCalculations.totalMaterialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Hanger Cost:</span>
              <span className="font-semibold">${estimateCalculations.hangerCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Finisher Cost:</span>
              <span className="font-semibold">${estimateCalculations.finisherCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Prep/Clean Cost:</span>
              <span className="font-semibold">${estimateCalculations.prepCleanCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-blue-800">
                <span>Total Labor Cost (w/ 15% tax):</span>
                <span>${estimateCalculations.totalLaborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-blue-800">
                <span>Total Cost:</span>
                <span>${estimateCalculations.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            {job?.jobType === 'residential' && estimateCalculations.totalEstimate > estimateCalculations.totalCost && (
              <>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Total Estimate:</span>
                    <span>${estimateCalculations.totalEstimate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Estimated Profit:</span>
                    <span>${estimateCalculations.profitAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Profit Margin:</span>
                    <span className="font-semibold">{estimateCalculations.profitPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-800">
              <FileText className="h-5 w-5 mr-2" />
              Field Revised Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-purple-700">Material Cost:</span>
              <span className="font-semibold">${fieldRevisedCalculations.materialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Sales Tax:</span>
              <span className="font-semibold">${fieldRevisedCalculations.salesTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-purple-800">
                <span>Total Material Cost:</span>
                <span>${fieldRevisedCalculations.totalMaterialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Hanger Cost:</span>
              <span className="font-semibold">${fieldRevisedCalculations.hangerCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Finisher Cost:</span>
              <span className="font-semibold">${fieldRevisedCalculations.finisherCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Prep/Clean Cost:</span>
              <span className="font-semibold">${fieldRevisedCalculations.prepCleanCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-purple-800">
                <span>Total Labor Cost (w/ 15% tax):</span>
                <span>${fieldRevisedCalculations.totalLaborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Field Change Orders:</span>
              <span className="font-semibold">${fieldRevisedCalculations.fieldChangeOrderTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-purple-800">
                <span>Total Field Revised:</span>
                <span>${fieldRevisedCalculations.totalFieldRevised.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            {job?.jobType === 'residential' && (
              <>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Total Billable Amount:</span>
                    <span>${(estimateCalculations.totalEstimate + fieldRevisedCalculations.fieldChangeOrderTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Estimated Profit:</span>
                    <span>${(estimateCalculations.totalEstimate + fieldRevisedCalculations.fieldChangeOrderTotal - fieldRevisedCalculations.totalFieldRevised).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Profit Margin:</span>
                    <span className="font-semibold">{fieldRevisedCalculations.totalFieldRevised > 0 ? (((estimateCalculations.totalEstimate + fieldRevisedCalculations.fieldChangeOrderTotal - fieldRevisedCalculations.totalFieldRevised) / fieldRevisedCalculations.totalFieldRevised) * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              </>
            )}

          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <DollarSign className="h-5 w-5 mr-2" />
              Actual Costs Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-orange-700">Material Cost:</span>
              <span className="font-semibold">${actualCalculations.totalMaterialCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-700">Sales Tax:</span>
              <span className="font-semibold">${actualCalculations.totalSalesTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-orange-800">
                <span>Total Material Cost:</span>
                <span>${(actualCalculations.totalMaterialCost + actualCalculations.totalSalesTax).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-700">Time Clock Labor:</span>
              <span className="font-semibold">${actualCalculations.totalLaborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-700">Manual Labor:</span>
              <span className="font-semibold">${actualCalculations.totalManualLaborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-semibold text-orange-800">
                <span>Total Labor Cost:</span>
                <span>${(actualCalculations.totalLaborCost + actualCalculations.totalManualLaborCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-700">Change Orders:</span>
              <span className="font-semibold">${(actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-orange-800">
                <span>Total Actual:</span>
                <span>${actualCalculations.totalActual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            {job?.jobType === 'residential' && (
              <>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Total Billable Amount:</span>
                    <span>${(estimateCalculations.totalEstimate + actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-green-600">
                    <span>Actual Profit:</span>
                    <span>${(estimateCalculations.totalEstimate + actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue - actualCalculations.totalActual).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Profit Margin:</span>
                    <span className="font-semibold">{actualCalculations.totalActual > 0 ? (((estimateCalculations.totalEstimate + actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue - actualCalculations.totalActual) / actualCalculations.totalActual) * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              </>
            )}

          </CardContent>
        </Card>
      </div>

      

      
    </div>
  );
};

export default OverviewTab;
