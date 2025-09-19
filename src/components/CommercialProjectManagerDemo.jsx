import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mail, CheckCircle, XCircle, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import commercialProjectManagerService from '@/services/commercialProjectManagerService.js';

const CommercialProjectManagerDemo = ({ jobs }) => {
  const [isActive, setIsActive] = useState(false);
  const [stagedActions, setStagedActions] = useState([]);
  const [serviceStatus, setServiceStatus] = useState(null);

  // Initialize service
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

  const sendTestEmail = async (type) => {
    const testEmails = {
      schedule_change: {
        from: 'pm@generalcontractor.com',
        subject: 'Schedule Change Request - Drywall Crew',
        message: 'Hi, we need to move the drywall crew from Tuesday to Thursday next week due to a delay in the electrical work. Can you reschedule for Thursday morning at 8 AM?'
      },
      material_request: {
        from: 'foreman@generalcontractor.com',
        subject: 'Material Request - Additional Drywall',
        message: 'We need 50 additional sheets of 5/8" drywall for the conference room. Can you arrange delivery for Friday morning?'
      },
      change_order: {
        from: 'pm@generalcontractor.com',
        subject: 'Change Order - Additional Wall',
        message: 'We need to add an additional wall in the lobby area. The wall is 12 feet long and 10 feet high. Please provide a change order estimate.'
      },
      aia_billing: {
        from: 'accounting@generalcontractor.com',
        subject: 'AIA Application #3 - Payment Request',
        message: 'Please prepare AIA Application #3 for the current period. The amount is $25,000 with 10% retainage. Due date is next Friday.'
      },
      specs_submittals: {
        from: 'architect@generalcontractor.com',
        subject: 'Submittal Required - Drywall Specifications',
        message: 'We need submittals for the drywall specifications per spec 09 21 00. Please provide the required documentation by next Monday.'
      }
    };

    const emailData = testEmails[type];
    if (!emailData) return;

    try {
      const result = await commercialProjectManagerService.processIncomingEmail(emailData);
      
      if (result.success) {
        loadStagedActions();
        toast({
          title: "Email Processed",
          description: result.staged ? "Action staged for approval" : "Action executed automatically",
        });
      } else {
        toast({
          title: "Processing Failed",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'schedule_change': return '📅';
      case 'material_request': return '📦';
      case 'change_order': return '📋';
      case 'aia_billing': return '💰';
      case 'specs_submittals': return '📄';
      default: return '📧';
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

      {/* Test Email Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Send Test Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Button
              onClick={() => sendTestEmail('schedule_change')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📅 Schedule Change
            </Button>
            <Button
              onClick={() => sendTestEmail('material_request')}
              className="bg-green-600 hover:bg-green-700"
            >
              📦 Material Request
            </Button>
            <Button
              onClick={() => sendTestEmail('change_order')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              📋 Change Order
            </Button>
            <Button
              onClick={() => sendTestEmail('aia_billing')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              💰 AIA Billing
            </Button>
            <Button
              onClick={() => sendTestEmail('specs_submittals')}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              📄 Specs/Submittals
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Staged Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Staged Actions Awaiting Approval</CardTitle>
        </CardHeader>
        <CardContent>
          {stagedActions.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No Staged Actions
              </h3>
              <p className="text-gray-500">
                Send a test email above to see the automated processing in action.
              </p>
            </div>
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
                      <div className="text-2xl">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CommercialProjectManagerDemo;

