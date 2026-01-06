import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Button from '../../common/Button';

// Sample country and city data - in production this would come from an API
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' }
];

const CITIES_BY_COUNTRY = {
  'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
  'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
  'GB': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Leicester'],
  'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
  'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur'],
  'BD': ['Dhaka', 'Chittagong', 'Khulna', 'Rajshahi', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur'],
  'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
  'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
  'JP': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama'],
  'BR': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
  'MX': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Ciudad Juárez', 'León', 'Zapopan', 'Nezahualcóyotl', 'Guadalupe']
};

// Custom Dropdown Component
const CustomDropdown = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  disabled = false, 
  error, 
  icon,
  searchable = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.name ? option.name.toLowerCase().includes(searchTerm.toLowerCase()) :
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => 
    option.name ? option.code === value : option === value
  );

  const handleSelect = (option) => {
    const value = option.name ? option.code : option;
    onChange(value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      
      {/* Dropdown Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
          disabled 
            ? 'bg-gray-50 border-gray-200 cursor-not-allowed' 
            : isOpen 
              ? 'border-green-600 ring-4 ring-green-600/20' 
              : error 
                ? 'border-red-300 hover:border-red-400' 
                : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {icon && <span className="text-lg">{icon}</span>}
            <span className={`${value ? 'text-gray-900' : 'text-gray-500'} font-medium`}>
              {value 
                ? (selectedOption?.name || selectedOption || 'Select...')
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
          {/* Search Input (if searchable) */}
          {searchable && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionValue = option.name ? option.code : option;
                const optionLabel = option.name || option;
                const isSelected = optionValue === value;
                
                return (
                  <div
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={`px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-green-600/5 ${
                      isSelected ? 'bg-green-600/10 text-green-600' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {option.flag && <span className="text-lg">{option.flag}</span>}
                      <span className={`font-medium ${isSelected ? 'text-green-600' : ''}`}>
                        {optionLabel}
                      </span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-green-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
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

const LocationStep = ({ formData, updateFormData, onNext, source }) => {
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (formData.country) {
      setCities(CITIES_BY_COUNTRY[formData.country] || []);
      // Reset city when country changes
      updateFormData({ city: '' });
    }
  }, [formData.country]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }
    
    if (!formData.city) {
      newErrors.city = 'Please select a city';
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
      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2">
        {source === 'buyer' ? 'Where will you start your driving journey?' : 'Where do you want to invest?'}
      </h2>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        {source === 'buyer' 
          ? 'Choose your country and city so we can connect you with the right ownership and leasing options.'
          : 'Start with picking the right location for your investment journey.'
        }
      </p>

      <div className="space-y-6 sm:space-y-8">
        {/* Country Selection */}
        <CustomDropdown
          label="COUNTRY"
          value={formData.country}
          onChange={(value) => updateFormData({ country: value })}
          options={COUNTRIES}
          placeholder="Select a country"
          error={errors.country}
          searchable={true}
        />

        {/* City Selection */}
        <CustomDropdown
          label="CITY"
          value={formData.city}
          onChange={(value) => updateFormData({ city: value })}
          options={cities}
          placeholder="Select a city"
          disabled={!formData.country}
          error={errors.city}
        />

        {/* Navigation */}
        <div className="pt-6 flex space-x-3">
          <button
            onClick={() => router.push(`/login?source=${source}`)}
            className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Sign In
          </button>
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

export default LocationStep;
