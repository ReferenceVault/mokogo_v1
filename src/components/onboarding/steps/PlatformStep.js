import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../../common/Button';

const PLATFORMS = [
  { id: 'Uber', name: 'Uber' },
  { id: 'Pathao', name: 'Pathao'},
  { id: 'Ola', name: 'Ola' },
  { id: 'Lyft', name: 'Lyft' },
  { id: 'Bolt', name: 'Bolt' }
];

const PlatformStep = ({ formData, updateFormData, onNext, onBack }) => {
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const togglePlatform = (platformId) => {
    const currentPlatforms = formData.platforms || [];
    const isSelected = currentPlatforms.includes(platformId);
    
    if (isSelected) {
      updateFormData({ platforms: currentPlatforms.filter(id => id !== platformId) });
    } else {
      updateFormData({ platforms: [...currentPlatforms, platformId] });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.platforms || formData.platforms.length === 0) {
      newErrors.platforms = 'Please select at least one platform';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">On which platforms do you want to operate?</h2>
      <p className="text-gray-600 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base">Choose your preferred mobility platforms.</p>

      <div className="space-y-3 sm:space-y-4">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            SELECT PLATFORMS
          </label>
          <div className="space-y-2 sm:space-y-3">
            {PLATFORMS.map((platform) => {
              const isSelected = formData.platforms?.includes(platform.id);
              return (
                <div
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-green-600 bg-green-600 bg-opacity-10'
                      : 'border-gray-300 hover:border-green-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold text-base sm:text-lg ${
                        isSelected ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {platform.name}
                      </h3>
                      <p className={`text-xs sm:text-sm mt-1 ${
                        isSelected ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {platform.description}
                      </p>
                    </div>
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.platforms && (
            <p className="mt-2 text-sm text-red-600">{errors.platforms}</p>
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
          >
            ← BACK
          </Button>
          <Button
            onClick={handleNext}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            NEXT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlatformStep;
