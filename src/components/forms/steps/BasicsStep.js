import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  updateBasics,
  selectCurrentApplication,
  selectIsUpdatingBasics,
  selectStepError,
  clearStepError,
  updateFormData,
  selectStepFormData,
  selectFormData
} from '../../../store/slices/applicationSlice';
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from '../../../services/applications';
import stepTracker from '../../../utils/stepTracking';
import Button from '../../common/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';
import useStepTracking from '../../../hooks/useStepTracking';
import { COUNTRIES } from '../../../utils/constants';

const BasicsStep = ({ onNext }) => {
  const dispatch = useDispatch();
  
  // Redux state
  const currentApplication = useSelector(selectCurrentApplication);
  const isUpdating = useSelector(selectIsUpdatingBasics);
  const stepError = useSelector(selectStepError('basics'));
  const formData = useSelector(selectStepFormData('basics'));
  const currentStep = useSelector(state => state.application.currentStep);
  
  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    defaultValues: {
      fullName: '',
      // FUTURE USE - Uncomment when needed
      // dateOfBirth: '',
      // gender: '',
      // maritalStatus: '',
      // currentAddress: {
      //   houseBuildingNo: '',
      //   streetLocalityArea: '',
      //   landmark: '',
      //   city: '',
      //   stateProvince: '',
      //   postalCode: '',
      //   country: 'Bangladesh'
      // },
      // permanentAddress: {
      //   houseBuildingNo: '',
      //   streetLocalityArea: '',
      //   landmark: '',
      //   city: '',
      //   stateProvince: '',
      //   postalCode: '',
      //   country: 'Bangladesh'
      // },
      // sameAsCurrent: false,
      // nid: '',
      consentToProcessing: false
    }
  });

  // Watch for form changes
  const watchedValues = watch();
  const sameAsCurrent = watch('sameAsCurrent');

  // Helper function to safely update address fields
  const safeSetAddressField = (addressPath, value) => {
    try {
      // Create a fresh copy of the current address object to avoid read-only issues
      if (addressPath.startsWith('permanentAddress.')) {
        const currentPermanentAddress = watch('permanentAddress') || {};
        const updatedAddress = {
          ...currentPermanentAddress,
          [addressPath.split('.')[1]]: value || ''
        };
        setValue('permanentAddress', updatedAddress);
      } else if (addressPath.startsWith('currentAddress.')) {
        const currentCurrentAddress = watch('currentAddress') || {};
        const updatedAddress = {
          ...currentCurrentAddress,
          [addressPath.split('.')[1]]: value || ''
        };
        setValue('currentAddress', updatedAddress);
      }
    } catch (error) {
      console.warn(`Failed to set ${addressPath}:`, error);
    }
  };

  // Helper function to safely update individual address fields
  const updateAddressField = (addressType, fieldName, value) => {
    try {
      const currentAddress = watch(addressType) || {};
      const updatedAddress = {
        ...currentAddress,
        [fieldName]: value || ''
      };
      setValue(addressType, updatedAddress);
    } catch (error) {
      console.warn(`Failed to update ${addressType}.${fieldName}:`, error);
    }
  };

  // Update form data in Redux on changes (debounced to prevent infinite loops)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Don't update if we're currently loading data from the application
      if (isLoadingRef.current) return;

      // Only update if values have actually changed and formData is not empty
      if (Object.keys(formData).length === 0) {
        // First time loading, always update
        // Create fresh copies of address objects to avoid read-only issues
        const freshValues = {
          ...watchedValues,
          currentAddress: { ...watchedValues.currentAddress },
          permanentAddress: { ...watchedValues.permanentAddress }
        };
        dispatch(updateFormData({ step: 'basics', data: freshValues }));
      } else {
        const hasChanges = Object.keys(watchedValues).some(key => {
          if (key === 'currentAddress' || key === 'permanentAddress') {
            // Deep compare address objects
            const current = formData[key] || {};
            const watched = watchedValues[key] || {};
            return JSON.stringify(current) !== JSON.stringify(watched);
          }
          return watchedValues[key] !== formData[key];
        });

        if (hasChanges) {
          // Create fresh copies of address objects to avoid read-only issues
          const freshValues = {
            ...watchedValues,
            currentAddress: { ...watchedValues.currentAddress },
            permanentAddress: { ...watchedValues.permanentAddress }
          };
          dispatch(updateFormData({ step: 'basics', data: freshValues }));
        }
      }
    }, 500); // Increased debounce to 500ms

    return () => clearTimeout(timeoutId);
  }, [dispatch, watchedValues]); // Removed formData dependency to prevent circular updates

  // Load existing data when component mounts, application changes, or when navigating to basics step
  useEffect(() => {
    // Only run this effect when we have an application
    if (!currentApplication?.id) return;
    
    // Skip if we're currently in the middle of loading to prevent conflicts
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;

    try {
      console.log('🔄 Main data loading effect triggered');
      console.log('📋 Current application:', currentApplication);
      console.log('📋 Current application basics:', currentApplication?.basics);
      console.log('🆔 Current application ID:', currentApplication?.id);
      console.log('👤 Current user ID from Redux:', currentApplication?.applicantId);
      console.log('📍 Current step:', currentStep);

      if (currentApplication?.basics) {
        const basicInfo = currentApplication.basics;
        console.log('📋 Basic info found:', basicInfo);
        console.log('🆔 NID in basic info:', basicInfo.nid);
        console.log('📋 Full basicInfo object:', basicInfo);

        // Create fresh address objects to avoid read-only issues
        const createAddressObject = (address) => {
          if (!address || typeof address === 'string') {
            // Handle legacy string addresses
            return {
              houseBuildingNo: '',
              streetLocalityArea: '',
              landmark: '',
              city: '',
              stateProvince: '',
              postalCode: '',
              country: 'Bangladesh'
            };
          }

          // Create completely fresh object from existing structured address
          return {
            houseBuildingNo: String(address.houseBuildingNo || ''),
            streetLocalityArea: String(address.streetLocalityArea || ''),
            landmark: String(address.landmark || ''),
            city: String(address.city || ''),
            stateProvince: String(address.stateProvince || ''),
            postalCode: String(address.postalCode || ''),
            country: String(address.country || 'Bangladesh')
          };
        };

        const formValues = {
          fullName: basicInfo.fullName || '',
          dateOfBirth: basicInfo.dateOfBirth ?
            new Date(basicInfo.dateOfBirth).toISOString().split('T')[0] : '',
          gender: basicInfo.gender || '',
          maritalStatus: basicInfo.maritalStatus || '',
          currentAddress: createAddressObject(basicInfo.currentAddress),
          permanentAddress: createAddressObject(basicInfo.permanentAddress),
          sameAsCurrent: basicInfo.sameAsCurrent || false,
          nid: basicInfo.nid || '',
          consentToProcessing: true
        };

        console.log('📝 Form values to be set:', formValues);
        console.log('🆔 NID value in form values:', formValues.nid);

        // Force the form to update with the new values
        console.log('🔄 About to call reset with formValues:', formValues);
        reset(formValues);
        console.log('✅ Reset called successfully');

        // Also update the Redux form data to keep it in sync
        // Create fresh copies to avoid read-only issues
        const freshFormData = {
          ...formValues,
          currentAddress: { ...formValues.currentAddress },
          permanentAddress: { ...formValues.permanentAddress }
        };
        dispatch(updateFormData({ step: 'basics', data: freshFormData }));
        
        console.log('✅ Form data loaded from application');
        
        // Verify the form was actually updated
        setTimeout(() => {
          const currentFormValues = watch();
          console.log('🔍 Current form values after main effect reset:', currentFormValues);
          console.log('🆔 NID in form after main effect reset:', currentFormValues.nid);
          
          // If NID is still not set, try direct setValue
          if (!currentFormValues.nid && basicInfo.nid) {
            console.log('🚨 NID still not set after reset, trying direct setValue...');
            setValue('nid', basicInfo.nid);
            
            setTimeout(() => {
              const finalFormValues = watch();
              console.log('🔍 Final form values after direct setValue:', finalFormValues);
              console.log('🆔 Final NID value:', finalFormValues.nid);
            }, 100);
          }
        }, 200);
      } else if (Object.keys(formData).length > 0) {
        console.log('📋 Loading from Redux form data:', formData);
        // Load from Redux if available
        // Create fresh copies to avoid read-only issues
        const freshFormData = {
          ...formData,
          currentAddress: { ...formData.currentAddress },
          permanentAddress: { ...formData.permanentAddress }
        };
        reset(freshFormData);
        console.log('✅ Form data loaded from Redux');
      } else {
        console.log('📋 No data available to load');
      }
    } finally {
      // Always reset the loading flag
      isLoadingRef.current = false;
    }
  }, [currentApplication?.id, currentApplication?.basics, currentStep, reset, dispatch]); // Added currentStep back

  // Separate effect for step navigation - only reload when step changes to 1
  useEffect(() => {
    console.log('🔄 Step navigation effect check:', {
      currentStep,
      hasBasics: !!currentApplication?.basics,
      isLoading: isLoadingRef.current,
      applicationId: currentApplication?.id
    });

    if (currentStep === 1 && currentApplication?.basics) {
      console.log('🔄 Step navigation effect triggered - reloading basics form data');
      console.log('📋 Current application basics:', currentApplication.basics);
      console.log('🆔 Current application ID:', currentApplication.id);
      console.log('👤 Current user ID from Redux:', currentApplication.applicantId);
      
      const basicInfo = currentApplication.basics;
      console.log('🆔 NID from backend:', basicInfo.nid);
      
      // Create fresh address objects to avoid read-only issues
      const createAddressObject = (address) => {
        if (!address || typeof address === 'string') {
          return {
            houseBuildingNo: '',
            streetLocalityArea: '',
            landmark: '',
            city: '',
            stateProvince: '',
            postalCode: '',
            country: 'Bangladesh'
          };
        }

        return {
          houseBuildingNo: String(address.houseBuildingNo || ''),
          streetLocalityArea: String(address.streetLocalityArea || ''),
          landmark: String(address.landmark || ''),
          city: String(address.city || ''),
          stateProvince: String(address.stateProvince || ''),
          postalCode: String(address.postalCode || ''),
          country: String(address.country || 'Bangladesh')
        };
      };

      const formValues = {
        fullName: basicInfo.fullName || '',
        dateOfBirth: basicInfo.dateOfBirth ?
          new Date(basicInfo.dateOfBirth).toISOString().split('T')[0] : '',
        gender: basicInfo.gender || '',
        maritalStatus: basicInfo.maritalStatus || '',
        currentAddress: createAddressObject(basicInfo.currentAddress),
        permanentAddress: createAddressObject(basicInfo.permanentAddress),
        sameAsCurrent: basicInfo.sameAsCurrent || false,
        nid: basicInfo.nid || '',
        consentToProcessing: true
      };

      console.log('📝 Form values to be set in step navigation:', formValues);
      console.log('🆔 NID value in form values:', formValues.nid);

      // Force update the form
      reset(formValues);
      
      // Update Redux form data
      const freshFormData = {
        ...formValues,
        currentAddress: { ...formValues.currentAddress },
        permanentAddress: { ...formValues.permanentAddress }
      };
      dispatch(updateFormData({ step: 'basics', data: freshFormData }));
      
      console.log('✅ Form data updated for step navigation');
    }
  }, [currentStep, currentApplication?.id, currentApplication?.basics, reset, dispatch]); // Added more dependencies

  // Handle same as current address
  useEffect(() => {
    if (sameAsCurrent) {
      const currentAddress = watch('currentAddress');
      if (currentAddress) {
        // Create a fresh copy of the current address to avoid read-only issues
        const freshPermanentAddress = {
          houseBuildingNo: currentAddress.houseBuildingNo || '',
          streetLocalityArea: currentAddress.streetLocalityArea || '',
          landmark: currentAddress.landmark || '',
          city: currentAddress.city || '',
          stateProvince: currentAddress.stateProvince || '',
          postalCode: currentAddress.postalCode || '',
          country: currentAddress.country || 'Bangladesh'
        };
        
        // Set the entire permanent address object at once
        setValue('permanentAddress', freshPermanentAddress);
      }
    }
  }, [sameAsCurrent, watch, setValue]);

  // Emergency NID fix - check if NID should be filled but isn't
  useEffect(() => {
    const currentFormValues = watch();
    const shouldHaveNID = currentApplication?.basics?.nid;
    const currentNID = currentFormValues.nid;
    
    console.log('🚨 Emergency NID check:', {
      shouldHaveNID,
      currentNID,
      hasApplication: !!currentApplication,
      hasBasics: !!currentApplication?.basics,
      currentStep,
      fullApplication: currentApplication
    });
    
    if (shouldHaveNID && !currentNID && currentStep === 1) {
      console.log('🚨 NID mismatch detected! Forcing NID update...');
      
      // Force update the NID field
      setValue('nid', shouldHaveNID);
      
      // Also update Redux
      const updatedFormData = {
        ...currentFormValues,
        nid: shouldHaveNID
      };
      dispatch(updateFormData({ step: 'basics', data: updatedFormData }));
      
      console.log('🚨 NID force updated to:', shouldHaveNID);
      
      // Verify the update
      setTimeout(() => {
        const newFormValues = watch();
        console.log('🔍 Form values after emergency NID fix:', newFormValues);
        console.log('🆔 NID after emergency fix:', newFormValues.nid);
      }, 100);
    }
  }, [watch, currentApplication?.basics?.nid, currentStep, setValue, dispatch]);

  // Additional aggressive NID fix - run every time the component renders
  useEffect(() => {
    if (currentStep === 1 && currentApplication?.basics?.nid) {
      const currentFormValues = watch();
      const shouldHaveNID = currentApplication.basics.nid;
      const currentNID = currentFormValues.nid;
      
      console.log('🔧 Aggressive NID check on render:', {
        shouldHaveNID,
        currentNID,
        isMatch: shouldHaveNID === currentNID
      });
      
      if (shouldHaveNID && shouldHaveNID !== currentNID) {
        console.log('🔧 Aggressive NID fix - updating form...');
        setValue('nid', shouldHaveNID);
        
        // Also update Redux
        const updatedFormData = {
          ...currentFormValues,
          nid: shouldHaveNID
        };
        dispatch(updateFormData({ step: 'basics', data: updatedFormData }));
        
        console.log('🔧 Aggressive NID fix completed');
      }
    }
  }); // No dependencies - runs on every render

  // Manual form update function for debugging
  const forceUpdateForm = () => {
    if (currentApplication?.basics) {
      const basicInfo = currentApplication.basics;
      console.log('🔧 Manual form update triggered');
      console.log('📋 Basic info for manual update:', basicInfo);
      console.log('🆔 NID for manual update:', basicInfo.nid);
      
      // Update each field individually
      setValue('fullName', basicInfo.fullName || '');
      setValue('dateOfBirth', basicInfo.dateOfBirth ? 
        new Date(basicInfo.dateOfBirth).toISOString().split('T')[0] : '');
      setValue('gender', basicInfo.gender || '');
      setValue('maritalStatus', basicInfo.maritalStatus || '');
      setValue('nid', basicInfo.nid || '');
      setValue('consentToProcessing', true);
      
      // Update address fields
      if (basicInfo.currentAddress) {
        setValue('currentAddress.houseBuildingNo', basicInfo.currentAddress.houseBuildingNo || '');
        setValue('currentAddress.streetLocalityArea', basicInfo.currentAddress.streetLocalityArea || '');
        setValue('currentAddress.landmark', basicInfo.currentAddress.landmark || '');
        setValue('currentAddress.city', basicInfo.currentAddress.city || '');
        setValue('currentAddress.stateProvince', basicInfo.currentAddress.stateProvince || '');
        setValue('currentAddress.postalCode', basicInfo.currentAddress.postalCode || '');
        setValue('currentAddress.country', basicInfo.currentAddress.country || 'Bangladesh');
      }
      
      if (basicInfo.permanentAddress) {
        setValue('permanentAddress.houseBuildingNo', basicInfo.permanentAddress.houseBuildingNo || '');
        setValue('permanentAddress.streetLocalityArea', basicInfo.permanentAddress.streetLocalityArea || '');
        setValue('permanentAddress.landmark', basicInfo.permanentAddress.landmark || '');
        setValue('permanentAddress.city', basicInfo.permanentAddress.city || '');
        setValue('permanentAddress.stateProvince', basicInfo.permanentAddress.stateProvince || '');
        setValue('permanentAddress.postalCode', basicInfo.permanentAddress.postalCode || '');
        setValue('permanentAddress.country', basicInfo.permanentAddress.country || 'Bangladesh');
      }
      
      console.log('🔧 Manual form update completed');
      
      // Verify the update
      setTimeout(() => {
        const updatedFormValues = watch();
        console.log('🔍 Form values after manual update:', updatedFormValues);
        console.log('🆔 NID after manual update:', updatedFormValues.nid);
      }, 100);
    }
  };

  // Debug: Log application data every render to see what's happening
  useEffect(() => {
    if (currentStep === 1) {
      console.log('🔍 Debug: Application data on render:', {
        hasApplication: !!currentApplication,
        applicationId: currentApplication?.id,
        hasBasics: !!currentApplication?.basics,
        basicsKeys: currentApplication?.basics ? Object.keys(currentApplication.basics) : [],
        nidValue: currentApplication?.basics?.nid,
        nidType: typeof currentApplication?.basics?.nid,
        fullBasics: currentApplication?.basics
      });
      
      // Also check form registration
      const currentFormValues = watch();
      console.log('🔍 Form registration check:', {
        formKeys: Object.keys(currentFormValues),
        hasNIDField: 'nid' in currentFormValues,
        nidFieldValue: currentFormValues.nid,
        formValues: currentFormValues
      });
    }
  }); // No dependencies - runs on every render

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearStepError('basics'));
  }, [dispatch]);

  // Force form data reload when component mounts and we're on step 1
  useEffect(() => {
    console.log('🔄 Component mount effect - checking if we need to load data');
    console.log('📍 Current step on mount:', currentStep);
    console.log('📋 Has application data:', !!currentApplication);
    console.log('🆔 Application ID:', currentApplication?.id);
    console.log('📋 Full currentApplication object:', currentApplication);
    
    if (currentStep === 1 && currentApplication?.basics) {
      console.log('🔄 Component mounted on step 1 with data - forcing form reload');
      
      const basicInfo = currentApplication.basics;
      console.log('🆔 NID value on mount:', basicInfo.nid);
      console.log('📋 Full basicInfo object:', basicInfo);
      
      // Create form values
      const createAddressObject = (address) => {
        if (!address || typeof address === 'string') {
          return {
            houseBuildingNo: '',
            streetLocalityArea: '',
            landmark: '',
            city: '',
            stateProvince: '',
            postalCode: '',
            country: 'Bangladesh'
          };
        }
        return {
          houseBuildingNo: String(address.houseBuildingNo || ''),
          streetLocalityArea: String(address.streetLocalityArea || ''),
          landmark: String(address.landmark || ''),
          city: String(address.city || ''),
          stateProvince: String(address.stateProvince || ''),
          postalCode: String(address.postalCode || ''),
          country: String(address.country || 'Bangladesh')
        };
      };

      const formValues = {
        fullName: basicInfo.fullName || '',
        dateOfBirth: basicInfo.dateOfBirth ?
          new Date(basicInfo.dateOfBirth).toISOString().split('T')[0] : '',
        gender: basicInfo.gender || '',
        maritalStatus: basicInfo.maritalStatus || '',
        currentAddress: createAddressObject(basicInfo.currentAddress),
        permanentAddress: createAddressObject(basicInfo.permanentAddress),
        sameAsCurrent: basicInfo.sameAsCurrent || false,
        nid: basicInfo.nid || '',
        consentToProcessing: true
      };

      console.log('📝 Setting form values on mount:', formValues);
      console.log('🆔 NID in form values on mount:', formValues.nid);
      
      // Use setTimeout to ensure this runs after the component is fully mounted
      setTimeout(() => {
        reset(formValues);
        console.log('✅ Form reset completed on mount');
        
        // Verify the form was actually updated
        setTimeout(() => {
          const currentFormValues = watch();
          console.log('🔍 Current form values after reset:', currentFormValues);
          console.log('🆔 NID in form after reset:', currentFormValues.nid);
          
          // If NID is still not set, try direct setValue
          if (!currentFormValues.nid && basicInfo.nid) {
            console.log('🚨 NID still not set after reset, trying direct setValue...');
            setValue('nid', basicInfo.nid);
            
            setTimeout(() => {
              const finalFormValues = watch();
              console.log('🔍 Final form values after direct setValue:', finalFormValues);
              console.log('🆔 Final NID value:', finalFormValues.nid);
            }, 100);
          }
        }, 200);
      }, 100);
    }
  }, []); // Empty dependency array - only run on mount

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      stepTracker.trackStepStarted(1, { action: 'form_submit' });
      
      // FUTURE USE - Uncomment when full form is needed
      // Format date for backend
      // const formattedData = {
      //   ...data,
      //   dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth + 'T00:00:00.000Z').toISOString() : null,
      //   // Clean NID - remove any non-digit characters
      //   nid: data.nid ? data.nid.replace(/\D/g, '') : '',
      //   // Remove UI-only fields
      //   sameAsCurrent: undefined,
      //   consentToProcessing: undefined
      // };

      // CURRENT IMPLEMENTATION - Only send required fields
      const formattedData = {
        fullName: data.fullName,
        // FUTURE USE - Add these fields when needed
        // dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth + 'T00:00:00.000Z').toISOString() : null,
        // gender: data.gender,
        // maritalStatus: data.maritalStatus,
        // currentAddress: data.currentAddress,
        // permanentAddress: data.permanentAddress,
        // nid: data.nid ? data.nid.replace(/\D/g, '') : '',
        // sameAsCurrent: data.sameAsCurrent,
        consentToProcessing: data.consentToProcessing
      };

      console.log('Submitting basics data:', formattedData);

      // FUTURE USE - Uncomment when address validation is needed
      // Validate required address fields
      // const requiredAddressFields = ['houseBuildingNo', 'streetLocalityArea', 'city', 'stateProvince', 'postalCode', 'country'];
      // const missingCurrentFields = requiredAddressFields.filter(field => !formattedData.currentAddress[field] || formattedData.currentAddress[field].trim() === '');
      
      // if (missingCurrentFields.length > 0) {
      //   toast.error(`Please fill in all required current address fields: ${missingCurrentFields.join(', ')}`);
      //   return;
      // }

      // if (!formattedData.sameAsCurrent) {
      //   const missingPermanentFields = requiredAddressFields.filter(field => !formattedData.permanentAddress[field] || formattedData.permanentAddress[field].trim() === '');
        
      //   if (missingPermanentFields.length > 0) {
      //     toast.error(`Please fill in all required permanent address fields: ${missingPermanentFields.join(', ')}`);
      //     return;
      //   }
      // }

      await dispatch(updateBasics({
        applicationId: currentApplication.id,
        basicData: formattedData
      })).unwrap();

      // Track step completion
      stepTracker.trackStepCompleted(1, formattedData, {
        hasConsent: data.consentToProcessing,
        // FUTURE USE - Uncomment when addresses are needed
        // addressesSame: data.sameAsCurrent,
      });

      toast.success('Basic information saved successfully!');
      onNext();
    } catch (error) {
      stepTracker.trackValidationError(1, 'form_submission', error.message || 'Save failed');
      console.error('Basics update error:', error);
      
      // Show more detailed error message
      let errorMessage = 'Failed to save basic information';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.payload && error.payload.message) {
        errorMessage = error.payload.message;
      } else if (error.payload && error.payload.error) {
        errorMessage = error.payload.error;
      }
      
      toast.error(errorMessage);
    }
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Ref to track if we're currently loading data to prevent conflicts
  const isLoadingRef = useRef(false);

  return (
    <div className="flex-1">


      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Please provide your personal details and identification information
            </p>
          </div>

        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full name *
            </label>
            <input
              type="text"
              id="fullName"
              {...register('fullName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Full name must be at least 2 characters'
                }
              })}
              onFocus={() => stepTracker.trackFieldFocused(1, 'fullName')}
              onBlur={(e) => stepTracker.trackFieldCompleted(1, 'fullName', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
            {errors.fullName && stepTracker.trackValidationError(1, 'fullName', errors.fullName.message)}
          </div>

          {/* FUTURE USE - Uncomment when needed */}
          {/* Date of Birth */}
          {/* <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth (dd/mm/yyyy) *
            </label>
            <input
              type="date"
              id="dateOfBirth"
              {...register('dateOfBirth', {
                required: 'Date of birth is required',
                validate: (value) => {
                  const today = new Date();
                  const birthDate = new Date(value);
                  const age = today.getFullYear() - birthDate.getFullYear();
                  
                  if (age < 18) {
                    return 'You must be at least 18 years old';
                  }
                  if (age > 100) {
                    return 'Please enter a valid date of birth';
                  }
                  return true;
                }
              })}
              max={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div> */}

          {/* FUTURE USE - Uncomment when needed */}
          {/* NID */}
          {/* <div>
            <label htmlFor="nid" className="block text-sm font-medium text-gray-700">
              NID *
            </label>
            <input
              type="text"
              id="nid"
              {...register('nid', {
                required: 'NID is required',
                pattern: {
                  value: /^\d{10,17}$/,
                  message: 'NID must be 10-17 digits'
                }
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Enter your NID number"
              maxLength="17"
            />
            {errors.nid && (
              <p className="mt-1 text-sm text-red-600">{errors.nid.message}</p>
            )}
          </div> */}

          {/* FUTURE USE - Uncomment when needed */}
          {/* Gender */}
          {/* <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Gender *
            </label>
            <select
              id="gender"
              {...register('gender', { required: 'Gender is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div> */}

          {/* FUTURE USE - Uncomment when needed */}
          {/* Marital Status */}
          {/* <div>
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
              Marital status *
            </label>
            <select
              id="maritalStatus"
              {...register('maritalStatus', { required: 'Marital status is required' })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">Select marital status</option>
              {MARITAL_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.maritalStatus && (
              <p className="mt-1 text-sm text-red-600">{errors.maritalStatus.message}</p>
            )}
          </div> */}
        </div>

        {/* FUTURE USE - Uncomment when address fields are needed */}
        {/* 
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
          
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">Current Address *</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="currentAddress.houseBuildingNo" className="block text-sm font-medium text-gray-700">
                  House/Building No. *
                </label>
                <input
                  type="text"
                  id="currentAddress.houseBuildingNo"
                  {...register('currentAddress.houseBuildingNo', {
                    required: 'House/Building number is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., 23B"
                />
                {errors.currentAddress?.houseBuildingNo && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentAddress.houseBuildingNo.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="currentAddress.streetLocalityArea" className="block text-sm font-medium text-gray-700">
                  Street/Locality/Area *
                </label>
                <input
                  type="text"
                  id="currentAddress.streetLocalityArea"
                  {...register('currentAddress.streetLocalityArea', {
                    required: 'Street/Locality/Area is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., MG Road"
                />
                {errors.currentAddress?.streetLocalityArea && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentAddress.streetLocalityArea.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="currentAddress.landmark" className="block text-sm font-medium text-gray-700">
                  Landmark *
                </label>
                <input
                  type="text"
                  id="currentAddress.landmark"
                  {...register('currentAddress.landmark', {
                    required: 'Landmark is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., Near Central Mall"
                />
                {errors.currentAddress?.landmark && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentAddress.landmark.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="currentAddress.city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="currentAddress.city"
                  {...register('currentAddress.city', {
                    required: 'City is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., Dhaka"
                />
                {errors.currentAddress?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentAddress.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="currentAddress.stateProvince" className="block text-sm font-medium text-gray-700">
                  State/Province *
                </label>
                <input
                  type="text"
                  id="currentAddress.stateProvince"
                  {...register('currentAddress.stateProvince', {
                    required: 'State/Province is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., Dhaka Division"
                />
                {errors.currentAddress?.stateProvince && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentAddress.stateProvince.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="currentAddress.postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="currentAddress.postalCode"
                  {...register('currentAddress.postalCode', {
                    required: 'Postal code is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., 1200"
                />
                {errors.currentAddress?.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentAddress.postalCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="currentAddress.country" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select
                  id="currentAddress.country"
                  {...register('currentAddress.country', {
                    required: 'Country is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="Other">Other</option>
                </select>
                {errors.currentAddress?.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentAddress.country.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="sameAsCurrent"
              type="checkbox"
              {...register('sameAsCurrent')}
              className="h-4 w-4 accent-green-500 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="sameAsCurrent" className="ml-3 text-sm text-gray-700">
              Same as current address
            </label>
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">Permanent Address *</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="permanentAddress.houseBuildingNo" className="block text-sm font-medium text-gray-700">
                  House/Building No. *
                </label>
                <input
                  type="text"
                  id="permanentAddress.houseBuildingNo"
                  {...register('permanentAddress.houseBuildingNo', {
                    required: 'House/Building number is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., 23B"
                />
                {errors.permanentAddress?.houseBuildingNo && (
                  <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.houseBuildingNo.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="permanentAddress.streetLocalityArea" className="block text-sm font-medium text-gray-700">
                  Street/Locality/Area *
                </label>
                <input
                  type="text"
                  id="permanentAddress.streetLocalityArea"
                  {...register('permanentAddress.streetLocalityArea', {
                    required: 'Street/Locality/Area is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., MG Road"
                />
                {errors.permanentAddress?.streetLocalityArea && (
                  <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.streetLocalityArea.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="permanentAddress.landmark" className="block text-sm font-medium text-gray-700">
                  Landmark *
                </label>
                <input
                  type="text"
                  id="permanentAddress.landmark"
                  {...register('permanentAddress.landmark', {
                    required: 'Landmark is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., Near Central Mall"
                />
                {errors.permanentAddress?.landmark && (
                  <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.landmark.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="permanentAddress.city" className="block text-sm font-medium text-gray-700">
                  City *
                </label>
                <input
                  type="text"
                  id="permanentAddress.city"
                  {...register('permanentAddress.city', {
                    required: 'City is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., Dhaka"
                />
                {errors.permanentAddress?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.city.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="permanentAddress.stateProvince" className="block text-sm font-medium text-gray-700">
                  State/Province *
                </label>
                <input
                  type="text"
                  id="permanentAddress.stateProvince"
                  {...register('permanentAddress.stateProvince', {
                    required: 'State/Province is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., Dhaka Division"
                />
                {errors.permanentAddress?.stateProvince && (
                  <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.stateProvince.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="permanentAddress.postalCode" className="block text-sm font-medium text-gray-700">
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="permanentAddress.postalCode"
                  {...register('permanentAddress.postalCode', {
                    required: 'Postal code is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., 1200"
                />
                {errors.permanentAddress?.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.postalCode.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="permanentAddress.country" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select
                  id="permanentAddress.country"
                  {...register('permanentAddress.country', {
                    required: 'Country is required'
                  })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="Other">Other</option>
                </select>
                {errors.permanentAddress?.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.permanentAddress.country.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Consent */}
        <div className="border-t pt-6">
          <div className="flex items-start">
            <input
              id="consentToProcessing"
              type="checkbox"
              {...register('consentToProcessing', {
                required: 'You must consent to data processing to continue'
              })}
              className="h-4 w-4 accent-green-500 focus:ring-green-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="consentToProcessing" className="ml-3 text-sm text-gray-700">
              I consent to the processing of my personal data
              <br />
              <span className="text-gray-500">
                By checking this box, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>
          </div>
          {errors.consentToProcessing && (
            <p className="mt-1 ml-7 text-sm text-red-600">{errors.consentToProcessing.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            <Button type="button" variant="outline" disabled>
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

export default BasicsStep;
