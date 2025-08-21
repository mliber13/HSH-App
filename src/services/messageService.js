// Message Service - Handles SMS and Email sending
// Currently uses mock services, ready for Twilio/SendGrid integration

class MessageService {
  constructor() {
    this.smsProvider = null; // Will be Twilio client
    this.emailProvider = null; // Will be SendGrid client
    this.isConfigured = false;
  }

  // Initialize the service with API keys
  async initialize(config = {}) {
    const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber, sendGridApiKey, fromEmail } = config;
    
    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      // TODO: Initialize Twilio client
      // this.smsProvider = new twilio(twilioAccountSid, twilioAuthToken);
      console.log('📱 SMS provider configured (mock)');
    }
    
    if (sendGridApiKey && fromEmail) {
      // TODO: Initialize SendGrid client
      // this.emailProvider = sgMail.setApiKey(sendGridApiKey);
      console.log('📧 Email provider configured (mock)');
    }
    
    this.isConfigured = true;
  }

  // Send SMS message
  async sendSMS(to, message, jobContext = {}) {
    if (!this.isConfigured) {
      console.warn('Message service not configured, using mock SMS');
    }

    try {
      // Mock SMS sending - replace with real Twilio call
      const mockSMS = {
        to,
        message,
        jobContext,
        timestamp: new Date().toISOString(),
        status: 'sent',
        provider: 'mock-twilio',
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      console.log('📱 Mock SMS sent:', {
        to,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        jobContext: jobContext.jobName || 'Unknown Job'
      });

      return {
        success: true,
        messageId: mockSMS.messageId,
        status: 'sent',
        provider: 'mock-twilio'
      };

    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  // Send email message
  async sendEmail(to, subject, body, jobContext = {}) {
    if (!this.isConfigured) {
      console.warn('Message service not configured, using mock email');
    }

    try {
      // Mock email sending - replace with real SendGrid call
      const mockEmail = {
        to,
        subject,
        body,
        jobContext,
        timestamp: new Date().toISOString(),
        status: 'sent',
        provider: 'mock-sendgrid',
        messageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

      console.log('📧 Mock email sent:', {
        to,
        subject,
        bodyLength: body.length,
        jobContext: jobContext.jobName || 'Unknown Job'
      });

      return {
        success: true,
        messageId: mockEmail.messageId,
        status: 'sent',
        provider: 'mock-sendgrid'
      };

    } catch (error) {
      console.error('Email sending failed:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  // Send message via multiple channels
  async sendMessage(messageData) {
    const { recipients, message, deliveryMethod, jobContext } = messageData;
    const results = {
      sms: { sent: [], failed: [] },
      email: { sent: [], failed: [] },
      totalRecipients: recipients.length
    };

    // Send SMS if requested
    if (deliveryMethod === 'sms' || deliveryMethod === 'both') {
      for (const recipient of recipients) {
        if (recipient.phone) {
          const smsResult = await this.sendSMS(recipient.phone, message, jobContext);
          if (smsResult.success) {
            results.sms.sent.push({ recipient, messageId: smsResult.messageId });
          } else {
            results.sms.failed.push({ recipient, error: smsResult.error });
          }
        } else {
          results.sms.failed.push({ recipient, error: 'No phone number available' });
        }
      }
    }

    // Send email if requested
    if (deliveryMethod === 'email' || deliveryMethod === 'both') {
      for (const recipient of recipients) {
        if (recipient.email) {
          const subject = `Message from ${jobContext.jobName || 'Construction Project'}`;
          const emailResult = await this.sendEmail(recipient.email, subject, message, jobContext);
          if (emailResult.success) {
            results.email.sent.push({ recipient, messageId: emailResult.messageId });
          } else {
            results.email.failed.push({ recipient, error: emailResult.error });
          }
        } else {
          results.email.failed.push({ recipient, error: 'No email address available' });
        }
      }
    }

    return results;
  }

  // Validate phone number format (basic validation)
  validatePhoneNumber(phone) {
    if (!phone) return false;
    
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    
    // US phone numbers should be 10 or 11 digits
    return digitsOnly.length === 10 || digitsOnly.length === 11;
  }

  // Validate email format (basic validation)
  validateEmail(email) {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get delivery status (mock implementation)
  async getDeliveryStatus(messageId) {
    // Simulate checking delivery status
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const statuses = ['delivered', 'sent', 'failed', 'pending'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      messageId,
      status: randomStatus,
      timestamp: new Date().toISOString(),
      details: `Mock status: ${randomStatus}`
    };
  }

  // Get message statistics
  getMessageStats() {
    return {
      totalSent: 0, // TODO: Track real statistics
      smsSent: 0,
      emailSent: 0,
      deliveryRate: 0.95, // Mock 95% delivery rate
      averageResponseTime: 120 // Mock 2 minutes average response time
    };
  }
}

// Create singleton instance
const messageService = new MessageService();

export default messageService;

// Future integration examples:

/*
// Twilio Integration Example:
import twilio from 'twilio';

async initializeTwilio(accountSid, authToken, phoneNumber) {
  this.smsProvider = twilio(accountSid, authToken);
  this.twilioPhoneNumber = phoneNumber;
}

async sendSMSWithTwilio(to, message) {
  try {
    const result = await this.smsProvider.messages.create({
      body: message,
      from: this.twilioPhoneNumber,
      to: to
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// SendGrid Integration Example:
import sgMail from '@sendgrid/mail';

async initializeSendGrid(apiKey) {
  sgMail.setApiKey(apiKey);
  this.emailProvider = sgMail;
}

async sendEmailWithSendGrid(to, subject, body) {
  try {
    const msg = {
      to: to,
      from: 'your-verified-sender@yourdomain.com',
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    };
    
    const result = await this.emailProvider.send(msg);
    return { success: true, messageId: result[0].headers['x-message-id'] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
*/ 