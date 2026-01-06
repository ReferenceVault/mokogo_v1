import { APPLICATION_STATUSES } from '../../services/applications';

const StepProgress = ({ 
  currentStep, 
  canNavigateToStep, 
  onStepClick, 
  application 
}) => {
  // Use dynamic steps from application data if available, otherwise fallback to default
  const steps = application?.steps || [
    { number: 1, name: 'Basics', key: 'basics' },
    { number: 2, name: 'Contact', key: 'contact' },
    { number: 3, name: 'Employment', key: 'employment' },
    { number: 4, name: 'Review', key: 'review' }
  ];

  const getStepStatus = (stepNumber) => {
    const status = application?.status;
    
    // If current step
    if (stepNumber === currentStep) {
      return 'current';
    }
    
    // Check completion based on application status and completed steps
    if (application?.completedSteps?.includes(stepNumber)) {
      return 'completed';
    }
    
    // Check if step is accessible based on status
    if (status === APPLICATION_STATUSES.APPROVED) {
      // After approval, only documents step is accessible
      if (stepNumber === 4 && steps.find(s => s.key === 'documents')) {
        return stepNumber <= currentStep ? 'completed' : 'pending';
      }
      return 'locked';
    }

    
    return stepNumber < currentStep ? 'completed' : 'pending';
  };

  const getStepIcon = (stepNumber, status) => {
    if (status === 'completed') {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-lg ring-4 ring-green-100 transition-all duration-200">
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }
    
    if (status === 'current') {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-3 border-green-600 bg-white shadow-lg ring-4 ring-green-100 transition-all duration-200">
          <span className="text-sm font-bold text-green-600">{stepNumber}</span>
        </div>
      );
    }
    
    if (status === 'locked') {
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 transition-all duration-200">
          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }
    
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50 transition-all duration-200 hover:border-gray-400 hover:bg-white">
        <span className="text-sm font-medium text-gray-500">{stepNumber}</span>
      </div>
    );
  };

  const getStepClasses = (stepNumber, status) => {
    const baseClasses = "group relative flex items-center";
    const canNavigate = canNavigateToStep[stepNumber];
    
    if (canNavigate && status !== 'locked') {
      return `${baseClasses} cursor-pointer`;
    }
    
    return `${baseClasses} cursor-not-allowed`;
  };

  const getConnectorClasses = (stepNumber, status, nextStatus) => {
    const baseClasses = "absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5";
    
    if (status === 'completed' || nextStatus === 'completed' || nextStatus === 'current') {
      return `${baseClasses} bg-green-600`;
    }
    
    return `${baseClasses} bg-gray-300`;
  };

  const isStepClickable = (step, status) => {
    if (status === 'locked') return false;
    return canNavigateToStep[step.number] && status !== 'pending';
  };

  return (
    <nav aria-label="Progress" className="mb-8">
      {/* Horizontal Step Progress */}
      <ol className="flex items-center justify-between w-full max-w-4xl mx-auto">
        {steps.map((step, stepIdx) => {
          const status = getStepStatus(step.number);
          const canNavigate = isStepClickable(step, status);
          
          return (
            <li key={step.name} className="relative flex-1">
              {/* Connector Line */}
              {stepIdx < steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2">
                  <div 
                    className={`h-full transition-colors duration-300 ${
                      status === 'completed' 
                        ? 'bg-green-500' 
                        : status === 'current' && stepIdx === currentStep - 1
                        ? 'bg-gradient-to-r from-green-500 to-gray-300'
                        : 'bg-gray-300'
                    }`}
                  />
                </div>
              )}
              
              {/* Step Item */}
              <div
                className={`relative flex flex-col items-center text-center ${
                  canNavigate ? 'cursor-pointer group' : 'cursor-not-allowed'
                }`}
                onClick={() => canNavigate && onStepClick(step.number)}
              >
                {/* Step Icon */}
                <div className="relative z-10 mb-2">
                  {getStepIcon(step.number, status)}
                </div>
                
                {/* Step Name */}
                <div className="min-w-0 max-w-[120px]">
                  <span 
                    className={`text-sm font-medium transition-colors duration-200 ${
                      status === 'current' 
                        ? 'text-green-700' 
                        : status === 'completed'
                        ? 'text-green-600'
                        : status === 'locked'
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    } ${canNavigate ? 'group-hover:text-black' : ''}`}
                  >
                    {step.name}
                  </span>
                  
                  {/* Status indicator */}
                  <div className="mt-1">
                    {status === 'completed' && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Completed
                      </span>
                    )}
                    
                    {status === 'current' && (
                      <span className="text-xs text-green-800 font-medium">
                        In Progress
                      </span>
                    )}
                    
                    {status === 'locked' && (
                      <span className="text-xs text-gray-400">
                        Locked
                      </span>
                    )}
                    
                    {status === 'pending' && (
                      <span className="text-xs text-gray-400">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      
      {/* Mobile Compact Progress Bar */}
      <div className="mt-6 sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / steps.length) * 100)}% Complete
          </span>
        </div>
        
        <div className="bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ backgroundColor: 'var(--color-green-600)', width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        
        <div className="mt-2 text-center">
          <span className="text-sm font-medium" style={{ color: 'var(--color-green-600)' }}>
            {steps.find(s => s.number === currentStep)?.name}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default StepProgress;
