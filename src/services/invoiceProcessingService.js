import pricingDatabase from './pricingDatabase.js';

// Invoice Processing Service for Material Management
class InvoiceProcessingService {
  constructor() {
    this.supplierMappings = {
      // Common supplier name variations
      'ABC Supply': ['ABC Supply Co', 'ABC Supply Company', 'ABC'],
      'XYZ Materials': ['XYZ Materials Inc', 'XYZ', 'XYZ Mat'],
      'USG': ['USG Corporation', 'USG Corp', 'USG'],
      'National Gypsum': ['National Gypsum Company', 'National Gypsum Co', 'National Gypsum'],
      'CertainTeed': ['CertainTeed Corporation', 'CertainTeed Corp', 'CertainTeed'],
      'Georgia-Pacific': ['Georgia-Pacific Corporation', 'Georgia-Pacific Corp', 'GP'],
      // Add more supplier mappings as needed
    };
    
    // Enhanced material mappings for different manufacturer formats
    this.materialMappings = {
      // Drywall variations by manufacturer
      'drywall_5_8': [
        '5/8" drywall', '5/8 drywall', '5/8" sheetrock', '5/8 sheetrock',
        '5/8" gypsum board', '5/8 gypsum board', '5/8" wallboard', '5/8 wallboard',
        '5/8" firecode', '5/8 firecode', '5/8" type x', '5/8 type x',
        'ultralight 5/8"', 'ultralight 5/8', 'ultralight 5/8" drywall',
        'firecode c 5/8"', 'firecode c 5/8', 'firecode 5/8"',
        'sheetrock 5/8" firecode', 'sheetrock 5/8" ultralight',
        'usg sheetrock 5/8"', 'usg 5/8"', 'national gypsum 5/8"',
        'certainteed 5/8"', 'gp 5/8"'
      ],
      'drywall_1_2': [
        '1/2" drywall', '1/2 drywall', '1/2" sheetrock', '1/2 sheetrock',
        '1/2" gypsum board', '1/2 gypsum board', '1/2" wallboard', '1/2 wallboard',
        'ultralight 1/2"', 'ultralight 1/2', 'ultralight 1/2" drywall',
        'sheetrock 1/2"', 'sheetrock 1/2" ultralight',
        'usg sheetrock 1/2"', 'usg 1/2"', 'national gypsum 1/2"',
        'certainteed 1/2"', 'gp 1/2"'
      ],
      'drywall_3_8': [
        '3/8" drywall', '3/8 drywall', '3/8" sheetrock', '3/8 sheetrock',
        '3/8" gypsum board', '3/8 gypsum board', '3/8" wallboard', '3/8 wallboard'
      ],
      
      // Joint compound variations
      'joint_compound': [
        'joint compound', 'joint compound all purpose', 'all purpose joint compound',
        'lite weight joint compound', 'lightweight joint compound',
        'easy sand 90', 'easy sand 45', 'easy sand 20', 'easy sand 5',
        'easy sand joint compound', 'quick set joint compound',
        'sheetrock joint compound', 'usg joint compound',
        'mud', 'drywall mud', 'spackle', 'drywall compound',
        'all purpose mud', 'lightweight mud', 'quick set mud'
      ],
      
      // Fasteners variations
      'drywall_screws': [
        'drywall screws', 'drywall screw', 'construction screws',
        'drywall screws 1"', 'drywall screws 1-1/4"', 'drywall screws 1-5/8"',
        'drywall screws 2"', 'drywall screws 2-1/2"', 'drywall screws 3"',
        'sheetrock screws', 'usg screws', 'national gypsum screws',
        'phillips drywall screws', 'square drive drywall screws',
        'coarse thread drywall screws', 'fine thread drywall screws'
      ],
      
      // Tape variations
      'joint_tape': [
        'joint tape', 'drywall tape', 'paper tape', 'mesh tape',
        '500\' paper tape', '300\' mesh tape', 'no coat 325',
        'sheetrock tape', 'usg tape', 'national gypsum tape',
        'fiberglass tape', 'paper joint tape', 'mesh joint tape'
      ],
      
      // Corner bead variations
      'corner_bead': [
        'corner bead', 'corner bead square', 'square bead',
        'bullnose corner bead', 'bullnose bead', 'splay corner bead',
        'arch corner bead', 'arch bead', 'tearaway corner bead',
        'tearaway bead', 'vinyl corner bead', 'metal corner bead',
        'usg corner bead', 'national gypsum corner bead'
      ],
      
      // Adhesives variations
      'adhesives': [
        'titebond foam', 'spray adhesive', 'construction adhesive',
        'drywall adhesive', 'panel adhesive', 'foam adhesive',
        'liquid nails', 'loctite', '3m adhesive'
      ]
    };
    
    // Price estimates for different materials (can be updated based on market prices)
    this.priceEstimates = {
      'drywall_5_8': { unitPrice: 12.50, unit: 'sheets' },
      'drywall_1_2': { unitPrice: 10.25, unit: 'sheets' },
      'drywall_3_8': { unitPrice: 8.75, unit: 'sheets' },
      'joint_compound': { unitPrice: 18.75, unit: 'buckets' },
      'drywall_screws': { unitPrice: 0.15, unit: 'pieces' },
      'joint_tape': { unitPrice: 8.50, unit: 'rolls' },
      'corner_bead': { unitPrice: 2.25, unit: 'pcs' },
      'adhesives': { unitPrice: 12.00, unit: 'tubes' }
    };
  }

