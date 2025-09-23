import React, { useState, useRef } from 'react';
import { Calculator, Send, FileText, DollarSign, Percent, Building, Hammer, Wrench, Zap, Droplets, Wind, Home, Paperclip, Eye, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';

const ResidentialConstructionActualTab = ({ job, onUpdateJob, employees = [] }) => {
  const [activeTrade, setActiveTrade] = useState('sitework');
  const fileInputRef = useRef(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(null);

  // Add error boundary protection
  if (!job) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No job selected</p>
      </div>
    );
  }

  // Initialize actual financials if they don't exist
  const initializeActualFinancials = () => {
    if (!job.financials) {
      job.financials = {};
    }
    if (!job.financials.actual) {
      job.financials.actual = {
        phases: {},
        totalActual: 0,
        updatedAt: new Date().toISOString()
      };
    }
    return job.financials.actual;
  };

  const actualFinancials = initializeActualFinancials();

  // Trade categories for residential construction
  const tradeCategories = {
    sitework: {
      name: 'Site Work',
      icon: Home,
      items: [
        { key: 'excavation', name: 'Excavation', defaultUnit: 'cy' },
        { key: 'foundation', name: 'Foundation', defaultUnit: 'cy' },
        { key: 'backfill', name: 'Backfill', defaultUnit: 'cy' },
        { key: 'grading', name: 'Grading', defaultUnit: 'sf' }
      ]
    },
    framing: {
      name: 'Framing',
      icon: Hammer,
      items: [
        { key: 'framing', name: 'Framing', defaultUnit: 'sf' },
        { key: 'sheathing', name: 'Sheathing', defaultUnit: 'sf' },
        { key: 'roofing', name: 'Roofing', defaultUnit: 'sf' },
        { key: 'siding', name: 'Siding', defaultUnit: 'sf' }
      ]
    },
    electrical: {
      name: 'Electrical',
      icon: Zap,
      items: [
        { key: 'rough_electrical', name: 'Rough Electrical', defaultUnit: 'ea' },
        { key: 'fixtures', name: 'Fixtures', defaultUnit: 'ea' },
        { key: 'outlets', name: 'Outlets & Switches', defaultUnit: 'ea' }
      ]
    },
    plumbing: {
      name: 'Plumbing',
      icon: Droplets,
      items: [
        { key: 'rough_plumbing', name: 'Rough Plumbing', defaultUnit: 'ea' },
        { key: 'fixtures', name: 'Plumbing Fixtures', defaultUnit: 'ea' },
        { key: 'water_heater', name: 'Water Heater', defaultUnit: 'ea' }
      ]
    },
    hvac: {
      name: 'HVAC',
      icon: Wind,
      items: [
        { key: 'ductwork', name: 'Ductwork', defaultUnit: 'ea' },
        { key: 'equipment', name: 'HVAC Equipment', defaultUnit: 'ea' },
        { key: 'vents', name: 'Vents & Registers', defaultUnit: 'ea' }
      ]
    },
    drywall: {
      name: 'Drywall',
      icon: Building,
      items: [
        { key: 'hanging', name: 'Hanging', defaultUnit: 'sf' },
        { key: 'finishing', name: 'Finishing', defaultUnit: 'sf' },
        { key: 'texture', name: 'Texture', defaultUnit: 'sf' }
      ]
    },
    flooring: {
      name: 'Flooring',
      icon: Home,
      items: [
        { key: 'hardwood', name: 'Hardwood', defaultUnit: 'sf' },
        { key: 'tile', name: 'Tile', defaultUnit: 'sf' },
        { key: 'carpet', name: 'Carpet', defaultUnit: 'sf' }
      ]
    },
    finish: {
      name: 'Finish Work',
      icon: Wrench,
      items: [
        { key: 'trim', name: 'Trim Work', defaultUnit: 'lf' },
        { key: 'paint', name: 'Painting', defaultUnit: 'sf' },
        { key: 'cabinets', name: 'Cabinets', defaultUnit: 'ea' }
      ]
    }
  };

  // Unit types
  const unitTypes = [
    { value: 'sf', label: 'SF (Square Feet)' },
    { value: 'lf', label: 'LF (Linear Feet)' },
    { value: 'cy', label: 'CY (Cubic Yards)' },
    { value: 'ea', label: 'EA (Each)' },
    { value: 'hr', label: 'HR (Hours)' },
    { value: 'day', label: 'Day' }
  ];

  // Initialize phase data if it doesn't exist
  const initializePhaseData = (phase) => {
    if (!actualFinancials.phases[phase]) {
      actualFinancials.phases[phase] = {
        items: {},
        total: 0
      };
    }
    return actualFinancials.phases[phase];
  };

  // Initialize item data if it doesn't exist
  const initializeItemData = (phase, itemKey) => {
    const phaseData = initializePhaseData(phase);
    if (!phaseData.items[itemKey]) {
      const item = tradeCategories[phase]?.items?.find(i => i.key === itemKey);
      phaseData.items[itemKey] = {
        contractor: { 
          type: 'subcontractor', 
          name: '', 
          contact: '', 
          quoteReceived: false, 
          quoteDate: null, 
          quoteAmount: 0, 
          attachments: [] 
        },
        labor: { quantity: 0, unit: item?.defaultUnit || 'sf', ratePerUnit: 0, waste: 5, total: 0 },
        material: { quantity: 0, unit: item?.defaultUnit || 'sf', ratePerUnit: 0, waste: 5, total: 0 },
        subtotal: 0, 
        total: 0, 
        notes: ''
      };
    }
    return phaseData.items[itemKey];
  };

  // Get available subcontractors
  const getAvailableSubcontractors = () => {
    return employees.filter(emp => emp.employeeType === 'Subcontractor');
  };

  // Handle contractor changes
  const handleContractorChange = (phase, itemKey, field, value) => {
    const updatedFinancials = { ...actualFinancials };
    initializeItemData(phase, itemKey);
    updatedFinancials.phases[phase].items[itemKey].contractor[field] = value;
    
    // Auto-fill "HSH Contractor" when "In-House" type is selected
    if (field === 'type' && value === 'in-house') {
      updatedFinancials.phases[phase].items[itemKey].contractor.name = 'HSH Contractor';
    }
    
    // Ensure attachments array exists
    if (!updatedFinancials.phases[phase].items[itemKey].contractor.attachments) {
      updatedFinancials.phases[phase].items[itemKey].contractor.attachments = [];
    }
    
    setActualFinancials(updatedFinancials);
    updateCalculations();
  };

  // Handle input changes
  const handleInputChange = (phase, itemKey, category, field, value) => {
    const updatedFinancials = { ...actualFinancials };
    initializeItemData(phase, itemKey);
    
    if (category) {
      updatedFinancials.phases[phase].items[itemKey][category][field] = parseFloat(value) || 0;
    } else {
      updatedFinancials.phases[phase].items[itemKey][field] = value;
    }
    
    setActualFinancials(updatedFinancials);
    updateCalculations();
  };

  // Update calculations
  const updateCalculations = () => {
    const updatedFinancials = { ...actualFinancials };
    
    Object.keys(updatedFinancials.phases).forEach(phase => {
      const phaseData = updatedFinancials.phases[phase];
      let phaseTotal = 0;
      
      Object.keys(phaseData.items).forEach(itemKey => {
        const item = phaseData.items[itemKey];
        
        // Calculate labor total
        const laborTotal = (item.labor.quantity || 0) * (item.labor.ratePerUnit || 0) * (1 + (item.labor.waste || 0) / 100);
        item.labor.total = laborTotal;
        
        // Calculate material total
        const materialTotal = (item.material.quantity || 0) * (item.material.ratePerUnit || 0) * (1 + (item.material.waste || 0) / 100);
        item.material.total = materialTotal;
        
        // Calculate item total
        if (item.contractor.type === 'subcontractor') {
          item.total = parseFloat(item.contractor.quoteAmount) || 0;
        } else {
          item.total = laborTotal + materialTotal;
        }
        
        item.subtotal = item.total;
        phaseTotal += item.total;
      });
      
      phaseData.total = phaseTotal;
    });
    
    // Calculate grand total
    const grandTotal = Object.values(updatedFinancials.phases).reduce((sum, phase) => sum + (phase.total || 0), 0);
    updatedFinancials.totalActual = grandTotal;
    updatedFinancials.updatedAt = new Date().toISOString();
    
    setActualFinancials(updatedFinancials);
    onUpdateJob(job.id, { financials: { ...job.financials, actual: updatedFinancials } });
  };

  // Set actual financials state
  const setActualFinancials = (financials) => {
    job.financials.actual = financials;
  };

  // Render trade item input with detailed breakdown
  const renderTradeItem = (phase, item, phaseData) => {
    const itemData = initializeItemData(phase, item.key);
    if (!itemData) return null;

    return (
      <div key={item.key} className="border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">{item.name}</h4>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              ${(itemData.total || 0).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">Actual Cost</div>
          </div>
        </div>

        {/* Contractor Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
          <div>
            <Label className="text-sm font-medium text-gray-700">Contractor Type</Label>
            <Select
              value={itemData.contractor.type}
              onValueChange={(value) => handleContractorChange(phase, item.key, 'type', value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subcontractor">Subcontractor</SelectItem>
                <SelectItem value="in-house">In-House</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Name/Company</Label>
            {itemData.contractor.type === 'subcontractor' ? (
              <Select
                value={itemData.contractor.name}
                onValueChange={(value) => handleContractorChange(phase, item.key, 'name', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select subcontractor" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSubcontractors().map((subcontractor) => (
                    <SelectItem key={subcontractor.id} value={subcontractor.name}>
                      {subcontractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={itemData.contractor.name}
                onChange={(e) => handleContractorChange(phase, item.key, 'name', e.target.value)}
                placeholder="Enter name or company"
                className="h-8"
              />
            )}
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Contact</Label>
            <Input
              value={itemData.contractor.contact}
              onChange={(e) => handleContractorChange(phase, item.key, 'contact', e.target.value)}
              placeholder="Phone or email"
              className="h-8"
            />
          </div>
        </div>

        {/* Quote Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-blue-50 rounded">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={itemData.contractor.quoteReceived}
              onChange={(e) => handleContractorChange(phase, item.key, 'quoteReceived', e.target.checked)}
              className="rounded"
            />
            <Label className="text-sm font-medium text-gray-700">Quote Received</Label>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Actual Amount</Label>
            <Input
              type="number"
              step="0.01"
              value={itemData.contractor.quoteAmount}
              onChange={(e) => handleContractorChange(phase, item.key, 'quoteAmount', e.target.value)}
              placeholder="0.00"
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Completion Date</Label>
            <Input
              type="date"
              value={itemData.contractor.quoteDate || ''}
              onChange={(e) => handleContractorChange(phase, item.key, 'quoteDate', e.target.value)}
              className="h-8"
            />
          </div>
        </div>

        {/* Labor and Material Breakdown - Only for In-House contractors */}
        {itemData.contractor.type === 'in-house' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Labor Section */}
            <div className="border border-gray-200 rounded p-3">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Hammer className="h-4 w-4 mr-2 text-blue-600" />
                Labor
              </h5>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={itemData.labor.quantity}
                      onChange={(e) => handleInputChange(phase, item.key, 'labor', 'quantity', e.target.value)}
                      placeholder="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Unit</Label>
                    <Select
                      value={itemData.labor.unit}
                      onValueChange={(value) => handleInputChange(phase, item.key, 'labor', 'unit', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unitTypes.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">Rate per Unit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={itemData.labor.ratePerUnit}
                      onChange={(e) => handleInputChange(phase, item.key, 'labor', 'ratePerUnit', e.target.value)}
                      placeholder="0.00"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Waste %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={itemData.labor.waste}
                      onChange={(e) => handleInputChange(phase, item.key, 'labor', 'waste', e.target.value)}
                      placeholder="5"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">Labor Total: </span>
                  <span className="font-semibold text-blue-600">
                    ${(itemData.labor.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Material Section */}
            <div className="border border-gray-200 rounded p-3">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Building className="h-4 w-4 mr-2 text-green-600" />
                Material
              </h5>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">Quantity</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={itemData.material.quantity}
                      onChange={(e) => handleInputChange(phase, item.key, 'material', 'quantity', e.target.value)}
                      placeholder="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Unit</Label>
                    <Select
                      value={itemData.material.unit}
                      onValueChange={(value) => handleInputChange(phase, item.key, 'material', 'unit', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {unitTypes.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">Rate per Unit</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={itemData.material.ratePerUnit}
                      onChange={(e) => handleInputChange(phase, item.key, 'material', 'ratePerUnit', e.target.value)}
                      placeholder="0.00"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Waste %</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={itemData.material.waste}
                      onChange={(e) => handleInputChange(phase, item.key, 'material', 'waste', e.target.value)}
                      placeholder="5"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">Material Total: </span>
                  <span className="font-semibold text-green-600">
                    ${(itemData.material.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subcontractor Total - Only for Subcontractors */}
        {itemData.contractor.type === 'subcontractor' && (
          <div className="border border-gray-200 rounded p-4 bg-gray-50">
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
              Actual Subcontractor Cost
            </h5>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(parseFloat(itemData.contractor.quoteAmount) || 0).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Actual Cost Amount</p>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mt-4">
          <Label className="text-sm font-medium text-gray-700">Notes</Label>
          <Input
            value={itemData.notes}
            onChange={(e) => handleInputChange(phase, item.key, null, 'notes', e.target.value)}
            placeholder="Additional notes or specifications..."
            className="mt-1"
          />
        </div>
      </div>
    );
  };

  // Render trade category
  const renderTradeCategory = (phaseKey, category) => {
    const Icon = category.icon;
    const phaseData = initializePhaseData(phaseKey);
    const phaseItems = tradeCategories[phaseKey]?.items || [];

    return (
      <div key={phaseKey} className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-600">
              ${(phaseData.total || 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">Actual Total</div>
          </div>
        </div>
        
        <div className="space-y-4">
          {phaseItems.map(item => renderTradeItem(phaseKey, item, phaseData))}
        </div>
      </div>
    );
  };

  // Calculate totals
  const getCalculations = () => {
    const totalActual = Object.values(actualFinancials.phases || {}).reduce((sum, phase) => sum + (phase.total || 0), 0);
    return {
      totalActual: totalActual
    };
  };

  const calculations = getCalculations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Actual Costs - {job.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${calculations.totalActual.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Total Actual Cost</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(actualFinancials.phases || {}).length}
              </div>
              <div className="text-sm text-gray-600">Trade Categories</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(actualFinancials.phases || {}).reduce((sum, phase) => sum + Object.keys(phase.items || {}).length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Categories */}
      <Tabs value={activeTrade} onValueChange={setActiveTrade}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {Object.entries(tradeCategories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={key} value={key} className="text-xs">
                <Icon className="h-4 w-4 mr-1" />
                {category.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(tradeCategories).map(([phaseKey, category]) => (
          <TabsContent key={phaseKey} value={phaseKey} className="space-y-6">
            {renderTradeCategory(phaseKey, category)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ResidentialConstructionActualTab;
