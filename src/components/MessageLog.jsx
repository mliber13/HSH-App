import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mail, Smartphone, Clock, User, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const MessageLog = ({ jobId, messages = [] }) => {
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const getDeliveryMethodIcon = (method) => {
    switch (method) {
      case 'sms':
        return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'email':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'both':
        return (
          <div className="flex space-x-1">
            <Smartphone className="h-4 w-4 text-green-600" />
            <Mail className="h-4 w-4 text-blue-600" />
          </div>
        );
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const isIncomingMessage = (message) => {
    return message.direction === 'inbound' || message.id?.startsWith('inbound_');
  };

  const getDeliveryMethodText = (method) => {
    switch (method) {
      case 'sms':
        return 'SMS';
      case 'email':
        return 'Email';
      case 'both':
        return 'SMS & Email';
      default:
        return 'Unknown';
    }
  };

  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const loadMessages = () => {
    try {
      const storedMessages = JSON.parse(localStorage.getItem('jobMessages') || '{}');
      return storedMessages[jobId] || [];
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  };

  const [localMessages, setLocalMessages] = useState(loadMessages());

  useEffect(() => {
    setLocalMessages(loadMessages());
  }, [jobId, messages]);

  const allMessages = messages.length > 0 ? messages : localMessages;

  if (allMessages.length === 0) {
    return (
      <Card className="border-2 border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-700">
            <MessageSquare className="h-5 w-5 mr-2" />
            Message History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No messages sent yet</p>
            <p className="text-gray-500 text-sm mt-1">Messages sent from this job will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-gray-200 bg-gray-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-gray-700">
            <MessageSquare className="h-5 w-5 mr-2" />
            Message History ({allMessages.length})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="text-xs"
            >
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <AnimatePresence>
            {sortedMessages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Message Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleMessageExpansion(message.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getDeliveryMethodIcon(message.deliveryMethod)}
                                                 <Badge variant="outline" className="text-xs">
                           {isIncomingMessage(message) ? '📨 Response' : getDeliveryMethodText(message.deliveryMethod)}
                         </Badge>
                      </div>
                                             <div>
                         <p className="font-medium text-sm text-gray-900">
                           {isIncomingMessage(message) ? 'From: ' : 'To: '}
                           {isIncomingMessage(message) ? message.sender : `${message.recipients.length} recipient(s)`}
                         </p>
                         <p className="text-xs text-gray-500">
                           {isIncomingMessage(message) ? 'Incoming Response' : 'Outgoing Message'}
                         </p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(message.timestamp)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      {expandedMessages.has(message.id) ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Message Content */}
                <AnimatePresence>
                  {expandedMessages.has(message.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 space-y-4">
                        {/* Message Text */}
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Message:</h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                              {message.message}
                            </p>
                          </div>
                        </div>

                        {/* Recipients */}
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {isIncomingMessage(message) ? 'From:' : `Recipients (${message.recipients?.length || 0}):`}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {isIncomingMessage(message) ? (
                              <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                                <div>
                                  <p className="font-medium text-sm">{message.sender}</p>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <Badge variant="outline" className="text-xs">
                                      {message.type.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              message.recipients?.map((recipient, idx) => (
                              <div
                                key={`${recipient.id}-${idx}`}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                              >
                                <div>
                                  <p className="font-medium text-sm">{recipient.name}</p>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <Badge variant="outline" className="text-xs">
                                      {recipient.type.charAt(0).toUpperCase() + recipient.type.slice(1)}
                                    </Badge>
                                    {recipient.phone && (
                                      <span className="flex items-center">
                                        <Smartphone className="h-3 w-3 mr-1" />
                                        {recipient.phone}
                                      </span>
                                    )}
                                    {recipient.email && (
                                      <span className="flex items-center">
                                        <Mail className="h-3 w-3 mr-1" />
                                        {recipient.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                            )}
                          </div>
                        </div>

                        {/* Message Details */}
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Message ID:</span> {message.id}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span> 
                            <Badge variant="outline" className="ml-1 text-xs text-green-600 border-green-300">
                              {message.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-gray-700">Total Messages</p>
              <p className="text-2xl font-bold text-blue-600">{allMessages.length}</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700">SMS Sent</p>
              <p className="text-2xl font-bold text-green-600">
                {allMessages.filter(m => m.deliveryMethod === 'sms' || m.deliveryMethod === 'both').length}
              </p>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700">Emails Sent</p>
              <p className="text-2xl font-bold text-blue-600">
                {allMessages.filter(m => m.deliveryMethod === 'email' || m.deliveryMethod === 'both').length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageLog; 