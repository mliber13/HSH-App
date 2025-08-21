import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useTimeClock } from '@/hooks/useTimeClock';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import useDailyLogs from '@/hooks/useDailyLogs';
import { storage, STORAGE_KEYS, generateId } from '@/lib/utils';
import locationService from '@/services/locationService';

// Employer tax rate for employees (17%)
const EMPLOYER_TAX_RATE = 0.17;

export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsUpdateTimestamp, setJobsUpdateTimestamp] = useState(Date.now());
  const [disableAutoSync, setDisableAutoSync] = useState(false);

  // Get data from useTimeClock and useEmployeeData
  const { timeEntries, pieceRateEntries } = useTimeClock();
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addToolDeduction,
    removeToolDeduction,
    bankHours,
    useBankedHours,
    updateEmployeeToolDeductions,
    addEmployeeDocument,
    removeEmployeeDocument
  } = useEmployeeData();

  // Daily logs functionality
  const {
    getLogsForJob,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
    addAttachmentToLog,
    removeAttachmentFromLog
  } = useDailyLogs();

  // Load jobs from localStorage on mount
  useEffect(() => {
    console.log('=== Loading jobs from localStorage ===');
    const savedJobs = storage.load(STORAGE_KEYS.JOBS, [], 'jobs');
    console.log('Loaded jobs from storage:', savedJobs);
    console.log('Loaded jobs array length:', savedJobs.length);
    
    // Log the specific job we're interested in
    const targetJob = savedJobs.find(j => j.id === 'test-job-2');
    if (targetJob) {
      console.log('Target job estimate sqft loaded:', targetJob.financials?.estimate?.sqft);
    }
    
    // Force a new array reference to ensure React detects the change
    setJobs([...savedJobs]);
    setLoading(false);
    setJobsUpdateTimestamp(Date.now());
    console.log('=== Jobs loaded from localStorage ===');
  }, []);

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    if (!loading) {
      console.log('=== Saving jobs to localStorage ===');
      console.log('Jobs to save:', jobs);
      console.log('Jobs array length:', jobs.length);
      
      // Log the specific job we're interested in
      const targetJob = jobs.find(j => j.id === 'test-job-2');
      if (targetJob) {
        console.log('Target job estimate sqft being saved:', targetJob.financials?.estimate?.sqft);
      }
      
      storage.save(STORAGE_KEYS.JOBS, jobs, 'jobs');
      console.log('=== Jobs saved to localStorage ===');
    }
  }, [jobs, loading]);

  // Pure function to calculate labor costs for a single job
  const calculateLaborCostsForSingleJob = useCallback((job, allTimeEntries, allPieceRateEntries, allEmployees) => {
    console.log(`=== LABOR COST CALCULATION FOR JOB ${job.id} ===`);
    console.log('All time entries passed to function:', allTimeEntries.length, allTimeEntries);
    console.log('All piece rate entries passed to function:', allPieceRateEntries.length, allPieceRateEntries);
    
    const jobTimeEntries = allTimeEntries.filter(entry => entry.jobId === job.id && entry.clockOutTime);
    const jobPieceRateEntries = allPieceRateEntries.filter(entry => entry.jobId === job.id && entry.status === 'completed');
    
    // Debug logging
    console.log('Job time entries:', jobTimeEntries.length, jobTimeEntries.map(e => ({ id: e.id, employeeId: e.employeeId, jobId: e.jobId, totalHours: e.totalHours, clockOutTime: e.clockOutTime, clockInTime: e.clockInTime, notes: e.notes })));
    console.log('Job piece rate entries:', jobPieceRateEntries.length, jobPieceRateEntries.map(e => ({ id: e.id, employeeId: e.employeeId, jobId: e.jobId, totalEarnings: e.totalEarnings, status: e.status, apprenticeId: e.apprenticeId, apprenticeHours: e.apprenticeHours })));
    console.log('All piece rate entries (before filtering):', allPieceRateEntries.length, allPieceRateEntries.map(e => ({ id: e.id, employeeId: e.employeeId, jobId: e.jobId, status: e.status, totalEarnings: e.totalEarnings })));

    // Calculate hourly labor costs
    const hourlyLaborCosts = [];
    const hourlyLaborMap = new Map();

    jobTimeEntries.forEach(entry => {
      const employee = allEmployees.find(emp => emp.id === entry.employeeId);
      if (employee && entry.totalHours) {
        const cost = entry.totalHours * employee.hourlyRate;
        const key = `hourly-${employee.firstName}-${employee.lastName}`;
        
        if (hourlyLaborMap.has(key)) {
          const existing = hourlyLaborMap.get(key);
          existing.amount += cost;
          existing.hours += entry.totalHours;
        } else {
          hourlyLaborMap.set(key, {
            id: `labor-${generateId()}`,
            description: `${employee.firstName} ${employee.lastName} - Hourly Labor`,
            amount: cost,
            hours: entry.totalHours,
            type: 'hourly',
            employeeId: employee.id
          });
        }
      }
    });

    hourlyLaborMap.forEach(laborCost => {
      hourlyLaborCosts.push(laborCost);
    });

    // Calculate piece rate labor costs
    const pieceRateLaborCosts = [];
    const pieceRateLaborMap = new Map();

    jobPieceRateEntries.forEach(entry => {
      const employee = allEmployees.find(emp => emp.id === entry.employeeId);
      if (employee && entry.totalEarnings) {
        const workType = employee.role === 'Hanger' ? 'Hanging' : 
                       entry.coat === 'tape' ? 'Tape Coat' :
                       entry.coat === 'bed' ? 'Bed Coat' :
                       entry.coat === 'skim' ? 'Skim Coat' :
                       entry.coat === 'texture' ? 'Texture Coat' :
                       entry.coat === 'sand' ? 'Sand Coat' : entry.coat;
        
        const key = `piece-${employee.firstName}-${employee.lastName}-${workType}`;
        
        if (pieceRateLaborMap.has(key)) {
          const existing = pieceRateLaborMap.get(key);
          existing.amount += entry.totalEarnings;
          existing.completionPercentage += entry.completionPercentage || 0;
        } else {
          pieceRateLaborMap.set(key, {
            id: `labor-${generateId()}`,
            description: `${employee.firstName} ${employee.lastName} - ${workType} (Piece Rate)`,
            amount: entry.totalEarnings,
            completionPercentage: entry.completionPercentage || 0,
            type: 'piece-rate',
            employeeId: employee.id,
            workType: workType
          });
        }
      }
    });

    pieceRateLaborMap.forEach(laborCost => {
      pieceRateLaborCosts.push(laborCost);
    });

    // Calculate apprentice costs
    const apprenticeLaborCosts = [];
    const apprenticeLaborMap = new Map();

    jobPieceRateEntries.forEach(entry => {
      if (entry.apprenticeId && entry.apprenticeCost) {
        const apprentice = allEmployees.find(emp => emp.id === entry.apprenticeId);
        if (apprentice) {
          const key = `apprentice-${apprentice.firstName}-${apprentice.lastName}`;
          
          if (apprenticeLaborMap.has(key)) {
            const existing = apprenticeLaborMap.get(key);
            existing.amount += entry.apprenticeCost;
            existing.hours += entry.apprenticeHours || 0;
          } else {
            apprenticeLaborMap.set(key, {
              id: `labor-${generateId()}`,
              description: `${apprentice.firstName} ${apprentice.lastName} - Apprentice Labor`,
              amount: entry.apprenticeCost,
              hours: entry.apprenticeHours || 0,
              type: 'apprentice',
              employeeId: apprentice.id
            });
          }
        }
      }
    });

    apprenticeLaborMap.forEach(laborCost => {
      apprenticeLaborCosts.push(laborCost);
    });

    // Combine all labor costs
    const allLaborCosts = [...hourlyLaborCosts, ...pieceRateLaborCosts, ...apprenticeLaborCosts];
    
    console.log('Created labor costs:', allLaborCosts.map(cost => ({ description: cost.description, amount: cost.amount, type: cost.type })));

    // Apply employer taxes to employee labor costs
    const taxedLaborCosts = allLaborCosts.map(laborCost => {
      const employee = allEmployees.find(emp => emp.id === laborCost.employeeId);
      
      if (employee && employee.employeeType === 'Employee') {
        const employerTax = laborCost.amount * EMPLOYER_TAX_RATE;
        const totalWithTax = laborCost.amount + employerTax;
        
        return {
          ...laborCost,
          originalAmount: laborCost.amount, // Store original amount for transparency
          employerTax: employerTax,
          amount: totalWithTax // Update amount to include tax
        };
      } else {
        return {
          ...laborCost,
          originalAmount: laborCost.amount,
          employerTax: 0
        };
      }
    });

    return taxedLaborCosts;
  }, []);

  // Auto-sync labor costs when component mounts and periodically
  useEffect(() => {
    if (!loading && timeEntries && pieceRateEntries && employees && !disableAutoSync) {
      const syncLaborCosts = () => {
        console.log('=== SYNCING LABOR COSTS ===');
        console.log('timeEntries length:', timeEntries.length);
        console.log('pieceRateEntries length:', pieceRateEntries.length);
        console.log('All time entries:', timeEntries.map(e => ({ 
          id: e.id, 
          employeeId: e.employeeId, 
          jobId: e.jobId, 
          totalHours: e.totalHours, 
          clockOutTime: e.clockOutTime, 
          clockInTime: e.clockInTime,
          hourlyRate: e.hourlyRate,
          totalPay: e.totalPay,
          status: e.status,
          date: e.date
        })));
        console.log('Full time entry object:', timeEntries[0]);
        
        // Check if there's a time entry from a future date (test data)
        const futureTimeEntry = timeEntries.find(entry => {
          const entryDate = new Date(entry.clockInTime);
          const today = new Date();
          return entryDate > today;
        });
        
        if (futureTimeEntry) {
          console.log('Found future time entry that should be deleted:', futureTimeEntry);
          console.log('This is likely test data causing the phantom labor cost.');
        }
        console.log('All piece rate entries:', pieceRateEntries.map(e => ({ id: e.id, employeeId: e.employeeId, jobId: e.jobId, totalEarnings: e.totalEarnings, status: e.status })));
        
        setJobs(currentJobs => {
          let hasChanges = false;
          const updatedJobs = currentJobs.map(job => {
            const newLaborCosts = calculateLaborCostsForSingleJob(job, timeEntries, pieceRateEntries, employees);
            const currentLaborCosts = job.financials?.actual?.laborCosts || [];
            
            console.log(`Job ${job.id} - Current labor costs:`, currentLaborCosts.length, 'New labor costs:', newLaborCosts.length);
            console.log(`Job ${job.id} - New labor costs details:`, newLaborCosts.map(cost => ({ 
              description: cost.description, 
              amount: cost.amount, 
              originalAmount: cost.originalAmount,
              employerTax: cost.employerTax,
              type: cost.type 
            })));
            
            // Deep comparison of labor costs only
            const laborCostsChanged = JSON.stringify(currentLaborCosts) !== JSON.stringify(newLaborCosts);
            
            if (laborCostsChanged) {
              hasChanges = true;
              console.log(`Job ${job.id} - Labor costs changed, updating...`);
              
              // Preserve existing manual data
              const existingManualLaborCosts = job.financials?.actual?.manualLaborCosts || [];
              const existingMaterialInvoices = job.financials?.actual?.materialInvoices || [];
              const existingChangeOrders = job.financials?.actual?.changeOrders || [];
              
              // Calculate total labor cost from the new labor costs
              const totalLaborCost = newLaborCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0);
              
              return {
                ...job,
                financials: {
                  ...job.financials,
                  actual: {
                    ...job.financials?.actual,
                    laborCosts: newLaborCosts,
                    totalLaborCost: totalLaborCost,
                    manualLaborCosts: existingManualLaborCosts,
                    materialInvoices: existingMaterialInvoices,
                    changeOrders: existingChangeOrders,
                    totalActual: (job.financials?.actual?.totalMaterialCost || 0) + 
                                 (job.financials?.actual?.totalSalesTax || 0) + 
                                 totalLaborCost + 
                                 (job.financials?.actual?.totalManualLaborCost || 0) + 
                                 (job.financials?.actual?.totalChangeOrderValue || 0) + 
                                 (job.financials?.actual?.totalFieldChangeOrderValue || 0)
                  }
                },
                updatedAt: new Date().toISOString()
              };
            }
            
            // Return original job object reference if no changes
            return job;
          });
          
          // Only update state if there were actual changes
          return hasChanges ? updatedJobs : currentJobs;
        });
      };

      // Initial sync
      syncLaborCosts();

      // Set up periodic sync every 30 seconds
      const interval = setInterval(syncLaborCosts, 30000);
      return () => clearInterval(interval);
    }
  }, [loading, timeEntries, pieceRateEntries, employees, calculateLaborCostsForSingleJob]);

  // Internal helper function to recalculate phase materials

  // Force recalculation of all labor costs
  const forceRecalculateLaborCosts = useCallback(() => {
    console.log('=== FORCE RECALCULATING LABOR COSTS ===');
    console.log('Current time entries:', timeEntries.length);
    console.log('Current piece rate entries:', pieceRateEntries.length);
    
    if (!loading && timeEntries && pieceRateEntries && employees) {
      setJobs(currentJobs => {
        const updatedJobs = currentJobs.map(job => {
          const newLaborCosts = calculateLaborCostsForSingleJob(job, timeEntries, pieceRateEntries, employees);
          const totalLaborCost = newLaborCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0);
          
          console.log(`Job ${job.id} - Force recalculated labor costs:`, newLaborCosts.length, 'Total:', totalLaborCost);
          
          return {
            ...job,
            financials: {
              ...job.financials,
              actual: {
                ...job.financials?.actual,
                laborCosts: newLaborCosts,
                totalLaborCost: totalLaborCost,
                totalActual: (job.financials?.actual?.totalMaterialCost || 0) + 
                             (job.financials?.actual?.totalSalesTax || 0) + 
                             totalLaborCost + 
                             (job.financials?.actual?.totalManualLaborCost || 0) + 
                             (job.financials?.actual?.totalChangeOrderValue || 0) + 
                             (job.financials?.actual?.totalFieldChangeOrderValue || 0)
              }
            },
            updatedAt: new Date().toISOString()
          };
        });
        
        return updatedJobs;
      });
    }
  }, [loading, timeEntries, pieceRateEntries, employees, calculateLaborCostsForSingleJob]);

  // Clear all job labor costs (set to zero)
  const clearAllJobLaborCosts = useCallback(() => {
    console.log('=== CLEARING ALL JOB LABOR COSTS ===');
    setJobs(currentJobs => {
      const updatedJobs = currentJobs.map(job => {
        console.log(`Job ${job.id} - Clearing labor costs`);
        
        return {
          ...job,
          financials: {
            ...job.financials,
            actual: {
              ...job.financials?.actual,
              laborCosts: [],
              totalLaborCost: 0
            }
          },
          updatedAt: new Date().toISOString()
        };
      });
      
      return updatedJobs;
    });
  }, []);

  // Temporarily disable auto-sync for manual edits
  const disableAutoSyncTemporarily = useCallback((duration = 60000) => {
    console.log('=== DISABLING AUTO-SYNC TEMPORARILY ===');
    setDisableAutoSync(true);
    
    // Re-enable after specified duration (default 1 minute)
    setTimeout(() => {
      console.log('=== RE-ENABLING AUTO-SYNC ===');
      setDisableAutoSync(false);
    }, duration);
  }, []);

  // Internal helper function to recalculate phase materials using formulas
  const recalculatePhaseMaterials = useCallback((jobId, phaseId) => {
    setJobs(prevJobs => {
      return prevJobs.map(job => {
        if (job.id !== jobId) return job;

        const phase = (job.takeoffPhases || []).find(p => p.id === phaseId);
        if (!phase) return job;

        // Calculate total square footage for this phase
        let totalSqft = 0;
        
        (phase.entries || []).forEach(entry => {
          if (job.jobType === 'commercial' && entry.unitNumbers) {
            // For commercial: multiply by number of units
            const unitCount = entry.unitNumbers.split(',').filter(num => num.trim()).length;
            (entry.boards || []).forEach(board => {
              const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
              const boardTotalSqft = parseInt(board.quantity, 10) * sqftPerBoard * unitCount;
              totalSqft += boardTotalSqft;
            });
          } else {
            // For residential: use as-is
            (entry.boards || []).forEach(board => {
              const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
              const boardTotalSqft = parseInt(board.quantity, 10) * sqftPerBoard;
              totalSqft += boardTotalSqft;
            });
          }
        });

        if (totalSqft === 0) {
          return job; // No square footage, no update needed
        }

        // Get finish scope to determine compound requirements
        const finishScope = (job.scopes || []).find(scope => 
          scope.name.toLowerCase().includes('finish')
        );
        const ceilingFinish = finishScope?.ceilingFinish || '';
        
        // Load formula settings from localStorage
        const formulaSettings = JSON.parse(localStorage.getItem('hsh_drywall_formula_settings') || '{}');
        
        // Get settings with defaults
        const settings = {
          jointCompound: {
            allPurposeBaseRate: formulaSettings.jointCompound?.allPurposeBaseRate || 4800,
            allPurposeLevel4Multiplier: formulaSettings.jointCompound?.allPurposeLevel4Multiplier || 5,
            allPurposeLevel5Multiplier: formulaSettings.jointCompound?.allPurposeLevel5Multiplier || 5,
            allPurposeStompMultiplier: formulaSettings.jointCompound?.allPurposeStompMultiplier || 11,
            allPurposeSplatterMultiplier: formulaSettings.jointCompound?.allPurposeSplatterMultiplier || 9,
            allPurposeDefaultMultiplier: formulaSettings.jointCompound?.allPurposeDefaultMultiplier || 11,
            liteWeightMultiplier: formulaSettings.jointCompound?.liteWeightMultiplier || 8,
            easySand90Rate: formulaSettings.jointCompound?.easySand90Rate || 5000
          },
          fasteners: {
            screwRate: formulaSettings.fasteners?.screwRate || 5760
          },
          adhesives: {
            titeBondRate: formulaSettings.adhesives?.titeBondRate || 5760
          },
          tape: {
            paperTapeRate: formulaSettings.tape?.paperTapeRate || 1400,
            meshTapeLargeJobRate: formulaSettings.tape?.meshTapeLargeJobRate || 15000,
            meshTapeSmallJobRate: formulaSettings.tape?.meshTapeSmallJobRate || 1000,
            meshTapeSmallJobThreshold: formulaSettings.tape?.meshTapeSmallJobThreshold || 6000
          },
          cornerBead: {
            easySand90PerStick: formulaSettings.cornerBead?.easySand90PerStick || 10,
            liteWeightPerStick: formulaSettings.cornerBead?.liteWeightPerStick || 15
          }
        };

        // Calculate All Purpose Joint Compound
        let allPurposeBoxes = 0;
        if (ceilingFinish.includes('Stomp') || ceilingFinish.includes('Splatter Knockdown')) {
          if (ceilingFinish.includes('Splatter Knockdown')) {
            allPurposeBoxes = Math.ceil((totalSqft / settings.jointCompound.allPurposeBaseRate) * settings.jointCompound.allPurposeSplatterMultiplier);
          } else {
            allPurposeBoxes = Math.ceil((totalSqft / settings.jointCompound.allPurposeBaseRate) * settings.jointCompound.allPurposeStompMultiplier);
          }
        } else if (ceilingFinish.includes('Level 4') || ceilingFinish.includes('Level 5')) {
          allPurposeBoxes = Math.ceil((totalSqft / settings.jointCompound.allPurposeBaseRate) * settings.jointCompound.allPurposeLevel4Multiplier);
        } else {
          allPurposeBoxes = Math.ceil((totalSqft / settings.jointCompound.allPurposeBaseRate) * settings.jointCompound.allPurposeDefaultMultiplier);
        }

        // Calculate other materials
        const liteWeightBoxes = Math.ceil((totalSqft / settings.jointCompound.allPurposeBaseRate) * settings.jointCompound.liteWeightMultiplier);
        const easySand90Bags = Math.ceil(totalSqft / settings.jointCompound.easySand90Rate);
        const titeBondFoamCans = Math.ceil(totalSqft / settings.adhesives.titeBondRate);
        const screwBoxes = Math.ceil(totalSqft / settings.fasteners.screwRate);
        const paperTapeRolls = Math.ceil(totalSqft / settings.tape.paperTapeRate);
        
        // Mesh tape calculation using settings
        let meshTapeRolls;
        if (totalSqft < settings.tape.meshTapeSmallJobThreshold) {
          meshTapeRolls = Math.ceil(totalSqft / settings.tape.meshTapeSmallJobRate);
        } else {
          meshTapeRolls = Math.ceil(totalSqft / settings.tape.meshTapeLargeJobRate);
        }

        const defaultMaterials = [
          {
            id: `auto-${Date.now()}-1`,
            type: 'Joint Compound',
            subtype: 'All Purpose Joint Compound',
            quantity: allPurposeBoxes.toString(),
            unit: 'Box',
            autoCalculated: true
          },
          {
            id: `auto-${Date.now()}-2`,
            type: 'Joint Compound',
            subtype: 'Lite Weight Joint Compound',
            quantity: liteWeightBoxes.toString(),
            unit: 'Box',
            autoCalculated: true
          },
          {
            id: `auto-${Date.now()}-3`,
            type: 'Joint Compound',
            subtype: 'Easy Sand 90',
            quantity: easySand90Bags.toString(),
            unit: 'Bags',
            autoCalculated: true
          },
          {
            id: `auto-${Date.now()}-4`,
            type: 'Fasteners',
            subtype: 'Drywall Screws 1-1/4"',
            threadType: 'Coarse Thread',
            quantity: screwBoxes.toString(),
            unit: 'Box',
            autoCalculated: true
          },
          {
            id: `auto-${Date.now()}-5`,
            type: 'Adhesives',
            subtype: 'TiteBond Foam',
            quantity: titeBondFoamCans.toString(),
            unit: 'Tube',
            autoCalculated: true
          },
          {
            id: `auto-${Date.now()}-6`,
            type: 'Adhesives',
            subtype: 'Spray Adhesive',
            quantity: '1',
            unit: 'Can',
            autoCalculated: true
          },
          {
            id: `auto-${Date.now()}-7`,
            type: 'Tape',
            subtype: '500\' Paper Tape',
            quantity: paperTapeRolls.toString(),
            unit: 'Roll',
            autoCalculated: true
          },
          {
            id: `auto-${Date.now()}-8`,
            type: 'Tape',
            subtype: '300\' Mesh Tape',
            quantity: meshTapeRolls.toString(),
            unit: 'Roll',
            autoCalculated: true
          }
        ];

        // Keep existing manual materials and add/update auto-calculated ones
        const existingMaterials = phase.materials || [];
        const manualMaterials = existingMaterials.filter(m => !m.autoCalculated);
        const updatedMaterials = [...manualMaterials];

        // Calculate corner bead dependent materials
        // For every 10 sticks of corner bead, add 1 bag of Easy Sand 90 and 1 box of Lite Weight Compound
        let totalCornerBeadQuantity = 0;
        existingMaterials.forEach(material => {
          if (material.type === 'Corner Bead') {
            totalCornerBeadQuantity += parseFloat(material.quantity) || 0;
          }
        });

        // Calculate additional materials needed based on corner bead
        const additionalEasySand90Bags = Math.ceil(totalCornerBeadQuantity / settings.cornerBead.easySand90PerStick);
        const additionalLiteWeightBoxes = Math.ceil(totalCornerBeadQuantity / settings.cornerBead.liteWeightPerStick);

        defaultMaterials.forEach(defaultMaterial => {
          // Only update auto-calculated materials, not manual ones
          const existingIndex = updatedMaterials.findIndex(existing => {
            const typeMatch = existing.type === defaultMaterial.type;
            const subtypeMatch = existing.subtype === defaultMaterial.subtype;
            const threadTypeMatch = (existing.threadType || '') === (defaultMaterial.threadType || '');
            const lengthMatch = (existing.length || '') === (defaultMaterial.length || '');
            const isAutoCalculated = existing.autoCalculated;
            return typeMatch && subtypeMatch && threadTypeMatch && lengthMatch && isAutoCalculated;
          });

          if (existingIndex >= 0) {
            // Update existing auto-calculated material quantity, adding corner bead dependent amounts
            let finalQuantity = parseFloat(defaultMaterial.quantity);
            
            // Add corner bead dependent quantities
            if (defaultMaterial.type === 'Joint Compound' && defaultMaterial.subtype === 'Easy Sand 90') {
              finalQuantity += additionalEasySand90Bags;
            }
            if (defaultMaterial.type === 'Joint Compound' && defaultMaterial.subtype === 'Lite Weight Joint Compound') {
              finalQuantity += additionalLiteWeightBoxes;
            }
            
            updatedMaterials[existingIndex] = {
              ...updatedMaterials[existingIndex],
              quantity: finalQuantity.toString(),
              unit: defaultMaterial.unit
            };
          } else {
            // Add new auto-calculated material, including corner bead dependent amounts
            let finalQuantity = parseFloat(defaultMaterial.quantity);
            
            // Add corner bead dependent quantities
            if (defaultMaterial.type === 'Joint Compound' && defaultMaterial.subtype === 'Easy Sand 90') {
              finalQuantity += additionalEasySand90Bags;
            }
            if (defaultMaterial.type === 'Joint Compound' && defaultMaterial.subtype === 'Lite Weight Joint Compound') {
              finalQuantity += additionalLiteWeightBoxes;
            }
            
            updatedMaterials.push({
              ...defaultMaterial,
              quantity: finalQuantity.toString()
            });
          }
        });

        // If there are corner bead dependent materials but no default materials for them, add them
        if (totalCornerBeadQuantity > 0) {
          // Check if Easy Sand 90 exists, if not add it
          const hasEasySand90 = updatedMaterials.some(m => 
            m.type === 'Joint Compound' && m.subtype === 'Easy Sand 90'
          );
          if (!hasEasySand90 && additionalEasySand90Bags > 0) {
            updatedMaterials.push({
              id: `corner-bead-${Date.now()}-1`,
              type: 'Joint Compound',
              subtype: 'Easy Sand 90',
              quantity: additionalEasySand90Bags.toString(),
              unit: 'Bags',
              autoCalculated: true
            });
          }
          
          // Check if Lite Weight Joint Compound exists, if not add it
          const hasLiteWeight = updatedMaterials.some(m => 
            m.type === 'Joint Compound' && m.subtype === 'Lite Weight Joint Compound'
          );
          if (!hasLiteWeight && additionalLiteWeightBoxes > 0) {
            updatedMaterials.push({
              id: `corner-bead-${Date.now()}-2`,
              type: 'Joint Compound',
              subtype: 'Lite Weight Joint Compound',
              quantity: additionalLiteWeightBoxes.toString(),
              unit: 'Box',
              autoCalculated: true
            });
          }
        }

        // Update the phase with new materials
        const updatedPhases = (job.takeoffPhases || []).map(p => {
          if (p.id === phaseId) {
            return {
              ...p,
              materials: updatedMaterials,
              updatedAt: new Date().toISOString()
            };
          }
          return p;
        });

        return {
          ...job,
          takeoffPhases: updatedPhases,
          updatedAt: new Date().toISOString()
        };
      });
    });

            toast({
          title: "Accessories Auto-Updated! 🔄",
          description: "Phase accessories have been automatically recalculated based on updated takeoff entries."
        });
  }, []);

  // Helper function to calculate total square footage from takeoff entries
  const calculateJobTakeoffSqft = useCallback((job) => {
    if (!job?.takeoffPhases) {
      return 0;
    }

    let totalSqft = 0;
    job.takeoffPhases.forEach(phase => {
      (phase.entries || []).forEach(entry => {
        if (job.jobType === 'commercial' && entry.unitNumbers) {
          // For commercial: multiply by number of units
          const unitCount = entry.unitNumbers.split(',').filter(num => num.trim()).length;
          (entry.boards || []).forEach(board => {
            const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
            const boardTotalSqft = parseInt(board.quantity, 10) * sqftPerBoard * unitCount;
            totalSqft += boardTotalSqft;
          });
        } else {
          // For residential: use as-is
          (entry.boards || []).forEach(board => {
            const sqftPerBoard = (parseFloat(board.width) / 12) * parseFloat(board.length);
            const boardTotalSqft = parseInt(board.quantity, 10) * sqftPerBoard;
            totalSqft += boardTotalSqft;
          });
        }
      });
    });

    return totalSqft;
  }, []);

  // Helper function to update field revised sqft for a job
  const updateJobFieldRevisedSqft = useCallback((jobId) => {
    setJobs(prevJobs => {
      return prevJobs.map(job => {
        if (job.id === jobId) {
          const calculatedSqft = calculateJobTakeoffSqft(job);
          const drywallMaterialRate = job.financials?.fieldRevised?.drywallMaterialRate || 0.66;
          const drywallMaterialCost = Math.round(calculatedSqft * drywallMaterialRate * 100) / 100;
          return {
            ...job,
            financials: {
              ...job.financials,
              fieldRevised: {
                ...job.financials?.fieldRevised,
                sqft: Math.round(calculatedSqft),
                drywallMaterialCost: drywallMaterialCost
              }
            },
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
    });
  }, [calculateJobTakeoffSqft]);

  // Helper function to recalculate field revised drywall material cost
  const recalculateFieldRevisedDrywallMaterialCost = useCallback((jobId) => {
    setJobs(prevJobs => {
      return prevJobs.map(job => {
        if (job.id === jobId) {
          const sqft = job.financials?.fieldRevised?.sqft || 0;
          const drywallMaterialRate = job.financials?.fieldRevised?.drywallMaterialRate || 0.66;
          const drywallMaterialCost = Math.round(sqft * drywallMaterialRate * 100) / 100;
          
          return {
            ...job,
            financials: {
              ...job.financials,
              fieldRevised: {
                ...job.financials?.fieldRevised,
                drywallMaterialCost: drywallMaterialCost
              }
            },
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
    });
  }, []);

  const createJob = useCallback((jobData, callback) => {
    const newJob = {
      id: generateId(),
      ...jobData,
      jobType: jobData.jobType || 'residential', // Default to residential if not specified
      financialCategories: jobData.jobType === 'commercial' 
        ? ['drywall', 'act', 'channel', 'door', 'insulation', 'metalFraming', 'suspendedGrid', 'other'] 
        : ['drywall'],
      status: 'estimating', // New jobs start in estimating phase
      scopes: [],
      takeoffPhases: [],
      checklists: [],
      financials: {
        estimate: {
          sqft: 0,
          // Drywall
          drywallMaterialRate: 0.66, // Combined rate (0.53 + 0.13)
          hangerRate: 0.27,
          finisherRate: 0.27,
          prepCleanRate: 0.03,
          drywallSalesTaxRate: 7.25, // Sales tax for drywall materials (default 7.25%)
          totalEstimateAmount: 0, // Total amount charged to customer (for residential jobs)
          quote: 0,
          scopeQuotes: [], // Array of {scopeId, scopeName, quoteAmount}
          // Category-specific line items
          act: {
            materialRate: 0, // Acoustic Ceiling Tile Material
            laborRate: 0, // Acoustic Ceiling Tile Labor
            unit: 'sqft',
            salesTaxRate: 0 // Sales tax for ACT materials
          },
          channel: {
            materialRate: 0, // Channel Material
            laborRate: 0, // Channel Labor
            unit: 'lf',
            salesTaxRate: 0 // Sales tax for channel materials
          },
          door: {
            installRate: 0, // Door Installation
            unit: 'ea',
            salesTaxRate: 0 // Sales tax for doors
          },
          insulation: {
            materialRate: 0, // Insulation Material
            laborRate: 0, // Insulation Labor
            unit: 'sqft',
            salesTaxRate: 0 // Sales tax for insulation materials
          },
          metalFraming: {
            materialRate: 0, // Metal Framing Material
            laborRate: 0, // Metal Framing Labor
            unit: 'lf',
            salesTaxRate: 0 // Sales tax for metal framing materials
          },
          suspendedGrid: {
            materialRate: 0, // Suspended Drywall Grid Material
            laborRate: 0, // Suspended Drywall Grid Labor
            unit: 'sqft',
            salesTaxRate: 0 // Sales tax for suspended grid materials
          },
          other: {
            materialRate: 0, // Other Material
            materialDescription: '', // Description for Other Material
            laborRate: 0, // Other Labor
            laborDescription: '', // Description for Other Labor
            unit: 'sqft',
            salesTaxRate: 0 // Sales tax for other materials
          }
        },
        fieldRevised: {
          // Drywall
          hangerRate: 0.27,
          finisherRate: 0.27,
          prepCleanRate: 0.03,
          sqft: 0, // Field revised square footage
          drywallMaterialRate: 0.66, // Field revised drywall material rate
          drywallSalesTaxRate: 7.25, // Sales tax for drywall materials (default 7.25%)
          drywallMaterialCost: 0, // Calculated field revised drywall material cost
          changeOrders: [], // Field change orders (for residential jobs)
          // Category-specific line items
          act: {
            laborRate: 0
          },
          channel: {
            laborRate: 0
          },
          door: {
            installRate: 0
          },
          insulation: {
            laborRate: 0
          },
          metalFraming: {
            laborRate: 0
          },
          suspendedGrid: {
            laborRate: 0
          },
          other: {
            laborRate: 0,
            laborDescription: ''
          }
        },
        actual: {
          changeOrders: [],
          materialInvoices: [],
          drywallMaterialCost: 0,
          drywallSalesTaxCost: 0,
          laborCosts: [], // Synced from time clock
          manualLaborCosts: [], // Manual entries
          // Category-specific actual costs
          act: {
            materialCost: 0,
            laborCost: 0,
            salesTaxCost: 0
          },
          channel: {
            materialCost: 0,
            laborCost: 0,
            salesTaxCost: 0
          },
          door: {
            installCost: 0,
            salesTaxCost: 0
          },
          insulation: {
            materialCost: 0,
            laborCost: 0,
            salesTaxCost: 0
          },
          metalFraming: {
            materialCost: 0,
            laborCost: 0,
            salesTaxCost: 0
          },
          suspendedGrid: {
            materialCost: 0,
            laborCost: 0,
            salesTaxCost: 0
          },
          other: {
            materialCost: 0,
            materialDescription: '',
            laborCost: 0,
            laborDescription: '',
            salesTaxCost: 0
          }
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setJobs(prev => [...prev, newJob]);
    
    // Automatically set up location tracking if coordinates are provided
    if (jobData.latitude && jobData.longitude) {
      try {
        locationService.addJobSite(
          newJob.id,
          'Main Job Site',
          jobData.latitude,
          jobData.longitude,
          jobData.geofenceRadius || locationService.getGeofenceRadius()
        );
      } catch (error) {
        console.error('Error setting up location tracking:', error);
      }
    }
    
    toast({
      title: "Job Created! 🎉",
      description: `New ${jobData.jobType} construction job has been added in estimating phase.${jobData.latitude && jobData.longitude ? ' Location tracking has been set up.' : ''}`
    });
    if (callback) callback();
  }, []);

  const updateJob = useCallback((jobId, updates, callback) => {
    console.log('=== updateJob called ===');
    console.log('JobId:', jobId);
    console.log('Updates:', updates);
    console.log('Updates.financials.estimate:', updates.financials?.estimate);
    
    setJobs(prevJobs => {
      console.log('Previous jobs:', prevJobs);
      
      const updatedJobs = prevJobs.map(job => {
        if (job.id !== jobId) return job;
        
        console.log('Updating job:', job.jobName);
        console.log('Current job financials:', job.financials);
        console.log('Current job estimate sqft:', job.financials?.estimate?.sqft);
        
        // Deep merge for financials
        let updatedFinancials = job.financials;
        if (updates.financials) {
          updatedFinancials = {
            ...job.financials,
            ...updates.financials,
            estimate: {
              ...job.financials?.estimate,
              ...updates.financials?.estimate,
            },
            fieldRevised: {
              ...job.financials?.fieldRevised,
              ...updates.financials?.fieldRevised,
            },
            actual: {
              ...job.financials?.actual,
              ...updates.financials?.actual,
            }
          };
        }
        
        const updatedJob = {
          ...job,
          ...updates,
          financials: updatedFinancials,
          updatedAt: new Date().toISOString()
        };
        
        console.log('Updated job financials:', updatedJob.financials);
        console.log('Updated job estimate sqft:', updatedJob.financials?.estimate?.sqft);
        return updatedJob;
      });
      
      console.log('Updated jobs array:', updatedJobs);
      console.log('Updated jobs array length:', updatedJobs.length);
      
      // Force a new array reference to ensure React detects the change
      return [...updatedJobs];
    });
    
    // Update timestamp to trigger App.jsx useEffect
    setJobsUpdateTimestamp(Date.now());
    
    // Recalculate field revised drywall material cost if the rate was updated
    if (updates.financials?.fieldRevised?.drywallMaterialRate !== undefined) {
      setTimeout(() => {
        recalculateFieldRevisedDrywallMaterialCost(jobId);
      }, 100);
    }
    
    const statusMessage = updates.status ? 
      updates.status === 'active' ? 'Job moved to active phase!' :
      updates.status === 'inactive' ? 'Job set to inactive.' :
      updates.status === 'estimating' ? 'Job moved back to estimating.' :
      `Status set to ${updates.status}.` : '';
    
    toast({
      title: "Job Updated! ✨",
      description: `Job details have been updated. ${statusMessage}`
    });
    if (callback) callback(jobId, updates);
    
    console.log('=== updateJob finished ===');
  }, [recalculateFieldRevisedDrywallMaterialCost]);

  const deleteJob = useCallback((jobId, callback) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
    toast({
      title: "Job Deleted! 🗑️",
      description: "The job has been permanently removed.",
      variant: "destructive"
    });
    if (callback) callback(jobId);
  }, []);

  const createScope = useCallback((jobId, scopeData, callback) => {
    const newScope = {
      id: generateId(),
      jobId,
      ...scopeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setJobs(prev => {
      const updatedJobs = prev.map(job => {
        if (job.id === jobId) {
          // Add the new scope
          const updatedScopes = [...(job.scopes || []), newScope];
          
          // Update the financials.estimate.scopeQuotes array
          const updatedScopeQuotes = [...(job.financials?.estimate?.scopeQuotes || [])];
          updatedScopeQuotes.push({
            scopeId: newScope.id,
            scopeName: newScope.name,
            quoteAmount: 0
          });
          
          return { 
            ...job, 
            scopes: updatedScopes,
            financials: {
              ...job.financials,
              estimate: {
                ...(job.financials?.estimate || {}),
                scopeQuotes: updatedScopeQuotes
              }
            },
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
      
      return updatedJobs;
    });
    
    toast({
      title: "Scope Added! ✨",
      description: `New scope "${scopeData.name}" added successfully.`
    });
    if (callback) callback();
  }, []);

  const updateScope = useCallback((scopeId, updates, callback) => {
    setJobs(prev => prev.map(job => {
      const updatedScopes = (job.scopes || []).map(scope => {
        if (scope.id === scopeId) {
          return { ...scope, ...updates, updatedAt: new Date().toISOString() };
        }
        return scope;
      });
      
      // If the scope name was updated, also update it in the scopeQuotes array
      let updatedFinancials = { ...job.financials };
      if (updates.name && job.financials?.estimate?.scopeQuotes) {
        const updatedScopeQuotes = job.financials.estimate.scopeQuotes.map(sq => {
          if (sq.scopeId === scopeId) {
            return { ...sq, scopeName: updates.name };
          }
          return sq;
        });
        
        updatedFinancials = {
          ...updatedFinancials,
          estimate: {
            ...updatedFinancials.estimate,
            scopeQuotes: updatedScopeQuotes
          }
        };
      }
      
      return {
        ...job,
        scopes: updatedScopes,
        financials: updatedFinancials,
        updatedAt: new Date().toISOString()
      };
    }));
    
    toast({
      title: "Scope Updated! ✅",
      description: "Scope of work has been updated successfully."
    });
    if (callback) callback(scopeId, updates);
  }, []);

  const deleteScope = useCallback((jobId, scopeId, callback) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        const updatedScopes = (job.scopes || []).filter(s => s.id !== scopeId);
        return { 
          ...job, 
          scopes: updatedScopes,
          updatedAt: new Date().toISOString()
        };
      }
      return job;
    }));
    
    toast({
      title: "Scope Deleted! 🗑️",
      description: "The scope of work has been removed.",
      variant: "destructive"
    });
    if (callback) callback(jobId, scopeId);
  }, []);

  const createTakeoffPhase = useCallback((jobId, phaseData, callback) => {
    const newPhase = {
      id: generateId(),
      jobId,
      ...phaseData,
      materials: [],
      entries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setJobs(prev => prev.map(job =>
      job.id === jobId
        ? { 
            ...job, 
            takeoffPhases: [...(job.takeoffPhases || []), newPhase],
            updatedAt: new Date().toISOString()
          }
        : job
    ));
    
    toast({
      title: "Takeoff Phase Created! 🏗️",
      description: `New takeoff phase "${newPhase.name}" has been added.`
    });
    
    if (callback) callback();
  }, []);

  const deleteTakeoffPhase = useCallback((jobId, phaseId, callback) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          takeoffPhases: (job.takeoffPhases || []).filter(phase => phase.id !== phaseId),
          updatedAt: new Date().toISOString()
        };
      }
      return job;
    }));
    
    // Update field revised sqft after deleting phase
    setTimeout(() => {
      updateJobFieldRevisedSqft(jobId);
    }, 100);
    
    toast({
      title: "Takeoff Phase Deleted! 🗑️",
      description: "The takeoff phase and all its entries have been removed.",
      variant: "destructive"
    });
    
    if (callback) callback(jobId, phaseId);
  }, [updateJobFieldRevisedSqft]);

  const saveTakeoffEntries = useCallback((jobId, phaseId, entryData, boardEntries, notes, callback) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) {
      toast({
        title: "Error",
        description: "Job not found.",
        variant: "destructive"
      });
      return;
    }

    const newEntry = {
      id: generateId(),
      phaseId,
      notes,
      boards: boardEntries.map(board => ({
        ...board,
        id: board.id || generateId()
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add job type specific fields
    if (job.jobType === 'commercial') {
      newEntry.unitType = entryData.unitType;
      newEntry.unitNumbers = entryData.unitNumbers;
    } else {
      newEntry.floorSpace = entryData.floorSpace;
    }

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const updatedPhases = (j.takeoffPhases || []).map(phase => {
          if (phase.id === phaseId) {
            return { 
              ...phase, 
              entries: [...(phase.entries || []), newEntry],
              updatedAt: new Date().toISOString()
            };
          }
          return phase;
        });
        return { 
          ...j, 
          takeoffPhases: updatedPhases,
          updatedAt: new Date().toISOString()
        };
      }
      return j;
    }));
    
    // Auto-recalculate materials after adding new entries
    setTimeout(() => {
      recalculatePhaseMaterials(jobId, phaseId);
      // Update field revised sqft based on new takeoff data
      updateJobFieldRevisedSqft(jobId);
    }, 100);
    
    const entryName = job.jobType === 'commercial' ? entryData.unitType : entryData.floorSpace;
    toast({
      title: "Takeoff Entries Saved! 📐",
      description: `Entries for ${entryName} have been recorded successfully.`
    });
    if (callback) callback();
  }, [jobs, recalculatePhaseMaterials, updateJobFieldRevisedSqft]);

  const updateTakeoffEntry = useCallback((jobId, phaseId, updatedEntry, callback) => {
    setJobs(prev => prev.map(job => ({
      ...job,
      takeoffPhases: (job.takeoffPhases || []).map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            entries: (phase.entries || []).map(entry =>
              entry.id === updatedEntry.id 
                ? { ...updatedEntry, updatedAt: new Date().toISOString() }
                : entry
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return phase;
      }),
      updatedAt: new Date().toISOString()
    })));
    
    // Auto-recalculate materials after updating entry
    setTimeout(() => {
      recalculatePhaseMaterials(jobId, phaseId);
      // Update field revised sqft based on updated takeoff data
      updateJobFieldRevisedSqft(jobId);
    }, 100);
    
    const entryName = updatedEntry.unitType || updatedEntry.floorSpace;
    toast({
      title: "Takeoff Entry Updated! ✅",
      description: `Entry "${entryName}" has been updated successfully.`
    });
    if (callback) callback();
  }, [recalculatePhaseMaterials, updateJobFieldRevisedSqft]);

  const deleteTakeoffEntry = useCallback((phaseId, entryId, callback) => {
    // Find the job that contains this phase to update its sqft
    const jobWithPhase = jobs.find(job => 
      (job.takeoffPhases || []).some(phase => phase.id === phaseId)
    );
    
    setJobs(prev => prev.map(job => ({
      ...job,
      takeoffPhases: (job.takeoffPhases || []).map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            entries: (phase.entries || []).filter(entry => entry.id !== entryId),
            updatedAt: new Date().toISOString()
          };
        }
        return phase;
      }),
      updatedAt: new Date().toISOString()
    })));
    
    // Update field revised sqft after deleting entry
    if (jobWithPhase) {
      setTimeout(() => {
        updateJobFieldRevisedSqft(jobWithPhase.id);
      }, 100);
    }
    
    toast({
      title: "Takeoff Entry Deleted! 🗑️",
      description: "The entry has been removed.",
      variant: "destructive"
    });
    if (callback) callback();
  }, [jobs, updateJobFieldRevisedSqft]);

  const updatePhaseMaterials = useCallback((phaseId, materials, callback) => {
    // Find the job that contains this phase
    const jobWithPhase = jobs.find(job => 
      (job.takeoffPhases || []).some(phase => phase.id === phaseId)
    );
    
    setJobs(prev => prev.map(job => ({
      ...job,
      takeoffPhases: (job.takeoffPhases || []).map(phase => {
        if (phase.id === phaseId) {
          return { 
            ...phase, 
            materials,
            updatedAt: new Date().toISOString()
          };
        }
        return phase;
      }),
      updatedAt: new Date().toISOString()
    })));
    
    // Trigger recalculation of phase materials after updating
    if (jobWithPhase) {
      setTimeout(() => {
        recalculatePhaseMaterials(jobWithPhase.id, phaseId);
      }, 100);
    }
    
    if (callback) callback();
  }, [jobs, recalculatePhaseMaterials]);
  
  const addDefaultScopesToJob = useCallback((jobId, callback) => {
    const defaultScopesData = [
      { 
        name: 'Hang', 
        description: 'Drywall hanging with specified thickness for ceilings and walls.',
        status: 'Not Started',
        ceilingThickness: '5/8"',
        wallThickness: '1/2"',
        hangExceptions: '5/8" at garage firewall. Moisture resistant drywall at wet walls.'
      },
      { 
        name: 'Finish', 
        description: 'Drywall finishing with specified textures and finishes.',
        status: 'Not Started',
        ceilingFinish: 'Stomp Knockdown',
        ceilingExceptions: '',
        wallFinish: 'Level 4 Smooth',
        wallExceptions: 'Roll Texture Garage walls and Small Closet Walls.'
      }
    ];

    const job = jobs.find(j => j.id === jobId);
    const existingScopes = job?.scopes || [];
    const existingScopeNames = existingScopes.map(s => s.name);
    
    const scopesToAdd = defaultScopesData.filter(scope => 
      !existingScopeNames.includes(scope.name)
    );

    if (scopesToAdd.length === 0) {
      toast({
        title: "Already Added! ✅",
        description: "Default scopes are already present for this job."
      });
      if (callback) callback(false);
      return;
    }
    
    // Add scopes to the job
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const newScopes = scopesToAdd.map(scopeData => ({
          id: generateId(),
          jobId,
          ...scopeData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        // Create scope quotes for the new scopes
        const newScopeQuotes = newScopes.map(scope => ({
          scopeId: scope.id,
          scopeName: scope.name,
          quoteAmount: 0
        }));
        
        // Update financials with new scope quotes
        const updatedFinancials = {
          ...j.financials,
          estimate: {
            ...(j.financials?.estimate || {}),
            scopeQuotes: [...(j.financials?.estimate?.scopeQuotes || []), ...newScopeQuotes]
          }
        };
        
        return {
          ...j,
          scopes: [...(j.scopes || []), ...newScopes],
          financials: updatedFinancials,
          updatedAt: new Date().toISOString()
        };
      }
      return j;
    }));

    toast({
      title: "Default Scopes Added! 🚀",
      description: `${scopesToAdd.length} default scopes have been added with detailed specifications.`
    });
    if (callback) callback(true);
  }, [jobs]);

  const loadJobs = useCallback(() => {
    // For localStorage implementation, this just reloads from storage
    const savedJobs = storage.load(STORAGE_KEYS.JOBS, [], 'jobs');
    setJobs(savedJobs);
  }, []);

  const resetAllJobLaborCosts = useCallback(() => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => ({
        ...job,
        financials: {
          ...job.financials,
          actual: {
            ...job.financials?.actual,
            laborCosts: [], // Clear all synced labor costs
            manualLaborCosts: [] // Also clear manual labor costs for complete reset
          }
        },
        updatedAt: new Date().toISOString()
      }));
      
      return updatedJobs;
    });
    
    toast({
      title: "Job Labor Costs Reset! 🧹",
      description: "All labor costs have been cleared from job financials."
    });
  }, []);

  // Checklist functions
  const createChecklist = useCallback((jobId, checklistData, callback) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => {
        if (job.id === jobId) {
          const newChecklist = {
            ...checklistData,
            id: checklistData.id || generateId(),
            jobId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          return {
            ...job,
            checklists: [...(job.checklists || []), newChecklist],
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
      
      return updatedJobs;
    });

    toast({
      title: "Checklist Created! ✅",
      description: "New checklist has been added to the job."
    });
    if (callback) callback();
  }, []);

  const updateChecklist = useCallback((jobId, checklistId, updatedChecklist, callback) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => {
        if (job.id === jobId) {
          const updatedChecklists = (job.checklists || []).map(checklist =>
            checklist.id === checklistId
              ? { ...updatedChecklist, updatedAt: new Date().toISOString() }
              : checklist
          );
          
          return {
            ...job,
            checklists: updatedChecklists,
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
      
      return updatedJobs;
    });

    if (callback) callback();
  }, []);

  const deleteChecklist = useCallback((jobId, checklistId, callback) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => {
        if (job.id === jobId) {
          const updatedChecklists = (job.checklists || []).filter(
            checklist => checklist.id !== checklistId
          );
          
          return {
            ...job,
            checklists: updatedChecklists,
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
      
      return updatedJobs;
    });

    toast({
      title: "Checklist Deleted",
      description: "Checklist has been removed from the job."
    });
    if (callback) callback();
  }, []);

  const completeChecklist = useCallback((jobId, checklistId, callback) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => {
        if (job.id === jobId) {
          const updatedChecklists = (job.checklists || []).map(checklist => {
            if (checklist.id === checklistId) {
              return {
                ...checklist,
                completed: true,
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
            }
            return checklist;
          });
          
          return {
            ...job,
            checklists: updatedChecklists,
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
      
      return updatedJobs;
    });

    toast({
      title: "Checklist Completed! 🎉",
      description: "Checklist has been marked as completed."
    });
    if (callback) callback();
  }, []);

  // Template functions
  const saveChecklistTemplate = useCallback((templateData, callback) => {
    const templates = storage.load(STORAGE_KEYS.CHECKLIST_TEMPLATES, [], 'checklistTemplates');
    const newTemplate = {
      ...templateData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      isTemplate: true
    };
    
    const updatedTemplates = [...templates, newTemplate];
    storage.save(STORAGE_KEYS.CHECKLIST_TEMPLATES, updatedTemplates, 'checklistTemplates');
    
    toast({
      title: "Template Saved! 📋",
      description: "Checklist template has been saved for future use."
    });
    if (callback) callback();
  }, []);

  const getChecklistTemplates = useCallback(() => {
    const templates = storage.load(STORAGE_KEYS.CHECKLIST_TEMPLATES, [], 'checklistTemplates');
    return templates;
  }, []);

  const deleteChecklistTemplate = useCallback((templateId, callback) => {
    const templates = storage.load(STORAGE_KEYS.CHECKLIST_TEMPLATES, [], 'checklistTemplates');
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    storage.save(STORAGE_KEYS.CHECKLIST_TEMPLATES, updatedTemplates, 'checklistTemplates');
    
    toast({
      title: "Template Deleted",
      description: "Checklist template has been removed."
    });
    if (callback) callback();
  }, []);

  // Document management functions
  const uploadDocument = useCallback((jobId, document, callback) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => {
        if (job.id === jobId) {
          const documents = job.documents || [];
          return {
            ...job,
            documents: [...documents, document],
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
      return updatedJobs;
    });

    toast({
      title: "Document Uploaded! 📄",
      description: `${document.name} has been uploaded successfully.`
    });
    if (callback) callback();
  }, []);

  const deleteDocument = useCallback((jobId, documentId, callback) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => {
        if (job.id === jobId) {
          const documents = (job.documents || []).filter(doc => doc.id !== documentId);
          return {
            ...job,
            documents,
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
      return updatedJobs;
    });

    toast({
      title: "Document Deleted",
      description: "Document has been removed from the job.",
      variant: "destructive"
    });
    if (callback) callback();
  }, []);

  const updateDocument = useCallback((jobId, documentId, updates, callback) => {
    setJobs(prevJobs => {
      const updatedJobs = prevJobs.map(job => {
        if (job.id === jobId) {
          const documents = (job.documents || []).map(doc => 
            doc.id === documentId ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
          );
          return {
            ...job,
            documents,
            updatedAt: new Date().toISOString()
          };
        }
        return job;
      });
      return updatedJobs;
    });

    toast({
      title: "Document Updated! ✨",
      description: "Document has been updated successfully."
    });
    if (callback) callback();
  }, []);

  const deleteFutureTimeEntries = useCallback(() => {
    console.log('=== DELETING FUTURE TIME ENTRIES ===');
    const futureTimeEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.clockInTime);
      const today = new Date();
      return entryDate > today;
    });
    
    if (futureTimeEntries.length > 0) {
      console.log('Found future time entries to delete:', futureTimeEntries);
      
      // Remove from localStorage
      const updatedTimeEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.clockInTime);
        const today = new Date();
        return entryDate <= today;
      });
      
      storage.save(STORAGE_KEYS.TIME_ENTRIES, updatedTimeEntries, 'timeEntries');
      console.log('Deleted future time entries from localStorage');
      
      // Force a reload of time entries
      window.location.reload();
    } else {
      console.log('No future time entries found');
    }
  }, [timeEntries]);

  return {
    jobs,
    loading,
    jobsUpdateTimestamp,
    createJob,
    updateJob,
    deleteJob,
    createScope,
    updateScope,
    deleteScope,
    createTakeoffPhase,
    deleteTakeoffPhase,
    saveTakeoffEntries,
    updateTakeoffEntry,
    deleteTakeoffEntry,
    updatePhaseMaterials,
    addDefaultScopesToJob,
    loadJobs,
    calculateJobTakeoffSqft, // Expose for external use if needed
    recalculateFieldRevisedDrywallMaterialCost, // Expose for external use if needed
    resetAllJobLaborCosts,
    forceRecalculateLaborCosts,
    clearAllJobLaborCosts,
    disableAutoSyncTemporarily,
    deleteFutureTimeEntries,
    // Checklist functions
    createChecklist,
    updateChecklist,
    deleteChecklist,
    completeChecklist,
    saveChecklistTemplate,
    getChecklistTemplates,
    deleteChecklistTemplate,
    // Document functions
    uploadDocument,
    deleteDocument,
    updateDocument,
    // Daily log functions
    getLogsForJob,
    addLogEntry,
    updateLogEntry,
    deleteLogEntry,
    addAttachmentToLog,
    removeAttachmentFromLog,
    // Employee data and functions from useTimeClock and useEmployeeData
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addToolDeduction,
    removeToolDeduction,
    bankHours,
    useBankedHours,
    updateEmployeeToolDeductions,
    addEmployeeDocument,
    removeEmployeeDocument
  };
}