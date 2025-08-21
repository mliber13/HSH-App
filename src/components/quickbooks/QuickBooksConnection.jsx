import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  Link,
  Unlink
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import quickbooksIntegrationService from '@/services/quickbooksIntegrationService';

const QuickBooksConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    loading: true,
    companyName: '',
    error: null
  });
  const [queueStatus, setQueueStatus] = useState(null);
  const [processingQueue, setProcessingQueue] = useState(false);

  useEffect(() => {
    checkConnection();
    loadQueueStatus();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await quickbooksIntegrationService.testConnection();
      
      setConnectionStatus({
        connected: result.success,
        loading: false,
        companyName: result.companyName || '',
        error: result.error || null,
        needsSetup: result.needsSetup || false
      });

      if (result.success) {
        toast({
          title: "QuickBooks Connected",
          description: `Connected to ${result.companyName}`,
        });
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        loading: false,
        companyName: '',
        error: error.message,
        needsSetup: false
      });
    }
  };

  const loadQueueStatus = () => {
    const status = quickbooksIntegrationService.getQueueStatus();
    setQueueStatus(status);
  };

  const processQueue = async () => {
    setProcessingQueue(true);
    
    try {
      const results = await quickbooksIntegrationService.processQueue();
      
      let successCount = 0;
      let failureCount = 0;
      
      results.forEach(result => {
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      });

      if (successCount > 0) {
        toast({
          title: "Queue Processed",
          description: `${successCount} operations completed successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        });
      }

      loadQueueStatus();
    } catch (error) {
      toast({
        title: "Queue Processing Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessingQueue(false);
    }
  };

  const connectToQuickBooks = () => {
    if (connectionStatus.needsSetup) {
      toast({
        title: "QuickBooks Setup Required",
        description: "Please set up environment variables first. See QUICKBOOKS_SETUP.md for instructions.",
        variant: "destructive"
      });
      return;
    }
    
    // This would typically redirect to QuickBooks OAuth
    // For now, we'll simulate the connection process
    toast({
      title: "QuickBooks Connection",
      description: "Redirecting to QuickBooks for authentication...",
    });
    
    // In a real implementation, this would redirect to QuickBooks OAuth
    // window.location.href = `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&response_type=code&scope=com.intuit.quickbooks.accounting&redirect_uri=${redirectUri}&state=${state}`;
  };

  const disconnectQuickBooks = () => {
    // Clear stored tokens
    localStorage.removeItem('quickbooks_access_token');
    localStorage.removeItem('quickbooks_refresh_token');
    localStorage.removeItem('quickbooks_realm_id');
    localStorage.removeItem('quickbooks_token_expiry');
    
    setConnectionStatus({
      connected: false,
      loading: false,
      companyName: '',
      error: null
    });

    toast({
      title: "QuickBooks Disconnected",
      description: "Successfully disconnected from QuickBooks",
    });
  };

  const getStatusIcon = () => {
    if (connectionStatus.loading) {
      return <RefreshCw className="h-5 w-5 animate-spin" />;
    }
    
    if (connectionStatus.connected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = () => {
    if (connectionStatus.loading) {
      return <Badge variant="secondary">Connecting...</Badge>;
    }
    
    if (connectionStatus.connected) {
      return <Badge variant="default" className="bg-green-500">Connected</Badge>;
    }
    
    return <Badge variant="destructive">Disconnected</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            QuickBooks Online Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium">Connection Status</p>
                {connectionStatus.companyName && (
                  <p className="text-sm text-muted-foreground">
                    {connectionStatus.companyName}
                  </p>
                )}
              </div>
            </div>
            {getStatusBadge()}
          </div>

          {/* Error Display */}
          {connectionStatus.error && (
            <Alert variant={connectionStatus.needsSetup ? "default" : "destructive"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {connectionStatus.error}
                {connectionStatus.needsSetup && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Setup Instructions:</p>
                    <ol className="text-sm list-decimal list-inside mt-1 space-y-1">
                      <li>Create a QuickBooks Developer account</li>
                      <li>Set up environment variables in your .env file</li>
                      <li>Configure your QuickBooks app settings</li>
                      <li>See QUICKBOOKS_SETUP.md for detailed instructions</li>
                    </ol>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {connectionStatus.connected ? (
              <>
                <Button 
                  onClick={checkConnection}
                  variant="outline"
                  size="sm"
                  disabled={connectionStatus.loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${connectionStatus.loading ? 'animate-spin' : ''}`} />
                  Test Connection
                </Button>
                <Button 
                  onClick={disconnectQuickBooks}
                  variant="outline"
                  size="sm"
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button 
                onClick={connectToQuickBooks}
                disabled={connectionStatus.loading}
              >
                <Link className="h-4 w-4 mr-2" />
                Connect to QuickBooks
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Queue Status */}
      {queueStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Operation Queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Queue Statistics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{queueStatus.stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-500">{queueStatus.stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{queueStatus.stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{queueStatus.stats.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>

            {/* Pending Operations */}
            {queueStatus.pendingOperations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Pending Operations</h4>
                <div className="space-y-2">
                  {queueStatus.pendingOperations.map(operation => (
                    <div key={operation.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{operation.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Retries: {operation.retries} • Created: {new Date(operation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Operations */}
            {queueStatus.failedOperations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Failed Operations</h4>
                <div className="space-y-2">
                  {queueStatus.failedOperations.map(operation => (
                    <div key={operation.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{operation.description}</p>
                        <p className="text-xs text-red-600">{operation.error}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Queue Actions */}
            {queueStatus.stats.pending > 0 && (
              <div className="flex gap-2">
                <Button 
                  onClick={processQueue}
                  disabled={processingQueue}
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${processingQueue ? 'animate-spin' : ''}`} />
                  {processingQueue ? 'Processing...' : 'Process Queue'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuickBooksConnection;
