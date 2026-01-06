/**
 * LocalStorage utility functions for application calculator data
 */

const CALCULATOR_DATA_KEY = 'applicationCalculatorData';

/**
 * Get saved calculator data from localStorage
 * @returns {Object|null} Calculator data or null if not found
 */
export const getCalculatorData = () => {
  try {
    const savedData = localStorage.getItem(CALCULATOR_DATA_KEY);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error('❌ Error reading calculator data from localStorage:', error);
    return null;
  }
};

/**
 * Save calculator data to localStorage
 * @param {Object} data - Calculator data to save
 */
export const saveCalculatorData = (data) => {
  try {
    localStorage.setItem(CALCULATOR_DATA_KEY, JSON.stringify(data));
    console.log('💾 Saved calculator data to localStorage:', data);
  } catch (error) {
    console.error('❌ Error saving calculator data to localStorage:', error);
  }
};

/**
 * Clear calculator data from localStorage
 */
export const clearCalculatorData = () => {
  try {
    localStorage.removeItem(CALCULATOR_DATA_KEY);
    console.log('🗑️ Cleared calculator data from localStorage');
  } catch (error) {
    console.error('❌ Error clearing calculator data from localStorage:', error);
  }
};

/**
 * Check if calculator data exists in localStorage
 * @returns {boolean} True if data exists
 */
export const hasCalculatorData = () => {
  try {
    return localStorage.getItem(CALCULATOR_DATA_KEY) !== null;
  } catch (error) {
    console.error('❌ Error checking calculator data in localStorage:', error);
    return false;
  }
};