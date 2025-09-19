import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Send, 
  FileText, 
  User, 
  Mail, 
  Calendar,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const OnboardingForm = ({ employee, onSend, onCancel }) => {
  const [formData, setFormData] = useState({
    message: `Hi ${employee.firstName},\n\nWelcome to HSH Contractor! Please complete the following onboarding documents at your earliest convenience.\n\nBest regards,\nHSH HR Team`,
    documents: [],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    sendEmail: true,
    sendSMS: false
  });

  // Predefined document templates based on employee type
  const documentTemplates = {
    Employee: [
      { id: 'w4', name: 'W-4 Form', required: true, description: 'Employee\'s Withholding Certificate' },
      { id: 'i9', name: 'I-9 Form', required: true, description: 'Employment Eligibility Verification' },
      { id: 'direct_deposit', name: 'Direct Deposit Form', required: false, description: 'Bank account information for payroll' },
      { id: 'emergency_contact', name: 'Emergency Contact Form', required: true, description: 'Emergency contact information' },
      { id: 'employee_handbook', name: 'Employee Handbook Acknowledgment', required: true, description: 'Company policies and procedures' },
      { id: 'safety_training', name: 'Safety Training Acknowledgment', required: true, description: 'Workplace safety guidelines' },
      { id: 'benefits_enrollment', name: 'Benefits Enrollment Form', required: false, description: 'Health insurance and benefits options' },
      { id: 'uniform_agreement', name: 'Uniform Agreement', required: false, description: 'Company uniform policy and agreement' }
    ],
    '1099 Contractor': [
      { id: 'w9', name: 'W-9 Form', required: true, description: 'Request for Taxpayer Identification Number' },
      { id: 'contractor_agreement', name: 'Independent Contractor Agreement', required: true, description: 'Contractor terms and conditions' },
      { id: 'insurance_certificate', name: 'Insurance Certificate', required: true, description: 'Proof of liability insurance' },
      { id: 'emergency_contact', name: 'Emergency Contact Form', required: true, description: 'Emergency contact information' },
      { id: 'safety_training', name: 'Safety Training Acknowledgment', required: true, description: 'Workplace safety guidelines' },
      { id: 'equipment_agreement', name: 'Equipment Agreement', required: false, description: 'Company equipment usage terms' }
    ]
  };

  const availableDocuments = documentTemplates[employee.employeeType] || [];

  const handleDocumentToggle = (documentId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.includes(documentId)
        ? prev.documents.filter(id => id !== documentId)
        : [...prev.documents, documentId]
    }));
  };

  const handleSelectAll = () => {
    const allDocumentIds = availableDocuments.map(doc => doc.id);
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.length === allDocumentIds.length ? [] : allDocumentIds
    }));
  };

  const handleSend = () => {
    if (formData.documents.length === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one document to send.",
        variant: "destructive"
      });
      return;
    }

    const selectedDocuments = availableDocuments.filter(doc => 
      formData.documents.includes(doc.id)
    );

    const onboardingData = {
      message: formData.message,
      documents: selectedDocuments.map(doc => ({
        id: doc.id,
        name: doc.name,
        required: doc.required,
        description: doc.description,
        status: 'pending'
      })),
      dueDate: formData.dueDate,
      sendEmail: formData.sendEmail,
      sendSMS: formData.sendSMS,
      sentDate: new Date().toISOString()
    };

    onSend(employee.id, onboardingData);
  };

  const requiredDocuments = availableDocuments.filter(doc => doc.required);
  const optionalDocuments = availableDocuments.filter(doc => !doc.required);

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Send className="h-5 w-5 mr-2 text-blue-600" />
            Send Onboarding Documents
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="h-5 w-5 mr-2" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-lg font-semibold">{employee.firstName} {employee.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Type</Label>
                  <Badge className="mt-1">
                    {employee.employeeType}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{employee.email}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Role</Label>
                  <p>{employee.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Select Documents
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {formData.documents.length === availableDocuments.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Required Documents */}
              {requiredDocuments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                    Required Documents ({requiredDocuments.length})
                  </h4>
                  <div className="space-y-3">
                    {requiredDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                        <Checkbox
                          id={doc.id}
                          checked={formData.documents.includes(doc.id)}
                          onCheckedChange={() => handleDocumentToggle(doc.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={doc.id} className="font-medium cursor-pointer">
                            {doc.name}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        </div>
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Documents */}
              {optionalDocuments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Optional Documents ({optionalDocuments.length})
                  </h4>
                  <div className="space-y-3">
                    {optionalDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                        <Checkbox
                          id={doc.id}
                          checked={formData.documents.includes(doc.id)}
                          onCheckedChange={() => handleDocumentToggle(doc.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={doc.id} className="font-medium cursor-pointer">
                            {doc.name}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Optional</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.documents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No documents selected</p>
                  <p className="text-sm">Please select the documents you want to send</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message and Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Message & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                  Personal Message
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  placeholder="Enter a personal message for the employee..."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendEmail"
                    checked={formData.sendEmail}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendEmail: checked }))}
                  />
                  <Label htmlFor="sendEmail" className="text-sm font-medium">
                    Send email notification
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendSMS"
                    checked={formData.sendSMS}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendSMS: checked }))}
                  />
                  <Label htmlFor="sendSMS" className="text-sm font-medium">
                    Send SMS notification (if phone number available)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {formData.documents.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Send className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Ready to Send</h4>
                </div>
                <div className="text-sm text-blue-800">
                  <p>• {formData.documents.length} document{formData.documents.length !== 1 ? 's' : ''} selected</p>
                  <p>• Due date: {new Date(formData.dueDate).toLocaleDateString()}</p>
                  <p>• {formData.sendEmail ? 'Email notification will be sent' : 'No email notification'}</p>
                  <p>• {formData.sendSMS ? 'SMS notification will be sent' : 'No SMS notification'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            disabled={formData.documents.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            Send Onboarding Documents
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingForm;
