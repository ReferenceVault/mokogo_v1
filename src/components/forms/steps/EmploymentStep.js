import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  updateEmployment,
  selectCurrentApplication,
  selectIsUpdatingEmployment,
  selectStepError,
  clearStepError,
} from '../../../store/slices/applicationSlice';
import useStepTracking from '../../../hooks/useStepTracking';
import Button from '../../common/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

// Employment type options
const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'gig_worker', label: 'Gig Worker' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'student', label: 'Student' },
  { value: 'retired', label: 'Retired' }
];

// Platform options
const PLATFORMS = [
  { value: 'pathao', label: 'Pathao' },
  { value: 'uber', label: 'Uber' },
  { value: 'foodpanda', label: 'Foodpanda' },
  { value: 'ola', label: 'Ola' },
  { value: 'shohoz', label: 'Shohoz' },
  { value: 'other', label: 'Other' }
];

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
      {/* Error Message - Above Label */}
      {error && (
        <p className="mb-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Dropdown Trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 ${
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
            <span className={`${value ? 'text-gray-900' : 'text-gray-500'} font-medium`}>
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
    </div>
  );
};

const EmploymentStep = ({ onNext, onPrevious }) => {
  const dispatch = useDispatch();
  
  // Step tracking
  const { 
    trackFieldFocus, 
    trackFieldComplete, 
    trackStepStart, 
    trackStepComplete, 
    trackValidationError
  } = useStepTracking(3);
  
  // Redux state
  const currentApplication = useSelector(selectCurrentApplication);
  const isUpdating = useSelector(selectIsUpdatingEmployment);
  const stepError = useSelector(selectStepError('employment'));
  
  // Local state
  const [showGuarantorSection, setShowGuarantorSection] = useState(false);
  
  // Ref to track if we're currently loading data to prevent conflicts
  const isLoadingRef = useRef(false);

  // Form setup with field array for multiple employment records
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
    trigger
  } = useForm({
    defaultValues: {
      employment: [
        {
          employmentType: '',
          platforms: '',
          averageMonthlyIncome: '',
          employerId: ''
        }
      ]
    }
  });

  // Field array for employment records
  const { fields, append, remove } = useFieldArray({
    control,
    name: "employment"
  });

  // Watch for form changes
  const watchedValues = watch();

  // Show/hide guarantor section
  useEffect(() => {
    setShowGuarantorSection(false);
  }, []);

  // Load existing data only once when component mounts or when application changes
  useEffect(() => {
    if (isLoadingRef.current) return;
    
    try {
      if (currentApplication?.employment && Array.isArray(currentApplication.employment)) {
        const employmentArray = currentApplication.employment;
        
        // Set form values for employment array
        if (employmentArray.length > 0) {
          // Create a clean data structure for the form
          const formValues = {
            employment: employmentArray.map(emp => ({
              employmentType: emp.employmentType || '',
              platforms: emp.platforms || '',
              averageMonthlyIncome: emp.averageMonthlyIncome?.toString() || '',
              employerId: emp.employerId || ''
            }))
          };
          
          // Reset the form with the employment array
          reset(formValues);
        }
      }
    } catch (error) {
      console.error('Error loading employment data:', error);
    }
  }, [currentApplication?.id, reset]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearStepError('employment'));
  }, [dispatch]);

  // Add new employment record
  const addEmploymentRecord = () => {
    try {
      append({
        employmentType: '',
        platforms: '',
        averageMonthlyIncome: '',
        employerId: ''
      });
    } catch (error) {
      console.error('Error adding employment record:', error);
      toast.error('Failed to add employment record');
    }
  };

  // Remove employment record
  const removeEmploymentRecord = (index) => {
    try {
      if (fields.length > 1) {
        remove(index);
      }
    } catch (error) {
      console.error('Error removing employment record:', error);
      toast.error('Failed to remove employment record');
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    trackStepStart({ action: 'form_submit' });
    
    try {
      // Validate employment records
      const employmentData = data.employment.map(emp => ({
        employmentType: emp.employmentType,
        platforms: emp.platforms,
        averageMonthlyIncome: parseFloat(emp.averageMonthlyIncome) || 0,
        employerId: emp.employerId
      }));

      // Validate that all required fields are filled
      for (let i = 0; i < employmentData.length; i++) {
        const emp = employmentData[i];
        if (!emp.employmentType || emp.employmentType.trim().length === 0) {
          toast.error(`Please select an employment type for employment record ${i + 1}`);
          trackValidationError('employmentType', 'Employment type is required');
          return;
        }
        if (!emp.platforms || emp.platforms.trim().length === 0) {
          toast.error(`Please specify a platform for employment record ${i + 1}`);
          trackValidationError('platforms', 'Platform is required');
          return;
        }
        if (!emp.employerId || emp.employerId.trim().length === 0) {
          toast.error(`Please specify a platform ID for employment record ${i + 1}`);
          trackValidationError('employerId', 'Platform ID is required');
          return;
        }
        if (!emp.averageMonthlyIncome || emp.averageMonthlyIncome <= 0) {
          toast.error(`Please specify a valid monthly salary for employment record ${i + 1}`);
          trackValidationError('averageMonthlyIncome', 'Monthly salary is required');
          return;
        }
      }

      await dispatch(updateEmployment({
        applicationId: currentApplication.id,
        employmentData: {
          employment: employmentData
        }
      })).unwrap();

      // Track step completion
      trackStepComplete(employmentData, {
        employmentCount: employmentData.length,
        employmentTypes: employmentData.map(emp => emp.employmentType),
        hasGuarantor: false,
        incomeRange: employmentData.length > 0 ? 
          (employmentData[0].averageMonthlyIncome > 50000 ? 'high' : 
           employmentData[0].averageMonthlyIncome > 25000 ? 'medium' : 'low') : 'not_specified'
      });

      toast.success('Employment information saved successfully!');
      onNext();
    } catch (error) {
      trackValidationError('form_submission', error.message || 'Save failed');
      console.error('Employment update error:', error);
      toast.error(error.message || 'Failed to save employment information');
    }
  };

  return (
    <div className="flex-1">
      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Employment Information
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Tell us about your work experience (you can add multiple employment records)
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Employment Records */}
        {fields.map((field, index) => (
          <div key={field.id} className="relative border-2 rounded-lg py-6 px-4 shadow-sm" style={{ borderColor: 'var(--color-green-200)', background: 'linear-gradient(to right, var(--color-green-50), var(--color-green-50))' }}>
            {/* Remove button - floating in top-right */}
  {fields.length > 1 && (
    <button
      type="button"
      onClick={() => removeEmploymentRecord(index)}
      className="absolute -top-2 -right-2 group w-7 h-7 
             bg-gradient-to-r from-red-500 to-red-500 
             hover:from-red-700 hover:to-red-700 
             border-2 border-red-300 rounded-full shadow-md 
             hover:shadow-lg transition-all duration-300 
             transform hover:scale-105 active:scale-95 
             flex items-center justify-center"
      title="Remove Employment Record"
    >
      <div className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      <svg 
        className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Employment Record {index + 1}
                </h4>
              </div>
              {/* Remove button - Show for all records except when only 1 record exists */}
              
            </div>

            {/* All fields in one row */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 items-end">
              {/* Employment Type Dropdown */}
              <div className="lg:col-span-1">
                <CustomDropdown
                  label="Employment Type"
                  value={watch(`employment.${index}.employmentType`)}
                  onChange={(value) => {
                    setValue(`employment.${index}.employmentType`, value);
                    trigger(`employment.${index}.employmentType`);
                  }}
                  options={EMPLOYMENT_TYPES}
                  placeholder="Select Type"
                  required={true}
                  error={errors.employment?.[index]?.employmentType?.message}
                />
                {/* Hidden input for validation */}
                <input
                  type="hidden"
                  {...register(`employment.${index}.employmentType`, {
                    required: 'Employment type is required',
                    validate: (value) => value && value.trim().length > 0 || 'Employment type is required'
                  })}
                />
              </div>

              {/* Platform Dropdown */}
              <div className="lg:col-span-1">
                <CustomDropdown
                  label="Platform"
                  value={watch(`employment.${index}.platforms`)}
                  onChange={(value) => {
                    setValue(`employment.${index}.platforms`, value);
                    trigger(`employment.${index}.platforms`);
                  }}
                  options={PLATFORMS}
                  placeholder="Select Platform"
                  required={true}
                  error={errors.employment?.[index]?.platforms?.message}
                />
                {/* Hidden input for validation */}
                <input
                  type="hidden"
                  {...register(`employment.${index}.platforms`, {
                    required: 'Platform is required',
                    validate: (value) => value && value.trim().length > 0 || 'Platform is required'
                  })}
                />
              </div>

              {/* Monthly Salary */}
              <div className="lg:col-span-1">
                {/* Error Message - Above Label */}
                {errors.employment?.[index]?.averageMonthlyIncome && (
                  <p className="mb-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.employment[index].averageMonthlyIncome.message}
                  </p>
                )}
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Salary (BDT) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register(`employment.${index}.averageMonthlyIncome`, {
                      required: 'Monthly salary is required',
                      min: {
                        value: 1000,
                        message: 'Minimum salary should be 1000 BDT'
                      },
                      max: {
                        value: 10000000,
                        message: 'Maximum salary should be 10,000,000 BDT'
                      }
                    })}
                    onChange={(e) => {
                      setValue(`employment.${index}.averageMonthlyIncome`, e.target.value);
                      trigger(`employment.${index}.averageMonthlyIncome`);
                    }}
                    className={`block w-full pl-6 pr-2 py-2 border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                      errors.employment?.[index]?.averageMonthlyIncome 
                        ? 'border-red-300 focus:border-red-400' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-green-500'
                    }`}
                    placeholder="45000"
                    min="1000"
                  />
                  {/* Hidden input for validation */}
                  <input
                    type="hidden"
                    {...register(`employment.${index}.averageMonthlyIncome`, {
                      required: 'Monthly salary is required',
                      validate: (value) => value && parseFloat(value) > 0 || 'Monthly salary is required'
                    })}
                  />
                </div>
              </div>

              {/* Platform ID */}
              <div className="lg:col-span-1">
                {/* Error Message - Above Label */}
                {errors.employment?.[index]?.employerId && (
                  <p className="mb-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.employment[index].employerId.message}
                  </p>
                )}
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register(`employment.${index}.employerId`, {
                      required: 'Platform ID is required',
                      minLength: {
                        value: 1,
                        message: 'Platform ID is required'
                      }
                    })}
                    onChange={(e) => {
                      setValue(`employment.${index}.employerId`, e.target.value);
                      trigger(`employment.${index}.employerId`);
                    }}
                    className={`block w-full pl-6 pr-2 py-2 border-2 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-500/20 ${
                      errors.employment?.[index]?.employerId 
                        ? 'border-red-300 focus:border-red-400' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-green-500'
                    }`}
                    placeholder="UBER12345"
                  />
                  {/* Hidden input for validation */}
                  <input
                    type="hidden"
                    {...register(`employment.${index}.employerId`, {
                      required: 'Platform ID is required',
                      validate: (value) => value && value.trim().length > 0 || 'Platform ID is required'
                    })}
                  />
                </div>
              </div>

              {/* Add Button Column */}
              <div className="lg:col-span-1 flex items-end justify-center">
                {index === fields.length - 1 && (
                  <button
                    type="button"
                    onClick={addEmploymentRecord}
                    className="group relative w-10 h-10 bg-gradient-to-r from-[#58c69b] to-[#4bb085] hover:from-[#4bb085] hover:to-[#3a9a7a] border-2 border-[#58c69b] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center"
                    title="Add New Employment Record"
                  >
                    <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full border-2 border-[#58c69b] flex items-center justify-center">
                      <span className="text-[#58c69b] text-xs font-bold">+</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
                
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

export default EmploymentStep;
