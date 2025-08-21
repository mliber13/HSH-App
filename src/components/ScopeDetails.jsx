import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, Edit3, Save, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ScopeDetails = ({ scope, jobId, onUpdateScope, onDeleteScope }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: scope?.name || '',
    description: scope?.description || '',
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