  // Process uploaded invoice PDF - Simplified version
  async processInvoice(file, jobId) {
    try {
      // Validate jobId
      if (!jobId) {
        throw new Error('Job ID is required');
      }

      // Simulate OCR processing (in real implementation, this would use a service like Tesseract.js or cloud OCR)
      const extractedData = await this.extractDataFromPDF(file);
      
      // Calculate drywall sqft from line items
      const drywallSqft = this.calculateDrywallSqft(extractedData.lineItems);
      
      // Create simplified result
      const result = {
        supplier: extractedData.supplier,
        invoiceNumber: extractedData.invoiceNumber,
        date: extractedData.date,
        totalAmount: extractedData.totalAmount,
        drywallSqft: drywallSqft,
        lineItems: extractedData.lineItems
      };
      
      // Save to job financials
      this.saveToJobFinancials(jobId, result);
      
      return {
        success: true,
        extractedData: result,
        processingTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing invoice:', error);
      return {
        success: false,
        error: error.message,
        processingTime: new Date().toISOString()
      };
    }
  }

  // Extract data from PDF (simulated OCR)
  async extractDataFromPDF(file) {
    // In real implementation, this would use OCR to extract text
    // For now, we'll simulate the extraction process
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate OCR processing delay
        setTimeout(() => {
          const extractedData = this.simulateOCRExtraction(file.name);
          resolve(extractedData);
        }, 2000);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  // Simulate OCR extraction (replace with actual OCR service)
  simulateOCRExtraction(filename) {
    // This is a simulation - in real implementation, use Tesseract.js or cloud OCR
    // The real OCR would extract text from the upper right corner of the invoice
    
    // Simulate extracting text from upper right corner where invoice details are typically located
    const upperRightCornerText = this.simulateUpperRightCornerExtraction(filename);
    
    // Parse the extracted text to find invoice details
    const extractedData = this.parseUpperRightCornerText(upperRightCornerText);
    
    return extractedData;
  }

  // Simulate extracting text from upper right corner of invoice
  simulateUpperRightCornerExtraction(filename) {
    // In real implementation, OCR would focus on the upper right area of the invoice
    // and extract text like: "Invoice Number: INV-2024-001", "Date: 01/15/2024", "Total: $2,450.75"
    
    const mockUpperRightTexts = {
      'invoice1.pdf': `
        Supplier: ABC Supply Co
        Invoice Number: INV-2024-001
        Invoice Date: 01/15/2024
        Total Amount: $2,450.75
        Due Date: 02/15/2024
      `,
      'invoice2.pdf': `
        Supplier: XYZ Materials
        Invoice Number: INV-2024-002
        Invoice Date: 01/20/2024
        Total Amount: $1,895.50
        Due Date: 02/20/2024
      `
    };

    return mockUpperRightTexts[filename] || this.generateMockUpperRightText();
  }

  // Generate mock upper right corner text for testing
  generateMockUpperRightText() {
    const suppliers = ['ABC Supply Co', 'XYZ Materials', 'Construction Supply Inc', 'USG Corporation'];
    const invoiceNumbers = ['INV-2024-001', 'INV-2024-002', 'INV-2024-003', 'INV-2024-004'];
    const dates = ['01/15/2024', '01/20/2024', '01/25/2024', '02/01/2024'];
    const amounts = ['$2,450.75', '$1,895.50', '$3,125.00', '$1,750.25'];
    
    const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    const randomInvoice = invoiceNumbers[Math.floor(Math.random() * invoiceNumbers.length)];
    const randomDate = dates[Math.floor(Math.random() * dates.length)];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
    
    return `
      Supplier: ${randomSupplier}
      Invoice Number: ${randomInvoice}
      Invoice Date: ${randomDate}
      Total Amount: ${randomAmount}
      Due Date: ${randomDate.replace(/\d{2}\/\d{2}/, '02/15')}
    `;
  }

  // Parse the extracted text from upper right corner to get invoice details
  parseUpperRightCornerText(text) {
    // Extract invoice number
    const invoiceNumberMatch = text.match(/Invoice Number:\s*([^\n\r]+)/i);
    const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1].trim() : `INV-${Date.now()}`;
    
    // Extract invoice date
    const dateMatch = text.match(/Invoice Date:\s*([^\n\r]+)/i);
    const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0];
    
    // Extract total amount
    const amountMatch = text.match(/Total Amount:\s*\$?([0-9,]+\.?\d*)/i);
    const totalAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;
    
    // Extract supplier name (look for common patterns)
    const supplierMatch = text.match(/(?:Supplier|From|Company):\s*([^\n\r]+)/i);
    const supplier = supplierMatch ? supplierMatch[1].trim() : 'ABC Supply Co';
    
    return {
      supplier,
      invoiceNumber,
      date: this.convertDateToISO(date),
      totalAmount,
      lineItems: this.generateBasicLineItems(totalAmount)
    };
  }

