// Centralized API endpoints configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    REFRESH: '/api/users/refresh',
    LOGOUT: '/api/users/logout',
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    FORGOT_PASSWORD: '/api/users/forgot-password',
    RESET_PASSWORD: '/api/users/reset-password',
    VERIFY_EMAIL: '/api/users/verify-email',
  },

  // Campaign endpoints
  CAMPAIGNS: {
    LIST: '/api/campaigns',
    DETAIL: (id) => `/api/campaigns/${id}`,
    SEARCH: '/api/campaigns/search',
    BY_CATEGORY: (category) => `/api/campaigns/category/${category}`,
    FEATURED: '/api/campaigns/featured',
    STATS: '/api/campaigns/stats',
    CREATE: '/api/campaigns',
    UPDATE: (id) => `/api/campaigns/${id}`,
    DELETE: (id) => `/api/campaigns/${id}`,
    APPLY: (id) => `/api/campaigns/${id}/apply`,
  },

  // Application endpoints
  APPLICATIONS: {
    CREATE: '/api/applications',
    GET_ALL: '/api/applications',
    GET_BY_ID: (id) => `/api/applications/${id}`,
    GET_PROGRESS: (id) => `/api/applications/${id}/progress`,
    GET_DOCUMENTS: (id) => `/api/applications/${id}/documents`,
    BY_CAMPAIGN: (campaignId) => `/api/applications/campaign/${campaignId}`,
    LIST: '/api/applications',
    DASHBOARD: '/api/applications/dashboard',
    DETAIL: (id) => `/api/applications/${id}`,
    PROGRESS: (id) => `/api/applications/${id}/progress`,
    SEND_OTP: (id) => `/api/applications/${id}/request-otp`,
    UPDATE_BASICS: (id) => `/api/applications/${id}/basics`,
    UPDATE_CONTACT: (id) => `/api/applications/${id}/contact`,
    UPDATE_CREDIT_SCORE: (id) => `/api/applications/${id}/credit-score`,
    UPDATE_EMPLOYMENT: (id) => `/api/applications/${id}/employment`,
    UPLOAD_DOCUMENT: (id) => `/api/applications/${id}/documents`,
    DOWNLOAD_DOCUMENT: (id, filename) => `/api/applications/${id}/documents/${filename}`,
    SUBMIT: (id) => `/api/applications/${id}/submit`,
    SUBMIT_DOCUMENTS: (id) => `/api/applications/${id}/submit-documents`,
    WITHDRAW: (id) => `/api/applications/${id}/withdraw`,
    REQUEST_OTP: (id) => `/api/applications/${id}/request-otp`,
    VERIFY_OTP: (id) => `/api/applications/${id}/verify-otp`,
  },

  // User endpoints
  USERS: {
    LIST: '/api/users',
    DETAIL: (id) => `/api/users/${id}`,
    SEARCH: '/api/users/search',
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
    AVATAR: (id) => `/api/users/${id}/avatar`,
  },

  // File upload endpoints
  UPLOADS: {
    AVATAR: '/api/uploads/avatar',
    DOCUMENTS: '/api/uploads/documents',
    CAMPAIGN_IMAGES: '/api/uploads/campaign-images',
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: '/api/notifications/mark-all-read',
    DELETE: (id) => `/api/notifications/${id}`,
  },

  // Admin endpoints (if needed)
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    CAMPAIGNS: '/api/admin/campaigns',
    APPLICATIONS: '/api/admin/applications',
    STATS: '/api/admin/stats',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// Error Types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
};

// Error Messages
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
  [ERROR_TYPES.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ERROR_TYPES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION_ERROR]: 'Please log in to continue.',
  [ERROR_TYPES.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
  [ERROR_TYPES.NOT_FOUND_ERROR]: 'The requested resource was not found.',
  [ERROR_TYPES.SERVER_ERROR]: 'Server error occurred. Please try again later.',
  [ERROR_TYPES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
  [ERROR_TYPES.RATE_LIMIT_ERROR]: 'Too many requests. Please try again later.',
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30020; // 30 seconds

// Default pagination settings
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 12,
  MAX_LIMIT: 50,
};

export default {
  API_ENDPOINTS,
  HTTP_STATUS,
  ERROR_TYPES,
  ERROR_MESSAGES,
  REQUEST_TIMEOUT,
  PAGINATION_DEFAULTS,
  API_BASE_URL,
};
