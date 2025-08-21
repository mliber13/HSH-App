import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Save, X, Plus, User, FileText, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const CreateChecklistForm = ({ jobId, employees, onSubmit, onCancel, onSaveAsTemplate, initialData }) => {
  const [checklistName, setChecklistName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([{ id: 1, description: '', completed: false }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeEmployees = employees.filter(emp => emp.isActive);

  // Initialize form data when editing an existing checklist
  React.useEffect(() => {
    if (initialData) {
      setChecklistName(initialData.name || '');
      setAssignedTo(initialData.assignedTo || '');
      setDescription(initialData.description || '');
      setTasks(initialData.tasks && initialData.tasks.length > 0 
        ? initialData.tasks.map(task => ({
            id: task.id || Date.now() + Math.random(),
            description: task.description || '',
            completed: task.completed || false
          }))
        : [{ id: 1, description: '', completed: false }]
      );
    }
  }, [initialData]);

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      description: '',
      completed: false
    };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (taskId) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  const updateTask = (taskId, field, value) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, [field]: value } : task
    ));
  };

  const handleSubmit = async (saveAsTemplate = false) => {
    if (!checklistName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a checklist name.",
        variant: "destructive"
      });
      return;
    }

    if (!assignedTo) {
      toast({
        title: "Missing Information",
        description: "Please assign the checklist to someone.",
        variant: "destructive"
      });
      return;
    }

    const validTasks = tasks.filter(task => task.description.trim());
    if (validTasks.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one task to the checklist.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const checklistData = {
        id: initialData ? initialData.id : Date.now().toString(),
        name: checklistName.trim(),
        description: description.trim(),
        assignedTo,
        tasks: validTasks,
        createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
        completed: initialData ? initialData.completed : false,
        completedBy: initialData ? initialData.completedBy : null,
        completedAt: initialData ? initialData.completedAt : null,
        isTemplate: saveAsTemplate
      };

      if (saveAsTemplate) {
        await onSaveAsTemplate(checklistData);
        toast({
          title: "Template Saved",
          description: "Checklist template has been saved successfully."
        });
      } else {
        await onSubmit(jobId, checklistData);
        toast({
          title: initialData ? "Checklist Updated" : "Checklist Created",
          description: initialData ? "Checklist has been updated successfully." : "Checklist has been created successfully."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save checklist. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 bg-gradient-to-r from-brandPrimary to-brandSecondary text-white shadow-2xl">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <ClipboardList className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">{initialData ? 'Edit Checklist' : 'Create Checklist'}</CardTitle>
                <p className="text-white/80 mt-1">{initialData ? 'Update tasks and assignments' : 'Add tasks and assign responsibilities'}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5" />
            <span>Checklist Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="checklistName">Checklist Name *</Label>
              <Input
                id="checklistName"
                value={checklistName}
                onChange={(e) => setChecklistName(e.target.value)}
                placeholder="Enter checklist name"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To *</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{employee.firstName} {employee.lastName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter checklist description (optional)"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Tasks</Label>
              <Button
                type="button"
                onClick={addTask}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </Button>
            </div>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                  <Input
                    value={task.description}
                    onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                    placeholder={`Task ${index + 1}`}
                    className="flex-1"
                  />
                  {tasks.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeTask(task.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {initialData ? 'Update Checklist' : 'Save Checklist'}
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              variant="outline"
              className="border-brandPrimary text-brandPrimary hover:bg-brandPrimary hover:text-white"
            >
              <Copy className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          </div>
          <Button
            onClick={onCancel}
            variant="ghost"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateChecklistForm; 