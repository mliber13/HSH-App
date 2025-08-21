import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle, Circle, User, Calendar, Plus, Edit3, Trash2, FileText, CheckSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import CreateChecklistForm from '@/components/CreateChecklistForm';

const ChecklistManager = ({ 
  jobId, 
  checklists, 
  employees, 
  onCreateChecklist, 
  onUpdateChecklist, 
  onDeleteChecklist, 
  onCompleteChecklist,
  onSaveChecklistTemplate,
  noCard = false // New prop to control card wrapping
}) => {
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getCompletionPercentage = (checklist) => {
    if (!checklist.tasks || checklist.tasks.length === 0) return 0;
    const completedTasks = checklist.tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / checklist.tasks.length) * 100);
  };

  const handleTaskToggle = (checklistId, taskId) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const updatedTasks = checklist.tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const updatedChecklist = {
      ...checklist,
      tasks: updatedTasks
    };

    onUpdateChecklist(jobId, checklistId, updatedChecklist);
  };

  const handleCompleteChecklist = (checklistId) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const allTasksCompleted = checklist.tasks.every(task => task.completed);
    if (!allTasksCompleted) {
      // Show alert that all tasks must be completed
      return;
    }

    onCompleteChecklist(jobId, checklistId);
  };

  const handleDeleteChecklist = (checklistId) => {
    onDeleteChecklist(jobId, checklistId);
  };

  // If we're editing a checklist, show the edit form
  if (selectedChecklist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClipboardList className="h-6 w-6 text-brandPrimary" />
            <h2 className="text-2xl font-bold text-gray-900">Edit Checklist</h2>
          </div>
          <Button
            onClick={() => setSelectedChecklist(null)}
            variant="outline"
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Button>
        </div>
        
        <CreateChecklistForm
          jobId={jobId}
          employees={employees}
          initialData={selectedChecklist}
          onSubmit={(jobId, checklistData) => {
            onUpdateChecklist(jobId, selectedChecklist.id, checklistData);
            setSelectedChecklist(null);
          }}
          onCancel={() => setSelectedChecklist(null)}
          onSaveAsTemplate={(templateData) => {
            onSaveChecklistTemplate(templateData);
            setSelectedChecklist(null);
          }}
        />
      </div>
    );
  }

  // Content that will be wrapped in Card or not based on noCard prop
  const content = (
    <>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center text-green-800">
          <ClipboardList className="h-5 w-5 mr-2" />
          <span className="text-lg font-semibold">Checklists</span>
          <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {checklists.length} total
          </span>
          {checklists.filter(c => c.completed).length > 0 && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {checklists.filter(c => c.completed).length} completed
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-100">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6 pt-4">
              {checklists.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No checklists created yet.</p>
                  <p className="text-gray-500 text-sm mt-1">Use the "Create Checklist" button above to add your first checklist.</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {checklists.map((checklist) => {
                    const completionPercentage = getCompletionPercentage(checklist);
                    const isCompleted = checklist.completed;
                    const allTasksCompleted = checklist.tasks.every(task => task.completed);

                    return (
                      <motion.div
                        key={checklist.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <Card className={`shadow-lg transition-all duration-200 hover:shadow-xl ${
                          isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                        }`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <CardTitle className="text-xl font-semibold text-gray-900">
                                    {checklist.name}
                                  </CardTitle>
                                  {isCompleted && (
                                    <Badge className="bg-green-100 text-green-800">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  )}
                                  {checklist.isTemplate && (
                                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Template
                                    </Badge>
                                  )}
                                </div>
                                
                                {checklist.description && (
                                  <p className="text-gray-600 mb-3">{checklist.description}</p>
                                )}

                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <User className="h-4 w-4" />
                                    <span>Assigned to: {getEmployeeName(checklist.assignedTo)}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Created: {format(new Date(checklist.createdAt), 'MMM dd, yyyy')}</span>
                                  </div>
                                  {checklist.completedAt && (
                                    <div className="flex items-center space-x-1">
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Completed: {format(new Date(checklist.completedAt), 'MMM dd, yyyy')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isCompleted && (
                                  <>
                                    <Button
                                      onClick={() => setSelectedChecklist(checklist)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      <Edit3 className="h-4 w-4" />
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
                                          <AlertDialogTitle>Delete Checklist</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{checklist.name}"? This action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteChecklist(checklist.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{completionPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    isCompleted ? 'bg-green-500' : 'bg-brandPrimary'
                                  }`}
                                  style={{ width: `${completionPercentage}%` }}
                                />
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent>
                            <div className="space-y-3">
                              {checklist.tasks.map((task, index) => (
                                <div
                                  key={task.id}
                                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                    task.completed 
                                      ? 'bg-green-50 border-green-200' 
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <Button
                                    onClick={() => handleTaskToggle(checklist.id, task.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="p-0 h-auto"
                                    disabled={isCompleted}
                                  >
                                    {task.completed ? (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                  </Button>
                                  <span
                                    className={`flex-1 text-sm ${
                                      task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                    }`}
                                  >
                                    {task.description}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {!isCompleted && allTasksCompleted && (
                              <div className="mt-6 pt-4 border-t border-gray-200">
                                <Button
                                  onClick={() => handleCompleteChecklist(checklist.id)}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckSquare className="h-4 w-4 mr-2" />
                                  Complete Checklist
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // Return with or without Card wrapper based on noCard prop
  if (noCard) {
    return (
      <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
        {content}
      </div>
    );
  }

  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader>
        {content}
      </CardHeader>
    </Card>
  );
};

export default ChecklistManager; 