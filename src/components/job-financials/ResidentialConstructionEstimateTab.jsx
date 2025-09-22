import React, { useState } from 'react';
import { Calculator, Send, FileText, DollarSign, Percent, Building, Hammer, Wrench, Zap, Droplets, Wind, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QuoteModal from './QuoteModal';

const ResidentialConstructionEstimateTab = ({ job, onUpdateJob }) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [activeTrade, setActiveTrade] = useState('sitework');

  // Trade categories for residential construction
  const tradeCategories = {
    sitework: {
      name: 'Site Work',
      icon: Building,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      items: [
        { key: 'excavation', label: 'Excavation & Grading', unit: 'sqft', defaultRate: 2.50 },
        { key: 'foundation', label: 'Foundation Work', unit: 'sqft', defaultRate: 15.00 },
        { key: 'utilities', label: 'Utility Connections', unit: 'each', defaultRate: 5000.00 },
        { key: 'landscaping', label: 'Landscaping', unit: 'sqft', defaultRate: 3.00 }
      ]
    },
    structure: {
      name: 'Structure',
      icon: Hammer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      items: [
        { key: 'framing', label: 'Framing', unit: 'sqft', defaultRate: 8.00 },
        { key: 'roofing', label: 'Roofing', unit: 'sqft', defaultRate: 4.50 },
        { key: 'siding', label: 'Siding', unit: 'sqft', defaultRate: 6.00 },
        { key: 'windows', label: 'Windows & Doors', unit: 'each', defaultRate: 800.00 }
      ]
    },
    systems: {
      name: 'Systems',
      icon: Wrench,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      items: [
        { key: 'electrical', label: 'Electrical', unit: 'sqft', defaultRate: 3.50 },
        { key: 'plumbing', label: 'Plumbing', unit: 'sqft', defaultRate: 4.00 },
        { key: 'hvac', label: 'HVAC', unit: 'sqft', defaultRate: 5.00 },
        { key: 'insulation', label: 'Insulation', unit: 'sqft', defaultRate: 1.50 }
      ]
    },
    finishes: {
      name: 'Finishes',
      icon: Home,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      items: [
        { key: 'drywall', label: 'Drywall', unit: 'sqft', defaultRate: 2.00 },
        { key: 'flooring', label: 'Flooring', unit: 'sqft', defaultRate: 4.00 },
        { key: 'cabinets', label: 'Cabinets', unit: 'linear ft', defaultRate: 200.00 },
        { key: 'countertops', label: 'Countertops', unit: 'sqft', defaultRate: 50.00 },
        { key: 'paint', label: 'Painting', unit: 'sqft', defaultRate: 1.50 },
        { key: 'trim', label: 'Trim Work', unit: 'linear ft', defaultRate: 8.00 }
      ]
    }
  };

  // Initialize financial data structure
  const initializeFinancials = () => {
    if (!job?.financials?.residentialConstruction) {
      const residentialConstructionFinancials = {
        phases: {
          sitework: { items: {}, total: 0 },
          structure: { items: {}, total: 0 },
          systems: { items: {}, total: 0 },
          finishes: { items: {}, total: 0 }
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

      // Initialize all trade items with default values
      Object.keys(tradeCategories).forEach(phase => {
        tradeCategories[phase].items.forEach(item => {
          residentialConstructionFinancials.phases[phase].items[item.key] = {
            quantity: 0,
            unit: item.unit,
            rate: item.defaultRate,
            waste: 5, // 5% default waste
            total: 0
          };
        });
      });

      return residentialConstructionFinancials;
    }
    return job.financials.residentialConstruction;
  };

  const [financials, setFinancials] = useState(initializeFinancials());

  // Update financial calculations
  const updateCalculations = () => {
    const updatedFinancials = { ...financials };
    
    // Calculate totals for each phase
    Object.keys(updatedFinancials.phases).forEach(phase => {
      let phaseTotal = 0;
      Object.keys(updatedFinancials.phases[phase].items).forEach(itemKey => {
        const item = updatedFinancials.phases[phase].items[itemKey];
        const adjustedQuantity = item.quantity * (1 + item.waste / 100);
        item.total = adjustedQuantity * item.rate;
        phaseTotal += item.total;
      });
      updatedFinancials.phases[phase].total = phaseTotal;
    });

    // Calculate subtotal
    const subtotal = Object.values(updatedFinancials.phases).reduce((sum, phase) => sum + phase.total, 0);
    
    // Calculate overhead
    updatedFinancials.overhead.amount = subtotal * (updatedFinancials.overhead.percentage / 100);
    const subtotalWithOverhead = subtotal + updatedFinancials.overhead.amount;
    
    // Calculate profit
    updatedFinancials.profit.amount = subtotalWithOverhead * (updatedFinancials.profit.percentage / 100);
    const subtotalWithProfit = subtotalWithOverhead + updatedFinancials.profit.amount;
    
    // Calculate sales tax (on materials only - simplified for now)
    updatedFinancials.salesTax.amount = subtotalWithProfit * (updatedFinancials.salesTax.percentage / 100);
    
    // Calculate total estimate
    updatedFinancials.totalEstimate = subtotalWithProfit + updatedFinancials.salesTax.amount;
    
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

  // Handle input changes
  const handleInputChange = (phase, itemKey, field, value) => {
    const updatedFinancials = { ...financials };
    updatedFinancials.phases[phase].items[itemKey][field] = parseFloat(value) || 0;
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

  // Render trade item input
  const renderTradeItem = (phase, item) => {
    const itemData = financials.phases[phase].items[item.key];
    if (!itemData) return null;

    return (
      <div key={item.key} className="grid grid-cols-5 gap-4 items-center py-3 border-b border-gray-100">
        <div className="col-span-2">
          <Label className="text-sm font-medium text-gray-700">{item.label}</Label>
        </div>
        <div>
          <Input
            type="number"
            step="0.01"
            value={itemData.quantity}
            onChange={(e) => handleInputChange(phase, item.key, 'quantity', e.target.value)}
            placeholder="0"
            className="w-full h-8 text-center border-gray-200 focus:border-brandSecondary"
          />
        </div>
        <div>
          <Input
            type="number"
            step="0.01"
            value={itemData.rate}
            onChange={(e) => handleInputChange(phase, item.key, 'rate', e.target.value)}
            placeholder="0.00"
            className="w-full h-8 text-center border-gray-200 focus:border-brandSecondary"
          />
        </div>
        <div className="text-right">
          <span className="font-semibold text-gray-800">
            ${itemData.total.toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  // Render trade category
  const renderTradeCategory = (phaseKey, category) => {
    const Icon = category.icon;
    
    return (
      <Card key={phaseKey} className={`border-2 ${category.borderColor} ${category.bgColor}`}>
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center ${category.color}`}>
            <Icon className="h-5 w-5 mr-2" />
            {category.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-4 items-center py-2 border-b-2 border-gray-200 bg-gray-50 rounded">
              <div className="col-span-2 font-semibold text-gray-700">Item</div>
              <div className="text-center font-semibold text-gray-700">Qty</div>
              <div className="text-center font-semibold text-gray-700">Rate ($)</div>
              <div className="text-right font-semibold text-gray-700">Total</div>
            </div>
            {category.items.map(item => renderTradeItem(phaseKey, item))}
            <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 bg-gray-50 rounded mt-4">
              <span className="font-bold text-lg text-gray-800">{category.name} Total:</span>
              <span className="font-bold text-lg text-brandSecondary">
                ${financials.phases[phaseKey].total.toFixed(2)}
              </span>
            </div>
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
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(tradeCategories).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.name}</span>
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
              {Object.entries(tradeCategories).map(([phaseKey, category]) => (
                <div key={phaseKey} className="flex justify-between items-center py-2">
                  <span className="text-gray-700">{category.name}:</span>
                  <span className="font-semibold">${financials.phases[phaseKey].total.toFixed(2)}</span>
                </div>
              ))}
              
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
