// Remove hardcoded verification and use real APIs
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  updateContact,
  selectCurrentApplication,
  selectIsUpdatingContact,
  selectStepFormData,
  selectStepError,
  clearStepError,
  updateFormData
} from '../../../store/slices/applicationSlice';
import useStepTracking from '../../../hooks/useStepTracking';
import Button from '../../common/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const ContactStep = ({ onNext, onPrevious }) => {
  const dispatch = useDispatch();
  
  // Step tracking
  const { 
    trackFieldFocus, 
    trackFieldComplete, 
    trackStepStart, 
    trackStepComplete, 
    trackValidationError,
    trackOTP,
    createFieldHandlers
  } = useStepTracking(2);
  
  // Redux state
  const currentApplication = useSelector(selectCurrentApplication);
  const isUpdating = useSelector(selectIsUpdatingContact);
  const stepError = useSelector(selectStepError('contact'));
  const formData = useSelector(selectStepFormData('contact'));
  
  // Local state for verification
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(true); // Set to true by default

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    getValues
  } = useForm({
    defaultValues: {
      phoneNumber: '',
      email: '',
      alternativeContact: '',
      preferredLanguage: 'english'
    }
  });

  // Watch for form changes
  const watchedValues = watch();

  // Update form data in Redux on changes (debounced to prevent infinite loops)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only update if values have actually changed and formData is not empty
      if (Object.keys(formData).length === 0) {
        // First time loading, always update
        dispatch(updateFormData({ step: 'contact', data: watchedValues }));
      } else {
        const hasChanges = Object.keys(watchedValues).some(key => 
          watchedValues[key] !== formData[key]
        );
        
        if (hasChanges) {
          dispatch(updateFormData({ step: 'contact', data: watchedValues }));
        }
      }
    }, 500); // Increased debounce to 500ms

    return () => clearTimeout(timeoutId);
  }, [dispatch, watchedValues, formData]); // Compare with current formData

  // Load existing data only once when component mounts or when application changes
  useEffect(() => {
    if (currentApplication?.contact) {
      const contactInfo = currentApplication.contact;
      const formValues = {
        phoneNumber: contactInfo.phoneNumber || '',
        email: contactInfo.emailAddress || '',
        alternativeContact: contactInfo.alternativeContact || '',
        preferredLanguage: contactInfo.preferredLanguage || 'english'
      };
      
      reset(formValues);
      
      // Also update the Redux form data to keep it in sync
      dispatch(updateFormData({ step: 'contact', data: formValues }));
      
      // Always set verification status to true (bypassing actual verification)
      setPhoneVerified(true);
    } else if (Object.keys(formData).length > 0) {
      reset(formData);
      // Ensure verification is always true
      setPhoneVerified(true);
    } else {
      // For new applications, ensure verification is true
      setPhoneVerified(true);
    }
  }, [currentApplication?.id, reset, dispatch]); // Only depend on application ID, not the entire object

  // OTP Timer
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && isOtpSent) {
      setCanResendOtp(true);
    }
    return () => clearInterval(interval);
  }, [otpTimer, isOtpSent]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearStepError('contact'));
    return () => {
      // No need to reset OTP state here as it's handled by the service
    };
  }, [dispatch]);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle OTP key down
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    const phoneNumber = getValues('phoneNumber');
    if (!phoneNumber) {
      toast.error('Please enter your phone number first');
      trackValidationError('phoneNumber', 'Phone number required for OTP');
      return;
    }

    try {
      trackOTP('requested', { phoneNumber: phoneNumber.slice(-4) }); // Only track last 4 digits for privacy
      
      setIsSendingOtp(true);
      await verificationService.sendPhoneOTP(currentApplication.id, phoneNumber);
      setIsOtpSent(true);
      setOtpTimer(60); // 60 seconds timer
      setCanResendOtp(false);
      setOtpCode(['', '', '', '', '', '']); // Reset OTP input
      setIsSendingOtp(false);
      toast.success('OTP sent successfully!');
    } catch (error) {
      trackOTP('failed', { error: error.message });
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP');
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpString = otpCode.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      trackValidationError('otpCode', 'Incomplete OTP code');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      await verificationService.verifyPhoneOTP(currentApplication.id, getValues('phoneNumber'), otpString);
      setOtpVerified(true);
      setPhoneVerified(true);
      setIsVerifyingOtp(false);
      toast.success('Phone number verified successfully!');
    } catch (error) {
      trackOTP('failed', { error: error.message, stage: 'verification' });
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Invalid OTP. Please try again.');
      setOtpCode(['', '', '', '', '', '']); // Reset OTP input
      setIsVerifyingOtp(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    trackStepStart({ action: 'form_submit' });
    
    // Only send phone number for contact step
    const contactData = {
      phoneNumber: data.phoneNumber,
      phoneVerified: true
    };

    try {
      await dispatch(updateContact({
        applicationId: currentApplication.id,
        contactData: contactData
      })).unwrap();

      // Track step completion
      trackStepComplete(data, {
        phoneVerified: true,
        phoneChanged: false,
      });

      toast.success('Contact information saved successfully!');
      onNext();
    } catch (error) {
      trackValidationError('form_submission', error.message || 'Save failed');
      console.error('Contact update error:', error);
      toast.error(error.message || 'Failed to save contact information');
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    // Add +880 prefix if not present
    if (!phoneNumber.startsWith('+880')) {
      return `+880${phoneNumber}`;
    }
    return phoneNumber;
  };

  const isPhoneVerified = phoneVerified || otpVerified;

  return (
    <div className="flex-1">
      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Contact Information
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Add your contact details and verify your phone number
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Development Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Development Mode - Verification Bypassed
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Phone and email verification are automatically set to verified for development purposes. 
                  You can now proceed with the form submission without actual verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            Phone number *
            <span className="ml-2 text-sm font-normal text-primary-600">✓ Already Verified</span>
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              +880
            </span>
            <input
              type="tel"
              id="phoneNumber"
              {...register('phoneNumber', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Please enter a valid phone number (10-11 digits)'
                }
              })}
              onFocus={() => trackFieldFocus('phoneNumber')}
              onBlur={(e) => trackFieldComplete('phoneNumber', e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="1712345678"
              maxLength="11"
            />
            <Button
              type="button"
              variant="outline"
              disabled={true}
              className="ml-3 bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              ✓ Verified
            </Button>
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
          )}
          <p className="mt-1 text-sm text-primary-600 flex items-center">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Phone number is verified (verification bypassed for development)
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            <Button type="button" variant="outline" onClick={onPrevious}>
              Back
            </Button>
          </div>
          
          <div className="flex space-x-3">
            <Button type="button" variant="outline">
              Save Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="min-w-[100px]"
            >
              {isUpdating ? <LoadingSpinner size="sm" /> : 'Continue'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ContactStep;
