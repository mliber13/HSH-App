import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import apiService from '../services/apiService';

const ApiStatus = () => {
  const [status, setStatus] = useState('checking'); // 'online', 'offline', 'checking'
  const [lastChecked, setLastChecked] = useState(null);

  const checkApiStatus = async () => {
    setStatus('checking');
    try {
      await apiService.healthCheck();
      setStatus('online');
      setLastChecked(new Date());
    } catch (error) {
      setStatus('offline');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkApiStatus();
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'checking': return <RefreshCw className="h-4 w-4 animate-spin" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'API Connected';
      case 'offline': return 'API Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
      {lastChecked && (
        <span className="text-gray-500 text-xs">
          ({lastChecked.toLocaleTimeString()})
        </span>
      )}
      <button
        onClick={checkApiStatus}
        className="text-gray-500 hover:text-gray-700 transition-colors"
        title="Check API status"
      >
        <RefreshCw className="h-3 w-3" />
      </button>
    </div>
  );
};

export default ApiStatus;

