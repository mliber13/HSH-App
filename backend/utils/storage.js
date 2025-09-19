const fs = require('fs').promises;
const path = require('path');

class Storage {
  constructor(dataPath = './data') {
    this.dataPath = dataPath;
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    try {
      await fs.access(this.dataPath);
    } catch {
      await fs.mkdir(this.dataPath, { recursive: true });
    }
  }

  async readFile(filename) {
    try {
      const filePath = path.join(this.dataPath, filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return empty array/object based on filename
        return this.getDefaultData(filename);
      }
      throw error;
    }
  }

  async writeFile(filename, data) {
    const filePath = path.join(this.dataPath, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  getDefaultData(filename) {
    const defaults = {
      'jobs.json': [],
      'employees.json': [],
      'timeEntries.json': [],
      'pieceRateEntries.json': [],
      'payrollReports.json': [],
      'schedules.json': [],
      'inventory.json': [],
      'suppliers.json': [],
      'checklistTemplates.json': [],
      'jobMessages.json': {},
      'quickbooksQueue.json': [],
      'userData.json': {}
    };
    return defaults[filename] || [];
  }

  // Jobs operations
  async getJobs() {
    return await this.readFile('jobs.json');
  }

  async saveJobs(jobs) {
    await this.writeFile('jobs.json', jobs);
  }

  async getJobById(id) {
    const jobs = await this.getJobs();
    return jobs.find(job => job.id === id);
  }

  async updateJob(id, updates) {
    const jobs = await this.getJobs();
    const index = jobs.findIndex(job => job.id === id);
    if (index !== -1) {
      jobs[index] = { ...jobs[index], ...updates };
      await this.saveJobs(jobs);
      return jobs[index];
    }
    throw new Error('Job not found');
  }

  async createJob(job) {
    const jobs = await this.getJobs();
    const newJob = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...job
    };
    jobs.push(newJob);
    await this.saveJobs(jobs);
    return newJob;
  }

  async deleteJob(id) {
    const jobs = await this.getJobs();
    const filteredJobs = jobs.filter(job => job.id !== id);
    await this.saveJobs(filteredJobs);
  }

  // Employees operations
  async getEmployees() {
    return await this.readFile('employees.json');
  }

  async saveEmployees(employees) {
    await this.writeFile('employees.json', employees);
  }

  async getEmployeeById(id) {
    const employees = await this.getEmployees();
    return employees.find(emp => emp.id === id);
  }

  async updateEmployee(id, updates) {
    const employees = await this.getEmployees();
    const index = employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      employees[index] = { ...employees[index], ...updates };
      await this.saveEmployees(employees);
      return employees[index];
    }
    throw new Error('Employee not found');
  }

  async createEmployee(employee) {
    const employees = await this.getEmployees();
    const newEmployee = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...employee
    };
    employees.push(newEmployee);
    await this.saveEmployees(employees);
    return newEmployee;
  }

  // Time entries operations
  async getTimeEntries() {
    return await this.readFile('timeEntries.json');
  }

  async saveTimeEntries(timeEntries) {
    await this.writeFile('timeEntries.json', timeEntries);
  }

  async createTimeEntry(timeEntry) {
    const timeEntries = await this.getTimeEntries();
    const newEntry = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      ...timeEntry
    };
    timeEntries.push(newEntry);
    await this.saveTimeEntries(timeEntries);
    return newEntry;
  }

  async updateTimeEntry(id, updates) {
    const timeEntries = await this.getTimeEntries();
    const index = timeEntries.findIndex(entry => entry.id === id);
    if (index !== -1) {
      timeEntries[index] = { ...timeEntries[index], ...updates };
      await this.saveTimeEntries(timeEntries);
      return timeEntries[index];
    }
    throw new Error('Time entry not found');
  }

  // Schedules operations
  async getSchedules() {
    return await this.readFile('schedules.json');
  }

  async saveSchedules(schedules) {
    await this.writeFile('schedules.json', schedules);
  }

  async createSchedule(schedule) {
    const schedules = await this.getSchedules();
    const newSchedule = {
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...schedule
    };
    schedules.push(newSchedule);
    await this.saveSchedules(schedules);
    return newSchedule;
  }

  // Inventory operations
  async getInventory() {
    return await this.readFile('inventory.json');
  }

  async saveInventory(inventory) {
    await this.writeFile('inventory.json', inventory);
  }

  // Suppliers operations
  async getSuppliers() {
    return await this.readFile('suppliers.json');
  }

  async saveSuppliers(suppliers) {
    await this.writeFile('suppliers.json', suppliers);
  }

  // User data operations
  async getUserData() {
    return await this.readFile('userData.json');
  }

  async saveUserData(userData) {
    await this.writeFile('userData.json', userData);
  }

  // QuickBooks queue operations
  async getQuickBooksQueue() {
    return await this.readFile('quickbooksQueue.json');
  }

  async saveQuickBooksQueue(queue) {
    await this.writeFile('quickbooksQueue.json', queue);
  }

  // Utility methods
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Migration helper - import from localStorage data
  async importFromLocalStorage(localStorageData) {
    try {
      const data = typeof localStorageData === 'string' 
        ? JSON.parse(localStorageData) 
        : localStorageData;

      // Import each data type
      if (data.jobs) await this.saveJobs(data.jobs);
      if (data.employees) await this.saveEmployees(data.employees);
      if (data.timeEntries) await this.saveTimeEntries(data.timeEntries);
      if (data.pieceRateEntries) await this.writeFile('pieceRateEntries.json', data.pieceRateEntries);
      if (data.payrollReports) await this.writeFile('payrollReports.json', data.payrollReports);
      if (data.schedules) await this.saveSchedules(data.schedules);
      if (data.inventory) await this.saveInventory(data.inventory);
      if (data.suppliers) await this.saveSuppliers(data.suppliers);
      if (data.checklistTemplates) await this.writeFile('checklistTemplates.json', data.checklistTemplates);
      if (data.jobMessages) await this.writeFile('jobMessages.json', data.jobMessages);
      if (data.quickbooksQueue) await this.saveQuickBooksQueue(data.quickbooksQueue);
      if (data.userData) await this.saveUserData(data.userData);

      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  // Export helper - export to localStorage format
  async exportToLocalStorage() {
    try {
      const data = {
        jobs: await this.getJobs(),
        employees: await this.getEmployees(),
        timeEntries: await this.getTimeEntries(),
        pieceRateEntries: await this.readFile('pieceRateEntries.json'),
        payrollReports: await this.readFile('payrollReports.json'),
        schedules: await this.getSchedules(),
        inventory: await this.getInventory(),
        suppliers: await this.getSuppliers(),
        checklistTemplates: await this.readFile('checklistTemplates.json'),
        jobMessages: await this.readFile('jobMessages.json'),
        quickbooksQueue: await this.getQuickBooksQueue(),
        userData: await this.getUserData()
      };
      return data;
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }
}

module.exports = new Storage();
