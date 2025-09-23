import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Save, X, Plus, Trash2, DollarSign, Clock, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const EditEmployeeModal = ({ 
  employee, 
  updateEmployee, 
  addToolDeduction, 
  removeToolDeduction, 
  bankHours, 
  useBankedHours, 
  isOpen, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeType: '',
    role: '',
    payType: 'hourly',
    hourlyRate: '',
    salaryAmount: '',
    perDiem: '',
    fuelAllowance: '',
    isActive: true
  });

  const [newToolDeduction, setNewToolDeduction] = useState({
    description: '',
    totalAmount: '',
    weeklyDeduction: ''
  });

  const [bankingHours, setBankingHours] = useState('');
  const [usingHours, setUsingHours] = useState('');


  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        employeeType: employee.employeeType || '',
        role: employee.role || '',
        payType: employee.payType || 'hourly',
        hourlyRate: employee.hourlyRate?.toString() || '',
        salaryAmount: employee.salaryAmount?.toString() || '',
        perDiem: employee.perDiem?.toString() || '',
        fuelAllowance: employee.fuelAllowance?.toString() || '',
        isActive: employee.isActive !== false
      });
    }
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('=== EDIT EMPLOYEE MODAL SUBMIT ===');
    console.log('Employee ID:', employee.id);
    console.log('Form Data (updates):', formData);
    
    if (!formData.firstName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the employee's first name.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the employee's last name.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.employeeType) {
      toast({
        title: "Missing Information",
        description: "Please select the employee type.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.role) {
      toast({
        title: "Missing Information",
        description: "Please select the employee role.",
        variant: "destructive"
      });
      return;
    }

    if (formData.payType === 'hourly' && (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0)) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid hourly rate.",
        variant: "destructive"
      });
      return;
    }

    if (formData.payType === 'salary' && (!formData.salaryAmount || parseFloat(formData.salaryAmount) <= 0)) {
      toast({
        title: "Invalid Salary",
        description: "Please enter a valid weekly salary amount.",
        variant: "destructive"
      });
      return;
    }

    const updates = {
      ...formData,
      hourlyRate: formData.payType === 'hourly' ? parseFloat(formData.hourlyRate) : 0,
      salaryAmount: formData.payType === 'salary' ? parseFloat(formData.salaryAmount) : 0,
      perDiem: parseFloat(formData.perDiem) || 0,
      fuelAllowance: parseFloat(formData.fuelAllowance) || 0
    };

    console.log('Processed updates object:', updates);
    console.log('About to call updateEmployee...');
    
    updateEmployee(employee.id, updates, () => {
      console.log('updateEmployee callback executed - closing modal');
      onClose();
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddToolDeduction = () => {
    if (!newToolDeduction.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a tool description.",
        variant: "destructive"
      });
      return;
    }

    if (!newToolDeduction.totalAmount || parseFloat(newToolDeduction.totalAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid total amount.",
        variant: "destructive"
      });
      return;
    }

    if (!newToolDeduction.weeklyDeduction || parseFloat(newToolDeduction.weeklyDeduction) <= 0) {
      toast({
        title: "Invalid Deduction",
        description: "Please enter a valid weekly deduction amount.",
        variant: "destructive"
      });
      return;
    }

    addToolDeduction(employee.id, newToolDeduction, () => {
      setNewToolDeduction({ description: '', totalAmount: '', weeklyDeduction: '' });
    });
  };

  const handleBankHours = () => {
    if (!bankingHours || parseFloat(bankingHours) <= 0) {
      toast({
        title: "Invalid Hours",
        description: "Please enter valid hours to bank.",
        variant: "destructive"
      });
      return;
    }

    bankHours(employee.id, bankingHours, () => {
      setBankingHours('');
    });
  };

  const handleUseBankedHours = () => {
    if (!usingHours || parseFloat(usingHours) <= 0) {
      toast({
        title: "Invalid Hours",
        description: "Please enter valid hours to use.",
        variant: "destructive"
      });
      return;
    }

    useBankedHours(employee.id, usingHours, () => {
      setUsingHours('');
    });
  };

  if (!employee) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
                <User className="h-6 w-6" />
                <DialogTitle className="text-2xl font-bold">Edit Employee - {employee.firstName} {employee.lastName}</DialogTitle>
              </div>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto">
              <Tabs defaultValue="basic" className="h-full">
                <TabsList className="grid w-full grid-cols-4 m-6 mb-0">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pay">Pay & Allowances</TabsTrigger>
                  <TabsTrigger value="tools">Tool Deductions</TabsTrigger>
                  <TabsTrigger value="banking">Hour Banking</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="p-6 pt-4">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleChange('firstName', e.target.value)}
                          placeholder="Enter first name"
                          className="border-2 focus:border-brandPrimary transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleChange('lastName', e.target.value)}
                          placeholder="Enter last name"
                          className="border-2 focus:border-brandPrimary transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="Enter email address"
                          className="border-2 focus:border-brandPrimary transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="Enter phone number"
                          className="border-2 focus:border-brandPrimary transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-semibold text-gray-700">
                          Employee Type *
                        </Label>
                        <Select
                          value={formData.employeeType || ''}
                          onValueChange={(value) => handleChange('employeeType', value)}
                        >
                          <SelectTrigger className="border-2 focus:border-brandPrimary">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Employee">Employee</SelectItem>
                            <SelectItem value="1099 In-House Contractor">1099 In-House Contractor</SelectItem>
                            <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-sm font-semibold text-gray-700">
                          Role *
                        </Label>
                        <Select
                          value={formData.role || ''}
                          onValueChange={(value) => handleChange('role', value)}
                        >
                          <SelectTrigger className="border-2 focus:border-brandPrimary">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Project Manager">Project Manager</SelectItem>
                            <SelectItem value="Foreman">Foreman</SelectItem>
                            <SelectItem value="Hanger">Hanger</SelectItem>
                            <SelectItem value="Finisher">Finisher</SelectItem>
                            <SelectItem value="Laborer">Laborer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-sm font-semibold text-gray-700">
                          Status
                        </Label>
                        <Select
                          value={formData.isActive ? 'active' : 'inactive'}
                          onValueChange={(value) => handleChange('isActive', value === 'active')}
                        >
                          <SelectTrigger className="border-2 focus:border-brandPrimary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="pay" className="p-6 pt-4">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold text-gray-700">
                        Pay Type *
                      </Label>
                      <Select
                        value={formData.payType}
                        onValueChange={(value) => handleChange('payType', value)}
                      >
                        <SelectTrigger className="border-2 focus:border-brandPrimary">
                          <SelectValue placeholder="Select pay type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="salary">Salary (Weekly)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.payType === 'hourly' && (
                      <div className="space-y-1">
                        <Label htmlFor="hourlyRate" className="text-sm font-semibold text-gray-700">
                          Hourly Rate *
                        </Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.hourlyRate}
                          onChange={(e) => handleChange('hourlyRate', e.target.value)}
                          placeholder="0.00"
                          className="border-2 focus:border-brandPrimary transition-colors"
                        />
                      </div>
                    )}

                    {formData.payType === 'salary' && (
                      <div className="space-y-1">
                        <Label htmlFor="salaryAmount" className="text-sm font-semibold text-gray-700">
                          Weekly Salary Amount *
                        </Label>
                        <Input
                          id="salaryAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.salaryAmount}
                          onChange={(e) => handleChange('salaryAmount', e.target.value)}
                          placeholder="2431.00"
                          className="border-2 focus:border-brandPrimary transition-colors"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="perDiem" className="text-sm font-semibold text-gray-700">
                          Per Diem (Daily)
                        </Label>
                        <Input
                          id="perDiem"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.perDiem}
                          onChange={(e) => handleChange('perDiem', e.target.value)}
                          placeholder="0.00"
                          className="border-2 focus:border-brandPrimary transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="fuelAllowance" className="text-sm font-semibold text-gray-700">
                          Fuel Allowance (Weekly)
                        </Label>
                        <Input
                          id="fuelAllowance"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.fuelAllowance}
                          onChange={(e) => handleChange('fuelAllowance', e.target.value)}
                          placeholder="0.00"
                          className="border-2 focus:border-brandPrimary transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tools" className="p-6 pt-4">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Wrench className="h-5 w-5 mr-2" />
                          Add New Tool Deduction
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <Label>Tool Description</Label>
                          <Input
                            value={newToolDeduction.description}
                            onChange={(e) => setNewToolDeduction(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="e.g., Drywall Lift, Screw Gun"
                            className="border-2 focus:border-brandPrimary"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label>Total Amount</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={newToolDeduction.totalAmount}
                              onChange={(e) => setNewToolDeduction(prev => ({ ...prev, totalAmount: e.target.value }))}
                              placeholder="1000.00"
                              className="border-2 focus:border-brandPrimary"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Weekly Deduction</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={newToolDeduction.weeklyDeduction}
                              onChange={(e) => setNewToolDeduction(prev => ({ ...prev, weeklyDeduction: e.target.value }))}
                              placeholder="100.00"
                              className="border-2 focus:border-brandPrimary"
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddToolDeduction} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Tool Deduction
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Current Tool Deductions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {(employee.toolDeductions || []).length === 0 ? (
                          <p className="text-gray-500 text-center py-4">No tool deductions</p>
                        ) : (
                          <div className="space-y-3">
                            {employee.toolDeductions.map((tool) => (
                              <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{tool.description}</p>
                                  <p className="text-sm text-gray-600">
                                    ${tool.weeklyDeduction}/week • ${tool.remainingBalance} remaining
                                  </p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeToolDeduction(employee.id, tool.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="banking" className="p-6 pt-4">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Clock className="h-5 w-5 mr-2" />
                          Current Banked Hours: {employee.bankedHours || 0} hours
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-brandPrimary">Bank Hours</h4>
                            <div className="space-y-2">
                              <Label>Hours to Bank</Label>
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                value={bankingHours}
                                onChange={(e) => setBankingHours(e.target.value)}
                                placeholder="8.0"
                                className="border-2 focus:border-brandPrimary"
                              />
                            </div>
                            <Button onClick={handleBankHours} className="w-full">
                              <DollarSign className="h-4 w-4 mr-2" />
                              Bank Hours
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-semibold text-brandSecondary">Use Banked Hours</h4>
                            <div className="space-y-2">
                              <Label>Hours to Use</Label>
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                max={employee.bankedHours || 0}
                                value={usingHours}
                                onChange={(e) => setUsingHours(e.target.value)}
                                placeholder="8.0"
                                className="border-2 focus:border-brandSecondary"
                              />
                            </div>
                            <Button onClick={handleUseBankedHours} className="w-full bg-brandSecondary hover:bg-brandSecondary/90">
                              <Clock className="h-4 w-4 mr-2" />
                              Use Banked Hours
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="font-semibold text-blue-800 mb-2">How Hour Banking Works</h5>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Bank hours when an employee works overtime but wants to save some for later</li>
                            <li>• Use banked hours for paid time off or when they want to cash out</li>
                            <li>• Banked hours are paid at the employee's current rate when used</li>
                            <li>• Example: Work 60 hours, get paid for 40, bank 20 for later use</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-gray-100">
                <X className="h-4 w-4 mr-2" /> Close
              </Button>
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90">
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default EditEmployeeModal;