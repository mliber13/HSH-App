import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Edit3, Trash2, Clock, User, MapPin, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DailyLogSection = ({ job, employees, onGetLogsForJob, onAddLogEntry, onUpdateLogEntry, onDeleteLogEntry, onAddAttachmentToLog, onRemoveAttachmentFromLog }) => {
  const logs = job.dailyLogs || [];

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'progress': return 'bg-blue-100 text-blue-800';
      case 'issue': return 'bg-red-100 text-red-800';
      case 'milestone': return 'bg-green-100 text-green-800';
      case 'note': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLogTypeText = (type) => {
    switch (type) {
      case 'progress': return 'Progress';
      case 'issue': return 'Issue';
      case 'milestone': return 'Milestone';
      case 'note': return 'Note';
      default: return 'Note';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-indigo-700">
              <Calendar className="h-5 w-5 mr-2" />
              Daily Log
              {logs.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700">
                  {logs.length} entr{logs.length !== 1 ? 'ies' : 'y'}
                </Badge>
              )}
            </CardTitle>
            <Button
              onClick={onAddLogEntry}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No daily log entries yet</p>
              <p className="text-gray-500 text-sm mt-1">Track daily progress, issues, and milestones for this job</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={getLogTypeColor(log.type)}>
                              {getLogTypeText(log.type)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(log.date)} at {formatTime(log.date)}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors mb-2">
                            {log.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-3">
                            {log.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            {log.author && (
                              <span className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {getEmployeeName(log.author)}
                              </span>
                            )}
                            {log.location && (
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {log.location}
                              </span>
                            )}
                            {log.hoursWorked && (
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {log.hoursWorked} hours
                              </span>
                            )}
                          </div>
                          
                          {/* Attachments */}
                          {log.attachments && log.attachments.length > 0 && (
                            <div className="flex items-center space-x-2 mb-3">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {log.attachments.length} attachment{log.attachments.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          
                          {/* Tags */}
                          {log.tags && log.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {log.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                          <Button
                            onClick={() => onUpdateLogEntry(log)}
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:bg-indigo-50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteLogEntry(log.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DailyLogSection;
