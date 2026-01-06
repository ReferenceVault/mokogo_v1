import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { storage } from '../../utils/helpers';
import env from '../../config/env';

// Base query with auth header
const baseQuery = fetchBaseQuery({
  baseUrl: env.API_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state or localStorage
    const token = getState().auth.token || storage.get(env.STORAGE_KEYS.ACCESS_TOKEN);
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

// Base query with retry and token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result?.error?.status === 401) {
    console.log('Sending refresh token');
    
    // Try to get a new token
    const refreshToken = storage.get(env.STORAGE_KEYS.REFRESH_TOKEN);
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: env.API_ENDPOINTS.REFRESH_TOKEN,
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult?.data) {
        const { accessToken } = refreshResult.data.data;
        
        // Store the new token
        storage.set(env.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        
        // Update the auth state
        api.dispatch({ type: 'auth/setToken', payload: accessToken });
        
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - log out user
        api.dispatch({ type: 'auth/logout' });
        storage.remove(env.STORAGE_KEYS.ACCESS_TOKEN);
        storage.remove(env.STORAGE_KEYS.REFRESH_TOKEN);
        storage.remove(env.STORAGE_KEYS.USER_DATA);
      }
    } else {
      // No refresh token - log out user
      api.dispatch({ type: 'auth/logout' });
    }
  }

  return result;
};

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User', 
    'Campaign', 
    'Application', 
    'Document',
  ],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: env.API_ENDPOINTS.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: env.API_ENDPOINTS.REGISTER,
        method: 'POST',
        body: userData,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: env.API_ENDPOINTS.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    forgotPassword: builder.mutation({
      query: (email) => ({
        url: env.API_ENDPOINTS.FORGOT_PASSWORD,
        method: 'POST',
        body: { email },
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: env.API_ENDPOINTS.RESET_PASSWORD,
        method: 'POST',
        body: { token, password },
      }),
    }),

    verifyEmail: builder.mutation({
      query: (token) => ({
        url: env.API_ENDPOINTS.VERIFY_EMAIL,
        method: 'POST',
        body: { token },
      }),
      invalidatesTags: ['User'],
    }),

    sendVerification: builder.mutation({
      query: () => ({
        url: env.API_ENDPOINTS.SEND_VERIFICATION,
        method: 'POST',
      }),
    }),

    // User profile endpoints
    getUserProfile: builder.query({
      query: () => env.API_ENDPOINTS.PROFILE,
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation({
      query: (userData) => ({
        url: env.API_ENDPOINTS.UPDATE_PROFILE,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: env.API_ENDPOINTS.CHANGE_PASSWORD,
        method: 'POST',
        body: passwordData,
      }),
    }),

    // Campaign endpoints
    getCampaigns: builder.query({
      query: (params = {}) => ({
        url: env.API_ENDPOINTS.CAMPAIGNS,
        params,
      }),
      providesTags: ['Campaign'],
    }),

    getCampaignById: builder.query({
      query: (id) => env.API_ENDPOINTS.CAMPAIGN_DETAILS.replace(':id', id),
      providesTags: (result, error, id) => [{ type: 'Campaign', id }],
    }),

    // Application endpoints
    getApplications: builder.query({
      query: (params = {}) => ({
        url: env.API_ENDPOINTS.APPLICATIONS,
        params,
      }),
      providesTags: ['Application'],
    }),

    getApplicationById: builder.query({
      query: (id) => `${env.API_ENDPOINTS.APPLICATIONS}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Application', id }],
    }),

    createApplication: builder.mutation({
      query: (campaignId) => ({
        url: env.API_ENDPOINTS.APPLICATIONS,
        method: 'POST',
        body: { campaignId },
      }),
      invalidatesTags: ['Application'],
    }),

    updateApplicationBasics: builder.mutation({
      query: ({ id, data }) => ({
        url: `${env.API_ENDPOINTS.APPLICATIONS}/${id}/basics`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Application', id }],
    }),

    updateApplicationContact: builder.mutation({
      query: ({ id, data }) => ({
        url: `${env.API_ENDPOINTS.APPLICATIONS}/${id}/contact`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Application', id }],
    }),

    sendApplicationOTP: builder.mutation({
      query: ({ id, phoneNumber }) => ({
        url: `${env.API_ENDPOINTS.APPLICATIONS}/${id}/send-otp`,
        method: 'POST',
        body: { phoneNumber },
      }),
    }),

    verifyApplicationOTP: builder.mutation({
      query: ({ id, phoneNumber, otp }) => ({
        url: `${env.API_ENDPOINTS.APPLICATIONS}/${id}/verify-otp`,
        method: 'POST',
        body: { phoneNumber, otp },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Application', id }],
    }),

    updateApplicationEmployment: builder.mutation({
      query: ({ id, data }) => ({
        url: `${env.API_ENDPOINTS.APPLICATIONS}/${id}/employment`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Application', id }],
    }),

    uploadApplicationDocument: builder.mutation({
      query: ({ id, data }) => ({
        url: `${env.API_ENDPOINTS.APPLICATIONS}/${id}/documents`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Application', id },
        { type: 'Document', id },
      ],
    }),

    submitApplication: builder.mutation({
      query: (id) => ({
        url: `${env.API_ENDPOINTS.APPLICATIONS}/${id}/submit`,
        method: 'POST',
        body: { consent: true },
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Application', id },
        'Application',
      ],
    }),

    withdrawApplication: builder.mutation({
      query: ({ id, reason }) => ({
        url: `${env.API_ENDPOINTS.APPLICATIONS}/${id}/withdraw`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Application', id }],
    }),

    getApplicationProgress: builder.query({
      query: (id) => `${env.API_ENDPOINTS.APPLICATIONS}/${id}/progress`,
      providesTags: (result, error, id) => [{ type: 'Application', id }],
    }),

    getApplicationByCampaign: builder.query({
      query: (campaignId) => `${env.API_ENDPOINTS.APPLICATIONS}/campaign/${campaignId}`,
      providesTags: (result, error, campaignId) => [
        { type: 'Application', campaignId },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Authentication hooks
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useSendVerificationMutation,

  // User profile hooks
  useGetUserProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,

  // Campaign hooks
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,

  // Application hooks
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useCreateApplicationMutation,
  useUpdateApplicationBasicsMutation,
  useUpdateApplicationContactMutation,
  useSendApplicationOTPMutation,
  useVerifyApplicationOTPMutation,
  useUpdateApplicationEmploymentMutation,
  useUploadApplicationDocumentMutation,
  useSubmitApplicationMutation,
  useWithdrawApplicationMutation,
  useGetApplicationProgressQuery,
  useGetApplicationByCampaignQuery,
} = apiSlice;
