import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import cashFlowService from '@/services/cashFlowService';

const CashFlowPanel = ({ jobs = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentBalance, setCurrentBalance] = useState(50000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [selectedScenario, setSelectedScenario] = useState('realistic');
  const [cashFlowData, setCashFlowData] = useState(null);
  const [revenueProjections, setRevenueProjections] = useState({});
  const [expenseProjections, setExpenseProjections] = useState({});
  const [recurringExpenses, setRecurringExpenses] = useState({});
  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newRevenue, setNewRevenue] = useState({
    jobId: '',
    amount: '',
    billingDate: '',
    expectedPaymentDate: '',
    description: ''
  });
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    dueDate: '',
    description: '',
    supplier: ''
  });

  const expenseCategories = [
    'materials', 'subcontractors', 'equipment', 'insurance', 
    'utilities', 'rent', 'vehicle_payments', 'other'
  ];

  useEffect(() => {
    loadCashFlowData();
  }, []);

  useEffect(() => {
    if (cashFlowData) {
      calculateCashFlow();
    }
  }, [startDate, endDate, selectedScenario, cashFlowData]);

  const loadCashFlowData = () => {
    const balance = cashFlowService.cashFlowData.currentBalance;
    setCurrentBalance(balance);
    setRevenueProjections(cashFlowService.getRevenueProjections());
    setExpenseProjections(cashFlowService.getExpenseProjections());
    setRecurringExpenses(cashFlowService.getRecurringExpenses());
  };

  const calculateCashFlow = () => {
    const projection = cashFlowService.calculateCashFlowProjection(
      new Date(startDate), 
      new Date(endDate), 
      selectedScenario
    );
    setCashFlowData(projection);
  };

  const handleSaveRevenue = () => {
    if (!newRevenue.jobId || !newRevenue.amount || !newRevenue.expectedPaymentDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const job = jobs.find(j => j.id === newRevenue.jobId);
    cashFlowService.addRevenueProjection(
      newRevenue.jobId,
      job?.name || 'Unknown Job',
      newRevenue.amount,
      newRevenue.billingDate,
      newRevenue.expectedPaymentDate,
      newRevenue.description
    );

    toast({
      title: "Revenue Projection Added! 💰",
      description: `$${newRevenue.amount} projected for ${job?.name || 'Unknown Job'}`
    });

    setNewRevenue({
      jobId: '',
      amount: '',
      billingDate: '',
      expectedPaymentDate: '',
      description: ''
    });
    setShowRevenueForm(false);
    loadCashFlowData();
  };

  const handleSaveExpense = () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    cashFlowService.addExpenseProjection(
      newExpense.category,
      newExpense.amount,
      newExpense.dueDate,
      newExpense.description,
      newExpense.supplier
    );

    toast({
      title: "Expense Projection Added! 💸",
      description: `$${newExpense.amount} expense projected for ${newExpense.category}`
    });

    setNewExpense({
      category: '',
      amount: '',
      dueDate: '',
      description: '',
      supplier: ''
    });
    setShowExpenseForm(false);
    loadCashFlowData();
  };

  const handleUpdateBalance = () => {
    cashFlowService.updateCurrentBalance(currentBalance);
    calculateCashFlow();
    toast({
      title: "Balance Updated! 💳",
      description: `Current balance set to $${currentBalance.toLocaleString()}`
    });
  };

  const exportCashFlowData = () => {
    const data = cashFlowService.exportCashFlowData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-flow-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported! 📁",
      description: "Cash flow data has been downloaded."
    });
  };

  const getFundingGaps = () => {
    if (!cashFlowData) return [];
    return cashFlowService.identifyFundingGaps(cashFlowData);
  };

  const getScenarioComparison = () => {
    return cashFlowService.generateScenarioComparison(new Date(startDate), new Date(endDate));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCashFlowStatusColor = (netCashFlow) => {
    if (netCashFlow > 0) return 'text-green-600 bg-green-50 border-green-200';
    if (netCashFlow < 0) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-green-800">Cash Flow Forecasting</CardTitle>
                <p className="text-green-600 text-sm">Project revenue, track expenses, and identify funding needs</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={exportCashFlowData} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Balance & Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="current-balance">Current Balance</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="current-balance"
                  type="number"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(parseFloat(e.target.value) || 0)}
                  className="text-lg font-bold"
                />
                <Button onClick={handleUpdateBalance} size="sm">
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Projection Period</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span>to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Scenario</Label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="optimistic">Optimistic</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="pessimistic">Pessimistic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={calculateCashFlow} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Update Projection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Gap Alerts */}
      {getFundingGaps().length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800">Funding Gaps Detected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getFundingGaps().map((gap, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-100 border border-red-200 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">
                      {gap.startWeek} to {gap.endWeek}
                    </p>
                    <p className="text-sm text-red-600">
                      Maximum funding needed: {formatCurrency(gap.maxFundingNeeded)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-300">
                    {gap.weeks.length} weeks
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Projected Revenue</p>
                    <p className="text-2xl font-bold">
                      {cashFlowData ? formatCurrency(cashFlowData.reduce((sum, week) => sum + week.revenue, 0)) : '$0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-600">Projected Expenses</p>
                    <p className="text-2xl font-bold">
                      {cashFlowData ? formatCurrency(cashFlowData.reduce((sum, week) => sum + week.expenses, 0)) : '$0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Net Cash Flow</p>
                    <p className="text-2xl font-bold">
                      {cashFlowData ? formatCurrency(cashFlowData.reduce((sum, week) => sum + week.netCashFlow, 0)) : '$0'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Final Balance</p>
                    <p className="text-2xl font-bold">
                      {cashFlowData && cashFlowData.length > 0 ? formatCurrency(cashFlowData[cashFlowData.length - 1].runningBalance) : formatCurrency(currentBalance)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Chart */}
          {cashFlowData && cashFlowData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cashFlowData.slice(0, 12).map((week, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600 w-24">
                          {new Date(week.weekStart).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <span className="text-green-600">+{formatCurrency(week.revenue)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-red-600">-{formatCurrency(week.expenses)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={getCashFlowStatusColor(week.netCashFlow)}>
                          {formatCurrency(week.netCashFlow)}
                        </Badge>
                        <div className="text-sm font-medium">
                          Balance: {formatCurrency(week.runningBalance)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Revenue Projections</h3>
            <Button onClick={() => setShowRevenueForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Revenue
            </Button>
          </div>

          {/* Add Revenue Form */}
          {showRevenueForm && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Add Revenue Projection</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowRevenueForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="revenue-job">Job</Label>
                    <Select value={newRevenue.jobId} onValueChange={(value) => setNewRevenue({...newRevenue, jobId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobs.map(job => (
                          <SelectItem key={job.id} value={job.id}>{job.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="revenue-amount">Amount</Label>
                    <Input
                      id="revenue-amount"
                      type="number"
                      value={newRevenue.amount}
                      onChange={(e) => setNewRevenue({...newRevenue, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenue-payment-date">Expected Payment Date</Label>
                    <Input
                      id="revenue-payment-date"
                      type="date"
                      value={newRevenue.expectedPaymentDate}
                      onChange={(e) => setNewRevenue({...newRevenue, expectedPaymentDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="revenue-billing-date">Billing Date</Label>
                    <Input
                      id="revenue-billing-date"
                      type="date"
                      value={newRevenue.billingDate}
                      onChange={(e) => setNewRevenue({...newRevenue, billingDate: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="revenue-description">Description</Label>
                    <Input
                      id="revenue-description"
                      value={newRevenue.description}
                      onChange={(e) => setNewRevenue({...newRevenue, description: e.target.value})}
                      placeholder="Payment description"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setShowRevenueForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRevenue}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Revenue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue Table */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing Date</TableHead>
                    <TableHead>Expected Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(revenueProjections).map(([jobId, projections]) =>
                    projections.map((projection) => (
                      <TableRow key={projection.id}>
                        <TableCell className="font-medium">{projection.jobName}</TableCell>
                        <TableCell>{formatCurrency(projection.amount)}</TableCell>
                        <TableCell>{projection.billingDate}</TableCell>
                        <TableCell>{projection.expectedPaymentDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            projection.status === 'received' ? 'text-green-600 border-green-300' :
                            projection.status === 'billed' ? 'text-blue-600 border-blue-300' :
                            'text-yellow-600 border-yellow-300'
                          }>
                            {projection.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{projection.description}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Expense Projections</h3>
            <Button onClick={() => setShowExpenseForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {/* Add Expense Form */}
          {showExpenseForm && (
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Add Expense Projection</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowExpenseForm(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="expense-category">Category</Label>
                    <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(category => (
                          <SelectItem key={category} value={category}>{category.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expense-amount">Amount</Label>
                    <Input
                      id="expense-amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-due-date">Due Date</Label>
                    <Input
                      id="expense-due-date"
                      type="date"
                      value={newExpense.dueDate}
                      onChange={(e) => setNewExpense({...newExpense, dueDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expense-supplier">Supplier</Label>
                    <Input
                      id="expense-supplier"
                      value={newExpense.supplier}
                      onChange={(e) => setNewExpense({...newExpense, supplier: e.target.value})}
                      placeholder="Supplier name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="expense-description">Description</Label>
                    <Input
                      id="expense-description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="Expense description"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setShowExpenseForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveExpense}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Expense
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(expenseProjections).map(([category, projections]) =>
                    projections.map((projection) => (
                      <TableRow key={projection.id}>
                        <TableCell className="font-medium capitalize">{category.replace('_', ' ')}</TableCell>
                        <TableCell>{formatCurrency(projection.amount)}</TableCell>
                        <TableCell>{projection.dueDate}</TableCell>
                        <TableCell>{projection.supplier}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            projection.status === 'paid' ? 'text-green-600 border-green-300' :
                            'text-yellow-600 border-yellow-300'
                          }>
                            {projection.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{projection.description}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          {cashFlowData && cashFlowData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cashFlowData.map((week, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-6">
                        <div className="text-sm text-gray-600 w-32">
                          {new Date(week.weekStart).toLocaleDateString()}
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-sm">
                            <span className="text-green-600 font-medium">+{formatCurrency(week.revenue)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-red-600 font-medium">-{formatCurrency(week.expenses)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <Badge className={getCashFlowStatusColor(week.netCashFlow)}>
                          {formatCurrency(week.netCashFlow)}
                        </Badge>
                        <div className="text-sm font-medium">
                          Balance: {formatCurrency(week.runningBalance)}
                        </div>
                        {week.fundingNeeded > 0 && (
                          <Badge variant="outline" className="text-red-600 border-red-300">
                            Need: {formatCurrency(week.fundingNeeded)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No cash flow data available. Set up revenue and expense projections to see the timeline.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(getScenarioComparison()).map(([scenario, data]) => (
                  <Card key={scenario} className="border-2 border-gray-200">
                    <CardHeader>
                      <CardTitle className="capitalize">{scenario} Scenario</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(data.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Expenses</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(data.totalExpenses)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Net Cash Flow</p>
                        <p className={`text-xl font-bold ${data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(data.netCashFlow)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Final Balance</p>
                        <p className={`text-xl font-bold ${data.finalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(data.finalBalance)}
                        </p>
                      </div>
                      {data.fundingGaps.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Funding Gaps</p>
                          <p className="text-sm font-medium text-red-600">{data.fundingGaps.length} periods</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowPanel;
