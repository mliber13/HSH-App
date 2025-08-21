import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calculator, CheckCircle, AlertTriangle } from 'lucide-react';

import { useJobs } from '@/hooks/useJobs';
import { toast } from '@/components/ui/use-toast';

const PieceRateCompletion = ({ 
  selectedEmployee, 
  selectedJob, 
  employees, 
  onStateChange,
  getAvailableCoats,
  getRemainingCoatPercentage,
  getJobPieceRateProgress,
  completePieceRateEntry,
  getEmployeeActivePieceRateEntry
}) => {
  const [selectedCoat, setSelectedCoat] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState('');
  const [notes, setNotes] = useState('');
  const [apprenticeId, setApprenticeId] = useState('none');
  const [apprenticeHours, setApprenticeHours] = useState('');
  const [apprenticeCost, setApprenticeCost] = useState('');
  const [calculatedEarnings, setCalculatedEarnings] = useState(0);


  
  const { jobs } = useJobs();

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);
  const selectedJobData = jobs.find(job => job.id === selectedJob);
  const activePieceRateEntry = getEmployeeActivePieceRateEntry(selectedEmployee);

  // Auto-populate the coat from the active piece rate entry
  useEffect(() => {
    if (activePieceRateEntry?.coat) {
      setSelectedCoat(activePieceRateEntry.coat);
    }
  }, [activePieceRateEntry]);

  // Auto-calculate assistant cost when assistant or hours change
  useEffect(() => {
    if (apprenticeId && apprenticeId !== 'none' && apprenticeHours) {
      const helper = employees.find(emp => emp.id === apprenticeId);
      if (helper) {
        const helperHours = parseFloat(apprenticeHours) || 0;
        const helperRate = parseFloat(helper.hourlyRate) || 0;
        const calculatedCost = helperHours * helperRate;
        setApprenticeCost(calculatedCost.toFixed(2));
      }
    } else {
      // Clear the cost if no assistant is selected or no hours entered
      setApprenticeCost('');
    }
  }, [apprenticeId, apprenticeHours, employees]);

  // Get available coats for finishers
  const availableCoats = selectedEmployeeData?.role === 'Finisher' 
    ? getAvailableCoats(selectedJob, selectedEmployee, jobs)
    : [];

  // Get potential apprentices (employees who are not the selected employee and could assist)
  const apprentices = employees.filter(emp => 
    emp.id !== selectedEmployee && emp.isActive && 
    (emp.role === 'Laborer' || emp.role === 'Hanger' || emp.role === 'Finisher')
  );

  // Get piece rate info for selected job and employee
  const pieceRateInfo = useMemo(() => {
    if (!selectedJob || !selectedEmployeeData || selectedEmployeeData.role === 'Laborer') {
      return null;
    }

    const selectedJobData = jobs.find(j => j.id === selectedJob);
    if (!selectedJobData?.financials?.fieldRevised) {
      return { rate: 0, sqft: 0, available: false, totalCoats: 0 };
    }

    const fieldRevised = selectedJobData.financials.fieldRevised;
    let rate = 0;

    if (selectedEmployeeData.role === 'Hanger') {
      rate = fieldRevised.hangerRate || 0;
    } else if (selectedEmployeeData.role === 'Finisher') {
      rate = fieldRevised.finisherRate || 0;
    }

    // Get ACTUAL square footage from field revised financials (calculated from takeoffs)
    const actualSqft = selectedJobData?.financials?.fieldRevised?.sqft || 0;

    // Determine number of coats based on finish specifications (only for finishers)
    let totalCoats = 1; // Hangers only have 1 "coat" (hanging)
    if (selectedEmployeeData.role === 'Finisher') {
      totalCoats = 4; // Default for Level 4
      const finishScope = selectedJobData.scopes?.find(scope => scope.name.toLowerCase().includes('finish'));
      
      if (finishScope) {
        const ceilingFinish = finishScope.ceilingFinish || '';
        const wallFinish = finishScope.wallFinish || '';
        
        if (ceilingFinish.includes('Level 5') || wallFinish.includes('Level 5')) {
          totalCoats = 5;
        } else if (ceilingFinish.includes('Stomp') || ceilingFinish.includes('Knockdown') || 
                   ceilingFinish.includes('Splatter') || ceilingFinish.includes('Texture')) {
          totalCoats = 5;
        }
      }
    }

    return {
      rate,
      sqft: actualSqft,
      available: rate > 0 && actualSqft > 0,
      totalCoats
    };
  }, [selectedJob, selectedEmployeeData, jobs]);

  // Calculate earnings when completion percentage changes
  useEffect(() => {
    if (completionPercentage && pieceRateInfo?.available && selectedJobData) {
      const completion = parseFloat(completionPercentage) || 0;
      const rate = pieceRateInfo.rate;
      const actualSqft = pieceRateInfo.sqft;
      
      let grossEarnings = 0;

      if (selectedEmployeeData?.role === 'Hanger') {
        // For hangers: Total job value * (today's completion % / 100)
        const totalJobValue = rate * actualSqft;
        const currentProgress = getJobPieceRateProgress(selectedJob, selectedEmployee, 'hang');
        const todayCompletionPercent = completion - currentProgress; // How much they did today
        grossEarnings = totalJobValue * (todayCompletionPercent / 100);
      } else {
        // For finishers: Calculate based on coat value
        const coatValue = (rate * actualSqft) / pieceRateInfo.totalCoats;
        grossEarnings = coatValue * (completion / 100);
      }

      // Calculate helper earnings if a helper is selected
      let helperEarnings = 0;
      if (apprenticeId && apprenticeId !== 'none') {
        const helper = employees.find(emp => emp.id === apprenticeId);
        if (helper) {
          const helperHours = parseFloat(apprenticeHours) || 0;
          const helperRate = parseFloat(helper.hourlyRate) || 0;
          helperEarnings = helperHours * helperRate;
        }
      } else {
        // Use manually entered cost if no helper is selected
        helperEarnings = parseFloat(apprenticeCost) || 0;
      }
      
      const netEarnings = grossEarnings - helperEarnings;
      setCalculatedEarnings(netEarnings);
    } else {
      setCalculatedEarnings(0);
    }
  }, [completionPercentage, pieceRateInfo, selectedJobData, selectedEmployeeData, selectedEmployee, selectedJob, getJobPieceRateProgress, apprenticeCost, apprenticeId, apprenticeHours, employees]);

  const handleCompletePieceRate = () => {
    if (!activePieceRateEntry) {
      toast({
        title: "No Active Piece Rate Entry",
        description: "Please punch in for piece rate work first.",
        variant: "destructive"
      });
      return;
    }

    if (!completionPercentage) {
      toast({
        title: "Missing Information",
        description: "Please enter completion percentage.",
        variant: "destructive"
      });
      return;
    }

    const completion = parseFloat(completionPercentage);

    if (completion <= 0) {
      toast({
        title: "Invalid Completion Percentage",
        description: "Completion percentage must be greater than 0%.",
        variant: "destructive"
      });
      return;
    }

    // Validate completion percentage based on role
    if (selectedEmployeeData?.role === 'Finisher' && activePieceRateEntry.coat) {
      const remainingPercentage = getRemainingCoatPercentage(selectedJob, selectedEmployee, activePieceRateEntry.coat);
      if (completion > remainingPercentage) {
        toast({
          title: "Invalid Completion Percentage",
          description: `Only ${remainingPercentage}% remaining for this coat. Cannot exceed 100% total.`,
          variant: "destructive"
        });
        return;
      }
    }

    if (selectedEmployeeData?.role === 'Hanger') {
      const currentProgress = getJobPieceRateProgress(selectedJob, selectedEmployee, 'hang');
      if (completion <= currentProgress) {
        toast({
          title: "Invalid Completion Percentage",
          description: `Completion percentage must be greater than current progress (${currentProgress}%).`,
          variant: "destructive"
        });
        return;
      }
    }

    console.log('=== CALLING completePieceRateEntry ===');
    console.log('Entry ID:', activePieceRateEntry.id);
    console.log('Completion:', completion);
    console.log('Rate:', pieceRateInfo.rate);
    console.log('Earnings:', calculatedEarnings);
    
    completePieceRateEntry(
      activePieceRateEntry.id,
      completion,
      pieceRateInfo.rate,
      calculatedEarnings,
      notes,
      apprenticeId === 'none' ? null : apprenticeId || null,
      parseFloat(apprenticeHours) || 0,
      parseFloat(apprenticeCost) || 0,
      () => {
        console.log('=== completePieceRateEntry callback executed ===');
        // Reset form
        setSelectedCoat('');
        setCompletionPercentage('');
        setNotes('');
        setApprenticeId('none');
        setApprenticeHours('');
        setApprenticeCost('');
        setCalculatedEarnings(0);
        
        // Force re-render to update UI state
        if (onStateChange) {
          console.log('Calling onStateChange from completion callback');
          onStateChange();
        }
      }
    );
  };

  if (!selectedEmployeeData || !selectedJobData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-purple-600" />
            Piece Rate Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Please select an employee and job to complete piece rate work.</p>
        </CardContent>
      </Card>
    );
  }

  if (!activePieceRateEntry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2 text-purple-600" />
            Piece Rate Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <p>Please punch in for piece rate work first to complete an entry.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-purple-600" />
          Complete Piece Rate Work
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Entry Info */}
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <span className="font-semibold text-purple-800">Active Piece Rate Entry</span>
          </div>
          <div className="text-sm text-purple-700 space-y-1">
            <div>Employee: {selectedEmployeeData.firstName} {selectedEmployeeData.lastName}</div>
            <div>Job: {selectedJobData.jobName}</div>
            <div>Role: {selectedEmployeeData.role}</div>
            {activePieceRateEntry.coat && <div>Coat: {activePieceRateEntry.coat.charAt(0).toUpperCase() + activePieceRateEntry.coat.slice(1)}</div>}
            <div>Started: {new Date(activePieceRateEntry.startTime).toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Completion Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coat Display (for Finishers) - Read-only */}
          {selectedEmployeeData.role === 'Finisher' && (
            <div className="space-y-2">
              <Label>Coat</Label>
              <Input
                value={selectedCoat ? selectedCoat.charAt(0).toUpperCase() + selectedCoat.slice(1) : ''}
                disabled
                className="bg-gray-50"
                placeholder="No coat selected"
              />
              <p className="text-xs text-gray-500">
                Coat is locked to what you clocked in for
              </p>
            </div>
          )}

          {/* Completion Percentage */}
          <div className="space-y-2">
            <Label>
              {selectedEmployeeData?.role === 'Hanger' ? 'Total Completion Percentage (%)' : 'Completion Percentage (%)'}
            </Label>
            <Input
              type="number"
              step="0.1"
              value={completionPercentage}
              onChange={(e) => setCompletionPercentage(e.target.value)}
              placeholder={
                selectedEmployeeData?.role === 'Hanger' 
                  ? "Enter total completion %" 
                  : "Enter completion % for this coat"
              }
            />
            <p className="text-xs text-gray-500">
              {selectedEmployeeData?.role === 'Hanger' 
                ? "Enter the total percentage of the job completed (not just today's work)"
                : "Enter the percentage of this coat completed"
              }
            </p>
          </div>

          {/* Piece Rate Info (Read-only) */}
          <div className="space-y-2">
            <Label>Piece Rate ($/sqft)</Label>
            <Input
              value={pieceRateInfo?.rate?.toFixed(2) || '0.00'}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Job Square Footage (Read-only) */}
          <div className="space-y-2">
            <Label>Job Square Footage (from Field Takeoffs)</Label>
            <Input
              value={pieceRateInfo?.sqft?.toLocaleString() || '0'}
              disabled
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* Earnings Calculation */}
        {completionPercentage && pieceRateInfo?.available && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-green-800">Calculated Earnings:</span>
              <span className="text-2xl font-bold text-green-600">${calculatedEarnings.toFixed(2)}</span>
            </div>
            <div className="text-sm text-green-600 mt-1">
              {selectedEmployeeData?.role === 'Hanger' ? (
                `Based on ${completionPercentage}% total completion of ${pieceRateInfo.sqft.toLocaleString()} sqft at $${pieceRateInfo.rate.toFixed(2)}/sqft`
              ) : (
                `Based on ${completionPercentage}% completion of ${activePieceRateEntry?.coat ? activePieceRateEntry.coat.charAt(0).toUpperCase() + activePieceRateEntry.coat.slice(1) : ''} coat (${pieceRateInfo.sqft.toLocaleString()} sqft at $${pieceRateInfo.rate.toFixed(2)}/sqft)`
              )}
            </div>
            {/* Assistant Earnings Breakdown */}
            {apprenticeId && apprenticeId !== 'none' && apprenticeHours && (
              <div className="text-sm text-blue-600 mt-2 pt-2 border-t border-green-300">
                <div className="flex justify-between">
                  <span>Gross Earnings:</span>
                  <span>${(calculatedEarnings + (parseFloat(apprenticeHours) || 0) * (employees.find(emp => emp.id === apprenticeId)?.hourlyRate || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assistant Cost ({apprenticeHours}hrs @ ${employees.find(emp => emp.id === apprenticeId)?.hourlyRate || 0}/hr):</span>
                  <span>-${((parseFloat(apprenticeHours) || 0) * (employees.find(emp => emp.id === apprenticeId)?.hourlyRate || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Net Earnings:</span>
                  <span>${calculatedEarnings.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assistance Information */}
        <div className="space-y-4">
          <h4 className="font-semibold">Assistance Information (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                <Label>Assistant</Label>
                <Select value={apprenticeId} onValueChange={setApprenticeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assistant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {apprentices.map((apprentice) => (
                      <SelectItem key={apprentice.id} value={apprentice.id}>
                        {apprentice.firstName} {apprentice.lastName} ({apprentice.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {apprentices.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No other employees available. You can still enter assistance hours and cost manually.
                  </p>
                )}
              </div>

                          <div className="space-y-2">
                <Label>Assistant Hours</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={apprenticeHours}
                  onChange={(e) => setApprenticeHours(e.target.value)}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label>Assistant Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={apprenticeCost}
                  onChange={(e) => setApprenticeCost(e.target.value)}
                  placeholder="0.00"
                  disabled={apprenticeId && apprenticeId !== 'none'}
                  className={apprenticeId && apprenticeId !== 'none' ? 'bg-gray-50' : ''}
                />
                {apprenticeId && apprenticeId !== 'none' && (
                  <p className="text-xs text-gray-500">
                    Automatically calculated from assistant's hourly rate
                  </p>
                )}
              </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes about this completion..."
            rows={3}
          />
        </div>

        {/* Complete Button */}
        <Button 
          onClick={handleCompletePieceRate}
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={!completionPercentage || !pieceRateInfo?.available}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete {selectedEmployeeData?.role === 'Hanger' ? 'Hanging' : `${activePieceRateEntry?.coat ? activePieceRateEntry.coat.charAt(0).toUpperCase() + activePieceRateEntry.coat.slice(1) : ''} Coat`} Work
        </Button>
      </CardContent>
    </Card>
  );
};

export default PieceRateCompletion;
