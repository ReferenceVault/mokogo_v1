import axios from 'axios';
import { storage } from '../utils/helpers';
import env from '../config/env';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = storage.get(env.STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - let browser set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (env.IS_DEVELOPMENT) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data instanceof FormData ? 'FormData' : config.data,
        headers: config.headers,
        isFormData: config.data instanceof FormData
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common response scenarios
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    // Log response in development
    if (env.IS_DEVELOPMENT) {
      console.log('✅ API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: `${duration}ms`,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development (serializable data only)
    if (env.IS_DEVELOPMENT) {
      console.error('❌ API Error:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = storage.get(env.STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const response = await api.post(env.API_ENDPOINTS.REFRESH_TOKEN, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          storage.set(env.STORAGE_KEYS.ACCESS_TOKEN, accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        storage.remove(env.STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(env.STORAGE_KEYS.REFRESH_TOKEN);
        storage.remove(env.STORAGE_KEYS.USER_DATA);

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// API service methods
export const apiService = {
  // Generic HTTP methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // Authentication methods
  auth: {
    login: (credentials) => 
      api.post(env.API_ENDPOINTS.LOGIN, credentials),

    register: (userData) => 
      api.post(env.API_ENDPOINTS.REGISTER, userData),

    logout: () => 
      api.post(env.API_ENDPOINTS.LOGOUT),

    refreshToken: (refreshToken) => 
      api.post(env.API_ENDPOINTS.REFRESH_TOKEN, { refreshToken }),

    forgotPassword: async (email) => {
      try {
        return await api.post(env.API_ENDPOINTS.FORGOT_PASSWORD, { email });
      } catch (error) {
        // Handle 400 as expected behavior for non-existing emails
        if (error.response?.status === 400) {
          return error.response; // Return the response instead of throwing
        }
        throw error; // Re-throw other errors
      }
    },

    resetPassword: (token, newPassword) => 
      api.post(env.API_ENDPOINTS.RESET_PASSWORD, { token, newPassword }),

    verifyEmail: (token) => 
      api.post(env.API_ENDPOINTS.VERIFY_EMAIL, { token }),

    sendVerification: () => 
      api.post(env.API_ENDPOINTS.SEND_VERIFICATION),
  },

  // OTP and Email Verification methods
  verification: {
    sendPhoneOTP: (userId, phone) => 
      api.post(env.API_ENDPOINTS.SEND_PHONE_OTP(userId), { phone }),

    verifyPhoneOTP: (userId, phone, otp) => 
      api.post(env.API_ENDPOINTS.VERIFY_PHONE_OTP(userId), { phone, otp }),

    sendEmailVerification: (userId, email) => 
      api.post(env.API_ENDPOINTS.SEND_EMAIL_VERIFICATION(userId), { email }),

    verifyEmailToken: (token) => 
      api.get(env.API_ENDPOINTS.VERIFY_EMAIL_TOKEN, { params: { token } }),

    checkOTPHealth: () => 
      api.get(env.API_ENDPOINTS.OTP_HEALTH),
  },

  // User profile methods
  user: {
    getProfile: () => 
      api.get(env.API_ENDPOINTS.PROFILE),

    updateProfile: (userData) => 
      api.put(env.API_ENDPOINTS.UPDATE_PROFILE, userData),

    changePassword: (passwordData) => 
      api.post(env.API_ENDPOINTS.CHANGE_PASSWORD, passwordData),

    // Admin methods for user management
    getAll: (params = {}) => 
      api.get('/api/users', { params }),

    getById: (id) => 
      api.get(`/api/users/${id}`),

    deactivate: (id) => 
      api.delete(`/api/users/${id}`),

    reactivate: (id) => 
      api.post(`/api/users/${id}/reactivate`),
  },

  // Campaign methods
  campaigns: {
    getAll: (params = {}) => 
      api.get(env.API_ENDPOINTS.CAMPAIGNS, { params }),

    getById: (id) => 
      api.get(env.API_ENDPOINTS.CAMPAIGN_DETAILS.replace(':id', id)),

    search: (query, params = {}) => 
      api.get(env.API_ENDPOINTS.CAMPAIGNS, { 
        params: { search: query, ...params } 
      }),

    // Admin methods
    getAllAdmin: (params = {}) =>
      api.get(`${env.API_ENDPOINTS.CAMPAIGNS}/admin`, { params }),
    getByIdAdmin: (id) =>
      api.get(`${env.API_ENDPOINTS.CAMPAIGNS}/admin/${id}`),
    create: (campaignData) =>
      api.post('/api/admin/campaigns', campaignData),
    update: (id, campaignData) =>
      api.put(`/api/admin/campaigns/${id}`, campaignData),
    delete: (id) =>
      api.delete(`/api/admin/campaigns/${id}`),
  },

  // Application methods
  applications: {
    getAll: (params = {}) => 
      api.get(env.API_ENDPOINTS.APPLICATIONS, { params }),

    getById: (id) => 
      api.get(`${env.API_ENDPOINTS.APPLICATIONS}/${id}`),

    create: (campaignId) => 
      api.post(env.API_ENDPOINTS.APPLICATIONS, { campaignId }),

    updateBasics: (id, data) => 
      api.put(`${env.API_ENDPOINTS.APPLICATIONS}/${id}/basics`, data),

    updateContact: (id, data) => 
      api.put(`${env.API_ENDPOINTS.APPLICATIONS}/${id}/contact`, data),

    sendOTP: (id, phoneNumber) => 
      api.post(`${env.API_ENDPOINTS.APPLICATIONS}/${id}/send-otp`, { phoneNumber }),

    verifyOTP: (id, phoneNumber, otp) => 
      api.post(`${env.API_ENDPOINTS.APPLICATIONS}/${id}/verify-otp`, { phoneNumber, otp }),

    updateEmployment: (id, data) => 
      api.put(`${env.API_ENDPOINTS.APPLICATIONS}/${id}/employment`, data),

    uploadDocument: (id, data) => 
      api.post(`${env.API_ENDPOINTS.APPLICATIONS}/${id}/documents`, data),

    submit: (id) => 
      api.post(`${env.API_ENDPOINTS.APPLICATIONS}/${id}/submit`, { consent: true }),

    withdraw: (id, reason) => 
      api.post(`${env.API_ENDPOINTS.APPLICATIONS}/${id}/withdraw`, { reason }),

    getProgress: (id) => 
      api.get(`${env.API_ENDPOINTS.APPLICATIONS}/${id}/progress`),

    getByCampaign: (campaignId) => 
      api.get(`${env.API_ENDPOINTS.APPLICATIONS}/campaign/${campaignId}`),

    // Admin methods
    getAllAdmin: (params = {}) => 
      api.get('/api/admin/applications', { params }),

    getByIdAdmin: (id) => 
      api.get(`/api/admin/applications/${id}`),

    updateStatus: (id, data) => 
      api.put(`/api/admin/applications/${id}/status`, data),
  },

  // File upload methods
  upload: {
    single: async (file, onProgress = null) => {
      const formData = new FormData();
      formData.append('file', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      };

      return api.post('/api/upload', formData, config);
    },

    multiple: async (files, onProgress = null) => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      };

      return api.post('/api/upload/multiple', formData, config);
    },
  },
};

// Set authentication token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    storage.set(env.STORAGE_KEYS.ACCESS_TOKEN, token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    storage.remove(env.STORAGE_KEYS.ACCESS_TOKEN);
  }
};

// Clear authentication
export const clearAuth = () => {
  storage.remove(env.STORAGE_KEYS.ACCESS_TOKEN);
  storage.remove(env.STORAGE_KEYS.REFRESH_TOKEN);
  storage.remove(env.STORAGE_KEYS.USER_DATA);
  delete api.defaults.headers.common['Authorization'];
};

// Get current auth token
export const getAuthToken = () => {
  return storage.get(env.STORAGE_KEYS.ACCESS_TOKEN);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export default api;