  // Convert various date formats to ISO format
  convertDateToISO(dateString) {
    // Handle MM/DD/YYYY format
    if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const [month, day, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Handle other formats as needed
    return dateString;
  }

  // Generate basic line items based on total amount
  generateBasicLineItems(totalAmount) {
    // Simple breakdown - in real implementation, OCR would extract actual line items
    const subtotal = totalAmount * 0.92; // Assume 8% tax
    const tax = totalAmount - subtotal;
    
    // Estimate drywall sqft based on total amount (rough estimate: $0.50 per sqft)
    const estimatedSqft = Math.round(subtotal / 0.50);
    
    return [
      { description: 'Drywall Materials', quantity: estimatedSqft, unit: 'sqft', unitPrice: 0.50, totalPrice: subtotal },
      { description: 'Sales Tax', quantity: 1, unit: 'tax', unitPrice: tax, totalPrice: tax }
    ];
  }



  // Match extracted invoice items to takeoff items
  matchToTakeoff(extractedData, takeoffData) {
    const matchedItems = [];
    const unmatchedItems = [];

    // Ensure takeoffData exists and is an array
    const safeTakeoffData = Array.isArray(takeoffData) ? takeoffData : [];
    
    // First, estimate prices for takeoff items that don't have prices
    const takeoffDataWithPrices = this.estimateTakeoffPrices(safeTakeoffData, extractedData.supplier);

    // Process each line item from the invoice
    if (extractedData && extractedData.lineItems && Array.isArray(extractedData.lineItems)) {
      extractedData.lineItems.forEach(invoiceItem => {
        // Skip non-material items like delivery fees and taxes
        if (this.isNonMaterialItem(invoiceItem.description)) {
          return;
        }

        const match = this.findBestMatch(invoiceItem, takeoffDataWithPrices);
        
        if (match) {
          matchedItems.push({
            invoiceItem,
            takeoffItem: match,
            matchConfidence: match.confidence,
            variance: this.calculateVariance(invoiceItem, match.item),
            status: this.determineStatus(invoiceItem, match.item)
          });
        } else {
          unmatchedItems.push({
            invoiceItem,
            reason: 'No matching takeoff item found'
          });
        }
      });
    }

    return {
      matchedItems,
      unmatchedItems,
      summary: this.generateMatchingSummary(matchedItems, unmatchedItems)
    };
  }

  // Estimate prices for takeoff items based on material type
  estimateTakeoffPrices(takeoffData, supplierName = null) {
    return takeoffData.map(item => {
      // If the takeoff item already has a price, use it
      if (item.unitPrice > 0) {
        return item;
      }

      // If no price in takeoff data, try to get from your pricing database
      // This would typically come from your supplier contracts or historical data
      const estimatedPrice = this.getEstimatedPrice(item.description, supplierName);
      
      return {
        ...item,
        unitPrice: estimatedPrice.unitPrice,
        totalPrice: item.quantity * estimatedPrice.unitPrice,
        priceSource: estimatedPrice.source || 'unknown'
      };
    });
  }

  // Get estimated price for a material description
  getEstimatedPrice(description, supplierName = null) {
    // If we have a supplier name, try to get their specific price first
    if (supplierName) {
      const supplierPrice = pricingDatabase.getBestPrice(supplierName, description);
      if (supplierPrice) {
        return supplierPrice;
      }
    }

    // Fall back to historical/market pricing
    const bestPrice = pricingDatabase.getBestPrice(null, description);
    if (bestPrice) {
      return bestPrice;
    }

    // Last resort: use the old hardcoded prices
    const desc = description.toLowerCase();
    for (const [materialType, variations] of Object.entries(this.materialMappings)) {
      if (variations.some(variation => desc.includes(variation.toLowerCase()))) {
        return this.priceEstimates[materialType] || { unitPrice: 0, unit: 'pcs', source: 'fallback' };
      }
    }

    return { unitPrice: 0, unit: 'pcs', source: 'unknown' };
  }

  // Find best match for an invoice item in takeoff data
  findBestMatch(invoiceItem, takeoffData) {
    let bestMatch = null;
    let bestScore = 0;

    takeoffData.forEach(takeoffItem => {
      const score = this.calculateMatchScore(invoiceItem, takeoffItem);
      if (score > bestScore && score > 0.6) { // Minimum confidence threshold
        bestScore = score;
        bestMatch = {
          item: takeoffItem,
          confidence: score
        };
      }
    });

    return bestMatch;
  }

  // Calculate match score between invoice and takeoff items
  calculateMatchScore(invoiceItem, takeoffItem) {
    let score = 0;
    
    // Enhanced description matching using material mappings
    const descScore = this.calculateEnhancedDescriptionSimilarity(
      invoiceItem.description.toLowerCase(),
      takeoffItem.description.toLowerCase()
    );
    score += descScore * 0.7;

    // Unit matching with normalization
    if (this.normalizeUnit(invoiceItem.unit) === this.normalizeUnit(takeoffItem.unit)) {
      score += 0.2;
    }

    // Price range matching (within 25% for better tolerance)
    if (takeoffItem.unitPrice > 0) {
      const priceDiff = Math.abs(invoiceItem.unitPrice - takeoffItem.unitPrice) / takeoffItem.unitPrice;
      if (priceDiff <= 0.25) {
        score += 0.1;
      }
    }

    return Math.min(score, 1.0);
  }

  // Enhanced description similarity using material mappings
  calculateEnhancedDescriptionSimilarity(invoiceDesc, takeoffDesc) {
    // First, try exact word matching
    const invoiceWords = invoiceDesc.split(/\s+/);
    const takeoffWords = takeoffDesc.split(/\s+/);
    
    let exactMatches = 0;
    invoiceWords.forEach(word => {
      if (takeoffWords.includes(word) && word.length > 2) {
        exactMatches++;
      }
    });

    const exactScore = exactMatches / Math.max(invoiceWords.length, takeoffWords.length);

    // Then, try material mapping matching
    let mappingScore = 0;
    for (const [materialType, variations] of Object.entries(this.materialMappings)) {
      const invoiceMatches = variations.some(variation => 
        invoiceDesc.includes(variation.toLowerCase())
      );
      const takeoffMatches = variations.some(variation => 
        takeoffDesc.includes(variation.toLowerCase())
      );
      
      if (invoiceMatches && takeoffMatches) {
        mappingScore = 0.9; // High score for material mapping match
        break;
      } else if (invoiceMatches || takeoffMatches) {
        mappingScore = Math.max(mappingScore, 0.6); // Medium score for partial match
      }
    }

    // Return the higher score
    return Math.max(exactScore, mappingScore);
  }

  // Calculate description similarity
  calculateDescriptionSimilarity(invoiceDesc, takeoffDesc) {
    // Simple keyword matching - in real implementation, use more sophisticated NLP
    const invoiceWords = invoiceDesc.split(/\s+/);
    const takeoffWords = takeoffDesc.split(/\s+/);
    
    let matches = 0;
    invoiceWords.forEach(word => {
      if (takeoffWords.includes(word) && word.length > 2) {
        matches++;
      }
    });

    return matches / Math.max(invoiceWords.length, takeoffWords.length);
  }

  // Normalize units for comparison
  normalizeUnit(unit) {
    const unitMap = {
      'sheets': 'sheets',
      'sheet': 'sheets',
      'pieces': 'pieces',
      'pcs': 'pieces',
      'rolls': 'rolls',
      'roll': 'rolls',
      'buckets': 'buckets',
      'bucket': 'buckets',
      'gallons': 'gallons',
      'gallon': 'gallons',
      'batts': 'batts',
      'batt': 'batts'
    };

    return unitMap[unit.toLowerCase()] || unit.toLowerCase();
  }

  // Check if item is non-material (fees, taxes, etc.)
  isNonMaterialItem(description) {
    const nonMaterialKeywords = ['delivery', 'tax', 'fee', 'shipping', 'handling'];
    return nonMaterialKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    );
  }

