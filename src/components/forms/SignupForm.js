import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle } from "lucide-react"; // or any icon library

import Link from 'next/link';
import Button from '../common/Button';
import { 
  registerUser, 
  selectRegisterStatus, 
  selectRegisterError,
  clearErrors 
} from '../../store/slices/authSlice';
import { LOADING_STATES, VALIDATION_MESSAGES, GENDER_OPTIONS } from '../../utils/constants';
import { isValidEmail, validatePassword } from '../../utils/helpers';
import { apiService } from '../../services/api';

// Custom Dropdown Component
const CustomDropdown = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false, 
  error, 
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* Dropdown Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative cursor-pointer rounded-md border-2 transition-all duration-200 ${
          disabled 
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
            : isOpen 
              ? 'border-[#58c69b] ring-4 ring-[#58c69b]/20' 
              : error 
                ? 'border-red-300 hover:border-red-400' 
                : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center">
            <span className={`${value ? 'text-gray-900' : 'text-gray-400'} font-medium`}>
              {value 
                ? selectedOption?.label || 'Select...'
                : placeholder
              }
            </span>
          </div>
          <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {options.length > 0 ? (
              options.map((option, index) => {
                const isSelected = option.value === value;
                
                return (
                  <div
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-[#58c69b]/5 ${
                      isSelected ? 'bg-[#58c69b]/10 text-[#58c69b]' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isSelected ? 'text-[#58c69b]' : ''}`}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-[#58c69b] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center text-sm">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

const SignupForm = ({ source }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const registerStatus = useSelector(selectRegisterStatus);
  const registerError = useSelector(selectRegisterError);
  
  const isLoading = registerStatus === LOADING_STATES.PENDING;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors: clearFormErrors,
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
      agreeToTerms: false,
    },
  });

  // Watch password for confirmation validation
  const watchPassword = watch('password');

  // Clear Redux errors when form values change
  const watchedFields = watch();
  useState(() => {
    dispatch(clearErrors());
  }, [watchedFields, dispatch]);

  const onSubmit = async (data) => {
    try {
      // Clear any previous errors
      clearFormErrors();
      dispatch(clearErrors());

      // Store email in localStorage for verification process
      localStorage.setItem('signup_email', data.email);

      // Attempt registration
      await dispatch(registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        gender: data.gender,
        userRole: source, // Add user role based on source
      })).unwrap();

      // Success toast
      //toast.success('Please check your inbox and click the verification link to activate your account.');
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? "animate-slide-in" : "animate-slide-out"
          } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle className="h-6 w-6" style={{ color: 'var(--color-green-500)' }} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900">
                  Verify Your Account
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Please <span className="font-semibold" style={{ color: 'var(--color-green-600)' }}>check your inbox </span> 
                  and click the verification link to activate your account.
                </p>
              </div>
            </div>
          </div>
        </div>
      ));

      // Redirect to login with email pre-filled
      router.push(`/login?email=${encodeURIComponent(data.email)}`);

    } catch (error) {
      // Error is handled by Redux, just show toast
      toast.error(error || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      
      // Redirect to Google OAuth URL
      const response = await apiService.get('/api/auth/google/url');
      const { authUrl } = response.data.data;
      
      // Store the current URL to redirect back after OAuth
      localStorage.setItem('oauth_redirect', router.query.redirect || '/');
      
      // Redirect to Google OAuth
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('Google sign-up error:', error);
      toast.error('Google sign-up failed. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {source === 'investor' ? 'Join as an Investor' : 'Join as a Driver'}
        </h2>
        <p className="mt-2 text-gray-600">
          {source === 'investor' 
            ? 'Start investing in vehicle assets and earn returns' 
            : 'Get access to vehicle financing and start driving'
          }
        </p>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Display server errors */}
        {registerError && (
          <div className="alert alert-error">
            <div className="alert-content">
              <p className="alert-message">{registerError}</p>
            </div>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="form-field">
            <label htmlFor="firstName" className="form-label form-label-required">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
              placeholder="Enter your first name"
              {...register('firstName', {
                required: VALIDATION_MESSAGES.REQUIRED,
                minLength: {
                  value: 2,
                  message: VALIDATION_MESSAGES.NAME_MIN_LENGTH,
                },
                maxLength: {
                  value: 50,
                  message: VALIDATION_MESSAGES.NAME_MAX_LENGTH,
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: 'First name should only contain letters',
                },
              })}
            />
            {errors.firstName && (
              <p className="form-error">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="form-field">
            <label htmlFor="lastName" className="form-label form-label-required">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              className={`form-input ${errors.lastName ? 'form-input-error' : ''}`}
              placeholder="Enter your last name"
              {...register('lastName', {
                required: VALIDATION_MESSAGES.REQUIRED,
                minLength: {
                  value: 2,
                  message: VALIDATION_MESSAGES.NAME_MIN_LENGTH,
                },
                maxLength: {
                  value: 50,
                  message: VALIDATION_MESSAGES.NAME_MAX_LENGTH,
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: 'Last name should only contain letters',
                },
              })}
            />
            {errors.lastName && (
              <p className="form-error">{errors.lastName.message}</p>
            )}
          </div>
        </div>

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
            placeholder="Enter your email"
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

        {/* Gender Field */}
        <div className="form-field">
          <label htmlFor="gender" className="form-label form-label-required">
            Gender
          </label>
          <CustomDropdown
            label=""
            value={watch('gender')}
            onChange={(value) => setValue('gender', value)}
            options={GENDER_OPTIONS}
            placeholder="Select your gender"
            required={true}
            error={errors.gender?.message}
          />
          {/* Hidden input for validation */}
          <input
            type="hidden"
            {...register('gender', {
              required: VALIDATION_MESSAGES.REQUIRED,
            })}
          />
        </div>

        {/* Password Field */}
        <div className="form-field">
          <label htmlFor="password" className="form-label form-label-required">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`form-input pr-10 ${errors.password ? 'form-input-error' : ''}`}
              placeholder="Create a strong password"
              {...register('password', {
                required: VALIDATION_MESSAGES.REQUIRED,
                validate: (value) => {
                  const validation = validatePassword(value);
                  if (!validation.isValid) {
                    return validation.errors[0];
                  }
                  return true;
                },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
          <p className="form-help">
            Password must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="form-field">
          <label htmlFor="confirmPassword" className="form-label form-label-required">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className={`form-input pr-10 ${errors.confirmPassword ? 'form-input-error' : ''}`}
              placeholder="Confirm your password"
              {...register('confirmPassword', {
                required: VALIDATION_MESSAGES.REQUIRED,
                validate: (value) => {
                  if (value !== watchPassword) {
                    return VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH;
                  }
                  return true;
                },
              })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="form-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="form-field">
          <div className="flex items-start">
            <input
              id="agreeToTerms"
              type="checkbox"
              className={`form-checkbox mt-1 ${errors.agreeToTerms ? 'border-red-300' : ''}`}
              {...register('agreeToTerms', {
                required: VALIDATION_MESSAGES.TERMS_REQUIRED,
              })}
            />
            <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-800">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-800">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="form-error">{errors.agreeToTerms.message}</p>
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
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>

        {/* Google Sign Up */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <GoogleSignUpButton 
          disabled={isLoading || isGoogleLoading} 
          onClick={handleGoogleSignUp}
          loading={isGoogleLoading}
        />

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href={`/login?source=${source}`}
              className="font-medium text-primary-600 hover:text-primary-800"
            >
              Sign in instead
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

// Google Sign Up Button Component
const GoogleSignUpButton = ({ disabled, onClick, loading }) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      fullWidth
      disabled={disabled}
      onClick={onClick}
      leftIcon={<GoogleIcon />}
      loading={loading}
    >
      {loading ? 'Signing up...' : 'Sign up with Google'}
    </Button>
  );
};

// Icons (same as LoginForm)
const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default SignupForm;
