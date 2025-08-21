import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Download, X, FileText, Mail, Building2, Calculator } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const QuoteModal = ({ job, estimateCalculations, onClose }) => {
  const [emailData, setEmailData] = useState({
    to: job?.clientEmail || '',
    subject: `Quote for ${job?.jobName || 'Project'}`,
    message: `Dear ${job?.clientName || 'Client'},

Please find attached our detailed quote for the ${job?.jobName || 'project'}.

The quote includes comprehensive hang and finish specifications with Level 4 finish (industry standard), all materials, and complete installation services.

Total Quote Amount: $${estimateCalculations?.totalEstimate?.toFixed(2) || '0.00'}
Payment Terms: Net 30 days upon completion

We look forward to working with you on this project.

Best regards,
HSH Drywall Management`
  });

  const [isGenerating, setIsGenerating] = useState(false);

  function getScopeOfWork(job) {
    let scopeText = "";
    
    // Add job scopes if available
    if (job?.scopes && job.scopes.length > 0) {
      scopeText += "SCOPE OF WORK:\n";
      job.scopes.forEach(scope => {
        scopeText += `• ${scope.name}: ${scope.description || 'Complete installation and finishing'}\n`;
      });
      scopeText += '\n';
    } else {
      scopeText += "SCOPE OF WORK:\n";
      scopeText += "• Complete drywall installation and finishing services\n";
      scopeText += "• Material supply and installation\n";
      scopeText += "• Labor and equipment\n\n";
    }
    
    // Add detailed specifications from scopes
    const finishScopes = job?.scopes?.filter(scope => 
      scope.name.toLowerCase().includes('finish') || 
      scope.ceilingFinish || 
      scope.wallFinish
    ) || [];
    
    if (finishScopes.length > 0) {
      scopeText += "FINISH SPECIFICATIONS:\n";
      finishScopes.forEach(scope => {
        // Ceiling finish details
        if (scope.ceilingFinish) {
          const ceilingFinish = scope.ceilingFinish === 'Other' ? scope.ceilingFinishOther : scope.ceilingFinish;
          scopeText += `• Primary ceiling finish: ${ceilingFinish}\n`;
          if (scope.ceilingExceptions) {
            scopeText += `  Exceptions: ${scope.ceilingExceptions}\n`;
          }
        }
        
        // Wall finish details
        if (scope.wallFinish) {
          const wallFinish = scope.wallFinish === 'Other' ? scope.wallFinishOther : scope.wallFinish;
          scopeText += `• Primary wall finish: ${wallFinish}\n`;
          if (scope.wallExceptions) {
            scopeText += `  Exceptions: ${scope.wallExceptions}\n`;
          }
        }
      });
      scopeText += '\n';
    }
    
    // Add hang specifications from scopes
    const hangScopes = job?.scopes?.filter(scope => 
      scope.name.toLowerCase().includes('hang') || 
      scope.ceilingThickness || 
      scope.wallThickness
    ) || [];
    
    if (hangScopes.length > 0) {
      scopeText += "HANG SPECIFICATIONS:\n";
      hangScopes.forEach(scope => {
        if (scope.ceilingThickness) {
          scopeText += `• Ceiling thickness: ${scope.ceilingThickness}\n`;
        }
        if (scope.wallThickness) {
          scopeText += `• Wall thickness: ${scope.wallThickness}\n`;
        }
        if (scope.hangExceptions) {
          scopeText += `• Hang exceptions: ${scope.hangExceptions}\n`;
        }
      });
      scopeText += '\n';
    }
    
    // Add basic specifications if no detailed specs found
    if (finishScopes.length === 0 && hangScopes.length === 0) {
      scopeText += "SPECIFICATIONS:\n";
      scopeText += "• Level 4 finish on all walls and ceilings (industry standard)\n";
      scopeText += "• Proper joint compound application and sanding\n";
      scopeText += "• Installation of corner bead and edge trim\n";
      scopeText += "• Clean work area upon completion\n\n";
    }
    
    scopeText += "MATERIALS INCLUDED:\n";
    scopeText += "• Drywall panels, joint compound, tape, and fasteners\n";
    scopeText += "• Corner bead and edge trim\n";
    scopeText += "• All necessary tools and equipment\n\n";
    
    scopeText += "EXCLUSIONS:\n";
    scopeText += "• Painting and final decoration\n";
    scopeText += "• Electrical, plumbing, or HVAC work\n";
    scopeText += "• Structural modifications\n";
    scopeText += "• Additional work not specified in this quote";
    
    return scopeText;
  }

  const generateQuotePDF = () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Header with company branding
      doc.setFillColor(207, 83, 62); // brandPrimary
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('HSH Drywall Management', pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Professional Drywall Installation & Finishing', pageWidth / 2, 25, { align: 'center' });
      doc.text('Phone: (555) 123-4567 | Email: info@hshdrywall.com', pageWidth / 2, 32, { align: 'center' });

      // Reset text color
      doc.setTextColor(0, 0, 0);
      yPos = 50;

      // Quote title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('PROJECT QUOTE', pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Project details
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Project Information:', 14, yPos);
      yPos += 8;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Project Name: ${job?.jobName || 'N/A'}`, 14, yPos);
      yPos += 6;
      doc.text(`General Contractor: ${job?.generalContractor || 'N/A'}`, 14, yPos);
      yPos += 6;
      if (job?.address) {
        doc.text(`Address: ${job.address}`, 14, yPos);
        yPos += 6;
      }
      doc.text(`Project Type: ${job?.jobType === 'residential' ? 'Residential' : 'Commercial'}`, 14, yPos);
      yPos += 6;
      doc.text(`Quote Date: ${new Date().toLocaleDateString()}`, 14, yPos);
      yPos += 15;

      // Scope of Work
      doc.setFont(undefined, 'bold');
      doc.text('Scope of Work:', 14, yPos);
      yPos += 8;
      
      doc.setFont(undefined, 'normal');
      const scopeText = getScopeOfWork(job);
      const scopeLines = doc.splitTextToSize(scopeText, pageWidth - 28);
      scopeLines.forEach(line => {
        doc.text(line, 14, yPos);
        yPos += 5;
      });
      yPos += 10;

      // Cost breakdown table
      doc.setFont(undefined, 'bold');
      doc.text('Cost Breakdown:', 14, yPos);
      yPos += 8;

      const tableColumn = ['Description', 'Rate', 'Quantity', 'Amount'];
      const tableRows = [
        ['Drywall Material', `$${estimateCalculations?.drywallMaterialRate?.toFixed(2) || '0.00'}/sqft`, `${estimateCalculations?.sqft?.toLocaleString() || '0'} sqft`, `$${estimateCalculations?.materialCost?.toFixed(2) || '0.00'}`],
        ['Hanging Labor', `$${estimateCalculations?.hangerRate?.toFixed(2) || '0.00'}/sqft`, `${estimateCalculations?.sqft?.toLocaleString() || '0'} sqft`, `$${estimateCalculations?.hangerCost?.toFixed(2) || '0.00'}`],
        ['Finishing Labor', `$${estimateCalculations?.finisherRate?.toFixed(2) || '0.00'}/sqft`, `${estimateCalculations?.sqft?.toLocaleString() || '0'} sqft`, `$${estimateCalculations?.finisherCost?.toFixed(2) || '0.00'}`],
        ['Prep/Clean Labor', `$${estimateCalculations?.prepCleanRate?.toFixed(2) || '0.00'}/sqft`, `${estimateCalculations?.sqft?.toLocaleString() || '0'} sqft`, `$${estimateCalculations?.prepCleanCost?.toFixed(2) || '0.00'}`],
        ['Sales Tax', `${estimateCalculations?.drywallSalesTaxRate?.toFixed(2) || '0.00'}%`, '', `$${estimateCalculations?.salesTax?.toFixed(2) || '0.00'}`]
      ];

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [207, 83, 62] }, // brandPrimary
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 35, halign: 'right' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Total section
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('Total Quote Amount:', pageWidth - 80, yPos);
      doc.text(`$${estimateCalculations?.totalEstimate?.toFixed(2) || '0.00'}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 20;

      // Terms and conditions
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Terms & Conditions:', 14, yPos);
      yPos += 8;
      
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
             const terms = [
         '• This quote is valid for 30 days from the date of issue',
         '• Payment terms: Net 30 days upon completion of work',
         '• Project timeline will be determined upon contract signing',
         '• All work includes standard drywall installation and finishing',
         '• Additional work or changes will be quoted separately',
         '• We carry full liability and workers compensation insurance',
         '• Work area must be ready for drywall installation (framing complete, electrical/plumbing rough-in complete)',
         '• Client is responsible for providing access to work area during normal business hours'
       ];
      
      terms.forEach(term => {
        doc.text(term, 14, yPos);
        yPos += 5;
      });

      // Footer
      yPos = pageHeight - 30;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for considering HSH Drywall Management for your project.', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      doc.text('For questions or to proceed with this quote, please contact us.', pageWidth / 2, yPos, { align: 'center' });

      // Save the PDF
      const fileName = `Quote_${job?.jobName?.replace(/\s+/g, '_') || 'Project'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Quote Generated! 📄",
        description: `Quote PDF has been downloaded as "${fileName}"`
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate quote PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = () => {
    if (!emailData.to.trim()) {
      toast({
        title: "Missing Email",
        description: "Please enter a recipient email address.",
        variant: "destructive"
      });
      return;
    }

    // Generate PDF first, then send email
    generateQuotePDF();
    
    // Create email with attachment
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.message);
    const mailtoLink = `mailto:${emailData.to}?subject=${subject}&body=${body}`;
    
    // Open default email client
    window.open(mailtoLink);
    
    toast({
      title: "Email Client Opened! 📧",
      description: "Your default email client has been opened with the quote details."
    });
  };

  const handleDownloadOnly = () => {
    generateQuotePDF();
  };

  return (
    <AnimatePresence>
      <Dialog open={true} onOpenChange={onClose}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
        <DialogContent 
          className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl w-[95vw] max-w-4xl flex flex-col max-h-[90vh] overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="h-full flex flex-col"
          >
            <DialogHeader className="p-6 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6" />
                  <DialogTitle className="text-2xl font-bold">Generate Quote</DialogTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <DialogDescription className="text-white/90 mt-2">
                Create and send a professional quote for {job?.jobName || 'this project'}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Project Summary */}
              <Card className="border-2 border-brandSecondary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Building2 className="h-5 w-5 mr-2 text-brandSecondary" />
                    Project Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Project:</span> {job?.jobName || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold">Type:</span> {job?.jobType === 'residential' ? 'Residential' : 'Commercial'}
                    </div>
                    <div>
                      <span className="font-semibold">Square Footage:</span> {estimateCalculations?.sqft?.toLocaleString() || '0'} sqft
                    </div>
                    <div>
                      <span className="font-semibold">Total Quote:</span> ${estimateCalculations?.totalEstimate?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scope of Work Preview */}
              <Card className="border-2 border-brandSecondary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Calculator className="h-5 w-5 mr-2 text-brandSecondary" />
                    Scope of Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{getScopeOfWork(job)}</pre>
                  </div>
                </CardContent>
              </Card>

              {/* Email Configuration */}
              <Card className="border-2 border-brandSecondary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Mail className="h-5 w-5 mr-2 text-brandSecondary" />
                    Email Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-to">To:</Label>
                    <Input
                      id="email-to"
                      type="email"
                      value={emailData.to}
                      onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="client@example.com"
                      className="border-2 focus:border-brandSecondary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject:</Label>
                    <Input
                      id="email-subject"
                      type="text"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      className="border-2 focus:border-brandSecondary"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-message">Message:</Label>
                    <Textarea
                      id="email-message"
                      value={emailData.message}
                      onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                      rows={8}
                      className="border-2 focus:border-brandSecondary resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg">
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-2 border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleDownloadOnly}
                  disabled={isGenerating}
                  className="bg-brandSecondary hover:bg-brandSecondary/90 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Download PDF'}
                </Button>
                
                <Button
                  onClick={handleSendEmail}
                  disabled={isGenerating}
                  className="bg-brandPrimary hover:bg-brandPrimary/90 text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Send Quote'}
                </Button>
              </div>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

export default QuoteModal;
