import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Briefcase, FileText, Plus, Check, X, Building, Edit, Trash2, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/services/scheduleTemplateService';

const TemplateManagementModal = ({ isOpen, onClose, onTemplatesUpdated }) => {
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    jobType: 'residential',
    estimatedDuration: 1,
    phases: []
  });
  const [editingPhase, setEditingPhase] = useState(null);
  const [phaseData, setPhaseData] = useState({
    name: '',
    description: '',
    duration: 1,
    tasks: []
  });
  const [editingTask, setEditingTask] = useState(null);
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    priority: 'medium'
  });

  // Load templates when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadedTemplates = getTemplates();
      setTemplates(loadedTemplates);
    }
  }, [isOpen]);

  const handleCreateTemplate = () => {
    if (!templateData.name || !templateData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in template name and description.",
        variant: "destructive"
      });
      return;
    }

    if (templateData.phases.length === 0) {
      toast({
        title: "No Phases",
        description: "Please add at least one phase to the template.",
        variant: "destructive"
      });
      return;
    }

    const newTemplate = createTemplate(templateData);
    setTemplates([...templates, newTemplate]);
    setTemplateData({
      name: '',
      description: '',
      jobType: 'residential',
      estimatedDuration: 1,
      phases: []
    });
    setShowCreateForm(false);
    onTemplatesUpdated?.();

    toast({
      title: "Template Created",
      description: `Template "${newTemplate.name}" has been created successfully.`,
    });
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    if (!templateData.name || !templateData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in template name and description.",
        variant: "destructive"
      });
      return;
    }

    const updatedTemplate = updateTemplate(editingTemplate.id, templateData);
    if (updatedTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
      setEditingTemplate(null);
      setTemplateData({
        name: '',
        description: '',
        jobType: 'residential',
        estimatedDuration: 1,
        phases: []
      });
      onTemplatesUpdated?.();

      toast({
        title: "Template Updated",
        description: `Template "${updatedTemplate.name}" has been updated successfully.`,
      });
    }
  };

  const handleDeleteTemplate = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    deleteTemplate(templateId);
    setTemplates(templates.filter(t => t.id !== templateId));
    onTemplatesUpdated?.();

    toast({
      title: "Template Deleted",
      description: `Template "${template?.name}" has been deleted.`,
    });
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateData({
      name: template.name,
      description: template.description,
      jobType: template.jobType,
      estimatedDuration: template.estimatedDuration,
      phases: [...template.phases]
    });
    setShowCreateForm(true);
  };

  const addPhase = () => {
    if (!phaseData.name) {
      toast({
        title: "Missing Phase Name",
        description: "Please enter a phase name.",
        variant: "destructive"
      });
      return;
    }

    const newPhase = {
      id: `phase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: phaseData.name,
      description: phaseData.description,
      duration: parseInt(phaseData.duration),
      tasks: phaseData.tasks
    };

    setTemplateData({
      ...templateData,
      phases: [...templateData.phases, newPhase],
      estimatedDuration: templateData.estimatedDuration + newPhase.duration
    });

    setPhaseData({
      name: '',
      description: '',
      duration: 1,
      tasks: []
    });
  };

  const removePhase = (phaseId) => {
    const phase = templateData.phases.find(p => p.id === phaseId);
    setTemplateData({
      ...templateData,
      phases: templateData.phases.filter(p => p.id !== phaseId),
      estimatedDuration: templateData.estimatedDuration - (phase?.duration || 0)
    });
  };

  const addTask = () => {
    if (!taskData.name) {
      toast({
        title: "Missing Task Name",
        description: "Please enter a task name.",
        variant: "destructive"
      });
      return;
    }

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: taskData.name,
      description: taskData.description,
      priority: taskData.priority
    };

    setPhaseData({
      ...phaseData,
      tasks: [...phaseData.tasks, newTask]
    });

    setTaskData({
      name: '',
      description: '',
      priority: 'medium'
    });
  };

  const removeTask = (taskId) => {
    setPhaseData({
      ...phaseData,
      tasks: phaseData.tasks.filter(t => t.id !== taskId)
    });
  };

  const getJobTypeIcon = (jobType) => {
    switch (jobType) {
      case 'residential':
        return <Briefcase className="h-4 w-4" />;
      case 'commercial':
        return <Building className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case 'residential':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'commercial':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-3 w-3" />;
      case 'medium':
        return <Clock className="h-3 w-3" />;
      case 'low':
        return <Check className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Manage Schedule Templates
            </div>
            <Button
              onClick={() => {
                setShowCreateForm(true);
                setEditingTemplate(null);
                setTemplateData({
                  name: '',
                  description: '',
                  jobType: 'residential',
                  estimatedDuration: 1,
                  phases: []
                });
              }}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!showCreateForm ? (
            /* Template List */
            <div>
              <Label className="text-sm font-medium">Existing Templates</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getJobTypeIcon(template.jobType)}
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                            className="text-brandSecondary hover:bg-brandSecondary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{template.name}"? This action cannot be undone.
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
                      <Badge className={`w-fit ${getJobTypeColor(template.jobType)}`}>
                        {template.jobType}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{template.estimatedDuration} days</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4" />
                          <span>{template.phases.length} phases</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {template.phases.slice(0, 3).map(phase => (
                          <div key={phase.id} className="text-xs text-gray-500 flex items-center space-x-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span>{phase.name} ({phase.duration} day{phase.duration !== 1 ? 's' : ''})</span>
                          </div>
                        ))}
                        {template.phases.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{template.phases.length - 3} more phases
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            /* Template Creation/Edit Form */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={templateData.name}
                    onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                    placeholder="e.g., Standard Residential Drywall"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-type">Job Type</Label>
                  <Select value={templateData.jobType} onValueChange={(value) => setTemplateData({...templateData, jobType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4" />
                          <span>Residential</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="commercial">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4" />
                          <span>Commercial</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="template-description">Description *</Label>
                  <Textarea
                    id="template-description"
                    value={templateData.description}
                    onChange={(e) => setTemplateData({...templateData, description: e.target.value})}
                    placeholder="Describe what this template is for..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Phases Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Phases</h3>
                  <Button onClick={() => setEditingPhase('new')} className="bg-brandPrimary hover:bg-brandPrimary/90 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Phase
                  </Button>
                </div>

                {/* Phase List */}
                {templateData.phases.length > 0 && (
                  <div className="space-y-3">
                    {templateData.phases.map((phase, index) => (
                      <Card key={phase.id} className="border-l-4 border-l-brandPrimary">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">Phase {index + 1}: {phase.name}</h4>
                              <p className="text-sm text-gray-600">{phase.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{phase.duration} days</span>
                              </Badge>
                              <Button variant="ghost" size="sm" onClick={() => removePhase(phase.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {phase.tasks.length > 0 && (
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {phase.tasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div>
                                    <span className="font-medium text-sm">{task.name}</span>
                                    {task.description && (
                                      <p className="text-xs text-gray-500">{task.description}</p>
                                    )}
                                  </div>
                                  <Badge className={getPriorityColor(task.priority)}>
                                    {getPriorityIcon(task.priority)}
                                    <span className="ml-1 capitalize">{task.priority}</span>
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                )}

                {/* Add Phase Form */}
                {editingPhase && (
                  <Card className="border-2 border-brandPrimary/20 bg-brandPrimary/5">
                    <CardHeader>
                      <h4 className="font-semibold">Add New Phase</h4>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phase-name">Phase Name *</Label>
                          <Input
                            id="phase-name"
                            value={phaseData.name}
                            onChange={(e) => setPhaseData({...phaseData, name: e.target.value})}
                            placeholder="e.g., Preparation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phase-duration">Duration (days)</Label>
                          <Input
                            id="phase-duration"
                            type="number"
                            min="1"
                            value={phaseData.duration}
                            onChange={(e) => setPhaseData({...phaseData, duration: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="phase-description">Description</Label>
                          <Textarea
                            id="phase-description"
                            value={phaseData.description}
                            onChange={(e) => setPhaseData({...phaseData, description: e.target.value})}
                            placeholder="Describe what this phase involves..."
                            rows={2}
                          />
                        </div>
                      </div>

                      {/* Tasks Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Tasks</h5>
                          <Button onClick={addTask} size="sm" className="bg-brandPrimary hover:bg-brandPrimary/90 text-white">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Task
                          </Button>
                        </div>

                        {/* Task List */}
                        {phaseData.tasks.length > 0 && (
                          <div className="space-y-2">
                            {phaseData.tasks.map((task) => (
                              <div key={task.id} className="flex items-center justify-between p-2 bg-white border rounded">
                                <div>
                                  <span className="font-medium text-sm">{task.name}</span>
                                  {task.description && (
                                    <p className="text-xs text-gray-500">{task.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getPriorityColor(task.priority)}>
                                    {getPriorityIcon(task.priority)}
                                    <span className="ml-1 capitalize">{task.priority}</span>
                                  </Badge>
                                  <Button variant="ghost" size="sm" onClick={() => removeTask(task.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Task Form */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-white">
                          <div className="space-y-2">
                            <Label htmlFor="task-name">Task Name *</Label>
                            <Input
                              id="task-name"
                              value={taskData.name}
                              onChange={(e) => setTaskData({...taskData, name: e.target.value})}
                              placeholder="e.g., Site inspection"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="task-priority">Priority</Label>
                            <Select value={taskData.priority} onValueChange={(value) => setTaskData({...taskData, priority: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="task-description">Description</Label>
                            <Input
                              id="task-description"
                              value={taskData.description}
                              onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                              placeholder="Brief description"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setEditingPhase(null)}>
                          Cancel
                        </Button>
                        <Button onClick={addPhase} className="bg-brandPrimary hover:bg-brandPrimary/90 text-white">
                          <Save className="h-4 w-4 mr-2" />
                          Add Phase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Template Summary */}
              {templateData.phases.length > 0 && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800">Template Summary</h4>
                        <p className="text-sm text-green-600">
                          {templateData.phases.length} phases • {templateData.estimatedDuration} total days
                        </p>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        Ready to Save
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {showCreateForm && (
            <Button 
              onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
              disabled={templateData.phases.length === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateManagementModal;
