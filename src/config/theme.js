// Theme configuration for consistent styling across the application
export const theme = {
  colors: {
    primary: {
      light: '#fb923c',  // Lighter version of orange
      main: '#f97316',   // Main orange color
      dark: '#ea580c',   // Darker version of orange
    },
    button: {
      light: '#fb923c',  // Lighter version of button orange
      main: '#f97316',   // Button orange color
      dark: '#ea580c',   // Darker version of button orange
    },
    secondary: {
      light: '#666666',  // Lighter version of brand gray
      main: '#333333',   // Brand dark gray
      dark: '#1a1a1a',   // Darker version of brand gray
    },
    success: {
      light: '#34d399',
      main: '#10b981',
      dark: '#047857',
    },
    error: {
      light: '#f87171',
      main: '#ef4444',
      dark: '#b91c1c',
    },
    warning: {
      light: '#fbbf24',
      main: '#f59e0b',
      dark: '#b45309',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      dark: '#111827',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      light: '#9ca3af',
    },
  },

  gradients: {
    // Brand gradients with Mokogo orange colors
    textGradient: 'linear-gradient(-45deg, #f97316, #ea580c)',
    backgroundGradient: 'linear-gradient(to right, #f97316 0%, #ea580c 100%)',
    reverseGradient: 'linear-gradient(to right, #ea580c 0%, #f97316 100%)',
    primaryToSecondary: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    heroGradient: 'linear-gradient(to right, #f97316 0%, #ea580c 100%)',
  },

  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Georgia, serif',
      mono: 'Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    soft: '0 2px 15px 0 rgba(0, 0, 0, 0.1)',
    medium: '0 4px 25px 0 rgba(0, 0, 0, 0.15)',
    hard: '0 10px 40px 0 rgba(0, 0, 0, 0.2)',
  },

  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};

// CSS Custom Properties for runtime theme switching
export const cssVariables = {
  '--color-primary': theme.colors.primary.main,
  '--color-primary-light': theme.colors.primary.light,
  '--color-primary-dark': theme.colors.primary.dark,
  '--color-button': theme.colors.button.main,
  '--color-button-light': theme.colors.button.light,
  '--color-button-dark': theme.colors.button.dark,
  '--color-secondary': theme.colors.secondary.main,
  '--color-secondary-light': theme.colors.secondary.light,
  '--color-secondary-dark': theme.colors.secondary.dark,
  '--color-success': theme.colors.success.main,
  '--color-error': theme.colors.error.main,
  '--color-warning': theme.colors.warning.main,
  '--color-background-primary': theme.colors.background.primary,
  '--color-background-secondary': theme.colors.background.secondary,
  '--color-text-primary': theme.colors.text.primary,
  '--color-text-secondary': theme.colors.text.secondary,
  '--font-family-primary': theme.typography.fontFamily.primary,
  '--border-radius-md': theme.borderRadius.md,
  '--border-radius-lg': theme.borderRadius.lg,
  '--shadow-md': theme.shadows.md,
  '--shadow-lg': theme.shadows.lg,
  '--transition-normal': theme.transitions.normal,
  
  // Brand gradients
  '--gradient-text': theme.gradients.textGradient,
  '--gradient-background': theme.gradients.backgroundGradient,
  '--gradient-reverse': theme.gradients.reverseGradient,
  '--gradient-hero': theme.gradients.heroGradient,
};

// Component style variants
export const variants = {
  button: {
    primary: 'bg-button-500 hover:bg-button-600 text-white shadow-md',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-900 border border-secondary-300',
    success: 'bg-success-500 hover:bg-success-600 text-white shadow-md',
    error: 'bg-error-500 hover:bg-error-600 text-white shadow-md',
    warning: 'bg-warning-500 hover:bg-warning-600 text-white shadow-md',
    outline: 'border-2 border-button-500 text-button-500 hover:bg-button-50',
    ghost: 'text-button-500 hover:bg-button-50',
  },
  input: {
    default: 'form-input block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
    error: 'form-input block w-full rounded-md border-error-300 shadow-sm focus:border-error-500 focus:ring-error-500',
    success: 'form-input block w-full rounded-md border-success-300 shadow-sm focus:border-success-500 focus:ring-success-500',
  },
  card: {
    default: 'bg-white rounded-lg shadow-md border border-secondary-200',
    elevated: 'bg-white rounded-lg shadow-lg border border-secondary-200',
    outlined: 'bg-white rounded-lg border-2 border-secondary-300',
  },
};

export default theme;
