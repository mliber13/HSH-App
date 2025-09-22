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

const QuoteModal = ({ job, estimateCalculations, onClose, isCommercial = false, isResidentialConstruction = false }) => {
  const [emailData, setEmailData] = useState({
    to: job?.clientEmail || '',
    subject: `Quote for ${job?.jobName || 'Project'}`,
    message: `Dear ${job?.clientName || 'Client'},

Please find attached our detailed quote for the ${job?.jobName || 'project'}.

${isCommercial ? 
  `This commercial quote includes comprehensive drywall installation services with detailed breakdown of all labor, materials, and equipment costs. The estimate covers all specified scopes of work with proper overhead and profit calculations.

Bid Version: ${job?.financials?.commercialEstimate?.currentBidVersion || 'Initial'}` :
  isResidentialConstruction ?
  `This residential construction quote includes comprehensive full-home construction services covering all phases from site work through final finishes. The estimate includes detailed breakdowns for excavation, foundation, framing, systems (electrical, plumbing, HVAC), and finishes with proper overhead and profit calculations.

This is a complete turnkey construction project managed by HSH Contractor as the General Contractor.` :
  'The quote includes comprehensive hang and finish specifications with Level 4 finish (industry standard), all materials, and complete installation services.'
}

Total Quote Amount: $${isCommercial ? 
  (estimateCalculations?.finalTotalEstimate || estimateCalculations?.totalWithTax || 0).toFixed(2) :
  isResidentialConstruction ?
  (estimateCalculations?.finalTotal || estimateCalculations?.totalWithTax || 0).toFixed(2) :
  (estimateCalculations?.totalEstimate || 0).toFixed(2)
}
Payment Terms: Net 30 days upon completion

We look forward to working with you on this project.

Best regards,
HSH Contractor Management`
  });

  const [isGenerating, setIsGenerating] = useState(false);

  function getScopeOfWork(job) {
    let scopeText = "";
    
    // Check if this is an in-house GC project
    const isInHouseGC = job?.generalContractor === 'In-House (HSH Contractor)';
    
    // Add job scopes if available
    if (job?.scopes && job.scopes.length > 0) {
      scopeText += "SCOPE OF WORK:\n";
      job.scopes.forEach(scope => {
        scopeText += `• ${scope.name}: ${scope.description || 'Complete installation and finishing'}\n`;
      });
      scopeText += '\n';
    } else {
      scopeText += "SCOPE OF WORK:\n";
      
      if (job?.jobType === 'residential-construction') {
        // Full home construction scope
        scopeText += "• Complete residential home construction services\n";
        scopeText += "• Foundation and site preparation coordination\n";
        scopeText += "• Structural framing and carpentry\n";
        scopeText += "• Drywall installation and finishing\n";
        scopeText += "• Interior and exterior finishing coordination\n";
        scopeText += "• Subcontractor management and oversight\n";
        scopeText += "• Project management and quality control\n";
        scopeText += "• Final walkthrough and client handover\n\n";
      } else if (job?.jobType === 'commercial') {
        scopeText += "• Complete commercial drywall installation and finishing services\n";
        scopeText += "• ACT ceiling installation and finishing\n";
        scopeText += "• Drywall wall and ceiling installation\n";
        scopeText += "• Channel and suspended grid systems\n";
        scopeText += "• Metal framing installation\n";
        scopeText += "• Insulation installation\n";
        scopeText += "• FRP panel installation\n";
        scopeText += "• Door frame installation\n";
        scopeText += "• All materials, labor, and equipment\n\n";
      } else {
        scopeText += "• Complete drywall installation and finishing services\n";
        scopeText += "• Material supply and installation\n";
        scopeText += "• Labor and equipment\n\n";
      }
    }
    
    // Add GC services section for in-house projects
    if (isInHouseGC) {
      scopeText += "GENERAL CONTRACTOR SERVICES:\n";
      scopeText += "• HSH Contractor will serve as the General Contractor for this project\n";
      scopeText += "• Complete project management and coordination\n";
      scopeText += "• Subcontractor management and oversight\n";
      scopeText += "• Quality control and inspection services\n";
      scopeText += "• Schedule management and progress tracking\n";
      scopeText += "• Client communication and updates\n";
      scopeText += "• Final project delivery and warranty management\n\n";
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
    if (job?.jobType === 'residential-construction') {
      scopeText += "• All construction materials for complete home build\n";
      scopeText += "• Foundation and structural materials\n";
      scopeText += "• Framing lumber and hardware\n";
      scopeText += "• Drywall panels, joint compound, tape, and fasteners\n";
      scopeText += "• Insulation materials and vapor barriers\n";
      scopeText += "• Finishing materials and trim\n";
      scopeText += "• All necessary tools and equipment\n";
      scopeText += "• Material procurement and delivery coordination\n\n";
    } else if (job?.jobType === 'commercial') {
      scopeText += "• ACT ceiling tiles and grid systems\n";
      scopeText += "• Drywall panels, joint compound, tape, and fasteners\n";
      scopeText += "• Channel systems and suspended grid components\n";
      scopeText += "• Metal studs, tracks, and framing materials\n";
      scopeText += "• Insulation materials and vapor barriers\n";
      scopeText += "• FRP panels and installation materials\n";
      scopeText += "• Corner bead, edge trim, and finishing materials\n";
      scopeText += "• All necessary tools and equipment\n\n";
    } else {
      scopeText += "• Drywall panels, joint compound, tape, and fasteners\n";
      scopeText += "• Corner bead and edge trim\n";
      scopeText += "• All necessary tools and equipment\n\n";
    }
    
    scopeText += "EXCLUSIONS:\n";
    if (job?.jobType === 'residential-construction') {
      scopeText += "• Landscaping and exterior hardscaping\n";
      scopeText += "• Appliances and fixtures (unless specified)\n";
      scopeText += "• Final painting and decoration (unless specified)\n";
      scopeText += "• Permits and inspections (client responsibility)\n";
      scopeText += "• Additional work not specified in this quote\n";
    } else {
      scopeText += "• Painting and final decoration\n";
      scopeText += "• Electrical, plumbing, or HVAC work\n";
      scopeText += "• Structural modifications\n";
      scopeText += "• Additional work not specified in this quote\n";
    }
    
    // Add warranty information for GC projects
    if (isInHouseGC || job?.jobType === 'residential-construction') {
      scopeText += "\nWARRANTY:\n";
      if (job?.jobType === 'residential-construction') {
        scopeText += "• 2-year warranty on workmanship for full construction projects\n";
        scopeText += "• 1-year warranty on drywall and finishing work\n";
        scopeText += "• Materials warranty per manufacturer specifications\n";
        scopeText += "• Comprehensive warranty management and service\n";
      } else {
        scopeText += "• 1-year warranty on workmanship\n";
        scopeText += "• Materials warranty per manufacturer specifications\n";
        scopeText += "• Professional project management warranty\n";
      }
    }
    
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
      doc.text('HSH Contractor Management', pageWidth / 2, 15, { align: 'center' });
      
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
      yPos += 6;
      if (isCommercial && job?.financials?.commercialEstimate?.currentBidVersion) {
        doc.text(`Bid Version: ${job.financials.commercialEstimate.currentBidVersion}`, 14, yPos);
        yPos += 6;
      }
      yPos += 9;

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

      let tableColumn, tableRows;
      
      if (isCommercial) {
        // Commercial estimate breakdown
        tableColumn = ['Category', 'Description', 'Amount'];
        tableRows = [
          ['Equipment', 'Equipment Costs', `$${estimateCalculations?.equipment?.toFixed(2) || '0.00'}`],
          ['Labor', 'ACT Labor', `$${estimateCalculations?.actLabor?.toFixed(2) || '0.00'}`],
          ['Labor', 'Drywall Labor', `$${estimateCalculations?.drywallLabor?.toFixed(2) || '0.00'}`],
          ['Labor', 'Channel Labor', `$${estimateCalculations?.channelLabor?.toFixed(2) || '0.00'}`],
          ['Labor', 'Suspended Grid Labor', `$${estimateCalculations?.suspendedGridLabor?.toFixed(2) || '0.00'}`],
          ['Labor', 'Metal Framing Labor', `$${estimateCalculations?.metalFramingLabor?.toFixed(2) || '0.00'}`],
          ['Labor', 'Insulation Labor', `$${estimateCalculations?.insulationLabor?.toFixed(2) || '0.00'}`],
          ['Labor', 'FRP Labor', `$${estimateCalculations?.frpLabor?.toFixed(2) || '0.00'}`],
          ['Labor', 'Door Install Labor', `$${estimateCalculations?.doorInstallLabor?.toFixed(2) || '0.00'}`],
          ['Materials', 'ACT Material', `$${estimateCalculations?.actMaterial?.toFixed(2) || '0.00'}`],
          ['Materials', 'Drywall Material', `$${estimateCalculations?.drywallMaterial?.toFixed(2) || '0.00'}`],
          ['Materials', 'Channel Material', `$${estimateCalculations?.channelMaterial?.toFixed(2) || '0.00'}`],
          ['Materials', 'Suspended Grid Material', `$${estimateCalculations?.suspendedGridMaterial?.toFixed(2) || '0.00'}`],
          ['Materials', 'Metal Framing Material', `$${estimateCalculations?.metalFramingMaterial?.toFixed(2) || '0.00'}`],
          ['Materials', 'Insulation Material', `$${estimateCalculations?.insulationMaterial?.toFixed(2) || '0.00'}`],
          ['Materials', 'FRP Material', `$${estimateCalculations?.frpMaterial?.toFixed(2) || '0.00'}`],
          ['', 'Subtotal (Direct Costs)', `$${estimateCalculations?.totalDirectCost?.toFixed(2) || '0.00'}`],
          ['', `Overhead (${estimateCalculations?.overheadPercentage?.toFixed(1) || '0'}%)`, `$${estimateCalculations?.overheadAmount?.toFixed(2) || '0.00'}`],
          ['', `Profit (${estimateCalculations?.profitPercentage?.toFixed(1) || '0'}%)`, `$${estimateCalculations?.profitAmount?.toFixed(2) || '0.00'}`],
          ['', 'Sales Tax (Materials Only)', `$${estimateCalculations?.salesTax?.toFixed(2) || '0.00'}`]
        ];
      } else if (isResidentialConstruction) {
        // Residential Construction estimate breakdown
        tableColumn = ['Phase', 'Item', 'Amount'];
        tableRows = [];
        
        // Add each phase
          const phases = [
            { name: 'Site Work', key: 'sitework', items: ['excavationEarthwork', 'utilities', 'sitePreparation', 'foundation', 'landscaping'] },
            { name: 'Structure', key: 'structure', items: ['framing', 'windowsDoors', 'siding', 'roofing'] },
            { name: 'Mechanicals', key: 'mechanicals', items: ['electrical', 'hvac', 'plumbing'] },
            { name: 'Insulation', key: 'insulation', items: ['wallInsulation', 'ceilingInsulation', 'floorInsulation'] },
            { name: 'Finishes', key: 'finishes', items: ['drywall', 'paint', 'trim', 'appliances', 'cabinets', 'flooring'] },
            { name: 'Management', key: 'management', items: ['projectManagement', 'finalWalkthrough'] }
          ];
        
        phases.forEach(phase => {
          const phaseData = job?.financials?.residentialConstruction?.phases?.[phase.key];
          if (phaseData) {
            phase.items.forEach(itemKey => {
              const item = phaseData.items?.[itemKey];
              if (item && item.total > 0) {
                const itemName = itemKey.charAt(0).toUpperCase() + itemKey.slice(1).replace(/([A-Z])/g, ' $1');
                tableRows.push([phase.name, itemName, `$${item.total.toFixed(2)}`]);
              }
            });
            if (phaseData.total > 0) {
              tableRows.push(['', `${phase.name} Subtotal`, `$${phaseData.total.toFixed(2)}`]);
            }
          }
        });
        
        // Add overhead, profit, and tax
        const residentialConstructionFinancials = job?.financials?.residentialConstruction;
        if (residentialConstructionFinancials) {
          tableRows.push(['', 'Subtotal', `$${calculations.subtotal.toFixed(2)}`]);
          tableRows.push(['', `Overhead (${residentialConstructionFinancials.overhead.percentage}%)`, `$${residentialConstructionFinancials.overhead.amount.toFixed(2)}`]);
          tableRows.push(['', `Profit (${residentialConstructionFinancials.profit.percentage}%)`, `$${residentialConstructionFinancials.profit.amount.toFixed(2)}`]);
          tableRows.push(['', 'Sales Tax', `$${residentialConstructionFinancials.salesTax.amount.toFixed(2)}`]);
        }
      } else {
        // Residential (drywall only) estimate breakdown
        tableColumn = ['Description', 'Rate', 'Quantity', 'Amount'];
        tableRows = [
          ['Drywall Material', `$${estimateCalculations?.drywallMaterialRate?.toFixed(2) || '0.00'}/sqft`, `${estimateCalculations?.sqft?.toLocaleString() || '0'} sqft`, `$${estimateCalculations?.materialCost?.toFixed(2) || '0.00'}`],
          ['Hanging Labor', `$${estimateCalculations?.hangerRate?.toFixed(2) || '0.00'}/sqft`, `${estimateCalculations?.sqft?.toLocaleString() || '0'} sqft`, `$${estimateCalculations?.hangerCost?.toFixed(2) || '0.00'}`],
          ['Finishing Labor', `$${estimateCalculations?.finisherRate?.toFixed(2) || '0.00'}/sqft`, `${estimateCalculations?.sqft?.toLocaleString() || '0'} sqft`, `$${estimateCalculations?.finisherCost?.toFixed(2) || '0.00'}`],
          ['Prep/Clean Labor', `$${estimateCalculations?.prepCleanRate?.toFixed(2) || '0.00'}/sqft`, `${estimateCalculations?.sqft?.toLocaleString() || '0'} sqft`, `$${estimateCalculations?.prepCleanCost?.toFixed(2) || '0.00'}`],
          ['Sales Tax', `${estimateCalculations?.drywallSalesTaxRate?.toFixed(2) || '0.00'}%`, '', `$${estimateCalculations?.salesTax?.toFixed(2) || '0.00'}`]
        ];
      }

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [207, 83, 62] }, // brandPrimary
        styles: { fontSize: 10 },
        columnStyles: isCommercial ? {
          0: { cellWidth: 30, halign: 'center' },
          1: { cellWidth: 80, halign: 'left' },
          2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        } : isResidentialConstruction ? {
          0: { cellWidth: 40, halign: 'left' },
          1: { cellWidth: 80, halign: 'left' },
          2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        } : {
          0: { cellWidth: 60 },
          1: { cellWidth: 35, halign: 'right' },
          2: { cellWidth: 35, halign: 'right' },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Add breakdown information if available
      if (isCommercial && job?.financials?.commercialEstimate?.breakdowns?.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.text('Project Breakdowns:', 14, yPos);
        yPos += 8;
        
        doc.setFont(undefined, 'normal');
        job.financials.commercialEstimate.breakdowns.forEach((breakdown, index) => {
          if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont(undefined, 'bold');
          doc.text(`${breakdown.name}:`, 14, yPos);
          yPos += 6;
          
          doc.setFont(undefined, 'normal');
          const breakdownEquipment = breakdown.equipmentCost || 0;
          const breakdownLabor = (
            ((breakdown.actLaborQty || 0) * (1 + (breakdown.actLaborWaste || 0) / 100) * (breakdown.actLaborUnitCost || 0)) +
            ((breakdown.drywallLaborQty || 0) * (1 + (breakdown.drywallLaborWaste || 0) / 100) * (breakdown.drywallLaborUnitCost || 0)) +
            ((breakdown.channelLaborQty || 0) * (1 + (breakdown.channelLaborWaste || 0) / 100) * (breakdown.channelLaborUnitCost || 0)) +
            ((breakdown.suspendedGridLaborQty || 0) * (1 + (breakdown.suspendedGridLaborWaste || 0) / 100) * (breakdown.suspendedGridLaborUnitCost || 0)) +
            ((breakdown.metalFramingLaborQty || 0) * (1 + (breakdown.metalFramingLaborWaste || 0) / 100) * (breakdown.metalFramingLaborUnitCost || 0)) +
            ((breakdown.insulationLaborQty || 0) * (1 + (breakdown.insulationLaborWaste || 0) / 100) * (breakdown.insulationLaborUnitCost || 0)) +
            ((breakdown.frpLaborQty || 0) * (1 + (breakdown.frpLaborWaste || 0) / 100) * (breakdown.frpLaborUnitCost || 0)) +
            ((breakdown.doorInstallLaborQty || 0) * (1 + (breakdown.doorInstallLaborWaste || 0) / 100) * (breakdown.doorInstallLaborUnitCost || 0))
          );
          const breakdownMaterials = (
            (breakdown.actMaterialCost || 0) +
            (breakdown.drywallMaterialCost || 0) +
            (breakdown.channelMaterialCost || 0) +
            (breakdown.suspendedGridMaterialCost || 0) +
            (breakdown.metalFramingMaterialCost || 0) +
            (breakdown.insulationMaterialCost || 0) +
            (breakdown.frpMaterialCost || 0)
          );
          const breakdownTotal = breakdownEquipment + breakdownLabor + breakdownMaterials;
          
          doc.text(`  Equipment: $${breakdownEquipment.toFixed(2)}`, 20, yPos);
          yPos += 5;
          doc.text(`  Labor: $${breakdownLabor.toFixed(2)}`, 20, yPos);
          yPos += 5;
          doc.text(`  Materials: $${breakdownMaterials.toFixed(2)}`, 20, yPos);
          yPos += 5;
          doc.setFont(undefined, 'bold');
          doc.text(`  Subtotal: $${breakdownTotal.toFixed(2)}`, 20, yPos);
          yPos += 8;
        });
      }

      // Total section
      doc.setFont(undefined, 'bold');
      doc.setFontSize(14);
      doc.text('Total Quote Amount:', pageWidth - 80, yPos);
      const totalAmount = isCommercial ? 
        (estimateCalculations?.finalTotalEstimate || estimateCalculations?.totalWithTax || 0) :
        isResidentialConstruction ?
        (estimateCalculations?.finalTotal || estimateCalculations?.totalWithTax || 0) :
        (estimateCalculations?.totalEstimate || 0);
      doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - 20, yPos, { align: 'right' });
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
      doc.text('Thank you for considering HSH Contractor Management for your project.', pageWidth / 2, yPos, { align: 'center' });
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
                      <span className="font-semibold">Total Quote:</span> ${
                        isCommercial ? 
                          (estimateCalculations?.finalTotalEstimate || estimateCalculations?.totalWithTax || 0).toFixed(2) :
                          isResidentialConstruction ?
                          (estimateCalculations?.finalTotal || estimateCalculations?.totalWithTax || 0).toFixed(2) :
                          (estimateCalculations?.totalEstimate || 0).toFixed(2)
                      }
                    </div>
                    {isCommercial && job?.financials?.commercialEstimate?.currentBidVersion && (
                      <div>
                        <span className="font-semibold">Bid Version:</span> {job.financials.commercialEstimate.currentBidVersion}
                      </div>
                    )}
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