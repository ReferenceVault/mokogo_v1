import api from './api';
import { API_ENDPOINTS, PAGINATION_DEFAULTS } from '../config/api';
import { handleAPIError, formatErrorForUI, logError } from '../utils/errorHandler';

// Helper function to build query parameters
const buildQueryParams = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
};

// Campaign API service with comprehensive error handling
const campaignsService = {
  // Get campaigns with filters and pagination
  getCampaigns: async (params = {}) => {
    try {
      // Set default pagination if not provided
      const queryParams = {
        page: PAGINATION_DEFAULTS.PAGE,
        limit: PAGINATION_DEFAULTS.LIMIT,
        ...params
      };

      const queryString = buildQueryParams(queryParams);
      const url = queryString ? `${API_ENDPOINTS.CAMPAIGNS.LIST}?${queryString}` : API_ENDPOINTS.CAMPAIGNS.LIST;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      logError(error, 'getCampaigns');
      throw handleAPIError(error);
    }
  },

  // Get campaign statistics
  getCampaignStats: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CAMPAIGNS.STATS);
      return response.data;
    } catch (error) {
      logError(error, 'getCampaignStats');
      throw handleAPIError(error);
    }
  },

  // Get campaign by ID
  getCampaignById: async (id) => {
    try {
      if (!id) {
        throw new Error('Campaign ID is required');
      }

      const response = await api.get(API_ENDPOINTS.CAMPAIGNS.DETAIL(id));
      return response.data;
    } catch (error) {
      logError(error, `getCampaignById - ID: ${id}`);
      throw handleAPIError(error);
    }
  },

  // Search campaigns
  searchCampaigns: async (query, params = {}) => {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query is required');
      }

      const queryParams = {
        search: query.trim(),
        page: PAGINATION_DEFAULTS.PAGE,
        limit: PAGINATION_DEFAULTS.LIMIT,
        ...params
      };

      const queryString = buildQueryParams(queryParams);
      const response = await api.get(`${API_ENDPOINTS.CAMPAIGNS.SEARCH}?${queryString}`);
      return response.data;
    } catch (error) {
      logError(error, `searchCampaigns - Query: ${query}`);
      throw handleAPIError(error);
    }
  },

  // Get campaigns by category
  getCampaignsByCategory: async (category, params = {}) => {
    try {
      if (!category) {
        throw new Error('Category is required');
      }

      const queryParams = {
        page: PAGINATION_DEFAULTS.PAGE,
        limit: PAGINATION_DEFAULTS.LIMIT,
        ...params
      };

      const queryString = buildQueryParams(queryParams);
      const url = queryString 
        ? `${API_ENDPOINTS.CAMPAIGNS.BY_CATEGORY(category)}?${queryString}`
        : API_ENDPOINTS.CAMPAIGNS.BY_CATEGORY(category);
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      logError(error, `getCampaignsByCategory - Category: ${category}`);
      throw handleAPIError(error);
    }
  },

  // Get featured campaigns
  getFeaturedCampaigns: async (params = {}) => {
    try {
      const queryParams = {
        page: PAGINATION_DEFAULTS.PAGE,
        limit: PAGINATION_DEFAULTS.LIMIT,
        ...params
      };

      const queryString = buildQueryParams(queryParams);
      const url = queryString ? `${API_ENDPOINTS.CAMPAIGNS.FEATURED}?${queryString}` : API_ENDPOINTS.CAMPAIGNS.FEATURED;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      logError(error, 'getFeaturedCampaigns');
      throw handleAPIError(error);
    }
  },

  // Get campaign statistics
  getCampaignStats: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CAMPAIGNS.STATS);
      return response.data;
    } catch (error) {
      logError(error, 'getCampaignStats');
      throw handleAPIError(error);
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CAMPAIGNS.HEALTH);
      return response.data;
    } catch (error) {
      logError(error, 'healthCheck');
      throw handleAPIError(error);
    }
  },

  // Apply to campaign (for future use)
  applyToCampaign: async (campaignId, applicationData) => {
    try {
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }

      const response = await api.post(API_ENDPOINTS.CAMPAIGNS.APPLY(campaignId), applicationData);
      return response.data;
    } catch (error) {
      logError(error, `applyToCampaign - Campaign: ${campaignId}`);
      throw handleAPIError(error);
    }
  },
};

export default campaignsService;

// Helper functions for building query parameters
export const buildCampaignQuery = ({
  page = 1,
  limit = 12,
  sortBy = 'newest',
  sortOrder = 'desc',
  category,
  status,
  vehicleType,
  evOnly,
  minAmount,
  maxAmount,
  location,
  featured,
  verified,
  search,
}) => {
  const params = {};

  // Pagination
  if (page) params.page = page;
  if (limit) params.limit = limit;

  // Sorting
  if (sortBy) params.sortBy = sortBy;
  if (sortOrder) params.sortOrder = sortOrder;

  // Filters
  if (category && category !== 'all') params.category = category;
  if (status && status !== 'all') params.status = status;
  if (vehicleType) params.vehicleType = vehicleType;
  if (evOnly) params.evOnly = 'true';
  if (minAmount) params.minAmount = minAmount;
  if (maxAmount) params.maxAmount = maxAmount;
  if (location) params.location = location;
  if (featured) params.featured = 'true';
  if (verified) params.verified = 'true';
  if (search) params.search = search;

  return params;
};

// Map frontend values to backend enum values
export const mapCategoryToBackend = (category) => {
  const categoryMap = {
    'all': undefined,
    'car': 'standard_car',
    'electric': 'electric_car',
    'luxury': 'luxury_car',
    'suv': 'suv',
    'motorcycle': 'motorcycle',
    'commercial': 'commercial',
  };
  return categoryMap[category] || category;
};

export const mapStatusToBackend = (status) => {
  const statusMap = {
    'all': 'all',  // Changed from undefined to 'all'
    'live': 'live',
    'funded': 'funded',
    'upcoming': 'draft',
    'completed': 'completed',
    'cancelled': 'cancelled',
  };
  return statusMap[status] || status;
};

export const mapSortToBackend = (sort) => {
  const sortMap = {
    'newest': 'newest',
    'oldest': 'oldest',
    'funding_high': 'funded',
    'funding_low': 'funded',
    'target_high': 'target',
    'target_low': 'target',
    'ending_soon': 'ending',
  };
  return sortMap[sort] || 'newest';
};

export const getSortOrder = (sort) => {
  const orderMap = {
    'newest': 'desc',
    'oldest': 'asc',
    'funding_high': 'desc',
    'funding_low': 'asc',
    'target_high': 'desc',
    'target_low': 'asc',
    'ending_soon': 'asc',
  };
  return orderMap[sort] || 'desc';
};