  // Calculate variance between invoice and takeoff
  calculateVariance(invoiceItem, takeoffItem) {
    // Handle division by zero to prevent NaN or Infinity
    const quantityVariance = takeoffItem.quantity > 0 
      ? ((invoiceItem.quantity - takeoffItem.quantity) / takeoffItem.quantity) * 100 
      : 0;
    
    const priceVariance = takeoffItem.unitPrice > 0 
      ? ((invoiceItem.unitPrice - takeoffItem.unitPrice) / takeoffItem.unitPrice) * 100 
      : 0;
    
    const totalVariance = takeoffItem.totalPrice > 0 
      ? ((invoiceItem.totalPrice - takeoffItem.totalPrice) / takeoffItem.totalPrice) * 100 
      : 0;

    return {
      quantity: Math.round(quantityVariance * 100) / 100,
      price: Math.round(priceVariance * 100) / 100,
      total: Math.round(totalVariance * 100) / 100
    };
  }

  // Determine status based on variance
  determineStatus(invoiceItem, takeoffItem) {
    const variance = this.calculateVariance(invoiceItem, takeoffItem);
    
    if (Math.abs(variance.quantity) > 10 || Math.abs(variance.price) > 15) {
      return 'critical';
    } else if (Math.abs(variance.quantity) > 5 || Math.abs(variance.price) > 10) {
      return 'warning';
    } else {
      return 'good';
    }
  }

