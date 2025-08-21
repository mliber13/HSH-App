// Inventory Management Service
class InventoryService {
  constructor() {
    this.warehouseInventory = null;
    this.jobAllocations = null;
    this.assetTracking = null;
    this.initialized = false;
  }

  // Initialize the service (call this before using)
  initialize() {
    if (!this.initialized) {
      this.warehouseInventory = this.loadWarehouseInventory();
      this.jobAllocations = this.loadJobAllocations();
      this.assetTracking = this.loadAssetTracking();
      this.initialized = true;
    }
  }

  // Load data from localStorage (replace with database in production)
  loadWarehouseInventory() {
    try {
      const stored = localStorage.getItem('warehouseInventory');
      return stored ? JSON.parse(stored) : this.getDefaultWarehouseInventory();
    } catch (error) {
      console.error('Error loading warehouse inventory:', error);
      return this.getDefaultWarehouseInventory();
    }
  }

  loadJobAllocations() {
    try {
      const stored = localStorage.getItem('jobAllocations');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading job allocations:', error);
      return {};
    }
  }

  loadAssetTracking() {
    try {
      const stored = localStorage.getItem('assetTracking');
      return stored ? JSON.parse(stored) : this.getDefaultAssetTracking();
    } catch (error) {
      console.error('Error loading asset tracking:', error);
      return this.getDefaultAssetTracking();
    }
  }

  // Save data to localStorage
  saveWarehouseInventory() {
    try {
      localStorage.setItem('warehouseInventory', JSON.stringify(this.warehouseInventory));
    } catch (error) {
      console.error('Error saving warehouse inventory:', error);
    }
  }

  saveJobAllocations() {
    try {
      localStorage.setItem('jobAllocations', JSON.stringify(this.jobAllocations));
    } catch (error) {
      console.error('Error saving job allocations:', error);
    }
  }

  saveAssetTracking() {
    try {
      localStorage.setItem('assetTracking', JSON.stringify(this.assetTracking));
    } catch (error) {
      console.error('Error saving asset tracking:', error);
    }
  }

  // Default warehouse inventory
  getDefaultWarehouseInventory() {
    return {
      materials: {
        'joint compound': {
          quantity: 15,
          unit: 'buckets',
          location: 'Warehouse A - Shelf 3',
          minStock: 5,
          maxStock: 25,
          lastUpdated: new Date().toISOString().split('T')[0],
          source: 'leftover_from_jobs',
          notes: 'Various brands, mixed conditions'
        },
        'drywall screws': {
          quantity: 2500,
          unit: 'pieces',
          location: 'Warehouse A - Bin 2',
          minStock: 1000,
          maxStock: 5000,
          lastUpdated: new Date().toISOString().split('T')[0],
          source: 'leftover_from_jobs',
          notes: '1-5/8" Phillips head'
        },
        'joint tape': {
          quantity: 8,
          unit: 'rolls',
          location: 'Warehouse A - Shelf 4',
          minStock: 3,
          maxStock: 15,
          lastUpdated: new Date().toISOString().split('T')[0],
          source: 'leftover_from_jobs',
          notes: 'Paper tape, 500ft rolls'
        }
      },
      supplies: {
        'drop cloths': {
          quantity: 12,
          unit: 'pieces',
          location: 'Warehouse B - Rack 1',
          minStock: 5,
          maxStock: 20,
          lastUpdated: new Date().toISOString().split('T')[0],
          source: 'purchased',
          notes: '9x12 plastic drop cloths'
        },
        'masking tape': {
          quantity: 24,
          unit: 'rolls',
          location: 'Warehouse B - Shelf 2',
          minStock: 10,
          maxStock: 30,
          lastUpdated: new Date().toISOString().split('T')[0],
          source: 'purchased',
          notes: '1" blue painter\'s tape'
        },
        'cleaning supplies': {
          quantity: 8,
          unit: 'kits',
          location: 'Warehouse B - Cabinet 3',
          minStock: 3,
          maxStock: 12,
          lastUpdated: new Date().toISOString().split('T')[0],
          source: 'purchased',
          notes: 'Sponges, rags, cleaners'
        }
      }
    };
  }

