import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Upload, 
  Paperclip,
  ChevronDown,
  ChevronUp,
  Image,
  File
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const DailyLog = ({ 
  jobId, 
  logs = [], 
  employees = [], 
  onAddLog, 
  onUpdateLog, 
  onDeleteLog, 
  onAddAttachment, 
  onRemoveAttachment 
}) => {
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [isExpanded, setIsExpanded] = useState(false);
  const [newLogData, setNewLogData] = useState({
    date: new Date().toISOString().split('T')[0],
    authorId: '',
    notes: ''
  });
  const [editLogData, setEditLogData] = useState({});
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  // Cleanup preview URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup any preview URLs to prevent memory leaks
      try {
        logs.forEach(log => {
          (log.attachments || []).forEach(attachment => {
            if (attachment.previewUrl) {
              URL.revokeObjectURL(attachment.previewUrl);
            }
          });
        });
      } catch (error) {
        console.error('Error cleaning up preview URLs:', error);
      }
    };
  }, [logs]);

  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleAddLog = async () => {
    if (!newLogData.authorId || !newLogData.notes.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onAddLog(jobId, newLogData);
      setNewLogData({
        date: new Date().toISOString().split('T')[0],
        authorId: '',
        notes: ''
      });
      setIsAddingLog(false);
      toast({
        title: "Log Entry Added! 📝",
        description: "Daily log entry has been successfully added."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add log entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateLog = async (logId) => {
    if (!editLogData.authorId || !editLogData.notes?.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onUpdateLog(jobId, logId, editLogData);
      setEditingLog(null);
      setEditLogData({});
      toast({
        title: "Log Entry Updated! ✏️",
        description: "Daily log entry has been successfully updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update log entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLog = async (logId) => {
    try {
      await onDeleteLog(jobId, logId);
      toast({
        title: "Log Entry Deleted! 🗑️",
        description: "Daily log entry has been successfully deleted."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete log entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event, logId) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} is larger than 10MB. Please choose a smaller file.`,
            variant: "destructive"
          });
          continue;
        }

        // Create a preview URL for images
        let previewUrl = null;
        if (file.type.startsWith('image/')) {
          previewUrl = URL.createObjectURL(file);
        }

        const attachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          file: file,
          previewUrl: previewUrl
        };

        await onAddAttachment(jobId, logId, attachment);
      }

      toast({
        title: "Attachments Uploaded! 📎",
        description: `Successfully uploaded ${files.length} attachment(s).`
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the attachments. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const startEditing = (log) => {
    setEditingLog(log.id);
    setEditLogData({
      date: log.date,
      authorId: log.authorId,
      notes: log.notes
    });
  };

  const cancelEditing = () => {
    setEditingLog(null);
    setEditLogData({});
  };

  const getAuthorName = (authorId) => {
    const employee = employees.find(emp => emp.id === authorId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Author';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Add error boundary
  if (!jobId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No job ID provided</p>
      </div>
    );
  }

  return (
    <Card className="border-2 border-orange-200 bg-orange-50">
      <CardHeader>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="flex items-center text-orange-800">
            <FileText className="h-5 w-5 mr-2" />
            Daily Log Entries
            {logs.length > 0 && (
              <span className="ml-2 text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                {logs.length} entries
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-orange-600 hover:bg-orange-100">
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
              {/* Add Log Entry Button */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Track daily activities, progress, and notes for this job</p>
                </div>
                <Button
                  onClick={() => setIsAddingLog(true)}
                  className="bg-gradient-to-r from-brandPrimary to-brandSecondary hover:from-brandPrimary-600 hover:to-brandSecondary-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Log Entry
                </Button>
              </div>

      {/* Add Log Entry Form */}
      <AnimatePresence>
        {isAddingLog && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 border-brandPrimary/20 bg-brandPrimary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">New Log Entry</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAddingLog(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="log-date">Date</Label>
                    <Input
                      id="log-date"
                      type="date"
                      value={newLogData.date}
                      onChange={(e) => setNewLogData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="log-author">Author</Label>
                    <Select
                      value={newLogData.authorId}
                      onValueChange={(value) => setNewLogData(prev => ({ ...prev, authorId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.firstName} {employee.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="log-notes">Notes</Label>
                  <Textarea
                    id="log-notes"
                    placeholder="Enter daily log notes..."
                    value={newLogData.notes}
                    onChange={(e) => setNewLogData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingLog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddLog}
                    className="bg-brandPrimary hover:bg-brandPrimary-600"
                  >
                    Add Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Entries List */}
      <div className="space-y-4">
        {sortedLogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No log entries yet</p>
              <p className="text-gray-500 text-sm mt-1">
                Click "Add Log Entry" to start tracking daily activities
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {editingLog === log.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`edit-date-${log.id}`}>Date</Label>
                          <Input
                            id={`edit-date-${log.id}`}
                            type="date"
                            value={editLogData.date}
                            onChange={(e) => setEditLogData(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-author-${log.id}`}>Author</Label>
                          <Select
                            value={editLogData.authorId}
                            onValueChange={(value) => setEditLogData(prev => ({ ...prev, authorId: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select author" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.firstName} {employee.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`edit-notes-${log.id}`}>Notes</Label>
                        <Textarea
                          id={`edit-notes-${log.id}`}
                          value={editLogData.notes}
                          onChange={(e) => setEditLogData(prev => ({ ...prev, notes: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleUpdateLog(log.id)}
                          className="bg-brandPrimary hover:bg-brandPrimary-600"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {formatDate(log.date)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">
                              {getAuthorName(log.authorId)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLogExpansion(log.id)}
                          >
                            {expandedLogs.has(log.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(log)}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Log Entry?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the log entry and all its attachments.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteLog(log.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{log.notes}</p>
                      </div>

                      {/* Attachments Section */}
                      <AnimatePresence>
                        {expandedLogs.has(log.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t pt-4"
                          >
                                                         <div className="flex items-center justify-between mb-3">
                               <h4 className="font-medium text-gray-900">Attachments</h4>
                               <div className="flex items-center space-x-2">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => fileInputRef.current?.click()}
                                   className="text-sm"
                                 >
                                   <Upload className="h-3 w-3 mr-1" />
                                   Add Files
                                 </Button>
                                 <p className="text-xs text-gray-500">
                                   Images, PDFs, Docs (Max 10MB each)
                                 </p>
                               </div>
                               <input
                                 ref={fileInputRef}
                                 type="file"
                                 multiple
                                 onChange={(e) => handleFileUpload(e, log.id)}
                                 className="hidden"
                                 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.zip,.rar"
                                 capture="environment"
                               />
                             </div>

                                                         {(log.attachments || []).length === 0 ? (
                               <p className="text-sm text-gray-500">No attachments</p>
                             ) : (
                               <div className="space-y-3">
                                 {(log.attachments || []).map((attachment) => (
                                   <div
                                     key={attachment.id}
                                     className="border rounded-lg overflow-hidden"
                                   >
                                     {/* Image Preview */}
                                     {attachment.type.startsWith('image/') && attachment.previewUrl && (
                                       <div className="relative">
                                         <img
                                           src={attachment.previewUrl}
                                           alt={attachment.name}
                                           className="w-full h-48 object-cover"
                                           onError={(e) => {
                                             e.target.style.display = 'none';
                                           }}
                                         />
                                         <div className="absolute top-2 right-2">
                                           <Button
                                             variant="ghost"
                                             size="sm"
                                             onClick={() => onRemoveAttachment(jobId, log.id, attachment.id)}
                                             className="bg-red-500 hover:bg-red-600 text-white h-8 w-8 p-0"
                                           >
                                             <Trash2 className="h-3 w-3" />
                                           </Button>
                                         </div>
                                       </div>
                                     )}
                                     
                                     {/* File Info */}
                                     <div className="flex items-center justify-between p-3 bg-gray-50">
                                       <div className="flex items-center space-x-3">
                                         {attachment.type.startsWith('image/') ? (
                                           <Image className="h-4 w-4 text-blue-500" />
                                         ) : (
                                           <File className="h-4 w-4 text-gray-500" />
                                         )}
                                         <div>
                                           <p className="text-sm font-medium text-gray-900">
                                             {attachment.name}
                                           </p>
                                           <p className="text-xs text-gray-500">
                                             {formatFileSize(attachment.size)}
                                           </p>
                                         </div>
                                       </div>
                                       {!attachment.type.startsWith('image/') && (
                                         <Button
                                           variant="ghost"
                                           size="sm"
                                           onClick={() => onRemoveAttachment(jobId, log.id, attachment.id)}
                                           className="text-red-600 hover:bg-red-50"
                                         >
                                           <Trash2 className="h-3 w-3" />
                                         </Button>
                                       )}
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default DailyLog; 