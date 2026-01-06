import { HTTP_STATUS, ERROR_TYPES, ERROR_MESSAGES } from '../config/api';

// Custom API Error class
export class APIError extends Error {
  constructor(message, type, status, details = null) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Error type classifier based on status code
export const classifyError = (status, error) => {
  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_TYPES.VALIDATION_ERROR;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_TYPES.AUTHENTICATION_ERROR;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_TYPES.AUTHORIZATION_ERROR;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_TYPES.NOT_FOUND_ERROR;
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return ERROR_TYPES.VALIDATION_ERROR;
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return ERROR_TYPES.RATE_LIMIT_ERROR;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
    case HTTP_STATUS.GATEWAY_TIMEOUT:
      return ERROR_TYPES.SERVER_ERROR;
    default:
      if (error?.code === 'ECONNABORTED') return ERROR_TYPES.TIMEOUT_ERROR;
      if (error?.code === 'NETWORK_ERROR') return ERROR_TYPES.NETWORK_ERROR;
      return ERROR_TYPES.UNKNOWN_ERROR;
  }
};

// Get user-friendly error message
export const getErrorMessage = (errorType, customMessage = null) => {
  return customMessage || ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN_ERROR];
};

// Handle API response errors
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  console.log("error.message", error.message);
  
  // Network errors (no response)
  if (!error.response) {
    const errorType = error.code === 'ECONNABORTED' 
      ? ERROR_TYPES.TIMEOUT_ERROR 
      : ERROR_TYPES.NETWORK_ERROR;
    
    return new APIError(
      getErrorMessage(errorType),
      errorType,
      null,
      { originalError: error.message }
    );
  }

  // HTTP errors (with response)
  const { status, data } = error.response;
  const errorType = classifyError(status, error);
  
  // Extract error message from response
  let message = getErrorMessage(errorType);
  let details = null;

  if (data) {
    // Backend error message
    if (data.message) {
      message = data.message;
    }
    
    // Validation errors
    if (data.errors) {
      details = data.errors;
      if (typeof data.errors === 'object') {
        // Convert validation errors to readable format
        const errorFields = Object.keys(data.errors);
        if (errorFields.length > 0) {
          message = `Validation failed: ${errorFields.join(', ')}`;
        }
      }
    }

    // Other error details
    if (data.error && typeof data.error === 'string') {
      message = data.error;
    }
  }

  return new APIError(message, errorType, status, details);
};

// Handle different types of errors for UI display
export const formatErrorForUI = (error) => {
  // Always return a plain serializable object
  const createErrorObject = (title, message, type, details = null, canRetry = true, showDetails = false) => ({
    title,
    message,
    type,
    details,
    canRetry,
    showDetails,
  });

  if (error instanceof APIError) {
    return createErrorObject(
      getErrorTitle(error.type),
      error.message,
      error.type,
      error.details,
      canRetryError(error.type),
      shouldShowDetails(error.type)
    );
  }

  // Handle specific business logic errors by message content
  if (typeof error === 'object' && error.message) {
    const message = error.message.toLowerCase();
    
    if (message.includes('already applied')) {
      return createErrorObject(
        'Already Applied',
        'You have already submitted an application for this campaign.',
        ERROR_TYPES.VALIDATION_ERROR,
        ['You can view your existing application in your dashboard.'],
        false,
        true
      );
    }
    
    if (message.includes('campaign not found')) {
      return createErrorObject(
        'Campaign Not Found',
        'This campaign is no longer available.',
        ERROR_TYPES.NOT_FOUND_ERROR,
        ['The campaign may have been removed or expired.'],
        false,
        true
      );
    }
    
    if (message.includes('campaign closed')) {
      return createErrorObject(
        'Campaign Closed',
        'Applications for this campaign are no longer being accepted.',
        ERROR_TYPES.VALIDATION_ERROR,
        ['This campaign has reached its deadline or capacity.'],
        false,
        true
      );
    }

    if (message.includes('network error') || message.includes('fetch')) {
      return createErrorObject(
        'Connection Problem',
        'Please check your internet connection and try again.',
        ERROR_TYPES.NETWORK_ERROR,
        null,
        true,
        false
      );
    }
  }

  // Fallback for non-API errors
  return createErrorObject(
    'Error',
    error.message || 'An unexpected error occurred',
    ERROR_TYPES.UNKNOWN_ERROR,
    null,
    true,
    false
  );
};

// Get error title for UI
const getErrorTitle = (errorType) => {
  const titles = {
    [ERROR_TYPES.NETWORK_ERROR]: 'Connection Error',
    [ERROR_TYPES.TIMEOUT_ERROR]: 'Timeout Error',
    [ERROR_TYPES.VALIDATION_ERROR]: 'Invalid Input',
    [ERROR_TYPES.AUTHENTICATION_ERROR]: 'Authentication Required',
    [ERROR_TYPES.AUTHORIZATION_ERROR]: 'Access Denied',
    [ERROR_TYPES.NOT_FOUND_ERROR]: 'Not Found',
    [ERROR_TYPES.SERVER_ERROR]: 'Server Error',
    [ERROR_TYPES.RATE_LIMIT_ERROR]: 'Rate Limit Exceeded',
    [ERROR_TYPES.UNKNOWN_ERROR]: 'Error',
  };
  return titles[errorType] || 'Error';
};

// Determine if error can be retried
const canRetryError = (errorType) => {
  const retryableErrors = [
    ERROR_TYPES.NETWORK_ERROR,
    ERROR_TYPES.TIMEOUT_ERROR,
    ERROR_TYPES.SERVER_ERROR,
  ];
  return retryableErrors.includes(errorType);
};

// Determine if error details should be shown
const shouldShowDetails = (errorType) => {
  return errorType === ERROR_TYPES.VALIDATION_ERROR;
};

// Log error for debugging
export const logError = (error, context = '') => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      type: error.type || 'Unknown',
      status: error.status || null,
      stack: error.stack,
      details: error.details || null,
    },
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'N/A',
  };

  console.group(`🚨 Error in ${context || 'Unknown context'}`);
  console.error('Error Details:', errorInfo);
  console.groupEnd();

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or Bugsnag
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }
};

// Retry helper with exponential backoff
export const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      const delay = initialDelay * Math.pow(2, retries - 1);
      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export default {
  APIError,
  handleAPIError,
  formatErrorForUI,
  logError,
  retryWithBackoff,
  classifyError,
  getErrorMessage,
};
