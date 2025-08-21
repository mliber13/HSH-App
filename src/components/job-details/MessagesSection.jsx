import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MessageComposer from '@/components/MessageComposer';
import MessageLog from '@/components/MessageLog';
import { AnimatePresence } from 'framer-motion';

const MessagesSection = ({ job, employees = [], subcontractors = [], vendors = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);

  // Load messages for this job
  useEffect(() => {
    const loadMessages = () => {
      try {
        const storedMessages = JSON.parse(localStorage.getItem('jobMessages') || '{}');
        return storedMessages[job.id] || [];
      } catch (error) {
        console.error('Error loading messages:', error);
        return [];
      }
    };

    setMessages(loadMessages());
  }, [job.id]);

  const handleMessageSent = (newMessage) => {
    setMessages(prev => [newMessage, ...prev]);
  };

  const getMessageCount = () => {
    return messages.length;
  };

  const getRecentMessageCount = () => {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return messages.filter(msg => new Date(msg.timestamp) > oneDayAgo).length;
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="flex items-center text-blue-800">
            <MessageSquare className="h-5 w-5 mr-2" />
            Messages
            {getMessageCount() > 0 && (
              <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {getMessageCount()} total
              </span>
            )}
            {getRecentMessageCount() > 0 && (
              <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {getRecentMessageCount()} today
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-6 pt-0">
              {/* Message Composer */}
              <MessageComposer
                job={job}
                employees={employees}
                subcontractors={subcontractors}
                vendors={vendors}
                onMessageSent={handleMessageSent}
              />
              
              {/* Message Log */}
              <MessageLog
                jobId={job.id}
                messages={messages}
              />
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default MessagesSection;
