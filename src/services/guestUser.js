import api from './api';

export const guestUserAPI = {
  /**
   * Create a new guest user
   */
  createGuestUser: async (userData) => {
    try {
      const response = await api.post('/api/guest-users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all guest users (for admin purposes)
   */
  getAllGuestUsers: async () => {
    try {
      const response = await api.get('/api/guest-users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get guest user by ID
   */
  getGuestUserById: async (id) => {
    try {
      const response = await api.get(`/api/guest-users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default guestUserAPI;
