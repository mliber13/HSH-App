import quickbooksService from './quickbooksService';
import quickbooksQueueService from './quickbooksQueueService';

// Main QuickBooks Integration Service
class QuickBooksIntegrationService {
  constructor() {
    this.isProcessingQueue = false;
  }

  // Initialize QuickBooks project when job is activated
  async initializeJobInQuickBooks(job) {
    try {
      console.log('Initializing job in QuickBooks:', job.jobName);

      // Step 1: Find or create customer
      const customer = await this.findOrCreateCustomer(job.generalContractor);
      
      // Step 2: Create project
      const project = await this.createProject(customer.Id, job.jobName, job.address);
      
      // Step 3: Create estimate
      const estimateData = {
        jobId: job.id,
        projectName: job.jobName,
        totalEstimate: job.financials?.estimate?.totalEstimateAmount || 0
      };
      
      const estimate = await this.createEstimate(customer.Id, project.Id, estimateData);

      // Store QuickBooks IDs in job data
      const updatedJob = {
        ...job,
        quickbooks: {
          customerId: customer.Id,
          projectId: project.Id,
          estimateId: estimate.Id,
          lastSync: new Date().toISOString()
        }
      };

      return {
        success: true,
        job: updatedJob,
        quickbooksData: {
          customer,
          project,
          estimate
        }
      };

    } catch (error) {
      console.error('Failed to initialize job in QuickBooks:', error);
      
      // Add to queue for retry
      const operationId = quickbooksQueueService.addToQueue({
        type: 'initializeJob',
        data: { job }
      });

      return {
        success: false,
        error: error.message,
        operationId,
        message: 'Operation queued for retry'
      };
    }
  }

  // Find or create customer in QuickBooks
  async findOrCreateCustomer(customerName) {
    try {
      // First try to find existing customer
      let customer = await quickbooksService.findCustomer(customerName);
      
      if (!customer) {
        // Create new customer if not found
        const customerData = {
          name: customerName,
          // Add more customer data if available
        };
        
        customer = await quickbooksService.createCustomer(customerData);
      }

      return customer;
    } catch (error) {
      console.error('Error finding/creating customer:', error);
      
      // Add to queue for retry
      quickbooksQueueService.addToQueue({
        type: 'createCustomer',
        data: { name: customerName }
      });

      throw error;
    }
  }

  // Create project in QuickBooks
  async createProject(customerId, projectName, description = '') {
    try {
      return await quickbooksService.createProject(customerId, projectName, description);
    } catch (error) {
      console.error('Error creating project:', error);
      
      quickbooksQueueService.addToQueue({
        type: 'createProject',
        data: { customerId, projectName, description }
      });

      throw error;
    }
  }

  // Create estimate in QuickBooks
  async createEstimate(customerId, projectId, estimateData) {
    try {
      return await quickbooksService.createEstimate(customerId, projectId, estimateData);
    } catch (error) {
      console.error('Error creating estimate:', error);
      
      quickbooksQueueService.addToQueue({
        type: 'createEstimate',
        data: { customerId, projectId, estimateData }
      });

      throw error;
    }
  }

  // Add change order to QuickBooks estimate
  async addChangeOrderToQuickBooks(job, changeOrder) {
    try {
      if (!job.quickbooks?.estimateId) {
        throw new Error('Job not initialized in QuickBooks');
      }

      const result = await quickbooksService.addChangeOrderToEstimate(
        job.quickbooks.estimateId,
        changeOrder
      );

      return {
        success: true,
        result
      };

    } catch (error) {
      console.error('Error adding change order to QuickBooks:', error);
      
      quickbooksQueueService.addToQueue({
        type: 'addChangeOrder',
        data: {
          estimateId: job.quickbooks?.estimateId,
          changeOrder
        }
      });

      return {
        success: false,
        error: error.message,
        message: 'Change order queued for retry'
      };
    }
  }