  // Generate matching summary
  generateMatchingSummary(matchedItems, unmatchedItems) {
    // Ensure arrays exist to prevent filter errors
    const safeMatchedItems = matchedItems || [];
    const safeUnmatchedItems = unmatchedItems || [];
    
    const totalItems = safeMatchedItems.length + safeUnmatchedItems.length;
    const matchedCount = safeMatchedItems.length;
    const unmatchedCount = safeUnmatchedItems.length;
    
    // Add safety checks for status property
    const criticalIssues = safeMatchedItems.filter(item => item && item.status === 'critical').length;
    const warnings = safeMatchedItems.filter(item => item && item.status === 'warning').length;
    const goodMatches = safeMatchedItems.filter(item => item && item.status === 'good').length;

    return {
      totalItems,
      matchedCount,
      unmatchedCount,
      matchRate: totalItems > 0 ? (matchedCount / totalItems) * 100 : 0,
      criticalIssues,
      warnings,
      goodMatches
    };
  }

  // Generate validation report
  generateValidationReport(matchedItems, jobId) {
    // Ensure matchedItems exists to prevent filter errors
    const safeMatchedItems = matchedItems || [];
    
    // Add safety checks for status property
    const criticalItems = safeMatchedItems.filter(item => item && item.status === 'critical');
    const warningItems = safeMatchedItems.filter(item => item && item.status === 'warning');
    
    return {
      jobId,
      timestamp: new Date().toISOString(),
      summary: {
        totalItems: safeMatchedItems.length,
        criticalIssues: criticalItems.length,
        warnings: warningItems.length,
        goodMatches: safeMatchedItems.filter(item => item && item.status === 'good').length
      },
      criticalIssues: criticalItems.map(item => ({
        invoiceItem: item.invoiceItem.description,
        takeoffItem: item.takeoffItem.item.description,
        variance: item.variance,
        recommendation: this.generateRecommendation(item)
      })),
      warnings: warningItems.map(item => ({
        invoiceItem: item.invoiceItem.description,
        takeoffItem: item.takeoffItem.item.description,
        variance: item.variance,
        recommendation: this.generateRecommendation(item)
      }))
    };
  }

  // Generate recommendation based on variance
  generateRecommendation(item) {
    const { variance } = item;
    
    if (variance.quantity > 10) {
      return `Quantity variance of ${variance.quantity}% - verify delivery quantities`;
    } else if (variance.quantity < -10) {
      return `Quantity variance of ${Math.abs(variance.quantity)}% - check for missing items`;
    } else if (variance.price > 15) {
      return `Price variance of ${variance.price}% - verify pricing with supplier`;
    } else {
      return 'Minor variance - within acceptable range';
    }
  }

