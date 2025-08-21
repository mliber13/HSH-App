import React, { useState } from 'react';
import { TrendingUp, Plus, Edit3, Trash2, Package, User, Receipt, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import MaterialInvoiceModal from '@/components/MaterialInvoiceModal';
import ChangeOrderModal from '@/components/ChangeOrderModal';
import AddManualLaborCostModal from '@/components/AddManualLaborCostModal';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { toast } from '@/components/ui/use-toast';

const ActualTab = ({ job, onUpdateJob, disableAutoSyncTemporarily, forceRecalculateLaborCosts }) => {
  const [showMaterialInvoiceModal, setShowMaterialInvoiceModal] = useState(false);
  const [editingMaterialInvoice, setEditingMaterialInvoice] = useState(null);
  const [showManualLaborModal, setShowManualLaborModal] = useState(false);
  const [showChangeOrderModal, setShowChangeOrderModal] = useState(false);
  const [editingChangeOrder, setEditingChangeOrder] = useState(null);

  const { employees } = useEmployeeData();

  // Calculate actual totals
  const actualCalculations = {
    totalMaterialCost: job?.financials?.actual?.totalMaterialCost || 0,
    totalSalesTax: job?.financials?.actual?.totalSalesTax || 0,
    totalLaborCost: job?.financials?.actual?.totalLaborCost || 0,
    totalManualLaborCost: job?.financials?.actual?.totalManualLaborCost || 0,
    totalChangeOrderValue: job?.financials?.actual?.totalChangeOrderValue || 0,
    totalFieldChangeOrderValue: job?.financials?.actual?.totalFieldChangeOrderValue || 0,
    totalActual: job?.financials?.actual?.totalActual || 0,
    materialInvoices: job?.financials?.actual?.materialInvoices || [],
    laborCosts: job?.financials?.actual?.laborCosts || [],
    manualLaborCosts: job?.financials?.actual?.manualLaborCosts || [],
    changeOrders: job?.financials?.actual?.changeOrders || [],
    fieldChangeOrders: job?.financials?.actual?.fieldChangeOrders || []
  };

  // Calculate profit for actual costs
  const originalEstimateAmount = job?.financials?.estimate?.totalEstimateAmount || 0;
  const totalBillableAmount = originalEstimateAmount + actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue;
  const actualProfitAmount = totalBillableAmount - actualCalculations.totalActual;
  const actualProfitPercentage = actualCalculations.totalActual > 0 ? (actualProfitAmount / actualCalculations.totalActual) * 100 : 0;

  // Material Invoice Handlers
  const handleSaveMaterialInvoice = (invoiceData) => {
    const existingInvoices = job?.financials?.actual?.materialInvoices || [];
    let updatedInvoices;

    if (editingMaterialInvoice) {
      // Update existing invoice - invoiceData is a single invoice object
      updatedInvoices = existingInvoices.map(inv => 
        inv.id === editingMaterialInvoice.id ? invoiceData : inv
      );
      toast({
        title: "Material Invoice Updated! ✅",
        description: `Invoice "${invoiceData.invoiceNumber}" has been updated.`
      });
    } else {
      // Add new invoices - invoiceData is an array of invoices
      const newInvoices = Array.isArray(invoiceData) ? invoiceData : [invoiceData];
      updatedInvoices = [...existingInvoices, ...newInvoices];
      toast({
        title: "Material Invoices Added! 📋",
        description: `${newInvoices.length} invoice${newInvoices.length > 1 ? 's' : ''} have been added.`
      });
    }

    const totalMaterialCost = updatedInvoices.reduce((sum, inv) => sum + (inv.dollarAmount || 0), 0);
    const totalSalesTax = updatedInvoices.reduce((sum, inv) => sum + (inv.salesTax || 0), 0);

    onUpdateJob(job.id, {
      financials: {
        ...job.financials,
        actual: {
          ...job.financials?.actual,
          materialInvoices: updatedInvoices,
          totalMaterialCost,
          totalSalesTax,
          totalActual: totalMaterialCost + totalSalesTax + actualCalculations.totalLaborCost + actualCalculations.totalManualLaborCost + actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue
        }
      }
    });

    setShowMaterialInvoiceModal(false);
    setEditingMaterialInvoice(null);
  };

  const handleEditMaterialInvoice = (invoice) => {
    setEditingMaterialInvoice(invoice);
    setShowMaterialInvoiceModal(true);
  };

  const handleDeleteMaterialInvoice = (invoiceId) => {
    const existingInvoices = job?.financials?.actual?.materialInvoices || [];
    const updatedInvoices = existingInvoices.filter(inv => inv.id !== invoiceId);
    const totalMaterialCost = updatedInvoices.reduce((sum, inv) => sum + (inv.dollarAmount || 0), 0);
    const totalSalesTax = updatedInvoices.reduce((sum, inv) => sum + (inv.salesTax || 0), 0);

    onUpdateJob(job.id, {
      financials: {
        ...job.financials,
        actual: {
          ...job.financials?.actual,
          materialInvoices: updatedInvoices,
          totalMaterialCost,
          totalSalesTax,
          totalActual: totalMaterialCost + totalSalesTax + actualCalculations.totalLaborCost + actualCalculations.totalManualLaborCost + actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue
        }
      }
    });

    toast({
      title: "Material Invoice Deleted! 🗑️",
      description: "The material invoice has been removed.",
      variant: "destructive"
    });
  };

  // Manual Labor Handlers
  const handleSaveManualLaborCost = (laborData) => {
    const existingManualLabor = job?.financials?.actual?.manualLaborCosts || [];
    const updatedManualLabor = [...existingManualLabor, laborData];
    const totalManualLaborCost = updatedManualLabor.reduce((sum, labor) => sum + labor.amount, 0);

    onUpdateJob(job.id, {
      financials: {
        ...job.financials,
        actual: {
          ...job.financials?.actual,
          manualLaborCosts: updatedManualLabor,
          totalManualLaborCost,
          totalActual: actualCalculations.totalMaterialCost + actualCalculations.totalSalesTax + actualCalculations.totalLaborCost + totalManualLaborCost + actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue
        }
      }
    });

    setShowManualLaborModal(false);

    toast({
      title: "Manual Labor Cost Added! 👷",
      description: `Manual labor cost of $${laborData.amount} has been added.`
    });
  };

  // Change Order Handlers
  const handleSaveChangeOrder = (changeOrderData) => {
    const existingChangeOrders = job?.financials?.actual?.changeOrders || [];
    let updatedChangeOrders;

    if (editingChangeOrder) {
      // Update existing change order
      updatedChangeOrders = existingChangeOrders.map(co => 
        co.id === editingChangeOrder.id ? changeOrderData : co
      );
      toast({
        title: "Change Order Updated! ✅",
        description: `Change order "${changeOrderData.changeOrderNumber}" has been updated.`
      });
    } else {
      // Add new change order
      updatedChangeOrders = [...existingChangeOrders, changeOrderData];
      toast({
        title: "Change Order Added! 📋",
        description: `Change order "${changeOrderData.changeOrderNumber}" has been added with a value of $${changeOrderData.totalValue}.`
      });
      
      
    }

    const totalChangeOrderValue = updatedChangeOrders.reduce((sum, co) => sum + co.totalValue, 0);

    onUpdateJob(job.id, {
      financials: {
        ...job.financials,
        actual: {
          ...job.financials?.actual,
          changeOrders: updatedChangeOrders,
          totalChangeOrderValue,
          totalActual: actualCalculations.totalMaterialCost + actualCalculations.totalSalesTax + actualCalculations.totalLaborCost + actualCalculations.totalManualLaborCost + totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue
        }
      }
    });

    setShowChangeOrderModal(false);
    setEditingChangeOrder(null);
  };

  const handleEditChangeOrder = (changeOrder) => {
    setEditingChangeOrder(changeOrder);
    setShowChangeOrderModal(true);
  };

  const handleDeleteChangeOrder = (changeOrderId) => {
    const existingChangeOrders = job?.financials?.actual?.changeOrders || [];
    const updatedChangeOrders = existingChangeOrders.filter(co => co.id !== changeOrderId);
    const totalChangeOrderValue = updatedChangeOrders.reduce((sum, co) => sum + co.totalValue, 0);

    onUpdateJob(job.id, {
      financials: {
        ...job.financials,
        actual: {
          ...job.financials?.actual,
          changeOrders: updatedChangeOrders,
          totalChangeOrderValue,
          totalActual: actualCalculations.totalMaterialCost + actualCalculations.totalSalesTax + actualCalculations.totalLaborCost + actualCalculations.totalManualLaborCost + totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue
        }
      }
    });

    toast({
      title: "Change Order Deleted! 🗑️",
      description: "The change order has been removed.",
      variant: "destructive"
    });
  };



  return (
    <div className="space-y-6">
      {/* Material Invoices Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Material Invoices
            </CardTitle>
            <Button
              onClick={() => {
                setEditingMaterialInvoice(null);
                setShowMaterialInvoiceModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Material Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {actualCalculations.materialInvoices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No material invoices added yet</p>
          ) : (
            <div className="space-y-4">
              {actualCalculations.materialInvoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-gray-600">{invoice.supplierName}</p>
                      <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-bold text-blue-600">${((invoice.dollarAmount || 0) + (invoice.salesTax || 0)).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">Tax: ${(invoice.salesTax || 0).toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditMaterialInvoice(invoice)}
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
                            <AlertDialogTitle>Delete Material Invoice</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete invoice "{invoice.invoiceNumber}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteMaterialInvoice(invoice.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                      <span>Drywall Material ({invoice.sqftDelivered || 0} sqft)</span>
                      <span className="font-medium">${(invoice.dollarAmount || 0).toFixed(2)}</span>
                    </div>
                    {invoice.notes && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Notes:</span> {invoice.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Material Invoices:</span>
                  <span className="text-blue-600">${actualCalculations.totalMaterialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total Sales Tax:</span>
                  <span>${actualCalculations.totalSalesTax.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Labor Costs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-green-600" />
              Labor Costs
            </CardTitle>
            <Button
              onClick={() => setShowManualLaborModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Labor Cost
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-800">Time Clock Labor</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('=== SYNC BUTTON CLICKED ===');
                    console.log('forceRecalculateLaborCosts function:', !!forceRecalculateLaborCosts);
                    if (forceRecalculateLaborCosts) {
                      console.log('Calling forceRecalculateLaborCosts...');
                      forceRecalculateLaborCosts();
                      toast({
                        title: "Labor Costs Synced! 🔄",
                        description: "Time clock labor costs have been recalculated and updated."
                      });
                    } else {
                      console.log('forceRecalculateLaborCosts is not available');
                    }
                  }}
                  className="text-green-600 hover:bg-green-100 h-6 px-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync
                </Button>
              </div>
              <p className="text-2xl font-bold text-green-600">${actualCalculations.totalLaborCost.toFixed(2)}</p>
              <p className="text-sm text-green-600">{actualCalculations.laborCosts.length} labor entries</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-800">Manual Labor Costs</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newTotalManualLaborCost = parseFloat(prompt('Enter new manual labor cost amount (or 0 to clear):', actualCalculations.totalManualLaborCost.toFixed(2))) || 0;
                    
                    // Recalculate total actual costs with the new manual labor cost
                    const newTotalActual = actualCalculations.totalMaterialCost + 
                                         actualCalculations.totalSalesTax + 
                                         actualCalculations.totalLaborCost + 
                                         newTotalManualLaborCost + 
                                         actualCalculations.totalChangeOrderValue + 
                                         actualCalculations.totalFieldChangeOrderValue;
                    
                    onUpdateJob(job.id, {
                      financials: {
                        ...job.financials,
                        actual: {
                          ...job.financials?.actual,
                          totalManualLaborCost: newTotalManualLaborCost,
                          manualLaborCosts: newTotalManualLaborCost === 0 ? [] : job.financials?.actual?.manualLaborCosts || [],
                          totalActual: newTotalActual
                        }
                      }
                    });
                    toast({
                      title: "Manual Labor Cost Updated! ✅",
                      description: `Manual labor cost has been updated to $${newTotalManualLaborCost.toFixed(2)}.`
                    });
                  }}
                  className="text-blue-600 hover:bg-blue-100 h-6 px-2 text-xs"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              <p className="text-2xl font-bold text-blue-600">${actualCalculations.totalManualLaborCost.toFixed(2)}</p>
              <p className="text-sm text-blue-600">{actualCalculations.manualLaborCosts.length} manual entries</p>
            </div>
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total Labor Costs:</span>
              <span className="text-green-600">${(actualCalculations.totalLaborCost + actualCalculations.totalManualLaborCost).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Orders Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2 text-purple-600" />
              Change Orders
            </CardTitle>
            <div className="flex gap-2">
                             <Button
                 onClick={() => {
                   setEditingChangeOrder(null);
                   setShowChangeOrderModal(true);
                 }}
                 className="bg-purple-600 hover:bg-purple-700 text-white"
               >
                 <Plus className="h-4 w-4 mr-2" />
                 Add Change Order
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {actualCalculations.changeOrders.length === 0 && actualCalculations.fieldChangeOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No change orders added yet</p>
          ) : (
            <div className="space-y-4">
              {/* Field Revision Change Orders */}
              {actualCalculations.fieldChangeOrders.length > 0 && (
                <>
                  <h4 className="font-semibold text-blue-800 border-b pb-2">Field Revision Change Orders</h4>
                  {actualCalculations.fieldChangeOrders.map((changeOrder) => (
                    <div key={changeOrder.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow border-blue-200 bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{changeOrder.changeOrderNumber}</h4>
                          <p className="text-sm text-gray-600">{changeOrder.description}</p>
                          <p className="text-xs text-gray-500">{new Date(changeOrder.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">${changeOrder.totalValue.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">+{changeOrder.profitPercentage}% profit</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Ongoing Change Orders */}
              {actualCalculations.changeOrders.length > 0 && (
                <>
                  <h4 className="font-semibold text-purple-800 border-b pb-2">Ongoing Change Orders</h4>
                  {actualCalculations.changeOrders.map((changeOrder) => (
                    <div key={changeOrder.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow border-purple-200 bg-purple-50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{changeOrder.changeOrderNumber}</h4>
                          <p className="text-sm text-gray-600">{changeOrder.description}</p>
                          <p className="text-xs text-gray-500">{new Date(changeOrder.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="font-bold text-purple-600">${changeOrder.totalValue.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">+{changeOrder.profitPercentage}% profit</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditChangeOrder(changeOrder)}
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
                                <AlertDialogTitle>Delete Change Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete change order "{changeOrder.changeOrderNumber}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteChangeOrder(changeOrder.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Combined Total */}
              {(actualCalculations.fieldChangeOrders.length > 0 || actualCalculations.changeOrders.length > 0) && (
                <div className="border-t-2 pt-4 mt-6">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total All Change Orders:</span>
                    <span className="text-green-600">${(actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>Field: ${actualCalculations.totalFieldChangeOrderValue.toFixed(2)} | Ongoing: ${actualCalculations.totalChangeOrderValue.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actual Summary */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <TrendingUp className="h-5 w-5 mr-2" />
            Actual Costs Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Material Costs:</span>
              <span className="font-semibold">${(actualCalculations.totalMaterialCost + actualCalculations.totalSalesTax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Labor Costs:</span>
              <span className="font-semibold">${(actualCalculations.totalLaborCost + actualCalculations.totalManualLaborCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Change Orders:</span>
              <span className="font-semibold">${(actualCalculations.totalChangeOrderValue + actualCalculations.totalFieldChangeOrderValue).toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-xl font-bold text-green-800">
                <span>Total Actual Costs:</span>
                <span>${actualCalculations.totalActual.toFixed(2)}</span>
              </div>
            </div>
            {job?.jobType === 'residential' && (
              <>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-blue-600">
                    <span>Total Billable Amount:</span>
                    <span>${totalBillableAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-purple-600">
                    <span>Actual Profit:</span>
                    <span>${actualProfitAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Profit Percentage:</span>
                    <span className="font-semibold">{actualProfitPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      

      {/* Modals */}
      <MaterialInvoiceModal
        isOpen={showMaterialInvoiceModal}
        onClose={() => {
          setShowMaterialInvoiceModal(false);
          setEditingMaterialInvoice(null);
        }}
        onSave={handleSaveMaterialInvoice}
        job={job}
        initialInvoice={editingMaterialInvoice}
      />

      <AddManualLaborCostModal
        isOpen={showManualLaborModal}
        employees={employees}
        onSubmit={handleSaveManualLaborCost}
        onCancel={() => setShowManualLaborModal(false)}
      />

      <ChangeOrderModal
        isOpen={showChangeOrderModal}
        onClose={() => {
          setShowChangeOrderModal(false);
          setEditingChangeOrder(null);
        }}
        onSave={handleSaveChangeOrder}
        job={job}
        existingChangeOrders={actualCalculations.changeOrders}
        initialChangeOrderData={editingChangeOrder}
      />
    </div>
  );
};

export default ActualTab;
