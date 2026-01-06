import { forwardRef } from 'react';
import { variants } from '../../config/theme';

// Button component with various styles and states
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  onClick,
  ...props
}, ref) => {
  // Base button classes
  const baseClasses = 'btn';
  
  // Variant classes
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    error: 'btn-error',
    warning: 'btn-warning',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl',
  };
  
  // Additional classes
  const additionalClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.md,
    loading && 'button-loading',
    fullWidth && 'w-full',
    className,
  ].filter(Boolean).join(' ');
  
  // Handle click event
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };
  
  return (
    <button
      ref={ref}
      type={type}
      className={additionalClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Left icon */}
      {leftIcon && !loading && (
        <span className="button-icon">
          {leftIcon}
        </span>
      )}
      
      {/* Loading spinner */}
      {loading && (
        <span className="button-icon">
          <LoadingSpinner size="sm" />
        </span>
      )}
      
      {/* Button text */}
      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>
      
      {/* Right icon */}
      {rightIcon && !loading && (
        <span className="ml-2 -mr-1 h-4 w-4">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

// Loading spinner component for button
const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  return (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Icon button variant
export const IconButton = forwardRef(({
  children,
  size = 'md',
  ...props
}, ref) => {
  const sizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4',
  };
  
  return (
    <Button
      ref={ref}
      className={`button-icon-only ${sizeClasses[size]}`}
      {...props}
    >
      {children}
    </Button>
  );
});

// Button group component
export const ButtonGroup = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`inline-flex rounded-md shadow-sm ${className}`} 
      role="group"
      {...props}
    >
      {children}
    </div>
  );
};

// Link button component (styled as button but behaves like link)
export const LinkButton = forwardRef(({
  href,
  children,
  target,
  rel,
  ...props
}, ref) => {
  return (
    <a
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      className="btn btn-primary inline-flex items-center justify-center no-underline"
      {...props}
    >
      {children}
    </a>
  );
});

Button.displayName = 'Button';
IconButton.displayName = 'IconButton';
LinkButton.displayName = 'LinkButton';

export default Button;
