// QuickBooks Queue Service for handling failed operations
class QuickBooksQueueService {
  constructor() {
    this.queueKey = 'quickbooks_operation_queue';
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  // Add operation to queue
  addToQueue(operation) {
    const queue = this.getQueue();
    const queueItem = {
      id: this.generateId(),
      operation,
      status: 'pending',
      retries: 0,
      createdAt: new Date().toISOString(),
      lastAttempt: null,
      error: null
    };

    queue.push(queueItem);
    this.saveQueue(queue);
    return queueItem.id;
  }

  // Get all queued operations
  getQueue() {
    try {
      const queueData = localStorage.getItem(this.queueKey);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('Error reading queue from localStorage:', error);
      return [];
    }
  }

  // Save queue to localStorage
  saveQueue(queue) {
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving queue to localStorage:', error);
    }
  }

  // Get pending operations
  getPendingOperations() {
    const queue = this.getQueue();
    return queue.filter(item => item.status === 'pending');
  }

  // Get failed operations
  getFailedOperations() {
    const queue = this.getQueue();
    return queue.filter(item => item.status === 'failed');
  }

  // Mark operation as completed
  markCompleted(operationId) {
    const queue = this.getQueue();
    const itemIndex = queue.findIndex(item => item.id === operationId);
    
    if (itemIndex !== -1) {
      queue[itemIndex].status = 'completed';
      queue[itemIndex].completedAt = new Date().toISOString();
      this.saveQueue(queue);
    }
  }

  // Mark operation as failed
  markFailed(operationId, error) {
    const queue = this.getQueue();
    const itemIndex = queue.findIndex(item => item.id === operationId);
    
    if (itemIndex !== -1) {
      const item = queue[itemIndex];
      item.retries += 1;
      item.lastAttempt = new Date().toISOString();
      item.error = error.message || error;

      if (item.retries >= this.maxRetries) {
        item.status = 'failed';
      } else {
        item.status = 'pending'; // Will retry
      }

      this.saveQueue(queue);
    }
  }

  // Retry failed operations
  async retryFailedOperations(quickbooksService) {
    const pendingOperations = this.getPendingOperations();
    const results = [];

    for (const item of pendingOperations) {
      try {
        console.log(`Retrying QuickBooks operation: ${item.operation.type}`, item.operation);
        
        let result;
        switch (item.operation.type) {
          case 'createCustomer':
            result = await quickbooksService.createCustomer(item.operation.data);
            break;
          case 'createProject':
            result = await quickbooksService.createProject(
              item.operation.data.customerId,
              item.operation.data.projectName,
              item.operation.data.description
            );
            break;
          case 'createEstimate':
            result = await quickbooksService.createEstimate(
              item.operation.data.customerId,
              item.operation.data.projectId,
              item.operation.data.estimateData
            );
            break;
          case 'addChangeOrder':
            result = await quickbooksService.addChangeOrderToEstimate(
              item.operation.data.estimateId,
              item.operation.data.changeOrder
            );
            break;
          case 'convertToInvoice':
            result = await quickbooksService.convertEstimateToInvoice(item.operation.data.estimateId);
            break;
          case 'sendInvoice':
            result = await quickbooksService.sendInvoice(item.operation.data.invoiceId);
            break;
          default:
            throw new Error(`Unknown operation type: ${item.operation.type}`);
        }

        this.markCompleted(item.id);
        results.push({
          id: item.id,
          success: true,
          result
        });

      } catch (error) {
        console.error(`QuickBooks operation failed: ${item.operation.type}`, error);
        this.markFailed(item.id, error);
        results.push({
          id: item.id,
          success: false,
          error: error.message
        });
      }

      // Add delay between retries to avoid rate limiting
      await this.delay(this.retryDelay);
    }

    return results;
  }

  // Clear completed operations (older than 30 days)
  clearOldCompletedOperations() {
    const queue = this.getQueue();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filteredQueue = queue.filter(item => {
      if (item.status === 'completed' && item.completedAt) {
        return new Date(item.completedAt) > thirtyDaysAgo;
      }
      return true; // Keep pending and failed items
    });

    this.saveQueue(filteredQueue);
  }

  // Clear specific operation
  clearOperation(operationId) {
    const queue = this.getQueue();
    const filteredQueue = queue.filter(item => item.id !== operationId);
    this.saveQueue(filteredQueue);
  }

  // Clear all operations
  clearAllOperations() {
    this.saveQueue([]);
  }

  // Get queue statistics
  getQueueStats() {
    const queue = this.getQueue();
    return {
      total: queue.length,
      pending: queue.filter(item => item.status === 'pending').length,
      completed: queue.filter(item => item.status === 'completed').length,
      failed: queue.filter(item => item.status === 'failed').length
    };
  }

  // Utility methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get human-readable operation description
  getOperationDescription(operation) {
    switch (operation.type) {
      case 'createCustomer':
        return `Create customer: ${operation.data.name}`;
      case 'createProject':
        return `Create project: ${operation.data.projectName}`;
      case 'createEstimate':
        return `Create estimate for project: ${operation.data.estimateData.projectName}`;
      case 'addChangeOrder':
        return `Add change order: ${operation.data.changeOrder.title}`;
      case 'convertToInvoice':
        return 'Convert estimate to invoice';
      case 'sendInvoice':
        return 'Send invoice to customer';
      default:
        return `Unknown operation: ${operation.type}`;
    }
  }
}

// Create singleton instance
const quickbooksQueueService = new QuickBooksQueueService();

export default quickbooksQueueService;
