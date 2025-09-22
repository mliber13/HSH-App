import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Save, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { validateForm, validateField, scopeValidationRules, checkDuplicateScopeName, sanitizeInput } from '@/lib/validation';

const CreateScopeForm = ({ jobId, onSubmit, onCancel, existingScopes = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Not Started'
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setValidationErrors({});

    // Sanitize form data
    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name),
      description: sanitizeInput(formData.description)
    };

    // Validate form
    const { isValid, errors } = validateForm(sanitizedData, scopeValidationRules);
    
    if (!isValid) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      
      // Show first error in toast
      const firstError = Object.values(errors)[0]?.[0];
      if (firstError) {
        toast({
          title: "Validation Error",
          description: firstError,
          variant: "destructive"
        });
      }
      return;
    }

    // Check for duplicate scope name
    if (checkDuplicateScopeName(sanitizedData.name, existingScopes)) {
      setValidationErrors({
        name: ['A scope with this name already exists. Please choose a different name.']
      });
      setIsSubmitting(false);
      
      toast({
        title: "Duplicate Scope Name",
        description: "A scope with this name already exists. Please choose a different name.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit(jobId, sanitizedData);
    } catch (error) {
      console.error('Error creating scope:', error);
      toast({
        title: "Error Creating Scope",
        description: "An error occurred while creating the scope. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Real-time validation for specific fields
  const validateFieldOnBlur = (field, value) => {
    const errors = validateField(value, scopeValidationRules[field]);
    if (errors.length > 0) {
      setValidationErrors(prev => ({ ...prev, [field]: errors }));
    }
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
                            onBlur={(e) => validateFieldOnBlur('name', e.target.value)}
                            placeholder="e.g., Hanging, Finishing"
                            className={`border-2 focus:border-brandPrimary transition-colors ${
                              validationErrors.name ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                            />
                            {validationErrors.name && (
                              <div className="flex items-center space-x-1 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{validationErrors.name[0]}</span>
                              </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                            <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            onBlur={(e) => validateFieldOnBlur('description', e.target.value)}
                            placeholder="Detailed description of the scope"
                            className={`border-2 focus:border-brandPrimary transition-colors min-h-[80px] ${
                              validationErrors.description ? 'border-red-500 focus:border-red-500' : ''
                            }`}
                            />
                            {validationErrors.description && (
                              <div className="flex items-center space-x-1 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>{validationErrors.description[0]}</span>
                              </div>
                            )}
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
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-4 w-4 mr-2" /> 
                            {isSubmitting ? 'Creating Scope...' : 'Create Scope'}
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