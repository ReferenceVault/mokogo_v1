import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Button from '../common/Button';
import { VALIDATION_MESSAGES } from '../../utils/constants';
import { isValidEmail } from '../../utils/helpers';
import { apiService } from '../../services/api';

const ForgotPasswordForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailExists, setEmailExists] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const email = watch('email');

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.auth.forgotPassword(data.email);
      
      // Check if email exists based on success status
      const emailExists = response.data?.success;
      setEmailExists(emailExists);
      setIsSuccess(true);
      
      if (emailExists) {
        toast.success('Reset instructions sent to your email');
      } else {
        toast.error('This email address is not registered with us');
      }
      
    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Handle other errors (not 400, as those are handled in API service)
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login?source=buyer');
  };

  if (isSuccess) {
    return (
      <div className="w-full">
        {/* Success State */}
        <div className="text-center">
          {emailExists ? (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check your email
              </h2>
              
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email not found
              </h2>
              
              <p className="text-gray-600 mb-6">
                The email address <strong>{email}</strong> is not registered with us. Please check the spelling or try a different email.
              </p>
            </>
          )}
          
          <div className="space-y-4">
            {emailExists ? (
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  try again
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Want to try a different email?{' '}
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  Try again
                </button>
              </p>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleBackToLogin}
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-gray-600">
          No worries! Enter your email address and we'll send you reset instructions.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="form-field">
          <label htmlFor="email" className="form-label form-label-required">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            placeholder="Enter your email address"
            {...register('email', {
              required: VALIDATION_MESSAGES.REQUIRED,
              validate: (value) => {
                if (!isValidEmail(value)) {
                  return VALIDATION_MESSAGES.EMAIL_INVALID;
                }
                return true;
              },
            })}
          />
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;