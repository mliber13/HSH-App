// Pricing Database Service
// This should be updated with your actual supplier prices and historical data

class PricingDatabase {
  constructor() {
    // Supplier-specific pricing (update with your actual supplier contracts)
    this.supplierPricing = {
      'ABC Supply Co': {
        '5/8" drywall': { unitPrice: 12.50, unit: 'sheets', lastUpdated: '2024-01-15' },
        '1/2" drywall': { unitPrice: 10.25, unit: 'sheets', lastUpdated: '2024-01-15' },
        'joint compound': { unitPrice: 18.75, unit: 'buckets', lastUpdated: '2024-01-15' },
        'drywall screws': { unitPrice: 0.15, unit: 'pieces', lastUpdated: '2024-01-15' },
        'joint tape': { unitPrice: 8.50, unit: 'rolls', lastUpdated: '2024-01-15' }
      },
      'XYZ Materials': {
        '5/8" drywall': { unitPrice: 12.75, unit: 'sheets', lastUpdated: '2024-01-20' },
        '1/2" drywall': { unitPrice: 10.50, unit: 'sheets', lastUpdated: '2024-01-20' },
        'joint compound': { unitPrice: 19.00, unit: 'buckets', lastUpdated: '2024-01-20' },
        'drywall screws': { unitPrice: 0.16, unit: 'pieces', lastUpdated: '2024-01-20' },
        'joint tape': { unitPrice: 8.75, unit: 'rolls', lastUpdated: '2024-01-20' }
      },
      // TODO: Add your actual suppliers here
      // 'Your Primary Supplier': {
      //   '5/8" drywall': { unitPrice: 13.00, unit: 'sheets', lastUpdated: '2024-01-25' },
      //   '1/2" drywall': { unitPrice: 10.75, unit: 'sheets', lastUpdated: '2024-01-25' },
      //   'joint compound': { unitPrice: 19.50, unit: 'buckets', lastUpdated: '2024-01-25' },
      //   'drywall screws': { unitPrice: 0.18, unit: 'pieces', lastUpdated: '2024-01-25' },
      //   'joint tape': { unitPrice: 9.00, unit: 'rolls', lastUpdated: '2024-01-25' }
      // }
    };

    // Historical average prices (from your past invoices)
    this.historicalPricing = {
      '5/8" drywall': { avgPrice: 12.60, unit: 'sheets', sampleSize: 45 },
      '1/2" drywall': { avgPrice: 10.35, unit: 'sheets', sampleSize: 38 },
      'joint compound': { avgPrice: 18.85, unit: 'buckets', sampleSize: 52 },
      'drywall screws': { avgPrice: 0.155, unit: 'pieces', sampleSize: 67 },
      'joint tape': { avgPrice: 8.60, unit: 'rolls', sampleSize: 29 }
    };

    // Market reference prices (from industry sources)
    this.marketPricing = {
      '5/8" drywall': { unitPrice: 12.40, unit: 'sheets', source: 'industry_avg' },
      '1/2" drywall': { unitPrice: 10.20, unit: 'sheets', source: 'industry_avg' },
      'joint compound': { unitPrice: 18.50, unit: 'buckets', source: 'industry_avg' },
      'drywall screws': { unitPrice: 0.15, unit: 'pieces', source: 'industry_avg' },
      'joint tape': { unitPrice: 8.40, unit: 'rolls', source: 'industry_avg' }
    };
  }

  // Get price for a material from a specific supplier
  getSupplierPrice(supplierName, materialDescription) {
    const supplier = this.supplierPricing[supplierName];
    if (!supplier) return null;

    // Try exact match first
    if (supplier[materialDescription.toLowerCase()]) {
      return supplier[materialDescription.toLowerCase()];
    }

    // Try partial match
    for (const [key, price] of Object.entries(supplier)) {
      if (materialDescription.toLowerCase().includes(key) || key.includes(materialDescription.toLowerCase())) {
        return price;
      }
    }

    return null;
  }

  // Get historical average price for a material
  getHistoricalPrice(materialDescription) {
    const desc = materialDescription.toLowerCase();
    
    for (const [key, price] of Object.entries(this.historicalPricing)) {
      if (desc.includes(key) || key.includes(desc)) {
        return price;
      }
    }

    return null;
  }

  // Get market reference price for a material
  getMarketPrice(materialDescription) {
    const desc = materialDescription.toLowerCase();
    
    for (const [key, price] of Object.entries(this.marketPricing)) {
      if (desc.includes(key) || key.includes(desc)) {
        return price;
      }
    }

    return null;
  }

  // Get best available price (supplier > historical > market)
  getBestPrice(supplierName, materialDescription) {
    // Try supplier-specific price first
    const supplierPrice = this.getSupplierPrice(supplierName, materialDescription);
    if (supplierPrice) {
      return { ...supplierPrice, source: 'supplier_contract' };
    }

    // Try historical price
    const historicalPrice = this.getHistoricalPrice(materialDescription);
    if (historicalPrice) {
      return { 
        unitPrice: historicalPrice.avgPrice, 
        unit: historicalPrice.unit, 
        source: 'historical_average',
        sampleSize: historicalPrice.sampleSize
      };
    }

    // Try market price
    const marketPrice = this.getMarketPrice(materialDescription);
    if (marketPrice) {
      return { ...marketPrice, source: 'market_reference' };
    }

    return null;
  }

  // Update supplier pricing (for when you get new price lists)
  updateSupplierPricing(supplierName, materialDescription, newPrice, unit) {
    if (!this.supplierPricing[supplierName]) {
      this.supplierPricing[supplierName] = {};
    }

    this.supplierPricing[supplierName][materialDescription.toLowerCase()] = {
      unitPrice: newPrice,
      unit: unit,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }

  // Add historical price data (from processed invoices)
  addHistoricalPrice(materialDescription, price, unit) {
    const desc = materialDescription.toLowerCase();
    
    if (!this.historicalPricing[desc]) {
      this.historicalPricing[desc] = {
        avgPrice: price,
        unit: unit,
        sampleSize: 1
      };
    } else {
      // Update running average
      const current = this.historicalPricing[desc];
      const newSampleSize = current.sampleSize + 1;
      const newAvgPrice = ((current.avgPrice * current.sampleSize) + price) / newSampleSize;
      
      this.historicalPricing[desc] = {
        avgPrice: newAvgPrice,
        unit: unit,
        sampleSize: newSampleSize
      };
    }
  }

  // Export pricing data for backup/analysis
  exportPricingData() {
    return {
      supplierPricing: this.supplierPricing,
      historicalPricing: this.historicalPricing,
      marketPricing: this.marketPricing,
      exportedAt: new Date().toISOString()
    };
  }

  // Import pricing data (for updates)
  importPricingData(data) {
    if (data.supplierPricing) this.supplierPricing = data.supplierPricing;
    if (data.historicalPricing) this.historicalPricing = data.historicalPricing;
    if (data.marketPricing) this.marketPricing = data.marketPricing;
  }
}

export default new PricingDatabase(); 