  // Default asset tracking (scaffold, equipment)
  getDefaultAssetTracking() {
    return {
      scaffold: {
        'SCAFF-001': {
          type: 'Frame Scaffold',
          description: '6ft x 5ft frame with planks',
          condition: 'good',
          location: 'warehouse',
          assignedJob: null,
          lastAssigned: null,
          purchaseDate: '2023-01-15',
          notes: 'Standard frame scaffold set'
        },
        'SCAFF-002': {
          type: 'Frame Scaffold',
          description: '6ft x 5ft frame with planks',
          condition: 'good',
          location: 'warehouse',
          assignedJob: null,
          lastAssigned: null,
          purchaseDate: '2023-01-15',
          notes: 'Standard frame scaffold set'
        },
        'SCAFF-003': {
          type: 'Baker Scaffold',
          description: '4ft x 6ft rolling scaffold',
          condition: 'excellent',
          location: 'warehouse',
          assignedJob: null,
          lastAssigned: null,
          purchaseDate: '2023-03-20',
          notes: 'Rolling baker scaffold'
        },
        'SCAFF-004': {
          type: 'Baker Scaffold',
          description: '4ft x 6ft rolling scaffold',
          condition: 'good',
          location: 'warehouse',
          assignedJob: null,
          lastAssigned: null,
          purchaseDate: '2023-03-20',
          notes: 'Rolling baker scaffold'
        }
      },
      equipment: {
        'TOOL-001': {
          type: 'Drywall Sander',
          description: 'Electric drywall sander with vacuum',
          condition: 'good',
          location: 'warehouse',
          assignedJob: null,
          lastAssigned: null,
          purchaseDate: '2023-02-10',
          notes: 'Makita drywall sander'
        },
        'TOOL-002': {
          type: 'Mud Mixer',
          description: 'Electric mud mixer drill attachment',
          condition: 'excellent',
          location: 'warehouse',
          assignedJob: null,
          lastAssigned: null,
          purchaseDate: '2023-04-05',
          notes: 'Heavy duty mud mixer'
        }
      }
    };
  }

  // Warehouse Inventory Methods
  getWarehouseInventory() {
    this.initialize();
    return this.warehouseInventory;
  }

