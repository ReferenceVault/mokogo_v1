import { apiService } from './api';
import { logError, logInfo } from '../utils/logger';

/**
 * Verification Service
 * Handles phone OTP and email verification
 */
class VerificationService {
  /**
   * Send phone OTP
   * @param {string} userId - User ID
   * @param {string} phone - Phone number
   * @returns {Promise<Object>} Response object
   */
  async sendPhoneOTP(userId, phone) {
    try {
      logInfo('Sending phone OTP', { userId, phone: phone.slice(-4) }); // Log last 4 digits for privacy
      
      const response = await apiService.verification.sendPhoneOTP(userId, phone);
      
      if (response.data.success) {
        logInfo('Phone OTP sent successfully', { userId });
        return {
          success: true,
          message: response.data.message || 'OTP sent successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      logError('Failed to send phone OTP', error, { userId, phone: phone.slice(-4) });
      throw error;
    }
  }

  /**
   * Verify phone OTP
   * @param {string} userId - User ID
   * @param {string} phone - Phone number
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} Response object
   */
  async verifyPhoneOTP(userId, phone, otp) {
    try {
      logInfo('Verifying phone OTP', { userId, phone: phone.slice(-4) });
      
      const response = await apiService.verification.verifyPhoneOTP(userId, phone, otp);
      
      if (response.data.success && response.data.verified) {
        logInfo('Phone OTP verified successfully', { userId });
        return {
          success: true,
          verified: true,
          message: response.data.message || 'Phone verified successfully'
        };
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      logError('Failed to verify phone OTP', error, { userId, phone: phone.slice(-4) });
      throw error;
    }
  }

  /**
   * Send email verification
   * @param {string} userId - User ID
   * @param {string} email - Email address
   * @returns {Promise<Object>} Response object
   */
  async sendEmailVerification(userId, email) {
    try {
      logInfo('Sending email verification', { userId, email });
      
      const response = await apiService.verification.sendEmailVerification(userId, email);
      
      if (response.data.success) {
        logInfo('Email verification sent successfully', { userId, email });
        return {
          success: true,
          message: response.data.message || 'Verification email sent successfully'
        };
      } else {
        throw new Error(response.data.message || 'Failed to send verification email');
      }
    } catch (error) {
      logError('Failed to send email verification', error, { userId, email });
      throw error;
    }
  }

  /**
   * Verify email token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Response object
   */
  async verifyEmailToken(token) {
    try {
      logInfo('Verifying email token', { token: token.slice(0, 8) + '...' }); // Log partial token for privacy
      
      const response = await apiService.verification.verifyEmailToken(token);
      
      if (response.data.success && response.data.verified) {
        logInfo('Email verified successfully', { token: token.slice(0, 8) + '...' });
        return {
          success: true,
          verified: true,
          message: response.data.message || 'Email verified successfully'
        };
      } else {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error) {
      logError('Failed to verify email token', error, { token: token.slice(0, 8) + '...' });
      throw error;
    }
  }

  /**
   * Check OTP service health
   * @returns {Promise<Object>} Health check response
   */
  async checkHealth() {
    try {
      const response = await apiService.verification.checkOTPHealth();
      return {
        success: true,
        healthy: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      logError('OTP service health check failed', error);
      return {
        success: false,
        healthy: false,
        message: 'Service unavailable'
      };
    }
  }
}

// Create and export a singleton instance
const verificationService = new VerificationService();
export default verificationService;
