import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Save, X, Plus, Trash2, Calculator, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const ChangeOrderModal = ({ isOpen, onClose, onSave, job, existingChangeOrders = [], initialChangeOrderData = null }) => {
  const [formData, setFormData] = useState({
    changeOrderNumber: '',
    description: '',
    lineItems: [
      {
        id: Date.now(),
        description: '',
        quantity: '',
        unitType: 'Hours',
        unitRate: '',
        lineTotal: 0
      }
    ],
    profitPercentage: 15
  });

  // Auto-generate change order number when modal opens
  useEffect(() => {
    if (isOpen && job) {
      if (initialChangeOrderData) {
        // Editing existing change order - populate form with existing data
        setFormData({
          changeOrderNumber: initialChangeOrderData.changeOrderNumber || '',
          description: initialChangeOrderData.description || '',
          lineItems: initialChangeOrderData.lineItems?.map(item => ({
            ...item,
            id: item.id || Date.now() + Math.random()
          })) || [
            {
              id: Date.now(),
              description: '',
              quantity: '',
              unitType: 'Hours',
              unitRate: '',
              lineTotal: 0
            }
          ],
          profitPercentage: initialChangeOrderData.profitPercentage || 15
        });
      } else {
        // Creating new change order - auto-generate number
        const nextNumber = existingChangeOrders.length + 1;
        const autoNumber = `${job.jobName.replace(/\s+/g, '').substring(0, 3).toUpperCase()}-CO-${nextNumber.toString().padStart(3, '0')}`;
        setFormData(prev => ({
          ...prev,
          changeOrderNumber: autoNumber
        }));
      }
    }
  }, [isOpen, job, existingChangeOrders, initialChangeOrderData]);

  const calculateLineTotal = (quantity, unitRate) => {
    const qty = parseFloat(quantity) || 0;
    const rate = parseFloat(unitRate) || 0;
    return qty * rate;
  };

  const updateLineItem = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate line total when quantity or unit rate changes
          if (field === 'quantity' || field === 'unitRate') {
            updatedItem.lineTotal = calculateLineTotal(updatedItem.quantity, updatedItem.unitRate);
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: Date.now() + Math.random(),
          description: '',
          quantity: '',
          unitType: 'Hours',
          unitRate: '',
          lineTotal: 0
        }
      ]
    }));
  };

  const removeLineItem = (id) => {
    if (formData.lineItems.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one line item is required.",
        variant: "destructive"
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }));
  };

  // Calculate totals
  const subtotal = formData.lineItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0);
  const profitAmount = subtotal * (formData.profitPercentage / 100);
  const totalValue = subtotal + profitAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.changeOrderNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a change order number.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a description for this change order.",
        variant: "destructive"
      });
      return;
    }

    const validLineItems = formData.lineItems.filter(item => 
      item.description.trim() && item.quantity && item.unitRate
    );

    if (validLineItems.length === 0) {
      toast({
        title: "Missing Line Items",
        description: "Please add at least one complete line item.",
        variant: "destructive"
      });
      return;
    }

    const changeOrderData = {
      id: initialChangeOrderData?.id || `co-${Date.now()}`,
      changeOrderNumber: formData.changeOrderNumber,
      description: formData.description,
      lineItems: validLineItems,
      profitPercentage: formData.profitPercentage,
      subtotal: Math.round(subtotal * 100) / 100,
      profitAmount: Math.round(profitAmount * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(changeOrderData);
    
    // Reset form only if creating new (not editing)
    if (!initialChangeOrderData) {
      setFormData({
        changeOrderNumber: '',
        description: '',
        lineItems: [
          {
            id: Date.now(),
            description: '',
            quantity: '',
            unitType: 'Hours',
            unitRate: '',
            lineTotal: 0
          }
        ],
        profitPercentage: 15
      });
    }
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
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6" />
              <DialogTitle className="text-2xl font-bold">
                {initialChangeOrderData ? 'Edit Change Order' : 'Create Change Order'}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="changeOrderNumber" className="text-sm font-semibold text-gray-700">
                    Change Order Number *
                  </Label>
                  <Input
                    id="changeOrderNumber"
                    value={formData.changeOrderNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, changeOrderNumber: e.target.value }))}
                    placeholder="e.g., ABC-CO-001"
                    className="border-2 focus:border-brandPrimary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profitPercentage" className="text-sm font-semibold text-gray-700">
                    Profit Percentage
                  </Label>
                  <div className="relative">
                    <Input
                      id="profitPercentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.profitPercentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, profitPercentage: parseFloat(e.target.value) || 0 }))}
                      className="border-2 focus:border-brandPrimary transition-colors pr-8"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the change order..."
                  className="border-2 focus:border-brandPrimary transition-colors min-h-[80px]"
                />
              </div>

              {/* Line Items Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-700">Line Items</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLineItem}
                    className="border-dashed border-brandPrimary text-brandPrimary hover:bg-brandPrimary/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line Item
                  </Button>
                </div>

                {formData.lineItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-l-4 border-l-brandSecondary">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Line Item #{index + 1}</span>
                          {formData.lineItems.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLineItem(item.id)}
                              className="text-red-500 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="md:col-span-2 space-y-1">
                            <Label className="text-sm font-medium text-gray-600">Description *</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                              placeholder="e.g., Additional drywall installation"
                              className="border-gray-300 focus:border-brandPrimary"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-600">Quantity *</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                              placeholder="0"
                              className="border-gray-300 focus:border-brandPrimary"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-600">Unit Type</Label>
                            <Select
                              value={item.unitType}
                              onValueChange={(value) => updateLineItem(item.id, 'unitType', value)}
                            >
                              <SelectTrigger className="border-gray-300 focus:border-brandPrimary">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Hours">Hours</SelectItem>
                                <SelectItem value="Units">Units</SelectItem>
                                <SelectItem value="SqFt">Square Feet</SelectItem>
                                <SelectItem value="LF">Linear Feet</SelectItem>
                                <SelectItem value="Each">Each</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label className="text-sm font-medium text-gray-600">Unit Rate *</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unitRate}
                                onChange={(e) => updateLineItem(item.id, 'unitRate', e.target.value)}
                                placeholder="0.00"
                                className="border-gray-300 focus:border-brandPrimary pl-6"
                              />
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        </div>

                        {/* Line Total Display */}
                        <div className="flex justify-end">
                          <div className="text-right">
                            <span className="text-sm text-gray-600">Line Total: </span>
                            <span className="font-semibold text-brandPrimary">${(item.lineTotal || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Calculations Summary */}
              <Card className="border-2 border-brandPrimary/20 bg-brandPrimary/5">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Calculator className="h-5 w-5 text-brandPrimary" />
                    <h3 className="text-lg font-semibold text-brandPrimary">Change Order Summary</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Profit ({formData.profitPercentage}%):</span>
                      <span className="font-semibold text-green-600">${profitAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total Change Order Value:</span>
                        <span className="text-xl font-bold text-brandPrimary">${totalValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg">
            <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-100">
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90"
              disabled={!formData.changeOrderNumber.trim() || !formData.description.trim()}
            >
              <Save className="h-4 w-4 mr-2" /> 
              {initialChangeOrderData ? 'Update Change Order' : 'Save Change Order'}
            </Button>
          </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

export default ChangeOrderModal;