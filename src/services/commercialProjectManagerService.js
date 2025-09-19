// Commercial Project Manager Service - Automated email processing for commercial jobs
// Handles schedule changes, material requests, change orders, AIA billing, specs, and submittals

import messageService from './messageService.js';
import webhookService from './webhookService.js';

class CommercialProjectManagerService {
  constructor() {
    this.activeJobs = new Map(); // Track active commercial jobs
    this.emailProcessors = new Map(); // AI processors for different email types
    this.stagedActions = new Map(); // Actions awaiting approval
    this.isInitialized = false;
  }

  // Initialize the service
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🤖 Initializing Commercial Project Manager Service...');
    
    // Start webhook service for incoming emails
    await webhookService.start();
    
    // Register email processors
    this.registerEmailProcessors();
    
    this.isInitialized = true;
    console.log('✅ Commercial Project Manager Service initialized');
  }

  // Register AI processors for different email types
  registerEmailProcessors() {
    // Schedule Change Processor
    this.emailProcessors.set('schedule_change', {
      keywords: ['schedule', 'reschedule', 'move', 'delay', 'postpone', 'earlier', 'later', 'crew', 'team'],
      processor: this.processScheduleChangeEmail.bind(this),
      priority: 'high',
      requiresApproval: true,
      routingTarget: 'scheduler'
    });

    // Material Request Processor
    this.emailProcessors.set('material_request', {
      keywords: ['material', 'supplies', 'delivery', 'order', 'need', 'shortage', 'out of', 'more'],
      processor: this.processMaterialRequestEmail.bind(this),
      priority: 'medium',
      requiresApproval: false,
      routingTarget: 'foreman'
    });

    // Change Order Processor
    this.emailProcessors.set('change_order', {
      keywords: ['change order', 'modification', 'additional work', 'extra', 'add', 'remove', 'scope change'],
      processor: this.processChangeOrderEmail.bind(this),
      priority: 'high',
      requiresApproval: true,
      routingTarget: 'project_manager'
    });

    // AIA Billing Processor
    this.emailProcessors.set('aia_billing', {
      keywords: ['aia', 'billing', 'invoice', 'payment', 'application', 'draw', 'requisition'],
      processor: this.processAiaBillingEmail.bind(this),
      priority: 'high',
      requiresApproval: true,
      routingTarget: 'accounting'
    });

    // Specs/Submittals Processor
    this.emailProcessors.set('specs_submittals', {
      keywords: ['spec', 'specification', 'submittal', 'approval', 'review', 'drawing', 'plan'],
      processor: this.processSpecsSubmittalsEmail.bind(this),
      priority: 'medium',
      requiresApproval: true,
      routingTarget: 'project_manager'
    });
  }

  // Main email processing function
  async processIncomingEmail(emailData) {
    try {
      console.log('📧 Processing incoming email:', emailData.subject);
      
      // Identify the job from email context
      const job = await this.identifyJobFromEmail(emailData);
      if (!job) {
        console.log('❌ Could not identify job from email');
        return { success: false, error: 'Job not identified' };
      }

      // Analyze email intent
      const intent = await this.analyzeEmailIntent(emailData);
      console.log('🎯 Email intent identified:', intent.type);

      // Process based on intent
      const processor = this.emailProcessors.get(intent.type);
      if (!processor) {
        console.log('❌ No processor found for intent:', intent.type);
        return { success: false, error: 'No processor available' };
      }

      // Execute the processor
      const result = await processor.processor(emailData, job, intent);
      
      // Stage action if approval required
      if (processor.requiresApproval) {
        await this.stageActionForApproval(result, job, intent);
      } else {
        // Execute immediately
        await this.executeAction(result, job);
      }

      return { success: true, result, staged: processor.requiresApproval };

    } catch (error) {
      console.error('❌ Error processing email:', error);
      return { success: false, error: error.message };
    }
  }

  // Identify job from email context
  async identifyJobFromEmail(emailData) {
    // In a real implementation, this would use AI to match email content to jobs
    // For now, we'll use simple keyword matching
    
    const emailContent = `${emailData.subject} ${emailData.message}`.toLowerCase();
    
    // Look for job identifiers in email content
    for (const [jobId, job] of this.activeJobs) {
      const jobKeywords = [
        job.jobName.toLowerCase(),
        job.address?.toLowerCase(),
        job.generalContractor?.toLowerCase(),
        job.projectManager?.toLowerCase()
      ].filter(Boolean);

      if (jobKeywords.some(keyword => emailContent.includes(keyword))) {
        return job;
      }
    }

    // Default to first active commercial job for demo
    const commercialJobs = Array.from(this.activeJobs.values())
      .filter(job => job.jobType === 'commercial' && job.status === 'active');
    
    return commercialJobs[0] || null;
  }

  // Analyze email intent using AI-like processing
  async analyzeEmailIntent(emailData) {
    const content = `${emailData.subject} ${emailData.message}`.toLowerCase();
    
    // Score each processor based on keyword matches
    const scores = new Map();
    
    for (const [type, processor] of this.emailProcessors) {
      let score = 0;
      for (const keyword of processor.keywords) {
        if (content.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      scores.set(type, score);
    }

    // Find the highest scoring intent
    let bestIntent = { type: 'unknown', confidence: 0 };
    for (const [type, score] of scores) {
      if (score > bestIntent.confidence) {
        bestIntent = { type, confidence: score };
      }
    }

    return bestIntent;
  }

  // Process schedule change emails
  async processScheduleChangeEmail(emailData, job, intent) {
    console.log('📅 Processing schedule change email for job:', job.jobName);
    
    // Extract schedule information from email
    const scheduleInfo = this.extractScheduleInfo(emailData.message);
    
    return {
      type: 'schedule_change',
      jobId: job.id,
      originalEmail: emailData,
      extractedData: {
        requestedDate: scheduleInfo.date,
        requestedTime: scheduleInfo.time,
        crew: scheduleInfo.crew,
        reason: scheduleInfo.reason,
        urgency: scheduleInfo.urgency
      },
      suggestedAction: {
        action: 'update_schedule',
        details: `Move ${scheduleInfo.crew || 'crew'} to ${scheduleInfo.date} at ${scheduleInfo.time}`,
        conflicts: await this.checkScheduleConflicts(job.id, scheduleInfo)
      },
      stagedResponse: `I've reviewed your schedule change request. ${scheduleInfo.crew || 'The crew'} will be moved to ${scheduleInfo.date} at ${scheduleInfo.time}. Please confirm this works for your timeline.`
    };
  }

  // Process material request emails
  async processMaterialRequestEmail(emailData, job, intent) {
    console.log('📦 Processing material request email for job:', job.jobName);
    
    // Extract material information
    const materialInfo = this.extractMaterialInfo(emailData.message);
    
    return {
      type: 'material_request',
      jobId: job.id,
      originalEmail: emailData,
      extractedData: {
        materials: materialInfo.materials,
        quantities: materialInfo.quantities,
        urgency: materialInfo.urgency,
        deliveryDate: materialInfo.deliveryDate
      },
      suggestedAction: {
        action: 'notify_foreman',
        details: `Material request: ${materialInfo.materials.join(', ')}`,
        priority: materialInfo.urgency
      },
      stagedResponse: `Material request received. Our foreman will review and coordinate delivery. Expected delivery: ${materialInfo.deliveryDate || 'TBD'}.`
    };
  }

  // Process change order emails
  async processChangeOrderEmail(emailData, job, intent) {
    console.log('📋 Processing change order email for job:', job.jobName);
    
    // Extract change order information
    const changeOrderInfo = this.extractChangeOrderInfo(emailData.message);
    
    return {
      type: 'change_order',
      jobId: job.id,
      originalEmail: emailData,
      extractedData: {
        description: changeOrderInfo.description,
        scope: changeOrderInfo.scope,
        estimatedCost: changeOrderInfo.estimatedCost,
        timeline: changeOrderInfo.timeline,
        specifications: changeOrderInfo.specifications
      },
      suggestedAction: {
        action: 'create_change_order',
        details: `Change Order: ${changeOrderInfo.description}`,
        costEstimate: changeOrderInfo.estimatedCost
      },
      stagedResponse: `Change order request received. We're preparing a detailed estimate for: ${changeOrderInfo.description}. Expected cost: ${changeOrderInfo.estimatedCost || 'TBD'}. Will send formal change order for approval.`
    };
  }

  // Process AIA billing emails
  async processAiaBillingEmail(emailData, job, intent) {
    console.log('💰 Processing AIA billing email for job:', job.jobName);
    
    // Extract billing information
    const billingInfo = this.extractBillingInfo(emailData.message);
    
    return {
      type: 'aia_billing',
      jobId: job.id,
      originalEmail: emailData,
      extractedData: {
        applicationNumber: billingInfo.applicationNumber,
        period: billingInfo.period,
        amount: billingInfo.amount,
        retainage: billingInfo.retainage,
        dueDate: billingInfo.dueDate
      },
      suggestedAction: {
        action: 'prepare_aia_application',
        details: `AIA Application #${billingInfo.applicationNumber || 'TBD'}`,
        amount: billingInfo.amount
      },
      stagedResponse: `AIA billing application received. We're preparing Application #${billingInfo.applicationNumber || 'TBD'} for period ${billingInfo.period}. Amount: $${billingInfo.amount || 'TBD'}. Will submit for approval.`
    };
  }

  // Process specs/submittals emails
  async processSpecsSubmittalsEmail(emailData, job, intent) {
    console.log('📄 Processing specs/submittals email for job:', job.jobName);
    
    // Extract specs/submittals information
    const specsInfo = this.extractSpecsInfo(emailData.message);
    
    return {
      type: 'specs_submittals',
      jobId: job.id,
      originalEmail: emailData,
      extractedData: {
        documentType: specsInfo.documentType,
        specification: specsInfo.specification,
        dueDate: specsInfo.dueDate,
        requirements: specsInfo.requirements
      },
      suggestedAction: {
        action: 'prepare_submittal',
        details: `${specsInfo.documentType}: ${specsInfo.specification}`,
        dueDate: specsInfo.dueDate
      },
      stagedResponse: `Submittal request received for ${specsInfo.documentType}: ${specsInfo.specification}. Due date: ${specsInfo.dueDate || 'TBD'}. We're preparing the required documentation.`
    };
  }

  // Extract schedule information from email text
  extractScheduleInfo(message) {
    const text = message.toLowerCase();
    
    // Simple regex patterns for date/time extraction
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week)/i;
    const timePattern = /(\d{1,2}:\d{2}\s*(am|pm)?|\d{1,2}\s*(am|pm)|morning|afternoon|evening)/i;
    const crewPattern = /(crew|team|drywall|framing|finishing|hanging|taping)/i;
    
    return {
      date: message.match(datePattern)?.[0] || 'TBD',
      time: message.match(timePattern)?.[0] || 'TBD',
      crew: message.match(crewPattern)?.[0] || 'crew',
      reason: this.extractReason(message),
      urgency: text.includes('urgent') || text.includes('asap') ? 'high' : 'normal'
    };
  }

  // Extract material information from email text
  extractMaterialInfo(message) {
    const text = message.toLowerCase();
    
    // Common drywall materials
    const materialKeywords = [
      'drywall', 'sheetrock', 'gypsum', '5/8', '1/2', '1/4',
      'corner bead', 'joint compound', 'tape', 'screws', 'nails',
      'insulation', 'channel', 'stud', 'track', 'furring'
    ];
    
    const materials = materialKeywords.filter(keyword => text.includes(keyword));
    
    return {
      materials: materials.length > 0 ? materials : ['materials'],
      quantities: this.extractQuantities(message),
      urgency: text.includes('urgent') || text.includes('asap') ? 'high' : 'normal',
      deliveryDate: this.extractDeliveryDate(message)
    };
  }

  // Extract change order information from email text
  extractChangeOrderInfo(message) {
    const text = message.toLowerCase();
    
    return {
      description: this.extractDescription(message),
      scope: this.extractScope(message),
      estimatedCost: this.extractCost(message),
      timeline: this.extractTimeline(message),
      specifications: this.extractSpecifications(message)
    };
  }

  // Extract billing information from email text
  extractBillingInfo(message) {
    const text = message.toLowerCase();
    
    return {
      applicationNumber: this.extractApplicationNumber(message),
      period: this.extractPeriod(message),
      amount: this.extractAmount(message),
      retainage: this.extractRetainage(message),
      dueDate: this.extractDueDate(message)
    };
  }

  // Extract specs/submittals information from email text
  extractSpecsInfo(message) {
    const text = message.toLowerCase();
    
    return {
      documentType: this.extractDocumentType(message),
      specification: this.extractSpecification(message),
      dueDate: this.extractDueDate(message),
      requirements: this.extractRequirements(message)
    };
  }

  // Helper methods for data extraction
  extractReason(message) {
    const reasons = ['weather', 'delay', 'change', 'issue', 'problem', 'conflict'];
    const found = reasons.find(reason => message.toLowerCase().includes(reason));
    return found || 'schedule adjustment';
  }

  extractQuantities(message) {
    const quantityPattern = /(\d+)\s*(sheets?|pieces?|rolls?|bags?|boxes?|linear ft|sq ft)/gi;
    const matches = [...message.matchAll(quantityPattern)];
    return matches.map(match => `${match[1]} ${match[2]}`);
  }

  extractDescription(message) {
    // Look for description after common phrases
    const patterns = [
      /add\s+(.+?)(?:\.|$)/i,
      /change\s+(.+?)(?:\.|$)/i,
      /modify\s+(.+?)(?:\.|$)/i,
      /additional\s+(.+?)(?:\.|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'Additional work requested';
  }

  extractScope(message) {
    const scopeKeywords = ['wall', 'ceiling', 'room', 'area', 'floor', 'section'];
    const found = scopeKeywords.find(keyword => message.toLowerCase().includes(keyword));
    return found || 'project area';
  }

  extractCost(message) {
    const costPattern = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/;
    const match = message.match(costPattern);
    return match ? match[1] : null;
  }

  extractTimeline(message) {
    const timelineKeywords = ['days', 'weeks', 'immediately', 'asap', 'urgent'];
    const found = timelineKeywords.find(keyword => message.toLowerCase().includes(keyword));
    return found || 'standard timeline';
  }

  extractSpecifications(message) {
    const specKeywords = ['spec', 'specification', 'detail', 'requirement', 'standard'];
    const found = specKeywords.find(keyword => message.toLowerCase().includes(keyword));
    return found ? 'specifications provided' : 'standard specifications';
  }

  extractApplicationNumber(message) {
    const appPattern = /(?:application|app)\s*#?(\d+)/i;
    const match = message.match(appPattern);
    return match ? match[1] : null;
  }

  extractPeriod(message) {
    const periodPattern = /(?:period|month|week)\s*(\d+)/i;
    const match = message.match(periodPattern);
    return match ? match[1] : 'current period';
  }

  extractAmount(message) {
    const amountPattern = /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/;
    const match = message.match(amountPattern);
    return match ? match[1] : null;
  }

  extractRetainage(message) {
    const retainagePattern = /(\d+(?:\.\d+)?)\s*%?\s*retainage/i;
    const match = message.match(retainagePattern);
    return match ? match[1] : null;
  }

  extractDueDate(message) {
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})/;
    const match = message.match(datePattern);
    return match ? match[1] : null;
  }

  extractDocumentType(message) {
    const docTypes = ['submittal', 'specification', 'drawing', 'plan', 'detail'];
    const found = docTypes.find(type => message.toLowerCase().includes(type));
    return found || 'document';
  }

  extractSpecification(message) {
    const specPattern = /(?:spec|specification)\s*(\d+)/i;
    const match = message.match(specPattern);
    return match ? match[1] : 'specification';
  }

  extractRequirements(message) {
    const reqKeywords = ['required', 'must', 'shall', 'need'];
    const found = reqKeywords.find(keyword => message.toLowerCase().includes(keyword));
    return found ? 'requirements specified' : 'standard requirements';
  }

  extractDeliveryDate(message) {
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}|tomorrow|next week)/i;
    const match = message.match(datePattern);
    return match ? match[1] : null;
  }

  // Check for schedule conflicts
  async checkScheduleConflicts(jobId, scheduleInfo) {
    // In a real implementation, this would check against the actual schedule
    // For now, return mock conflicts
    return [];
  }

  // Stage action for approval
  async stageActionForApproval(action, job, intent) {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stagedAction = {
      id: actionId,
      type: action.type,
      jobId: job.id,
      jobName: job.jobName,
      originalEmail: action.originalEmail,
      extractedData: action.extractedData,
      suggestedAction: action.suggestedAction,
      stagedResponse: action.stagedResponse,
      intent: intent,
      timestamp: new Date().toISOString(),
      status: 'pending_approval',
      priority: this.emailProcessors.get(intent.type)?.priority || 'medium'
    };

    this.stagedActions.set(actionId, stagedAction);
    
    console.log('⏳ Action staged for approval:', actionId);
    
    // Notify relevant parties
    await this.notifyStagedAction(stagedAction);
    
    return actionId;
  }

  // Execute action immediately
  async executeAction(action, job) {
    console.log('⚡ Executing action immediately:', action.type);
    
    // Send response to original sender
    if (action.stagedResponse) {
      await this.sendResponse(action.originalEmail.from, action.stagedResponse, job);
    }
    
    // Execute the suggested action
    await this.performAction(action.suggestedAction, job);
  }

  // Notify about staged action
  async notifyStagedAction(stagedAction) {
    const processor = this.emailProcessors.get(stagedAction.intent.type);
    const routingTarget = processor?.routingTarget || 'project_manager';
    
    console.log(`📢 Notifying ${routingTarget} about staged action:`, stagedAction.id);
    
    // In a real implementation, this would send notifications to the appropriate team members
    // For now, we'll just log the notification
  }

  // Send response to original sender
  async sendResponse(recipient, message, job) {
    try {
      const result = await messageService.sendEmail(
        recipient,
        `Re: ${job.jobName} - Automated Response`,
        message,
        { jobName: job.jobName, jobId: job.id }
      );
      
      console.log('📧 Response sent:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to send response:', error);
      return { success: false, error: error.message };
    }
  }

  // Perform the suggested action
  async performAction(suggestedAction, job) {
    console.log('🔧 Performing action:', suggestedAction.action);
    
    switch (suggestedAction.action) {
      case 'update_schedule':
        // In a real implementation, this would update the actual schedule
        console.log('📅 Schedule update would be performed here');
        break;
        
      case 'notify_foreman':
        // In a real implementation, this would notify the foreman
        console.log('👷 Foreman notification would be sent here');
        break;
        
      case 'create_change_order':
        // In a real implementation, this would create a change order
        console.log('📋 Change order would be created here');
        break;
        
      case 'prepare_aia_application':
        // In a real implementation, this would prepare AIA billing
        console.log('💰 AIA application would be prepared here');
        break;
        
      case 'prepare_submittal':
        // In a real implementation, this would prepare submittals
        console.log('📄 Submittal would be prepared here');
        break;
        
      default:
        console.log('❓ Unknown action type:', suggestedAction.action);
    }
  }

  // Register a commercial job for monitoring
  registerJob(job) {
    if (job.jobType === 'commercial' && job.status === 'active') {
      this.activeJobs.set(job.id, job);
      console.log('📝 Registered commercial job for monitoring:', job.jobName);
    }
  }

  // Unregister a job
  unregisterJob(jobId) {
    this.activeJobs.delete(jobId);
    console.log('🗑️ Unregistered job:', jobId);
  }

  // Get staged actions awaiting approval
  getStagedActions() {
    return Array.from(this.stagedActions.values());
  }

  // Approve a staged action
  async approveStagedAction(actionId) {
    const stagedAction = this.stagedActions.get(actionId);
    if (!stagedAction) {
      throw new Error('Staged action not found');
    }

    // Execute the action
    await this.executeAction(stagedAction, { id: stagedAction.jobId, jobName: stagedAction.jobName });
    
    // Remove from staged actions
    this.stagedActions.delete(actionId);
    
    console.log('✅ Staged action approved and executed:', actionId);
    return { success: true };
  }

  // Reject a staged action
  async rejectStagedAction(actionId, reason) {
    const stagedAction = this.stagedActions.get(actionId);
    if (!stagedAction) {
      throw new Error('Staged action not found');
    }

    // Send rejection response
    const rejectionMessage = `Thank you for your request. After review, we're unable to proceed with this change. Reason: ${reason}`;
    await this.sendResponse(stagedAction.originalEmail.from, rejectionMessage, { id: stagedAction.jobId, jobName: stagedAction.jobName });
    
    // Remove from staged actions
    this.stagedActions.delete(actionId);
    
    console.log('❌ Staged action rejected:', actionId);
    return { success: true };
  }

  // Get service status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      activeJobs: this.activeJobs.size,
      stagedActions: this.stagedActions.size,
      processors: this.emailProcessors.size
    };
  }
}

// Create singleton instance
const commercialProjectManagerService = new CommercialProjectManagerService();

export default commercialProjectManagerService;

