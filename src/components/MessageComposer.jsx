import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Mail, Smartphone, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import messageService from '@/services/messageService';

const MessageComposer = ({ job, employees = [], subcontractors = [], vendors = [], onMessageSent }) => {
  const [messageText, setMessageText] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState('both'); // 'sms', 'email', 'both'
  const [isSending, setIsSending] = useState(false);
  const [selectedRecipientType, setSelectedRecipientType] = useState('employees');

  // Combine all potential recipients
  const allRecipients = useMemo(() => {
    const recipients = [];
    
    // Add employees
    employees.forEach(emp => {
      recipients.push({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        type: 'employee',
        phone: emp.phone,
        email: emp.email,
        displayType: 'Employee'
      });
    });
    
    // Add subcontractors
    subcontractors.forEach(sub => {
      recipients.push({
        id: sub.id,
        name: sub.name || sub.companyName,
        type: 'subcontractor',
        phone: sub.phone,
        email: sub.email,
        displayType: 'Subcontractor'
      });
    });
    
    // Add vendors
    vendors.forEach(vendor => {
      recipients.push({
        id: vendor.id,
        name: vendor.name || vendor.companyName,
        type: 'vendor',
        phone: vendor.phone,
        email: vendor.email,
        displayType: 'Vendor'
      });
    });
    
    return recipients;
  }, [employees, subcontractors, vendors]);

  // Filter recipients by selected type
  const filteredRecipients = useMemo(() => {
    if (selectedRecipientType === 'all') return allRecipients;
    return allRecipients.filter(recipient => recipient.type === selectedRecipientType);
  }, [allRecipients, selectedRecipientType]);

  const handleRecipientToggle = (recipientId) => {
    setSelectedRecipients(prev => {
      if (prev.includes(recipientId)) {
        return prev.filter(id => id !== recipientId);
      } else {
        return [...prev, recipientId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedRecipients(filteredRecipients.map(r => r.id));
  };

  const handleClearAll = () => {
    setSelectedRecipients([]);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send.",
        variant: "destructive"
      });
      return;
    }

    if (selectedRecipients.length === 0) {
      toast({
        title: "Recipients Required",
        description: "Please select at least one recipient.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      // Get selected recipient details
      const recipients = allRecipients.filter(r => selectedRecipients.includes(r.id));
      
      // Create message object
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        jobId: job.id,
        sender: 'Current User', // TODO: Get from auth context
        recipients: recipients.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type,
          phone: r.phone,
          email: r.email
        })),
        message: messageText.trim(),
        deliveryMethod,
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      // Send message using the message service
      const sendResults = await messageService.sendMessage({
        recipients: message.recipients,
        message: message.message,
        deliveryMethod: message.deliveryMethod,
        jobContext: {
          jobId: job.id,
          jobName: job.jobName,
          jobType: job.jobType
        }
      });

      // Log results
      console.log('Message send results:', sendResults);

      // Save message to storage
      saveMessageToStorage(message);

      // Clear form
      setMessageText('');
      setSelectedRecipients([]);
      
      // Notify parent component
      if (onMessageSent) {
        onMessageSent(message);
      }

      toast({
        title: "Message Sent! 📱",
        description: `Message sent to ${recipients.length} recipient(s) via ${deliveryMethod === 'both' ? 'SMS and Email' : deliveryMethod.toUpperCase()}.`
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const saveMessageToStorage = (message) => {
    // Save to localStorage (replace with real API call later)
    const existingMessages = JSON.parse(localStorage.getItem('jobMessages') || '{}');
    if (!existingMessages[job.id]) {
      existingMessages[job.id] = [];
    }
    existingMessages[job.id].push(message);
    localStorage.setItem('jobMessages', JSON.stringify(existingMessages));
  };

  const getRecipientCount = () => {
    const counts = {
      employees: allRecipients.filter(r => r.type === 'employee').length,
      subcontractors: allRecipients.filter(r => r.type === 'subcontractor').length,
      vendors: allRecipients.filter(r => r.type === 'vendor').length
    };
    return counts;
  };

  const recipientCounts = getRecipientCount();

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-800">
          <MessageSquare className="h-5 w-5 mr-2" />
          Send Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipient Selection */}
        <div className="space-y-3">
          <Label className="text-blue-800 font-medium">Recipients</Label>
          
          {/* Recipient Type Filter */}
          <div className="flex items-center space-x-4">
            <Select value={selectedRecipientType} onValueChange={setSelectedRecipientType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ({allRecipients.length})</SelectItem>
                <SelectItem value="employees">Employees ({recipientCounts.employees})</SelectItem>
                <SelectItem value="subcontractors">Subcontractors ({recipientCounts.subcontractors})</SelectItem>
                <SelectItem value="vendors">Vendors ({recipientCounts.vendors})</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-gray-600 border-gray-300 hover:bg-gray-50"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Recipients List */}
          <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-white">
            {filteredRecipients.length === 0 ? (
              <p className="text-gray-500 text-sm">No recipients available for this job.</p>
            ) : (
              <div className="space-y-2">
                {filteredRecipients.map(recipient => (
                  <div
                    key={recipient.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                      selectedRecipients.includes(recipient.id)
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleRecipientToggle(recipient.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedRecipients.includes(recipient.id) ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{recipient.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Badge variant="outline" className="text-xs">
                            {recipient.displayType}
                          </Badge>
                          {recipient.phone && <span>📱 {recipient.phone}</span>}
                          {recipient.email && <span>📧 {recipient.email}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selectedRecipients.length > 0 && (
            <p className="text-sm text-blue-600">
              Selected: {selectedRecipients.length} recipient(s)
            </p>
          )}
        </div>

        {/* Delivery Method */}
        <div className="space-y-2">
          <Label className="text-blue-800 font-medium">Delivery Method</Label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="both"
                checked={deliveryMethod === 'both'}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className="text-blue-600"
              />
              <div className="flex items-center space-x-1">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="text-sm">SMS & Email</span>
              </div>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="sms"
                checked={deliveryMethod === 'sms'}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className="text-blue-600"
              />
              <Smartphone className="h-4 w-4 text-blue-600" />
              <span className="text-sm">SMS Only</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="email"
                checked={deliveryMethod === 'email'}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                className="text-blue-600"
              />
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Email Only</span>
            </label>
          </div>
        </div>

        {/* Message Text */}
        <div className="space-y-2">
          <Label className="text-blue-800 font-medium">Message</Label>
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Enter your message here..."
            className="min-h-[100px] border-2 border-blue-200 focus:border-blue-400"
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Keep messages concise and clear</span>
            <span>{messageText.length}/500</span>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !messageText.trim() || selectedRecipients.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Message Guidelines:</p>
              <ul className="space-y-1 text-xs">
                <li>• Keep messages under 500 characters for SMS compatibility</li>
                <li>• Include specific job details or instructions</li>
                <li>• Messages are logged and stored for record keeping</li>
                <li>• Recipients can reply directly to SMS/email</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageComposer; 