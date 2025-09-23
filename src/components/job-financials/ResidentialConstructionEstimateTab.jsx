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
import QuoteModal from './QuoteModal';

const ResidentialConstructionEstimateTab = ({ job, onUpdateJob, employees = [] }) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [activeTrade, setActiveTrade] = useState('sitework');
  const fileInputRef = useRef(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(null);

  // Add error boundary protection
  if (!job) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No job data available</p>
      </div>
    );
  }

  // Available unit types
  const unitTypes = [
    { value: 'sqft', label: 'Square Feet (sqft)' },
    { value: 'linear ft', label: 'Linear Feet (LF)' },
    { value: 'each', label: 'Each (EA)' },
    { value: 'hours', label: 'Hours (HR)' },
    { value: 'sheets', label: 'Sheets' },
    { value: 'studs', label: 'Studs' },
    { value: 'batts', label: 'Batts' },
    { value: 'panels', label: 'Panels' },
    { value: 'grids', label: 'Grids' },
    { value: 'sticks', label: 'Sticks' },
    { value: 'lbs', label: 'Pounds (LBS)' },
    { value: 'tons', label: 'Tons' },
    { value: 'yards', label: 'Cubic Yards (CY)' },
    { value: 'gallons', label: 'Gallons (GAL)' }
  ];

  // Estimating categories for residential construction - organized by construction phase
  const tradeCategories = {
    sitework: {
      name: 'Site Work',
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      items: [
        { key: 'excavationEarthwork', label: 'Excavation & Earthwork', defaultUnit: 'sqft' },
        { key: 'utilities', label: 'Utilities', defaultUnit: 'lf' },
        { key: 'sitePreparation', label: 'Site Preparation', defaultUnit: 'sqft' },
        { key: 'foundation', label: 'Foundation', defaultUnit: 'sqft' },
        { key: 'landscaping', label: 'Landscaping', defaultUnit: 'sqft' }
      ]
    },
    structure: {
      name: 'Structure',
      icon: Hammer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      items: [
        { key: 'framing', label: 'Framing', defaultUnit: 'sqft' },
        { key: 'windowsDoors', label: 'Windows & Doors', defaultUnit: 'each' },
        { key: 'siding', label: 'Siding', defaultUnit: 'sqft' },
        { key: 'roofing', label: 'Roofing', defaultUnit: 'sqft' }
      ]
    },
    mechanicals: {
      name: 'Mechanicals',
      icon: Wrench,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      items: [
        { key: 'electrical', label: 'Electrical', defaultUnit: 'sqft' },
        { key: 'hvac', label: 'HVAC', defaultUnit: 'sqft' },
        { key: 'plumbing', label: 'Plumbing', defaultUnit: 'sqft' }
      ]
    },
    insulation: {
      name: 'Insulation',
      icon: Home,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      items: [
        { key: 'wallInsulation', label: 'Wall Insulation', defaultUnit: 'sqft' },
        { key: 'ceilingInsulation', label: 'Ceiling/Attic Insulation', defaultUnit: 'sqft' },
        { key: 'floorInsulation', label: 'Floor Insulation', defaultUnit: 'sqft' }
      ]
    },
    finishes: {
      name: 'Finishes',
      icon: Home,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      items: [
        { key: 'drywall', label: 'Drywall', defaultUnit: 'sqft' },
        { key: 'paint', label: 'Paint', defaultUnit: 'sqft' },
        { key: 'trim', label: 'Trim Work', defaultUnit: 'lf' },
        { key: 'appliances', label: 'Appliances', defaultUnit: 'each' },
        { key: 'cabinets', label: 'Cabinets', defaultUnit: 'lf' },
        { key: 'flooring', label: 'Flooring', defaultUnit: 'sqft' }
      ]
    },
    management: {
      name: 'Management',
      icon: Calculator,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      items: [
        { key: 'projectManagement', label: 'Project Management', defaultUnit: 'hours' },
        { key: 'finalWalkthrough', label: 'Final Walkthrough', defaultUnit: 'hours' }
      ]
    }
  };

  // Initialize financial data structure
  const initializeFinancials = () => {
    console.log('Initializing financials for job:', job);
    try {
      if (!job?.financials?.residentialConstruction) {
        console.log('Creating new residential construction financials');
        const residentialConstructionFinancials = {
        phases: {
          sitework: { items: {}, total: 0 },
          structure: { items: {}, total: 0 },
          mechanicals: { items: {}, total: 0 },
          insulation: { items: {}, total: 0 },
          finishes: { items: {}, total: 0 },
          management: { items: {}, total: 0 }
        },
        overhead: {
          percentage: 15,
          amount: 0
        },
        profit: {
          percentage: 20,
          amount: 0
        },
        salesTax: {
          percentage: 7.25,
          amount: 0
        },
        totalEstimate: 0,
        manualOverride: 0
      };

      // Initialize all trade items with detailed structure
      Object.keys(tradeCategories).forEach(phase => {
        tradeCategories[phase].items.forEach(item => {
          residentialConstructionFinancials.phases[phase].items[item.key] = {
            // Who is doing the work
            contractor: {
              type: 'subcontractor', // 'subcontractor', 'employee', 'in-house'
              name: '',
              contact: '',
              quoteReceived: false,
              quoteDate: null,
              quoteAmount: 0,
              attachments: [] // Array to store quote attachments
            },
            // Labor breakdown
            labor: {
              quantity: 0,
              unit: item.defaultUnit,
              ratePerUnit: 0,
              waste: 5, // 5% default waste
              total: 0
            },
            // Material breakdown
            material: {
              quantity: 0,
              unit: item.defaultUnit,
              ratePerUnit: 0,
              waste: 5, // 5% default waste
              total: 0
            },
            // Combined totals
            subtotal: 0,
            total: 0,
            notes: ''
          };
        });
      });

        return residentialConstructionFinancials;
      }
      
      // If job already has residentialConstruction financials, ensure all phases exist
      const existingFinancials = job.financials.residentialConstruction;
      const requiredPhases = ['sitework', 'structure', 'mechanicals', 'insulation', 'finishes', 'management'];
      
      // Check if any phases are missing and add them, also check for missing items
      let needsUpdate = false;
      requiredPhases.forEach(phase => {
        if (!existingFinancials.phases[phase]) {
          console.log(`Adding missing phase: ${phase}`);
          existingFinancials.phases[phase] = { items: {}, total: 0 };
          needsUpdate = true;
        }
        
        // Check if phase items are missing and add them
        const phaseItems = tradeCategories[phase]?.items || [];
        phaseItems.forEach(item => {
          if (!existingFinancials.phases[phase].items[item.key]) {
            console.log(`Adding missing item: ${item.key} to phase: ${phase}`);
            existingFinancials.phases[phase].items[item.key] = {
              contractor: { type: 'subcontractor', name: '', contact: '', quoteReceived: false, quoteDate: null, quoteAmount: 0, attachments: [] },
              labor: { quantity: 0, unit: item.defaultUnit, ratePerUnit: 0, waste: 5, total: 0 },
              material: { quantity: 0, unit: item.defaultUnit, ratePerUnit: 0, waste: 5, total: 0 },
              subtotal: 0, total: 0, notes: ''
            };
            needsUpdate = true;
          } else {
            // Ensure existing items have attachments array
            if (!existingFinancials.phases[phase].items[item.key].contractor.attachments) {
              existingFinancials.phases[phase].items[item.key].contractor.attachments = [];
              needsUpdate = true;
            }
          }
        });
      });
      
      // If we added missing phases, we should update the job
      if (needsUpdate) {
        console.log('Updated existing financials with missing phases');
        // Trigger a job update to save the changes
        setTimeout(() => {
          onUpdateJob({
            ...job,
            financials: {
              ...job.financials,
              residentialConstruction: existingFinancials
            }
          });
        }, 0);
      }
      
      return existingFinancials;
    } catch (error) {
      console.error('Error initializing financials:', error);
      // Return a basic structure if there's an error
      return {
        phases: {
          sitework: { items: {}, total: 0 },
          structure: { items: {}, total: 0 },
          mechanicals: { items: {}, total: 0 },
          insulation: { items: {}, total: 0 },
          finishes: { items: {}, total: 0 },
          management: { items: {}, total: 0 }
        },
        overhead: { percentage: 15, amount: 0 },
        profit: { percentage: 20, amount: 0 },
        salesTax: { percentage: 7.25, amount: 0 },
        totalEstimate: 0,
        manualOverride: 0
      };
    }
  };

  const [financials, setFinancials] = useState(() => initializeFinancials());

  // Update financial calculations
  const updateCalculations = () => {
    const updatedFinancials = { ...financials };
    
    // Calculate totals for each phase
    Object.keys(updatedFinancials.phases).forEach(phase => {
      let phaseTotal = 0;
      Object.keys(updatedFinancials.phases[phase].items).forEach(itemKey => {
        const item = updatedFinancials.phases[phase].items[itemKey];
        
        // Calculate labor total
        const laborAdjustedQty = (item.labor.quantity || 0) * (1 + (item.labor.waste || 0) / 100);
        item.labor.total = laborAdjustedQty * (item.labor.ratePerUnit || 0);
        
        // Calculate material total
        const materialAdjustedQty = (item.material.quantity || 0) * (1 + (item.material.waste || 0) / 100);
        item.material.total = materialAdjustedQty * (item.material.ratePerUnit || 0);
        
        // Calculate item subtotal and total
        item.subtotal = (item.labor.total || 0) + (item.material.total || 0);
        
        // If contractor quote is received, use that amount, otherwise use calculated total
        if (item.contractor.quoteReceived && item.contractor.quoteAmount > 0) {
          item.total = parseFloat(item.contractor.quoteAmount) || 0;
        } else {
          item.total = item.subtotal || 0;
        }
        
        phaseTotal += (item.total || 0);
      });
      updatedFinancials.phases[phase].total = phaseTotal;
    });

    // Calculate subtotal
    const subtotal = Object.values(updatedFinancials.phases).reduce((sum, phase) => sum + (phase.total || 0), 0);
    
    // Calculate overhead
    updatedFinancials.overhead.amount = subtotal * ((updatedFinancials.overhead.percentage || 0) / 100);
    const subtotalWithOverhead = subtotal + (updatedFinancials.overhead.amount || 0);
    
    // Calculate profit
    updatedFinancials.profit.amount = subtotalWithOverhead * ((updatedFinancials.profit.percentage || 0) / 100);
    const subtotalWithProfit = subtotalWithOverhead + (updatedFinancials.profit.amount || 0);
    
    // Calculate sales tax (on materials only - simplified for now)
    updatedFinancials.salesTax.amount = subtotalWithProfit * ((updatedFinancials.salesTax.percentage || 0) / 100);
    
    // Calculate total estimate
    updatedFinancials.totalEstimate = subtotalWithProfit + (updatedFinancials.salesTax.amount || 0);
    
    setFinancials(updatedFinancials);
    
    // Update job in parent component
    if (onUpdateJob) {
      onUpdateJob(job.id, {
        financials: {
          ...job.financials,
          residentialConstruction: updatedFinancials
        }
      });
    }
  };

  // Handle input changes for nested fields
  const handleInputChange = (phase, itemKey, category, field, value) => {
    const updatedFinancials = { ...financials };
    if (category) {
      updatedFinancials.phases[phase].items[itemKey][category][field] = parseFloat(value) || 0;
    } else {
      updatedFinancials.phases[phase].items[itemKey][field] = value;
    }
    setFinancials(updatedFinancials);
    updateCalculations();
  };

  const handleContractorChange = (phase, itemKey, field, value) => {
    const updatedFinancials = { ...financials };
    updatedFinancials.phases[phase].items[itemKey].contractor[field] = value;
    
    // Auto-fill "HSH Contractor" when "In-House" type is selected
    // Force deployment trigger
    if (field === 'type' && value === 'in-house') {
      updatedFinancials.phases[phase].items[itemKey].contractor.name = 'HSH Contractor';
    }
    
    // Ensure attachments array exists
    if (!updatedFinancials.phases[phase].items[itemKey].contractor.attachments) {
      updatedFinancials.phases[phase].items[itemKey].contractor.attachments = [];
    }
    
    setFinancials(updatedFinancials);
    updateCalculations();
  };

  const handlePercentageChange = (category, value) => {
    const updatedFinancials = { ...financials };
    updatedFinancials[category].percentage = parseFloat(value) || 0;
    setFinancials(updatedFinancials);
    updateCalculations();
  };

  const handleManualOverride = (value) => {
    const updatedFinancials = { ...financials };
    updatedFinancials.manualOverride = parseFloat(value) || 0;
    setFinancials(updatedFinancials);
    
    if (onUpdateJob) {
      onUpdateJob(job.id, {
        financials: {
          ...job.financials,
          residentialConstruction: updatedFinancials
        }
      });
    }
  };

  // Attachment handling functions
  const handleAttachmentUpload = async (phase, itemKey, file) => {
    const attachmentId = `attachment-${Date.now()}`;
    const attachment = {
      id: attachmentId,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      file: file // Store the actual file object
    };

    const updatedFinancials = { ...financials };
    if (!updatedFinancials.phases[phase].items[itemKey].contractor.attachments) {
      updatedFinancials.phases[phase].items[itemKey].contractor.attachments = [];
    }
    updatedFinancials.phases[phase].items[itemKey].contractor.attachments.push(attachment);
    
    setFinancials(updatedFinancials);
    updateCalculations();

    // Also add to job documents
    if (onUpdateJob) {
      const jobDocument = {
        id: attachmentId,
        name: file.name,
        type: file.type,
        size: file.size,
        category: 'quotes', // Quote attachments go in quotes category
        uploadedAt: new Date().toISOString(),
        description: `Quote attachment for ${itemKey} - ${updatedFinancials.phases[phase].items[itemKey].contractor.name || 'Contractor'}`,
        file: file,
        // Add metadata to track this as a financials attachment
        source: 'financials',
        financialsData: {
          phase: phase,
          itemKey: itemKey,
          contractorName: updatedFinancials.phases[phase].items[itemKey].contractor.name || 'Contractor'
        }
      };

      // Add to job documents
      const currentDocuments = job.documents || [];
      onUpdateJob(job.id, {
        documents: [...currentDocuments, jobDocument]
      });
    }

    toast({
      title: "Attachment Added",
      description: `Quote attachment "${file.name}" has been added successfully.`
    });
  };

  const handleAttachmentDelete = (phase, itemKey, attachmentId) => {
    const updatedFinancials = { ...financials };
    updatedFinancials.phases[phase].items[itemKey].contractor.attachments = 
      updatedFinancials.phases[phase].items[itemKey].contractor.attachments.filter(att => att.id !== attachmentId);
    
    setFinancials(updatedFinancials);
    updateCalculations();

    // Also remove from job documents
    if (onUpdateJob) {
      const currentDocuments = job.documents || [];
      onUpdateJob(job.id, {
        documents: currentDocuments.filter(doc => doc.id !== attachmentId),
        financials: {
          ...job.financials,
          residentialConstruction: updatedFinancials
        }
      });
    }

    toast({
      title: "Attachment Removed",
      description: "Quote attachment has been removed successfully."
    });
  };

  const handleFileInputChange = (phase, itemKey, event) => {
    const file = event.target.files[0];
    if (file) {
      handleAttachmentUpload(phase, itemKey, file);
    }
    // Reset the input
    event.target.value = '';
  };

  const openFileInput = (phase, itemKey) => {
    fileInputRef.current = { phase, itemKey };
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx';
    input.onchange = (e) => handleFileInputChange(phase, itemKey, e);
    input.click();
  };

  // Get available subcontractors
  const getAvailableSubcontractors = () => {
    return employees.filter(emp => emp.employeeType === 'Subcontractor');
  };

  // Render trade item input with detailed breakdown
  const renderTradeItem = (phase, item, phaseData) => {
    const itemData = phaseData?.items?.[item.key];
    if (!itemData) return null;

    return (
      <div key={item.key} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
        {/* Item Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">{item.label}</h4>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-xl font-bold text-brandSecondary">
              ${(itemData.total || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Contractor Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded">
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
            <Label className="text-sm font-medium text-gray-700">Quote Amount</Label>
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
            <Label className="text-sm font-medium text-gray-700">Quote Date</Label>
            <Input
              type="date"
              value={itemData.contractor.quoteDate || ''}
              onChange={(e) => handleContractorChange(phase, item.key, 'quoteDate', e.target.value)}
              className="h-8"
            />
          </div>
        </div>

        {/* Quote Attachments */}
        <div className="mb-4 p-3 bg-green-50 rounded">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center">
              <Paperclip className="h-4 w-4 mr-2" />
              Quote Attachments
            </Label>
            <Button
              onClick={() => openFileInput(phase, item.key)}
              size="sm"
              variant="outline"
              className="h-8 text-xs"
            >
              <Upload className="h-3 w-3 mr-1" />
              Attach Quote
            </Button>
          </div>
          
          {itemData.contractor.attachments && itemData.contractor.attachments.length > 0 ? (
            <div className="space-y-2">
              {itemData.contractor.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{attachment.name}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round(attachment.size / 1024)} KB)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => {
                        // Open file in new tab if it's a PDF or image
                        if (attachment.type === 'application/pdf' || attachment.type.startsWith('image/')) {
                          const url = URL.createObjectURL(attachment.file);
                          window.open(url, '_blank');
                        } else {
                          // Download the file
                          const url = URL.createObjectURL(attachment.file);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = attachment.name;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      }}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Attachment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{attachment.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleAttachmentDelete(phase, item.key, attachment.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No quote attachments yet. Click "Attach Quote" to add one.</p>
          )}
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
              Subcontractor Quote
            </h5>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${(parseFloat(itemData.contractor.quoteAmount) || 0).toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Total Quote Amount</p>
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
    const phaseData = safeFinancials?.phases?.[phaseKey];
    
    // Safety check - if phase data doesn't exist, return null
    if (!phaseData) {
      console.warn(`Phase data not found for ${phaseKey}`);
      return null;
    }
    
    return (
      <Card key={phaseKey} className={`border-2 ${category.borderColor} ${category.bgColor}`}>
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center justify-between ${category.color}`}>
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-2" />
              {category.name}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Phase Total</div>
              <div className="text-xl font-bold text-brandSecondary">
                ${(phaseData.total || 0).toFixed(2)}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {category.items.map(item => renderTradeItem(phaseKey, item, phaseData))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calculate final totals
  const getCalculations = () => {
    const subtotal = Object.values(financials.phases).reduce((sum, phase) => sum + phase.total, 0);
    const subtotalWithOverhead = subtotal + financials.overhead.amount;
    const subtotalWithProfit = subtotalWithOverhead + financials.profit.amount;
    const totalWithTax = subtotalWithProfit + financials.salesTax.amount;
    const finalTotal = financials.manualOverride > 0 ? financials.manualOverride : totalWithTax;
    const actualProfit = finalTotal - subtotalWithOverhead;
    const actualProfitPercentage = subtotalWithOverhead > 0 ? (actualProfit / subtotalWithOverhead) * 100 : 0;

    return {
      subtotal,
      subtotalWithOverhead,
      subtotalWithProfit,
      totalWithTax,
      finalTotal,
      actualProfit,
      actualProfitPercentage
    };
  };

  const calculations = getCalculations();

  console.log('Rendering ResidentialConstructionEstimateTab with financials:', financials);

  // Safety check - if financials is not properly initialized, show loading
  if (!financials || !financials.phases) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading financial data...</p>
      </div>
    );
  }

  // Ensure all phases have proper structure
  const safeFinancials = {
    ...financials,
    phases: Object.keys(tradeCategories).reduce((acc, phaseKey) => {
      acc[phaseKey] = {
        items: financials.phases[phaseKey]?.items || {},
        total: financials.phases[phaseKey]?.total || 0
      };
      return acc;
    }, {})
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-brandSecondary" />
              Residential Construction Estimate
            </div>
            <Button
              onClick={() => setShowQuoteModal(true)}
              className="bg-brandPrimary hover:bg-brandPrimary/90 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Quote
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Trade Categories */}
          <Tabs value={activeTrade} onValueChange={setActiveTrade}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {Object.entries(tradeCategories).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(tradeCategories).map(([phaseKey, category]) => (
              <TabsContent key={phaseKey} value={phaseKey} className="space-y-4">
                {renderTradeCategory(phaseKey, category)}
              </TabsContent>
            ))}
          </Tabs>

          {/* Summary Section */}
          <Card className="border-2 border-brandSecondary/20 bg-brandSecondary/5">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-brandSecondary">Estimate Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phase Totals */}
              {Object.entries(tradeCategories).map(([phaseKey, category]) => {
                const phaseData = safeFinancials?.phases?.[phaseKey];
                if (!phaseData) return null;
                return (
                  <div key={phaseKey} className="flex justify-between items-center py-2">
                    <span className="text-gray-700">{category.name}:</span>
                    <span className="font-semibold">${(phaseData.total || 0).toFixed(2)}</span>
                  </div>
                );
              })}
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-gray-800">Subtotal:</span>
                  <span className="font-semibold text-gray-800">${calculations.subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Overhead */}
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Overhead ({financials.overhead.percentage}%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={financials.overhead.percentage}
                    onChange={(e) => handlePercentageChange('overhead', e.target.value)}
                    className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Overhead Amount:</span>
                <span className="font-semibold">${financials.overhead.amount.toFixed(2)}</span>
              </div>

              {/* Profit */}
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Profit ({financials.profit.percentage}%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={financials.profit.percentage}
                    onChange={(e) => handlePercentageChange('profit', e.target.value)}
                    className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Profit Amount:</span>
                <span className="font-semibold">${financials.profit.amount.toFixed(2)}</span>
              </div>

              {/* Sales Tax */}
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center space-x-2">
                  <Percent className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Sales Tax ({financials.salesTax.percentage}%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={financials.salesTax.percentage}
                    onChange={(e) => handlePercentageChange('salesTax', e.target.value)}
                    className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Sales Tax Amount:</span>
                <span className="font-semibold">${financials.salesTax.amount.toFixed(2)}</span>
              </div>

              {/* Final Total */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center py-2">
                  <span className="font-bold text-lg text-brandSecondary">Total Estimate:</span>
                  <span className="font-bold text-lg text-brandSecondary">${calculations.totalWithTax.toFixed(2)}</span>
                </div>
              </div>

              {/* Manual Override */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-gray-700">Manual Total Override</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={financials.manualOverride}
                      onChange={(e) => handleManualOverride(e.target.value)}
                      placeholder="Enter manual total"
                      className="w-32 h-8 text-right border-gray-200 focus:border-brandSecondary"
                    />
                  </div>
                </div>
                {financials.manualOverride > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="font-bold text-lg text-green-600">Final Total (Charged):</span>
                      <span className="font-bold text-lg text-green-600">${calculations.finalTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Actual Profit:</span>
                      <span className="font-semibold">${calculations.actualProfit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Actual Profit %:</span>
                      <span className="font-semibold">{calculations.actualProfitPercentage.toFixed(1)}%</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {showQuoteModal && (
        <QuoteModal
          job={job}
          estimateCalculations={calculations}
          onClose={() => setShowQuoteModal(false)}
          isResidentialConstruction={true}
        />
      )}
    </>
  );
};

export default ResidentialConstructionEstimateTab;
