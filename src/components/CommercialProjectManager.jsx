import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Send,
  Calendar,
  Package,
  FileText,
  DollarSign,
  Settings,
  Play,
  Pause
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import commercialProjectManagerService from '@/services/commercialProjectManagerService.js';
import EmailSimulator from './EmailSimulator';

const CommercialProjectManager = ({ jobs }) => {
  const [isActive, setIsActive] = useState(false);
  const [stagedActions, setStagedActions] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showActionDetails, setShowActionDetails] = useState(false);

  // Initialize service and load data
  useEffect(() => {
    initializeService();
    loadStagedActions();
    
    // Register commercial jobs
    jobs.filter(job => job.jobType === 'commercial' && job.status === 'active')
        .forEach(job => commercialProjectManagerService.registerJob(job));
  }, [jobs]);

  const initializeService = async () => {
    try {
      await commercialProjectManagerService.initialize();
      const status = commercialProjectManagerService.getStatus();
      setServiceStatus(status);
      setIsActive(status.isInitialized);
    } catch (error) {
      console.error('Failed to initialize service:', error);
      toast({
        title: "Initialization Failed",
        description: "Could not initialize the commercial project manager service.",
        variant: "destructive"
      });
    }
  };

  const loadStagedActions = () => {
    const actions = commercialProjectManagerService.getStagedActions();
    setStagedActions(actions);
  };

  const handleApproveAction = async (actionId) => {
    try {
      await commercialProjectManagerService.approveStagedAction(actionId);
      loadStagedActions();
      setShowActionDetails(false);
      setSelectedAction(null);
      
      toast({
        title: "Action Approved",
        description: "The staged action has been approved and executed.",
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRejectAction = async (actionId, reason) => {
    try {
      await commercialProjectManagerService.rejectStagedAction(actionId, reason);
      loadStagedActions();
      setShowActionDetails(false);
      setSelectedAction(null);
      
      toast({
        title: "Action Rejected",
        description: "The staged action has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleViewAction = (action) => {
    setSelectedAction(action);
    setShowActionDetails(true);
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'schedule_change': return <Calendar className="h-4 w-4" />;
      case 'material_request': return <Package className="h-4 w-4" />;
      case 'change_order': return <FileText className="h-4 w-4" />;
      case 'aia_billing': return <DollarSign className="h-4 w-4" />;
      case 'specs_submittals': return <FileText className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getActionColor = (type) => {
    switch (type) {
      case 'schedule_change': return 'bg-blue-100 text-blue-800';
      case 'material_request': return 'bg-green-100 text-green-800';
      case 'change_order': return 'bg-orange-100 text-orange-800';
      case 'aia_billing': return 'bg-purple-100 text-purple-800';
      case 'specs_submittals': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="h-6 w-6 text-brandSecondary" />
              <span>Automated Commercial Project Manager</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brandSecondary">
                {serviceStatus?.activeJobs || 0}
              </div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stagedActions.length}
              </div>
              <div className="text-sm text-gray-600">Staged Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {serviceStatus?.processors || 0}
              </div>
              <div className="text-sm text-gray-600">Email Processors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stagedActions.filter(a => a.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="staged" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="staged">Staged Actions</TabsTrigger>
          <TabsTrigger value="simulator">Email Simulator</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="staged" className="space-y-4">
          {stagedActions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Staged Actions
                </h3>
                <p className="text-gray-500">
                  All caught up! No actions are currently awaiting your approval.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {stagedActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        {getActionIcon(action.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {action.jobName}
                          </h3>
                          <Badge className={getActionColor(action.type)}>
                            {action.type.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(action.priority)}>
                            {action.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {action.suggestedAction.details}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(action.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAction(action)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveAction(action.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectAction(action.id, 'Rejected by user')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="simulator" className="space-y-4">
          <EmailSimulator jobs={jobs} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Email Processing Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Schedule Changes</label>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">Auto-Route to Scheduler</Badge>
                    <Badge className="bg-red-100 text-red-800">Requires Approval</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Material Requests</label>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Auto-Route to Foreman</Badge>
                    <Badge className="bg-green-100 text-green-800">Auto-Execute</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Change Orders</label>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-orange-100 text-orange-800">Auto-Route to PM</Badge>
                    <Badge className="bg-red-100 text-red-800">Requires Approval</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">AIA Billing</label>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-purple-100 text-purple-800">Auto-Route to Accounting</Badge>
                    <Badge className="bg-red-100 text-red-800">Requires Approval</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Activity logs will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Details Modal */}
      {showActionDetails && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Action Details</h2>
              <Button
                variant="outline"
                onClick={() => setShowActionDetails(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Original Email</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm"><strong>From:</strong> {selectedAction.originalEmail.from}</p>
                  <p className="text-sm"><strong>Subject:</strong> {selectedAction.originalEmail.subject}</p>
                  <p className="text-sm mt-2"><strong>Message:</strong></p>
                  <p className="text-sm text-gray-700 mt-1">{selectedAction.originalEmail.message}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Extracted Data</h3>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <pre className="text-sm text-gray-700">
                    {JSON.stringify(selectedAction.extractedData, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Suggested Action</h3>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm"><strong>Action:</strong> {selectedAction.suggestedAction.action}</p>
                  <p className="text-sm"><strong>Details:</strong> {selectedAction.suggestedAction.details}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Staged Response</h3>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm">{selectedAction.stagedResponse}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowActionDetails(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRejectAction(selectedAction.id, 'Rejected after review')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveAction(selectedAction.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve & Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialProjectManager;
