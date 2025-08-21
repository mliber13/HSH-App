// Supplier & Delivery Management Service
class SupplierService {
  constructor() {
    this.loadSupplierData();
  }

  loadSupplierData() {
    const stored = localStorage.getItem('supplierData');
    if (stored) {
      this.supplierData = JSON.parse(stored);
    } else {
      this.supplierData = {
        suppliers: [],
        deliveries: [],
        takeoffRequests: []
      };
      this.saveSupplierData();
    }
  }

  saveSupplierData() {
    localStorage.setItem('supplierData', JSON.stringify(this.supplierData));
  }

  // Supplier Management
  addSupplier(supplierData) {
    const supplier = {
      id: Date.now() + Math.random(),
      name: supplierData.name,
      contactPerson: supplierData.contactPerson,
      phone: supplierData.phone,
      email: supplierData.email,
      address: supplierData.address,
      materialCategories: supplierData.materialCategories || [],
      deliveryPreferences: supplierData.deliveryPreferences || '',
      isPrimary: supplierData.isPrimary || false,
      quarterlyPricing: supplierData.quarterlyPricing || {},
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // If this is a primary supplier, unset other primary suppliers
    if (supplier.isPrimary) {
      this.supplierData.suppliers.forEach(s => s.isPrimary = false);
    }

    this.supplierData.suppliers.push(supplier);
    this.saveSupplierData();
    return supplier;
  }

  updateSupplier(supplierId, updates) {
    const supplierIndex = this.supplierData.suppliers.findIndex(s => s.id === supplierId);
    if (supplierIndex !== -1) {
      // If setting as primary, unset other primary suppliers
      if (updates.isPrimary) {
        this.supplierData.suppliers.forEach(s => s.isPrimary = false);
      }

      this.supplierData.suppliers[supplierIndex] = {
        ...this.supplierData.suppliers[supplierIndex],
        ...updates
      };
      this.saveSupplierData();
      return this.supplierData.suppliers[supplierIndex];
    }
    return null;
  }

  deleteSupplier(supplierId) {
    this.supplierData.suppliers = this.supplierData.suppliers.filter(s => s.id !== supplierId);
    this.saveSupplierData();
  }

  getSuppliers() {
    return this.supplierData.suppliers.filter(s => s.isActive);
  }

  getPrimarySupplier() {
    return this.supplierData.suppliers.find(s => s.isPrimary && s.isActive);
  }

  // Takeoff Requests
  sendTakeoffToSupplier(takeoffData) {
    const takeoffRequest = {
      id: Date.now() + Math.random(),
      jobId: takeoffData.jobId,
      jobName: takeoffData.jobName,
      supplierId: takeoffData.supplierId,
      supplierName: takeoffData.supplierName,
      materials: takeoffData.materials || [],
      deliveryAddress: takeoffData.deliveryAddress,
      contactPerson: takeoffData.contactPerson,
      contactPhone: takeoffData.contactPhone,
      deliveryInstructions: takeoffData.deliveryInstructions || '',
      neededBy: takeoffData.neededBy,
      status: 'sent', // 'sent', 'delivered', 'cancelled'
      sentAt: new Date().toISOString(),
      deliveredAt: null,
      deliveryNotes: '',
      deliveryPhotos: []
    };

    this.supplierData.takeoffRequests.push(takeoffRequest);
    this.saveSupplierData();
    return takeoffRequest;
  }

  getTakeoffRequests(jobId = null, supplierId = null, status = null) {
    let requests = this.supplierData.takeoffRequests;
    
    if (jobId) {
      requests = requests.filter(req => req.jobId === jobId);
    }
    
    if (supplierId) {
      requests = requests.filter(req => req.supplierId === supplierId);
    }
    
    if (status) {
      requests = requests.filter(req => req.status === status);
    }
    
    return requests.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  }

  // Delivery Tracking
  confirmDelivery(takeoffRequestId, deliveryData) {
    const requestIndex = this.supplierData.takeoffRequests.findIndex(req => req.id === takeoffRequestId);
    if (requestIndex !== -1) {
      const request = this.supplierData.takeoffRequests[requestIndex];
      
      // Update takeoff request
      this.supplierData.takeoffRequests[requestIndex] = {
        ...request,
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
        deliveryNotes: deliveryData.notes || '',
        deliveryPhotos: deliveryData.photos || []
      };

      // Create delivery record
      const delivery = {
        id: Date.now() + Math.random(),
        takeoffRequestId,
        jobId: request.jobId,
        jobName: request.jobName,
        supplierId: request.supplierId,
        supplierName: request.supplierName,
        materials: request.materials,
        deliveredAt: new Date().toISOString(),
        notes: deliveryData.notes || '',
        photos: deliveryData.photos || [],
        confirmedBy: deliveryData.confirmedBy || 'Supplier'
      };

      this.supplierData.deliveries.push(delivery);
      this.saveSupplierData();
      
      return {
        takeoffRequest: this.supplierData.takeoffRequests[requestIndex],
        delivery
      };
    }
    return null;
  }

  getDeliveries(jobId = null, supplierId = null, limit = 50) {
    let deliveries = this.supplierData.deliveries;
    
    if (jobId) {
      deliveries = deliveries.filter(del => del.jobId === jobId);
    }
    
    if (supplierId) {
      deliveries = deliveries.filter(del => del.supplierId === supplierId);
    }
    
    return deliveries.slice(-limit).reverse();
  }

  // Notifications
  getPendingDeliveries() {
    return this.supplierData.takeoffRequests.filter(req => req.status === 'sent');
  }

  getRecentDeliveries(limit = 10) {
    return this.supplierData.deliveries.slice(-limit).reverse();
  }

  // Material Categories
  getMaterialCategories() {
    return [
      'drywall',
      'joint_compound',
      'tape',
      'screws',
      'channel',
      'studs',
      'insulation',
      'act_tiles',
      'grid_system',
      'other'
    ];
  }

  // Export/Import
  exportSupplierData() {
    return this.supplierData;
  }

  importSupplierData(data) {
    this.supplierData = { ...this.supplierData, ...data };
    this.saveSupplierData();
  }

  // Utility Methods
  formatMaterialList(materials) {
    if (!materials || materials.length === 0) return 'No materials specified';
    
    return materials.map(material => {
      const quantity = material.quantity || 0;
      const unit = material.unit || 'ea';
      return `${material.name}: ${quantity} ${unit}`;
    }).join(', ');
  }

  getDeliveryStatus(takeoffRequest) {
    if (takeoffRequest.status === 'delivered') {
      return 'Delivered';
    } else if (takeoffRequest.status === 'sent') {
      const sentDate = new Date(takeoffRequest.sentAt);
      const daysSinceSent = Math.floor((Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceSent > 7) {
        return 'Overdue';
      } else if (daysSinceSent > 3) {
        return 'Pending';
      } else {
        return 'Recent';
      }
    }
    return 'Unknown';
  }
}

export default new SupplierService();
