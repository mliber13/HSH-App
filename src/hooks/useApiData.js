import { useState, useEffect } from 'react';
import apiService from '../services/apiService';

// Custom hook to manage data with API fallback to localStorage
export const useApiData = (dataType, localStorageKey) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useApi, setUseApi] = useState(true); // Toggle between API and localStorage

  // Load data from API or localStorage
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useApi) {
        // Try to load from API first
        let apiData;
        switch (dataType) {
          case 'jobs':
            apiData = await apiService.getJobs();
            break;
          case 'employees':
            apiData = await apiService.getEmployees();
            break;
          case 'timeEntries':
            apiData = await apiService.getTimeEntries();
            break;
          case 'schedules':
            apiData = await apiService.getSchedules();
            break;
          case 'inventory':
            apiData = await apiService.getInventory();
            break;
          case 'suppliers':
            apiData = await apiService.getSuppliers();
            break;
          default:
            throw new Error(`Unknown data type: ${dataType}`);
        }
        setData(apiData);
      } else {
        // Fallback to localStorage
        const localData = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
        setData(localData);
      }
    } catch (err) {
      console.error(`Failed to load ${dataType}:`, err);
      setError(err.message);
      
      // If API fails, try localStorage as fallback
      if (useApi) {
        try {
          const localData = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
          setData(localData);
          setError('API unavailable, using local data');
        } catch (localErr) {
          setError('Both API and local storage failed');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Save data to API or localStorage
  const saveData = async (newData) => {
    try {
      if (useApi) {
        // Save to API
        switch (dataType) {
          case 'jobs':
            if (newData.id) {
              await apiService.updateJob(newData.id, newData);
            } else {
              await apiService.createJob(newData);
            }
            break;
          case 'employees':
            if (newData.id) {
              await apiService.updateEmployee(newData.id, newData);
            } else {
              await apiService.createEmployee(newData);
            }
            break;
          case 'timeEntries':
            if (newData.id) {
              await apiService.updateTimeEntry(newData.id, newData);
            } else {
              await apiService.createTimeEntry(newData);
            }
            break;
          case 'schedules':
            if (newData.id) {
              await apiService.updateSchedule(newData.id, newData);
            } else {
              await apiService.createSchedule(newData);
            }
            break;
          case 'inventory':
            await apiService.updateInventory(newData);
            break;
          case 'suppliers':
            await apiService.updateSuppliers(newData);
            break;
          default:
            throw new Error(`Unknown data type: ${dataType}`);
        }
      } else {
        // Save to localStorage
        localStorage.setItem(localStorageKey, JSON.stringify(newData));
      }
      
      // Reload data after saving
      await loadData();
    } catch (err) {
      console.error(`Failed to save ${dataType}:`, err);
      setError(err.message);
    }
  };

  // Update specific item
  const updateItem = async (id, updates) => {
    try {
      if (useApi) {
        switch (dataType) {
          case 'jobs':
            await apiService.updateJob(id, updates);
            break;
          case 'employees':
            await apiService.updateEmployee(id, updates);
            break;
          case 'timeEntries':
            await apiService.updateTimeEntry(id, updates);
            break;
          case 'schedules':
            await apiService.updateSchedule(id, updates);
            break;
          default:
            throw new Error(`Update not supported for ${dataType}`);
        }
      } else {
        // Update in localStorage
        const updatedData = data.map(item => 
          item.id === id ? { ...item, ...updates } : item
        );
        localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
      }
      
      // Reload data after updating
      await loadData();
    } catch (err) {
      console.error(`Failed to update ${dataType}:`, err);
      setError(err.message);
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    try {
      if (useApi) {
        switch (dataType) {
          case 'jobs':
            await apiService.deleteJob(id);
            break;
          case 'employees':
            await apiService.deleteEmployee(id);
            break;
          case 'timeEntries':
            await apiService.deleteTimeEntry(id);
            break;
          default:
            throw new Error(`Delete not supported for ${dataType}`);
        }
      } else {
        // Delete from localStorage
        const filteredData = data.filter(item => item.id !== id);
        localStorage.setItem(localStorageKey, JSON.stringify(filteredData));
      }
      
      // Reload data after deleting
      await loadData();
    } catch (err) {
      console.error(`Failed to delete ${dataType}:`, err);
      setError(err.message);
    }
  };

  // Toggle between API and localStorage
  const toggleDataSource = () => {
    setUseApi(!useApi);
  };

  // Load data on mount and when data source changes
  useEffect(() => {
    loadData();
  }, [useApi]);

  return {
    data,
    loading,
    error,
    useApi,
    loadData,
    saveData,
    updateItem,
    deleteItem,
    toggleDataSource,
  };
};

// Specific hooks for each data type
export const useJobs = () => useApiData('jobs', 'jobs');
export const useEmployees = () => useApiData('employees', 'employees');
export const useTimeEntries = () => useApiData('timeEntries', 'timeEntries');
export const useSchedules = () => useApiData('schedules', 'schedules');
export const useInventory = () => useApiData('inventory', 'inventory');
export const useSuppliers = () => useApiData('suppliers', 'suppliers');

