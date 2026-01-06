import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { campaignFormSteps } from '../../config/campaignFormConfig';
import { apiService } from '../../services/api';

const CreateCampaignForm = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'standard_car',
      vehicleType: 'sedan',
      targetAmount: '',
      assetPrice: '',
      minimumInvestment: '',
      duration: '',
      location: {
        city: '',
        state: '',
        country: 'Canada'
      },
      isElectricVehicle: false,
      featured: false,
      verified: true
    }
  });

  const watchedFields = watch();

  // Auto-calculate derived fields
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'assetPrice' || name === 'minimumInvestment') {
        const assetPrice = parseFloat(value.assetPrice) || 0;
        const minInvestment = parseFloat(value.minimumInvestment) || 0;
        
        // Set target amount to asset price if not set
        if (name === 'assetPrice' && assetPrice > 0 && !value.targetAmount) {
          setValue('targetAmount', assetPrice);
        }
        
        // Validate minimum investment is less than asset price
        if (assetPrice > 0 && minInvestment > 0 && minInvestment >= assetPrice) {
          setValue('minimumInvestment', Math.floor(assetPrice * 0.1)); // 10% of asset price
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const totalSteps = campaignFormSteps.length;

  const nextStep = async () => {
    const currentStepFields = campaignFormSteps[currentStep - 1].fields;
    const isValid = await trigger(currentStepFields);
    
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // SIMPLE: Only required parameters from backend schema
      const campaignData = {
        title: data.title,
        description: data.description,
        category: data.category,
        vehicleType: data.vehicleType,
        targetAmount: parseFloat(data.targetAmount),
        assetPrice: parseFloat(data.assetPrice),
        minimumInvestment: parseFloat(data.minimumInvestment),
        duration: parseInt(data.duration),
        endDate: new Date(Date.now() + (parseInt(data.duration) * 24 * 60 * 60 * 1000)), // Add endDate
        location: {
          city: data.location.city,
          state: data.location.state,
          country: data.location.country
        }
      };

      console.log('Creating campaign with data:', campaignData);
      console.log('Raw form data:', data);
      console.log('Parsed values:', {
        targetAmount: parseFloat(data.targetAmount),
        minimumInvestment: parseFloat(data.minimumInvestment),
        duration: parseInt(data.duration)
      });
      
      const response = await apiService.campaigns.create(campaignData);
      
      if (response.data.success) {
        toast.success('Campaign created successfully!');
        onSuccess?.(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Create campaign error:', error);
      toast.error(error.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const currentStepConfig = campaignFormSteps[currentStep - 1];
    
    if (!currentStepConfig) return null;

    switch (currentStep) {
      case 1: // Basic Information
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Title *
              </label>
              <input
                {...register('title', { 
                  required: 'Campaign title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                  maxLength: { value: 100, message: 'Title cannot exceed 100 characters' }
                })}
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter campaign title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                {...register('description', { 
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description must be at least 10 characters' },
                  maxLength: { value: 2000, message: 'Description cannot exceed 2000 characters' }
                })}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the campaign..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="standard_car">Standard Car</option>
                <option value="electric_car">Electric Car</option>
                <option value="luxury_car">Luxury Car</option>
                <option value="suv">SUV</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="commercial">Commercial</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type *
              </label>
              <select
                {...register('vehicleType', { required: 'Vehicle type is required' })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="standard">Standard</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
              {errors.vehicleType && (
                <p className="mt-1 text-sm text-red-600">{errors.vehicleType.message}</p>
              )}
            </div>
          </div>
        );

      case 2: // Financial Details
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Price (CAD) *
              </label>
              <input
                {...register('assetPrice', { 
                  required: 'Asset price is required',
                  min: { value: 1000, message: 'Asset price must be at least $1,000' },
                  max: { value: 50000000, message: 'Asset price cannot exceed $50,000,000' }
                })}
                type="number"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.assetPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter asset price"
              />
              {errors.assetPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.assetPrice.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount (CAD) *
              </label>
              <input
                {...register('targetAmount', { 
                  required: 'Target amount is required',
                  min: { value: 10000, message: 'Target amount must be at least $10,000' },
                  max: { value: 10000000, message: 'Target amount cannot exceed $10,000,000' }
                })}
                type="number"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.targetAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter target amount"
              />
              {errors.targetAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Investment (CAD) *
              </label>
              <input
                {...register('minimumInvestment', { 
                  required: 'Minimum investment is required',
                  min: { value: 1000, message: 'Minimum investment must be at least $1,000' }
                })}
                type="number"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.minimumInvestment ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter minimum investment"
              />
              {errors.minimumInvestment && (
                <p className="mt-1 text-sm text-red-600">{errors.minimumInvestment.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Days) *
              </label>
              <input
                {...register('duration', { 
                  required: 'Duration is required',
                  min: { value: 1, message: 'Duration must be at least 1 day' },
                  max: { value: 365, message: 'Duration cannot exceed 365 days' }
                })}
                type="number"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.duration ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter duration in days"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>
          </div>
        );

      case 3: // Location Details
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                {...register('location.city', { required: 'City is required' })}
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location?.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city"
              />
              {errors.location?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province *
              </label>
              <input
                {...register('location.state', { required: 'State/Province is required' })}
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location?.state ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter state/province"
              />
              {errors.location?.state && (
                <p className="mt-1 text-sm text-red-600">{errors.location.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                {...register('location.country', { required: 'Country is required' })}
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location?.country ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter country"
              />
              {errors.location?.country && (
                <p className="mt-1 text-sm text-red-600">{errors.location.country.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  {...register('isElectricVehicle')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Electric Vehicle</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('featured')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Campaign</span>
              </label>

              <label className="flex items-center">
                <input
                  {...register('verified')}
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified Campaign</span>
              </label>
            </div>
          </div>
        );


      case 4: // Review
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Campaign Details</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Title:</span>
                <span className="ml-2 text-sm text-gray-900">{watchedFields.title}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <span className="ml-2 text-sm text-gray-900">{watchedFields.category}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Vehicle Type:</span>
                <span className="ml-2 text-sm text-gray-900">{watchedFields.vehicleType}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Asset Price:</span>
                <span className="ml-2 text-sm text-gray-900">${watchedFields.assetPrice?.toLocaleString()}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Target Amount:</span>
                <span className="ml-2 text-sm text-gray-900">${watchedFields.targetAmount?.toLocaleString()}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Minimum Investment:</span>
                <span className="ml-2 text-sm text-gray-900">${watchedFields.minimumInvestment?.toLocaleString()}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Duration:</span>
                <span className="ml-2 text-sm text-gray-900">{watchedFields.duration} months</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Location:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {watchedFields.location?.city}, {watchedFields.location?.state}, {watchedFields.location?.country}
                </span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Electric Vehicle:</span>
                <span className="ml-2 text-sm text-gray-900">{watchedFields.isElectricVehicle ? 'Yes' : 'No'}</span>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Featured:</span>
                <span className="ml-2 text-sm text-gray-900">{watchedFields.featured ? 'Yes' : 'No'}</span>
              </div>
              
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {campaignFormSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
              <div className="ml-2 text-sm">
                <div className={`font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < campaignFormSteps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Campaign'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaignForm;
