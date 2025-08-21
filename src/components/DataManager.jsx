import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { storage, testData } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Database, Download, Upload, Trash2, RefreshCw, FileText, X } from 'lucide-react';

export default function DataManager({ onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLoadTestData = async () => {
    setIsLoading(true);
    try {
      // Load test jobs
      storage.save('hsh_drywall_jobs_v2', testData.generateJobs(), 'jobs');
      
      // Load test employees  
      storage.save('hsh_drywall_employees_v2', testData.generateEmployees(), 'employees');
      
      toast({
        title: "Test Data Loaded! 🎯",
        description: "Sample jobs and employees have been loaded for testing."
      });
      
      // Reload the page to refresh all hooks
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error Loading Test Data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      storage.clearAll();
      toast({
        title: "All Data Cleared! 🗑️",
        description: "All stored data has been removed.",
        variant: "destructive"
      });
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = storage.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hsh-drywall-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported! 📁",
      description: "Your data has been downloaded as a backup file."
    });
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (storage.import(data)) {
          toast({
            title: "Data Imported! ✅",
            description: "Your backup data has been restored."
          });
          window.location.reload();
        } else {
          throw new Error('Import failed');
        }
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "The backup file appears to be invalid.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleViewStorageInfo = () => {
    const usage = storage.getUsage();
    const totalSize = Object.values(usage).reduce((sum, item) => sum + item.size, 0);
    const totalItems = Object.values(usage).reduce((sum, item) => sum + item.itemCount, 0);
    
    const info = `Storage Usage:\n${Object.entries(usage).map(([name, data]) => 
      `${name}: ${data.itemCount} items (${(data.size / 1024).toFixed(1)} KB)`
    ).join('\n')}\n\nTotal: ${totalItems} items (${(totalSize / 1024).toFixed(1)} KB)`;
    
    alert(info);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button 
            onClick={handleLoadTestData}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isLoading ? 'Loading...' : 'Load Test Data'}
          </Button>
          
          <Button 
            onClick={handleClearAllData}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All Data
          </Button>
          
          <Button 
            onClick={handleExportData}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              style={{ display: 'none' }}
              id="import-file"
            />
            <label htmlFor="import-file">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </span>
              </Button>
            </label>
          </div>

          <Button 
            onClick={handleViewStorageInfo}
            variant="outline"
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Storage Info
          </Button>

          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 