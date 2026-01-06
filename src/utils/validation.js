import { VALIDATION_MESSAGES } from './constants';
import { isValidEmail, isValidPhone, isValidNID, calculateAge } from './helpers';

// Common validation rules
export const validationRules = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return VALIDATION_MESSAGES.REQUIRED;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null; // Let required rule handle empty values
    if (!isValidEmail(value)) {
      return VALIDATION_MESSAGES.EMAIL_INVALID;
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null; // Let required rule handle empty values
    if (!isValidPhone(value)) {
      return VALIDATION_MESSAGES.PHONE_INVALID;
    }
    return null;
  },

  nid: (value) => {
    if (!value) return null; // Let required rule handle empty values
    if (!isValidNID(value)) {
      return VALIDATION_MESSAGES.NID_INVALID;
    }
    return null;
  },

  password: (value) => {
    if (!value) return null; // Let required rule handle empty values
    if (value.length < 8) {
      return VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return VALIDATION_MESSAGES.PASSWORD_WEAK;
    }
    return null;
  },

  confirmPassword: (value, originalPassword) => {
    if (!value) return null; // Let required rule handle empty values
    if (value !== originalPassword) {
      return VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH;
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (!value) return null; // Let required rule handle empty values
    if (value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null; // Let required rule handle empty values
    if (value.length > max) {
      return `Cannot exceed ${max} characters`;
    }
    return null;
  },

  minAge: (min) => (value) => {
    if (!value) return null; // Let required rule handle empty values
    const age = calculateAge(value);
    if (age < min) {
      return `Must be at least ${min} years old`;
    }
    return null;
  },

  minValue: (min) => (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },

  maxValue: (max) => (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (Number(value) > max) {
      return `Cannot exceed ${max}`;
    }
    return null;
  },

  array: {
    minLength: (min) => (value) => {
      if (!value || !Array.isArray(value)) return null;
      if (value.length < min) {
        return `Must have at least ${min} item${min > 1 ? 's' : ''}`;
      }
      return null;
    },

    maxLength: (max) => (value) => {
      if (!value || !Array.isArray(value)) return null;
      if (value.length > max) {
        return `Cannot have more than ${max} item${max > 1 ? 's' : ''}`;
      }
      return null;
    },
  },

  boolean: (value) => {
    if (typeof value !== 'boolean') {
      return 'Must be true or false';
    }
    return null;
  },

  mustBeTrue: (value) => {
    if (value !== true) {
      return VALIDATION_MESSAGES.TERMS_REQUIRED;
    }
    return null;
  },
};

// Validation schema builder
export const createValidationSchema = (schema) => {
  return (data) => {
    const errors = {};
    let isValid = true;

    Object.keys(schema).forEach((field) => {
      const rules = schema[field];
      const value = data[field];
      const fieldErrors = [];

      rules.forEach((rule) => {
        let error = null;
        
        if (typeof rule === 'function') {
          error = rule(value);
        } else if (typeof rule === 'object' && rule.validator) {
          error = rule.validator(value, data);
        }

        if (error) {
          fieldErrors.push(error);
        }
      });

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
        isValid = false;
      }
    });

    return { isValid, errors };
  };
};

// Pre-defined validation schemas for forms
export const loginSchema = createValidationSchema({
  email: [validationRules.required, validationRules.email],
  password: [validationRules.required],
});

export const registerSchema = createValidationSchema({
  firstName: [
    validationRules.required,
    validationRules.minLength(2),
    validationRules.maxLength(50),
  ],
  lastName: [
    validationRules.required,
    validationRules.minLength(2),
    validationRules.maxLength(50),
  ],
  email: [validationRules.required, validationRules.email],
  password: [validationRules.required, validationRules.password],
  confirmPassword: [
    validationRules.required,
    {
      validator: (value, data) => validationRules.confirmPassword(value, data.password),
    },
  ],
  gender: [validationRules.required],
  agreeToTerms: [validationRules.required, validationRules.mustBeTrue],
});

export const forgotPasswordSchema = createValidationSchema({
  email: [validationRules.required, validationRules.email],
});

export const resetPasswordSchema = createValidationSchema({
  password: [validationRules.required, validationRules.password],
  confirmPassword: [
    validationRules.required,
    {
      validator: (value, data) => validationRules.confirmPassword(value, data.password),
    },
  ],
});

export const changePasswordSchema = createValidationSchema({
  currentPassword: [validationRules.required],
  newPassword: [validationRules.required, validationRules.password],
  confirmPassword: [
    validationRules.required,
    {
      validator: (value, data) => validationRules.confirmPassword(value, data.newPassword),
    },
  ],
});

export const profileUpdateSchema = createValidationSchema({
  firstName: [
    validationRules.required,
    validationRules.minLength(2),
    validationRules.maxLength(50),
  ],
  lastName: [
    validationRules.required,
    validationRules.minLength(2),
    validationRules.maxLength(50),
  ],
  email: [validationRules.required, validationRules.email],
  gender: [validationRules.required],
});

// Application step validation schemas
export const applicationBasicsSchema = createValidationSchema({
  fullName: [validationRules.required, validationRules.minLength(2)],
  // FUTURE USE - Uncomment when these fields are needed
  // dateOfBirth: [validationRules.required, validationRules.date],
  // gender: [validationRules.required],
  // nid: [validationRules.required, validationRules.nid],
  // maritalStatus: [validationRules.required],
  // currentAddress: [validationRules.required],
  // permanentAddress: [validationRules.required],
  // sameAsCurrent: [],
  consentToProcessing: [validationRules.required],
});

export const applicationContactSchema = createValidationSchema({
  phoneNumber: [validationRules.required, validationRules.phone],
});

export const applicationEmploymentSchema = createValidationSchema({
  employmentType: [validationRules.required],
  platforms: [validationRules.required],
  averageMonthlyIncome: [
    validationRules.required,
    validationRules.minValue(1000),
    validationRules.maxValue(10000000),
  ],
  employerId: [validationRules.required],
});

// Utility function to validate a single field
export const validateField = (value, rules) => {
  const errors = [];
  
  rules.forEach((rule) => {
    let error = null;
    
    if (typeof rule === 'function') {
      error = rule(value);
    }
    
    if (error) {
      errors.push(error);
    }
  });
  
  return errors;
};

// Utility function to validate form data
export const validateForm = (data, schema) => {
  return schema(data);
};

// Real-time validation hook-compatible function
export const createFieldValidator = (rules) => {
  return (value, formData = {}) => {
    const errors = [];
    
    rules.forEach((rule) => {
      let error = null;
      
      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object' && rule.validator) {
        error = rule.validator(value, formData);
      }
      
      if (error) {
        errors.push(error);
      }
    });
    
    return errors.length > 0 ? errors[0] : null; // Return first error
  };
};

export default {
  validationRules,
  createValidationSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  profileUpdateSchema,
  applicationBasicsSchema,
  applicationContactSchema,
  applicationEmploymentSchema,
  validateField,
  validateForm,
  createFieldValidator,
};
