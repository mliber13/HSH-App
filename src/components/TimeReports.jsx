import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, Download, User, Briefcase, Clock, DollarSign, Calculator, Users, Edit, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTimeClock } from '@/hooks/useTimeClock';
import { useJobs } from '@/hooks/useJobs';

const TimeReports = ({ employees }) => {
  const [reportType, setReportType] = useState('employee');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Edit modal states
  const [editTimeEntry, setEditTimeEntry] = useState(null);
  const [editPieceRateEntry, setEditPieceRateEntry] = useState(null);
  const [isEditTimeModalOpen, setIsEditTimeModalOpen] = useState(false);
  const [isEditPieceRateModalOpen, setIsEditPieceRateModalOpen] = useState(false);

  const { 
    timeEntries,
    pieceRateEntries,
    getEmployeeTimeEntries, 
    getEmployeePieceRateEntries,
    getJobTimeEntries,
    getTotalHoursForEmployee,
    getTotalEarningsForEmployee,
    getTotalHoursForJob,
    updateTimeEntry,
    updatePieceRateEntry,
    deleteTimeEntry,
    deletePieceRateEntry
  } = useTimeClock();
  const { jobs } = useJobs();

  // Set default date range to current week
  React.useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    setStartDate(startOfWeek.toISOString().split('T')[0]);
    setEndDate(endOfWeek.toISOString().split('T')[0]);
  }, []);

  const filteredTimeEntries = useMemo(() => {
    let entries = timeEntries;

    if (reportType === 'employee' && selectedEmployee) {
      entries = getEmployeeTimeEntries(selectedEmployee, startDate, endDate);
    } else if (reportType === 'job' && selectedJob) {
      entries = getJobTimeEntries(selectedJob, startDate, endDate);
    } else {
      // All entries with date filter
      if (startDate) {
        entries = entries.filter(entry => 
          new Date(entry.clockInTime) >= new Date(startDate)
        );
      }
      if (endDate) {
        entries = entries.filter(entry => 
          new Date(entry.clockInTime) <= new Date(endDate)
        );
      }
      entries = entries.sort((a, b) => new Date(b.clockInTime) - new Date(a.clockInTime));
    }

    return entries;
  }, [reportType, selectedEmployee, selectedJob, startDate, endDate, timeEntries, getEmployeeTimeEntries, getJobTimeEntries]);

  const filteredPieceRateEntries = useMemo(() => {
    let entries = pieceRateEntries;

    if (reportType === 'employee' && selectedEmployee) {
      entries = getEmployeePieceRateEntries(selectedEmployee, startDate, endDate);
    } else if (reportType === 'job' && selectedJob) {
      entries = entries.filter(entry => entry.jobId === selectedJob);
      if (startDate) {
        entries = entries.filter(entry => 
          new Date(entry.startTime) >= new Date(startDate)
        );
      }
      if (endDate) {
        entries = entries.filter(entry => 
          new Date(entry.startTime) <= new Date(endDate)
        );
      }
    } else {
      // All entries with date filter
      if (startDate) {
        entries = entries.filter(entry => 
          new Date(entry.startTime) >= new Date(startDate)
        );
      }
      if (endDate) {
        entries = entries.filter(entry => 
          new Date(entry.startTime) <= new Date(endDate)
        );
      }
    }

    return entries.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [reportType, selectedEmployee, selectedJob, startDate, endDate, pieceRateEntries, getEmployeePieceRateEntries]);

  const reportSummary = useMemo(() => {
    const totalHours = filteredTimeEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
    const totalEntries = filteredTimeEntries.length + filteredPieceRateEntries.length;
    const completedEntries = filteredTimeEntries.filter(entry => entry.clockOutTime).length + 
                            filteredPieceRateEntries.filter(entry => entry.status === 'completed').length;
    
    let totalHourlyCost = 0;
    filteredTimeEntries.forEach(entry => {
      const employee = employees.find(emp => emp.id === entry.employeeId);
      if (employee && entry.totalHours) {
        totalHourlyCost += entry.totalHours * employee.hourlyRate;
      }
    });

    const totalPieceRateEarnings = filteredPieceRateEntries.reduce((sum, entry) => sum + (entry.totalEarnings || 0), 0);
    const totalApprenticeCosts = filteredPieceRateEntries.reduce((sum, entry) => sum + (entry.apprenticeCost || 0), 0);
    const totalCost = totalHourlyCost + totalPieceRateEarnings + totalApprenticeCosts;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      totalEntries,
      completedEntries,
      totalCost: Math.round(totalCost * 100) / 100,
      totalPieceRateEarnings: Math.round(totalPieceRateEarnings * 100) / 100,
      totalApprenticeCosts: Math.round(totalApprenticeCosts * 100) / 100
    };
  }, [filteredTimeEntries, filteredPieceRateEntries, employees]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
  };

  const getJobName = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job ? job.jobName : 'Unknown';
  };

  const getWorkTypeDisplayName = (role, coat) => {
    if (role === 'Hanger') {
      return 'Hanging';
    }
    
    const coatMap = {
      'tape': 'Tape Coat',
      'bed': 'Bed Coat',
      'skim': 'Skim Coat',
      'level5': 'Level 5 Coat',
      'texture': 'Texture Coat',
      'sand': 'Sand Coat'
    };
    return coatMap[coat] || coat;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Employee', 'Job', 'Type', 'Start Time', 'End Time', 'Hours/Completion', 'Rate', 'Gross Earnings', 'Apprentice', 'Apprentice Cost', 'Net Earnings', 'Notes'];
    const csvData = [];

    // Add time entries
    filteredTimeEntries.forEach(entry => {
      const employee = employees.find(emp => emp.id === entry.employeeId);
      const grossEarnings = entry.totalHours ? (entry.totalHours * (employee?.hourlyRate || 0)).toFixed(2) : '0';
      
      csvData.push([
        formatDate(entry.clockInTime),
        getEmployeeName(entry.employeeId),
        getJobName(entry.jobId),
        'Hourly',
        formatTime(entry.clockInTime),
        entry.clockOutTime ? formatTime(entry.clockOutTime) : 'Still Working',
        entry.totalHours || '0',
        `$${employee?.hourlyRate || 0}/hr`,
        grossEarnings,
        '',
        '0',
        grossEarnings,
        entry.notes || ''
      ]);
    });

    // Add piece rate entries
    filteredPieceRateEntries.forEach(entry => {
      const apprenticeName = entry.apprenticeId ? getEmployeeName(entry.apprenticeId) : '';
      const grossEarnings = (entry.totalEarnings || 0) + (entry.apprenticeCost || 0);
      
      csvData.push([
        formatDate(entry.startTime),
        getEmployeeName(entry.employeeId),
        getJobName(entry.jobId),
        `Piece Rate (${getWorkTypeDisplayName(entry.role, entry.coat)})`,
        formatTime(entry.startTime),
        entry.endTime ? formatTime(entry.endTime) : 'In Progress',
        `${entry.completionPercentage || 0}%`,
        `$${entry.pieceRate || 0}/sqft`,
        grossEarnings.toFixed(2),
        apprenticeName,
        (entry.apprenticeCost || 0).toFixed(2),
        (entry.totalEarnings || 0).toFixed(2),
        entry.notes || ''
      ]);
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Edit handlers
  const handleEditTimeEntry = (entry) => {
    setEditTimeEntry({
      ...entry,
      clockInTime: entry.clockInTime ? new Date(entry.clockInTime).toISOString().slice(0, 16) : '',
      clockOutTime: entry.clockOutTime ? new Date(entry.clockOutTime).toISOString().slice(0, 16) : ''
    });
    setIsEditTimeModalOpen(true);
  };

  const handleEditPieceRateEntry = (entry) => {
    setEditPieceRateEntry({
      ...entry,
      startTime: entry.startTime ? new Date(entry.startTime).toISOString().slice(0, 16) : '',
      endTime: entry.endTime ? new Date(entry.endTime).toISOString().slice(0, 16) : ''
    });
    setIsEditPieceRateModalOpen(true);
  };

  const handleSaveTimeEntry = () => {
    if (!editTimeEntry) return;

    const updates = {
      clockInTime: editTimeEntry.clockInTime ? new Date(editTimeEntry.clockInTime).toISOString() : null,
      clockOutTime: editTimeEntry.clockOutTime ? new Date(editTimeEntry.clockOutTime).toISOString() : null,
      notes: editTimeEntry.notes
    };

    updateTimeEntry(editTimeEntry.id, updates, () => {
      setIsEditTimeModalOpen(false);
      setEditTimeEntry(null);
    });
  };

  const handleSavePieceRateEntry = () => {
    if (!editPieceRateEntry) return;

    const updates = {
      startTime: editPieceRateEntry.startTime ? new Date(editPieceRateEntry.startTime).toISOString() : null,
      endTime: editPieceRateEntry.endTime ? new Date(editPieceRateEntry.endTime).toISOString() : null,
      completionPercentage: parseFloat(editPieceRateEntry.completionPercentage) || 0,
      pieceRate: parseFloat(editPieceRateEntry.pieceRate) || 0,
      totalEarnings: parseFloat(editPieceRateEntry.totalEarnings) || 0,
      apprenticeHours: parseFloat(editPieceRateEntry.apprenticeHours) || 0,
      apprenticeCost: parseFloat(editPieceRateEntry.apprenticeCost) || 0,
      notes: editPieceRateEntry.notes
    };

    updatePieceRateEntry(editPieceRateEntry.id, updates, () => {
      setIsEditPieceRateModalOpen(false);
      setEditPieceRateEntry(null);
    });
  };

  const handleDeleteTimeEntry = () => {
    if (!editTimeEntry) return;

    deleteTimeEntry(editTimeEntry.id, () => {
      setIsEditTimeModalOpen(false);
      setEditTimeEntry(null);
    });
  };

  const handleDeletePieceRateEntry = () => {
    if (!editPieceRateEntry) return;

    deletePieceRateEntry(editPieceRateEntry.id, () => {
      setIsEditPieceRateModalOpen(false);
      setEditPieceRateEntry(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Time Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  <SelectItem value="employee">By Employee</SelectItem>
                  <SelectItem value="job">By Job</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'employee' && (
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName} ({employee.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {reportType === 'job' && (
              <div className="space-y-2">
                <Label>Job</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map(job => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.jobName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-brandSecondary" />
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{reportSummary.totalHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold">{reportSummary.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-brandPrimary" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{reportSummary.completedEntries}</p>
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
                <p className="text-2xl font-bold">${reportSummary.totalPieceRateEarnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Apprentice</p>
                <p className="text-2xl font-bold">${reportSummary.totalApprenticeCosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">${reportSummary.totalCost}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combined Entries Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Time & Piece Rate Entries</CardTitle>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTimeEntries.length === 0 && filteredPieceRateEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No entries found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or date range</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Hours/Completion</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Gross</TableHead>
                    <TableHead>Assistant</TableHead>
                    <TableHead>Net</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Combine and sort all entries by date */}
                  {[
                    ...filteredTimeEntries.map(entry => ({ ...entry, type: 'hourly' })),
                    ...filteredPieceRateEntries.map(entry => ({ ...entry, type: 'piece-rate' }))
                  ]
                    .sort((a, b) => {
                      const dateA = new Date(a.type === 'hourly' ? a.clockInTime : a.startTime);
                      const dateB = new Date(b.type === 'hourly' ? b.clockInTime : b.startTime);
                      return dateB - dateA;
                    })
                    .map((entry, index) => {
                      const employee = employees.find(emp => emp.id === entry.employeeId);
                      const job = jobs.find(j => j.id === entry.jobId);
                      const apprentice = entry.apprenticeId ? employees.find(emp => emp.id === entry.apprenticeId) : null;
                      
                      return (
                        <motion.tr
                          key={`${entry.type}-${entry.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            {formatDate(entry.type === 'hourly' ? entry.clockInTime : entry.startTime)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span>{getEmployeeName(entry.employeeId)}</span>
                              <Badge variant="outline" className="text-xs">
                                {employee?.role}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                              <span>{getJobName(entry.jobId)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={entry.type === 'hourly' ? 'bg-brandSecondary/10 text-brandSecondary' : 'bg-brandPrimary/10 text-brandPrimary'}>
                              {entry.type === 'hourly' ? (
                                <>
                                  <Clock className="h-3 w-3 mr-1" />
                                  Hourly
                                </>
                              ) : (
                                <>
                                  <Calculator className="h-3 w-3 mr-1" />
                                  {getWorkTypeDisplayName(entry.role, entry.coat)}
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatTime(entry.type === 'hourly' ? entry.clockInTime : entry.startTime)}
                          </TableCell>
                          <TableCell>
                            {entry.type === 'hourly' ? (
                              entry.clockOutTime ? (
                                formatTime(entry.clockOutTime)
                              ) : (
                                <span className="text-green-600 font-medium">Still Working</span>
                              )
                            ) : (
                              entry.endTime ? (
                                formatTime(entry.endTime)
                              ) : (
                                <span className="text-brandPrimary font-medium">In Progress</span>
                              )
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {entry.type === 'hourly' 
                                ? (entry.totalHours ? `${entry.totalHours}h` : '-')
                                : (entry.completionPercentage ? `${entry.completionPercentage}%` : '-')
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {entry.type === 'hourly' 
                                ? `$${employee?.hourlyRate || 0}/hr`
                                : `$${entry.pieceRate || 0}/sqft`
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-green-600">
                              {entry.type === 'hourly' 
                                ? (entry.totalHours && employee ? `$${(entry.totalHours * employee.hourlyRate).toFixed(2)}` : '-')
                                : `$${(entry.totalEarnings || 0)}`
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            {entry.type === 'piece-rate' && entry.apprenticeId ? (
                              <div className="text-xs">
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3 text-gray-400" />
                                  <span>{apprentice?.firstName} {apprentice?.lastName}</span>
                                </div>
                                <div className="text-red-600">
                                  {entry.apprenticeHours}h @ ${apprentice?.hourlyRate}/hr
                                </div>
                                <div className="font-medium text-red-600">
                                  -${((entry.apprenticeHours || 0) * (apprentice?.hourlyRate || 0)).toFixed(2)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-green-600">
                              {entry.type === 'hourly' 
                                ? (entry.totalHours && employee ? `$${(entry.totalHours * employee.hourlyRate).toFixed(2)}` : '-')
                                : `$${entry.totalEarnings || 0}`
                              }
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {entry.notes || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => entry.type === 'hourly' ? handleEditTimeEntry(entry) : handleEditPieceRateEntry(entry)}
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Time Entry Modal */}
      <Dialog open={isEditTimeModalOpen} onOpenChange={setIsEditTimeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          {editTimeEntry && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Clock In Time</Label>
                <Input
                  type="datetime-local"
                  value={editTimeEntry.clockInTime}
                  onChange={(e) => setEditTimeEntry({ ...editTimeEntry, clockInTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Clock Out Time</Label>
                <Input
                  type="datetime-local"
                  value={editTimeEntry.clockOutTime}
                  onChange={(e) => setEditTimeEntry({ ...editTimeEntry, clockOutTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editTimeEntry.notes || ''}
                  onChange={(e) => setEditTimeEntry({ ...editTimeEntry, notes: e.target.value })}
                  placeholder="Add notes..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTimeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTimeEntry}>
              Delete
            </Button>
            <Button onClick={handleSaveTimeEntry}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Piece Rate Entry Modal */}
      <Dialog open={isEditPieceRateModalOpen} onOpenChange={setIsEditPieceRateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Piece Rate Entry</DialogTitle>
          </DialogHeader>
          {editPieceRateEntry && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={editPieceRateEntry.startTime}
                  onChange={(e) => setEditPieceRateEntry({ ...editPieceRateEntry, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  value={editPieceRateEntry.endTime}
                  onChange={(e) => setEditPieceRateEntry({ ...editPieceRateEntry, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Completion Percentage (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editPieceRateEntry.completionPercentage || ''}
                  onChange={(e) => setEditPieceRateEntry({ ...editPieceRateEntry, completionPercentage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Piece Rate ($/sqft)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editPieceRateEntry.pieceRate || ''}
                  onChange={(e) => setEditPieceRateEntry({ ...editPieceRateEntry, pieceRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total Earnings ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editPieceRateEntry.totalEarnings || ''}
                  onChange={(e) => setEditPieceRateEntry({ ...editPieceRateEntry, totalEarnings: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apprentice Hours</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={editPieceRateEntry.apprenticeHours || ''}
                  onChange={(e) => setEditPieceRateEntry({ ...editPieceRateEntry, apprenticeHours: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Apprentice Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editPieceRateEntry.apprenticeCost || ''}
                  onChange={(e) => setEditPieceRateEntry({ ...editPieceRateEntry, apprenticeCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editPieceRateEntry.notes || ''}
                  onChange={(e) => setEditPieceRateEntry({ ...editPieceRateEntry, notes: e.target.value })}
                  placeholder="Add notes..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPieceRateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePieceRateEntry}>
              Delete
            </Button>
            <Button onClick={handleSavePieceRateEntry}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeReports;