import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  selectCurrentApplication,
  selectIsUpdatingCreditScore,
  selectStepFormData,
  selectStepError,
  clearStepError,
  updateFormData,
  updateCreditScore
} from '../../../store/slices/applicationSlice';
import useStepTracking from '../../../hooks/useStepTracking';
import Button from '../../common/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Utility function to get last 3 months (excluding current month)
const getLastThreeMonths = () => {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const currentDate = new Date();
  const lastThreeMonths = [];
  
  // Start from 3 months ago (i=3) and go to 1 month ago (i=1), excluding current month (i=0)
  for (let i = 3; i >= 1; i--) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    lastThreeMonths.push({
      monthName: `${months[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
      monthIndex: monthDate.getMonth(),
      year: monthDate.getFullYear(),
      displayName: monthDate.toLocaleString('default', { month: 'long', year: 'numeric' })
    });
  }
  
  return lastThreeMonths;
};

const CreditScoreStep = ({ onNext, onPrevious }) => {
  const dispatch = useDispatch();
  
  // Get dynamic months
  const lastThreeMonths = getLastThreeMonths();
  
  // Step tracking
  const { 
    trackFieldFocus, 
    trackFieldComplete, 
    trackStepStart, 
    trackStepComplete, 
    trackValidationError,
    createFieldHandlers
  } = useStepTracking(3);
  
  // Redux state
  const currentApplication = useSelector(selectCurrentApplication);
  const isUpdating = useSelector(selectIsUpdatingCreditScore);
  const stepError = useSelector(selectStepError('creditScore'));
  const formData = useSelector(selectStepFormData('creditScore'));
  
  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      phoneNumber: formData?.phoneNumber || currentApplication?.creditScore?.phoneNumber || currentApplication?.contact?.phoneNumber || '',
      consent: formData?.consent || currentApplication?.creditScore?.consent || false,
      driverRating: formData?.driverRating || currentApplication?.creditScore?.driverRating || '4.75',
      totalTrips: formData?.totalTrips || currentApplication?.creditScore?.totalTrips || '',
      totalEarnings: formData?.totalEarnings || currentApplication?.creditScore?.totalEarnings || '',
      monthlyActivity: formData?.monthlyActivity || currentApplication?.creditScore?.monthlyActivity || lastThreeMonths.map(month => ({
        monthName: month.monthName,
        trips: 0,
        earnings: 0,
        activeDays: 0
      }))
    }
  });

  const watchedPhoneNumber = watch('phoneNumber');
  const watchedConsent = watch('consent');
  const watchedDriverRating = watch('driverRating');
  const watchedTotalTrips = watch('totalTrips');
  const watchedTotalEarnings = watch('totalEarnings');
  const watchedMonthlyActivity = watch('monthlyActivity');

  // Track step start
  useEffect(() => {
    trackStepStart();
  }, [trackStepStart]);

  // Auto-populate phone number from contact step
  useEffect(() => {
    if (currentApplication?.contact?.phoneNumber && !formData?.phoneNumber) {
      setValue('phoneNumber', currentApplication.contact.phoneNumber);
    }
  }, [currentApplication?.contact?.phoneNumber, formData?.phoneNumber, setValue]);

  // Track field changes
  useEffect(() => {
    if (watchedPhoneNumber) {
      trackFieldComplete('phoneNumber');
    }
    if (watchedConsent) {
      trackFieldComplete('consent');
    }
    if (watchedDriverRating) {
      trackFieldComplete('driverRating');
    }
    if (watchedTotalTrips) {
      trackFieldComplete('totalTrips');
    }
    if (watchedTotalEarnings) {
      trackFieldComplete('totalEarnings');
    }
    if (watchedMonthlyActivity && watchedMonthlyActivity.some(month => month.trips > 0 || month.earnings > 0 || month.activeDays > 0)) {
      trackFieldComplete('monthlyActivity');
    }
  }, [watchedPhoneNumber, watchedConsent, watchedDriverRating, watchedTotalTrips, watchedTotalEarnings, watchedMonthlyActivity, trackFieldComplete]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearStepError('creditScore'));
  }, [dispatch]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      trackStepComplete();
      // Get calculator data from localStorage
      const getCalculatorData = () => {
        try {
          const savedData = localStorage.getItem('applicationCalculatorData');
          return savedData ? JSON.parse(savedData) : null;
        } catch (error) {
          console.error('❌ Error reading calculator data from localStorage:', error);
          return null;
        }
      };
      
      const calculatorData = getCalculatorData();
      console.log('📥 Retrieved calculator data from localStorage:', calculatorData);
      
      // Prepare data for API - convert monthly activity to proper format
      const creditScoreData = {
        phoneNumber: data.phoneNumber,
        consent: data.consent,
        driverRating: parseFloat(data.driverRating),
        totalTrips: data.totalTrips ? parseInt(data.totalTrips) : undefined,
        totalEarnings: data.totalEarnings ? parseFloat(data.totalEarnings) : undefined,
        monthlyActivity: data.monthlyActivity.map(month => ({
          monthName: month.monthName,
          trips: parseInt(month.trips) || 0,
          earnings: parseFloat(month.earnings) || 0,
          activeDays: parseInt(month.activeDays) || 0
        })),
        // Include calculator data from localStorage
      calculatorData: calculatorData ? {
        downpaymentPercentage: calculatorData.downpaymentPercentage,
        weeklyPayment: calculatorData.weeklyPayment,
        timestamp: calculatorData.timestamp
      } : undefined
      };
      
      // Update form data in Redux
      dispatch(updateFormData({ step: 'creditScore', data: creditScoreData }));
      
      // Call API to update credit score
      const result = await dispatch(updateCreditScore({
        applicationId: currentApplication.id,
        creditScoreData: creditScoreData
      }));
      
      // Check if the API call was successful
      if (updateCreditScore.fulfilled.match(result)) {
        toast.success('Credit score information saved successfully');
        // Call onNext to proceed to next step
        onNext();
      } else {
        // Handle API error
        const errorMessage = result.payload?.message || 'Failed to save credit score information';
        trackValidationError('credit_score_submission', errorMessage);
        toast.error(errorMessage);
      }
      
    } catch (error) {
      console.error('Credit score step error:', error);
      trackValidationError('credit_score_submission', error.message);
      toast.error('Failed to save credit score information');
    }
  };

  // Handle input focus
  const handleInputFocus = (fieldName) => {
    trackFieldFocus(fieldName);
  };

  // Rating options
  const ratingOptions = [
    { value: 1, label: '1 - Poor' },
    { value: 2, label: '2 - Fair' },
    { value: 3, label: '3 - Good' },
    { value: 4, label: '4 - Very Good' },
    { value: 5, label: '5 - Excellent' }
  ];

  return (
    <div className="w-full max-w-none mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
            
            {/* Left Columns - Form Fields (4 columns) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Section Header */}
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Section 1. Driver Information
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Please provide your basic contact information
                  </p>
                </div>
            </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Phone Number Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                  <input
                      type="tel"
                      placeholder="01733180114"
                      {...register('phoneNumber', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^\d{10,}$/,
                          message: 'Phone number must contain at least 10 digits'
                        }
                      })}
                      onFocus={() => handleInputFocus('phoneNumber')}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your active mobile number (11 digits).
                  </p>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.phoneNumber.message}
            </p>
          )}
        </div>

                {/* Consent Checkbox */}
                <div className="flex items-start">
                  <div className="flex items-center h-4">
                    <input
                      type="checkbox"
                      {...register('consent', {
                        required: 'You must consent to proceed'
                      })}
                      onFocus={() => handleInputFocus('consent')}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
            </div>
                  <div className="ml-2">
                    <label className="text-xs text-gray-700 leading-tight">
                      I confirm my information is accurate and I consent to its use for loan eligibility checks.
                    </label>
              </div>
            </div>
                {errors.consent && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.consent.message}
                  </p>
                )}

        {/* Error Display */}
        {stepError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{stepError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

              </form>
            </div>

            {/* Right Columns - Important Information (4 columns) */}
            <div className="lg:col-span-4 bg-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-bold">i</span>
                </div>
                <h3 className="text-base font-semibold">
                  Important Information
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs text-white leading-tight">
                    Your phone number will be used for verification purposes
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs text-white leading-tight">
                    All information is encrypted and secure
                  </p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-xs text-white leading-tight">
                    Consent is required to proceed with eligibility check
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2. Driver Rating */}
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 mt-8">
            
            {/* Left Columns - Form Fields (4 columns) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Section Header */}
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Section 2. Driver Rating
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Your current performance rating affects loan eligibility
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Driver Rating Input Field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Driver Rating
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="5"
                      placeholder="4.75"
                      {...register('driverRating', {
                        required: 'Driver rating is required',
                        min: { value: 0, message: 'Rating must be at least 0' },
                        max: { value: 5, message: 'Rating cannot exceed 5' },
                        pattern: {
                          value: /^[0-5](\.\d{1,2})?$/,
                          message: 'Please enter a valid rating (e.g., 4.75)'
                        }
                      })}
                      onFocus={() => handleInputFocus('driverRating')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-16"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-sm text-gray-500 mr-1">/ 5.00</span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Your current star rating out of 5.00 (Example: 4.79).
                  </p>
                  {errors.driverRating && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.driverRating.message}
                    </p>
                  )}
                </div>

                {/* Rating Scale Guide */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Rating Scale Guide</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="flex items-center mr-3">
                        <svg className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-700">Excellent (4.5 - 5.0)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center mr-3">
                        <svg className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-gray-300 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-700">Good (3.5 - 4.49)</span>
                    </div>
              <div className="flex items-center">
                      <div className="flex items-center mr-3">
                        <svg className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-yellow-400 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-gray-300 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-gray-300 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-700">Below Average (&lt; 3.5)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Columns - Rating Impact Information (4 columns) */}
            <div className="lg:col-span-4 bg-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold">
                  Rating Impact on Loan
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">4.5+ Rating</span>
                  <span className="text-xs text-white">High Approval</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">3.5-4.49</span>
                  <span className="text-xs text-white">Moderate</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">Below 3.5</span>
                  <span className="text-xs text-white">Low Approval</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-red-400 h-2 rounded-full" style={{width: '25%'}}></div>
                </div>
              </div>
            </div>
          </div>

        {/* Section 3. Lifetime Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 mt-8">
          {/* Left Columns - Lifetime Performance (4 columns) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Section Header */}
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Section 3. Lifetime Performance
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Overall performance metrics for loan assessment
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Total Trips Completed */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Trips Completed
                </label>
                <input
                  type="number"
                  min="0"
                  {...register('totalTrips')}
                  onFocus={() => handleInputFocus('totalTrips')}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Enter total trips completed"
                />
              </div>

              {/* Total Earnings */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Earnings
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('totalEarnings')}
                    onFocus={() => handleInputFocus('totalEarnings')}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-right"
                    placeholder="Enter total earnings"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">$</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns - Performance Information (4 columns) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Performance Benchmarks */}
            <div className="bg-gray-100 border-t-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-bold text-gray-600">📊</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  Performance Benchmarks
                </h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Excellent:</span>
                  <span className="text-xs font-medium text-green-600">1000+ trips</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Good:</span>
                  <span className="text-xs font-medium text-blue-600">500-999 trips</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Fair:</span>
                  <span className="text-xs font-medium text-yellow-600">100-499 trips</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Section 4. Monthly Activity (Last 3 Months) */}
        <div className="space-y-6 mt-8">
            {/* Top Section - Monthly Activity Cards (Full Width) */}
            <div className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Section 4. Monthly Activity (Last 3 Months)
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Recent performance data helps assess your current activity level
                  </p>
                </div>
              </div>

              {/* Dynamic Monthly Cards - Last 3 Months */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {lastThreeMonths.map((month, index) => (
                  <div key={month.monthName} className="rounded-lg p-4" style={{ backgroundColor: '#004d4d' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white text-sm font-medium capitalize">{month.displayName}</h3>
                      <i className="fa-solid fa-calendar text-neutral-300 text-xs"></i>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-neutral-200 mb-1">Trips</label>
                        <input 
                          type="number" 
                          min="0" 
                          {...register(`monthlyActivity.${index}.trips`)}
                          onFocus={() => handleInputFocus(`monthlyActivity.${index}.trips`)}
                          className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-600 rounded text-white text-xs focus:ring-1 focus:ring-neutral-400" 
                          placeholder="0" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-200 mb-1">Earnings</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            {...register(`monthlyActivity.${index}.earnings`)}
                            onFocus={() => handleInputFocus(`monthlyActivity.${index}.earnings`)}
                            className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-600 rounded text-white text-xs text-right focus:ring-1 focus:ring-neutral-400" 
                            placeholder="0" 
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-300 text-xs">$</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-200 mb-1">Active Days</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="31" 
                          {...register(`monthlyActivity.${index}.activeDays`)}
                          onFocus={() => handleInputFocus(`monthlyActivity.${index}.activeDays`)}
                          className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-600 rounded text-white text-xs focus:ring-1 focus:ring-neutral-400" 
                          placeholder="0" 
                        />
                      </div>
                      {/* Hidden field for monthName */}
                      <input 
                        type="hidden" 
                        {...register(`monthlyActivity.${index}.monthName`)}
                        value={month.monthName}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end items-center gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onPrevious}
            className="px-5 py-2.5 bg-white border border-[#52C41A] text-[#52C41A] hover:bg-[#52C41A] hover:text-black text-sm font-medium rounded transition-colors duration-200"
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isUpdating}
            className="px-5 py-2.5 bg-[#52C41A] hover:bg-[#45a049] disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors duration-200 flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <LoadingSpinner size="sm" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
    </div>
  );
};

export default CreditScoreStep;
