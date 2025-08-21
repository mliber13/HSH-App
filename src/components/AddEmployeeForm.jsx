import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

const AddEmployeeForm = ({ onSubmit, onCancel }) => {
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
    fuelAllowance: ''
  });


  const handleSubmit = (e) => {
    e.preventDefault();
    
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

    if (!formData.payType) {
      toast({
        title: "Missing Information",
        description: "Please select the pay type.",
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

    const employeeData = {
      ...formData,
      hourlyRate: formData.payType === 'hourly' ? parseFloat(formData.hourlyRate) : 0,
      salaryAmount: formData.payType === 'salary' ? parseFloat(formData.salaryAmount) : 0,
      perDiem: parseFloat(formData.perDiem) || 0,
      fuelAllowance: parseFloat(formData.fuelAllowance) || 0
    };

    console.log("About to add employee with data:", employeeData);
    if (onSubmit) {
      onSubmit(employeeData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      <Dialog open={true} onOpenChange={onCancel}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onCancel}
        />
        <DialogContent 
          className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl w-[90vw] max-w-2xl flex flex-col max-h-[90vh] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-full flex flex-col"
          >
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6" />
              <DialogTitle className="text-2xl font-bold">Add New Employee</DialogTitle>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-gray-700">
                      Employee Type *
                    </Label>
                    <Select
                      value={formData.employeeType}
                      onValueChange={(value) => handleChange('employeeType', value)}
                    >
                      <SelectTrigger className="border-2 focus:border-brandPrimary">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="1099 Contractor">1099 Contractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm font-semibold text-gray-700">
                      Role *
                    </Label>
                    <Select
                      value={formData.role}
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
                </div>
              </div>

              {/* Pay Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Pay Information</h3>
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
              </div>

              {/* Allowances */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Allowances</h3>
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

              {formData.role === 'Laborer' && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Laborers can only work hourly time and cannot use piece rate.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg">
              <Button type="button" variant="outline" onClick={onCancel} className="hover:bg-gray-100">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90">
                <Save className="h-4 w-4 mr-2" /> Add Employee
              </Button>
            </DialogFooter>
          </form>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

export default AddEmployeeForm;