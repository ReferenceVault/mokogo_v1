/**
 * Simple logger utility for frontend
 * Provides consistent logging interface
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logInfo = (message, data = {}) => {
  if (isDevelopment) {
    console.log(`ℹ️ ${message}`, data);
  }
};

export const logError = (message, error, data = {}) => {
  if (isDevelopment) {
    console.error(`❌ ${message}`, { error, ...data });
  }
};

export const logWarning = (message, data = {}) => {
  if (isDevelopment) {
    console.warn(`⚠️ ${message}`, data);
  }
};

export const logDebug = (message, data = {}) => {
  if (isDevelopment) {
    console.debug(`🐛 ${message}`, data);
  }
};