  // Convert estimate to invoice and send
  async sendInvoiceFromQuickBooks(job) {
    try {
      if (!job.quickbooks?.estimateId) {
        throw new Error('Job not initialized in QuickBooks');
      }

      // Step 1: Convert estimate to invoice
      const invoice = await quickbooksService.convertEstimateToInvoice(job.quickbooks.estimateId);
      
      // Step 2: Send invoice
      const sentInvoice = await quickbooksService.sendInvoice(invoice.Id);

      // Update job with invoice ID
      const updatedJob = {
        ...job,
        quickbooks: {
          ...job.quickbooks,
          invoiceId: invoice.Id,
          invoiceSentAt: new Date().toISOString()
        }
      };

      return {
        success: true,
        job: updatedJob,
        invoice: sentInvoice
      };

    } catch (error) {
      console.error('Error sending invoice from QuickBooks:', error);
      
      quickbooksQueueService.addToQueue({
        type: 'convertToInvoice',
        data: { estimateId: job.quickbooks?.estimateId }
      });

      return {
        success: false,
        error: error.message,
        message: 'Invoice queued for retry'
      };
    }
  }

  // Process queued operations
  async processQueue() {
    if (this.isProcessingQueue) {
      console.log('Queue processing already in progress');
      return;
    }

    this.isProcessingQueue = true;

    try {
      const results = await quickbooksQueueService.retryFailedOperations(quickbooksService);
      
      // Clear old completed operations
      quickbooksQueueService.clearOldCompletedOperations();

      return results;
    } catch (error) {
      console.error('Error processing queue:', error);
      throw error;
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Test QuickBooks connection
  async testConnection() {
    try {
      const result = await quickbooksService.testConnection();
      
      if (result.success) {
        // Also process any pending queue items
        await this.processQueue();
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get queue status
  getQueueStatus() {
    const stats = quickbooksQueueService.getQueueStats();
    const pendingOperations = quickbooksQueueService.getPendingOperations();
    const failedOperations = quickbooksQueueService.getFailedOperations();

    return {
      stats,
      pendingOperations: pendingOperations.map(item => ({
        id: item.id,
        description: quickbooksQueueService.getOperationDescription(item.operation),
        retries: item.retries,
        createdAt: item.createdAt,
        lastAttempt: item.lastAttempt
      })),
      failedOperations: failedOperations.map(item => ({
        id: item.id,
        description: quickbooksQueueService.getOperationDescription(item.operation),
        error: item.error,
        createdAt: item.createdAt,
        lastAttempt: item.lastAttempt
      }))
    };
  }

  // Clear specific operation from queue
  clearOperation(operationId) {
    quickbooksQueueService.clearOperation(operationId);
  }

  // Clear all operations from queue
  clearAllOperations() {
    quickbooksQueueService.clearAllOperations();
  }

  // Check if job is synced with QuickBooks
  isJobSynced(job) {
    return !!(job.quickbooks?.customerId && job.quickbooks?.projectId && job.quickbooks?.estimateId);
  }

  // Get QuickBooks sync status for job
  getJobSyncStatus(job) {
    if (!job.quickbooks) {
      return {
        synced: false,
        status: 'Not initialized',
        message: 'Job not yet synced with QuickBooks'
      };
    }

    const missing = [];
    if (!job.quickbooks.customerId) missing.push('customer');
    if (!job.quickbooks.projectId) missing.push('project');
    if (!job.quickbooks.estimateId) missing.push('estimate');

    if (missing.length > 0) {
      return {
        synced: false,
        status: 'Partially synced',
        message: `Missing: ${missing.join(', ')}`
      };
    }

    return {
      synced: true,
      status: 'Fully synced',
      message: `Last synced: ${new Date(job.quickbooks.lastSync).toLocaleDateString()}`,
      hasInvoice: !!job.quickbooks.invoiceId
    };
  }
}

// Create singleton instance
const quickbooksIntegrationService = new QuickBooksIntegrationService();

export default quickbooksIntegrationService;
