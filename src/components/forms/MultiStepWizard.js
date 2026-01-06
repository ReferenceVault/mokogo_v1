import React from 'react';

const MultiStepWizard = ({
  steps = [],
  currentStep = 1,
  formData = {},
  onStepChange = () => {},
  onInputChange = () => {},
  onSubmit = () => {},
  onCancel = () => {},
  isSubmitting = false,
  title = "Multi-Step Form",
  description = "Complete all steps to proceed"
}) => {
  const currentStepData = steps.find(step => step.id === currentStep);
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;

  const handleNext = () => {
    if (currentStep < steps.length) {
      onStepChange(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      onStepChange(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderField = (fieldKey, fieldConfig) => {
    const value = formData[fieldKey] || '';
    
    switch (fieldConfig.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={fieldConfig.type}
            value={value}
            onChange={(e) => onInputChange(fieldKey, e.target.value)}
            placeholder={fieldConfig.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={fieldConfig.required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onInputChange(fieldKey, e.target.value)}
            placeholder={fieldConfig.placeholder}
            rows={fieldConfig.rows || 4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={fieldConfig.required}
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onInputChange(fieldKey, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={fieldConfig.required}
          >
            <option value="">Select {fieldConfig.label}</option>
            {fieldConfig.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'file':
        return (
          <input
            type="file"
            onChange={(e) => onInputChange(fieldKey, e.target.files[0])}
            accept={fieldConfig.accept}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={fieldConfig.required}
          />
        );
      
      case 'readonly':
        return (
          <input
            type="text"
            value={value}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onInputChange(fieldKey, e.target.value)}
            placeholder={fieldConfig.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={fieldConfig.required}
          />
        );
    }
  };

  const renderStepContent = () => {
    if (!currentStepData) return null;

    // Special case for review step
    if (currentStepData.id === steps.length && currentStepData.fields.length === 0) {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Review Your Information</h3>
            <p className="text-blue-700">Please review all the information you've entered before submitting.</p>
          </div>
          
          {steps.slice(0, -1).map((step) => (
            <div key={step.id} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <i className={`fa-solid ${step.icon || 'fa-circle'} mr-2 text-blue-600`}></i>
                {step.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {step.fields.map((fieldKey) => {
                  const fieldConfig = currentStepData.fieldConfigs?.[fieldKey] || { label: fieldKey, type: 'text' };
                  return (
                    <div key={fieldKey} className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">{fieldConfig.label}</label>
                      <div className="text-sm text-gray-900 bg-white px-3 py-2 rounded border">
                        {formData[fieldKey] || 'Not provided'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {currentStepData.fields.map((fieldKey) => {
          const fieldConfig = currentStepData.fieldConfigs?.[fieldKey] || { label: fieldKey, type: 'text' };
          return (
            <div key={fieldKey} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {fieldConfig.label}
                {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(fieldKey, fieldConfig)}
              {fieldConfig.helpText && (
                <p className="text-xs text-gray-500">{fieldConfig.helpText}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep === step.id ? step.title : step.id}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900">{currentStepData?.title}</h3>
          <p className="text-sm text-gray-600">{currentStepData?.description}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={isFirstStep ? onCancel : handlePrev}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isFirstStep ? 'Cancel' : 'Previous'}
        </button>

        <div className="flex space-x-3">
          {!isLastStep && (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>
          )}
          
          {isLastStep && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiStepWizard;
