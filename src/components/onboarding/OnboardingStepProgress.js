import React from 'react';

const OnboardingStepProgress = ({ steps, currentStep }) => {
  return (
    <div className="w-full">
      {/* Desktop Step Progress */}
      <div className="hidden sm:block">
        <ol className="flex items-center justify-between w-full">
          {steps.map((step, stepIdx) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isPending = step.id > currentStep;
            
            return (
              <li key={step.id} className="relative flex-1">
                {/* Connector Line */}
                {stepIdx < steps.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2">
                    <div 
                      className={`h-full transition-colors duration-300 ${
                        isCompleted 
                          ? 'bg-green-600' 
                          : isActive
                          ? 'bg-gradient-to-r from-green-600 to-gray-300'
                          : 'bg-gray-300'
                      }`}
                    />
                  </div>
                )}
                
                {/* Step Item */}
                <div className="relative flex flex-col items-center text-center">
                  {/* Step Circle */}
                  <div className={`relative z-10 mb-2 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    isCompleted 
                      ? 'border-green-600 bg-green-600 text-white' 
                      : isActive
                      ? 'border-green-600 bg-white text-green-600'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  
                  {/* Step Title */}
                  <div className="min-w-0 max-w-[120px]">
                    <span className={`text-sm font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'text-green-600' 
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      
      {/* Mobile Compact Progress Bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </span>
        </div>
        
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-gray-900">
            {steps.find(s => s.id === currentStep)?.title}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStepProgress;
