import React, { useState, useEffect } from 'react';
import { FileText, Edit3, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const FieldRevisedTab = ({ job, onUpdateJob }) => {
  const [showFieldChangeOrderModal, setShowFieldChangeOrderModal] = useState(false);
  const [editingFieldChangeOrder, setEditingFieldChangeOrder] = useState(null);

  // Field revised state
  const [fieldSqft, setFieldSqft] = useState(job?.financials?.fieldRevised?.sqft?.toString() || '0');
  const [fieldHangerRate, setFieldHangerRate] = useState(job?.financials?.fieldRevised?.hangerRate?.toString() || '0.27');
  const [fieldFinisherRate, setFieldFinisherRate] = useState(job?.financials?.fieldRevised?.finisherRate?.toString() || '0.27');
  const [fieldPrepCleanRate, setFieldPrepCleanRate] = useState(job?.financials?.fieldRevised?.prepCleanRate?.toString() || '0.03');
  const [fieldDrywallMaterialRate, setFieldDrywallMaterialRate] = useState(job?.financials?.fieldRevised?.drywallMaterialRate?.toString() || '0.66');
  const [fieldDrywallSalesTaxRate, setFieldDrywallSalesTaxRate] = useState(job?.financials?.fieldRevised?.drywallSalesTaxRate?.toString() || '7.25');

  // Calculate field revised totals
  const fieldRevisedCalculations = {
    sqft: parseFloat(fieldSqft) || 0,
    hangerRate: parseFloat(fieldHangerRate) || 0,
    finisherRate: parseFloat(fieldFinisherRate) || 0,
    prepCleanRate: parseFloat(fieldPrepCleanRate) || 0,
    drywallMaterialRate: parseFloat(fieldDrywallMaterialRate) || 0,
    drywallSalesTaxRate: parseFloat(fieldDrywallSalesTaxRate) || 0,
    materialCost: (parseFloat(fieldSqft) || 0) * (parseFloat(fieldDrywallMaterialRate) || 0),
    hangerCost: (parseFloat(fieldSqft) || 0) * (parseFloat(fieldHangerRate) || 0),
    finisherCost: (parseFloat(fieldSqft) || 0) * (parseFloat(fieldFinisherRate) || 0),
    prepCleanCost: (parseFloat(fieldSqft) || 0) * (parseFloat(fieldPrepCleanRate) || 0),
    salesTax: ((parseFloat(fieldSqft) || 0) * (parseFloat(fieldDrywallMaterialRate) || 0)) * ((parseFloat(fieldDrywallSalesTaxRate) || 0) / 100),
    totalCost: 0,
    totalFieldRevised: 0,
    originalEstimateAmount: job?.financials?.estimate?.totalEstimateAmount || 0,
    fieldChangeOrderTotal: job?.financials?.fieldRevised?.fieldChangeOrderTotal || 0,
    fieldChangeOrders: job?.financials?.fieldRevised?.fieldChangeOrders || []
  };

  // Calculate labor costs with estimated tax rate (15% for payroll taxes, benefits, etc.)
  const estimatedTaxRate = 0.15;
  const hangerCostWithTax = fieldRevisedCalculations.hangerCost * (1 + estimatedTaxRate);
  const finisherCostWithTax = fieldRevisedCalculations.finisherCost * (1 + estimatedTaxRate);
  const prepCleanCostWithTax = fieldRevisedCalculations.prepCleanCost * (1 + estimatedTaxRate);
  const totalLaborCost = hangerCostWithTax + finisherCostWithTax + prepCleanCostWithTax;
  const totalMaterialCost = fieldRevisedCalculations.materialCost + fieldRevisedCalculations.salesTax;
  
  fieldRevisedCalculations.totalCost = totalMaterialCost + totalLaborCost; // Use labor costs with tax included
  fieldRevisedCalculations.totalFieldRevised = fieldRevisedCalculations.originalEstimateAmount + fieldRevisedCalculations.fieldChangeOrderTotal;
  
  // Calculate profit for field revised
  const fieldRevisedProfitAmount = fieldRevisedCalculations.totalFieldRevised - fieldRevisedCalculations.totalCost;
  const fieldRevisedProfitPercentage = fieldRevisedCalculations.totalCost > 0 ? (fieldRevisedProfitAmount / fieldRevisedCalculations.totalCost) * 100 : 0;

  const handleEditFieldChangeOrder = (changeOrder) => {
    setEditingFieldChangeOrder(changeOrder);
    setShowFieldChangeOrderModal(true);
  };

  const handleDeleteFieldChangeOrder = (changeOrderId) => {
    const existingFieldChangeOrders = job?.financials?.fieldRevised?.fieldChangeOrders || [];
    const updatedFieldChangeOrders = existingFieldChangeOrders.filter(co => co.id !== changeOrderId);
    const totalFieldChangeOrderValue = updatedFieldChangeOrders.reduce((sum, co) => sum + co.totalValue, 0);

    onUpdateJob(job.id, {
      financials: {
        ...job.financials,
        fieldRevised: {
          ...job.financials?.fieldRevised,
          fieldChangeOrders: updatedFieldChangeOrders,
          fieldChangeOrderTotal: totalFieldChangeOrderValue,
          totalFieldRevised: fieldRevisedCalculations.originalEstimateAmount + totalFieldChangeOrderValue
        }
      }
    });
  };

  // Function to save field revised rates
  const saveFieldRevisedRates = () => {
    onUpdateJob(job.id, {
      financials: {
        ...job.financials,
        fieldRevised: {
          ...job.financials?.fieldRevised,
          sqft: parseFloat(fieldSqft) || 0,
          hangerRate: parseFloat(fieldHangerRate) || 0,
          finisherRate: parseFloat(fieldFinisherRate) || 0,
          prepCleanRate: parseFloat(fieldPrepCleanRate) || 0,
          drywallMaterialRate: parseFloat(fieldDrywallMaterialRate) || 0,
          drywallSalesTaxRate: parseFloat(fieldDrywallSalesTaxRate) || 0
        }
      }
    });
  };

  // Auto-save rates when they change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only save if the rates are different from the stored values
      const currentRates = {
        sqft: parseFloat(fieldSqft) || 0,
        hangerRate: parseFloat(fieldHangerRate) || 0,
        finisherRate: parseFloat(fieldFinisherRate) || 0,
        prepCleanRate: parseFloat(fieldPrepCleanRate) || 0,
        drywallMaterialRate: parseFloat(fieldDrywallMaterialRate) || 0,
        drywallSalesTaxRate: parseFloat(fieldDrywallSalesTaxRate) || 0
      };

      const storedRates = {
        sqft: job?.financials?.fieldRevised?.sqft || 0,
        hangerRate: job?.financials?.fieldRevised?.hangerRate || 0,
        finisherRate: job?.financials?.fieldRevised?.finisherRate || 0,
        prepCleanRate: job?.financials?.fieldRevised?.prepCleanRate || 0,
        drywallMaterialRate: job?.financials?.fieldRevised?.drywallMaterialRate || 0,
        drywallSalesTaxRate: job?.financials?.fieldRevised?.drywallSalesTaxRate || 0
      };

      // Check if any rates have changed
      const hasChanges = Object.keys(currentRates).some(key => 
        Math.abs(currentRates[key] - storedRates[key]) > 0.001
      );

      if (hasChanges) {
        saveFieldRevisedRates();
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [fieldSqft, fieldHangerRate, fieldFinisherRate, fieldPrepCleanRate, fieldDrywallMaterialRate, fieldDrywallSalesTaxRate]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-brandPrimary" />
            Field Revised Financials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Field Takeoff Data */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Field Takeoff Data</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Actual SqFt from Takeoffs:</span>
                <p className="text-lg font-bold text-blue-800">{fieldRevisedCalculations.sqft.toLocaleString()} sqft</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Original Estimate SqFt:</span>
                <p className="text-lg font-bold text-blue-800">{job?.financials?.estimate?.sqft?.toLocaleString() || 0} sqft</p>
              </div>
            </div>
          </div>

          {/* Field Revised Rates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Hanger Rate ($/sqft)</Label>
              <Input
                type="number"
                step="0.01"
                value={fieldHangerRate}
                onChange={(e) => setFieldHangerRate(e.target.value)}
                placeholder="0.27"
                className="border-2 focus:border-brandPrimary"
              />
            </div>
            <div className="space-y-2">
              <Label>Finisher Rate ($/sqft)</Label>
              <Input
                type="number"
                step="0.01"
                value={fieldFinisherRate}
                onChange={(e) => setFieldFinisherRate(e.target.value)}
                placeholder="0.27"
                className="border-2 focus:border-brandPrimary"
              />
            </div>
            <div className="space-y-2">
              <Label>Prep/Clean Rate ($/sqft)</Label>
              <Input
                type="number"
                step="0.01"
                value={fieldPrepCleanRate}
                onChange={(e) => setFieldPrepCleanRate(e.target.value)}
                placeholder="0.03"
                className="border-2 focus:border-brandPrimary"
              />
            </div>
            <div className="space-y-2">
              <Label>Drywall Material Rate ($/sqft)</Label>
              <Input
                type="number"
                step="0.01"
                value={fieldDrywallMaterialRate}
                onChange={(e) => setFieldDrywallMaterialRate(e.target.value)}
                placeholder="0.66"
                className="border-2 focus:border-brandPrimary"
              />
            </div>
            <div className="space-y-2">
              <Label>Sales Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={fieldDrywallSalesTaxRate}
                onChange={(e) => setFieldDrywallSalesTaxRate(e.target.value)}
                placeholder="7.25"
                className="border-2 focus:border-brandPrimary"
              />
            </div>
          </div>

          {/* Save Rates Button */}
          <div className="flex justify-end">
            <Button
              onClick={saveFieldRevisedRates}
              className="bg-brandPrimary hover:bg-brandPrimary/90 text-white"
            >
              Save Field Revised Rates
            </Button>
          </div>

          {/* Field Revision Change Orders Section */}
          {job?.jobType === 'residential' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-blue-800">Field Revision Change Orders</h4>
                <Button
                  onClick={() => setShowFieldChangeOrderModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Change Order
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600 font-medium">Original Estimate:</span>
                  <p className="text-lg font-bold text-blue-800">${fieldRevisedCalculations.originalEstimateAmount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-blue-600 font-medium">Field Revision Change Orders:</span>
                  <p className="text-lg font-bold text-blue-800">${fieldRevisedCalculations.fieldChangeOrderTotal.toFixed(2)}</p>
                </div>
              </div>
              {fieldRevisedCalculations.fieldChangeOrders.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-sm text-blue-800 mb-2">Field Revision Change Orders:</h5>
                  <div className="space-y-2">
                    {fieldRevisedCalculations.fieldChangeOrders.map((changeOrder) => (
                      <div key={changeOrder.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div>
                          <p className="font-medium text-sm">{changeOrder.changeOrderNumber}</p>
                          <p className="text-xs text-gray-600">{changeOrder.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="font-bold text-blue-600">${changeOrder.totalValue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">+{changeOrder.profitPercentage}% profit</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditFieldChangeOrder(changeOrder)}
                            className="text-brandSecondary hover:bg-brandSecondary/10"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Field Change Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete field change order "{changeOrder.changeOrderNumber}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteFieldChangeOrder(changeOrder.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Field Revised Summary */}
          <Card className="border-2 border-brandPrimary/20 bg-brandPrimary/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-brandPrimary mb-4">Field Revised Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Material Cost:</span>
                  <span className="font-semibold">${fieldRevisedCalculations.materialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hanger Cost:</span>
                  <span className="font-semibold">${fieldRevisedCalculations.hangerCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Finisher Cost:</span>
                  <span className="font-semibold">${fieldRevisedCalculations.finisherCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prep/Clean Cost:</span>
                  <span className="font-semibold">${fieldRevisedCalculations.prepCleanCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sales Tax:</span>
                  <span className="font-semibold">${fieldRevisedCalculations.salesTax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-brandPrimary">
                    <span>Total Field Cost:</span>
                    <span>${fieldRevisedCalculations.totalCost.toFixed(2)}</span>
                  </div>
                </div>
                {job?.jobType === 'residential' && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-blue-600">
                        <span>Original Estimate:</span>
                        <span>${fieldRevisedCalculations.originalEstimateAmount.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold text-green-600">
                        <span>Field Revision Change Orders:</span>
                        <span>${fieldRevisedCalculations.fieldChangeOrderTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-xl font-bold text-purple-600">
                        <span>Total Field Revised:</span>
                        <span>${fieldRevisedCalculations.totalFieldRevised.toFixed(2)}</span>
                      </div>
                    </div>
                    {fieldRevisedProfitAmount > 0 && (
                      <>
                        <div className="border-t pt-3">
                          <div className="flex justify-between text-lg font-bold text-blue-600">
                            <span>Estimated Profit:</span>
                            <span>${fieldRevisedProfitAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Profit Percentage:</span>
                            <span className="font-semibold">{fieldRevisedProfitPercentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldRevisedTab;
