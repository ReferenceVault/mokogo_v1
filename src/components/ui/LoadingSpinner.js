const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '',
  text = '',
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-gray-600',
    white: 'border-white',
    success: 'spinner-success',
    error: 'border-red-600',
    warning: 'border-yellow-600',
  };

  const spinnerClass = `
    animate-spin rounded-full border-2 border-gray-300
    ${sizeClasses[size]} 
    ${colorClasses[color]}
    ${className}
  `.trim();

  if (text) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className={spinnerClass} />
        <span className="text-sm text-gray-600">{text}</span>
      </div>
    );
  }

  return <div className={spinnerClass} />;
};

export default LoadingSpinner;
