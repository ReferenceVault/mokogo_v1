/**
 * Step Tracking Utility
 * Tracks user progress through the 5-step application process
 * Matches the step tracking shown in your provided images
 */

// Step tracking events
export const STEP_EVENTS = {
  // Page/Step Events
  STEP_VIEWED: 'step_viewed',
  STEP_STARTED: 'step_started',
  STEP_COMPLETED: 'step_completed',
  STEP_ERROR: 'step_error',
  STEP_ABANDONED: 'step_abandoned',
  
  // Form Events
  FORM_FIELD_FOCUSED: 'form_field_focused',
  FORM_FIELD_COMPLETED: 'form_field_completed',
  FORM_VALIDATION_ERROR: 'form_validation_error',
  
  // Navigation Events
  STEP_NAVIGATION: 'step_navigation',
  BACK_BUTTON_CLICKED: 'back_button_clicked',
  NEXT_BUTTON_CLICKED: 'next_button_clicked',
  
  // Application Events
  APPLICATION_STARTED: 'application_started',
  APPLICATION_DRAFT_SAVED: 'application_draft_saved',
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_ABANDONED: 'application_abandoned',
  
  // Document Events
  DOCUMENT_UPLOAD_STARTED: 'document_upload_started',
  DOCUMENT_UPLOAD_COMPLETED: 'document_upload_completed',
  DOCUMENT_UPLOAD_FAILED: 'document_upload_failed',
  
  // OTP Events
  OTP_REQUESTED: 'otp_requested',
  OTP_VERIFIED: 'otp_verified',
  OTP_FAILED: 'otp_failed',
};

// Step names mapping
export const STEP_NAMES = {
  1: 'Basics',
  2: 'Contact',
  3: 'Employment',
  4: 'Documents',
  5: 'Review'
};

// Step completion criteria
export const STEP_COMPLETION_CRITERIA = {
  1: ['fullName', 'dateOfBirth', 'gender', 'maritalStatus', 'currentAddress', 'permanentAddress', 'nid'],
  2: ['phoneNumber', 'email', 'preferredLanguage', 'phoneVerified'],
  3: ['employmentType', 'averageMonthlyIncome'],
  4: ['nid_document', 'drivers_license', 'income_proof'],
  5: ['finalConsent']
};

/**
 * Step Tracking Class
 */
class StepTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.applicationId = null;
    this.campaignId = null;
    this.startTime = Date.now();
    this.stepTimes = {};
    this.stepData = {};
    this.currentStep = 1;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize tracking for an application
   */
  initialize(campaignId, applicationId = null) {
    this.campaignId = campaignId;
    this.applicationId = applicationId;
    this.startTime = Date.now();
    
    // Update localStorage with new application ID for existing events
    if (applicationId) {
      this.updateExistingEventsWithApplicationId(applicationId);
    }
    
    this.track(STEP_EVENTS.APPLICATION_STARTED, {
      campaignId,
      applicationId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      referrer: document.referrer,
    });
  }

  /**
   * Update application ID (when application is created after initial tracking)
   */
  updateApplicationId(applicationId) {
    console.log("===========updateApplicationId CALLED", applicationId);
    console.log("===========applicationId type", typeof applicationId);
    console.log("===========applicationId truthy", !!applicationId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Updating application ID:', {
        oldApplicationId: this.applicationId,
        newApplicationId: applicationId,
        sessionId: this.sessionId,
      });
    }
    
    this.applicationId = applicationId;
    this.updateExistingEventsWithApplicationId(applicationId);
  }

  /**
   * Update existing events in localStorage with the correct application ID
   */
  updateExistingEventsWithApplicationId(applicationId) {
    console.log("===========updateExistingEventsWithApplicationId", applicationId);
    try {
      const existingData = JSON.parse(localStorage.getItem('stepTrackingData') || '[]');
      const updatedData = existingData.map(event => {
        if (event.sessionId === this.sessionId && !event.applicationId) {
          return { ...event, applicationId };
        }
        return event;
      });
      localStorage.setItem('stepTrackingData', JSON.stringify(updatedData));
    } catch (error) {
      console.warn('Failed to update tracking data with application ID:', error);
    }
  }

  /**
   * Track step view
   */
  trackStepViewed(step, additionalData = {}) {
    this.currentStep = step;
    this.stepTimes[step] = Date.now();
    
    this.track(STEP_EVENTS.STEP_VIEWED, {
      step,
      stepName: STEP_NAMES[step],
      timestamp: new Date().toISOString(),
      timeFromStart: Date.now() - this.startTime,
      ...additionalData
    });
  }

  /**
   * Track step started (when user begins filling form)
   */
  trackStepStarted(step, additionalData = {}) {
    this.track(STEP_EVENTS.STEP_STARTED, {
      step,
      stepName: STEP_NAMES[step],
      timestamp: new Date().toISOString(),
      timeFromStart: Date.now() - this.startTime,
      ...additionalData
    });
  }

  /**
   * Track step completion
   */
  trackStepCompleted(step, formData = {}, additionalData = {}) {
    const timeSpent = this.stepTimes[step] ? Date.now() - this.stepTimes[step] : 0;
    
    // Check completion criteria
    const criteria = STEP_COMPLETION_CRITERIA[step] || [];
    const completedFields = criteria.filter(field => {
      return formData[field] !== undefined && formData[field] !== null && formData[field] !== '';
    });
    
    const completionPercentage = criteria.length > 0 ? (completedFields.length / criteria.length) * 100 : 100;
    
    this.track(STEP_EVENTS.STEP_COMPLETED, {
      step,
      stepName: STEP_NAMES[step],
      timeSpent,
      completionPercentage,
      completedFields: completedFields.length,
      totalFields: criteria.length,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track form field interactions
   */
  trackFieldFocused(step, fieldName, additionalData = {}) {
    this.track(STEP_EVENTS.FORM_FIELD_FOCUSED, {
      step,
      stepName: STEP_NAMES[step],
      fieldName,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track form field completion
   */
  trackFieldCompleted(step, fieldName, value, additionalData = {}) {
    this.track(STEP_EVENTS.FORM_FIELD_COMPLETED, {
      step,
      stepName: STEP_NAMES[step],
      fieldName,
      hasValue: value !== undefined && value !== null && value !== '',
      valueLength: typeof value === 'string' ? value.length : 0,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track validation errors
   */
  trackValidationError(step, fieldName, errorMessage, additionalData = {}) {
    this.track(STEP_EVENTS.FORM_VALIDATION_ERROR, {
      step,
      stepName: STEP_NAMES[step],
      fieldName,
      errorMessage,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track navigation events
   */
  trackNavigation(fromStep, toStep, method = 'click', additionalData = {}) {
    this.track(STEP_EVENTS.STEP_NAVIGATION, {
      fromStep,
      toStep,
      fromStepName: STEP_NAMES[fromStep],
      toStepName: STEP_NAMES[toStep],
      method, // 'click', 'back_button', 'next_button', 'direct'
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track button clicks
   */
  trackButtonClick(step, buttonType, additionalData = {}) {
    const event = buttonType === 'back' ? STEP_EVENTS.BACK_BUTTON_CLICKED : STEP_EVENTS.NEXT_BUTTON_CLICKED;
    
    this.track(event, {
      step,
      stepName: STEP_NAMES[step],
      buttonType,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track document upload events
   */
  trackDocumentUpload(step, documentType, status, additionalData = {}) {
    let event;
    switch (status) {
      case 'started':
        event = STEP_EVENTS.DOCUMENT_UPLOAD_STARTED;
        break;
      case 'completed':
        event = STEP_EVENTS.DOCUMENT_UPLOAD_COMPLETED;
        break;
      case 'failed':
        event = STEP_EVENTS.DOCUMENT_UPLOAD_FAILED;
        break;
      default:
        event = STEP_EVENTS.DOCUMENT_UPLOAD_STARTED;
    }

    this.track(event, {
      step,
      stepName: STEP_NAMES[step],
      documentType,
      status,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track OTP events
   */
  trackOTP(step, action, additionalData = {}) {
    let event;
    switch (action) {
      case 'requested':
        event = STEP_EVENTS.OTP_REQUESTED;
        break;
      case 'verified':
        event = STEP_EVENTS.OTP_VERIFIED;
        break;
      case 'failed':
        event = STEP_EVENTS.OTP_FAILED;
        break;
      default:
        event = STEP_EVENTS.OTP_REQUESTED;
    }

    this.track(event, {
      step,
      stepName: STEP_NAMES[step],
      action,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track application submission
   */
  trackApplicationSubmitted(additionalData = {}) {
    const totalTime = Date.now() - this.startTime;
    
    this.track(STEP_EVENTS.APPLICATION_SUBMITTED, {
      applicationId: this.applicationId,
      campaignId: this.campaignId,
      totalTime,
      totalSteps: 5,
      timestamp: new Date().toISOString(),
      completionRate: 100,
      ...additionalData
    });
  }

  /**
   * Track draft save
   */
  trackDraftSaved(step, additionalData = {}) {
    this.track(STEP_EVENTS.APPLICATION_DRAFT_SAVED, {
      step,
      stepName: STEP_NAMES[step],
      applicationId: this.applicationId,
      campaignId: this.campaignId,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Track application abandonment
   */
  trackApplicationAbandoned(step, reason = 'unknown', additionalData = {}) {
    const timeSpent = Date.now() - this.startTime;
    
    this.track(STEP_EVENTS.APPLICATION_ABANDONED, {
      step,
      stepName: STEP_NAMES[step],
      reason,
      timeSpent,
      completionPercentage: (step / 5) * 100,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  /**
   * Core tracking method
   */
  track(event, data = {}) {
    const trackingData = {
      event,
      sessionId: this.sessionId,
      applicationId: this.applicationId || null, // Explicitly set to null if undefined
      campaignId: this.campaignId || null,
      currentStep: this.currentStep || 1,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...data
    };

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Step Tracking:', {
        event,
        step: data.step || this.currentStep,
        stepName: data.stepName || STEP_NAMES[this.currentStep],
        timestamp: trackingData.timestamp,
        ...data
      });
    }

    // Store in localStorage for persistence
    this.storeTrackingData(trackingData);

    // Send to analytics service (implement as needed)
    this.sendToAnalytics(trackingData);
  }

  /**
   * Store tracking data locally
   */
  storeTrackingData(data) {
    try {
      const existingData = JSON.parse(localStorage.getItem('stepTrackingData') || '[]');
      existingData.push(data);
      
      // Keep only last 100 events to prevent storage issues
      if (existingData.length > 100) {
        existingData.splice(0, existingData.length - 100);
      }
      
      localStorage.setItem('stepTrackingData', JSON.stringify(existingData));
    } catch (error) {
      console.warn('Failed to store tracking data:', error);
    }
  }

  /**
   * Send to analytics service
   */
  sendToAnalytics(data) {
    // Implement your analytics service integration here
    // Examples: Google Analytics, Mixpanel, Amplitude, etc.
    
    // Google Analytics 4 example:
    if (typeof gtag !== 'undefined') {
      gtag('event', data.event, {
        event_category: 'Application Process',
        event_label: data.stepName,
        custom_parameter_step: data.step,
        custom_parameter_campaign_id: data.campaignId,
        custom_parameter_application_id: data.applicationId,
      });
    }

    // Custom analytics endpoint (if you have one)
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(error => {
        console.warn('Failed to send analytics data:', error);
      });
    }
  }

  /**
   * Get tracking summary
   */
  getTrackingSummary() {
    try {
      const data = JSON.parse(localStorage.getItem('stepTrackingData') || '[]');
      const sessionData = data.filter(item => item.sessionId === this.sessionId);
      
      return {
        sessionId: this.sessionId,
        totalEvents: sessionData.length,
        startTime: this.startTime,
        currentStep: this.currentStep,
        stepTimes: this.stepTimes,
        events: sessionData,
      };
    } catch (error) {
      console.warn('Failed to get tracking summary:', error);
      return null;
    }
  }

  /**
   * Clear tracking data
   */
  clearTrackingData() {
    try {
      localStorage.removeItem('stepTrackingData');
    } catch (error) {
      console.warn('Failed to clear tracking data:', error);
    }
  }

  /**
   * Get current tracking state (for debugging)
   */
  getTrackingState() {
    return {
      sessionId: this.sessionId,
      applicationId: this.applicationId,
      campaignId: this.campaignId,
      currentStep: this.currentStep,
      startTime: this.startTime,
      isInitialized: !!(this.campaignId || this.applicationId),
    };
  }
}

// Create singleton instance
const stepTracker = new StepTracker();

export default stepTracker;
