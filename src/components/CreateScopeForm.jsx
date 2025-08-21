import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const CreateScopeForm = ({ jobId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Not Started'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a scope name.",
        variant: "destructive"
      });
      return;
    }
    onSubmit(jobId, formData);
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
                className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl w-[90vw] max-w-lg flex flex-col">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-full flex flex-col"
                >
                <DialogHeader className="p-6 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
                    <div className="flex items-center space-x-3">
                        <Hammer className="h-6 w-6" />
                        <DialogTitle className="text-2xl font-bold">Create New Scope</DialogTitle>
                    </div>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="scopeName" className="text-sm font-semibold text-gray-700">Scope Name *</Label>
                            <Input
                            id="scopeName"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="e.g., Hanging, Finishing"
                            className="border-2 focus:border-brandPrimary transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                            <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Detailed description of the scope"
                            className="border-2 focus:border-brandPrimary transition-colors min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm font-semibold text-gray-700">Status</Label>
                            <Select
                            value={formData.status}
                            onValueChange={(value) => handleChange('status', value)}
                            >
                            <SelectTrigger className="border-2 focus:border-brandPrimary">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Complete">Complete</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg">
                        <Button type="button" variant="outline" onClick={onCancel} className="hover:bg-gray-100">
                            <X className="h-4 w-4 mr-2" /> Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90">
                            <Save className="h-4 w-4 mr-2" /> Create Scope
                        </Button>
                    </DialogFooter>
                </form>
                </motion.div>
            </DialogContent>
        </Dialog>
    </AnimatePresence>
  );
};

export default CreateScopeForm;