import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, X, Building2, FileText, Layers, Package, Building, Home, Send, Truck } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import supplierService from '@/services/supplierService';

const TakeoffReportModal = ({ job, isOpen, onClose }) => {
  const [showSendForm, setShowSendForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    if (isOpen) {
      try {
        setSuppliers(supplierService.getSuppliers());
      } catch (error) {
        console.error('Error loading suppliers:', error);
        setSuppliers([]);
      }
    }
  }, [isOpen]);

  if (!job) return null;

  const jobType = job.jobType || 'residential';

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 45; 
    const pageHeight = doc.internal.pageSize.height;
    const marginBottom = 20;

    const checkAndAddPage = (neededHeight) => {
      if (yPos + neededHeight > pageHeight - marginBottom) {
        doc.addPage();
        yPos = 20; 
      }
    };
    
    doc.setFontSize(18);
    doc.text(`Takeoff Report: ${job.jobName}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`GC: ${job.generalContractor}`, 14, 30);
    if (job.address) {
        doc.text(`Address: ${job.address}`, 14, 36);
    }
    
    // Add job type indicator
    doc.setFontSize(12);
    doc.setTextColor(jobType === 'residential' ? 34 : 59);
    doc.text(`${jobType.charAt(0).toUpperCase() + jobType.slice(1)} Project`, 14, 42);
    doc.setTextColor(0);

    const tableColumn = ["Material Type", "Dimensions", "Quantity (pcs)", "SqFt/Board", "Total SqFt"];
    const accessoryColumn = ["Accessory Type", "Specific Item", "Details", "Quantity", "Unit"];
    let overallTotalBoardCount = 0;
    let overallTotalSquareFootage = 0;

    (job.takeoffPhases || []).forEach(phase => {
        checkAndAddPage(20); 
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Phase: ${phase.name}`, 14, yPos + 8);
        doc.setFont(undefined, 'normal');
        yPos += 16;

        // Add phase accessories if they exist
        if (phase.materials && phase.materials.length > 0) {
            checkAndAddPage(20);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bolditalic');
            doc.text(`Phase Accessories:`, 16, yPos);
            doc.setFont(undefined, 'normal');
            yPos += 7;

            const accessoryRows = [];
            phase.materials.forEach(material => {
                let details = '';
                if (material.length) details += `${material.length} `;
                if (material.threadType) details += `${material.threadType}`;
                
                const accessoryData = [
                    material.type,
                    material.subtype || '',
                    details.trim(),
                    material.quantity.toString(),
                    material.unit
                ];
                accessoryRows.push(accessoryData);
            });

            if (accessoryRows.length > 0) {
                checkAndAddPage(accessoryRows.length * 10 + 20);
                doc.autoTable({
                    head: [accessoryColumn],
                    body: accessoryRows,
                    startY: yPos,
                    theme: 'grid',
                    headStyles: { fillColor: [207, 83, 62] }, // brandPrimary color
                    didDrawPage: (data) => { yPos = data.cursor.y + 5; }
                });
                yPos = doc.lastAutoTable.finalY + 10;
            }
        }

        if (jobType === 'residential') {
          // Residential: Process by floor/space
          (phase.entries || []).forEach(entry => {
              checkAndAddPage(20); 
              doc.setFontSize(12);
              doc.setFont(undefined, 'bolditalic');
              doc.text(`Floor/Space: ${entry.floorSpace}`, 16, yPos);
              doc.setFont(undefined, 'normal');
              yPos += 7;

              const tableRows = [];
              let floorSpaceTotalBoards = 0;
              let floorSpaceTotalSqFt = 0;

              (entry.boards || []).forEach(board => {
                  const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
                  const totalSqft = parseInt(board.quantity, 10) * sqftPerBoard;
                  floorSpaceTotalBoards += parseInt(board.quantity, 10);
                  floorSpaceTotalSqFt += totalSqft;

                  const itemData = [
                      board.boardType,
                      `${board.thickness}" x ${board.width}" x ${board.length}'`,
                      board.quantity.toString(),
                      sqftPerBoard.toFixed(2),
                      totalSqft.toFixed(2)
                  ];
                  tableRows.push(itemData);
              });

              overallTotalBoardCount += floorSpaceTotalBoards;
              overallTotalSquareFootage += floorSpaceTotalSqFt;
              
              if(tableRows.length > 0) {
                  checkAndAddPage(tableRows.length * 8 + 15); // Reduced height estimate
                  doc.autoTable({
                      head: [tableColumn],
                      body: tableRows,
                      startY: yPos,
                      theme: 'grid',
                      headStyles: { fillColor: [92, 140, 235] }, // brandSecondary color
                      foot: [
                          ['Subtotal for ' + entry.floorSpace, '', floorSpaceTotalBoards.toString() + ' pcs', '', floorSpaceTotalSqFt.toFixed(2) + ' SqFt']
                      ],
                      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
                      didDrawPage: (data) => { yPos = data.cursor.y + 5; } 
                  });
                   yPos = doc.lastAutoTable.finalY + 10;
              } else {
                   doc.setFontSize(10);
                   doc.setTextColor(150);
                   doc.text('No board entries for this floor/space.', 18, yPos);
                   yPos += 7;
              }
          });
        } else {
          // Commercial: Process by unit type and generate separate entries for each unit
          (phase.entries || []).forEach(entry => {
              if (!entry.unitType || !entry.unitNumbers) return;
              
              const unitNumbers = entry.unitNumbers.split(',').map(num => num.trim()).filter(Boolean);
              if (unitNumbers.length === 0) return;
              
              checkAndAddPage(20); 
              doc.setFontSize(12);
              doc.setFont(undefined, 'bolditalic');
              doc.text(`Unit Type: ${entry.unitType} (${unitNumbers.length} units)`, 16, yPos);
              doc.setFont(undefined, 'normal');
              yPos += 7;
              
              // List all unit numbers
              doc.setFontSize(10);
              doc.text(`Units: ${unitNumbers.join(', ')}`, 18, yPos);
              yPos += 7;

              const tableRows = [];
              let unitTypeTotalBoards = 0;
              let unitTypeTotalSqFt = 0;

              (entry.boards || []).forEach(board => {
                  const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
                  const totalSqft = parseInt(board.quantity, 10) * sqftPerBoard;
                  unitTypeTotalBoards += parseInt(board.quantity, 10);
                  unitTypeTotalSqFt += totalSqft;

                  const itemData = [
                      board.boardType,
                      `${board.thickness}" x ${board.width}" x ${board.length}'`,
                      board.quantity.toString(),
                      sqftPerBoard.toFixed(2),
                      totalSqft.toFixed(2)
                  ];
                  tableRows.push(itemData);
              });

              // Multiply by number of units for the overall totals
              overallTotalBoardCount += unitTypeTotalBoards * unitNumbers.length;
              overallTotalSquareFootage += unitTypeTotalSqFt * unitNumbers.length;
              
              if(tableRows.length > 0) {
                  checkAndAddPage(tableRows.length * 8 + 15); // Reduced height estimate
                  doc.autoTable({
                      head: [tableColumn],
                      body: tableRows,
                      startY: yPos,
                      theme: 'grid',
                      headStyles: { fillColor: [92, 140, 235] },
                      foot: [
                          ['Subtotal per unit', '', unitTypeTotalBoards.toString() + ' pcs', '', unitTypeTotalSqFt.toFixed(2) + ' SqFt'],
                          ['Total for all ' + unitNumbers.length + ' units', '', (unitTypeTotalBoards * unitNumbers.length).toString() + ' pcs', '', (unitTypeTotalSqFt * unitNumbers.length).toFixed(2) + ' SqFt']
                      ],
                      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
                      didDrawPage: (data) => { yPos = data.cursor.y + 5; }
                  });
                  yPos = doc.lastAutoTable.finalY + 10;
                  
                  // Generate individual unit reports if there are multiple units
                  if (unitNumbers.length > 1) {
                      checkAndAddPage(10);
                      doc.setFontSize(11);
                      doc.setFont(undefined, 'bold');
                      doc.text('Individual Unit Breakdown:', 16, yPos);
                      doc.setFont(undefined, 'normal');
                      yPos += 7;
                      
                      unitNumbers.forEach((unitNumber, idx) => {
                          checkAndAddPage(10);
                          doc.setFontSize(10);
                          doc.text(`Unit ${unitNumber}:`, 18, yPos);
                          yPos += 5;
                          
                          // We don't need to repeat the full table for each unit since they're identical
                          // Just show a summary
                          doc.text(`• Total Boards: ${unitTypeTotalBoards} pcs`, 20, yPos);
                          yPos += 5;
                          doc.text(`• Total Square Footage: ${unitTypeTotalSqFt.toFixed(2)} SqFt`, 20, yPos);
                          yPos += 7;
                      });
                  }
              } else {
                   doc.setFontSize(10);
                   doc.setTextColor(150);
                   doc.text('No board entries for this unit type.', 18, yPos);
                   yPos += 7;
              }
          });
        }
        yPos += 5; 
    });
    
    checkAndAddPage(20);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Overall Project Totals:', 14, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Board Count: ${overallTotalBoardCount} pcs`, 14, yPos);
    yPos += 6;
    doc.text(`Total Square Footage: ${overallTotalSquareFootage.toFixed(2)} SqFt`, 14, yPos);
    yPos += 10;

    const date = new Date().toLocaleDateString();
    checkAndAddPage(10);
    doc.setFontSize(10);
    doc.text(`Report generated on: ${date}`, 14, doc.internal.pageSize.height - 10);

    doc.save(`Takeoff_Report_${jobType}_${job.jobName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSendToSupplier = () => {
    if (!selectedSupplier) {
      toast({
        title: "Missing Supplier",
        description: "Please select a supplier to send the takeoff to.",
        variant: "destructive"
      });
      return;
    }

    try {
      const supplier = suppliers.find(s => s.id === selectedSupplier);
      const takeoffData = {
        jobId: job.id,
        jobName: job.jobName,
        supplierId: selectedSupplier,
        supplierName: supplier?.name || 'Unknown Supplier',
        notes: deliveryNotes,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };

      supplierService.sendTakeoffToSupplier(takeoffData);
      
      toast({
        title: "Takeoff Sent! 📤",
        description: `Takeoff has been sent to ${supplier?.name}. They will be notified to confirm delivery.`
      });

      // Reset form
      setSelectedSupplier('');
      setDeliveryNotes('');
      setShowSendForm(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send takeoff to supplier.",
        variant: "destructive"
      });
    }
  };

  // Calculate overall totals for display
  let overallTotalBoardCount = 0;
  let overallTotalSquareFootage = 0;

  (job.takeoffPhases || []).forEach(phase => {
    (phase.entries || []).forEach(entry => {
      if (jobType === 'commercial' && entry.unitNumbers) {
        // For commercial: multiply by number of units
        const unitCount = entry.unitNumbers.split(',').filter(num => num.trim()).length;
        (entry.boards || []).forEach(board => {
          const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
          const totalSqft = parseInt(board.quantity, 10) * sqftPerBoard * unitCount;
          overallTotalBoardCount += parseInt(board.quantity, 10) * unitCount;
          overallTotalSquareFootage += totalSqft;
        });
      } else {
        // For residential: use as-is
        (entry.boards || []).forEach(board => {
          const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
          const totalSqft = parseInt(board.quantity, 10) * sqftPerBoard;
          overallTotalBoardCount += parseInt(board.quantity, 10);
          overallTotalSquareFootage += totalSqft;
        });
      }
    });
  });

  const getEntryDisplayName = (entry) => {
    if (jobType === 'commercial') {
      return entry.unitType || 'Unknown Unit Type';
    } else {
      return entry.floorSpace || 'Unknown Floor/Space';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <DialogContent 
            className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-0 shadow-2xl rounded-xl w-[90vw] max-w-4xl max-h-[90vh] flex flex-col">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="h-full flex flex-col"
            >
            <DialogHeader className="p-6 border-b bg-gradient-to-r from-brandPrimary to-brandSecondary text-white rounded-t-lg flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6" />
                    <DialogTitle className="text-2xl font-bold">
                      Material Takeoff Report
                      {jobType === 'commercial' ? (
                        <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">Commercial</span>
                      ) : (
                        <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">Residential</span>
                      )}
                    </DialogTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                    <X className="h-5 w-5"/>
                </Button>
              </div>
              <DialogDescription className="text-white/80 mt-1">
                Summary of materials for: <strong>{job.jobName}</strong>
                {jobType === 'commercial' 
                  ? ', broken down by Unit Type and Unit Number.' 
                  : ', broken down by Floor/Space.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="bg-slate-100 p-3 rounded-lg">
                          <p className="font-semibold text-slate-700">Job Name:</p>
                          <p className="text-slate-900">{job.jobName}</p>
                      </div>
                      <div className="bg-slate-100 p-3 rounded-lg">
                          <p className="font-semibold text-slate-700">General Contractor:</p>
                          <p className="text-slate-900">{job.generalContractor}</p>
                      </div>
                      <div className="bg-slate-100 p-3 rounded-lg">
                          <p className="font-semibold text-slate-700">Job Type:</p>
                          <p className="text-slate-900 flex items-center">
                            {jobType === 'residential' ? (
                              <>
                                <Home className="h-4 w-4 mr-1 text-green-600" />
                                <span className="capitalize">Residential</span>
                              </>
                            ) : (
                              <>
                                <Building className="h-4 w-4 mr-1 text-blue-600" />
                                <span className="capitalize">Commercial</span>
                              </>
                            )}
                          </p>
                      </div>
                       {job.address && (
                          <div className="bg-slate-100 p-3 rounded-lg">
                              <p className="font-semibold text-slate-700">Job Address:</p>
                              <p className="text-slate-900">{job.address}</p>
                          </div>
                      )}
                  </div>

                  {(job.takeoffPhases || []).map(phase => (
                    <div key={phase.id} className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                        <Layers className="h-5 w-5 mr-2 text-brandSecondary" />
                        Phase: {phase.name}
                      </h3>

                      {/* Phase Accessories Section */}
                      {phase.materials && phase.materials.length > 0 && (
                        <div className="mb-4 p-3 bg-brandPrimary/10 rounded-lg border border-brandPrimary/20">
                          <h4 className="text-lg font-semibold text-brandPrimary mb-2 flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            Phase Accessories
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-bold">Type</TableHead>
                                <TableHead className="font-bold">Item</TableHead>
                                <TableHead className="font-bold">Details</TableHead>
                                <TableHead className="font-bold text-right">Qty</TableHead>
                                <TableHead className="font-bold">Unit</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {phase.materials.map((material, index) => {
                                let details = '';
                                if (material.length) details += `${material.length} `;
                                if (material.threadType) details += `${material.threadType}`;
                                
                                return (
                                  <TableRow key={index}>
                                    <TableCell className="font-medium text-sm">{material.type}</TableCell>
                                    <TableCell className="text-sm">{material.subtype || '-'}</TableCell>
                                    <TableCell className="text-sm">{details.trim() || '-'}</TableCell>
                                    <TableCell className="text-right text-sm">{material.quantity}</TableCell>
                                    <TableCell className="text-sm">{material.unit}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      {/* Entries Section - Different for Residential vs Commercial */}
                      {(phase.entries || []).length > 0 ? (
                        jobType === 'residential' ? (
                          // Residential Entries
                          (phase.entries || []).map(entry => (
                            <div key={entry.id} className="mb-4 p-3 border rounded-md bg-white">
                              <h4 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                                <Home className="h-5 w-5 mr-2 text-green-600" />
                                Floor/Space: {entry.floorSpace}
                              </h4>
                              {entry.notes && (
                                <p className="text-xs text-gray-500 italic mb-2">Notes: {entry.notes}</p>
                              )}
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="font-bold">Material</TableHead>
                                    <TableHead className="font-bold text-right">Qty</TableHead>
                                    <TableHead className="font-bold text-right">SqFt/Board</TableHead>
                                    <TableHead className="font-bold text-right">Total SqFt</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {(entry.boards || []).map((board, index) => {
                                    const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
                                    const totalSqft = parseInt(board.quantity, 10) * sqftPerBoard;
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <p className="font-medium text-sm">{board.boardType}</p>
                                          <p className="text-xs text-gray-600">{board.thickness}" x {board.width}" x {board.length}'</p>
                                        </TableCell>
                                        <TableCell className="text-right text-sm">{board.quantity} pcs</TableCell>
                                        <TableCell className="text-right text-sm">{sqftPerBoard.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-sm">{totalSqft.toFixed(2)}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          ))
                        ) : (
                          // Commercial Entries
                          (phase.entries || []).map(entry => {
                            if (!entry.unitType || !entry.unitNumbers) return null;
                            
                            const unitNumbers = entry.unitNumbers.split(',').map(num => num.trim()).filter(Boolean);
                            if (unitNumbers.length === 0) return null;
                            
                            // Calculate totals for this unit type
                            let unitTypeTotalBoards = 0;
                            let unitTypeTotalSqFt = 0;
                            
                            (entry.boards || []).forEach(board => {
                              const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
                              const totalSqft = parseInt(board.quantity, 10) * sqftPerBoard;
                              unitTypeTotalBoards += parseInt(board.quantity, 10);
                              unitTypeTotalSqFt += totalSqft;
                            });
                            
                            return (
                              <div key={entry.id} className="mb-4 p-3 border rounded-md bg-white">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                                  Unit Type: {entry.unitType}
                                </h4>
                                <div className="bg-blue-50 p-2 rounded mb-3">
                                  <p className="text-sm text-blue-800 font-medium">
                                    Units: {unitNumbers.join(', ')} ({unitNumbers.length} units)
                                  </p>
                                </div>
                                {entry.notes && (
                                  <p className="text-xs text-gray-500 italic mb-2">Notes: {entry.notes}</p>
                                )}
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="font-bold">Material</TableHead>
                                      <TableHead className="font-bold text-right">Qty/Unit</TableHead>
                                      <TableHead className="font-bold text-right">SqFt/Board</TableHead>
                                      <TableHead className="font-bold text-right">SqFt/Unit</TableHead>
                                      <TableHead className="font-bold text-right">Total ({unitNumbers.length} units)</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {(entry.boards || []).map((board, index) => {
                                      const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
                                      const totalSqftPerUnit = parseInt(board.quantity, 10) * sqftPerBoard;
                                      const totalSqftAllUnits = totalSqftPerUnit * unitNumbers.length;
                                      return (
                                        <TableRow key={index}>
                                          <TableCell>
                                            <p className="font-medium text-sm">{board.boardType}</p>
                                            <p className="text-xs text-gray-600">{board.thickness}" x {board.width}" x {board.length}'</p>
                                          </TableCell>
                                          <TableCell className="text-right text-sm">{board.quantity} pcs</TableCell>
                                          <TableCell className="text-right text-sm">{sqftPerBoard.toFixed(2)}</TableCell>
                                          <TableCell className="text-right text-sm">{totalSqftPerUnit.toFixed(2)}</TableCell>
                                          <TableCell className="text-right text-sm font-medium">{totalSqftAllUnits.toFixed(2)}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                    <TableRow className="bg-blue-50">
                                      <TableCell colSpan={2} className="font-medium">Totals per unit</TableCell>
                                      <TableCell className="text-right">{unitTypeTotalBoards} pcs</TableCell>
                                      <TableCell className="text-right">{unitTypeTotalSqFt.toFixed(2)} SqFt</TableCell>
                                      <TableCell className="text-right font-bold">{(unitTypeTotalSqFt * unitNumbers.length).toFixed(2)} SqFt</TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </div>
                            );
                          })
                        )
                      ) : (
                        <p className="text-gray-600 italic text-sm">No takeoff entries for this phase.</p>
                      )}
                    </div>
                  ))}

                  {/* Overall Project Totals */}
                  <div className="mt-8 p-6 border-2 border-brandSecondary/20 rounded-lg bg-brandSecondary/10">
                    <h3 className="text-xl font-bold text-brandSecondary mb-4">Overall Project Totals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-brandSecondary font-semibold text-sm">Total Board Count</p>
                        <p className="text-2xl font-bold text-gray-800">{overallTotalBoardCount} pcs</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <p className="text-brandSecondary font-semibold text-sm">Total Square Footage</p>
                        <p className="text-2xl font-bold text-gray-800">{overallTotalSquareFootage.toFixed(2)} SqFt</p>
                      </div>
                    </div>
                  </div>

                  {(!job.takeoffPhases || job.takeoffPhases.length === 0) && (
                      <p className="text-gray-600 italic text-center py-8">No takeoff phases or entries found for this job.</p>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <DialogFooter className="p-6 border-t bg-gray-50 rounded-b-lg flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={onClose} className="hover:bg-gray-100">
                  <X className="h-4 w-4 mr-2" /> Close
                </Button>
                <Button onClick={generatePDF} className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white hover:opacity-90">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
                <Button 
                  onClick={() => setShowSendForm(true)} 
                  className={suppliers.length === 0 ? "bg-gray-400 text-white cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}
                  disabled={suppliers.length === 0}
                  title={suppliers.length === 0 ? "No suppliers available. Add suppliers in the Supplier Management panel first." : "Send takeoff to supplier"}
                >
                  <Send className="h-4 w-4 mr-2" /> 
                  {suppliers.length === 0 ? "No Suppliers" : "Send to Supplier"}
                </Button>
              </div>
            </DialogFooter>
            </motion.div>
          </DialogContent>

          {/* Send to Supplier Form Modal */}
          {showSendForm && (
            <Dialog open={showSendForm} onOpenChange={setShowSendForm}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-green-600" />
                    <span>Send Takeoff to Supplier</span>
                  </DialogTitle>
                  <DialogDescription>
                    Send this takeoff report to a supplier for material delivery.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier-select">Select Supplier *</Label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>



                  <div className="space-y-2">
                    <Label htmlFor="delivery-notes">Delivery Instructions</Label>
                    <Textarea
                      id="delivery-notes"
                      placeholder="Special delivery instructions, site access info, contact person, etc."
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSendForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendToSupplier} className="bg-green-600 hover:bg-green-700">
                    <Send className="h-4 w-4 mr-2" />
                    Send Takeoff
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default TakeoffReportModal;