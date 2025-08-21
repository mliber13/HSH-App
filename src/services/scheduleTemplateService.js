// Schedule Template Service
// Manages schedule templates for creating new schedules

const TEMPLATES_STORAGE_KEY = 'hsh_drywall_schedule_templates';

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

// Default templates
const getDefaultTemplates = () => [
  {
    id: 'standard-residential',
    name: 'Standard Residential Drywall',
    description: 'Typical residential drywall installation workflow',
    jobType: 'residential',
    estimatedDuration: 11,
    phases: [
             {
         id: 'stock',
         name: 'Stock',
         description: 'Material delivery and organization',
         duration: 1,
         tasks: []
       },
       {
         id: 'scaffold-prep',
         name: 'Scaffold/Prep',
         description: 'Site preparation and scaffolding setup',
         duration: 1,
         tasks: []
       },
       {
         id: 'hanging',
         name: 'Hanging',
         description: 'Install drywall sheets',
         duration: 3,
         tasks: []
       },
       {
         id: 'paper-floors',
         name: 'Paper Floors',
         description: 'Apply paper protection to floors',
         duration: 1,
         tasks: []
       },
       {
         id: 'finish',
         name: 'Finish',
         description: 'Taping, mudding, and finishing work',
         duration: 5,
         tasks: []
       },
       {
         id: 'cleanout',
         name: 'Cleanout',
         description: 'Final cleanup and site preparation for next trade',
         duration: 1,
         tasks: []
       }
    ]
  },
  {
    id: 'commercial-multi-unit',
    name: 'Commercial Multi-Unit',
    description: 'Commercial multi-unit building drywall installation',
    jobType: 'commercial',
    estimatedDuration: 8,
    phases: [
             {
         id: 'planning',
         name: 'Planning & Coordination',
         description: 'Project planning and coordination',
         duration: 1,
         tasks: []
       },
       {
         id: 'prep',
         name: 'Preparation',
         description: 'Site preparation and setup',
         duration: 1,
         tasks: []
       },
       {
         id: 'hanging',
         name: 'Hanging',
         description: 'Install drywall sheets',
         duration: 3,
         tasks: []
       },
       {
         id: 'finishing',
         name: 'Finishing',
         description: 'Taping, mudding, and final touches',
         duration: 3,
         tasks: []
       }
    ]
  }
];

// Initialize default templates if none exist
const initializeDefaultTemplates = () => {
  const existingTemplates = loadFromStorage(TEMPLATES_STORAGE_KEY, []);
  // Force refresh templates by always saving the latest defaults
  saveToStorage(TEMPLATES_STORAGE_KEY, getDefaultTemplates());
  return getDefaultTemplates();
};

// Load templates from storage
const loadTemplates = () => {
  initializeDefaultTemplates();
  return loadFromStorage(TEMPLATES_STORAGE_KEY, []);
};

// Save templates to storage
const saveTemplates = (templates) => {
  saveToStorage(TEMPLATES_STORAGE_KEY, templates);
};

// Template management functions
export const createTemplate = (templateData) => {
  const templates = loadTemplates();
  const newTemplate = {
    id: generateId(),
    ...templateData,
    createdAt: new Date().toISOString()
  };
  templates.push(newTemplate);
  saveTemplates(templates);
  return newTemplate;
};

export const getTemplates = () => {
  return loadTemplates();
};

export const getTemplateById = (templateId) => {
  const templates = loadTemplates();
  return templates.find(template => template.id === templateId);
};

export const updateTemplate = (templateId, updates) => {
  const templates = loadTemplates();
  const index = templates.findIndex(template => template.id === templateId);
  if (index !== -1) {
    templates[index] = { ...templates[index], ...updates, updatedAt: new Date().toISOString() };
    saveTemplates(templates);
    return templates[index];
  }
  return null;
};

export const deleteTemplate = (templateId) => {
  const templates = loadTemplates();
  const filteredTemplates = templates.filter(template => template.id !== templateId);
  saveTemplates(filteredTemplates);
};

// Convert template to schedule format
export const convertTemplateToSchedule = (template, jobId, startDate, employeeIds) => {
  const schedules = [];
  let currentDate = new Date(startDate);
  
  template.phases.forEach((phase, phaseIndex) => {
    const phaseSchedule = {
      id: generateId(),
      jobId,
      employeeIds,
      title: `${template.name} - ${phase.name}`,
      startDate: new Date(currentDate).toISOString().split('T')[0],
      endDate: new Date(currentDate.getTime() + (phase.duration - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: phase.duration,
      notes: `${template.description}\n\nPhase: ${phase.name}\n${phase.description}`,
      status: 'scheduled',
      predecessorId: phaseIndex > 0 ? schedules[schedules.length - 1].id : null,
      predecessorLag: 0,
      templateId: template.id,
      phaseId: phase.id
    };
    
    schedules.push(phaseSchedule);
    currentDate.setDate(currentDate.getDate() + phase.duration);
  });
  
  return schedules;
};

// Get template usage statistics
export const getTemplateUsageStats = () => {
  const templates = loadTemplates();
  const stats = {};
  
  templates.forEach(template => {
    stats[template.id] = {
      name: template.name,
      usageCount: 0,
      lastUsed: null
    };
  });
  
  return stats;
};
