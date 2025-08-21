// Webhook Service - Handles incoming SMS and Email responses
// Mock implementation for testing, ready for real webhook integration

class WebhookService {
  constructor() {
    this.webhookEndpoints = {
      sms: '/api/webhooks/sms',
      email: '/api/webhooks/email'
    };
    this.messageHandlers = new Map();
    this.isRunning = false;
  }

  // Start the webhook service (mock implementation)
  async start() {
    if (this.isRunning) return;
    
    console.log('🔄 Starting webhook service...');
    this.isRunning = true;
    
    // In a real implementation, this would start an Express server
    // For now, we'll simulate webhook calls
    this.simulateWebhookServer();
  }

  // Stop the webhook service
  async stop() {
    console.log('🛑 Stopping webhook service...');
    this.isRunning = false;
  }

  // Register a handler for incoming messages
  registerHandler(jobId, handler) {
    this.messageHandlers.set(jobId, handler);
    console.log(`📝 Registered message handler for job: ${jobId}`);
  }

  // Remove a handler
  unregisterHandler(jobId) {
    this.messageHandlers.delete(jobId);
    console.log(`🗑️ Removed message handler for job: ${jobId}`);
  }

  // Process incoming SMS (Twilio webhook format)
  async processSMSWebhook(webhookData) {
    console.log('📱 Processing SMS webhook:', webhookData);
    
    const {
      From: fromPhone,
      To: toPhone,
      Body: message,
      MessageSid: messageId,
      Timestamp: timestamp
    } = webhookData;

    const incomingMessage = {
      id: `inbound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'sms',
      from: fromPhone,
      to: toPhone,
      message: message,
      messageId: messageId,
      timestamp: timestamp || new Date().toISOString(),
      direction: 'inbound',
      status: 'received'
    };

    await this.routeMessage(incomingMessage);
    return { success: true, messageId: incomingMessage.id };
  }

  // Process incoming email (SendGrid webhook format)
  async processEmailWebhook(webhookData) {
    console.log('📧 Processing email webhook:', webhookData);
    
    const {
      from: fromEmail,
      to: toEmail,
      subject: subject,
      text: messageText,
      html: messageHtml,
      messageId,
      timestamp
    } = webhookData;

    const incomingMessage = {
      id: `inbound_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'email',
      from: fromEmail,
      to: toEmail,
      subject: subject,
      message: messageText || messageHtml,
      messageId: messageId,
      timestamp: timestamp || new Date().toISOString(),
      direction: 'inbound',
      status: 'received'
    };

    await this.routeMessage(incomingMessage);
    return { success: true, messageId: incomingMessage.id };
  }

  // Route incoming message to appropriate job handler
  async routeMessage(incomingMessage) {
    // In a real implementation, you'd look up the job based on the phone/email
    // For now, we'll simulate routing to all registered handlers
    
    for (const [jobId, handler] of this.messageHandlers) {
      try {
        await handler(incomingMessage);
        console.log(`✅ Routed message to job ${jobId}`);
      } catch (error) {
        console.error(`❌ Error routing message to job ${jobId}:`, error);
      }
    }
  }

  // Simulate webhook server for testing
  simulateWebhookServer() {
    console.log('🖥️ Mock webhook server running on:', this.webhookEndpoints);
    console.log('📋 To test, use the simulateIncomingMessage() method');
  }

  // Simulate an incoming SMS message (for testing)
  async simulateIncomingSMS(fromPhone, message, jobContext = {}) {
    const mockWebhookData = {
      From: fromPhone,
      To: '+1234567890', // Your Twilio number
      Body: message,
      MessageSid: `SM${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      Timestamp: new Date().toISOString()
    };

    console.log('🧪 Simulating incoming SMS:', mockWebhookData);
    return await this.processSMSWebhook(mockWebhookData);
  }

  // Simulate an incoming email message (for testing)
  async simulateIncomingEmail(fromEmail, subject, message, jobContext = {}) {
    const mockWebhookData = {
      from: fromEmail,
      to: 'messages@yourcompany.com',
      subject: subject,
      text: message,
      html: message.replace(/\n/g, '<br>'),
      messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    console.log('🧪 Simulating incoming email:', mockWebhookData);
    return await this.processEmailWebhook(mockWebhookData);
  }

  // Get webhook endpoints for configuration
  getWebhookEndpoints() {
    return {
      sms: `${window.location.origin}${this.webhookEndpoints.sms}`,
      email: `${window.location.origin}${this.webhookEndpoints.email}`
    };
  }

  // Validate webhook signature (for security)
  validateWebhookSignature(payload, signature, secret) {
    // In a real implementation, you'd validate the webhook signature
    // For now, we'll return true for testing
    console.log('🔐 Webhook signature validation (mock):', { payload, signature, secret });
    return true;
  }
}

// Create singleton instance
const webhookService = new WebhookService();

export default webhookService;

// Example usage for testing:
/*
// Start the webhook service
await webhookService.start();

// Register a handler for a specific job
webhookService.registerHandler('job-123', async (incomingMessage) => {
  console.log('Received message for job-123:', incomingMessage);
  // Store the message, update UI, etc.
});

// Simulate incoming messages for testing
await webhookService.simulateIncomingSMS('+1234567890', 'Got it, will be there at 8 AM');
await webhookService.simulateIncomingEmail('worker@example.com', 'Re: Job Update', 'Materials received, starting work now');
*/ 