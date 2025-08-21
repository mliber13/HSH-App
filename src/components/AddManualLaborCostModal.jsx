import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Save, X, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

const AddManualLaborCostModal = ({ isOpen, employees, onSubmit, onCancel }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);
  const calculatedAmount = selectedEmployeeData && hours ? 
    (parseFloat(hours) * selectedEmployeeData.hourlyRate).toFixed(2) : '0.00';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedEmployee) {
      toast({
        title: "Missing Information",
        description: "Please select an employee.",
        variant: "destructive"
      });
      return;
    }

    if (!hours || parseFloat(hours) <= 0) {
      toast({
        title: "Invalid Hours",
        description: "Please enter valid hours worked.",
        variant: "destructive"
      });
      return;
    }

    const laborData = {
      employeeId: selectedEmployee,
      employeeName: `${selectedEmployeeData.firstName} ${selectedEmployeeData.lastName}`,
      role: selectedEmployeeData.role,
      hours: parseFloat(hours),
      hourlyRate: selectedEmployeeData.hourlyRate,
      amount: parseFloat(calculatedAmount),
      notes: notes.trim(),
      type: 'manual',
      createdAt: new Date().toISOString()
    };

    onSubmit(laborData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Dialog open={isOpen} onOpenChange={onCancel}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onCancel}
        />
        <DialogContent 
          className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl w-[90vw] max-w-lg flex flex-col">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-full flex flex-col"
          >
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6" />
              <DialogTitle className="text-2xl font-bold">Add Manual Labor Cost</DialogTitle>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Select Employee *
                </Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="border-2 focus:border-brandPrimary">
                    <SelectValue placeholder="Choose employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.filter(emp => emp.isActive).map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{employee.firstName} {employee.lastName}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {employee.role} - ${employee.hourlyRate}/hr
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEmployeeData && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Selected Employee</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Name:</span>
                      <p className="font-bold text-blue-800">{selectedEmployeeData.firstName} {selectedEmployeeData.lastName}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Role:</span>
                      <p className="font-bold text-blue-800">{selectedEmployeeData.role}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Hourly Rate:</span>
                      <p className="font-bold text-blue-800">${selectedEmployeeData.hourlyRate}/hr</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Hours Worked *
                </Label>
                <Input
                  type="number"
                  step="0.25"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0.00"
                  className="border-2 focus:border-brandPrimary"
                />
              </div>

              {selectedEmployeeData && hours && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Cost Calculation</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 font-medium">Hours:</span>
                      <p className="font-bold text-green-800">{hours} hrs</p>
                    </div>
                    <div>
                      <span className="text-green-600 font-medium">Rate:</span>
                      <p className="font-bold text-green-800">${selectedEmployeeData.hourlyRate}/hr</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-green-600 font-medium">Total Cost:</span>
                      <p className="text-xl font-bold text-green-800">${calculatedAmount}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Notes (Optional)
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this labor cost..."
                  className="border-2 focus:border-brandPrimary min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg">
              <Button type="button" variant="outline" onClick={onCancel} className="hover:bg-gray-100">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90"
                disabled={!selectedEmployee || !hours}
              >
                <Save className="h-4 w-4 mr-2" /> Add Labor Cost
              </Button>
            </DialogFooter>
          </form>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

export default AddManualLaborCostModal;