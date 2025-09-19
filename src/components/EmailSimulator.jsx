import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import commercialProjectManagerService from '@/services/commercialProjectManagerService.js';

const EmailSimulator = ({ jobs }) => {
  const [emailData, setEmailData] = useState({
    from: 'pm@generalcontractor.com',
    subject: '',
    message: '',
    type: 'schedule_change'
  });

  const emailTemplates = {
    schedule_change: {
      subject: 'Schedule Change Request - Drywall Crew',
      message: 'Hi, we need to move the drywall crew from Tuesday to Thursday next week due to a delay in the electrical work. Can you reschedule for Thursday morning at 8 AM?'
    },
    material_request: {
      subject: 'Material Request - Additional Drywall',
      message: 'We need 50 additional sheets of 5/8" drywall for the conference room. Can you arrange delivery for Friday morning?'
    },
    change_order: {
      subject: 'Change Order - Additional Wall',
      message: 'We need to add an additional wall in the lobby area. The wall is 12 feet long and 10 feet high. Please provide a change order estimate.'
    },
    aia_billing: {
      subject: 'AIA Application #3 - Payment Request',
      message: 'Please prepare AIA Application #3 for the current period. The amount is $25,000 with 10% retainage. Due date is next Friday.'
    },
    specs_submittals: {
      subject: 'Submittal Required - Drywall Specifications',
      message: 'We need submittals for the drywall specifications per spec 09 21 00. Please provide the required documentation by next Monday.'
    }
  };

  const handleTemplateSelect = (type) => {
    const template = emailTemplates[type];
    setEmailData(prev => ({
      ...prev,
      type,
      subject: template.subject,
      message: template.message
    }));
  };

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await commercialProjectManagerService.processIncomingEmail(emailData);
      
      if (result.success) {
        toast({
          title: "Email Processed",
          description: result.staged ? "Action staged for approval" : "Action executed automatically",
        });
        
        // Reset form
        setEmailData({
          from: 'pm@generalcontractor.com',
          subject: '',
          message: '',
          type: 'schedule_change'
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-brandSecondary" />
          <span>Email Simulator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emailType">Email Type</Label>
            <Select value={emailData.type} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select email type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="schedule_change">Schedule Change</SelectItem>
                <SelectItem value="material_request">Material Request</SelectItem>
                <SelectItem value="change_order">Change Order</SelectItem>
                <SelectItem value="aia_billing">AIA Billing</SelectItem>
                <SelectItem value="specs_submittals">Specs/Submittals</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              value={emailData.from}
              onChange={(e) => setEmailData(prev => ({ ...prev, from: e.target.value }))}
              placeholder="sender@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={emailData.subject}
            onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Email subject"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={emailData.message}
            onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Email message content"
            rows={6}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSendEmail} className="bg-brandSecondary hover:bg-brandSecondary/90">
            <Send className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This simulator sends test emails to the Commercial Project Manager service. 
            Check the Staged Actions tab to see processed emails awaiting approval.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSimulator;

