# Messaging Feature Documentation

## Overview

The messaging feature allows internal users (project managers, schedulers) to send short messages via SMS and/or email to employees, subcontractors, and vendors associated with a job.

## Features

### ✅ Implemented
- **Message Composer UI**: Compose messages and select recipients
- **Recipient Selection**: Choose from employees, subcontractors, vendors
- **Delivery Methods**: SMS, Email, or both
- **Message History**: View sent messages with details
- **Mock Services**: Simulated SMS/email sending for testing
- **Local Storage**: Messages are persisted locally

### 🔄 Future Enhancements
- Real Twilio SMS integration
- Real SendGrid email integration
- Inbound message handling (replies)
- Message templates
- Delivery status tracking
- Message analytics

## Components

### 1. MessageComposer (`src/components/MessageComposer.jsx`)
- Recipient selection with filtering
- Message composition with character limit
- Delivery method selection
- Form validation and error handling

### 2. MessageLog (`src/components/MessageLog.jsx`)
- Displays message history
- Expandable message details
- Sorting options (newest/oldest)
- Message statistics

### 3. MessagesSection (`src/components/MessagesSection.jsx`)
- Combines composer and log
- Collapsible interface
- Message count indicators

### 4. MessageService (`src/services/messageService.js`)
- Handles SMS and email sending
- Mock implementations ready for real services
- Message validation and error handling

## Usage

### Sending a Message
1. Navigate to Job Details page
2. Expand the "Messages" section
3. Select recipients (employees, subcontractors, vendors)
4. Choose delivery method (SMS, Email, or both)
5. Compose your message (max 500 characters)
6. Click "Send Message"

### Viewing Message History
1. In the Messages section, scroll down to "Message History"
2. Click on any message to expand details
3. View recipients, delivery method, and timestamp
4. Sort by newest or oldest messages

## Data Structure

### Message Object
```javascript
{
  id: "msg_1234567890_abc123",
  jobId: "job-123",
  sender: "Current User",
  recipients: [
    {
      id: "emp-123",
      name: "John Doe",
      type: "employee",
      phone: "+1234567890",
      email: "john@example.com"
    }
  ],
  message: "Please arrive at 8 AM tomorrow",
  deliveryMethod: "both", // "sms", "email", "both"
  timestamp: "2024-01-15T10:30:00.000Z",
  status: "sent"
}
```

### Storage
Messages are stored in localStorage under the key `jobMessages`:
```javascript
{
  "job-123": [message1, message2, ...],
  "job-456": [message3, message4, ...]
}
```

## Integration with Real Services

### Twilio SMS Integration

1. Install Twilio SDK:
```bash
npm install twilio
```

2. Update `src/services/messageService.js`:
```javascript
import twilio from 'twilio';

// In the initialize method:
async initializeTwilio(accountSid, authToken, phoneNumber) {
  this.smsProvider = twilio(accountSid, authToken);
  this.twilioPhoneNumber = phoneNumber;
}

// Replace mock sendSMS with:
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
```

### SendGrid Email Integration

1. Install SendGrid SDK:
```bash
npm install @sendgrid/mail
```

2. Update `src/services/messageService.js`:
```javascript
import sgMail from '@sendgrid/mail';

// In the initialize method:
async initializeSendGrid(apiKey) {
  sgMail.setApiKey(apiKey);
  this.emailProvider = sgMail;
}

// Replace mock sendEmail with:
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
```

## Configuration

### Environment Variables
Add these to your `.env` file:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid Configuration
SENDGRID_API_KEY=your_api_key
FROM_EMAIL=your-verified-sender@yourdomain.com
```

### Initialize Services
In your app initialization:
```javascript
import messageService from '@/services/messageService';

// Initialize with your API keys
await messageService.initialize({
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.FROM_EMAIL
});
```

## Future Enhancements

### 1. Inbound Message Handling
- Set up webhook endpoints for SMS replies (Twilio)
- Set up webhook endpoints for email replies (SendGrid)
- Store and display reply messages
- Link replies to original messages

### 2. Message Templates
- Pre-defined message templates
- Template variables (job name, date, time)
- Quick-send template messages

### 3. Delivery Status Tracking
- Real-time delivery status updates
- Failed delivery notifications
- Retry mechanisms for failed messages

### 4. Analytics and Reporting
- Message delivery rates
- Response time tracking
- Usage statistics
- Cost tracking (SMS/email costs)

### 5. Advanced Features
- Message scheduling
- Bulk messaging
- Message approval workflows
- Integration with job schedules

## Testing

### Mock Mode
The current implementation uses mock services that:
- Simulate API delays
- Log messages to console
- Store messages in localStorage
- Provide realistic success/failure responses

### Testing Checklist
- [ ] Send message to employees
- [ ] Send message to subcontractors
- [ ] Send message to vendors
- [ ] Test SMS-only delivery
- [ ] Test email-only delivery
- [ ] Test both SMS and email
- [ ] Verify message history
- [ ] Test recipient filtering
- [ ] Test message validation
- [ ] Test error handling

## Security Considerations

1. **API Key Protection**: Store API keys in environment variables
2. **Phone Number Validation**: Validate phone numbers before sending
3. **Email Validation**: Validate email addresses before sending
4. **Rate Limiting**: Implement rate limiting for message sending
5. **User Permissions**: Ensure only authorized users can send messages
6. **Message Content**: Consider content filtering for inappropriate messages

## Troubleshooting

### Common Issues

1. **Messages not sending**: Check console for error messages
2. **Recipients not showing**: Verify employee/subcontractor/vendor data
3. **Message history not loading**: Check localStorage for data corruption
4. **Service not configured**: Ensure message service is initialized

### Debug Mode
Enable debug logging in the message service:
```javascript
// Add to messageService.js
this.debugMode = true;

// Use throughout the service
if (this.debugMode) {
  console.log('Debug:', message);
}
``` 