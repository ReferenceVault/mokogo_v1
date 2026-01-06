import { toast } from 'react-hot-toast';

/**
 * Comprehensive API Error Handler
 * Handles all types of API errors and provides user-friendly messages
 */
export class APIErrorHandler {
  /**
   * Handle API errors and return user-friendly messages
   */
  static handleError(error, context = '') {
    console.error(`API Error in ${context}:`, error);

    let userMessage = 'Something went wrong. Please try again.';
    let shouldRetry = false;
    let isNetworkError = false;

    // Ensure error is an object and handle malformed errors
    if (!error || typeof error !== 'object') {
      console.warn('Malformed error object received:', error);
      return {
        userMessage: 'An unexpected error occurred. Please try again.',
        shouldRetry: false,
        isNetworkError: false,
        originalError: error
      };
    }

    // Handle different types of errors
    if (error.name === 'APIError') {
      userMessage = this.handleAPIError(error);
    } else if (error.name === 'NetworkError' || (error.message && error.message.includes('Network'))) {
      userMessage = 'Network connection failed. Please check your internet connection and try again.';
      isNetworkError = true;
      shouldRetry = true;
    } else if (error.name === 'TypeError' && error.message && error.message.includes('fetch')) {
      userMessage = 'Unable to connect to the server. Please check your connection and try again.';
      isNetworkError = true;
      shouldRetry = true;
    } else if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      userMessage = 'Request timed out. Please try again.';
      shouldRetry = true;
    } else if (error.response) {
      // HTTP response error
      userMessage = this.handleHTTPError(error.response, context);
    } else if (error.request) {
      // Network request error
      userMessage = 'Network request failed. Please check your connection and try again.';
      isNetworkError = true;
      shouldRetry = true;
    } else if (error.message) {
      // Generic error with message
      userMessage = error.message;
    } else if (error.status && error.url) {
      // Handle error objects with status and url
      userMessage = `Request failed with status ${error.status}. Please try again.`;
      shouldRetry = error.status >= 500; // Retry server errors
    } else if (error.message && error.message.includes('Cannot convert undefined or null to object')) {
      // Handle specific error from the user's issue
      userMessage = 'File upload failed. Please try again with a different file.';
      shouldRetry = true;
      console.warn('File conversion error detected:', error);
    } else {
      // Fallback for completely unknown error types
      userMessage = 'An unexpected error occurred. Please try again.';
      console.warn('Unknown error type:', error);
    }

    return {
      userMessage,
      shouldRetry,
      isNetworkError,
      originalError: error
    };
  }

  /**
   * Handle HTTP response errors
   */
  static handleHTTPError(response, context = '') {
    const { status, data } = response;
    
    switch (status) {
      case 400:
        return this.handleBadRequest(data, context);
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return this.handleNotFound(context);
      case 409:
        return this.handleConflict(data, context);
      case 413:
        return 'File is too large. Please select a smaller file.';
      case 415:
        return 'File type not supported. Please use PDF, JPG, or PNG files.';
      case 422:
        return this.handleValidationError(data, context);
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Request failed (${status}). Please try again.`;
    }
  }

  /**
   * Handle API-specific errors
   */
  static handleAPIError(error) {
    if (error.message) {
      return error.message;
    }
    return 'An error occurred. Please try again.';
  }

  /**
   * Handle 400 Bad Request errors
   */
  static handleBadRequest(data, context) {
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }
    return 'Invalid request. Please check your input and try again.';
  }

  /**
   * Handle 404 Not Found errors
   */
  static handleNotFound(context) {
    switch (context) {
      case 'campaign':
        return 'Campaign not found. It may have been removed or is no longer available.';
      case 'application':
        return 'Application not found. Please refresh the page and try again.';
      case 'document':
        return 'Document not found. It may have been deleted.';
      case 'user':
        return 'User not found. Please log in again.';
      default:
        return 'The requested resource was not found.';
    }
  }

  /**
   * Handle 409 Conflict errors
   */
  static handleConflict(data, context) {
    if (data?.message) {
      return data.message;
    }
    switch (context) {
      case 'application':
        return 'You have already applied for this campaign.';
      case 'email':
        return 'This email address is already registered.';
      case 'phone':
        return 'This phone number is already registered.';
      default:
        return 'This action conflicts with existing data.';
    }
  }

  /**
   * Handle 422 Validation errors
   */
  static handleValidationError(data, context) {
    if (data?.message) {
      return data.message;
    }
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.join(', ');
    }
    return 'Please check your input and try again.';
  }

  /**
   * Show error toast with retry option
   */
  static showErrorToast(error, context = '', onRetry = null) {
    const { userMessage, shouldRetry } = this.handleError(error, context);
    
    if (shouldRetry && onRetry) {
      toast.error(
        (t) => (
          <div className="flex items-center justify-between">
            <span>{userMessage}</span>
            <button
              onClick={() => {
                onRetry();
                toast.dismiss(t.id);
              }}
              className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Retry
            </button>
          </div>
        ),
        { duration: 6000 }
      );
    } else {
      toast.error(userMessage, { duration: 5000 });
    }
  }

  /**
   * Show success toast
   */
  static showSuccessToast(message) {
    toast.success(message, { duration: 3002 });
  }

  /**
   * Show warning toast
   */
  static showWarningToast(message) {
    toast(message, { 
      icon: '⚠️',
      duration: 4000,
      style: {
        background: '#fbbf24',
        color: '#1f2937'
      }
    });
  }

  /**
   * Check if error is retryable
   */
  static isRetryableError(error) {
    const { shouldRetry } = this.handleError(error);
    return shouldRetry;
  }

  /**
   * Get retry delay based on error type
   */
  static getRetryDelay(error) {
    if (error.code === 'ECONNABORTED') {
      return 2000; // 2 seconds for timeout errors
    }
    if (error.name === 'NetworkError') {
      return 3002; // 3 seconds for network errors
    }
    return 1000; // 1 second default
  }
}

/**
 * Wrapper function for API calls with error handling
 */
export const withErrorHandling = async (apiCall, context = '', onRetry = null) => {
  try {
    const result = await apiCall();
    return { success: true, data: result };
  } catch (error) {
    const errorInfo = APIErrorHandler.handleError(error, context);
    
    // Show error toast
    APIErrorHandler.showErrorToast(error, context, onRetry);
    
    return { 
      success: false, 
      error: errorInfo,
      retry: onRetry && errorInfo.shouldRetry ? onRetry : null
    };
  }
};

/**
 * Retry wrapper for failed API calls
 */
export const withRetry = async (apiCall, maxRetries = 3, context = '') => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiCall();
      return { success: true, data: result };
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        // Final attempt failed
        const errorInfo = APIErrorHandler.handleError(error, context);
        APIErrorHandler.showErrorToast(error, context);
        return { success: false, error: errorInfo };
      }
      
      // Check if error is retryable
      if (!APIErrorHandler.isRetryableError(error)) {
        const errorInfo = APIErrorHandler.handleError(error, context);
        APIErrorHandler.showErrorToast(error, context);
        return { success: false, error: errorInfo };
      }
      
      // Wait before retrying
      const delay = APIErrorHandler.getRetryDelay(error);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      console.log(`Retrying API call (attempt ${attempt + 1}/${maxRetries})...`);
    }
  }
  
  return { success: false, error: lastError };
};

export default APIErrorHandler;
