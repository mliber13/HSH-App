# QuickBooks Online Integration Setup Guide

## Overview
This integration allows you to automatically sync jobs, estimates, and invoices with QuickBooks Online. When a job is activated, it creates a project and estimate in QuickBooks. Change orders are automatically synced, and you can send invoices directly from the app.

## Features
- **Automatic Project Creation**: When a job moves to "Active" status, it creates a project in QuickBooks
- **Customer Matching**: Automatically finds existing customers or creates new ones
- **Change Order Sync**: New change orders are automatically added to the QuickBooks estimate
- **Invoice Generation**: Convert estimates to invoices and send them to customers
- **Queue System**: Failed operations are queued and retried automatically
- **Error Handling**: Comprehensive error reporting and recovery

## Setup Instructions

### 1. QuickBooks Developer Account
1. Go to [QuickBooks Developer Portal](https://developer.intuit.com/)
2. Create a new app or use an existing one
3. Note your Client ID and Client Secret

### 2. Environment Variables
Create a `.env` file in your project root with the following variables:

```env
# QuickBooks OAuth 2.0 Client ID
VITE_QUICKBOOKS_CLIENT_ID=your_quickbooks_client_id_here

# QuickBooks OAuth 2.0 Client Secret
VITE_QUICKBOOKS_CLIENT_SECRET=your_quickbooks_client_secret_here

# QuickBooks OAuth 2.0 Redirect URI
VITE_QUICKBOOKS_REDIRECT_URI=http://localhost:5173/quickbooks/callback
```

### 3. QuickBooks App Configuration
In your QuickBooks app settings:
1. Set the redirect URI to match your environment variable
2. Enable the following scopes:
   - `com.intuit.quickbooks.accounting`
   - `com.intuit.quickbooks.payment`

### 4. Authentication Flow
The integration uses OAuth 2.0 for authentication:
1. User clicks "Connect to QuickBooks" in the Finance > QuickBooks section
2. User is redirected to QuickBooks for authorization
3. After authorization, the app receives an access token
4. The token is stored locally and used for API calls

## Usage

### Connecting to QuickBooks
1. Navigate to **Finance > QuickBooks** in the main menu
2. Click "Connect to QuickBooks"
3. Follow the OAuth flow to authorize the app
4. Once connected, you'll see the connection status and queue information

### Job Setup
1. When a job is moved to "Active" status, click "Setup QuickBooks" in the Actual tab
2. This will:
   - Find or create the customer in QuickBooks
   - Create a new project under that customer
   - Create an estimate with the current estimate amount
   - Store the QuickBooks IDs in the job data

### Change Orders
- New change orders are automatically synced to QuickBooks
- They appear as line items in the estimate
- Format: "Change Order #123: [Change Order Title]"

### Sending Invoices
1. In the Actual tab, ensure the job is synced with QuickBooks
2. Click "Send Invoice" when ready to bill
3. This will:
   - Convert the estimate to an invoice
   - Send the invoice to the customer via QuickBooks
   - Update the job with the invoice information

## Queue System
The integration includes a robust queue system for handling failed operations:

### Queue Status
- **Pending**: Operations waiting to be processed
- **Completed**: Successfully processed operations
- **Failed**: Operations that failed after maximum retries

### Processing Queue
- Click "Process Queue" to retry failed operations
- Operations are automatically retried with exponential backoff
- Failed operations are kept for 30 days

## Error Handling
- Network errors are automatically retried
- Authentication errors trigger re-authentication
- Invalid data errors are logged with details
- All errors are displayed to the user with actionable messages

## Data Flow

### Job Activation
```
Your App → QuickBooks API
├── Find/Create Customer
├── Create Project
└── Create Estimate
```

### Change Order Addition
```
Your App → QuickBooks API
└── Add Line Item to Estimate
```

### Invoice Generation
```
Your App → QuickBooks API
├── Convert Estimate to Invoice
└── Send Invoice to Customer
```

## Troubleshooting

### Common Issues

1. **"QuickBooks not authenticated"**
   - Reconnect to QuickBooks in the Finance > QuickBooks section
   - Check that your environment variables are correct

2. **"Customer not found"**
   - The integration will automatically create new customers
   - Check customer name spelling in your job data

3. **"Operation queued for retry"**
   - Check the queue status in Finance > QuickBooks
   - Click "Process Queue" to retry failed operations

4. **"API rate limit exceeded"**
   - The queue system handles rate limiting automatically
   - Operations will be retried with delays

### Debug Information
- Check the browser console for detailed error messages
- Queue status shows operation history and error details
- All API calls are logged for debugging

## Security Notes
- Access tokens are stored in localStorage (consider more secure storage for production)
- Client secrets should never be exposed in client-side code
- Consider implementing server-side OAuth flow for production use

## Production Considerations
1. Use HTTPS for all redirect URIs
2. Implement proper token refresh handling
3. Add server-side validation for all QuickBooks operations
4. Consider implementing webhook handling for real-time updates
5. Add comprehensive logging and monitoring
