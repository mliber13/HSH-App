import { useState, useEffect, useMemo } from 'react';

export const useCommercialEstimate = (job, onUpdateJob) => {
  // Bid version management
  const [currentBidVersion, setCurrentBidVersion] = useState(job?.financials?.commercialEstimate?.currentBidVersion || 'initial');
  const [bidVersions, setBidVersions] = useState(job?.financials?.commercialEstimate?.bidVersions || ['initial']);
  const [bidVersionDescription, setBidVersionDescription] = useState('');
  
  // Breakdowns management
  const [breakdowns, setBreakdowns] = useState(job?.financials?.commercialEstimate?.breakdowns || []);
  const [newBreakdownName, setNewBreakdownName] = useState('');

  // Commercial estimate state with all the detailed line items
  const [equipmentCost, setEquipmentCost] = useState(job?.financials?.commercialEstimate?.equipmentCost?.toString() || '0');
  
  // Labor worksheet fields - ACT
  const [actLaborQty, setActLaborQty] = useState(job?.financials?.commercialEstimate?.actLaborQty?.toString() || '0');
  const [actLaborUnit, setActLaborUnit] = useState(job?.financials?.commercialEstimate?.actLaborUnit || 'sqft');
  const [actLaborWaste, setActLaborWaste] = useState(job?.financials?.commercialEstimate?.actLaborWaste?.toString() || '5');
  const [actLaborUnitCost, setActLaborUnitCost] = useState(job?.financials?.commercialEstimate?.actLaborUnitCost?.toString() || '0.85');
  const [actLaborCost, setActLaborCost] = useState(job?.financials?.commercialEstimate?.actLaborCost?.toString() || '0');
  
  // Labor worksheet fields - Drywall
  const [drywallLaborQty, setDrywallLaborQty] = useState(job?.financials?.commercialEstimate?.drywallLaborQty?.toString() || '0');
  const [drywallLaborUnit, setDrywallLaborUnit] = useState(job?.financials?.commercialEstimate?.drywallLaborUnit || 'sqft');
  const [drywallLaborWaste, setDrywallLaborWaste] = useState(job?.financials?.commercialEstimate?.drywallLaborWaste?.toString() || '5');
  const [drywallLaborUnitCost, setDrywallLaborUnitCost] = useState(job?.financials?.commercialEstimate?.drywallLaborUnitCost?.toString() || '0.75');
  const [drywallLaborCost, setDrywallLaborCost] = useState(job?.financials?.commercialEstimate?.drywallLaborCost?.toString() || '0');
  
  // Labor worksheet fields - Channel
  const [channelLaborQty, setChannelLaborQty] = useState(job?.financials?.commercialEstimate?.channelLaborQty?.toString() || '0');
  const [channelLaborUnit, setChannelLaborUnit] = useState(job?.financials?.commercialEstimate?.channelLaborUnit || 'linear ft');
  const [channelLaborWaste, setChannelLaborWaste] = useState(job?.financials?.commercialEstimate?.channelLaborWaste?.toString() || '5');
  const [channelLaborUnitCost, setChannelLaborUnitCost] = useState(job?.financials?.commercialEstimate?.channelLaborUnitCost?.toString() || '0.45');
  const [channelLaborCost, setChannelLaborCost] = useState(job?.financials?.commercialEstimate?.channelLaborCost?.toString() || '0');
  
  // Labor worksheet fields - Suspended Grid
  const [suspendedGridLaborQty, setSuspendedGridLaborQty] = useState(job?.financials?.commercialEstimate?.suspendedGridLaborQty?.toString() || '0');
  const [suspendedGridLaborUnit, setSuspendedGridLaborUnit] = useState(job?.financials?.commercialEstimate?.suspendedGridLaborUnit || 'sqft');
  const [suspendedGridLaborWaste, setSuspendedGridLaborWaste] = useState(job?.financials?.commercialEstimate?.suspendedGridLaborWaste?.toString() || '5');
  const [suspendedGridLaborUnitCost, setSuspendedGridLaborUnitCost] = useState(job?.financials?.commercialEstimate?.suspendedGridLaborUnitCost?.toString() || '0.95');
  const [suspendedGridLaborCost, setSuspendedGridLaborCost] = useState(job?.financials?.commercialEstimate?.suspendedGridLaborCost?.toString() || '0');
  
  // Labor worksheet fields - Metal Framing
  const [metalFramingLaborQty, setMetalFramingLaborQty] = useState(job?.financials?.commercialEstimate?.metalFramingLaborQty?.toString() || '0');
  const [metalFramingLaborUnit, setMetalFramingLaborUnit] = useState(job?.financials?.commercialEstimate?.metalFramingLaborUnit || 'linear ft');
  const [metalFramingLaborWaste, setMetalFramingLaborWaste] = useState(job?.financials?.commercialEstimate?.metalFramingLaborWaste?.toString() || '5');
  const [metalFramingLaborUnitCost, setMetalFramingLaborUnitCost] = useState(job?.financials?.commercialEstimate?.metalFramingLaborUnitCost?.toString() || '0.65');
  const [metalFramingLaborCost, setMetalFramingLaborCost] = useState(job?.financials?.commercialEstimate?.metalFramingLaborCost?.toString() || '0');
  
  // Labor worksheet fields - Insulation
  const [insulationLaborQty, setInsulationLaborQty] = useState(job?.financials?.commercialEstimate?.insulationLaborQty?.toString() || '0');
  const [insulationLaborUnit, setInsulationLaborUnit] = useState(job?.financials?.commercialEstimate?.insulationLaborUnit || 'sqft');
  const [insulationLaborWaste, setInsulationLaborWaste] = useState(job?.financials?.commercialEstimate?.insulationLaborWaste?.toString() || '5');
  const [insulationLaborUnitCost, setInsulationLaborUnitCost] = useState(job?.financials?.commercialEstimate?.insulationLaborUnitCost?.toString() || '0.35');
  const [insulationLaborCost, setInsulationLaborCost] = useState(job?.financials?.commercialEstimate?.insulationLaborCost?.toString() || '0');
  
  // Labor worksheet fields - FRP
  const [frpLaborQty, setFrpLaborQty] = useState(job?.financials?.commercialEstimate?.frpLaborQty?.toString() || '0');
  const [frpLaborUnit, setFrpLaborUnit] = useState(job?.financials?.commercialEstimate?.frpLaborUnit || 'sqft');
  const [frpLaborWaste, setFrpLaborWaste] = useState(job?.financials?.commercialEstimate?.frpLaborWaste?.toString() || '5');
  const [frpLaborUnitCost, setFrpLaborUnitCost] = useState(job?.financials?.commercialEstimate?.frpLaborUnitCost?.toString() || '1.25');
  const [frpLaborCost, setFrpLaborCost] = useState(job?.financials?.commercialEstimate?.frpLaborCost?.toString() || '0');
  
  // Labor worksheet fields - Door Install
  const [doorInstallLaborQty, setDoorInstallLaborQty] = useState(job?.financials?.commercialEstimate?.doorInstallLaborQty?.toString() || '0');
  const [doorInstallLaborUnit, setDoorInstallLaborUnit] = useState(job?.financials?.commercialEstimate?.doorInstallLaborUnit || 'each');
  const [doorInstallLaborWaste, setDoorInstallLaborWaste] = useState(job?.financials?.commercialEstimate?.doorInstallLaborWaste?.toString() || '5');
  const [doorInstallLaborUnitCost, setDoorInstallLaborUnitCost] = useState(job?.financials?.commercialEstimate?.doorInstallLaborUnitCost?.toString() || '85.00');
  const [doorInstallLaborCost, setDoorInstallLaborCost] = useState(job?.financials?.commercialEstimate?.doorInstallLaborCost?.toString() || '0');
  
  // Material costs (keeping simple for now)
  const [actMaterialCost, setActMaterialCost] = useState(job?.financials?.commercialEstimate?.actMaterialCost?.toString() || '0');
  const [drywallMaterialCost, setDrywallMaterialCost] = useState(job?.financials?.commercialEstimate?.drywallMaterialCost?.toString() || '0');
  const [channelMaterialCost, setChannelMaterialCost] = useState(job?.financials?.commercialEstimate?.channelMaterialCost?.toString() || '0');
  const [suspendedGridMaterialCost, setSuspendedGridMaterialCost] = useState(job?.financials?.commercialEstimate?.suspendedGridMaterialCost?.toString() || '0');
  const [metalFramingMaterialCost, setMetalFramingMaterialCost] = useState(job?.financials?.commercialEstimate?.metalFramingMaterialCost?.toString() || '0');
  const [insulationMaterialCost, setInsulationMaterialCost] = useState(job?.financials?.commercialEstimate?.insulationMaterialCost?.toString() || '0');
  const [frpMaterialCost, setFrpMaterialCost] = useState(job?.financials?.commercialEstimate?.frpMaterialCost?.toString() || '0');

  // Material worksheet fields - ACT
  const [actMaterialQty, setActMaterialQty] = useState(job?.financials?.commercialEstimate?.actMaterialQty?.toString() || '0');
  const [actMaterialUnit, setActMaterialUnit] = useState(job?.financials?.commercialEstimate?.actMaterialUnit || 'sqft');
  const [actMaterialWaste, setActMaterialWaste] = useState(job?.financials?.commercialEstimate?.actMaterialWaste?.toString() || '5');
  const [actMaterialUnitCost, setActMaterialUnitCost] = useState(job?.financials?.commercialEstimate?.actMaterialUnitCost?.toString() || '0.45');
  
  // Material worksheet fields - Drywall
  const [drywallMaterialQty, setDrywallMaterialQty] = useState(job?.financials?.commercialEstimate?.drywallMaterialQty?.toString() || '0');
  const [drywallMaterialUnit, setDrywallMaterialUnit] = useState(job?.financials?.commercialEstimate?.drywallMaterialUnit || 'sqft');
  const [drywallMaterialWaste, setDrywallMaterialWaste] = useState(job?.financials?.commercialEstimate?.drywallMaterialWaste?.toString() || '5');
  const [drywallMaterialUnitCost, setDrywallMaterialUnitCost] = useState(job?.financials?.commercialEstimate?.drywallMaterialUnitCost?.toString() || '0.35');
  
  // Material worksheet fields - Channel
  const [channelMaterialQty, setChannelMaterialQty] = useState(job?.financials?.commercialEstimate?.channelMaterialQty?.toString() || '0');
  const [channelMaterialUnit, setChannelMaterialUnit] = useState(job?.financials?.commercialEstimate?.channelMaterialUnit || 'linear ft');
  const [channelMaterialWaste, setChannelMaterialWaste] = useState(job?.financials?.commercialEstimate?.channelMaterialWaste?.toString() || '5');
  const [channelMaterialUnitCost, setChannelMaterialUnitCost] = useState(job?.financials?.commercialEstimate?.channelMaterialUnitCost?.toString() || '0.25');
  
  // Material worksheet fields - Suspended Grid
  const [suspendedGridMaterialQty, setSuspendedGridMaterialQty] = useState(job?.financials?.commercialEstimate?.suspendedGridMaterialQty?.toString() || '0');
  const [suspendedGridMaterialUnit, setSuspendedGridMaterialUnit] = useState(job?.financials?.commercialEstimate?.suspendedGridMaterialUnit || 'sqft');
  const [suspendedGridMaterialWaste, setSuspendedGridMaterialWaste] = useState(job?.financials?.commercialEstimate?.suspendedGridMaterialWaste?.toString() || '5');
  const [suspendedGridMaterialUnitCost, setSuspendedGridMaterialUnitCost] = useState(job?.financials?.commercialEstimate?.suspendedGridMaterialUnitCost?.toString() || '0.55');
  
  // Material worksheet fields - Metal Framing
  const [metalFramingMaterialQty, setMetalFramingMaterialQty] = useState(job?.financials?.commercialEstimate?.metalFramingMaterialQty?.toString() || '0');
  const [metalFramingMaterialUnit, setMetalFramingMaterialUnit] = useState(job?.financials?.commercialEstimate?.metalFramingMaterialUnit || 'linear ft');
  const [metalFramingMaterialWaste, setMetalFramingMaterialWaste] = useState(job?.financials?.commercialEstimate?.metalFramingMaterialWaste?.toString() || '5');
  const [metalFramingMaterialUnitCost, setMetalFramingMaterialUnitCost] = useState(job?.financials?.commercialEstimate?.metalFramingMaterialUnitCost?.toString() || '0.40');
  
  // Material worksheet fields - Insulation
  const [insulationMaterialQty, setInsulationMaterialQty] = useState(job?.financials?.commercialEstimate?.insulationMaterialQty?.toString() || '0');
  const [insulationMaterialUnit, setInsulationMaterialUnit] = useState(job?.financials?.commercialEstimate?.insulationMaterialUnit || 'sqft');
  const [insulationMaterialWaste, setInsulationMaterialWaste] = useState(job?.financials?.commercialEstimate?.insulationMaterialWaste?.toString() || '5');
  const [insulationMaterialUnitCost, setInsulationMaterialUnitCost] = useState(job?.financials?.commercialEstimate?.insulationMaterialUnitCost?.toString() || '0.15');
  
  // Material worksheet fields - FRP
  const [frpMaterialQty, setFrpMaterialQty] = useState(job?.financials?.commercialEstimate?.frpMaterialQty?.toString() || '0');
  const [frpMaterialUnit, setFrpMaterialUnit] = useState(job?.financials?.commercialEstimate?.frpMaterialUnit || 'sqft');
  const [frpMaterialWaste, setFrpMaterialWaste] = useState(job?.financials?.commercialEstimate?.frpMaterialWaste?.toString() || '5');
  const [frpMaterialUnitCost, setFrpMaterialUnitCost] = useState(job?.financials?.commercialEstimate?.frpMaterialUnitCost?.toString() || '0.85');
  
  // Additional fields for commercial estimates
  const [overheadPercentage, setOverheadPercentage] = useState(job?.financials?.commercialEstimate?.overheadPercentage?.toString() || '15');
  const [profitPercentage, setProfitPercentage] = useState(job?.financials?.commercialEstimate?.profitPercentage?.toString() || '20');
  const [salesTaxRate, setSalesTaxRate] = useState(job?.financials?.commercialEstimate?.salesTaxRate?.toString() || '7.25');
  const [totalEstimateAmount, setTotalEstimateAmount] = useState(job?.financials?.commercialEstimate?.totalEstimateAmount?.toString() || '');

  // Sync local state with job prop
  useEffect(() => {
    if (!job?.financials?.commercialEstimate) return;
    
    const estimate = job.financials.commercialEstimate;
    
    // Bid version management
    setCurrentBidVersion(estimate.currentBidVersion || 'initial');
    setBidVersions(estimate.bidVersions || ['initial']);
    
    // Breakdowns management
    setBreakdowns(estimate.breakdowns || []);
    
    setEquipmentCost(estimate.equipmentCost?.toString() || '0');
    
    // ACT Labor
    setActLaborQty(estimate.actLaborQty?.toString() || '0');
    setActLaborUnit(estimate.actLaborUnit || 'sqft');
    setActLaborWaste(estimate.actLaborWaste?.toString() || '5');
    setActLaborUnitCost(estimate.actLaborUnitCost?.toString() || '0.85');
    setActLaborCost(estimate.actLaborCost?.toString() || '0');
    
    // Drywall Labor
    setDrywallLaborQty(estimate.drywallLaborQty?.toString() || '0');
    setDrywallLaborUnit(estimate.drywallLaborUnit || 'sqft');
    setDrywallLaborWaste(estimate.drywallLaborWaste?.toString() || '5');
    setDrywallLaborUnitCost(estimate.drywallLaborUnitCost?.toString() || '0.75');
    setDrywallLaborCost(estimate.drywallLaborCost?.toString() || '0');
    
    // Channel Labor
    setChannelLaborQty(estimate.channelLaborQty?.toString() || '0');
    setChannelLaborUnit(estimate.channelLaborUnit || 'linear ft');
    setChannelLaborWaste(estimate.channelLaborWaste?.toString() || '5');
    setChannelLaborUnitCost(estimate.channelLaborUnitCost?.toString() || '0.45');
    setChannelLaborCost(estimate.channelLaborCost?.toString() || '0');
    
    // Suspended Grid Labor
    setSuspendedGridLaborQty(estimate.suspendedGridLaborQty?.toString() || '0');
    setSuspendedGridLaborUnit(estimate.suspendedGridLaborUnit || 'sqft');
    setSuspendedGridLaborWaste(estimate.suspendedGridLaborWaste?.toString() || '5');
    setSuspendedGridLaborUnitCost(estimate.suspendedGridLaborUnitCost?.toString() || '0.95');
    setSuspendedGridLaborCost(estimate.suspendedGridLaborCost?.toString() || '0');
    
    // Metal Framing Labor
    setMetalFramingLaborQty(estimate.metalFramingLaborQty?.toString() || '0');
    setMetalFramingLaborUnit(estimate.metalFramingLaborUnit || 'linear ft');
    setMetalFramingLaborWaste(estimate.metalFramingLaborWaste?.toString() || '5');
    setMetalFramingLaborUnitCost(estimate.metalFramingLaborUnitCost?.toString() || '0.65');
    setMetalFramingLaborCost(estimate.metalFramingLaborCost?.toString() || '0');
    
    // Insulation Labor
    setInsulationLaborQty(estimate.insulationLaborQty?.toString() || '0');
    setInsulationLaborUnit(estimate.insulationLaborUnit || 'sqft');
    setInsulationLaborWaste(estimate.insulationLaborWaste?.toString() || '5');
    setInsulationLaborUnitCost(estimate.insulationLaborUnitCost?.toString() || '0.35');
    setInsulationLaborCost(estimate.insulationLaborCost?.toString() || '0');
    
    // FRP Labor
    setFrpLaborQty(estimate.frpLaborQty?.toString() || '0');
    setFrpLaborUnit(estimate.frpLaborUnit || 'sqft');
    setFrpLaborWaste(estimate.frpLaborWaste?.toString() || '5');
    setFrpLaborUnitCost(estimate.frpLaborUnitCost?.toString() || '1.25');
    setFrpLaborCost(estimate.frpLaborCost?.toString() || '0');
    
    // Door Install Labor
    setDoorInstallLaborQty(estimate.doorInstallLaborQty?.toString() || '0');
    setDoorInstallLaborUnit(estimate.doorInstallLaborUnit || 'each');
    setDoorInstallLaborWaste(estimate.doorInstallLaborWaste?.toString() || '5');
    setDoorInstallLaborUnitCost(estimate.doorInstallLaborUnitCost?.toString() || '85.00');
    setDoorInstallLaborCost(estimate.doorInstallLaborCost?.toString() || '0');
    
    // Materials
    setActMaterialCost(estimate.actMaterialCost?.toString() || '0');
    setDrywallMaterialCost(estimate.drywallMaterialCost?.toString() || '0');
    setChannelMaterialCost(estimate.channelMaterialCost?.toString() || '0');
    setSuspendedGridMaterialCost(estimate.suspendedGridMaterialCost?.toString() || '0');
    setMetalFramingMaterialCost(estimate.metalFramingMaterialCost?.toString() || '0');
    setInsulationMaterialCost(estimate.insulationMaterialCost?.toString() || '0');
    setFrpMaterialCost(estimate.frpMaterialCost?.toString() || '0');
    
    // Material worksheet fields - ACT
    setActMaterialQty(estimate.actMaterialQty?.toString() || '0');
    setActMaterialUnit(estimate.actMaterialUnit || 'sqft');
    setActMaterialWaste(estimate.actMaterialWaste?.toString() || '5');
    setActMaterialUnitCost(estimate.actMaterialUnitCost?.toString() || '0.45');
    
    // Material worksheet fields - Drywall
    setDrywallMaterialQty(estimate.drywallMaterialQty?.toString() || '0');
    setDrywallMaterialUnit(estimate.drywallMaterialUnit || 'sqft');
    setDrywallMaterialWaste(estimate.drywallMaterialWaste?.toString() || '5');
    setDrywallMaterialUnitCost(estimate.drywallMaterialUnitCost?.toString() || '0.35');
    
    // Material worksheet fields - Channel
    setChannelMaterialQty(estimate.channelMaterialQty?.toString() || '0');
    setChannelMaterialUnit(estimate.channelMaterialUnit || 'linear ft');
    setChannelMaterialWaste(estimate.channelMaterialWaste?.toString() || '5');
    setChannelMaterialUnitCost(estimate.channelMaterialUnitCost?.toString() || '0.25');
    
    // Material worksheet fields - Suspended Grid
    setSuspendedGridMaterialQty(estimate.suspendedGridMaterialQty?.toString() || '0');
    setSuspendedGridMaterialUnit(estimate.suspendedGridMaterialUnit || 'sqft');
    setSuspendedGridMaterialWaste(estimate.suspendedGridMaterialWaste?.toString() || '5');
    setSuspendedGridMaterialUnitCost(estimate.suspendedGridMaterialUnitCost?.toString() || '0.55');
    
    // Material worksheet fields - Metal Framing
    setMetalFramingMaterialQty(estimate.metalFramingMaterialQty?.toString() || '0');
    setMetalFramingMaterialUnit(estimate.metalFramingMaterialUnit || 'linear ft');
    setMetalFramingMaterialWaste(estimate.metalFramingMaterialWaste?.toString() || '5');
    setMetalFramingMaterialUnitCost(estimate.metalFramingMaterialUnitCost?.toString() || '0.40');
    
    // Material worksheet fields - Insulation
    setInsulationMaterialQty(estimate.insulationMaterialQty?.toString() || '0');
    setInsulationMaterialUnit(estimate.insulationMaterialUnit || 'sqft');
    setInsulationMaterialWaste(estimate.insulationMaterialWaste?.toString() || '5');
    setInsulationMaterialUnitCost(estimate.insulationMaterialUnitCost?.toString() || '0.15');
    
    // Material worksheet fields - FRP
    setFrpMaterialQty(estimate.frpMaterialQty?.toString() || '0');
    setFrpMaterialUnit(estimate.frpMaterialUnit || 'sqft');
    setFrpMaterialWaste(estimate.frpMaterialWaste?.toString() || '5');
    setFrpMaterialUnitCost(estimate.frpMaterialUnitCost?.toString() || '0.85');
    
    setOverheadPercentage(estimate.overheadPercentage?.toString() || '15');
    setProfitPercentage(estimate.profitPercentage?.toString() || '20');
    setSalesTaxRate(estimate.salesTaxRate?.toString() || '7.25');
    setTotalEstimateAmount(estimate.totalEstimateAmount?.toString() || '');
  }, [job?.financials?.commercialEstimate]);

  // Update job when values change
  const updateJobCommercialEstimate = (field, value) => {
    if (!job) return;
    
    onUpdateJob(job.id, {
      financials: {
        ...job.financials,
        commercialEstimate: {
          ...job.financials?.commercialEstimate,
          [field]: value
        }
      }
    });
  };

  // Handle input changes
  const handleInputChange = (field, value, setter) => {
    setter(value);
    updateJobCommercialEstimate(field, parseFloat(value) || 0);
  };

  // Handle breakdown management
  const addBreakdown = () => {
    if (!newBreakdownName.trim()) return;
    
    const newBreakdown = {
      id: Date.now().toString(),
      name: newBreakdownName.trim(),
      equipmentCost: 0,
      actLaborQty: 0,
      actLaborUnit: 'sqft',
      actLaborWaste: 5,
      actLaborUnitCost: 0.85,
      drywallLaborQty: 0,
      drywallLaborUnit: 'sqft',
      drywallLaborWaste: 5,
      drywallLaborUnitCost: 0.75,
      channelLaborQty: 0,
      channelLaborUnit: 'linear ft',
      channelLaborWaste: 5,
      channelLaborUnitCost: 0.45,
      suspendedGridLaborQty: 0,
      suspendedGridLaborUnit: 'sqft',
      suspendedGridLaborWaste: 5,
      suspendedGridLaborUnitCost: 0.95,
      metalFramingLaborQty: 0,
      metalFramingLaborUnit: 'linear ft',
      metalFramingLaborWaste: 5,
      metalFramingLaborUnitCost: 0.65,
      insulationLaborQty: 0,
      insulationLaborUnit: 'sqft',
      insulationLaborWaste: 5,
      insulationLaborUnitCost: 0.35,
      frpLaborQty: 0,
      frpLaborUnit: 'sqft',
      frpLaborWaste: 5,
      frpLaborUnitCost: 1.25,
      doorInstallLaborQty: 0,
      doorInstallLaborUnit: 'each',
      doorInstallLaborWaste: 5,
      doorInstallLaborUnitCost: 85.00,
      actMaterialCost: 0,
      drywallMaterialCost: 0,
      channelMaterialCost: 0,
      suspendedGridMaterialCost: 0,
      metalFramingMaterialCost: 0,
      insulationMaterialCost: 0,
      frpMaterialCost: 0,
      
      // Material worksheet fields - ACT
      actMaterialQty: 0,
      actMaterialUnit: 'sqft',
      actMaterialWaste: 5,
      actMaterialUnitCost: 0.45,
      
      // Material worksheet fields - Drywall
      drywallMaterialQty: 0,
      drywallMaterialUnit: 'sqft',
      drywallMaterialWaste: 5,
      drywallMaterialUnitCost: 0.35,
      
      // Material worksheet fields - Channel
      channelMaterialQty: 0,
      channelMaterialUnit: 'linear ft',
      channelMaterialWaste: 5,
      channelMaterialUnitCost: 0.25,
      
      // Material worksheet fields - Suspended Grid
      suspendedGridMaterialQty: 0,
      suspendedGridMaterialUnit: 'sqft',
      suspendedGridMaterialWaste: 5,
      suspendedGridMaterialUnitCost: 0.55,
      
      // Material worksheet fields - Metal Framing
      metalFramingMaterialQty: 0,
      metalFramingMaterialUnit: 'linear ft',
      metalFramingMaterialWaste: 5,
      metalFramingMaterialUnitCost: 0.40,
      
      // Material worksheet fields - Insulation
      insulationMaterialQty: 0,
      insulationMaterialUnit: 'sqft',
      insulationMaterialWaste: 5,
      insulationMaterialUnitCost: 0.15,
      
      // Material worksheet fields - FRP
      frpMaterialQty: 0,
      frpMaterialUnit: 'sqft',
      frpMaterialWaste: 5,
      frpMaterialUnitCost: 0.85
    };
    
    const updatedBreakdowns = [...breakdowns, newBreakdown];
    setBreakdowns(updatedBreakdowns);
    setNewBreakdownName('');
    
    // Update job with new breakdowns
    updateJobCommercialEstimate('breakdowns', updatedBreakdowns);
  };

  const removeBreakdown = (breakdownId) => {
    const updatedBreakdowns = breakdowns.filter(b => b.id !== breakdownId);
    setBreakdowns(updatedBreakdowns);
    updateJobCommercialEstimate('breakdowns', updatedBreakdowns);
  };

  const updateBreakdown = (breakdownId, field, value) => {
    const updatedBreakdowns = breakdowns.map(b => 
      b.id === breakdownId ? { ...b, [field]: value } : b
    );
    setBreakdowns(updatedBreakdowns);
    updateJobCommercialEstimate('breakdowns', updatedBreakdowns);
  };

  // Handle bid version management
  const createNewBidVersion = () => {
    if (!bidVersionDescription.trim()) return;
    
    const newVersion = bidVersionDescription.trim();
    const updatedVersions = [...bidVersions, newVersion];
    setBidVersions(updatedVersions);
    setCurrentBidVersion(newVersion);
    setBidVersionDescription('');
    
    // Save current estimate data to the new version
    const currentEstimateData = {
      equipmentCost: parseFloat(equipmentCost) || 0,
      actLaborQty: parseFloat(actLaborQty) || 0,
      actLaborUnit,
      actLaborWaste: parseFloat(actLaborWaste) || 0,
      actLaborUnitCost: parseFloat(actLaborUnitCost) || 0,
      drywallLaborQty: parseFloat(drywallLaborQty) || 0,
      drywallLaborUnit,
      drywallLaborWaste: parseFloat(drywallLaborWaste) || 0,
      drywallLaborUnitCost: parseFloat(drywallLaborUnitCost) || 0,
      channelLaborQty: parseFloat(channelLaborQty) || 0,
      channelLaborUnit,
      channelLaborWaste: parseFloat(channelLaborWaste) || 0,
      channelLaborUnitCost: parseFloat(channelLaborUnitCost) || 0,
      suspendedGridLaborQty: parseFloat(suspendedGridLaborQty) || 0,
      suspendedGridLaborUnit,
      suspendedGridLaborWaste: parseFloat(suspendedGridLaborWaste) || 0,
      suspendedGridLaborUnitCost: parseFloat(suspendedGridLaborUnitCost) || 0,
      metalFramingLaborQty: parseFloat(metalFramingLaborQty) || 0,
      metalFramingLaborUnit,
      metalFramingLaborWaste: parseFloat(metalFramingLaborWaste) || 0,
      metalFramingLaborUnitCost: parseFloat(metalFramingLaborUnitCost) || 0,
      insulationLaborQty: parseFloat(insulationLaborQty) || 0,
      insulationLaborUnit,
      insulationLaborWaste: parseFloat(insulationLaborWaste) || 0,
      insulationLaborUnitCost: parseFloat(insulationLaborUnitCost) || 0,
      frpLaborQty: parseFloat(frpLaborQty) || 0,
      frpLaborUnit,
      frpLaborWaste: parseFloat(frpLaborWaste) || 0,
      frpLaborUnitCost: parseFloat(frpLaborUnitCost) || 0,
      doorInstallLaborQty: parseFloat(doorInstallLaborQty) || 0,
      doorInstallLaborUnit,
      doorInstallLaborWaste: parseFloat(doorInstallLaborWaste) || 0,
      doorInstallLaborUnitCost: parseFloat(doorInstallLaborUnitCost) || 0,
      actMaterialCost: parseFloat(actMaterialCost) || 0,
      drywallMaterialCost: parseFloat(drywallMaterialCost) || 0,
      channelMaterialCost: parseFloat(channelMaterialCost) || 0,
      suspendedGridMaterialCost: parseFloat(suspendedGridMaterialCost) || 0,
      metalFramingMaterialCost: parseFloat(metalFramingMaterialCost) || 0,
      insulationMaterialCost: parseFloat(insulationMaterialCost) || 0,
      frpMaterialCost: parseFloat(frpMaterialCost) || 0,
      
      // Material worksheet fields - ACT
      actMaterialQty: parseFloat(actMaterialQty) || 0,
      actMaterialUnit,
      actMaterialWaste: parseFloat(actMaterialWaste) || 0,
      actMaterialUnitCost: parseFloat(actMaterialUnitCost) || 0,
      
      // Material worksheet fields - Drywall
      drywallMaterialQty: parseFloat(drywallMaterialQty) || 0,
      drywallMaterialUnit,
      drywallMaterialWaste: parseFloat(drywallMaterialWaste) || 0,
      drywallMaterialUnitCost: parseFloat(drywallMaterialUnitCost) || 0,
      
      // Material worksheet fields - Channel
      channelMaterialQty: parseFloat(channelMaterialQty) || 0,
      channelMaterialUnit,
      channelMaterialWaste: parseFloat(channelMaterialWaste) || 0,
      channelMaterialUnitCost: parseFloat(channelMaterialUnitCost) || 0,
      
      // Material worksheet fields - Suspended Grid
      suspendedGridMaterialQty: parseFloat(suspendedGridMaterialQty) || 0,
      suspendedGridMaterialUnit,
      suspendedGridMaterialWaste: parseFloat(suspendedGridMaterialWaste) || 0,
      suspendedGridMaterialUnitCost: parseFloat(suspendedGridMaterialUnitCost) || 0,
      
      // Material worksheet fields - Metal Framing
      metalFramingMaterialQty: parseFloat(metalFramingMaterialQty) || 0,
      metalFramingMaterialUnit,
      metalFramingMaterialWaste: parseFloat(metalFramingMaterialWaste) || 0,
      metalFramingMaterialUnitCost: parseFloat(metalFramingMaterialUnitCost) || 0,
      
      // Material worksheet fields - Insulation
      insulationMaterialQty: parseFloat(insulationMaterialQty) || 0,
      insulationMaterialUnit,
      insulationMaterialWaste: parseFloat(insulationMaterialWaste) || 0,
      insulationMaterialUnitCost: parseFloat(insulationMaterialUnitCost) || 0,
      
      // Material worksheet fields - FRP
      frpMaterialQty: parseFloat(frpMaterialQty) || 0,
      frpMaterialUnit,
      frpMaterialWaste: parseFloat(frpMaterialWaste) || 0,
      frpMaterialUnitCost: parseFloat(frpMaterialUnitCost) || 0,
      
      overheadPercentage: parseFloat(overheadPercentage) || 15,
      profitPercentage: parseFloat(profitPercentage) || 20,
      salesTaxRate: parseFloat(salesTaxRate) || 7.25,
      breakdowns: [...breakdowns]
    };
    
    // Update job with new bid version data
    updateJobCommercialEstimate('bidVersions', updatedVersions);
    updateJobCommercialEstimate('currentBidVersion', newVersion);
    updateJobCommercialEstimate(`bidVersionData.${newVersion}`, currentEstimateData);
  };

  const switchBidVersion = (version) => {
    setCurrentBidVersion(version);
    updateJobCommercialEstimate('currentBidVersion', version);
    
    // Load estimate data for the selected version
    const versionData = job?.financials?.commercialEstimate?.bidVersionData?.[version];
    if (versionData) {
      // Update all the state variables with the version data
      setEquipmentCost(versionData.equipmentCost?.toString() || '0');
      setActLaborQty(versionData.actLaborQty?.toString() || '0');
      setActLaborUnit(versionData.actLaborUnit || 'sqft');
      setActLaborWaste(versionData.actLaborWaste?.toString() || '5');
      setActLaborUnitCost(versionData.actLaborUnitCost?.toString() || '0.85');
      setDrywallLaborQty(versionData.drywallLaborQty?.toString() || '0');
      setDrywallLaborUnit(versionData.drywallLaborUnit || 'sqft');
      setDrywallLaborWaste(versionData.drywallLaborWaste?.toString() || '5');
      setDrywallLaborUnitCost(versionData.drywallLaborUnitCost?.toString() || '0.75');
      setChannelLaborQty(versionData.channelLaborQty?.toString() || '0');
      setChannelLaborUnit(versionData.channelLaborUnit || 'linear ft');
      setChannelLaborWaste(versionData.channelLaborWaste?.toString() || '5');
      setChannelLaborUnitCost(versionData.channelLaborUnitCost?.toString() || '0.45');
      setSuspendedGridLaborQty(versionData.suspendedGridLaborQty?.toString() || '0');
      setSuspendedGridLaborUnit(versionData.suspendedGridLaborUnit || 'sqft');
      setSuspendedGridLaborWaste(versionData.suspendedGridLaborWaste?.toString() || '5');
      setSuspendedGridLaborUnitCost(versionData.suspendedGridLaborUnitCost?.toString() || '0.95');
      setMetalFramingLaborQty(versionData.metalFramingLaborQty?.toString() || '0');
      setMetalFramingLaborUnit(versionData.metalFramingLaborUnit || 'linear ft');
      setMetalFramingLaborWaste(versionData.metalFramingLaborWaste?.toString() || '5');
      setMetalFramingLaborUnitCost(versionData.metalFramingLaborUnitCost?.toString() || '0.65');
      setInsulationLaborQty(versionData.insulationLaborQty?.toString() || '0');
      setInsulationLaborUnit(versionData.insulationLaborUnit || 'sqft');
      setInsulationLaborWaste(versionData.insulationLaborWaste?.toString() || '5');
      setInsulationLaborUnitCost(versionData.insulationLaborUnitCost?.toString() || '0.35');
      setFrpLaborQty(versionData.frpLaborQty?.toString() || '0');
      setFrpLaborUnit(versionData.frpLaborUnit || 'sqft');
      setFrpLaborWaste(versionData.frpLaborWaste?.toString() || '5');
      setFrpLaborUnitCost(versionData.frpLaborUnitCost?.toString() || '1.25');
      setDoorInstallLaborQty(versionData.doorInstallLaborQty?.toString() || '0');
      setDoorInstallLaborUnit(versionData.doorInstallLaborUnit || 'each');
      setDoorInstallLaborWaste(versionData.doorInstallLaborWaste?.toString() || '5');
      setDoorInstallLaborUnitCost(versionData.doorInstallLaborUnitCost?.toString() || '85.00');
      setActMaterialCost(versionData.actMaterialCost?.toString() || '0');
      setDrywallMaterialCost(versionData.drywallMaterialCost?.toString() || '0');
      setChannelMaterialCost(versionData.channelMaterialCost?.toString() || '0');
      setSuspendedGridMaterialCost(versionData.suspendedGridMaterialCost?.toString() || '0');
      setMetalFramingMaterialCost(versionData.metalFramingMaterialCost?.toString() || '0');
      setInsulationMaterialCost(versionData.insulationMaterialCost?.toString() || '0');
      setFrpMaterialCost(versionData.frpMaterialCost?.toString() || '0');
      
      // Load material worksheet fields
      setActMaterialQty(versionData.actMaterialQty?.toString() || '0');
      setActMaterialUnit(versionData.actMaterialUnit || 'sqft');
      setActMaterialWaste(versionData.actMaterialWaste?.toString() || '5');
      setActMaterialUnitCost(versionData.actMaterialUnitCost?.toString() || '0.45');
      
      setDrywallMaterialQty(versionData.drywallMaterialQty?.toString() || '0');
      setDrywallMaterialUnit(versionData.drywallMaterialUnit || 'sqft');
      setDrywallMaterialWaste(versionData.drywallMaterialWaste?.toString() || '5');
      setDrywallMaterialUnitCost(versionData.drywallMaterialUnitCost?.toString() || '0.35');
      
      setChannelMaterialQty(versionData.channelMaterialQty?.toString() || '0');
      setChannelMaterialUnit(versionData.channelMaterialUnit || 'linear ft');
      setChannelMaterialWaste(versionData.channelMaterialWaste?.toString() || '5');
      setChannelMaterialUnitCost(versionData.channelMaterialUnitCost?.toString() || '0.25');
      
      setSuspendedGridMaterialQty(versionData.suspendedGridMaterialQty?.toString() || '0');
      setSuspendedGridMaterialUnit(versionData.suspendedGridMaterialUnit || 'sqft');
      setSuspendedGridMaterialWaste(versionData.suspendedGridMaterialWaste?.toString() || '5');
      setSuspendedGridMaterialUnitCost(versionData.suspendedGridMaterialUnitCost?.toString() || '0.55');
      
      setMetalFramingMaterialQty(versionData.metalFramingMaterialQty?.toString() || '0');
      setMetalFramingMaterialUnit(versionData.metalFramingMaterialUnit || 'linear ft');
      setMetalFramingMaterialWaste(versionData.metalFramingMaterialWaste?.toString() || '5');
      setMetalFramingMaterialUnitCost(versionData.metalFramingMaterialUnitCost?.toString() || '0.40');
      
      setInsulationMaterialQty(versionData.insulationMaterialQty?.toString() || '0');
      setInsulationMaterialUnit(versionData.insulationMaterialUnit || 'sqft');
      setInsulationMaterialWaste(versionData.insulationMaterialWaste?.toString() || '5');
      setInsulationMaterialUnitCost(versionData.insulationMaterialUnitCost?.toString() || '0.15');
      
      setFrpMaterialQty(versionData.frpMaterialQty?.toString() || '0');
      setFrpMaterialUnit(versionData.frpMaterialUnit || 'sqft');
      setFrpMaterialWaste(versionData.frpMaterialWaste?.toString() || '5');
      setFrpMaterialUnitCost(versionData.frpMaterialUnitCost?.toString() || '0.85');
      
      setOverheadPercentage(versionData.overheadPercentage?.toString() || '15');
      setProfitPercentage(versionData.profitPercentage?.toString() || '20');
      setSalesTaxRate(versionData.salesTaxRate?.toString() || '7.25');
      setBreakdowns(versionData.breakdowns || []);
    }
  };

  // Calculate commercial estimate breakdown
  const calculations = useMemo(() => {
    const equipment = parseFloat(equipmentCost) || 0;
    
    // Calculate labor costs from worksheet data
    const actLaborQtyNum = parseFloat(actLaborQty) || 0;
    const actLaborWasteNum = parseFloat(actLaborWaste) || 0;
    const actLaborUnitCostNum = parseFloat(actLaborUnitCost) || 0;
    const actLaborAdjustedQty = actLaborQtyNum * (1 + actLaborWasteNum / 100);
    const actLabor = actLaborAdjustedQty * actLaborUnitCostNum;
    
    const drywallLaborQtyNum = parseFloat(drywallLaborQty) || 0;
    const drywallLaborWasteNum = parseFloat(drywallLaborWaste) || 0;
    const drywallLaborUnitCostNum = parseFloat(drywallLaborUnitCost) || 0;
    const drywallLaborAdjustedQty = drywallLaborQtyNum * (1 + drywallLaborWasteNum / 100);
    const drywallLabor = drywallLaborAdjustedQty * drywallLaborUnitCostNum;
    
    const channelLaborQtyNum = parseFloat(channelLaborQty) || 0;
    const channelLaborWasteNum = parseFloat(channelLaborWaste) || 0;
    const channelLaborUnitCostNum = parseFloat(channelLaborUnitCost) || 0;
    const channelLaborAdjustedQty = channelLaborQtyNum * (1 + channelLaborWasteNum / 100);
    const channelLabor = channelLaborAdjustedQty * channelLaborUnitCostNum;
    
    const suspendedGridLaborQtyNum = parseFloat(suspendedGridLaborQty) || 0;
    const suspendedGridLaborWasteNum = parseFloat(suspendedGridLaborWaste) || 0;
    const suspendedGridLaborUnitCostNum = parseFloat(suspendedGridLaborUnitCost) || 0;
    const suspendedGridLaborAdjustedQty = suspendedGridLaborQtyNum * (1 + suspendedGridLaborWasteNum / 100);
    const suspendedGridLabor = suspendedGridLaborAdjustedQty * suspendedGridLaborUnitCostNum;
    
    const metalFramingLaborQtyNum = parseFloat(metalFramingLaborQty) || 0;
    const metalFramingLaborWasteNum = parseFloat(metalFramingLaborWaste) || 0;
    const metalFramingLaborUnitCostNum = parseFloat(metalFramingLaborUnitCost) || 0;
    const metalFramingLaborAdjustedQty = metalFramingLaborQtyNum * (1 + metalFramingLaborWasteNum / 100);
    const metalFramingLabor = metalFramingLaborAdjustedQty * metalFramingLaborUnitCostNum;
    
    const insulationLaborQtyNum = parseFloat(insulationLaborQty) || 0;
    const insulationLaborWasteNum = parseFloat(insulationLaborWaste) || 0;
    const insulationLaborUnitCostNum = parseFloat(insulationLaborUnitCost) || 0;
    const insulationLaborAdjustedQty = insulationLaborQtyNum * (1 + insulationLaborWasteNum / 100);
    const insulationLabor = insulationLaborAdjustedQty * insulationLaborUnitCostNum;
    
    const frpLaborQtyNum = parseFloat(frpLaborQty) || 0;
    const frpLaborWasteNum = parseFloat(frpLaborWaste) || 0;
    const frpLaborUnitCostNum = parseFloat(frpLaborUnitCost) || 0;
    const frpLaborAdjustedQty = frpLaborQtyNum * (1 + frpLaborWasteNum / 100);
    const frpLabor = frpLaborAdjustedQty * frpLaborUnitCostNum;
    
    const doorInstallLaborQtyNum = parseFloat(doorInstallLaborQty) || 0;
    const doorInstallLaborWasteNum = parseFloat(doorInstallLaborWaste) || 0;
    const doorInstallLaborUnitCostNum = parseFloat(doorInstallLaborUnitCost) || 0;
    const doorInstallLaborAdjustedQty = doorInstallLaborQtyNum * (1 + doorInstallLaborWasteNum / 100);
    const doorInstallLabor = doorInstallLaborAdjustedQty * doorInstallLaborUnitCostNum;
    
    // Material costs
    const actMaterialQtyNum = parseFloat(actMaterialQty) || 0;
    const actMaterialWasteNum = parseFloat(actMaterialWaste) || 0;
    const actMaterialUnitCostNum = parseFloat(actMaterialUnitCost) || 0;
    const actMaterial = actMaterialQtyNum * (1 + actMaterialWasteNum / 100) * actMaterialUnitCostNum;

    const drywallMaterialQtyNum = parseFloat(drywallMaterialQty) || 0;
    const drywallMaterialWasteNum = parseFloat(drywallMaterialWaste) || 0;
    const drywallMaterialUnitCostNum = parseFloat(drywallMaterialUnitCost) || 0;
    const drywallMaterial = drywallMaterialQtyNum * (1 + drywallMaterialWasteNum / 100) * drywallMaterialUnitCostNum;

    const channelMaterialQtyNum = parseFloat(channelMaterialQty) || 0;
    const channelMaterialWasteNum = parseFloat(channelMaterialWaste) || 0;
    const channelMaterialUnitCostNum = parseFloat(channelMaterialUnitCost) || 0;
    const channelMaterial = channelMaterialQtyNum * (1 + channelMaterialWasteNum / 100) * channelMaterialUnitCostNum;

    const suspendedGridMaterialQtyNum = parseFloat(suspendedGridMaterialQty) || 0;
    const suspendedGridMaterialWasteNum = parseFloat(suspendedGridMaterialWaste) || 0;
    const suspendedGridMaterialUnitCostNum = parseFloat(suspendedGridMaterialUnitCost) || 0;
    const suspendedGridMaterial = suspendedGridMaterialQtyNum * (1 + suspendedGridMaterialWasteNum / 100) * suspendedGridMaterialUnitCostNum;

    const metalFramingMaterialQtyNum = parseFloat(metalFramingMaterialQty) || 0;
    const metalFramingMaterialWasteNum = parseFloat(metalFramingMaterialWaste) || 0;
    const metalFramingMaterialUnitCostNum = parseFloat(metalFramingMaterialUnitCost) || 0;
    const metalFramingMaterial = metalFramingMaterialQtyNum * (1 + metalFramingMaterialWasteNum / 100) * metalFramingMaterialUnitCostNum;

    const insulationMaterialQtyNum = parseFloat(insulationMaterialQty) || 0;
    const insulationMaterialWasteNum = parseFloat(insulationMaterialWaste) || 0;
    const insulationMaterialUnitCostNum = parseFloat(insulationMaterialUnitCost) || 0;
    const insulationMaterial = insulationMaterialQtyNum * (1 + insulationMaterialWasteNum / 100) * insulationMaterialUnitCostNum;

    const frpMaterialQtyNum = parseFloat(frpMaterialQty) || 0;
    const frpMaterialWasteNum = parseFloat(frpMaterialWaste) || 0;
    const frpMaterialUnitCostNum = parseFloat(frpMaterialUnitCost) || 0;
    const frpMaterial = frpMaterialQtyNum * (1 + frpMaterialWasteNum / 100) * frpMaterialUnitCostNum;
    
    const overheadPct = parseFloat(overheadPercentage) || 0;
    const profitPct = parseFloat(profitPercentage) || 0;
    const taxRate = parseFloat(salesTaxRate) || 0;
    const totalEstimateAmountNum = parseFloat(totalEstimateAmount) || 0;

    // Calculate totals
    const totalLaborCost = actLabor + drywallLabor + channelLabor + suspendedGridLabor + 
                          metalFramingLabor + insulationLabor + frpLabor + doorInstallLabor;
    
    const totalMaterialCost = actMaterial + drywallMaterial + channelMaterial + suspendedGridMaterial + 
                            metalFramingMaterial + insulationMaterial + frpMaterial;
    
    const totalDirectCost = equipment + totalLaborCost + totalMaterialCost;
    
    // Calculate overhead and profit
    const overheadAmount = totalDirectCost * (overheadPct / 100);
    const subtotalBeforeProfit = totalDirectCost + overheadAmount;
    const profitAmount = subtotalBeforeProfit * (profitPct / 100);
    
    // Calculate sales tax on materials only
    const salesTax = totalMaterialCost * (taxRate / 100);
    
    // Final calculations
    const subtotalAfterProfit = subtotalBeforeProfit + profitAmount;
    const totalWithTax = subtotalAfterProfit + salesTax;
    
    // Use provided total estimate amount if available, otherwise use calculated total
    const finalTotalEstimate = totalEstimateAmountNum > 0 ? totalEstimateAmountNum : totalWithTax;
    
    // Calculate actual profit if total estimate is provided
    const actualProfit = finalTotalEstimate - totalWithTax;
    const actualProfitPercentage = totalWithTax > 0 ? (actualProfit / totalWithTax) * 100 : 0;

    return {
      // Individual costs
      equipment,
      actLabor,
      actMaterial,
      drywallLabor,
      drywallMaterial,
      channelLabor,
      channelMaterial,
      suspendedGridLabor,
      suspendedGridMaterial,
      metalFramingLabor,
      metalFramingMaterial,
      insulationLabor,
      insulationMaterial,
      frpLabor,
      frpMaterial,
      doorInstallLabor,
      
      // Worksheet data for display
      actLaborQty: actLaborQtyNum,
      actLaborUnit,
      actLaborWaste: actLaborWasteNum,
      actLaborAdjustedQty,
      actLaborUnitCost: actLaborUnitCostNum,
      drywallLaborQty: drywallLaborQtyNum,
      drywallLaborUnit,
      drywallLaborWaste: drywallLaborWasteNum,
      drywallLaborAdjustedQty,
      drywallLaborUnitCost: drywallLaborUnitCostNum,
      channelLaborQty: channelLaborQtyNum,
      channelLaborUnit,
      channelLaborWaste: channelLaborWasteNum,
      channelLaborAdjustedQty,
      channelLaborUnitCost: channelLaborUnitCostNum,
      suspendedGridLaborQty: suspendedGridLaborQtyNum,
      suspendedGridLaborUnit,
      suspendedGridLaborWaste: suspendedGridLaborWasteNum,
      suspendedGridLaborAdjustedQty,
      suspendedGridLaborUnitCost: suspendedGridLaborUnitCostNum,
      metalFramingLaborQty: metalFramingLaborQtyNum,
      metalFramingLaborUnit,
      metalFramingLaborWaste: metalFramingLaborWasteNum,
      metalFramingLaborAdjustedQty,
      metalFramingLaborUnitCost: metalFramingLaborUnitCostNum,
      insulationLaborQty: insulationLaborQtyNum,
      insulationLaborUnit,
      insulationLaborWaste: insulationLaborWasteNum,
      insulationLaborAdjustedQty,
      insulationLaborUnitCost: insulationLaborUnitCostNum,
      frpLaborQty: frpLaborQtyNum,
      frpLaborUnit,
      frpLaborWaste: frpLaborWasteNum,
      frpLaborAdjustedQty,
      frpLaborUnitCost: frpLaborUnitCostNum,
      doorInstallLaborQty: doorInstallLaborQtyNum,
      doorInstallLaborUnit,
      doorInstallLaborWaste: doorInstallLaborWasteNum,
      doorInstallLaborAdjustedQty,
      doorInstallLaborUnitCost: doorInstallLaborUnitCostNum,
      
      // Material worksheet data for display
      actMaterialQty: actMaterialQtyNum,
      actMaterialUnit,
      actMaterialWaste: actMaterialWasteNum,
      actMaterialAdjustedQty: actMaterialQtyNum * (1 + actMaterialWasteNum / 100),
      actMaterialUnitCost: actMaterialUnitCostNum,
      drywallMaterialQty: drywallMaterialQtyNum,
      drywallMaterialUnit,
      drywallMaterialWaste: drywallMaterialWasteNum,
      drywallMaterialAdjustedQty: drywallMaterialQtyNum * (1 + drywallMaterialWasteNum / 100),
      drywallMaterialUnitCost: drywallMaterialUnitCostNum,
      channelMaterialQty: channelMaterialQtyNum,
      channelMaterialUnit,
      channelMaterialWaste: channelMaterialWasteNum,
      channelMaterialAdjustedQty: channelMaterialQtyNum * (1 + channelMaterialWasteNum / 100),
      channelMaterialUnitCost: channelMaterialUnitCostNum,
      suspendedGridMaterialQty: suspendedGridMaterialQtyNum,
      suspendedGridMaterialUnit,
      suspendedGridMaterialWaste: suspendedGridMaterialWasteNum,
      suspendedGridMaterialAdjustedQty: suspendedGridMaterialQtyNum * (1 + suspendedGridMaterialWasteNum / 100),
      suspendedGridMaterialUnitCost: suspendedGridMaterialUnitCostNum,
      metalFramingMaterialQty: metalFramingMaterialQtyNum,
      metalFramingMaterialUnit,
      metalFramingMaterialWaste: metalFramingMaterialWasteNum,
      metalFramingMaterialAdjustedQty: metalFramingMaterialQtyNum * (1 + metalFramingMaterialWasteNum / 100),
      metalFramingMaterialUnitCost: metalFramingMaterialUnitCostNum,
      insulationMaterialQty: insulationMaterialQtyNum,
      insulationMaterialUnit,
      insulationMaterialWaste: insulationMaterialWasteNum,
      insulationMaterialAdjustedQty: insulationMaterialQtyNum * (1 + insulationMaterialWasteNum / 100),
      insulationMaterialUnitCost: insulationMaterialUnitCostNum,
      frpMaterialQty: frpMaterialQtyNum,
      frpMaterialUnit,
      frpMaterialWaste: frpMaterialWasteNum,
      frpMaterialAdjustedQty: frpMaterialQtyNum * (1 + frpMaterialWasteNum / 100),
      frpMaterialUnitCost: frpMaterialUnitCostNum,
      
      // Calculated totals
      totalLaborCost,
      totalMaterialCost,
      totalDirectCost,
      overheadAmount,
      subtotalBeforeProfit,
      profitAmount,
      subtotalAfterProfit,
      salesTax,
      totalWithTax,
      finalTotalEstimate,
      actualProfit,
      actualProfitPercentage,
      
      // Percentages
      overheadPercentage: overheadPct,
      profitPercentage: profitPct,
      salesTaxRate: taxRate
    };
  }, [
    equipmentCost, 
    actLaborQty, actLaborUnit, actLaborWaste, actLaborUnitCost,
    drywallLaborQty, drywallLaborUnit, drywallLaborWaste, drywallLaborUnitCost,
    channelLaborQty, channelLaborUnit, channelLaborWaste, channelLaborUnitCost,
    suspendedGridLaborQty, suspendedGridLaborUnit, suspendedGridLaborWaste, suspendedGridLaborUnitCost,
    metalFramingLaborQty, metalFramingLaborUnit, metalFramingLaborWaste, metalFramingLaborUnitCost,
    insulationLaborQty, insulationLaborUnit, insulationLaborWaste, insulationLaborUnitCost,
    frpLaborQty, frpLaborUnit, frpLaborWaste, frpLaborUnitCost,
    doorInstallLaborQty, doorInstallLaborUnit, doorInstallLaborWaste, doorInstallLaborUnitCost,
    actMaterialCost, drywallMaterialCost, channelMaterialCost, suspendedGridMaterialCost,
    metalFramingMaterialCost, insulationMaterialCost, frpMaterialCost,
    overheadPercentage, profitPercentage, salesTaxRate, totalEstimateAmount,
    actMaterialQty, actMaterialUnit, actMaterialWaste, actMaterialUnitCost,
    drywallMaterialQty, drywallMaterialUnit, drywallMaterialWaste, drywallMaterialUnitCost,
    channelMaterialQty, channelMaterialUnit, channelMaterialWaste, channelMaterialUnitCost,
    suspendedGridMaterialQty, suspendedGridMaterialUnit, suspendedGridMaterialWaste, suspendedGridMaterialUnitCost,
    metalFramingMaterialQty, metalFramingMaterialUnit, metalFramingMaterialWaste, metalFramingMaterialUnitCost,
    insulationMaterialQty, insulationMaterialUnit, insulationMaterialWaste, insulationMaterialUnitCost,
    frpMaterialQty, frpMaterialUnit, frpMaterialWaste, frpMaterialUnitCost
  ]);

  return {
    // Bid version management
    currentBidVersion, setCurrentBidVersion,
    bidVersions, setBidVersions,
    bidVersionDescription, setBidVersionDescription,
    
    // Breakdowns management
    breakdowns, setBreakdowns,
    newBreakdownName, setNewBreakdownName,
    
    // State
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
    
    // Functions
    handleInputChange,
    addBreakdown,
    removeBreakdown,
    updateBreakdown,
    createNewBidVersion,
    switchBidVersion,
    calculations
  };
};
