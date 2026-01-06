import { useCallback } from 'react';
import stepTracker from '../utils/stepTracking';

/**
 * Custom hook for step tracking
 * Provides convenient methods for tracking form interactions
 */
export const useStepTracking = (stepNumber) => {
  const trackFieldFocus = useCallback((fieldName, additionalData = {}) => {
    stepTracker.trackFieldFocused(stepNumber, fieldName, additionalData);
  }, [stepNumber]);

  const trackFieldComplete = useCallback((fieldName, value, additionalData = {}) => {
    stepTracker.trackFieldCompleted(stepNumber, fieldName, value, additionalData);
  }, [stepNumber]);

  const trackValidationError = useCallback((fieldName, errorMessage, additionalData = {}) => {
    stepTracker.trackValidationError(stepNumber, fieldName, errorMessage, additionalData);
  }, [stepNumber]);

  const trackStepStart = useCallback((additionalData = {}) => {
    stepTracker.trackStepStarted(stepNumber, additionalData);
  }, [stepNumber]);

  const trackStepComplete = useCallback((formData = {}, additionalData = {}) => {
    stepTracker.trackStepCompleted(stepNumber, formData, additionalData);
  }, [stepNumber]);

  const trackButtonClick = useCallback((buttonType, additionalData = {}) => {
    stepTracker.trackButtonClick(stepNumber, buttonType, additionalData);
  }, [stepNumber]);

  const trackDraftSave = useCallback((additionalData = {}) => {
    stepTracker.trackDraftSaved(stepNumber, additionalData);
  }, [stepNumber]);

  // Specific tracking methods for different step types
  const trackOTP = useCallback((action, additionalData = {}) => {
    stepTracker.trackOTP(stepNumber, action, additionalData);
  }, [stepNumber]);

  const trackDocumentUpload = useCallback((documentType, status, additionalData = {}) => {
    stepTracker.trackDocumentUpload(stepNumber, documentType, status, additionalData);
  }, [stepNumber]);

  // Helper to create field event handlers
  const createFieldHandlers = useCallback((fieldName) => ({
    onFocus: () => trackFieldFocus(fieldName),
    onBlur: (e) => trackFieldComplete(fieldName, e.target.value),
    onChange: (e) => {
      // Track completion for checkboxes and selects on change
      if (e.target.type === 'checkbox' || e.target.type === 'select-one') {
        trackFieldComplete(fieldName, e.target.value || e.target.checked);
      }
    }
  }), [trackFieldFocus, trackFieldComplete]);

  // Helper to track form errors
  const trackFormErrors = useCallback((errors) => {
    Object.keys(errors).forEach(fieldName => {
      if (errors[fieldName]) {
        trackValidationError(fieldName, errors[fieldName].message);
      }
    });
  }, [trackValidationError]);

  return {
    // Basic tracking methods
    trackFieldFocus,
    trackFieldComplete,
    trackValidationError,
    trackStepStart,
    trackStepComplete,
    trackButtonClick,
    trackDraftSave,
    
    // Specific tracking methods
    trackOTP,
    trackDocumentUpload,
    
    // Helper methods
    createFieldHandlers,
    trackFormErrors,
    
    // Application management
    updateApplicationId: useCallback((applicationId) => {
      stepTracker.updateApplicationId(applicationId);
    }, []),
    
    // Direct access to stepTracker for advanced use cases
    stepTracker,
  };
};

export default useStepTracking;
