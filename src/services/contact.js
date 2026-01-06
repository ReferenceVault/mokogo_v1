import { apiService } from './api';
import { formatErrorForUI } from '../utils/errorHandler';

// Contact service for handling contact form submissions
export const contactService = {
  // Submit contact form
  submitContactForm: async (formData) => {
    try {
      const response = await apiService.post('/api/contact', formData);
      return {
        success: true,
        data: response.data,
        message: 'Message sent successfully!'
      };
    } catch (error) {
      console.error('Contact form submission error:', error);
      return {
        success: false,
        error: formatErrorForUI(error),
        message: 'Failed to send message. Please try again.'
      };
    }
  },

  // Send inquiry email
  sendInquiry: async (inquiryData) => {
    try {
      const response = await apiService.post('/api/contact/inquiry', inquiryData);
      return {
        success: true,
        data: response.data,
        message: 'Inquiry sent successfully!'
      };
    } catch (error) {
      console.error('Inquiry submission error:', error);
      return {
        success: false,
        error: formatErrorForUI(error),
        message: 'Failed to send inquiry. Please try again.'
      };
    }
  },

  // Send partnership inquiry
  sendPartnershipInquiry: async (partnershipData) => {
    try {
      const response = await apiService.post('/api/contact/partnership', partnershipData);
      return {
        success: true,
        data: response.data,
        message: 'Partnership inquiry sent successfully!'
      };
    } catch (error) {
      console.error('Partnership inquiry error:', error);
      return {
        success: false,
        error: formatErrorForUI(error),
        message: 'Failed to send partnership inquiry. Please try again.'
      };
    }
  },

  // Get contact information
  getContactInfo: async () => {
    try {
      const response = await apiService.get('/api/contact/info');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get contact info error:', error);
      return {
        success: false,
        error: formatErrorForUI(error)
      };
    }
  }
};

export default contactService;
