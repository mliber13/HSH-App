// QuickBooks Online API Service
class QuickBooksService {
  constructor() {
    this.baseUrl = 'https://sandbox-accounts.platform.intuit.com'; // Change to production when ready
    this.apiUrl = 'https://sandbox-quickbooks.api.intuit.com'; // Change to production when ready
    this.clientId = import.meta.env.VITE_QUICKBOOKS_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_QUICKBOOKS_CLIENT_SECRET;
    this.redirectUri = import.meta.env.VITE_QUICKBOOKS_REDIRECT_URI;
    this.accessToken = localStorage.getItem('quickbooks_access_token');
    this.refreshToken = localStorage.getItem('quickbooks_refresh_token');
    this.realmId = localStorage.getItem('quickbooks_realm_id');
    
    // Check if QuickBooks is properly configured
    this.isConfigured = !!(this.clientId && this.clientSecret && this.redirectUri);
  }

  // Authentication Methods
  async authenticate() {
    if (!this.isConfigured) {
      throw new Error('QuickBooks not configured. Please set up environment variables first.');
    }
    
    if (!this.accessToken) {
      throw new Error('QuickBooks not authenticated. Please connect your account.');
    }
    
    // Check if token is expired and refresh if needed
    await this.refreshAccessTokenIfNeeded();
    return true;
  }

  async refreshAccessTokenIfNeeded() {
    const tokenExpiry = localStorage.getItem('quickbooks_token_expiry');
    if (tokenExpiry && new Date() > new Date(tokenExpiry)) {
      await this.refreshAccessToken();
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        
        // Store tokens
        localStorage.setItem('quickbooks_access_token', data.access_token);
        localStorage.setItem('quickbooks_refresh_token', data.refresh_token);
        localStorage.setItem('quickbooks_token_expiry', new Date(Date.now() + data.expires_in * 1000).toISOString());
        
        return true;
      } else {
        throw new Error('Failed to refresh QuickBooks token');
      }
    } catch (error) {
      console.error('QuickBooks token refresh failed:', error);
      this.clearAuth();
      throw error;
    }
  }

  clearAuth() {
    localStorage.removeItem('quickbooks_access_token');
    localStorage.removeItem('quickbooks_refresh_token');
    localStorage.removeItem('quickbooks_realm_id');
    localStorage.removeItem('quickbooks_token_expiry');
    this.accessToken = null;
    this.refreshToken = null;
    this.realmId = null;
  }

  // API Helper Methods
  async makeRequest(endpoint, method = 'GET', body = null) {
    await this.authenticate();
    
    const url = `${this.apiUrl}/v3/company/${this.realmId}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const options = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`QuickBooks API Error: ${errorData.Fault?.Error?.[0]?.Message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('QuickBooks API request failed:', error);
      throw error;
    }
  }

  // Customer Management
  async findCustomer(customerName) {
    try {
      const response = await this.makeRequest(`/query?query=SELECT * FROM Customer WHERE Name LIKE '%${encodeURIComponent(customerName)}%'`);
      
      if (response.QueryResponse?.Customer?.length > 0) {
        // Return the first match (you could implement more sophisticated matching)
        return response.QueryResponse.Customer[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error finding customer:', error);
      throw error;
    }
  }

  async createCustomer(customerData) {
    try {
      const customer = {
        Name: customerData.name,
        DisplayName: customerData.name,
        PrimaryEmailAddr: customerData.email ? { Address: customerData.email } : undefined,
        PrimaryPhone: customerData.phone ? { FreeFormNumber: customerData.phone } : undefined,
        BillAddr: customerData.address ? {
          Line1: customerData.address,
          City: customerData.city || '',
          CountrySubDivisionCode: customerData.state || '',
          PostalCode: customerData.zip || ''
        } : undefined
      };

      const response = await this.makeRequest('/customer', 'POST', customer);
      return response.Customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Project Management
  async createProject(customerId, projectName, description = '') {
    try {
      const project = {
        Name: projectName,
        Description: description,
        CustomerRef: {
          value: customerId
        }
      };

      const response = await this.makeRequest('/item', 'POST', project);
      return response.Item;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Estimate Management
  async createEstimate(customerId, projectId, estimateData) {
    try {
      const estimate = {
        CustomerRef: {
          value: customerId
        },
        Line: [
          {
            DetailType: 'DescriptionOnly',
            Description: 'Initial Estimate',
            Amount: estimateData.totalEstimate
          }
        ],
        DocNumber: estimateData.jobId,
        PrivateNote: `Project: ${estimateData.projectName}`
      };

      const response = await this.makeRequest('/estimate', 'POST', estimate);
      return response.Estimate;
    } catch (error) {
      console.error('Error creating estimate:', error);
      throw error;
    }
  }

  async addChangeOrderToEstimate(estimateId, changeOrder) {
    try {
      // First get the current estimate
      const currentEstimate = await this.makeRequest(`/estimate/${estimateId}`);
      
      // Add the change order line item
      const newLine = {
        DetailType: 'DescriptionOnly',
        Description: `Change Order #${changeOrder.number}: ${changeOrder.title}`,
        Amount: changeOrder.value
      };

      currentEstimate.Estimate.Line.push(newLine);

      // Update the estimate
      const response = await this.makeRequest(`/estimate`, 'POST', currentEstimate.Estimate);
      return response.Estimate;
    } catch (error) {
      console.error('Error adding change order to estimate:', error);
      throw error;
    }
  }

  // Invoice Management
  async convertEstimateToInvoice(estimateId) {
    try {
      const response = await this.makeRequest(`/estimate/${estimateId}?operation=convert`);
      return response.Invoice;
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      throw error;
    }
  }

  async sendInvoice(invoiceId) {
    try {
      const response = await this.makeRequest(`/invoice/${invoiceId}?operation=send`);
      return response.Invoice;
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  // Utility Methods
  async testConnection() {
    try {
      if (!this.isConfigured) {
        return {
          success: false,
          error: 'QuickBooks not configured. Please set up environment variables first.',
          needsSetup: true
        };
      }
      
      await this.authenticate();
      const response = await this.makeRequest('/companyinfo/1');
      return {
        success: true,
        companyName: response.CompanyInfo.CompanyName,
        realmId: this.realmId
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        needsSetup: !this.isConfigured
      };
    }
  }
}

// Create singleton instance
const quickbooksService = new QuickBooksService();

export default quickbooksService;
