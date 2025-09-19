import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, Download, User, Calculator, Clock, Wrench, FileText, Edit3, Save, X, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useTimeClock } from '@/hooks/useTimeClock';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PayrollReports = ({ employees }) => {
  console.log("PayrollReports component rendering");
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generatedPayroll, setGeneratedPayroll] = useState(null);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [editedPayrollReport, setEditedPayrollReport] = useState(null);

  const { generatePayroll, payrollEntries, updatePayrollEntry } = useTimeClock();

  // Set default date range to current week
  React.useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    setStartDate(startOfWeek.toISOString().split('T')[0]);
    setEndDate(endOfWeek.toISOString().split('T')[0]);
  }, []);

  // Debug log for generatedPayroll state changes
  useEffect(() => {
    console.log("generatedPayroll state updated:", generatedPayroll);
  }, [generatedPayroll]);

  // Initialize editedPayrollReport when entering edit mode
  useEffect(() => {
    if (isEditingReport && generatedPayroll) {
      // Create a deep copy of the generatedPayroll object
      setEditedPayrollReport(JSON.parse(JSON.stringify(generatedPayroll)));
      console.log("Initialized editedPayrollReport with a deep copy of generatedPayroll");
    }
  }, [isEditingReport, generatedPayroll]);

  const handleGeneratePayroll = () => {
    if (!startDate || !endDate) {
      return;
    }

    generatePayroll(startDate, endDate, (payrollData) => {
      console.log("generatePayroll callback received data:", payrollData);
      setGeneratedPayroll(payrollData);
    });
  };

  const handleSaveEdits = () => {
    if (!editedPayrollReport || !editedPayrollReport.payrollData) return;
    
    // Recalculate the overall totals based on individual employee edits
    const perDiemTotal = editedPayrollReport.payrollData.reduce((sum, emp) => sum + emp.perDiemTotal, 0);
    const fuelAllowance = editedPayrollReport.payrollData.reduce((sum, emp) => sum + emp.fuelAllowance, 0);
    const toolDeductionsTotal = editedPayrollReport.payrollData.reduce((sum, emp) => sum + emp.toolDeductionsTotal, 0);
    const childSupportDeductionTotal = editedPayrollReport.payrollData.reduce((sum, emp) => sum + (emp.childSupportDeduction || 0), 0);
    const miscDeductionTotal = editedPayrollReport.payrollData.reduce((sum, emp) => sum + (emp.miscDeduction || 0), 0);
    
    const updates = {
      payrollData: editedPayrollReport.payrollData,
      perDiemTotal,
      fuelAllowance,
      toolDeductionsTotal,
      childSupportDeductionTotal,
      miscDeductionTotal,
      updatedAt: new Date().toISOString()
    };
    
    console.log("Saving payroll edits:", updates);
    
    updatePayrollEntry(editedPayrollReport.id, updates, () => {
      // Update the local state with the edited values
      setGeneratedPayroll({
        ...editedPayrollReport,
        perDiemTotal,
        fuelAllowance,
        toolDeductionsTotal,
        childSupportDeductionTotal,
        miscDeductionTotal,
        updatedAt: new Date().toISOString()
      });
      setIsEditingReport(false);
      setEditedPayrollReport(null);
    });
  };

  // Define a consistent currentPayrollReport variable to use throughout the component
  const currentPayrollReport = isEditingReport ? editedPayrollReport : generatedPayroll;

  // Handle changes to individual employee allowances and deductions
  const handleEmployeeValueChange = (employeeId, field, value) => {
    console.log(`Updating ${field} for employee ${employeeId} to ${value}`);
    
    if (!editedPayrollReport || !editedPayrollReport.payrollData) return;
    
    const numericValue = parseFloat(value) || 0;
    
    setEditedPayrollReport(prev => {
      if (!prev || !prev.payrollData) return prev;
      
      const updatedPayrollData = prev.payrollData.map(emp => {
        if (emp.employeeId === employeeId) {
          // Update the specific field
          const updatedEmp = { ...emp, [field]: numericValue };
          
          // Recalculate gross and net pay
          const grossPay = updatedEmp.basePay + updatedEmp.pieceRateEarnings + 
                          updatedEmp.perDiemTotal + updatedEmp.fuelAllowance;
                          
          // Calculate total deductions including child support and misc
          const totalDeductions = updatedEmp.toolDeductionsTotal + 
                                 (updatedEmp.childSupportDeduction || 0) + 
                                 (updatedEmp.miscDeduction || 0);
                                 
          const netPay = grossPay - totalDeductions;
          
          return {
            ...updatedEmp,
            grossPay,
            netPay
          };
        }
        return emp;
      });
      
      return {
        ...prev,
        payrollData: updatedPayrollData
      };
    });
  };

  // Handle changes to miscellaneous deduction notes
  const handleMiscDeductionNoteChange = (employeeId, note) => {
    console.log(`Updating misc deduction note for employee ${employeeId} to "${note}"`);
    
    if (!editedPayrollReport || !editedPayrollReport.payrollData) return;
    
    setEditedPayrollReport(prev => {
      if (!prev || !prev.payrollData) return prev;
      
      const updatedPayrollData = prev.payrollData.map(emp => {
        if (emp.employeeId === employeeId) {
          return {
            ...emp,
            miscDeductionNote: note
          };
        }
        return emp;
      });
      
      return {
        ...prev,
        payrollData: updatedPayrollData
      };
    });
  };

  const exportPayrollToCSV = (payrollData) => {
    if (!payrollData || !payrollData.payrollData) {
      console.error("Cannot export CSV: Invalid payroll data");
      return;
    }
    
    const headers = [
      'Employee Name', 'Employee Type', 'Pay Type', 'Regular Hours', 'Overtime Hours', 
      'Total Hours', 'Hourly Rate', 'Weekly Salary', 'Base Pay', 'Piece Rate Earnings',
      'Per Diem Days', 'Per Diem Rate', 'Per Diem Total', 'Fuel Allowance', 
      'Tool Deductions', 'Child Support', 'Misc. Deduction', 'Misc. Note', 'Gross Pay', 'Net Pay', 'Banked Hours'
    ];

    const csvData = payrollData.payrollData.map(emp => [
      emp.employeeName,
      emp.employeeType,
      emp.payType,
      emp.regularHours,
      emp.overtimeHours,
      emp.totalHours,
      emp.hourlyRate,
      emp.salaryAmount,
      emp.basePay.toFixed(2),
      emp.pieceRateEarnings.toFixed(2),
      emp.perDiemDays,
      emp.perDiemRate,
      emp.perDiemTotal.toFixed(2),
      emp.fuelAllowance.toFixed(2),
      emp.toolDeductionsTotal.toFixed(2),
      (emp.childSupportDeduction || 0).toFixed(2),
      (emp.miscDeduction || 0).toFixed(2),
      emp.miscDeductionNote || '',
      emp.grossPay.toFixed(2),
      emp.netPay.toFixed(2),
      emp.bankedHours
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_${startDate}_to_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generatePayrollPDF = () => {
    if (!currentPayrollReport || !currentPayrollReport.payrollData) {
      console.error("Cannot generate PDF: Invalid payroll data");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(207, 83, 62); // brandPrimary color
    doc.text("HSH Contractor Management", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Payroll Report", pageWidth / 2, 30, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(
      `Period: ${new Date(currentPayrollReport.startDate).toLocaleDateString()} - ${new Date(currentPayrollReport.endDate).toLocaleDateString()}`,
      pageWidth / 2, 
      40, 
      { align: "center" }
    );
    
    // Add summary section
    doc.setFontSize(14);
    doc.text("Payroll Summary", 14, 55);
    
    const totalGrossPay = currentPayrollReport.payrollData.reduce((sum, emp) => sum + emp.grossPay, 0);
    const totalNetPay = currentPayrollReport.payrollData.reduce((sum, emp) => sum + emp.netPay, 0);
    const totalHours = currentPayrollReport.payrollData.reduce((sum, emp) => sum + emp.totalHours, 0);
    const totalDeductions = currentPayrollReport.payrollData.reduce((sum, emp) => 
      sum + emp.toolDeductionsTotal + (emp.childSupportDeduction || 0) + (emp.miscDeduction || 0), 0);
    
    doc.setFontSize(10);
    doc.text(`Total Employees: ${currentPayrollReport.payrollData.length}`, 14, 65);
    doc.text(`Total Hours: ${totalHours.toFixed(1)}`, 14, 72);
    doc.text(`Total Gross Pay: $${totalGrossPay.toFixed(2)}`, 14, 79);
    doc.text(`Total Deductions: $${totalDeductions.toFixed(2)}`, 14, 86);
    doc.text(`Total Net Pay: $${totalNetPay.toFixed(2)}`, 14, 93);
    
    // Add employee details table
    doc.setFontSize(14);
    doc.text("Employee Details", 14, 107);
    
    const tableColumn = [
      "Employee", 
      "Type", 
      "Hours", 
      "Base", 
      "Piece Rate", 
      "Allowances", 
      "Deductions", 
      "Net Pay"
    ];
    
    const tableRows = currentPayrollReport.payrollData.map(emp => {
      const totalDeductions = emp.toolDeductionsTotal + (emp.childSupportDeduction || 0) + (emp.miscDeduction || 0);
      
      return [
        emp.employeeName,
        emp.payType === 'salary' ? 'Salary' : 'Hourly',
        emp.totalHours.toFixed(1),
        `$${emp.basePay.toFixed(2)}`,
        `$${emp.pieceRateEarnings.toFixed(2)}`,
        `$${(emp.perDiemTotal + emp.fuelAllowance).toFixed(2)}`,
        `$${totalDeductions.toFixed(2)}`,
        `$${emp.netPay.toFixed(2)}`
      ];
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 112,
      theme: 'grid',
      headStyles: { fillColor: [207, 83, 62] }, // brandPrimary color
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 40 },
        7: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
      }
    });
    
    // Add deduction details table
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text("Deduction Details", 14, finalY);
    
    const deductionColumn = [
      "Employee", 
      "Tool Deductions", 
      "Child Support", 
      "Misc. Deduction", 
      "Misc. Note"
    ];
    
    const deductionRows = currentPayrollReport.payrollData.map(emp => [
      emp.employeeName,
      `$${emp.toolDeductionsTotal.toFixed(2)}`,
      `$${(emp.childSupportDeduction || 0).toFixed(2)}`,
      `$${(emp.miscDeduction || 0).toFixed(2)}`,
      emp.miscDeductionNote || '-'
    ]);
    
    doc.autoTable({
      head: [deductionColumn],
      body: deductionRows,
      startY: finalY + 5,
      theme: 'grid',
      headStyles: { fillColor: [92, 140, 235] }, // brandSecondary color
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 40 },
        4: { cellWidth: 60 }
      }
    });
    
    // Add signature section
    const sigY = doc.lastAutoTable.finalY + 20;
    
    doc.setFontSize(10);
    doc.text("Approved By: _______________________________", 14, sigY);
    doc.text("Date: _______________________________", 14, sigY + 10);
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    
    // Save the PDF
    doc.save(`HSH_Payroll_${startDate}_to_${endDate}.pdf`);
  };

  const payrollSummary = useMemo(() => {
    console.log("Computing payrollSummary with:", {
      isEditingReport,
      editedPayrollReport: editedPayrollReport ? "exists" : "null",
      generatedPayroll: generatedPayroll ? "exists" : "null",
      currentPayrollReport: currentPayrollReport ? "exists" : "null"
    });
    
    // Return null if no valid source data is available
    if (!currentPayrollReport) {
      console.log("No currentPayrollReport available, returning null");
      return null;
    }
    
    // Check if payrollData exists and is an array
    if (!currentPayrollReport.payrollData || !Array.isArray(currentPayrollReport.payrollData)) {
      console.log("currentPayrollReport.payrollData is not a valid array, returning null");
      return null;
    }
    
    console.log("currentPayrollReport.payrollData length:", currentPayrollReport.payrollData.length);

    // Now we can safely proceed with calculations
    const totalGrossPay = currentPayrollReport.payrollData.reduce((sum, emp) => sum + (emp.grossPay || 0), 0);
    const totalNetPay = currentPayrollReport.payrollData.reduce((sum, emp) => sum + (emp.netPay || 0), 0);
    
    // Calculate total deductions including tool, child support, and misc deductions
    const totalToolDeductions = currentPayrollReport.payrollData.reduce((sum, emp) => sum + (emp.toolDeductionsTotal || 0), 0);
    const totalChildSupportDeductions = currentPayrollReport.payrollData.reduce((sum, emp) => sum + (emp.childSupportDeduction || 0), 0);
    const totalMiscDeductions = currentPayrollReport.payrollData.reduce((sum, emp) => sum + (emp.miscDeduction || 0), 0);
    const totalDeductions = totalToolDeductions + totalChildSupportDeductions + totalMiscDeductions;
    
    const totalHours = currentPayrollReport.payrollData.reduce((sum, emp) => sum + (emp.totalHours || 0), 0);
    const totalPieceRate = currentPayrollReport.payrollData.reduce((sum, emp) => sum + (emp.pieceRateEarnings || 0), 0);

    const result = {
      totalGrossPay,
      totalNetPay,
      totalDeductions,
      totalToolDeductions,
      totalChildSupportDeductions,
      totalMiscDeductions,
      totalHours,
      totalPieceRate,
      employeeCount: currentPayrollReport.payrollData.length
    };
    
    console.log("Computed payrollSummary:", result);
    return result;
  }, [currentPayrollReport]);

  // Safe check for rendering payroll data
  const hasPayrollData = () => {
    console.log("hasPayrollData check with currentPayrollReport:", currentPayrollReport);
    return currentPayrollReport && currentPayrollReport.payrollData && Array.isArray(currentPayrollReport.payrollData);
  };

  return (
    <div className="space-y-6">
      {/* Payroll Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Generate Payroll Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleGeneratePayroll}
              disabled={!startDate || !endDate}
              className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Generate Payroll
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      {payrollSummary && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Payroll Summary</h2>
            <div className="flex space-x-2">
              {isEditingReport ? (
                <>
                  <Button 
                    onClick={() => setIsEditingReport(false)} 
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEdits}
                    className="bg-gradient-to-r from-brandPrimary to-brandSecondary text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={() => setIsEditingReport(true)} 
                    variant="outline"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Report
                  </Button>
                  <Button 
                    onClick={generatePayrollPDF} 
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    onClick={() => exportPayrollToCSV(currentPayrollReport)} 
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-brandSecondary" />
                  <div>
                    <p className="text-sm text-gray-600">Employees</p>
                    <p className="text-2xl font-bold">{payrollSummary.employeeCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold">{payrollSummary.totalHours.toFixed(1)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-brandPrimary" />
                  <div>
                    <p className="text-sm text-gray-600">Piece Rate</p>
                    <p className="text-2xl font-bold">${payrollSummary.totalPieceRate.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Deductions</p>
                    <p className="text-2xl font-bold">${payrollSummary.totalDeductions.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Gross Pay</p>
                    <p className="text-2xl font-bold">${payrollSummary.totalGrossPay.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-brandPrimary" />
                  <div>
                    <p className="text-sm text-gray-600">Net Pay</p>
                    <p className="text-2xl font-bold">${payrollSummary.totalNetPay.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Generated Payroll Table */}
      {hasPayrollData() && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Payroll Report: {new Date(currentPayrollReport.startDate).toLocaleDateString()} - {new Date(currentPayrollReport.endDate).toLocaleDateString()}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Pay Type</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Base Pay</TableHead>
                    <TableHead>Piece Rate</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Banked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Use optional chaining to safely access payrollData */}
                  {currentPayrollReport?.payrollData?.map((employee, index) => (
                    <motion.tr
                      key={employee.employeeId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.employeeName}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {employee.employeeType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={employee.payType === 'salary' ? 'bg-brandPrimary/10 text-brandPrimary' : 'bg-brandSecondary/10 text-brandSecondary'}>
                          {employee.payType === 'salary' ? 'Salary' : 'Hourly'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.payType === 'salary' ? (
                            <span className="font-medium">${employee.salaryAmount}/week</span>
                          ) : (
                            <>
                              <div>Reg: {employee.regularHours}h</div>
                              {employee.overtimeHours > 0 && (
                                <div className="text-orange-600">OT: {employee.overtimeHours}h</div>
                              )}
                              <div className="text-xs text-gray-500">@${employee.hourlyRate}/hr</div>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{employee.totalHours}h</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">${employee.basePay.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        {employee.pieceRateEarnings > 0 ? (
                          <span className="font-bold text-brandPrimary">${employee.pieceRateEarnings.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditingReport ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Label className="text-xs w-16">Per Diem:</Label>
                              <Input
                                type="number"
                                value={employee.perDiemTotal}
                                onChange={(e) => handleEmployeeValueChange(
                                  employee.employeeId, 
                                  'perDiemTotal', 
                                  e.target.value
                                )}
                                className="h-7 text-sm"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label className="text-xs w-16">Fuel:</Label>
                              <Input
                                type="number"
                                value={employee.fuelAllowance}
                                onChange={(e) => handleEmployeeValueChange(
                                  employee.employeeId, 
                                  'fuelAllowance', 
                                  e.target.value
                                )}
                                className="h-7 text-sm"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            {employee.perDiemTotal > 0 && (
                              <div>Per Diem: ${employee.perDiemTotal.toFixed(2)}</div>
                            )}
                            {employee.fuelAllowance > 0 && (
                              <div>Fuel: ${employee.fuelAllowance.toFixed(2)}</div>
                            )}
                            {employee.perDiemTotal === 0 && employee.fuelAllowance === 0 && (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditingReport ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Label className="text-xs w-16">Tools:</Label>
                              <Input
                                type="number"
                                value={employee.toolDeductionsTotal}
                                onChange={(e) => handleEmployeeValueChange(
                                  employee.employeeId, 
                                  'toolDeductionsTotal', 
                                  e.target.value
                                )}
                                className="h-7 text-sm"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label className="text-xs w-16">Child Supp:</Label>
                              <Input
                                type="number"
                                value={employee.childSupportDeduction || 0}
                                onChange={(e) => handleEmployeeValueChange(
                                  employee.employeeId, 
                                  'childSupportDeduction', 
                                  e.target.value
                                )}
                                className="h-7 text-sm"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Label className="text-xs w-16">Misc:</Label>
                              <Input
                                type="number"
                                value={employee.miscDeduction || 0}
                                onChange={(e) => handleEmployeeValueChange(
                                  employee.employeeId, 
                                  'miscDeduction', 
                                  e.target.value
                                )}
                                className="h-7 text-sm"
                              />
                            </div>
                            {(employee.miscDeduction > 0 || employee.miscDeductionNote) && (
                              <div className="flex items-start space-x-2">
                                <Label className="text-xs w-16 pt-1">Note:</Label>
                                <Textarea
                                  value={employee.miscDeductionNote || ''}
                                  onChange={(e) => handleMiscDeductionNoteChange(
                                    employee.employeeId,
                                    e.target.value
                                  )}
                                  placeholder="Explanation for misc deduction"
                                  className="text-xs min-h-[60px]"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm">
                            {employee.toolDeductionsTotal > 0 && (
                              <div className="text-red-600">Tools: -${employee.toolDeductionsTotal.toFixed(2)}</div>
                            )}
                            {(employee.childSupportDeduction > 0) && (
                              <div className="text-red-600">Child Support: -${(employee.childSupportDeduction || 0).toFixed(2)}</div>
                            )}
                            {(employee.miscDeduction > 0) && (
                              <div className="text-red-600">
                                Misc: -${(employee.miscDeduction || 0).toFixed(2)}
                                {employee.miscDeductionNote && (
                                  <span className="text-xs ml-1 text-gray-500">({employee.miscDeductionNote})</span>
                                )}
                              </div>
                            )}
                            {employee.toolDeductionsTotal === 0 && 
                             (employee.childSupportDeduction || 0) === 0 && 
                             (employee.miscDeduction || 0) === 0 && (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">${employee.grossPay.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-lg text-green-700">${employee.netPay.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{employee.bankedHours}h</span>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Payroll Entries */}
      {payrollEntries && payrollEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Previous Payroll Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payrollEntries.slice().reverse().map((payroll) => (
                <div key={payroll.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium">
                      {new Date(payroll.startDate).toLocaleDateString()} - {new Date(payroll.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {payroll.payrollData && payroll.payrollData.length} employees • Generated {new Date(payroll.generatedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{payroll.status}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log("View Report button clicked for payroll:", payroll);
                        setGeneratedPayroll(payroll);
                        console.log("After setGeneratedPayroll call, current value:", generatedPayroll);
                      }}
                    >
                      View Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayrollReports;