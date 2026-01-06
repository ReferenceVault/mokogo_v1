// Environment configuration
const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002',
  API_TIMEOUT: 30020, // 30 seconds
  
  // Google OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  
  // Application Configuration
  APP_NAME: 'Gigly',
  APP_DESCRIPTION: 'Vehicle Investment Platform',
  APP_VERSION: '1.0.0',
  
  // URLs
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001',
  
  // Development flags
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
  
  // Feature flags
  FEATURES: {
    GOOGLE_AUTH: true,
    EMAIL_VERIFICATION: true,
    PASSWORD_RESET: true,
    REMEMBER_ME: true,
  },
  
  // Storage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'gigly_access_token',
    REFRESH_TOKEN: 'gigly_refresh_token',
    USER_DATA: 'gigly_user_data',
    THEME: 'gigly_theme',
    LANGUAGE: 'gigly_language',
  },
  
  // API Endpoints
  API_ENDPOINTS: {
    // Authentication
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    LOGOUT: '/api/users/logout',
    REFRESH_TOKEN: '/api/users/refresh-token',
    FORGOT_PASSWORD: '/api/users/forgot-password',
    RESET_PASSWORD: '/api/users/reset-password',
    VERIFY_EMAIL: '/api/users/verify-email',
    SEND_VERIFICATION: '/api/users/send-verification',
    
    // User Profile
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    
    // OTP and Email Verification
    SEND_PHONE_OTP: (userId) => `/api/users/${userId}/send-otp`,
    VERIFY_PHONE_OTP: (userId) => `/api/users/${userId}/verify-otp`,
    SEND_EMAIL_VERIFICATION: (userId) => `/api/users/${userId}/send-email-verification`,
    VERIFY_EMAIL_TOKEN: '/api/verify-email',
    OTP_HEALTH: '/api/otp/health',
    
    // Applications
    APPLICATIONS: '/api/applications',
    APPLICATION_SUBMIT: '/api/applications/:id/submit',
    
    // Campaigns
    CAMPAIGNS: '/api/campaigns',
    CAMPAIGN_DETAILS: '/api/campaigns/:id',
  },
  
  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    PHONE_REGEX: /^(\+880|880|0)?1[3-9][0-9]{8}$/,
    EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  
  // UI Configuration
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 500,
    TOAST_DURATION: 5000,
    PAGINATION_LIMIT: 12,
  },
  
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
};

// Validation function for required environment variables
export const validateEnv = () => {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars);
  }
  
  return missingVars.length === 0;
};

// Get full API URL
export const getApiUrl = (endpoint) => {
  return `${env.API_URL}${endpoint}`;
};

// Get environment-specific configuration
export const getConfig = () => {
  if (env.IS_DEVELOPMENT) {
    return {
      ...env,
      DEBUG: true,
      LOG_LEVEL: 'debug',
    };
  }
  
  if (env.IS_PRODUCTION) {
    return {
      ...env,
      DEBUG: false,
      LOG_LEVEL: 'error',
    };
  }
  
  return env;
};

export default env;
