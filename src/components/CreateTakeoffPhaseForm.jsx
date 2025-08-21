import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const CreateTakeoffPhaseForm = ({ jobId, onSubmit, onCancel }) => {
  const [phaseName, setPhaseName] = useState('');

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
              <Label htmlFor="phaseName" className="text-sm font-semibold text-gray-700">
                Phase Name *
              </Label>
              <Input
                id="phaseName"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="e.g., Main Build, Addition, Phase 1"
                className="border-2 focus:border-brandPrimary transition-colors"
              />
            </div>
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