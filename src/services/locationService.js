// Location-Based Time Tracking Service
class LocationService {
  constructor() {
    this.loadLocationData();
  }

  loadLocationData() {
    const stored = localStorage.getItem('locationData');
    if (stored) {
      this.locationData = JSON.parse(stored);
    } else {
      this.locationData = {
        jobSites: {},
        safetyIncidents: [],
        geofenceRadius: 500, // Default 500 feet radius
        locationHistory: []
      };
      this.saveLocationData();
    }
  }

  saveLocationData() {
    localStorage.setItem('locationData', JSON.stringify(this.locationData));
  }

  // Job Site Management
  addJobSite(jobId, siteName, latitude, longitude, radius = null) {
    if (!this.locationData.jobSites[jobId]) {
      this.locationData.jobSites[jobId] = [];
    }
    
    const site = {
      id: Date.now() + Math.random(),
      name: siteName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: radius || this.locationData.geofenceRadius,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    this.locationData.jobSites[jobId].push(site);
    this.saveLocationData();
    return site;
  }

  updateJobSite(jobId, siteId, updates) {
    const sites = this.locationData.jobSites[jobId];
    if (sites) {
      const siteIndex = sites.findIndex(site => site.id === siteId);
      if (siteIndex !== -1) {
        this.locationData.jobSites[jobId][siteIndex] = {
          ...this.locationData.jobSites[jobId][siteIndex],
          ...updates
        };
        this.saveLocationData();
        return this.locationData.jobSites[jobId][siteIndex];
      }
    }
    return null;
  }

  deleteJobSite(jobId, siteId) {
    const sites = this.locationData.jobSites[jobId];
    if (sites) {
      this.locationData.jobSites[jobId] = sites.filter(site => site.id !== siteId);
      this.saveLocationData();
    }
  }

  getJobSites(jobId) {
    return this.locationData.jobSites[jobId] || [];
  }

  // GPS Location Functions
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 20902231; // Earth's radius in feet
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in feet
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  isWithinGeofence(userLat, userLon, siteLat, siteLon, radius) {
    const distance = this.calculateDistance(userLat, userLon, siteLat, siteLon);
    return distance <= radius;
  }

  findNearestJobSite(userLat, userLon, jobId) {
    const sites = this.getJobSites(jobId);
    if (sites.length === 0) return null;

    let nearestSite = null;
    let nearestDistance = Infinity;

    sites.forEach(site => {
      if (site.isActive) {
        const distance = this.calculateDistance(userLat, userLon, site.latitude, site.longitude);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestSite = { ...site, distance };
        }
      }
    });

    return nearestSite;
  }

  validateLocationForJob(userLat, userLon, jobId) {
    const nearestSite = this.findNearestJobSite(userLat, userLon, jobId);
    if (!nearestSite) return { valid: false, message: 'No job sites found for this job' };

    const isWithinRange = this.isWithinGeofence(userLat, userLon, nearestSite.latitude, nearestSite.longitude, nearestSite.radius);
    
    return {
      valid: isWithinRange,
      site: nearestSite,
      message: isWithinRange 
        ? `Location verified at ${nearestSite.name}` 
        : `Must be within ${nearestSite.radius} feet of ${nearestSite.name}`
    };
  }

  // Location History
  addLocationHistory(employeeId, jobId, latitude, longitude, action, siteId = null) {
    const locationRecord = {
      id: Date.now() + Math.random(),
      employeeId,
      jobId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      action, // 'punch-in', 'punch-out', 'location-check'
      siteId,
      timestamp: new Date().toISOString(),
      accuracy: null // Could be added from GPS data
    };

    this.locationData.locationHistory.push(locationRecord);
    
    // Keep only last 1000 records to prevent storage bloat
    if (this.locationData.locationHistory.length > 1000) {
      this.locationData.locationHistory = this.locationData.locationHistory.slice(-1000);
    }
    
    this.saveLocationData();
    return locationRecord;
  }

  getLocationHistory(employeeId = null, jobId = null, limit = 100) {
    let history = this.locationData.locationHistory;
    
    if (employeeId) {
      history = history.filter(record => record.employeeId === employeeId);
    }
    
    if (jobId) {
      history = history.filter(record => record.jobId === jobId);
    }
    
    return history.slice(-limit).reverse();
  }

  // Safety Incident Reporting
  addSafetyIncident(data) {
    const incident = {
      id: Date.now() + Math.random(),
      employeeId: data.employeeId,
      jobId: data.jobId,
      siteId: data.siteId,
      type: data.type, // 'injury', 'near-miss', 'property-damage', 'hazard'
      severity: data.severity, // 'minor', 'moderate', 'serious', 'critical'
      description: data.description,
      location: {
        latitude: data.latitude,
        longitude: data.longitude
      },
      photos: data.photos || [],
      witnesses: data.witnesses || [],
      reportedBy: data.reportedBy,
      reportedAt: new Date().toISOString(),
      status: 'reported', // 'reported', 'investigating', 'resolved', 'closed'
      investigationNotes: [],
      resolutionNotes: '',
      resolvedAt: null
    };

    this.locationData.safetyIncidents.push(incident);
    this.saveLocationData();
    return incident;
  }

  updateSafetyIncident(incidentId, updates) {
    const incidentIndex = this.locationData.safetyIncidents.findIndex(inc => inc.id === incidentId);
    if (incidentIndex !== -1) {
      this.locationData.safetyIncidents[incidentIndex] = {
        ...this.locationData.safetyIncidents[incidentIndex],
        ...updates
      };
      this.saveLocationData();
      return this.locationData.safetyIncidents[incidentIndex];
    }
    return null;
  }

  getSafetyIncidents(jobId = null, status = null, limit = 50) {
    let incidents = this.locationData.safetyIncidents;
    
    if (jobId) {
      incidents = incidents.filter(incident => incident.jobId === jobId);
    }
    
    if (status) {
      incidents = incidents.filter(incident => incident.status === status);
    }
    
    return incidents.slice(-limit).reverse();
  }

  // Settings
  updateGeofenceRadius(radius) {
    this.locationData.geofenceRadius = parseInt(radius);
    this.saveLocationData();
  }

  getGeofenceRadius() {
    return this.locationData.geofenceRadius;
  }

  // Export/Import
  exportLocationData() {
    return this.locationData;
  }

  importLocationData(data) {
    this.locationData = { ...this.locationData, ...data };
    this.saveLocationData();
  }

  // Utility Methods
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }
}

export default new LocationService();
