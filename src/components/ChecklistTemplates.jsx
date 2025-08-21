import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Copy, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

const ChecklistTemplates = ({ 
  templates, 
  employees, 
  onUseTemplate, 
  onDeleteTemplate 
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const handleUseTemplate = (template) => {
    // Create a new checklist from template
    const newChecklist = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
      completedBy: null,
      completedAt: null,
      isTemplate: false
    };
    
    onUseTemplate(newChecklist);
  };

  const handleDeleteTemplate = (templateId) => {
    onDeleteTemplate(templateId);
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates</h3>
        <p className="text-gray-600">Save checklists as templates to reuse them across different jobs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FileText className="h-6 w-6 text-brandPrimary" />
        <h2 className="text-2xl font-bold text-gray-900">Checklist Templates</h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {templates.length}
        </Badge>
      </div>

      <div className="grid gap-6">
        {templates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="shadow-lg transition-all duration-200 hover:shadow-xl border-blue-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {template.name}
                      </CardTitle>
                      <Badge variant="outline" className="border-blue-300 text-blue-700">
                        <FileText className="h-3 w-3 mr-1" />
                        Template
                      </Badge>
                    </div>
                    
                    {template.description && (
                      <p className="text-gray-600 mb-3">{template.description}</p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Assigned to: {getEmployeeName(template.assignedTo)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {format(new Date(template.createdAt), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Tasks: {template.tasks.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the template "{template.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 mb-3">Template Tasks:</h4>
                  {template.tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex-shrink-0 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <span className="text-sm text-gray-700">{task.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistTemplates; 