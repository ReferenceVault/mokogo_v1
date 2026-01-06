// Application constants

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Application status
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

// Application steps
export const APPLICATION_STEPS = {
  BASICS: 1,
  CONTACT: 2,
  EMPLOYMENT: 3,
  DOCUMENTS: 4,
  REVIEW: 5,
};

// Employment types
export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'gig_worker', label: 'Gig Worker' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' },
];

// Marital status options
export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

// Language options
export const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Hindi', label: 'Hindi' },
];

// Platform options for gig workers
export const PLATFORM_OPTIONS = [
  'Uber',
  'Pathao',
  'Foodpanda',
  'Shohoz',
  'Obhai',
  'Delivery Hero',
  'Chaldal',
  'Daraz',
];

// Document types
export const DOCUMENT_TYPES = {
  NID: 'nid',
  DRIVERS_LICENSE: 'drivers_license',
  INCOME_PROOF: 'income_proof',
  SELFIE_LIVENESS: 'selfie_liveness',
};

// Document status
export const DOCUMENT_STATUS = {
  NOT_UPLOADED: 'not_uploaded',
  PENDING_SCAN: 'pending_scan',
  SCANNING: 'scanning',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// Campaign categories
export const CAMPAIGN_CATEGORIES = {
  ELECTRIC_CAR: 'electric_car',
  STANDARD_CAR: 'standard_car',
  LUXURY_CAR: 'luxury_car',
  MOTORCYCLE: 'motorcycle',
  BICYCLE: 'bicycle',
  COMMERCIAL: 'commercial',
};

// Vehicle types
export const VEHICLE_TYPES = {
  ELECTRIC: 'electric',
  STANDARD: 'standard',
  HYBRID: 'hybrid',
};

// Campaign status
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  LIVE: 'live',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Navigation menu items
export const NAVIGATION_ITEMS = [
  { label: 'Home', href: '/', requiresAuth: false },
  // { label: 'Campaigns', href: '/campaigns', requiresAuth: false },
  { label: 'Driver', href: '/Driver', requiresAuth: false },
  { label: 'Investor', href: '/Investor', requiresAuth: false },
  { label: 'About', href: '/about', requiresAuth: false },
];

// Footer links
export const FOOTER_LINKS = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/faq' },
    { label: 'Community', href: '/community' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ],
  social: [
    { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
    { label: 'Twitter', href: 'https://twitter.com', icon: 'twitter' },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: 'linkedin' },
    { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  ],
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORD_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  PHONE_INVALID: 'Please enter a valid Bangladesh phone number',
  NID_INVALID: 'Please enter a valid NID number (10, 13, or 17 digits)',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters long',
  NAME_MAX_LENGTH: 'Name cannot exceed 50 characters',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  TERMS_REQUIRED: 'You must agree to the terms and conditions',
  AGE_MINIMUM: 'You must be at least 18 years old',
  INCOME_MINIMUM: 'Please enter a valid income amount',
  REFERENCE_REQUIRED: 'At least one reference is required',
  PLATFORMS_REQUIRED: 'Platforms are required for gig workers',
  EMPLOYER_REQUIRED: 'Employer information is required for employed persons',
};

// API error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Account created successfully! Please check your email for verification.',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  APPLICATION_SUBMITTED: 'Application submitted successfully!',
  STEP_COMPLETED: 'Step completed successfully.',
  DOCUMENT_UPLOADED: 'Document uploaded successfully.',
  PHONE_VERIFIED: 'Phone number verified successfully.',
  OTP_SENT: 'OTP sent to your phone number.',
};

// Local storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'gigly_access_token',
  REFRESH_TOKEN: 'gigly_refresh_token',
  USER_DATA: 'gigly_user_data',
  THEME: 'gigly_theme',
  LANGUAGE: 'gigly_language',
  REMEMBER_ME: 'gigly_remember_me',
  APPLICATION_DRAFT: 'gigly_application_draft',
};

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Loading states
export const LOADING_STATES = {
  IDLE: 'idle',
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
};

export default {
  GENDER_OPTIONS,
  APPLICATION_STATUS,
  APPLICATION_STEPS,
  EMPLOYMENT_TYPES,
  MARITAL_STATUS_OPTIONS,
  LANGUAGE_OPTIONS,
  PLATFORM_OPTIONS,
  DOCUMENT_TYPES,
  DOCUMENT_STATUS,
  CAMPAIGN_CATEGORIES,
  VEHICLE_TYPES,
  CAMPAIGN_STATUS,
  NAVIGATION_ITEMS,
  FOOTER_LINKS,
  VALIDATION_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  THEME_MODES,
  LOADING_STATES,
  PAGINATION,
};
