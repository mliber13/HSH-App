import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const EmployeeStatus = ({ employee, activeEntry, activePieceRateEntry, isCurrentlyWorking }) => {
  const formatDuration = (startTime) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Status</span>
        {isCurrentlyWorking ? (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Working
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Available
          </Badge>
        )}
      </div>

      {activeEntry && (
        <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">Hourly Work</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Active
            </Badge>
          </div>
          <div className="text-xs text-blue-600 space-y-1">
            <div>Started: {new Date(activeEntry.clockInTime).toLocaleTimeString()}</div>
            <div>Duration: {formatDuration(activeEntry.clockInTime)}</div>
            <div>Job: {activeEntry.jobName}</div>
          </div>
        </div>
      )}

      {activePieceRateEntry && (
        <div className="space-y-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-purple-800">Piece Rate Work</span>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              In Progress
            </Badge>
          </div>
          <div className="text-xs text-purple-600 space-y-1">
            <div>Started: {new Date(activePieceRateEntry.startTime).toLocaleTimeString()}</div>
            <div>Duration: {formatDuration(activePieceRateEntry.startTime)}</div>
            <div>Job: {activePieceRateEntry.jobName}</div>
            <div>Coat: {activePieceRateEntry.coat.charAt(0).toUpperCase() + activePieceRateEntry.coat.slice(1)}</div>
          </div>
        </div>
      )}

      {!isCurrentlyWorking && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Not currently working</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeStatus;
