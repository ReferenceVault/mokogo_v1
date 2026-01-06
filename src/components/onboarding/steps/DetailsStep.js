import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../../common/Button';

const DetailsStep = ({ formData, updateFormData, onSubmit, onBack, isSubmitting }) => {
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = 'Age must be between 1 and 120';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.consent) {
      newErrors.consent = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Tell us something about yourself</h2>
      <p className="text-gray-600 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base">Please fill in your details and the Gigly team will get back to you in 72 hours.</p>

      <div className="space-y-4 sm:space-y-6">
                    {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FULL NAME
              </label>
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) => updateFormData({ fullname: e.target.value })}
                placeholder="e.g. John Smith"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors text-sm sm:text-base ${
                  errors.fullname ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fullname && (
                <p className="mt-1 text-sm text-red-600">{errors.fullname}</p>
              )}
            </div>

                    {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PHONE NUMBER
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="e.g. +1234567890"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors text-sm sm:text-base ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

                    {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AGE
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => updateFormData({ age: e.target.value })}
                placeholder="e.g. 25"
                min="1"
                max="120"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors text-sm sm:text-base ${
                  errors.age ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-600">{errors.age}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                EMAIL
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="e.g. john.smith@domain.com"
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors text-sm sm:text-base ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

        {/* Consent */}
        <div>
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={(e) => updateFormData({ consent: e.target.checked })}
              className="mt-1 w-4 h-4 accent-green-600 border-gray-300 rounded focus:ring-green-600 focus:ring-2"
            />
            <div className="flex-1">
              <label htmlFor="consent" className="text-sm text-gray-700">
                I agree to the terms and conditions
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Please see our{' '}
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-medium"
                >
                  Privacy Policy
                </a>{' '}
                for more information.
              </p>
            </div>
          </div>
          {errors.consent && (
            <p className="mt-1 text-sm text-red-600">{errors.consent}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="pt-6 flex space-x-2">
          <button
            onClick={() => router.push(`/login?source=buyer`)}
            className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Sign In
          </button>
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={isSubmitting}
          >
            ← BACK
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SENDING...' : 'SEND'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DetailsStep;
