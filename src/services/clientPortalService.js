// Client Portal Service
// Manages client portal data and communication

const CLIENT_PORTAL_STORAGE_KEY = 'hsh_drywall_client_portal';
const CLIENT_MESSAGES_STORAGE_KEY = 'hsh_drywall_client_messages';
const CLIENT_PHOTOS_STORAGE_KEY = 'hsh_drywall_client_photos';

// Helper functions for local storage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Generate unique IDs
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Default client portal data
const getDefaultClientPortalData = () => ({
  generalContractors: [],
  superintendents: [],
  projectManagers: [],
  portalSettings: {
    allowPhotoSharing: true,
    allowMessaging: true,
    allowScopeReview: true,
    allowFinancialView: true
  }
});

// Initialize default data if none exist
const initializeDefaultData = () => {
  const existingData = loadFromStorage(CLIENT_PORTAL_STORAGE_KEY, null);
  if (!existingData) {
    saveToStorage(CLIENT_PORTAL_STORAGE_KEY, getDefaultClientPortalData());
  }
  return loadFromStorage(CLIENT_PORTAL_STORAGE_KEY, getDefaultClientPortalData());
};



// General Contractor management functions
export const createGeneralContractor = (gcData) => {
  const data = initializeDefaultData();
  const newGC = {
    id: generateId(),
    name: gcData.name,
    company: gcData.company || '',
    email: gcData.email || '',
    phone: gcData.phone || '',
    address: gcData.address || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.generalContractors.push(newGC);
  saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
  return newGC;
};

export const getGeneralContractors = () => {
  const data = initializeDefaultData();
  return data.generalContractors;
};

export const getGeneralContractorById = (gcId) => {
  const data = initializeDefaultData();
  return data.generalContractors.find(gc => gc.id === gcId);
};

export const updateGeneralContractor = (gcId, updates) => {
  const data = initializeDefaultData();
  const index = data.generalContractors.findIndex(gc => gc.id === gcId);
  if (index !== -1) {
    data.generalContractors[index] = { 
      ...data.generalContractors[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
    return data.generalContractors[index];
  }
  return null;
};

export const deleteGeneralContractor = (gcId) => {
  const data = initializeDefaultData();
  // Remove the GC
  data.generalContractors = data.generalContractors.filter(gc => gc.id !== gcId);
  // Remove all superintendents and project managers associated with this GC
  data.superintendents = data.superintendents.filter(s => s.gcId !== gcId);
  data.projectManagers = data.projectManagers.filter(pm => pm.gcId !== gcId);
  saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
};

// Superintendent management functions
export const createSuperintendent = (superData) => {
  const data = initializeDefaultData();
  const newSuper = {
    id: generateId(),
    name: superData.name,
    gcId: superData.gcId, // Tied to specific General Contractor
    email: superData.email || '',
    phone: superData.phone || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.superintendents.push(newSuper);
  saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
  return newSuper;
};

export const getSuperintendents = (gcId = null) => {
  const data = initializeDefaultData();
  if (gcId) {
    return data.superintendents.filter(s => s.gcId === gcId);
  }
  return data.superintendents;
};

export const getSuperintendentById = (superId) => {
  const data = initializeDefaultData();
  return data.superintendents.find(s => s.id === superId);
};

export const updateSuperintendent = (superId, updates) => {
  const data = initializeDefaultData();
  const index = data.superintendents.findIndex(s => s.id === superId);
  if (index !== -1) {
    data.superintendents[index] = { 
      ...data.superintendents[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
    return data.superintendents[index];
  }
  return null;
};

export const deleteSuperintendent = (superId) => {
  const data = initializeDefaultData();
  data.superintendents = data.superintendents.filter(s => s.id !== superId);
  saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
};

// Project Manager management functions
export const createProjectManager = (pmData) => {
  const data = initializeDefaultData();
  const newPM = {
    id: generateId(),
    name: pmData.name,
    gcId: pmData.gcId, // Tied to specific General Contractor
    email: pmData.email || '',
    phone: pmData.phone || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  data.projectManagers.push(newPM);
  saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
  return newPM;
};

export const getProjectManagers = (gcId = null) => {
  const data = initializeDefaultData();
  if (gcId) {
    return data.projectManagers.filter(pm => pm.gcId === gcId);
  }
  return data.projectManagers;
};

export const getProjectManagerById = (pmId) => {
  const data = initializeDefaultData();
  return data.projectManagers.find(pm => pm.id === pmId);
};

export const updateProjectManager = (pmId, updates) => {
  const data = initializeDefaultData();
  const index = data.projectManagers.findIndex(pm => pm.id === pmId);
  if (index !== -1) {
    data.projectManagers[index] = { 
      ...data.projectManagers[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
    return data.projectManagers[index];
  }
  return null;
};

export const deleteProjectManager = (pmId) => {
  const data = initializeDefaultData();
  data.projectManagers = data.projectManagers.filter(pm => pm.id !== pmId);
  saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
};

// Message management functions
export const sendMessage = (messageData) => {
  const messages = loadFromStorage(CLIENT_MESSAGES_STORAGE_KEY, []);
  const newMessage = {
    id: generateId(),
    ...messageData,
    timestamp: new Date().toISOString(),
    isRead: false
  };
  
  messages.push(newMessage);
  saveToStorage(CLIENT_MESSAGES_STORAGE_KEY, messages);
  return newMessage;
};

export const getMessages = (clientId, jobId = null) => {
  const messages = loadFromStorage(CLIENT_MESSAGES_STORAGE_KEY, []);
  return messages.filter(message => 
    message.clientId === clientId && 
    (!jobId || message.jobId === jobId)
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const markMessageAsRead = (messageId) => {
  const messages = loadFromStorage(CLIENT_MESSAGES_STORAGE_KEY, []);
  const updatedMessages = messages.map(message => 
    message.id === messageId ? { ...message, isRead: true } : message
  );
  saveToStorage(CLIENT_MESSAGES_STORAGE_KEY, updatedMessages);
};

// Photo management functions
export const uploadClientPhoto = (photoData) => {
  const photos = loadFromStorage(CLIENT_PHOTOS_STORAGE_KEY, []);
  const newPhoto = {
    id: generateId(),
    ...photoData,
    uploadedAt: new Date().toISOString()
  };
  
  photos.push(newPhoto);
  saveToStorage(CLIENT_PHOTOS_STORAGE_KEY, photos);
  return newPhoto;
};

export const getClientPhotos = (jobId) => {
  const photos = loadFromStorage(CLIENT_PHOTOS_STORAGE_KEY, []);
  return photos.filter(photo => photo.jobId === jobId).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

export const deleteClientPhoto = (photoId) => {
  const photos = loadFromStorage(CLIENT_PHOTOS_STORAGE_KEY, []);
  const updatedPhotos = photos.filter(photo => photo.id !== photoId);
  saveToStorage(CLIENT_PHOTOS_STORAGE_KEY, updatedPhotos);
};

// Portal settings functions
export const getPortalSettings = () => {
  const data = initializeDefaultData();
  return data.portalSettings;
};

export const updatePortalSettings = (settings) => {
  const data = initializeDefaultData();
  data.portalSettings = { ...data.portalSettings, ...settings };
  saveToStorage(CLIENT_PORTAL_STORAGE_KEY, data);
  return data.portalSettings;
};


