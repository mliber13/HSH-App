import { useState, useEffect, useMemo } from 'react';

export const useJobEstimate = (job, onUpdateJob) => {
  // Estimate state
  const [estimateSqft, setEstimateSqft] = useState(job?.financials?.estimate?.sqft?.toString() || '0');
  const [drywallMaterialRate, setDrywallMaterialRate] = useState(job?.financials?.estimate?.drywallMaterialRate?.toString() || '0.66');
  const [hangerRate, setHangerRate] = useState(job?.financials?.estimate?.hangerRate?.toString() || '0.27');
  const [finisherRate, setFinisherRate] = useState(job?.financials?.estimate?.finisherRate?.toString() || '0.27');
  const [prepCleanRate, setPrepCleanRate] = useState(job?.financials?.estimate?.prepCleanRate?.toString() || '0.03');
  const [drywallSalesTaxRate, setDrywallSalesTaxRate] = useState(job?.financials?.estimate?.drywallSalesTaxRate?.toString() || '7.25');
  const [totalEstimateAmount, setTotalEstimateAmount] = useState(job?.financials?.estimate?.totalEstimateAmount?.toString() || '');

  // Sync local state with job prop
  useEffect(() => {
    if (!job?.financials?.estimate) return;
    
    const newSqft = job.financials.estimate.sqft?.toString() || '0';
    const newMaterialRate = job.financials.estimate.drywallMaterialRate?.toString() || '0.66';
    const newHangerRate = job.financials.estimate.hangerRate?.toString() || '0.27';
    const newFinisherRate = job.financials.estimate.finisherRate?.toString() || '0.27';
    const newPrepCleanRate = job.financials.estimate.prepCleanRate?.toString() || '0.03';
    const newSalesTaxRate = job.financials.estimate.drywallSalesTaxRate?.toString() || '0';
    const newTotalEstimateAmount = job.financials.estimate.totalEstimateAmount?.toString() || '';
    
    if (estimateSqft !== newSqft) setEstimateSqft(newSqft);
    if (drywallMaterialRate !== newMaterialRate) setDrywallMaterialRate(newMaterialRate);
    if (hangerRate !== newHangerRate) setHangerRate(newHangerRate);
    if (finisherRate !== newFinisherRate) setFinisherRate(newFinisherRate);
    if (prepCleanRate !== newPrepCleanRate) setPrepCleanRate(newPrepCleanRate);
    if (drywallSalesTaxRate !== newSalesTaxRate) setDrywallSalesTaxRate(newSalesTaxRate);
    if (totalEstimateAmount !== newTotalEstimateAmount) setTotalEstimateAmount(newTotalEstimateAmount);
  }, [
    job?.financials?.estimate?.sqft,
    job?.financials?.estimate?.drywallMaterialRate,
    job?.financials?.estimate?.hangerRate,
    job?.financials?.estimate?.finisherRate,
    job?.financials?.estimate?.prepCleanRate,
    job?.financials?.estimate?.drywallSalesTaxRate,
    job?.financials?.estimate?.totalEstimateAmount
  ]);

  // Update job when values change
  const updateJobEstimate = (field, value) => {
    if (!job) return;
    
    onUpdateJob(job.id, {
      financials: {
        ...job.financials,
        estimate: {
          ...job.financials?.estimate,
          [field]: value
        }
      }
    });
  };

  // Handle input changes
  const handleInputChange = (field, value, setter) => {
    setter(value);
    updateJobEstimate(field, parseFloat(value) || 0);
  };

  // Calculate estimate breakdown
  const calculations = useMemo(() => {
    const sqft = parseFloat(estimateSqft) || 0;
    const materialRate = parseFloat(drywallMaterialRate) || 0;
    const hRate = parseFloat(hangerRate) || 0;
    const fRate = parseFloat(finisherRate) || 0;
    const pcRate = parseFloat(prepCleanRate) || 0;
    const taxRate = parseFloat(drywallSalesTaxRate) || 0;
    const totalEstimateAmountNum = parseFloat(totalEstimateAmount) || 0;

    const materialCost = sqft * materialRate;
    const hangerCost = sqft * hRate;
    const finisherCost = sqft * fRate;
    const prepCleanCost = sqft * pcRate;
    const salesTax = materialCost * (taxRate / 100);
    
    // Calculate labor costs with estimated tax rate (15% for payroll taxes, benefits, etc.)
    const estimatedTaxRate = 0.15;
    const hangerCostWithTax = hangerCost * (1 + estimatedTaxRate);
    const finisherCostWithTax = finisherCost * (1 + estimatedTaxRate);
    const prepCleanCostWithTax = prepCleanCost * (1 + estimatedTaxRate);
    const totalLaborCost = hangerCostWithTax + finisherCostWithTax + prepCleanCostWithTax;
    const totalMaterialCost = materialCost + salesTax;
    
    const calculatedTotalEstimate = materialCost + hangerCost + finisherCost + prepCleanCost + salesTax;
    const totalEstimate = totalEstimateAmountNum > 0 ? totalEstimateAmountNum : calculatedTotalEstimate;
    const totalCost = totalMaterialCost + totalLaborCost; // Use labor costs with tax included
    const profitAmount = totalEstimate - totalCost;
    const profitPercentage = totalCost > 0 ? (profitAmount / totalCost) * 100 : 0;

    return {
      sqft,
      materialCost,
      hangerCost,
      finisherCost,
      prepCleanCost,
      salesTax,
      totalLaborCost,
      totalMaterialCost,
      calculatedTotalEstimate,
      totalEstimate,
      totalCost,
      profitAmount,
      profitPercentage
    };
  }, [estimateSqft, drywallMaterialRate, hangerRate, finisherRate, prepCleanRate, drywallSalesTaxRate, totalEstimateAmount]);

  return {
    // State
    estimateSqft,
    setEstimateSqft,
    drywallMaterialRate,
    setDrywallMaterialRate,
    hangerRate,
    setHangerRate,
    finisherRate,
    setFinisherRate,
    prepCleanRate,
    setPrepCleanRate,
    drywallSalesTaxRate,
    setDrywallSalesTaxRate,
    totalEstimateAmount,
    setTotalEstimateAmount,
    
    // Functions
    handleInputChange,
    calculations
  };
};
