import { VALIDATION_MESSAGES, ERROR_MESSAGES } from './constants';

// Format currency (BDT)
export const formatCurrency = (amount, currency = 'BDT') => {
  if (typeof amount !== 'number') return '0';
  
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('en-BD');
};

// Format date
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Deep clone object
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

// Check if object is empty
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
  return Object.keys(obj).length === 0;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Generate random string
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Validate Bangladesh phone number
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+880|880|0)?1[3-9][0-9]{8}$/;
  return phoneRegex.test(phone);
};

// Validate password strength
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push(VALIDATION_MESSAGES.REQUIRED);
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_WEAK);
  }
  
  return { isValid: errors.length === 0, errors };
};

// Validate NID number
export const isValidNID = (nid) => {
  const nidRegex = /^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$/;
  return nidRegex.test(nid);
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as +880 1XXX-XXXXXX
  if (digits.startsWith('880')) {
    const formatted = digits.replace(/^880/, '+880 ');
    return formatted.replace(/(\+880 \d{4})(\d{6})/, '$1-$2');
  }
  
  if (digits.startsWith('01')) {
    return digits.replace(/^0/, '+880 ').replace(/(\+880 \d{4})(\d{6})/, '$1-$2');
  }
  
  return phone;
};

// Mask sensitive data
export const maskData = (data, type = 'default') => {
  if (!data) return '';
  
  switch (type) {
    case 'email':
      const [username, domain] = data.split('@');
      const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
      return `${maskedUsername}@${domain}`;
    
    case 'phone':
      return data.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
    
    case 'nid':
      return '*'.repeat(data.length - 4) + data.slice(-4);
    
    default:
      return '*'.repeat(data.length);
  }
};

// Handle API errors
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (!error) {
    return ERROR_MESSAGES.GENERIC_ERROR;
  }
  
  // Network error
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  const { status, data } = error.response;
  
  // Extract error message from response
  const errorMessage = data?.message || data?.error || ERROR_MESSAGES.GENERIC_ERROR;
  
  switch (status) {
    case 400:
      return errorMessage || ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return errorMessage;
  }
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Cookie helpers
export const cookies = {
  set: (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  },
  
  get: (name) => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let c of ca) {
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
  
  remove: (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};

// URL helpers
export const url = {
  addParams: (baseUrl, params) => {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  },
  
  getParams: (search = window.location.search) => {
    return Object.fromEntries(new URLSearchParams(search));
  },
};

// Scroll helpers
export const scroll = {
  toTop: (smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  },
  
  toElement: (elementId, smooth = true) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start',
      });
    }
  },
};

// Device detection
export const device = {
  isMobile: () => window.innerWidth <= 768,
  isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: () => window.innerWidth > 1024,
  
  getBreakpoint: () => {
    const width = window.innerWidth;
    if (width <= 640) return 'xs';
    if (width <= 768) return 'sm';
    if (width <= 1024) return 'md';
    if (width <= 1280) return 'lg';
    return 'xl';
  },
};

export default {
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  capitalize,
  generateId,
  isValidEmail,
  isValidPhone,
  validatePassword,
  isValidNID,
  calculateAge,
  formatPhoneNumber,
  maskData,
  handleApiError,
  storage,
  cookies,
  url,
  scroll,
  device,
};
