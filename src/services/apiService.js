// API Service for HSH Construction Management
// This replaces localStorage calls with API calls to the backend

const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Handle empty responses (like DELETE)
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Jobs API
  async getJobs() {
    return this.request('/jobs');
  }

  async getJob(id) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(job) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  async updateJob(id, updates) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteJob(id) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async updateJobFinancials(id, financials) {
    return this.request(`/jobs/${id}/financials`, {
      method: 'PUT',
      body: JSON.stringify(financials),
    });
  }

  async updateJobScopes(id, scopes) {
    return this.request(`/jobs/${id}/scopes`, {
      method: 'PUT',
      body: JSON.stringify(scopes),
    });
  }

  async updateJobTakeoffPhases(id, takeoffPhases) {
    return this.request(`/jobs/${id}/takeoff-phases`, {
      method: 'PUT',
      body: JSON.stringify(takeoffPhases),
    });
  }

  async updateJobChecklists(id, checklists) {
    return this.request(`/jobs/${id}/checklists`, {
      method: 'PUT',
      body: JSON.stringify(checklists),
    });
  }

  async updateJobDocuments(id, documents) {
    return this.request(`/jobs/${id}/documents`, {
      method: 'PUT',
      body: JSON.stringify(documents),
    });
  }

  async updateJobDailyLogs(id, dailyLogs) {
    return this.request(`/jobs/${id}/daily-logs`, {
      method: 'PUT',
      body: JSON.stringify(dailyLogs),
    });
  }

  // Employees API
  async getEmployees() {
    return this.request('/employees');
  }

  async getEmployee(id) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(employee) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  async updateEmployee(id, updates) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteEmployee(id) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  async updateEmployeeDocuments(id, documents) {
    return this.request(`/employees/${id}/documents`, {
      method: 'PUT',
      body: JSON.stringify(documents),
    });
  }

  async updateEmployeeOnboarding(id, onboarding) {
    return this.request(`/employees/${id}/onboarding`, {
      method: 'PUT',
      body: JSON.stringify(onboarding),
    });
  }

  // Time Entries API
  async getTimeEntries() {
    return this.request('/time-entries');
  }

  async getTimeEntriesByEmployee(employeeId) {
    return this.request(`/time-entries/employee/${employeeId}`);
  }

  async getTimeEntriesByJob(jobId) {
    return this.request(`/time-entries/job/${jobId}`);
  }

  async createTimeEntry(timeEntry) {
    return this.request('/time-entries', {
      method: 'POST',
      body: JSON.stringify(timeEntry),
    });
  }

  async updateTimeEntry(id, updates) {
    return this.request(`/time-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTimeEntry(id) {
    return this.request(`/time-entries/${id}`, {
      method: 'DELETE',
    });
  }

  async clockIn(employeeId, jobId, location, timestamp) {
    return this.request('/time-entries/clock-in', {
      method: 'POST',
      body: JSON.stringify({
        employeeId,
        jobId,
        location,
        timestamp,
      }),
    });
  }

  async clockOut(id, location, timestamp) {
    return this.request(`/time-entries/${id}/clock-out`, {
      method: 'PUT',
      body: JSON.stringify({
        location,
        timestamp,
      }),
    });
  }

  // Schedules API
  async getSchedules() {
    return this.request('/schedules');
  }

  async createSchedule(schedule) {
    return this.request('/schedules', {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  }

  async updateSchedule(id, updates) {
    return this.request(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Inventory API
  async getInventory() {
    return this.request('/inventory');
  }

  async updateInventory(inventory) {
    return this.request('/inventory', {
      method: 'PUT',
      body: JSON.stringify(inventory),
    });
  }

  // Suppliers API
  async getSuppliers() {
    return this.request('/suppliers');
  }

  async updateSuppliers(suppliers) {
    return this.request('/suppliers', {
      method: 'PUT',
      body: JSON.stringify(suppliers),
    });
  }

  // Authentication API
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  // Migration API
  async getDataSummary() {
    return this.request('/migration/summary');
  }

  async importData(data) {
    return this.request('/migration/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exportData() {
    return this.request('/migration/export');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

