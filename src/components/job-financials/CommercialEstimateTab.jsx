import React, { useState } from 'react';
import { Calculator, Send, FileText, DollarSign, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCommercialEstimate } from '@/hooks/useCommercialEstimate';
import QuoteModal from './QuoteModal';

const CommercialEstimateTab = ({ job, onUpdateJob }) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  
  const {
    // Bid version management
    currentBidVersion, setCurrentBidVersion,
    bidVersions, setBidVersions,
    bidVersionDescription, setBidVersionDescription,
    
    // Breakdowns management
    breakdowns, setBreakdowns,
    newBreakdownName, setNewBreakdownName,
    
    equipmentCost, setEquipmentCost,
    
    // ACT Labor
    actLaborQty, setActLaborQty,
    actLaborUnit, setActLaborUnit,
    actLaborWaste, setActLaborWaste,
    actLaborUnitCost, setActLaborUnitCost,
    actLaborCost, setActLaborCost,
    
    // Drywall Labor
    drywallLaborQty, setDrywallLaborQty,
    drywallLaborUnit, setDrywallLaborUnit,
    drywallLaborWaste, setDrywallLaborWaste,
    drywallLaborUnitCost, setDrywallLaborUnitCost,
    drywallLaborCost, setDrywallLaborCost,
    
    // Channel Labor
    channelLaborQty, setChannelLaborQty,
    channelLaborUnit, setChannelLaborUnit,
    channelLaborWaste, setChannelLaborWaste,
    channelLaborUnitCost, setChannelLaborUnitCost,
    channelLaborCost, setChannelLaborCost,
    
    // Suspended Grid Labor
    suspendedGridLaborQty, setSuspendedGridLaborQty,
    suspendedGridLaborUnit, setSuspendedGridLaborUnit,
    suspendedGridLaborWaste, setSuspendedGridLaborWaste,
    suspendedGridLaborUnitCost, setSuspendedGridLaborUnitCost,
    suspendedGridLaborCost, setSuspendedGridLaborCost,
    
    // Metal Framing Labor
    metalFramingLaborQty, setMetalFramingLaborQty,
    metalFramingLaborUnit, setMetalFramingLaborUnit,
    metalFramingLaborWaste, setMetalFramingLaborWaste,
    metalFramingLaborUnitCost, setMetalFramingLaborUnitCost,
    metalFramingLaborCost, setMetalFramingLaborCost,
    
    // Insulation Labor
    insulationLaborQty, setInsulationLaborQty,
    insulationLaborUnit, setInsulationLaborUnit,
    insulationLaborWaste, setInsulationLaborWaste,
    insulationLaborUnitCost, setInsulationLaborUnitCost,
    insulationLaborCost, setInsulationLaborCost,
    
    // FRP Labor
    frpLaborQty, setFrpLaborQty,
    frpLaborUnit, setFrpLaborUnit,
    frpLaborWaste, setFrpLaborWaste,
    frpLaborUnitCost, setFrpLaborUnitCost,
    frpLaborCost, setFrpLaborCost,
    
    // Door Install Labor
    doorInstallLaborQty, setDoorInstallLaborQty,
    doorInstallLaborUnit, setDoorInstallLaborUnit,
    doorInstallLaborWaste, setDoorInstallLaborWaste,
    doorInstallLaborUnitCost, setDoorInstallLaborUnitCost,
    doorInstallLaborCost, setDoorInstallLaborCost,
    
    // Materials
    actMaterialCost, setActMaterialCost,
    drywallMaterialCost, setDrywallMaterialCost,
    channelMaterialCost, setChannelMaterialCost,
    suspendedGridMaterialCost, setSuspendedGridMaterialCost,
    metalFramingMaterialCost, setMetalFramingMaterialCost,
    insulationMaterialCost, setInsulationMaterialCost,
    frpMaterialCost, setFrpMaterialCost,
    
    // Material worksheet fields - ACT
    actMaterialQty, setActMaterialQty,
    actMaterialUnit, setActMaterialUnit,
    actMaterialWaste, setActMaterialWaste,
    actMaterialUnitCost, setActMaterialUnitCost,
    
    // Material worksheet fields - Drywall
    drywallMaterialQty, setDrywallMaterialQty,
    drywallMaterialUnit, setDrywallMaterialUnit,
    drywallMaterialWaste, setDrywallMaterialWaste,
    drywallMaterialUnitCost, setDrywallMaterialUnitCost,
    
    // Material worksheet fields - Channel
    channelMaterialQty, setChannelMaterialQty,
    channelMaterialUnit, setChannelMaterialUnit,
    channelMaterialWaste, setChannelMaterialWaste,
    channelMaterialUnitCost, setChannelMaterialUnitCost,
    
    // Material worksheet fields - Suspended Grid
    suspendedGridMaterialQty, setSuspendedGridMaterialQty,
    suspendedGridMaterialUnit, setSuspendedGridMaterialUnit,
    suspendedGridMaterialWaste, setSuspendedGridMaterialWaste,
    suspendedGridMaterialUnitCost, setSuspendedGridMaterialUnitCost,
    
    // Material worksheet fields - Metal Framing
    metalFramingMaterialQty, setMetalFramingMaterialQty,
    metalFramingMaterialUnit, setMetalFramingMaterialUnit,
    metalFramingMaterialWaste, setMetalFramingMaterialWaste,
    metalFramingMaterialUnitCost, setMetalFramingMaterialUnitCost,
    
    // Material worksheet fields - Insulation
    insulationMaterialQty, setInsulationMaterialQty,
    insulationMaterialUnit, setInsulationMaterialUnit,
    insulationMaterialWaste, setInsulationMaterialWaste,
    insulationMaterialUnitCost, setInsulationMaterialUnitCost,
    
    // Material worksheet fields - FRP
    frpMaterialQty, setFrpMaterialQty,
    frpMaterialUnit, setFrpMaterialUnit,
    frpMaterialWaste, setFrpMaterialWaste,
    frpMaterialUnitCost, setFrpMaterialUnitCost,
    
    // Percentages
    overheadPercentage, setOverheadPercentage,
    profitPercentage, setProfitPercentage,
    salesTaxRate, setSalesTaxRate,
    totalEstimateAmount, setTotalEstimateAmount,
    
    handleInputChange,
    addBreakdown,
    removeBreakdown,
    updateBreakdown,
    createNewBidVersion,
    switchBidVersion,
    calculations
  } = useCommercialEstimate(job, onUpdateJob);

  const renderLineItem = (label, cost, setter, placeholder = "0.00", Icon = DollarSign) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500">$</span>
        <Input
          type="number"
          step="0.01"
          value={cost}
          onChange={(e) => handleInputChange(label.toLowerCase().replace(/\s+/g, ''), e.target.value, setter)}
          placeholder={placeholder}
          className="w-24 h-8 text-right border-gray-200 focus:border-brandSecondary"
        />
      </div>
    </div>
  );

  const renderSectionHeader = (title, Icon = null) => (
    <div className="flex items-center space-x-2 py-3 border-b-2 border-gray-200">
      {Icon && <Icon className="h-5 w-5 text-brandSecondary" />}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  );

  const renderTotalRow = (label, amount, isMainTotal = false) => (
    <div className={`flex items-center justify-between py-3 ${isMainTotal ? 'border-t-2 border-brandSecondary bg-brandSecondary/5' : 'border-t border-gray-200'}`}>
      <span className={`font-semibold ${isMainTotal ? 'text-lg text-brandSecondary' : 'text-gray-700'}`}>
        {label}
      </span>
      <span className={`font-bold ${isMainTotal ? 'text-lg text-brandSecondary' : 'text-gray-800'}`}>
        ${amount.toFixed(2)}
      </span>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-brandSecondary" />
              Commercial Estimate Financials
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
          {/* Bid Version Management */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              {renderSectionHeader("Bid Version Management", FileText)}
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="bidVersion" className="text-sm font-medium text-gray-700">
                    Current Bid Version
                  </Label>
                  <select
                    id="bidVersion"
                    value={currentBidVersion}
                    onChange={(e) => switchBidVersion(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brandSecondary focus:ring-brandSecondary sm:text-sm"
                  >
                    {bidVersions.map((version) => (
                      <option key={version} value={version}>
                        {version}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="newBidVersion" className="text-sm font-medium text-gray-700">
                    New Bid Version Description
                  </Label>
                  <div className="mt-1 flex space-x-2">
                    <Input
                      id="newBidVersion"
                      type="text"
                      value={bidVersionDescription}
                      onChange={(e) => setBidVersionDescription(e.target.value)}
                      placeholder="e.g., Pre-Construction Bid"
                      className="flex-1 border-gray-200 focus:border-brandSecondary"
                    />
                    <Button
                      onClick={createNewBidVersion}
                      disabled={!bidVersionDescription.trim()}
                      className="bg-brandSecondary hover:bg-brandSecondary/90 text-white"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Breakdowns Management */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              {renderSectionHeader("Project Breakdowns", FileText)}
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="newBreakdown" className="text-sm font-medium text-gray-700">
                    New Breakdown Name
                  </Label>
                  <div className="mt-1 flex space-x-2">
                    <Input
                      id="newBreakdown"
                      type="text"
                      value={newBreakdownName}
                      onChange={(e) => setNewBreakdownName(e.target.value)}
                      placeholder="e.g., 1st Floor, West Wing"
                      className="flex-1 border-gray-200 focus:border-brandSecondary"
                    />
                    <Button
                      onClick={addBreakdown}
                      disabled={!newBreakdownName.trim()}
                      className="bg-brandSecondary hover:bg-brandSecondary/90 text-white"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              
              {breakdowns.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Current Breakdowns:</h4>
                  {breakdowns.map((breakdown) => (
                    <div key={breakdown.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-800">{breakdown.name}</span>
                      <Button
                        onClick={() => removeBreakdown(breakdown.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment Section */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              {renderSectionHeader("Equipment", Calculator)}
            </CardHeader>
            <CardContent className="pt-0">
              {renderLineItem("Equipment Cost", equipmentCost, setEquipmentCost)}
            </CardContent>
          </Card>

          {/* Labor Section */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              {renderSectionHeader("Labor Costs Worksheet", Calculator)}
            </CardHeader>
            <CardContent className="pt-0">
              {/* Labor Worksheet Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-50">
                      <th className="text-left p-2 font-semibold">Labor Type</th>
                      <th className="text-center p-2 font-semibold">Qty</th>
                      <th className="text-center p-2 font-semibold">Unit</th>
                      <th className="text-center p-2 font-semibold">Waste %</th>
                      <th className="text-center p-2 font-semibold">Adjusted Qty</th>
                      <th className="text-center p-2 font-semibold">Unit Cost</th>
                      <th className="text-right p-2 font-semibold">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* ACT Labor Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">ACT Labor</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={actLaborQty}
                          onChange={(e) => handleInputChange('actLaborQty', e.target.value, setActLaborQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={actLaborUnit}
                          onChange={(e) => handleInputChange('actLaborUnit', e.target.value, setActLaborUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="hours">hours</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={actLaborWaste}
                          onChange={(e) => handleInputChange('actLaborWaste', e.target.value, setActLaborWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.actLaborAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={actLaborUnitCost}
                          onChange={(e) => handleInputChange('actLaborUnitCost', e.target.value, setActLaborUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.actLabor?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Drywall Labor Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Drywall Labor</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={drywallLaborQty}
                          onChange={(e) => handleInputChange('drywallLaborQty', e.target.value, setDrywallLaborQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={drywallLaborUnit}
                          onChange={(e) => handleInputChange('drywallLaborUnit', e.target.value, setDrywallLaborUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="hours">hours</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={drywallLaborWaste}
                          onChange={(e) => handleInputChange('drywallLaborWaste', e.target.value, setDrywallLaborWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.drywallLaborAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={drywallLaborUnitCost}
                          onChange={(e) => handleInputChange('drywallLaborUnitCost', e.target.value, setDrywallLaborUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.drywallLabor?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Channel Labor Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Channel Labor</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={channelLaborQty}
                          onChange={(e) => handleInputChange('channelLaborQty', e.target.value, setChannelLaborQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={channelLaborUnit}
                          onChange={(e) => handleInputChange('channelLaborUnit', e.target.value, setChannelLaborUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="hours">hours</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={channelLaborWaste}
                          onChange={(e) => handleInputChange('channelLaborWaste', e.target.value, setChannelLaborWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.channelLaborAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={channelLaborUnitCost}
                          onChange={(e) => handleInputChange('channelLaborUnitCost', e.target.value, setChannelLaborUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.channelLabor?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Suspended Grid Labor Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Suspended Grid Labor</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={suspendedGridLaborQty}
                          onChange={(e) => handleInputChange('suspendedGridLaborQty', e.target.value, setSuspendedGridLaborQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={suspendedGridLaborUnit}
                          onChange={(e) => handleInputChange('suspendedGridLaborUnit', e.target.value, setSuspendedGridLaborUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="hours">hours</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={suspendedGridLaborWaste}
                          onChange={(e) => handleInputChange('suspendedGridLaborWaste', e.target.value, setSuspendedGridLaborWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.suspendedGridLaborAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={suspendedGridLaborUnitCost}
                          onChange={(e) => handleInputChange('suspendedGridLaborUnitCost', e.target.value, setSuspendedGridLaborUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.suspendedGridLabor?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Metal Framing Labor Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Metal Framing Labor</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={metalFramingLaborQty}
                          onChange={(e) => handleInputChange('metalFramingLaborQty', e.target.value, setMetalFramingLaborQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={metalFramingLaborUnit}
                          onChange={(e) => handleInputChange('metalFramingLaborUnit', e.target.value, setMetalFramingLaborUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="hours">hours</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={metalFramingLaborWaste}
                          onChange={(e) => handleInputChange('metalFramingLaborWaste', e.target.value, setMetalFramingLaborWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.metalFramingLaborAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={metalFramingLaborUnitCost}
                          onChange={(e) => handleInputChange('metalFramingLaborUnitCost', e.target.value, setMetalFramingLaborUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.metalFramingLabor?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Insulation Labor Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Insulation Labor</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={insulationLaborQty}
                          onChange={(e) => handleInputChange('insulationLaborQty', e.target.value, setInsulationLaborQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={insulationLaborUnit}
                          onChange={(e) => handleInputChange('insulationLaborUnit', e.target.value, setInsulationLaborUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="hours">hours</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={insulationLaborWaste}
                          onChange={(e) => handleInputChange('insulationLaborWaste', e.target.value, setInsulationLaborWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.insulationLaborAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={insulationLaborUnitCost}
                          onChange={(e) => handleInputChange('insulationLaborUnitCost', e.target.value, setInsulationLaborUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.insulationLabor?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* FRP Labor Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">FRP Labor</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={frpLaborQty}
                          onChange={(e) => handleInputChange('frpLaborQty', e.target.value, setFrpLaborQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={frpLaborUnit}
                          onChange={(e) => handleInputChange('frpLaborUnit', e.target.value, setFrpLaborUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="hours">hours</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={frpLaborWaste}
                          onChange={(e) => handleInputChange('frpLaborWaste', e.target.value, setFrpLaborWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.frpLaborAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={frpLaborUnitCost}
                          onChange={(e) => handleInputChange('frpLaborUnitCost', e.target.value, setFrpLaborUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.frpLabor?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Door Install Labor Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Door Install Labor</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={doorInstallLaborQty}
                          onChange={(e) => handleInputChange('doorInstallLaborQty', e.target.value, setDoorInstallLaborQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={doorInstallLaborUnit}
                          onChange={(e) => handleInputChange('doorInstallLaborUnit', e.target.value, setDoorInstallLaborUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="hours">hours</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={doorInstallLaborWaste}
                          onChange={(e) => handleInputChange('doorInstallLaborWaste', e.target.value, setDoorInstallLaborWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.doorInstallLaborAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={doorInstallLaborUnitCost}
                          onChange={(e) => handleInputChange('doorInstallLaborUnitCost', e.target.value, setDoorInstallLaborUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.doorInstallLabor?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td colSpan="6" className="p-2 font-semibold text-right">Total Labor Cost:</td>
                      <td className="p-2 text-right font-bold text-brandSecondary">
                        ${calculations.totalLaborCost?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Materials Section */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              {renderSectionHeader("Material Costs", Calculator)}
            </CardHeader>
            <CardContent className="pt-0">
              {/* Import Panel */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-blue-800">Import Material Data</h4>
                  <span className="text-xs text-blue-600">From Togal Export</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="materialImport" className="text-sm font-medium text-blue-700">
                      Upload CSV/XLSX File
                    </Label>
                    <Input
                      id="materialImport"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="mt-1 border-blue-200 focus:border-blue-400"
                      onChange={(e) => {
                        // TODO: Implement CSV/XLSX import logic
                        console.log('File selected:', e.target.files[0]);
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      // TODO: Implement import functionality
                      console.log('Import clicked');
                    }}
                  >
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      // TODO: Download template
                      console.log('Download template clicked');
                    }}
                  >
                    Download Template
                  </Button>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Supported formats: CSV, XLSX. File should include columns for Material Name, Quantity, Unit, Waste %, and Unit Cost.
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-2 text-left font-medium text-gray-700 border-r border-gray-200">Material</th>
                      <th className="p-2 text-center font-medium text-gray-700 border-r border-gray-200">Qty</th>
                      <th className="p-2 text-center font-medium text-gray-700 border-r border-gray-200">Unit</th>
                      <th className="p-2 text-center font-medium text-gray-700 border-r border-gray-200">Waste %</th>
                      <th className="p-2 text-center font-medium text-gray-700 border-r border-gray-200">Adjusted Qty</th>
                      <th className="p-2 text-center font-medium text-gray-700 border-r border-gray-200">Unit Cost</th>
                      <th className="p-2 text-center font-medium text-gray-700">Extended Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* ACT Material Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">ACT Material</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={actMaterialQty}
                          onChange={(e) => handleInputChange('actMaterialQty', e.target.value, setActMaterialQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={actMaterialUnit}
                          onChange={(e) => handleInputChange('actMaterialUnit', e.target.value, setActMaterialUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={actMaterialWaste}
                          onChange={(e) => handleInputChange('actMaterialWaste', e.target.value, setActMaterialWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.actMaterialAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={actMaterialUnitCost}
                          onChange={(e) => handleInputChange('actMaterialUnitCost', e.target.value, setActMaterialUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.actMaterial?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Drywall Material Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Drywall Material</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={drywallMaterialQty}
                          onChange={(e) => handleInputChange('drywallMaterialQty', e.target.value, setDrywallMaterialQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={drywallMaterialUnit}
                          onChange={(e) => handleInputChange('drywallMaterialUnit', e.target.value, setDrywallMaterialUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="sheets">sheets</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={drywallMaterialWaste}
                          onChange={(e) => handleInputChange('drywallMaterialWaste', e.target.value, setDrywallMaterialWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.drywallMaterialAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={drywallMaterialUnitCost}
                          onChange={(e) => handleInputChange('drywallMaterialUnitCost', e.target.value, setDrywallMaterialUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.drywallMaterial?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Channel Material Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Channel Material</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={channelMaterialQty}
                          onChange={(e) => handleInputChange('channelMaterialQty', e.target.value, setChannelMaterialQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={channelMaterialUnit}
                          onChange={(e) => handleInputChange('channelMaterialUnit', e.target.value, setChannelMaterialUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="linear ft">linear ft</option>
                          <option value="sqft">sqft</option>
                          <option value="each">each</option>
                          <option value="sticks">sticks</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={channelMaterialWaste}
                          onChange={(e) => handleInputChange('channelMaterialWaste', e.target.value, setChannelMaterialWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.channelMaterialAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={channelMaterialUnitCost}
                          onChange={(e) => handleInputChange('channelMaterialUnitCost', e.target.value, setChannelMaterialUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.channelMaterial?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Suspended Grid Material Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Suspended Grid Material</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={suspendedGridMaterialQty}
                          onChange={(e) => handleInputChange('suspendedGridMaterialQty', e.target.value, setSuspendedGridMaterialQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={suspendedGridMaterialUnit}
                          onChange={(e) => handleInputChange('suspendedGridMaterialUnit', e.target.value, setSuspendedGridMaterialUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="grids">grids</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={suspendedGridMaterialWaste}
                          onChange={(e) => handleInputChange('suspendedGridMaterialWaste', e.target.value, setSuspendedGridMaterialWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.suspendedGridMaterialAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={suspendedGridMaterialUnitCost}
                          onChange={(e) => handleInputChange('suspendedGridMaterialUnitCost', e.target.value, setSuspendedGridMaterialUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.suspendedGridMaterial?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Metal Framing Material Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Metal Framing Material</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={metalFramingMaterialQty}
                          onChange={(e) => handleInputChange('metalFramingMaterialQty', e.target.value, setMetalFramingMaterialQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={metalFramingMaterialUnit}
                          onChange={(e) => handleInputChange('metalFramingMaterialUnit', e.target.value, setMetalFramingMaterialUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="linear ft">linear ft</option>
                          <option value="sqft">sqft</option>
                          <option value="each">each</option>
                          <option value="studs">studs</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={metalFramingMaterialWaste}
                          onChange={(e) => handleInputChange('metalFramingMaterialWaste', e.target.value, setMetalFramingMaterialWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.metalFramingMaterialAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={metalFramingMaterialUnitCost}
                          onChange={(e) => handleInputChange('metalFramingMaterialUnitCost', e.target.value, setMetalFramingMaterialUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.metalFramingMaterial?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* Insulation Material Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">Insulation Material</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={insulationMaterialQty}
                          onChange={(e) => handleInputChange('insulationMaterialQty', e.target.value, setInsulationMaterialQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={insulationMaterialUnit}
                          onChange={(e) => handleInputChange('insulationMaterialUnit', e.target.value, setInsulationMaterialUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="batts">batts</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={insulationMaterialWaste}
                          onChange={(e) => handleInputChange('insulationMaterialWaste', e.target.value, setInsulationMaterialWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.insulationMaterialAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={insulationMaterialUnitCost}
                          onChange={(e) => handleInputChange('insulationMaterialUnitCost', e.target.value, setInsulationMaterialUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.insulationMaterial?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                    
                    {/* FRP Material Row */}
                    <tr className="hover:bg-gray-50">
                      <td className="p-2 font-medium">FRP Material</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={frpMaterialQty}
                          onChange={(e) => handleInputChange('frpMaterialQty', e.target.value, setFrpMaterialQty)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={frpMaterialUnit}
                          onChange={(e) => handleInputChange('frpMaterialUnit', e.target.value, setFrpMaterialUnit)}
                          className="w-20 h-8 text-center border border-gray-200 rounded focus:border-brandSecondary"
                        >
                          <option value="sqft">sqft</option>
                          <option value="linear ft">linear ft</option>
                          <option value="each">each</option>
                          <option value="panels">panels</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={frpMaterialWaste}
                          onChange={(e) => handleInputChange('frpMaterialWaste', e.target.value, setFrpMaterialWaste)}
                          className="w-16 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-center font-medium">
                        {calculations.frpMaterialAdjustedQty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={frpMaterialUnitCost}
                          onChange={(e) => handleInputChange('frpMaterialUnitCost', e.target.value, setFrpMaterialUnitCost)}
                          className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                        />
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ${calculations.frpMaterial?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td colSpan="6" className="p-2 font-semibold text-right">Total Material Cost:</td>
                      <td className="p-2 text-right font-bold text-brandSecondary">
                        ${calculations.totalMaterialCost?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Summary Section */}
          {breakdowns.length > 0 && (
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                {renderSectionHeader("Breakdown Summary", FileText)}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {breakdowns.map((breakdown) => (
                    <div key={breakdown.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{breakdown.name}</h4>
                        <span className="text-sm text-gray-500">Breakdown</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Equipment:</span>
                          <span className="ml-2 font-medium">${(breakdown.equipmentCost || 0).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Labor:</span>
                          <span className="ml-2 font-medium">${
                            ((breakdown.actLaborQty || 0) * (1 + (breakdown.actLaborWaste || 0) / 100) * (breakdown.actLaborUnitCost || 0)) +
                            ((breakdown.drywallLaborQty || 0) * (1 + (breakdown.drywallLaborWaste || 0) / 100) * (breakdown.drywallLaborUnitCost || 0)) +
                            ((breakdown.channelLaborQty || 0) * (1 + (breakdown.channelLaborWaste || 0) / 100) * (breakdown.channelLaborUnitCost || 0)) +
                            ((breakdown.suspendedGridLaborQty || 0) * (1 + (breakdown.suspendedGridLaborWaste || 0) / 100) * (breakdown.suspendedGridLaborUnitCost || 0)) +
                            ((breakdown.metalFramingLaborQty || 0) * (1 + (breakdown.metalFramingLaborWaste || 0) / 100) * (breakdown.metalFramingLaborUnitCost || 0)) +
                            ((breakdown.insulationLaborQty || 0) * (1 + (breakdown.insulationLaborWaste || 0) / 100) * (breakdown.insulationLaborUnitCost || 0)) +
                            ((breakdown.frpLaborQty || 0) * (1 + (breakdown.frpLaborWaste || 0) / 100) * (breakdown.frpLaborUnitCost || 0)) +
                            ((breakdown.doorInstallLaborQty || 0) * (1 + (breakdown.doorInstallLaborWaste || 0) / 100) * (breakdown.doorInstallLaborUnitCost || 0))
                          .toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Materials:</span>
                          <span className="ml-2 font-medium">${
                            ((breakdown.actMaterialQty || 0) * (1 + (breakdown.actMaterialWaste || 0) / 100) * (breakdown.actMaterialUnitCost || 0)) +
                            ((breakdown.drywallMaterialQty || 0) * (1 + (breakdown.drywallMaterialWaste || 0) / 100) * (breakdown.drywallMaterialUnitCost || 0)) +
                            ((breakdown.channelMaterialQty || 0) * (1 + (breakdown.channelMaterialWaste || 0) / 100) * (breakdown.channelMaterialUnitCost || 0)) +
                            ((breakdown.suspendedGridMaterialQty || 0) * (1 + (breakdown.suspendedGridMaterialWaste || 0) / 100) * (breakdown.suspendedGridMaterialUnitCost || 0)) +
                            ((breakdown.metalFramingMaterialQty || 0) * (1 + (breakdown.metalFramingMaterialWaste || 0) / 100) * (breakdown.metalFramingMaterialUnitCost || 0)) +
                            ((breakdown.insulationMaterialQty || 0) * (1 + (breakdown.insulationMaterialWaste || 0) / 100) * (breakdown.insulationMaterialUnitCost || 0)) +
                            ((breakdown.frpMaterialQty || 0) * (1 + (breakdown.frpMaterialWaste || 0) / 100) * (breakdown.frpMaterialUnitCost || 0))
                          .toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="ml-2 font-bold text-brandSecondary">${
                            (breakdown.equipmentCost || 0) +
                            ((breakdown.actLaborQty || 0) * (1 + (breakdown.actLaborWaste || 0) / 100) * (breakdown.actLaborUnitCost || 0)) +
                            ((breakdown.drywallLaborQty || 0) * (1 + (breakdown.drywallLaborWaste || 0) / 100) * (breakdown.drywallLaborUnitCost || 0)) +
                            ((breakdown.channelLaborQty || 0) * (1 + (breakdown.channelLaborWaste || 0) / 100) * (breakdown.channelLaborUnitCost || 0)) +
                            ((breakdown.suspendedGridLaborQty || 0) * (1 + (breakdown.suspendedGridLaborWaste || 0) / 100) * (breakdown.suspendedGridLaborUnitCost || 0)) +
                            ((breakdown.metalFramingLaborQty || 0) * (1 + (breakdown.metalFramingLaborWaste || 0) / 100) * (breakdown.metalFramingLaborUnitCost || 0)) +
                            ((breakdown.insulationLaborQty || 0) * (1 + (breakdown.insulationLaborWaste || 0) / 100) * (breakdown.insulationLaborUnitCost || 0)) +
                            ((breakdown.frpLaborQty || 0) * (1 + (breakdown.frpLaborWaste || 0) / 100) * (breakdown.frpLaborUnitCost || 0)) +
                            ((breakdown.doorInstallLaborQty || 0) * (1 + (breakdown.doorInstallLaborWaste || 0) / 100) * (breakdown.doorInstallLaborUnitCost || 0)) +
                            ((breakdown.actMaterialQty || 0) * (1 + (breakdown.actMaterialWaste || 0) / 100) * (breakdown.actMaterialUnitCost || 0)) +
                            ((breakdown.drywallMaterialQty || 0) * (1 + (breakdown.drywallMaterialWaste || 0) / 100) * (breakdown.drywallMaterialUnitCost || 0)) +
                            ((breakdown.channelMaterialQty || 0) * (1 + (breakdown.channelMaterialWaste || 0) / 100) * (breakdown.channelMaterialUnitCost || 0)) +
                            ((breakdown.suspendedGridMaterialQty || 0) * (1 + (breakdown.suspendedGridMaterialWaste || 0) / 100) * (breakdown.suspendedGridMaterialUnitCost || 0)) +
                            ((breakdown.metalFramingMaterialQty || 0) * (1 + (breakdown.metalFramingMaterialWaste || 0) / 100) * (breakdown.metalFramingMaterialUnitCost || 0)) +
                            ((breakdown.insulationMaterialQty || 0) * (1 + (breakdown.insulationMaterialWaste || 0) / 100) * (breakdown.insulationMaterialUnitCost || 0)) +
                            ((breakdown.frpMaterialQty || 0) * (1 + (breakdown.frpMaterialWaste || 0) / 100) * (breakdown.frpMaterialUnitCost || 0))
                          .toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary Section */}
          <Card className="border-2 border-brandSecondary/20 bg-brandSecondary/5">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold text-brandSecondary">Estimate Summary</h3>
            </CardHeader>
            <CardContent className="pt-0 space-y-0">
              {renderTotalRow("Equipment", calculations.equipment)}
              {renderTotalRow("Total Labor Cost", calculations.totalLaborCost)}
              {renderTotalRow("Total Material Cost", calculations.totalMaterialCost)}
              {renderTotalRow("Total Direct Cost", calculations.totalDirectCost)}
              
              {/* Overhead and Profit Section */}
              <div className="py-3 border-t border-gray-200">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Overhead ({overheadPercentage}%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={overheadPercentage}
                      onChange={(e) => handleInputChange('overheadPercentage', e.target.value, setOverheadPercentage)}
                      className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                {renderTotalRow("Overhead Amount", calculations.overheadAmount)}
                {renderTotalRow("Subtotal Before Profit", calculations.subtotalBeforeProfit)}
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Profit ({profitPercentage}%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={profitPercentage}
                      onChange={(e) => handleInputChange('profitPercentage', e.target.value, setProfitPercentage)}
                      className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                {renderTotalRow("Profit Amount", calculations.profitAmount)}
                {renderTotalRow("Subtotal After Profit", calculations.subtotalAfterProfit)}
              </div>

              {/* Sales Tax Section */}
              <div className="py-3 border-t border-gray-200">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-2">
                    <Percent className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Sales Tax Rate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={salesTaxRate}
                      onChange={(e) => handleInputChange('salesTaxRate', e.target.value, setSalesTaxRate)}
                      className="w-20 h-8 text-center border-gray-200 focus:border-brandSecondary"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                {renderTotalRow("Sales Tax (Materials Only)", calculations.salesTax)}
              </div>

              {/* Final Total */}
              {renderTotalRow("Total Estimate", calculations.totalWithTax, true)}
              
              {/* Manual Override */}
              <div className="py-3 border-t border-gray-200">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-700">Manual Total Override</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={totalEstimateAmount}
                      onChange={(e) => handleInputChange('totalEstimateAmount', e.target.value, setTotalEstimateAmount)}
                      placeholder="Enter manual total"
                      className="w-32 h-8 text-right border-gray-200 focus:border-brandSecondary"
                    />
                  </div>
                </div>
                {parseFloat(totalEstimateAmount) > 0 && (
                  <>
                    {renderTotalRow("Final Total (Charged)", calculations.finalTotalEstimate, true)}
                    {renderTotalRow("Actual Profit", calculations.actualProfit)}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-600">Actual Profit %</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {calculations.actualProfitPercentage.toFixed(1)}%
                      </span>
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
          isCommercial={true}
        />
      )}
    </>
  );
};

export default CommercialEstimateTab;
