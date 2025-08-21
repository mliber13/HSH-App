import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Download, Trash2, Edit3, Eye, File, Image, FileArchive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DocumentsSection = ({ job, onUploadDocument, onDeleteDocument, onUpdateDocument }) => {
  const documents = job.documents || [];

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <Image className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'doc':
      case 'docx':
        return <File className="h-4 w-4" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FileArchive className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-orange-700">
              <FileText className="h-5 w-5 mr-2" />
              Documents
              {documents.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                  {documents.length} document{documents.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <Button
              onClick={onUploadDocument}
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No documents uploaded yet</p>
              <p className="text-gray-500 text-sm mt-1">Upload project documents, contracts, and other important files</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document, index) => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Card className="border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            {getFileIcon(document.fileName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors truncate">
                              {document.fileName}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span>{formatFileSize(document.fileSize || 0)}</span>
                              <span>Uploaded: {formatDate(document.uploadDate)}</span>
                              {document.uploadedBy && (
                                <span>By: {document.uploadedBy}</span>
                              )}
                            </div>
                            {document.description && (
                              <p className="text-gray-600 text-sm mt-1">{document.description}</p>
                            )}
                            {document.category && (
                              <Badge className="mt-1 bg-orange-100 text-orange-700 text-xs">
                                {document.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => window.open(document.downloadUrl, '_blank')}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => window.open(document.downloadUrl, '_blank')}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onUpdateDocument(document)}
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:bg-orange-50"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => onDeleteDocument(document.id)}
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

export default DocumentsSection;
