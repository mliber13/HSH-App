import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Save, X, Plus, Trash2, Calculator, DollarSign, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import supplierService from '@/services/supplierService';

const MaterialInvoiceModal = ({ isOpen, onClose, onSave, job, initialInvoice = null }) => {
  const [invoices, setInvoices] = useState([
    {
      id: Date.now(),
      supplierName: '',
      invoiceNumber: '',
      sqftDelivered: '',
      dollarAmount: '',
      salesTax: '',
      notes: ''
    }
  ]);
  const [suppliers, setSuppliers] = useState([]);

  // Load suppliers when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const supplierList = supplierService.getSuppliers();
        setSuppliers(supplierList);
      } catch (error) {
        console.error('Error loading suppliers:', error);
        setSuppliers([]);
      }
    }
  }, [isOpen]);

  // Initialize invoices when modal opens or initialInvoice changes
  useEffect(() => {
    if (isOpen) {
      if (initialInvoice) {
        // Edit mode: populate with existing invoice data
        setInvoices([{
          id: initialInvoice.id,
          supplierName: initialInvoice.supplierName || '',
          invoiceNumber: initialInvoice.invoiceNumber || '',
          sqftDelivered: initialInvoice.sqftDelivered?.toString() || '',
          dollarAmount: initialInvoice.dollarAmount?.toString() || '',
          salesTax: initialInvoice.salesTax?.toString() || '',
          notes: initialInvoice.notes || ''
        }]);
      } else {
        // Add mode: reset to empty form
        setInvoices([{
          id: Date.now(),
          supplierName: '',
          invoiceNumber: '',
          sqftDelivered: '',
          dollarAmount: '',
          salesTax: '',
          notes: ''
        }]);
      }
    }
  }, [isOpen, initialInvoice]);

  const addInvoice = () => {
    setInvoices(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        supplierName: '',
        invoiceNumber: '',
        sqftDelivered: '',
        dollarAmount: '',
        salesTax: '',
        notes: ''
      }
    ]);
  };

  const removeInvoice = (id) => {
    if (invoices.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one invoice is required.",
        variant: "destructive"
      });
      return;
    }
    
    setInvoices(prev => prev.filter(invoice => invoice.id !== id));
  };

  const updateInvoice = (id, field, value) => {
    setInvoices(prev => prev.map(invoice => 
      invoice.id === id ? { ...invoice, [field]: value } : invoice
    ));
  };

  // Calculate totals
  const totalDollarAmount = invoices.reduce((sum, invoice) => sum + (parseFloat(invoice.dollarAmount) || 0), 0);
  const totalSalesTax = invoices.reduce((sum, invoice) => sum + (parseFloat(invoice.salesTax) || 0), 0);
  const totalSqft = invoices.reduce((sum, invoice) => sum + (parseFloat(invoice.sqftDelivered) || 0), 0);
  const grandTotal = totalDollarAmount + totalSalesTax;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validInvoices = invoices.filter(invoice => 
      invoice.supplierName.trim() && 
      invoice.invoiceNumber.trim() && 
      invoice.sqftDelivered && 
      invoice.dollarAmount
    );

    if (validInvoices.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please complete at least one invoice with supplier name, invoice number, square footage, and dollar amount.",
        variant: "destructive"
      });
      return;
    }

    const invoiceData = validInvoices.map(invoice => ({
      id: `invoice-${Date.now()}-${Math.random()}`,
      supplierName: invoice.supplierName.trim(),
      invoiceNumber: invoice.invoiceNumber.trim(),
      sqftDelivered: parseFloat(invoice.sqftDelivered) || 0,
      dollarAmount: parseFloat(invoice.dollarAmount) || 0,
      salesTax: parseFloat(invoice.salesTax) || 0,
      notes: invoice.notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    onSave(invoiceData);
    
    // Reset form
    setInvoices([
      {
        id: Date.now(),
        supplierName: '',
        invoiceNumber: '',
        sqftDelivered: '',
        dollarAmount: '',
        salesTax: '',
        notes: ''
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        <DialogContent 
          className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl w-[90vw] max-w-4xl max-h-[90vh] flex flex-col">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-full flex flex-col"
          >
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6" />
              <DialogTitle className="text-2xl font-bold">
                {initialInvoice ? 'Edit Material Invoice' : 'Add Material Invoices'}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-6 space-y-6">
                {/* Job Information */}
                <div className="bg-brandSecondary/10 p-4 rounded-lg border border-brandSecondary/20">
                  <h3 className="font-semibold text-brandSecondary mb-2">Job Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-brandSecondary font-medium">Job Name:</span>
                      <p>{job?.jobName}</p>
                    </div>
                    <div>
                      <span className="text-brandSecondary font-medium">General Contractor:</span>
                      <p>{job?.generalContractor}</p>
                    </div>
                  </div>
                </div>

                {/* Invoices Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-700">Material Invoices</h3>
                    {!initialInvoice && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addInvoice}
                        className="border-dashed border-brandPrimary text-brandPrimary hover:bg-brandPrimary/5"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Invoice
                      </Button>
                    )}
                  </div>

                  {invoices.map((invoice, index) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-l-4 border-l-brandSecondary">
                        <CardContent className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Invoice #{index + 1}</span>
                            {invoices.length > 1 && !initialInvoice && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeInvoice(invoice.id)}
                                className="text-red-500 hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-600">Supplier Name *</Label>
                              <Select
                                value={invoice.supplierName}
                                onValueChange={(value) => updateInvoice(invoice.id, 'supplierName', value)}
                              >
                                <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                                  <SelectValue placeholder="Select a supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                  {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={supplier.name}>
                                      {supplier.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {suppliers.length === 0 && (
                                <p className="text-xs text-gray-500">
                                  No suppliers found. Add suppliers in Supplier Management first.
                                </p>
                              )}
                            </div>

                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-600">Invoice Number *</Label>
                              <Input
                                value={invoice.invoiceNumber}
                                onChange={(e) => updateInvoice(invoice.id, 'invoiceNumber', e.target.value)}
                                placeholder="e.g., INV-2024-001"
                                className="border-gray-300 focus:border-brandPrimary"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-600">SqFt of Drywall Delivered *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={invoice.sqftDelivered}
                                onChange={(e) => updateInvoice(invoice.id, 'sqftDelivered', e.target.value)}
                                placeholder="0.00"
                                className="border-gray-300 focus:border-brandPrimary"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-600">Dollar Amount *</Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={invoice.dollarAmount}
                                  onChange={(e) => updateInvoice(invoice.id, 'dollarAmount', e.target.value)}
                                  placeholder="0.00"
                                  className="border-gray-300 focus:border-brandPrimary pl-6"
                                />
                                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-sm font-medium text-gray-600">Sales Tax</Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={invoice.salesTax}
                                  onChange={(e) => updateInvoice(invoice.id, 'salesTax', e.target.value)}
                                  placeholder="0.00"
                                  className="border-gray-300 focus:border-brandPrimary pl-6"
                                />
                                <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-600">Notes (Optional)</Label>
                            <Textarea
                              value={invoice.notes}
                              onChange={(e) => updateInvoice(invoice.id, 'notes', e.target.value)}
                              placeholder="Additional notes about this invoice..."
                              className="border-gray-300 focus:border-brandPrimary min-h-[60px]"
                            />
                          </div>

                          {/* Invoice Total Display */}
                          <div className="flex justify-end">
                            <div className="text-right">
                              <span className="text-sm text-gray-600">Invoice Total: </span>
                              <span className="font-semibold text-brandPrimary">
                                ${((parseFloat(invoice.dollarAmount) || 0) + (parseFloat(invoice.salesTax) || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Summary Section */}
                <Card className="border-2 border-brandPrimary/20 bg-brandPrimary/5">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Calculator className="h-5 w-5 text-brandPrimary" />
                      <h3 className="text-lg font-semibold text-brandPrimary">Invoice Summary</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Square Footage:</span>
                        <span className="font-semibold">{totalSqft.toFixed(2)} SqFt</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Material Cost:</span>
                        <span className="font-semibold">${totalDollarAmount.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Sales Tax:</span>
                        <span className="font-semibold text-red-600">${totalSalesTax.toFixed(2)}</span>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                          <span className="text-xl font-bold text-brandPrimary">${grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </form>
          </div>

          <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-100">
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90"
              disabled={invoices.every(inv => !inv.supplierName.trim() || !inv.invoiceNumber.trim() || !inv.sqftDelivered || !inv.dollarAmount)}
            >
              <Save className="h-4 w-4 mr-2" /> 
              {initialInvoice ? 'Update Invoice' : 'Save Invoices'}
            </Button>
          </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

export default MaterialInvoiceModal;