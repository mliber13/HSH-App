import React, { useState } from 'react';
import { Calculator, Send, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useJobEstimate } from '@/hooks/useJobEstimate';
import QuoteModal from './QuoteModal';

const EstimateTab = ({ job, onUpdateJob }) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  
  const {
    estimateSqft,
    setEstimateSqft,
    drywallMaterialRate,
    setDrywallMaterialRate,
    hangerRate,
    setHangerRate,
    finisherRate,
    setFinisherRate,
    prepCleanRate,
    setPrepCleanRate,
    drywallSalesTaxRate,
    setDrywallSalesTaxRate,
    totalEstimateAmount,
    setTotalEstimateAmount,
    handleInputChange,
    calculations: estimateCalculations
  } = useJobEstimate(job, onUpdateJob);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-brandSecondary" />
              Estimate Financials
            </div>
            <Button
              onClick={() => setShowQuoteModal(true)}
              className="bg-brandPrimary hover:bg-brandPrimary/90 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Quote
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Square Footage</Label>
              <Input
                type="number"
                value={estimateSqft}
                onChange={(e) => handleInputChange('sqft', e.target.value, setEstimateSqft)}
                placeholder="Enter square footage"
                className="border-2 focus:border-brandSecondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Drywall Material Rate ($/sqft)</Label>
              <Input
                type="number"
                step="0.01"
                value={drywallMaterialRate}
                onChange={(e) => handleInputChange('drywallMaterialRate', e.target.value, setDrywallMaterialRate)}
                placeholder="0.66"
                className="border-2 focus:border-brandSecondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Hanger Rate ($/sqft)</Label>
              <Input
                type="number"
                step="0.01"
                value={hangerRate}
                onChange={(e) => handleInputChange('hangerRate', e.target.value, setHangerRate)}
                placeholder="0.27"
                className="border-2 focus:border-brandSecondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Finisher Rate ($/sqft)</Label>
              <Input
                type="number"
                step="0.01"
                value={finisherRate}
                onChange={(e) => handleInputChange('finisherRate', e.target.value, setFinisherRate)}
                placeholder="0.27"
                className="border-2 focus:border-brandSecondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Prep/Clean Rate ($/sqft)</Label>
              <Input
                type="number"
                step="0.01"
                value={prepCleanRate}
                onChange={(e) => handleInputChange('prepCleanRate', e.target.value, setPrepCleanRate)}
                placeholder="0.03"
                className="border-2 focus:border-brandSecondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Sales Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={drywallSalesTaxRate}
                onChange={(e) => handleInputChange('drywallSalesTaxRate', e.target.value, setDrywallSalesTaxRate)}
                placeholder="7.25"
                className="border-2 focus:border-brandSecondary"
              />
            </div>
            {job?.jobType === 'residential' && (
              <div className="space-y-2">
                <Label>Total Estimate Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={totalEstimateAmount}
                  onChange={(e) => handleInputChange('totalEstimateAmount', e.target.value, setTotalEstimateAmount)}
                  placeholder="Enter total estimate amount"
                  className="border-2 focus:border-brandSecondary"
                />
                <p className="text-xs text-gray-500">
                  Enter the total amount you're charging the customer (optional)
                </p>
              </div>
            )}
          </div>

          <Card className="border-2 border-brandSecondary/20 bg-brandSecondary/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-brandSecondary mb-4">Estimate Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Material Cost:</span>
                  <span className="font-semibold">${estimateCalculations.materialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hanger Cost:</span>
                  <span className="font-semibold">${estimateCalculations.hangerCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Finisher Cost:</span>
                  <span className="font-semibold">${estimateCalculations.finisherCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prep/Clean Cost:</span>
                  <span className="font-semibold">${estimateCalculations.prepCleanCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax:</span>
                  <span className="font-semibold">${estimateCalculations.salesTax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-brandSecondary">
                    <span>Total Cost:</span>
                    <span>${estimateCalculations.totalCost.toFixed(2)}</span>
                  </div>
                </div>
                {job?.jobType === 'residential' && parseFloat(totalEstimateAmount) > 0 && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-green-600">
                        <span>Total Estimate (Charged):</span>
                        <span>${estimateCalculations.totalEstimate.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-blue-600">
                        <span>Estimated Profit:</span>
                        <span>${estimateCalculations.profitAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Profit Percentage:</span>
                        <span className="font-semibold">{estimateCalculations.profitPercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {showQuoteModal && (
        <QuoteModal
          job={job}
          estimateCalculations={estimateCalculations}
          onClose={() => setShowQuoteModal(false)}
        />
      )}
    </>
  );
};

export default EstimateTab;
