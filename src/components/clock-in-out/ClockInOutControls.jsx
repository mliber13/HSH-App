import React, { useState } from 'react';
import { Play, Square, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

import { useJobs } from '@/hooks/useJobs';
import locationService from '@/services/locationService';

const ClockInOutControls = ({ 
  selectedEmployee, 
  selectedJob, 
  workType, 
  isCurrentlyWorking, 
  activeEntry, 
  activePieceRateEntry, 
  employees, 
  jobs,
  onStateChange,
  clockIn,
  clockOut,
  punchInPieceRate,
  getAvailableCoats
}) => {
  console.log('ClockInOutControls props:', {
    selectedEmployee,
    selectedJob,
    isCurrentlyWorking,
    hasActiveEntry: !!activeEntry,
    hasActivePieceRateEntry: !!activePieceRateEntry,
    hasOnStateChange: !!onStateChange
  });
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationValidation, setLocationValidation] = useState(null);
  const [selectedCoat, setSelectedCoat] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('');


  
  const { jobs: allJobs } = useJobs();

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);
  const selectedJobData = jobs.find(job => job.id === selectedJob);

  // Check if this is a GC job
  const isGCJob = selectedJobData?.jobType === 'residential-construction';

  // Get available coats for finishers
  const availableCoats = selectedEmployeeData?.role === 'Finisher' 
    ? getAvailableCoats(selectedJob, selectedEmployee, allJobs)
    : [];

  // Trade categories for GC jobs
  const tradeCategories = {
    'Site Work': ['Excavation', 'Utilities', 'Foundation', 'Grading'],
    'Structure': ['Framing', 'Roofing', 'Siding', 'Windows/Doors'],
    'Mechanicals': ['Electrical', 'HVAC', 'Plumbing', 'Insulation'],
    'Finishes': ['Drywall', 'Paint', 'Trim', 'Flooring', 'Cabinets'],
    'Management': ['Project Management', 'Supervision', 'Quality Control']
  };

  // Phase options for GC jobs
  const phaseOptions = ['Site Work', 'Structure', 'Mechanicals', 'Finishes', 'Management'];

  // Location tracking functions
  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      
      // Validate location for selected job
      if (selectedJob) {
        const validation = locationService.validateLocationForJob(location.latitude, location.longitude, selectedJobData);
        setLocationValidation(validation);
        
        if (validation.valid) {
          toast({
            title: "Location Verified! 📍",
            description: validation.message
          });
        } else {
          toast({
            title: "Location Out of Range",
            description: validation.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Location Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleClockIn = async () => {
    console.log('=== CLOCK IN ATTEMPT ===');
    console.log('selectedEmployee:', selectedEmployee);
    console.log('selectedJob:', selectedJob);
    console.log('workType:', workType);
    console.log('selectedEmployeeData:', selectedEmployeeData);
    console.log('isGCJob:', isGCJob);
    console.log('selectedTrade:', selectedTrade);
    console.log('selectedPhase:', selectedPhase);
    
    if (!selectedEmployee || !selectedJob) {
      toast({
        title: "Missing Information",
        description: "Please select both an employee and a job.",
        variant: "destructive"
      });
      return;
    }

    // For GC jobs, require trade selection
    if (isGCJob && !selectedTrade) {
      toast({
        title: "Missing Trade Information",
        description: "Please select a trade for this work.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (workType === 'hourly') {
        // For GC jobs, include trade and phase data
        const clockInData = isGCJob ? {
          trade: selectedTrade,
          phase: selectedPhase
        } : {};
        await clockIn(selectedEmployee, selectedJob, clockInData);
      } else {
        // Handle piece rate punch-in
        if (selectedEmployeeData?.role === 'Finisher') {
          if (!selectedCoat) {
            toast({
              title: "Missing Coat Selection",
              description: "Please select a coat for piece rate work.",
              variant: "destructive"
            });
            return;
          }
          // For GC jobs, include trade and phase data
          const pieceRateData = isGCJob ? {
            trade: selectedTrade,
            phase: selectedPhase
          } : {};
          await punchInPieceRate(selectedEmployee, selectedJob, selectedCoat, pieceRateData);
        } else if (selectedEmployeeData?.role === 'Hanger') {
          // For GC jobs, include trade and phase data
          const pieceRateData = isGCJob ? {
            trade: selectedTrade,
            phase: selectedPhase
          } : {};
          await punchInPieceRate(selectedEmployee, selectedJob, 'hang', pieceRateData);
        } else {
          toast({
            title: "Invalid Role for Piece Rate",
            description: "Only Hangers and Finishers can work piece rate.",
            variant: "destructive"
          });
          return;
        }
      }
      
      console.log('=== CLOCK IN SUCCESS ===');
      console.log('Employee clocked in successfully');
      
      toast({
        title: "Clocked In! 🎉",
        description: `${selectedEmployeeData?.firstName} ${selectedEmployeeData?.lastName} has been clocked in for ${selectedJobData?.jobName}.`
      });
      
      // Force UI update by triggering a state change with a small delay
      setTimeout(() => {
        if (onStateChange) {
          console.log('Triggering state change to force UI update');
          onStateChange('refresh');
        }
      }, 100);
      console.log('Clock in completed, UI should update automatically');
    } catch (error) {
      toast({
        title: "Clock In Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClockOut = async () => {
    console.log('=== CLOCK OUT ATTEMPT ===');
    console.log('selectedEmployee:', selectedEmployee);
    console.log('activePieceRateEntry:', activePieceRateEntry);
    console.log('activeEntry:', activeEntry);
    console.log('isCurrentlyWorking:', isCurrentlyWorking);
    
    if (!selectedEmployee) {
      toast({
        title: "Missing Information",
        description: "Please select an employee.",
        variant: "destructive"
      });
      return;
    }

    // Check if we have any active entry (hourly or piece rate)
    if (!activeEntry && !activePieceRateEntry) {
      toast({
        title: "No Active Entry",
        description: "No active time entry found to clock out.",
        variant: "destructive"
      });
      return;
    }

    // If it's a piece rate entry, show completion modal instead of clocking out
    if (activePieceRateEntry) {
      console.log('=== PIECE RATE ENTRY FOUND ===');
      console.log('Piece rate entry found, showing completion modal');
      console.log('activePieceRateEntry details:', activePieceRateEntry);
      // Trigger piece rate completion modal
      if (onStateChange) {
        console.log('Calling onStateChange with showPieceRateCompletion');
        onStateChange('showPieceRateCompletion');
      } else {
        console.log('ERROR: onStateChange is not available');
      }
      return;
    }

    // Handle hourly clock out
    if (activeEntry) {
      console.log('=== HOURLY ENTRY FOUND ===');
      console.log('Hourly entry found, proceeding with clock out');
      console.log('activeEntry details:', activeEntry);
      
      try {
        await clockOut(selectedEmployee, clockOutNotes);
        setClockOutNotes('');
        
        toast({
          title: "Clocked Out! ✅",
          description: `${selectedEmployeeData?.firstName} ${selectedEmployeeData?.lastName} has been clocked out.`
        });
        
        // Force UI update
        setTimeout(() => {
          if (onStateChange) {
            console.log('Triggering state change to force UI update after clock out');
            onStateChange('refresh');
          }
        }, 100);
        
        console.log('Clock out completed, UI should update automatically');
      } catch (error) {
        toast({
          title: "Clock Out Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <div className="text-center">
        {isCurrentlyWorking ? (
          <div className="space-y-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 mr-1" />
              Currently Working
            </Badge>
            <p className="text-sm text-gray-600">
              {activeEntry && `Started at ${new Date(activeEntry.clockInTime).toLocaleTimeString()}`}
              {activePieceRateEntry && `Piece rate work in progress`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
              <XCircle className="h-4 w-4 mr-1" />
              Not Working
            </Badge>
            <p className="text-sm text-gray-600">Ready to clock in</p>
          </div>
        )}
      </div>

      {/* Location Tracking */}
      <div className="space-y-2">
        <Button
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          variant="outline"
          className="w-full"
        >
          <MapPin className="h-4 w-4 mr-2" />
          {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
        </Button>
        
        {currentLocation && (
          <div className="text-xs text-gray-600">
            📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </div>
        )}
        
        {locationValidation && (
          <div className={`text-xs ${locationValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
            {locationValidation.message}
          </div>
        )}
      </div>

      {/* Trade and Phase Selection for GC Jobs */}
      {isGCJob && !isCurrentlyWorking && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Trade *</Label>
            <Select value={selectedTrade} onValueChange={setSelectedTrade}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trade" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(tradeCategories).map(([category, trades]) => (
                  <div key={category}>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {category}
                    </div>
                    {trades.map((trade) => (
                      <SelectItem key={trade} value={trade}>
                        {trade}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Phase (Optional)</Label>
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger>
                <SelectValue placeholder="Select a phase" />
              </SelectTrigger>
              <SelectContent>
                {phaseOptions.map((phase) => (
                  <SelectItem key={phase} value={phase}>
                    {phase}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Coat Selection for Finishers */}
      {workType === 'piece-rate' && selectedEmployeeData?.role === 'Finisher' && !isCurrentlyWorking && (
        <div className="space-y-2">
          <Label>Coat Selection</Label>
          <Select value={selectedCoat} onValueChange={setSelectedCoat}>
            <SelectTrigger>
              <SelectValue placeholder="Select a coat to work on" />
            </SelectTrigger>
            <SelectContent>
              {availableCoats.length > 0 ? (
                availableCoats.map((coat) => (
                  <SelectItem key={coat} value={coat}>
                    {coat.charAt(0).toUpperCase() + coat.slice(1)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-coats" disabled>
                  No available coats
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {availableCoats.length === 0 && (
            <p className="text-xs text-amber-600">
              All coats for this job are already complete or in progress.
            </p>
          )}
        </div>
      )}

      {/* Clock In Button */}
      <Button
        onClick={handleClockIn}
        disabled={isCurrentlyWorking || !selectedEmployee || !selectedJob || (workType === 'piece-rate' && selectedEmployeeData?.role === 'Finisher' && !selectedCoat) || (isGCJob && !selectedTrade)}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        <Play className="h-4 w-4 mr-2" />
        Clock In
      </Button>

      {/* Clock Out Section */}
      {isCurrentlyWorking && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="clockOutNotes">Clock Out Notes (Optional)</Label>
            <Textarea
              id="clockOutNotes"
              value={clockOutNotes}
              onChange={(e) => setClockOutNotes(e.target.value)}
              placeholder="Add any notes about the work completed..."
              rows={3}
            />
          </div>
          
          <Button
            onClick={() => {
              console.log('=== CLOCK OUT BUTTON CLICKED ===');
              console.log('Button clicked, calling handleClockOut');
              handleClockOut();
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <Square className="h-4 w-4 mr-2" />
            Clock Out
          </Button>
        </div>
      )}

      {/* Debug Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Debug: isCurrentlyWorking = {isCurrentlyWorking.toString()}</div>
        <div>Debug: activeEntry = {activeEntry ? 'Yes' : 'No'}</div>
        <div>Debug: activePieceRateEntry = {activePieceRateEntry ? 'Yes' : 'No'}</div>
        <div>Debug: selectedEmployee = {selectedEmployee || 'None'}</div>
      </div>

      {/* Employee Info */}
      {selectedEmployeeData && (
        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-2">Employee Info</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Name: {selectedEmployeeData.firstName} {selectedEmployeeData.lastName}</div>
            <div>Role: {selectedEmployeeData.role}</div>
            <div>Rate: ${selectedEmployeeData.hourlyRate}/hr</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClockInOutControls;