  // Save processed invoice to job data
  saveProcessedInvoice(jobId, processedData) {
    // In real implementation, this would save to your database
    const savedInvoice = {
      id: `inv_${Date.now()}`,
      jobId,
      ...processedData,
      savedAt: new Date().toISOString()
    };

    // Store in localStorage for demo (replace with actual database)
    const existingInvoices = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
    existingInvoices.push(savedInvoice);
    localStorage.setItem('processedInvoices', JSON.stringify(existingInvoices));

    // Update historical pricing data from processed invoice
    this.updateHistoricalPricingFromInvoice(processedData.extractedData);

    return savedInvoice;
  }

  // Update historical pricing from processed invoice
  updateHistoricalPricingFromInvoice(extractedData) {
    if (!extractedData || !extractedData.lineItems) return;

    extractedData.lineItems.forEach(item => {
      // Skip non-material items
      if (this.isNonMaterialItem(item.description)) return;

      // Add to historical pricing database
      pricingDatabase.addHistoricalPrice(
        item.description,
        item.unitPrice,
        item.unit
      );
    });
  }

  // Get processed invoices for a job
  getProcessedInvoices(jobId) {
    const invoices = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
    return invoices.filter(invoice => invoice.jobId === jobId);
  }

  // Get all processed invoices
  getAllProcessedInvoices() {
    return JSON.parse(localStorage.getItem('processedInvoices') || '[]');
  }

  // Calculate drywall sqft from line items
  calculateDrywallSqft(lineItems) {
    let totalSqft = 0;
    
    if (!lineItems || !Array.isArray(lineItems)) return 0;
    
    lineItems.forEach(item => {
      const desc = item.description.toLowerCase();
      
      // Check if it's drywall (any thickness)
      if (desc.includes('drywall') || desc.includes('sheetrock') || desc.includes('gypsum board')) {
        // Standard drywall sheet is 4x8 = 32 sqft
        const sheets = item.quantity || 0;
        const sqft = sheets * 32;
        totalSqft += sqft;
      }
    });
    
    return Math.round(totalSqft);
  }

  // Save invoice data to job financials
  saveToJobFinancials(jobId, invoiceData) {
    try {
      // Get existing job data
      const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');
      const jobIndex = jobs.findIndex(job => job.id === jobId);
      
      if (jobIndex === -1) {
        console.error('Job not found:', jobId);
        // Create a new job if it doesn't exist (for testing purposes)
        const newJob = {
          id: jobId,
          jobName: `Job ${jobId}`,
          jobType: 'Commercial',
          status: 'Active',
          financials: {
            actual: {
              invoices: [],
              totalSpent: 0
            },
            estimated: {
              totalBudget: 0
            }
          }
        };
        jobs.push(newJob);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        console.log('Created new job for testing:', newJob);
        return this.saveToJobFinancials(jobId, invoiceData); // Recursive call with new job
      }
      
      const job = jobs[jobIndex];
      
      // Initialize financials if they don't exist
      if (!job.financials) {
        job.financials = {
          actual: {
            invoices: [],
            totalSpent: 0
          },
          estimated: {
            totalBudget: 0
          }
        };
      }
      
      if (!job.financials.actual) {
        job.financials.actual = {
          invoices: [],
          totalSpent: 0
        };
      }
      
      if (!job.financials.actual.invoices) {
        job.financials.actual.invoices = [];
      }
      
      // Create invoice entry
      const invoiceEntry = {
        id: `inv_${Date.now()}`,
        supplier: invoiceData.supplier,
        invoiceNumber: invoiceData.invoiceNumber,
        date: invoiceData.date,
        amount: invoiceData.totalAmount,
        drywallSqft: invoiceData.drywallSqft,
        lineItems: invoiceData.lineItems,
        processedAt: new Date().toISOString()
      };
      
      // Add to invoices array
      job.financials.actual.invoices.push(invoiceEntry);
      
      // Update total spent
      job.financials.actual.totalSpent = job.financials.actual.invoices.reduce(
        (sum, inv) => sum + (inv.amount || 0), 0
      );
      
      // Save updated job data
      jobs[jobIndex] = job;
      localStorage.setItem('jobs', JSON.stringify(jobs));
      
      console.log('Invoice saved to job financials:', invoiceEntry);
      
    } catch (error) {
      console.error('Error saving to job financials:', error);
    }
  }
}

export default new InvoiceProcessingService(); 