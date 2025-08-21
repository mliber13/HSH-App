import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, CheckCircle, Circle, Clock, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ChecklistsSection = ({ job, employees, onCreateChecklist, onUpdateChecklist, onDeleteChecklist, onCompleteChecklist, onSaveChecklistTemplate, onGetChecklistTemplates, onDeleteChecklistTemplate }) => {
  const checklists = job.checklists || [];

  const getChecklistProgress = (checklist) => {
    if (!checklist.items || checklist.items.length === 0) return 0;
    const completedItems = checklist.items.filter(item => item.completed).length;
    return Math.round((completedItems / checklist.items.length) * 100);
  };

  const getChecklistStatus = (checklist) => {
    const progress = getChecklistProgress(checklist);
    if (progress === 0) return { text: 'Not Started', color: 'bg-gray-100 text-gray-800', icon: Circle };
    if (progress === 100) return { text: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    return { text: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-purple-700">
              <ClipboardList className="h-5 w-5 mr-2" />
              Checklists
              {checklists.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                  {checklists.length} checklist{checklists.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <Button
              onClick={onCreateChecklist}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Checklist
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {checklists.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No checklists yet</p>
              <p className="text-gray-500 text-sm mt-1">Create checklists to track tasks and ensure quality control</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checklists.map((checklist, index) => {
                const status = getChecklistStatus(checklist);
                const progress = getChecklistProgress(checklist);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={checklist.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                {checklist.name}
                              </h3>
                              <Badge className={status.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.text}
                              </Badge>
                            </div>
                            {checklist.description && (
                              <p className="text-gray-600 text-sm mt-1">{checklist.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Progress: {progress}%</span>
                              {checklist.items && (
                                <span>{checklist.items.filter(item => item.completed).length} of {checklist.items.length} items</span>
                              )}
                              {checklist.assignedTo && (
                                <span>Assigned to: {getEmployeeName(checklist.assignedTo)}</span>
                              )}
                              {checklist.dueDate && (
                                <span>Due: {new Date(checklist.dueDate).toLocaleDateString()}</span>
                              )}
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Checklist Items Preview */}
                            {checklist.items && checklist.items.length > 0 && (
                              <div className="mt-3 space-y-1">
                                {checklist.items.slice(0, 3).map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex items-center space-x-2 text-sm">
                                    {item.completed ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className={item.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
                                      {item.description}
                                    </span>
                                  </div>
                                ))}
                                {checklist.items.length > 3 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    +{checklist.items.length - 3} more items
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={() => onUpdateChecklist(checklist)}
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:bg-purple-50"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            {progress < 100 && (
                              <Button
                                onClick={() => onCompleteChecklist(checklist.id)}
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              onClick={() => onDeleteChecklist(checklist.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChecklistsSection;