  updateWarehouseItem(category, itemName, updates) {
    this.initialize();
    if (!this.warehouseInventory[category]) {
      this.warehouseInventory[category] = {};
    }
    
    if (!this.warehouseInventory[category][itemName]) {
      this.warehouseInventory[category][itemName] = {
        quantity: 0,
        unit: 'pcs',
        location: 'Unknown',
        minStock: 0,
        maxStock: 100,
        lastUpdated: new Date().toISOString().split('T')[0],
        source: 'unknown',
        notes: ''
      };
    }

    this.warehouseInventory[category][itemName] = {
      ...this.warehouseInventory[category][itemName],
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    this.saveWarehouseInventory();
  }

  addToWarehouse(category, itemName, quantity, unit, location, source = 'purchased', notes = '') {
    this.initialize();
    const existing = this.warehouseInventory[category]?.[itemName];
    
    this.updateWarehouseItem(category, itemName, {
      quantity: (existing?.quantity || 0) + quantity,
      unit: unit || existing?.unit || 'pcs',
      location: location || existing?.location || 'Unknown',
      source: source,
      notes: notes || existing?.notes || ''
    });
  }

  removeFromWarehouse(category, itemName, quantity) {
    this.initialize();
    const existing = this.warehouseInventory[category]?.[itemName];
    if (!existing || existing.quantity < quantity) {
      throw new Error(`Insufficient stock: ${itemName}`);
    }

    this.updateWarehouseItem(category, itemName, {
      quantity: existing.quantity - quantity
    });
  }

  // Add new warehouse item
  addWarehouseItem(category, itemData) {
    this.initialize();
    const { name, quantity, unit, location, minStock, maxStock, source, notes } = itemData;
    
    if (!this.warehouseInventory[category]) {
      this.warehouseInventory[category] = {};
    }

    this.warehouseInventory[category][name] = {
      quantity: quantity || 0,
      unit: unit || 'pcs',
      location: location || 'Unknown',
      minStock: minStock || 0,
      maxStock: maxStock || 100,
      lastUpdated: new Date().toISOString().split('T')[0],
      source: source || 'purchased',
      notes: notes || ''
    };

    this.saveWarehouseInventory();
  }

  // Remove warehouse item completely
  removeWarehouseItem(category, itemName) {
    this.initialize();
    if (this.warehouseInventory[category] && this.warehouseInventory[category][itemName]) {
      delete this.warehouseInventory[category][itemName];
      this.saveWarehouseInventory();
    }
  }

  // Asset Tracking Methods
  getAssetTracking() {
    this.initialize();
    return this.assetTracking;
  }

  assignAssetToJob(assetId, jobId, jobName) {
    const asset = this.findAsset(assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    asset.location = 'job_site';
    asset.assignedJob = jobId;
    asset.lastAssigned = new Date().toISOString().split('T')[0];

    this.saveAssetTracking();
    
    return {
      success: true,
      asset: asset,
      message: `${asset.description} assigned to ${jobName}`
    };
  }

  returnAssetFromJob(assetId) {
    const asset = this.findAsset(assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    asset.location = 'warehouse';
    asset.assignedJob = null;
    asset.lastAssigned = new Date().toISOString().split('T')[0];

    this.saveAssetTracking();
    
    return {
      success: true,
      asset: asset,
      message: `${asset.description} returned to warehouse`
    };
  }

  findAsset(assetId) {
    for (const category of Object.values(this.assetTracking)) {
      if (category[assetId]) {
        return category[assetId];
      }
    }
    return null;
  }

  // Job Allocation Methods
  getJobAllocations(jobId = null) {
    this.initialize();
    if (jobId) {
      return this.jobAllocations[jobId] || { materials: {}, assets: [] };
    }
    return this.jobAllocations;
  }

  allocateMaterialToJob(jobId, jobName, materialName, quantity, unit, source = 'warehouse') {
    if (!this.jobAllocations[jobId]) {
      this.jobAllocations[jobId] = {
        jobName,
        materials: {},
        assets: [],
        created: new Date().toISOString().split('T')[0]
      };
    }

    const existing = this.jobAllocations[jobId].materials[materialName];
    this.jobAllocations[jobId].materials[materialName] = {
      quantity: (existing?.quantity || 0) + quantity,
      unit: unit || existing?.unit || 'pcs',
      source: source,
      allocatedDate: new Date().toISOString().split('T')[0],
      notes: existing?.notes || ''
    };

    // Remove from warehouse if source is warehouse
    if (source === 'warehouse') {
      this.removeFromWarehouse('materials', materialName, quantity);
    }

    this.saveJobAllocations();
  }

  returnMaterialFromJob(jobId, materialName, quantity) {
    const jobAllocation = this.jobAllocations[jobId];
    if (!jobAllocation || !jobAllocation.materials[materialName]) {
      throw new Error(`Material not allocated to job: ${materialName}`);
    }

    const allocated = jobAllocation.materials[materialName];
    if (allocated.quantity < quantity) {
      throw new Error(`Insufficient allocated quantity: ${materialName}`);
    }

    // Update job allocation
    allocated.quantity -= quantity;
    if (allocated.quantity <= 0) {
      delete jobAllocation.materials[materialName];
    }

    // Add back to warehouse if it was from warehouse
    if (allocated.source === 'warehouse') {
      this.addToWarehouse('materials', materialName, quantity, allocated.unit, 'Returned from job');
    }

    this.saveJobAllocations();
  }

  // Reporting Methods
  getLowStockItems() {
    const lowStock = [];
    
    for (const category of Object.values(this.warehouseInventory)) {
      for (const [itemName, item] of Object.entries(category)) {
        if (item.quantity <= item.minStock) {
          lowStock.push({
            category: this.getCategoryName(category),
            itemName,
            currentStock: item.quantity,
            minStock: item.minStock,
            unit: item.unit,
            location: item.location
          });
        }
      }
    }
    
    return lowStock;
  }

  getCategoryName(category) {
    if (category === this.warehouseInventory.materials) return 'Materials';
    if (category === this.warehouseInventory.supplies) return 'Supplies';
    return 'Unknown';
  }

  getAssetStatus() {
    const status = {
      total: 0,
      inWarehouse: 0,
      onJobs: 0,
      byType: {}
    };

    for (const [categoryName, category] of Object.entries(this.assetTracking)) {
      status.byType[categoryName] = { total: 0, inWarehouse: 0, onJobs: 0 };
      
      for (const asset of Object.values(category)) {
        status.total++;
        status.byType[categoryName].total++;
        
        if (asset.location === 'warehouse') {
          status.inWarehouse++;
          status.byType[categoryName].inWarehouse++;
        } else if (asset.location === 'job_site') {
          status.onJobs++;
          status.byType[categoryName].onJobs++;
        }
      }
    }

    return status;
  }

  // Import/Export Methods
  exportInventoryData() {
    return {
      warehouseInventory: this.warehouseInventory,
      jobAllocations: this.jobAllocations,
      assetTracking: this.assetTracking,
      exportDate: new Date().toISOString()
    };
  }

  importInventoryData(data) {
    if (data.warehouseInventory) {
      this.warehouseInventory = data.warehouseInventory;
      this.saveWarehouseInventory();
    }
    if (data.jobAllocations) {
      this.jobAllocations = data.jobAllocations;
      this.saveJobAllocations();
    }
    if (data.assetTracking) {
      this.assetTracking = data.assetTracking;
      this.saveAssetTracking();
    }
  }

  // Sortly Integration Methods
  importFromSortly(csvData) {
    // Parse Sortly CSV export and convert to our format
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Expected Sortly columns: name,quantity,location,notes,category
    const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('item'));
    const quantityIndex = headers.findIndex(h => h.includes('quantity') || h.includes('qty'));
    const locationIndex = headers.findIndex(h => h.includes('location'));
    const notesIndex = headers.findIndex(h => h.includes('notes') || h.includes('description'));
    const categoryIndex = headers.findIndex(h => h.includes('category') || h.includes('type'));

    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      
      try {
        const name = values[nameIndex];
        const quantity = parseInt(values[quantityIndex]) || 0;
        const location = values[locationIndex] || 'Unknown';
        const notes = values[notesIndex] || '';
        const category = values[categoryIndex] || 'materials';

        if (name && quantity > 0) {
          // Determine if it's a material, supply, or asset
          if (category.toLowerCase().includes('scaffold') || category.toLowerCase().includes('equipment')) {
            // Handle as asset
            const assetId = `IMPORT-${Date.now()}-${i}`;
            this.assetTracking[category] = this.assetTracking[category] || {};
            this.assetTracking[category][assetId] = {
              type: category,
              description: name,
              condition: 'good',
              location: 'warehouse',
              assignedJob: null,
              lastAssigned: null,
              purchaseDate: new Date().toISOString().split('T')[0],
              notes: notes
            };
          } else {
            // Handle as inventory item
            const invCategory = category.toLowerCase().includes('supply') ? 'supplies' : 'materials';
            this.addToWarehouse(invCategory, name, quantity, 'pcs', location, 'imported', notes);
          }
          importedCount++;
        }
      } catch (error) {
        console.error(`Error importing line ${i + 1}:`, error);
      }
    }

    this.saveAssetTracking();
    this.saveWarehouseInventory();

    return importedCount;
  }
}

export default new InventoryService(); 