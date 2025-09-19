import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Save, X, Home, Building, Hammer, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const CreateTakeoffPhaseForm = ({ jobId, onSubmit, onCancel }) => {
  const [phaseName, setPhaseName] = useState('');
  const [phaseType, setPhaseType] = useState('custom');

  // Construction phase templates
  const constructionPhases = [
    { value: 'foundation', label: 'Foundation', icon: Building, description: 'Foundation work, concrete, excavation' },
    { value: 'framing', label: 'Framing', icon: Hammer, description: 'Structural framing, walls, roof' },
    { value: 'drywall', label: 'Drywall', icon: Layers, description: 'Drywall installation and finishing' },
    { value: 'finishing', label: 'Finishing', icon: Wrench, description: 'Final finishes, trim, paint' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phaseName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a phase name.",
        variant: "destructive"
      });
      return;
    }
    onSubmit(jobId, { name: phaseName });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto"
    >
      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Layers className="h-6 w-6" />
            <CardTitle className="text-2xl font-bold">New Takeoff Phase</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">
                Phase Type
              </Label>
              <Select
                value={phaseType}
                onValueChange={(value) => {
                  setPhaseType(value);
                  if (value !== 'custom') {
                    const selectedPhase = constructionPhases.find(p => p.value === value);
                    if (selectedPhase) {
                      setPhaseName(selectedPhase.label);
                    }
                  } else {
                    setPhaseName('');
                  }
                }}
              >
                <SelectTrigger className="border-2 focus:border-brandPrimary">
                  <SelectValue placeholder="Select phase type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">
                    <div className="flex items-center space-x-2">
                      <Layers className="h-4 w-4" />
                      <span>Custom Phase</span>
                    </div>
                  </SelectItem>
                  {constructionPhases.map(phase => (
                    <SelectItem key={phase.value} value={phase.value}>
                      <div className="flex items-center space-x-2">
                        <phase.icon className="h-4 w-4" />
                        <span>{phase.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phaseName" className="text-sm font-semibold text-gray-700">
                Phase Name *
              </Label>
              <Input
                id="phaseName"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder={phaseType === 'custom' ? "e.g., Main Build, Addition, Phase 1" : "Phase name will be set automatically"}
                disabled={phaseType !== 'custom'}
                className="border-2 focus:border-brandPrimary transition-colors"
              />
            </div>

            {phaseType !== 'custom' && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-1">
                  {(() => {
                    const selectedPhase = constructionPhases.find(p => p.value === phaseType);
                    return selectedPhase ? <selectedPhase.icon className="h-4 w-4 text-blue-600" /> : null;
                  })()}
                  <span className="text-sm font-medium text-blue-800">Construction Phase</span>
                </div>
                <p className="text-xs text-blue-600">
                  {(() => {
                    const selectedPhase = constructionPhases.find(p => p.value === phaseType);
                    return selectedPhase ? selectedPhase.description : '';
                  })()}
                </p>
              </div>
            )}
            <div className="flex space-x-4 pt-6">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white font-semibold py-3"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Phase
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-2 hover:bg-gray-50 font-semibold py-3"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CreateTakeoffPhaseForm;