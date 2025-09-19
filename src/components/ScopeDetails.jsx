import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, Edit3, Save, X, Trash2, Plus, CheckCircle, Circle, User, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';

const ScopeDetails = ({ scope, jobId, onUpdateScope, onDeleteScope, employees = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskSpecifications, setNewTaskSpecifications] = useState('');
  const [newTaskTrade, setNewTaskTrade] = useState('');
  const [newTaskResponsible, setNewTaskResponsible] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskData, setEditingTaskData] = useState({
    text: '',
    specifications: '',
    trade: '',
    responsible: '',
    assignedTo: '',
    dueDate: ''
  });
  const [formData, setFormData] = useState({
    name: scope?.name || '',
    description: scope?.description || '',
    // Construction scope fields
    trade: scope?.trade || '',
    responsible: scope?.responsible || '',
    status: scope?.status || 'Not Started',
    // Hang scope specific fields
    ceilingThickness: scope?.ceilingThickness || '',
    wallThickness: scope?.wallThickness || '',
    hangExceptions: scope?.hangExceptions || '',
    // Finish scope specific fields
    ceilingFinish: scope?.ceilingFinish || '',
    ceilingFinishOther: scope?.ceilingFinishOther || '',
    ceilingExceptions: scope?.ceilingExceptions || '',
    wallFinish: scope?.wallFinish || '',
    wallFinishOther: scope?.wallFinishOther || '',
    wallExceptions: scope?.wallExceptions || ''
  });

  // Get tasks from scope or initialize empty array
  const tasks = scope?.tasks || [];

  // Task management functions
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddTask = () => {
    if (!newTaskText.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a task description.",
        variant: "destructive"
      });
      return;
    }

    const newTask = {
      id: generateId(),
      text: newTaskText.trim(),
      specifications: newTaskSpecifications.trim(),
      trade: newTaskTrade,
      responsible: newTaskResponsible,
      completed: false,
      assignedTo: '',
      dueDate: '',
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, newTask];
    onUpdateScope(scope.id, { tasks: updatedTasks });
    setNewTaskText('');
    setNewTaskSpecifications('');
    setNewTaskTrade('');
    setNewTaskResponsible('');
    setIsAddingTask(false);
    
    toast({
      title: "Task Added! ✅",
      description: "New task has been added to the scope."
    });
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    onUpdateScope(scope.id, { tasks: updatedTasks });
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    onUpdateScope(scope.id, { tasks: updatedTasks });
    
    toast({
      title: "Task Deleted",
      description: "Task has been removed from the scope."
    });
  };

  const handleUpdateTask = (taskId, updates) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    onUpdateScope(scope.id, { tasks: updatedTasks });
  };

  const getCompletionPercentage = () => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unassigned';
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskData({
      text: task.text,
      specifications: task.specifications || '',
      trade: task.trade || '',
      responsible: task.responsible || '',
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate || ''
    });
  };

  const handleSaveTaskEdit = () => {
    if (!editingTaskData.text.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a task description.",
        variant: "destructive"
      });
      return;
    }

    const updatedTasks = tasks.map(task =>
      task.id === editingTaskId 
        ? { 
            ...task, 
            text: editingTaskData.text,
            specifications: editingTaskData.specifications,
            trade: editingTaskData.trade,
            responsible: editingTaskData.responsible,
            assignedTo: editingTaskData.assignedTo,
            dueDate: editingTaskData.dueDate
          }
        : task
    );
    
    onUpdateScope(scope.id, { tasks: updatedTasks });
    setEditingTaskId(null);
    setEditingTaskData({
      text: '',
      specifications: '',
      trade: '',
      responsible: '',
      assignedTo: '',
      dueDate: ''
    });
    
    toast({
      title: "Task Updated! ✅",
      description: "Task has been successfully updated."
    });
  };

  const handleCancelTaskEdit = () => {
    setEditingTaskId(null);
    setEditingTaskData({
      text: '',
      specifications: '',
      trade: '',
      responsible: '',
      assignedTo: '',
      dueDate: ''
    });
  };

  if (!scope) {
    return (
      <div className="text-center py-16">
        <Hammer className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 font-medium">No scope selected or scope data is unavailable.</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a scope name.",
        variant: "destructive"
      });
      return;
    }

    onUpdateScope(scope.id, formData);
    setIsEditing(false);
    toast({
      title: "Scope Updated! ✅",
      description: "Scope of work has been updated successfully."
    });
  };

  const handleCancel = () => {
    setFormData({
      name: scope?.name || '',
      description: scope?.description || '',
      trade: scope?.trade || '',
      responsible: scope?.responsible || '',
      status: scope?.status || 'Not Started',
      ceilingThickness: scope?.ceilingThickness || '',
      wallThickness: scope?.wallThickness || '',
      hangExceptions: scope?.hangExceptions || '',
      ceilingFinish: scope?.ceilingFinish || '',
      ceilingFinishOther: scope?.ceilingFinishOther || '',
      ceilingExceptions: scope?.ceilingExceptions || '',
      wallFinish: scope?.wallFinish || '',
      wallFinishOther: scope?.wallFinishOther || '',
      wallExceptions: scope?.wallExceptions || ''
    });
    setIsEditing(false);
  };



  const isHangScope = () => {
    return formData.name.toLowerCase().includes('hang');
  };

  const isFinishScope = () => {
    return formData.name.toLowerCase().includes('finish');
  };

  const ceilingFinishOptions = [
    'Stomp Knockdown',
    'Knockdown', 
    'Splatter',
    'Splatter Knockdown',
    'Level 4 Smooth',
    'Level 5 Smooth',
    'Other'
  ];

  const wallFinishOptions = [
    'Level 4 Smooth',
    'Level 5 Smooth', 
    'Roll Texture Walls',
    'Other'
  ];

  const thicknessOptions = [
    '1/4"',
    '3/8"',
    '1/2"',
    '5/8"',
    '3/4"'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hammer className="h-6 w-6" />
              <CardTitle className="text-2xl font-bold">Scope Details</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Delete Scope "{scope?.name}"?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. Are you sure you want to delete this scope?
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDeleteScope(jobId, scope.id)} className="bg-red-600 hover:bg-red-700">
                              Yes, delete scope
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {isEditing ? (
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="scopeName" className="text-sm font-semibold text-gray-700">
                      Scope Name *
                    </Label>
                    <Input
                      id="scopeName"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter scope name"
                      className="border-2 focus:border-brandPrimary transition-colors"
                    />
                  </div>


                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    General Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter general scope description"
                    className="border-2 focus:border-brandPrimary transition-colors min-h-[80px]"
                  />
                </div>

                {/* Construction Scope Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Trade
                    </Label>
                    <Select
                      value={formData.trade}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, trade: value }))}
                    >
                      <SelectTrigger className="border-2 focus:border-brandPrimary">
                        <SelectValue placeholder="Select trade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Excavation">Excavation</SelectItem>
                        <SelectItem value="Concrete">Concrete</SelectItem>
                        <SelectItem value="Framing">Framing</SelectItem>
                        <SelectItem value="Roofing">Roofing</SelectItem>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                        <SelectItem value="HVAC">HVAC</SelectItem>
                        <SelectItem value="Insulation">Insulation</SelectItem>
                        <SelectItem value="Drywall">Drywall</SelectItem>
                        <SelectItem value="Painting">Painting</SelectItem>
                        <SelectItem value="Flooring">Flooring</SelectItem>
                        <SelectItem value="Kitchen/Bath">Kitchen/Bath</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Responsible Party
                    </Label>
                    <Select
                      value={formData.responsible}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, responsible: value }))}
                    >
                      <SelectTrigger className="border-2 focus:border-brandPrimary">
                        <SelectValue placeholder="Select responsible party" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In-House">In-House</SelectItem>
                        <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                        <SelectItem value="Client">Client</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="border-2 focus:border-brandPrimary">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Hang Scope Specific Fields */}
              {isHangScope() && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 text-brandSecondary">Hang Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Ceiling Thickness
                      </Label>
                      <Select
                        value={formData.ceilingThickness}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, ceilingThickness: value }))}
                      >
                        <SelectTrigger className="border-2 focus:border-brandSecondary">
                          <SelectValue placeholder="Select ceiling thickness" />
                        </SelectTrigger>
                        <SelectContent>
                          {thicknessOptions.map(thickness => (
                            <SelectItem key={thickness} value={thickness}>{thickness}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Wall Thickness
                      </Label>
                      <Select
                        value={formData.wallThickness}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, wallThickness: value }))}
                      >
                        <SelectTrigger className="border-2 focus:border-brandSecondary">
                          <SelectValue placeholder="Select wall thickness" />
                        </SelectTrigger>
                        <SelectContent>
                          {thicknessOptions.map(thickness => (
                            <SelectItem key={thickness} value={thickness}>{thickness}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hangExceptions" className="text-sm font-semibold text-gray-700">
                      Exceptions & Special Requirements
                    </Label>
                    <Textarea
                      id="hangExceptions"
                      value={formData.hangExceptions}
                      onChange={(e) => setFormData(prev => ({ ...prev, hangExceptions: e.target.value }))}
                      placeholder="e.g., 5/8&quot; at garage firewall, moisture resistant drywall at wet walls, etc."
                      className="border-2 focus:border-brandSecondary transition-colors min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {/* Finish Scope Specific Fields */}
              {isFinishScope() && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 text-brandPrimary">Finish Specifications</h3>
                  
                  {/* Ceiling Finish */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Ceiling Finish</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Primary Ceiling Finish
                        </Label>
                        <Select
                          value={formData.ceilingFinish}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, ceilingFinish: value }))}
                        >
                          <SelectTrigger className="border-2 focus:border-brandPrimary">
                            <SelectValue placeholder="Select ceiling finish" />
                          </SelectTrigger>
                          <SelectContent>
                            {ceilingFinishOptions.map(finish => (
                              <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.ceilingFinish === 'Other' && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
                            Specify Other Ceiling Finish
                          </Label>
                          <Input
                            value={formData.ceilingFinishOther}
                            onChange={(e) => setFormData(prev => ({ ...prev, ceilingFinishOther: e.target.value }))}
                            placeholder="Enter custom ceiling finish"
                            className="border-2 focus:border-brandPrimary"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ceilingExceptions" className="text-sm font-semibold text-gray-700">
                        Ceiling Finish Exceptions
                      </Label>
                      <Textarea
                        id="ceilingExceptions"
                        value={formData.ceilingExceptions}
                        onChange={(e) => setFormData(prev => ({ ...prev, ceilingExceptions: e.target.value }))}
                        placeholder="e.g., Master Bedroom and Great Room are Level 5 Smooth instead of Stomp Knockdown"
                        className="border-2 focus:border-brandPrimary transition-colors min-h-[80px]"
                      />
                    </div>
                  </div>

                  {/* Wall Finish */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-700">Wall Finish</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Primary Wall Finish
                        </Label>
                        <Select
                          value={formData.wallFinish}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, wallFinish: value }))}
                        >
                          <SelectTrigger className="border-2 focus:border-brandPrimary">
                            <SelectValue placeholder="Select wall finish" />
                          </SelectTrigger>
                          <SelectContent>
                            {wallFinishOptions.map(finish => (
                              <SelectItem key={finish} value={finish}>{finish}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.wallFinish === 'Other' && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">
                            Specify Other Wall Finish
                          </Label>
                          <Input
                            value={formData.wallFinishOther}
                            onChange={(e) => setFormData(prev => ({ ...prev, wallFinishOther: e.target.value }))}
                            placeholder="Enter custom wall finish"
                            className="border-2 focus:border-brandPrimary"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wallExceptions" className="text-sm font-semibold text-gray-700">
                        Wall Finish Exceptions
                      </Label>
                      <Textarea
                        id="wallExceptions"
                        value={formData.wallExceptions}
                        onChange={(e) => setFormData(prev => ({ ...prev, wallExceptions: e.target.value }))}
                        placeholder="e.g., Garage walls and small closet walls are Roll Texture instead of Level 4 Smooth"
                        className="border-2 focus:border-brandPrimary transition-colors min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-6">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold py-3"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 border-2 hover:bg-gray-50 font-semibold py-3"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{scope?.name}</h2>
              </div>

              {/* Basic Information Display */}
              <div className="space-y-4">
                {scope?.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">General Description</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-l-brandPrimary">
                      <p className="text-gray-800">{scope.description}</p>
                    </div>
                  </div>
                )}

                {/* Construction Scope Information */}
                {(scope?.trade || scope?.responsible || scope?.status) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Construction Details</h3>
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-l-blue-500">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {scope?.trade && (
                          <div>
                            <p className="font-semibold text-blue-700">Trade:</p>
                            <p className="text-gray-800">{scope.trade}</p>
                          </div>
                        )}
                        {scope?.responsible && (
                          <div>
                            <p className="font-semibold text-blue-700">Responsible Party:</p>
                            <p className="text-gray-800">{scope.responsible}</p>
                          </div>
                        )}
                        {scope?.status && (
                          <div>
                            <p className="font-semibold text-blue-700">Status:</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              scope.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              scope.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              scope.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                              scope.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {scope.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hang Scope Display */}
                {isHangScope() && (scope?.ceilingThickness || scope?.wallThickness || scope?.hangExceptions) && (
                  <div>
                    <h3 className="text-lg font-semibold text-brandSecondary mb-3">Hang Specifications</h3>
                    <div className="bg-brandSecondary/10 rounded-lg p-4 border-l-4 border-l-brandSecondary space-y-3">
                      {(scope?.ceilingThickness || scope?.wallThickness) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {scope?.ceilingThickness && (
                            <div>
                              <p className="font-semibold text-brandSecondary">Ceiling Thickness:</p>
                              <p className="text-gray-700">{scope.ceilingThickness}</p>
                            </div>
                          )}
                          {scope?.wallThickness && (
                            <div>
                              <p className="font-semibold text-brandSecondary">Wall Thickness:</p>
                              <p className="text-gray-700">{scope.wallThickness}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {scope?.hangExceptions && (
                        <div>
                          <p className="font-semibold text-brandSecondary">Exceptions & Special Requirements:</p>
                          <p className="text-gray-700">{scope.hangExceptions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Finish Scope Display */}
                {isFinishScope() && (scope?.ceilingFinish || scope?.wallFinish || scope?.ceilingExceptions || scope?.wallExceptions) && (
                  <div>
                    <h3 className="text-lg font-semibold text-brandPrimary mb-3">Finish Specifications</h3>
                    <div className="bg-brandPrimary/10 rounded-lg p-4 border-l-4 border-l-brandPrimary space-y-4">
                      {(scope?.ceilingFinish || scope?.ceilingExceptions) && (
                        <div>
                          <h4 className="font-semibold text-brandPrimary mb-2">Ceiling Finish</h4>
                          {scope?.ceilingFinish && (
                            <p className="text-gray-700 mb-2">
                              <span className="font-medium">Primary:</span> {scope.ceilingFinish === 'Other' ? scope.ceilingFinishOther : scope.ceilingFinish}
                            </p>
                          )}
                          {scope?.ceilingExceptions && (
                            <p className="text-gray-700">
                              <span className="font-medium">Exceptions:</span> {scope.ceilingExceptions}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {(scope?.wallFinish || scope?.wallExceptions) && (
                        <div>
                          <h4 className="font-semibold text-brandPrimary mb-2">Wall Finish</h4>
                          {scope?.wallFinish && (
                            <p className="text-gray-700 mb-2">
                              <span className="font-medium">Primary:</span> {scope.wallFinish === 'Other' ? scope.wallFinishOther : scope.wallFinish}
                            </p>
                          )}
                          {scope?.wallExceptions && (
                            <p className="text-gray-700">
                              <span className="font-medium">Exceptions:</span> {scope.wallExceptions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Checklist Section */}
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-brandPrimary" />
                      <h3 className="text-lg font-semibold text-gray-900">Tasks & Checklist</h3>
                      {tasks.length > 0 && (
                        <span className="bg-brandPrimary/10 text-brandPrimary px-2 py-1 rounded-full text-sm font-medium">
                          {getCompletionPercentage()}% Complete
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={() => setIsAddingTask(true)}
                      size="sm"
                      className="bg-brandPrimary hover:bg-brandPrimary/90 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>

                  {/* Add Task Form */}
                  {isAddingTask && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="taskText" className="text-sm font-medium text-gray-700">
                            Task Description
                          </Label>
                          <Input
                            id="taskText"
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            placeholder="Enter task description..."
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="taskSpecifications" className="text-sm font-medium text-gray-700">
                            Specifications (Optional)
                          </Label>
                          <Textarea
                            id="taskSpecifications"
                            value={newTaskSpecifications}
                            onChange={(e) => setNewTaskSpecifications(e.target.value)}
                            placeholder="Enter detailed specifications..."
                            className="mt-1 min-h-[60px]"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="taskTrade" className="text-sm font-medium text-gray-700">
                              Trade (Optional)
                            </Label>
                            <Select
                              value={newTaskTrade}
                              onValueChange={setNewTaskTrade}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select Trade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Excavation">Excavation</SelectItem>
                                <SelectItem value="Concrete">Concrete</SelectItem>
                                <SelectItem value="Framing">Framing</SelectItem>
                                <SelectItem value="Roofing">Roofing</SelectItem>
                                <SelectItem value="Plumbing">Plumbing</SelectItem>
                                <SelectItem value="Electrical">Electrical</SelectItem>
                                <SelectItem value="HVAC">HVAC</SelectItem>
                                <SelectItem value="Insulation">Insulation</SelectItem>
                                <SelectItem value="Drywall">Drywall</SelectItem>
                                <SelectItem value="Flooring">Flooring</SelectItem>
                                <SelectItem value="Painting">Painting</SelectItem>
                                <SelectItem value="Kitchen/Bath">Kitchen/Bath</SelectItem>
                                <SelectItem value="Management">Management</SelectItem>
                                <SelectItem value="General Labor">General Labor</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="taskResponsible" className="text-sm font-medium text-gray-700">
                              Responsible (Optional)
                            </Label>
                            <Select
                              value={newTaskResponsible}
                              onValueChange={setNewTaskResponsible}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select Responsible" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="In-House">In-House</SelectItem>
                                <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                                <SelectItem value="In-House Management">In-House Management</SelectItem>
                                <SelectItem value="Client">Client</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={handleAddTask}
                            size="sm"
                            className="bg-brandPrimary hover:bg-brandPrimary/90 text-white"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Task
                          </Button>
                          <Button
                            onClick={() => {
                              setIsAddingTask(false);
                              setNewTaskText('');
                              setNewTaskSpecifications('');
                              setNewTaskTrade('');
                              setNewTaskResponsible('');
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Tasks List */}
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Circle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No tasks yet</p>
                      <p className="text-sm">Add tasks to track progress for this scope</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg border transition-all ${
                            task.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {editingTaskId === task.id ? (
                            /* Edit Task Form */
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => handleToggleTask(task.id)}
                                  className={`flex-shrink-0 p-1 rounded-full transition-colors ${
                                    task.completed 
                                      ? 'text-green-600 hover:text-green-700' 
                                      : 'text-gray-400 hover:text-gray-600'
                                  }`}
                                >
                                  {task.completed ? (
                                    <CheckCircle className="h-5 w-5" />
                                  ) : (
                                    <Circle className="h-5 w-5" />
                                  )}
                                </button>
                                <div className="flex-1">
                                  <Input
                                    value={editingTaskData.text}
                                    onChange={(e) => setEditingTaskData(prev => ({ ...prev, text: e.target.value }))}
                                    placeholder="Task description..."
                                    className="text-sm font-medium"
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-gray-700">Specifications</Label>
                                <Textarea
                                  value={editingTaskData.specifications}
                                  onChange={(e) => setEditingTaskData(prev => ({ ...prev, specifications: e.target.value }))}
                                  placeholder="Detailed specifications..."
                                  className="text-xs min-h-[60px]"
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs font-medium text-gray-700">Trade</Label>
                                  <Select
                                    value={editingTaskData.trade}
                                    onValueChange={(value) => setEditingTaskData(prev => ({ ...prev, trade: value }))}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Select Trade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Excavation">Excavation</SelectItem>
                                      <SelectItem value="Concrete">Concrete</SelectItem>
                                      <SelectItem value="Framing">Framing</SelectItem>
                                      <SelectItem value="Roofing">Roofing</SelectItem>
                                      <SelectItem value="Plumbing">Plumbing</SelectItem>
                                      <SelectItem value="Electrical">Electrical</SelectItem>
                                      <SelectItem value="HVAC">HVAC</SelectItem>
                                      <SelectItem value="Insulation">Insulation</SelectItem>
                                      <SelectItem value="Drywall">Drywall</SelectItem>
                                      <SelectItem value="Flooring">Flooring</SelectItem>
                                      <SelectItem value="Painting">Painting</SelectItem>
                                      <SelectItem value="Kitchen/Bath">Kitchen/Bath</SelectItem>
                                      <SelectItem value="Management">Management</SelectItem>
                                      <SelectItem value="General Labor">General Labor</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <Label className="text-xs font-medium text-gray-700">Responsible</Label>
                                  <Select
                                    value={editingTaskData.responsible}
                                    onValueChange={(value) => setEditingTaskData(prev => ({ ...prev, responsible: value }))}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Select Responsible" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="In-House">In-House</SelectItem>
                                      <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                                      <SelectItem value="In-House Management">In-House Management</SelectItem>
                                      <SelectItem value="Client">Client</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={handleSaveTaskEdit}
                                  size="sm"
                                  className="bg-brandPrimary hover:bg-brandPrimary/90 text-white"
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  onClick={handleCancelTaskEdit}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            /* Regular Task Display */
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleToggleTask(task.id)}
                                className={`flex-shrink-0 p-1 rounded-full transition-colors ${
                                  task.completed 
                                    ? 'text-green-600 hover:text-green-700' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                              >
                                {task.completed ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                              </button>
                              
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  task.completed ? 'text-green-800 line-through' : 'text-gray-900'
                                }`}>
                                  {task.text}
                                </p>
                                
                                {/* Specifications */}
                                {task.specifications && (
                                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                    <div className="flex items-center space-x-1 mb-1">
                                      <FileText className="h-3 w-3 text-blue-600" />
                                      <span className="font-medium text-blue-800">Specifications:</span>
                                    </div>
                                    <p className="text-blue-700 leading-relaxed">{task.specifications}</p>
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  {task.trade && (
                                    <div className="flex items-center space-x-1">
                                      <Hammer className="h-3 w-3" />
                                      <span className="font-medium">{task.trade}</span>
                                    </div>
                                  )}
                                  {task.responsible && (
                                    <div className="flex items-center space-x-1">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        task.responsible === 'In-House' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {task.responsible}
                                      </span>
                                    </div>
                                  )}
                                  {task.assignedTo && (
                                    <div className="flex items-center space-x-1">
                                      <User className="h-3 w-3" />
                                      <span>{getEmployeeName(task.assignedTo)}</span>
                                    </div>
                                  )}
                                  {task.dueDate && (
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Button
                                  onClick={() => handleEditTask(task)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-500 hover:bg-blue-100"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-500 hover:bg-red-100"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Task?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this task? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete Task
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4">
                  <div className="bg-brandSecondary/10 rounded-lg p-4 text-center">
                    <p className="text-brandSecondary font-semibold text-sm">Created</p>
                    <p className="text-gray-800 font-bold">
                      {scope?.createdAt ? new Date(scope.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ScopeDetails;