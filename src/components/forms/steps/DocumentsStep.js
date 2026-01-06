import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import JSZip from 'jszip';
import Button from '../../../components/common/Button';
import { toast } from 'react-hot-toast';
import { APIErrorHandler } from '../../../utils/apiErrorHandler';
import applicationsService from '../../../services/applications';
import { APPLICATION_STATUSES } from '../../../services/applications';
import { enableStepNavigation } from '../../../store/slices/applicationSlice';
import { setDocumentUploadStatus } from '../../../store/slices/applicationSlice';
import { uploadDocument } from '../../../store/slices/applicationSlice';
import { trackStepComplete, trackDocumentUpload, trackValidationError } from '../../../utils/stepTracking';
import { storage } from '../../../utils/helpers';
import { clearCalculatorData } from '../../../utils/localStorage';
import env from '../../../config/env';
import { DOCUMENT_TYPES, DOCUMENT_LABELS } from '../../../services/applications';
import useStepTracking from '../../../hooks/useStepTracking';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { selectCurrentApplication, selectIsUploadingDocument, selectStepError, clearStepError, selectUploadedDocuments } from '../../../store/slices/applicationSlice';

const DocumentsStep = ({ onNext, onPrevious }) => {
  // Error boundary for this component
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  // Router for navigation
  const router = useRouter();

  // Error boundary effect
  useEffect(() => {
    const handleError = (errorEvent) => {
      console.error('DocumentsStep error boundary caught:', errorEvent);
      setError(errorEvent.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  // If there's an error, show error UI
  if (hasError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3 className="text-sm font-medium text-red-800">
            Something went wrong with the document upload
          </h3>
        </div>
        <div className="mt-2 text-sm text-red-700">
          <p>Please refresh the page and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 underline"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
  const dispatch = useDispatch();

  // Step tracking
  const {
    trackStepStart,
    trackStepComplete,
    trackValidationError,
    trackDocumentUpload
  } = useStepTracking(4);

  // Redux state
  const currentApplication = useSelector(selectCurrentApplication);
  const isUploading = useSelector(selectIsUploadingDocument);
  const stepError = useSelector(selectStepError('documents'));
  const uploadedDocuments = useSelector(selectUploadedDocuments);

  // Local state
  const [documentFiles, setDocumentFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [documentPreviews, setDocumentPreviews] = useState({});
  const [isSelfieLivenessActive, setIsSelfieLivenessActive] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState(null);
  const [isCameraInitializing, setIsCameraInitializing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isCompletingApplication, setIsCompletingApplication] = useState(false);
  
  // Updated state for multiple files per document type
  const [multipleDocumentFiles, setMultipleDocumentFiles] = useState({
    [DOCUMENT_TYPES.NID]: [],
    [DOCUMENT_TYPES.DRIVERS_LICENSE]: [],
    [DOCUMENT_TYPES.INCOME_PROOF]: [],
    [DOCUMENT_TYPES.SELFIE_LIVENESS]: []
  });

  // File input refs
  const fileInputRefs = {
    [DOCUMENT_TYPES.NID]: useRef(null),
    [DOCUMENT_TYPES.DRIVERS_LICENSE]: useRef(null),
    [DOCUMENT_TYPES.INCOME_PROOF]: useRef(null),
    [DOCUMENT_TYPES.SELFIE_LIVENESS]: useRef(null)
  };

  // Video ref for selfie liveness
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Document requirements
  const documentRequirements = {
    [DOCUMENT_TYPES.NID]: {
      label: DOCUMENT_LABELS[DOCUMENT_TYPES.NID],
      description: 'Upload front and back sides',
      status: 'Pending Scan',
      required: true,
      acceptedFormats: '.pdf,.jpg,.jpeg,.png',
      maxSize: '10MB'
    },
    [DOCUMENT_TYPES.DRIVERS_LICENSE]: {
      label: DOCUMENT_LABELS[DOCUMENT_TYPES.DRIVERS_LICENSE],
      description: 'Must be valid and clearly visible',
      status: 'Pending Scan',
      required: true,
      acceptedFormats: '.pdf,.jpg,.jpeg,.png',
      maxSize: '10MB'
    },
    [DOCUMENT_TYPES.INCOME_PROOF]: {
      label: DOCUMENT_LABELS[DOCUMENT_TYPES.INCOME_PROOF],
      description: 'Last 1-3 months statements or receipts',
      status: 'Pending Scan',
      required: true,
      acceptedFormats: '.pdf,.jpg,.jpeg,.png',
      maxSize: '10MB'
    },
    [DOCUMENT_TYPES.SELFIE_LIVENESS]: {
      label: DOCUMENT_LABELS[DOCUMENT_TYPES.SELFIE_LIVENESS],
      description: 'Take a quick selfie to verify your identity',
      status: 'Not started',
      required: false,
      acceptedFormats: 'camera',
      maxSize: '5MB'
    }
  };

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearStepError('documents'));
  }, [dispatch]);

  // Load existing document status only once when component mounts or when application changes
  useEffect(() => {
    if (currentApplication?.documents && Array.isArray(currentApplication.documents)) {
      const docs = currentApplication.documents;
      docs.forEach(doc => {
        if (doc.files && doc.files.length > 0) {
          dispatch(setDocumentUploadStatus({ documentType: doc.type, status: 'uploaded' }));
        }
      });
    }
  }, [currentApplication?.id, dispatch]);

  // Track step start
  useEffect(() => {
    trackStepStart();
  }, [trackStepStart]);

  // Cleanup captured selfie when component unmounts
  useEffect(() => {
    return () => {
      if (capturedSelfie?.previewUrl) {
        URL.revokeObjectURL(capturedSelfie.previewUrl);
      }
    };
  }, [capturedSelfie]);

  // Debug refs initialization
  useEffect(() => {
    console.log('DocumentsStep mounted, refs status:', {
      videoRef: videoRef.current,
      canvasRef: canvasRef.current,
      videoElement: videoRef.current?.tagName,
      canvasElement: canvasRef.current?.tagName
    });
  }, []);

  // Check if all required documents are uploaded
  const checkRequiredDocuments = () => {
    const requiredDocTypes = [DOCUMENT_TYPES.NID, DOCUMENT_TYPES.DRIVERS_LICENSE, DOCUMENT_TYPES.INCOME_PROOF];
    
    // Check if we have a current application with documents
    if (!currentApplication?.documents) {
      console.log('🔍 No current application or documents found');
      return false;
    }
    
    console.log('🔍 Checking required documents:', {
      requiredDocTypes,
      currentApplicationDocuments: currentApplication.documents.map(d => ({
        type: d.type,
        hasFiles: !!(d.files && d.files.length > 0),
        fileCount: d.files?.length || 0
      })),
      multipleDocumentFiles
    });
    
    const result = requiredDocTypes.every(docType => {
      // Find the document in currentApplication.documents
      const doc = currentApplication.documents.find(d => d.type === docType);
      const hasFiles = !!(doc && doc.files && doc.files.length > 0);
      console.log(`📄 ${docType}: ${doc?.files?.length || 0} files, hasFiles: ${hasFiles}`);
      return hasFiles;
    });
    
    console.log('✅ Required documents check result:', result);
    return result;
  };

  // Handle continue to next step
  const handleContinue = () => {
    if (checkRequiredDocuments()) {
      trackStepComplete({
        action: 'continue_to_review',
        documentsUploaded: Object.keys(documentFiles).length,
        hasAllRequiredDocuments: true,
      });
      
      // Don't navigate to next step if application is approved
      if (currentApplication?.status === APPLICATION_STATUSES.APPROVED) {
        console.log('Application is approved - staying on documents step for completion');
        return;
      }
      
      // Enable navigation to next step
      dispatch(enableStepNavigation(5)); // Enable review step
      
      // Navigate to next step
      onNext();
    } else {
      trackValidationError('documents', 'Required documents not uploaded');
      toast.error('Please upload all required documents before continuing');
    }
  };

  // Handle complete application submission
  const handleCompleteApplication = async () => {
    if (!checkRequiredDocuments()) {
      toast.error('Please upload all required documents before completing the application');
      return;
    }

    setIsCompletingApplication(true);
    
    try {
      trackStepComplete({
        action: 'complete_application',
        documentsUploaded: Object.keys(documentFiles).length,
        hasAllRequiredDocuments: true,
      });

      // Submit application for documents review
      const result = await applicationsService.submitForDocumentsReview(currentApplication.id);
      
      if (result.success) {
        toast.success('Application completed successfully! Your documents have been submitted for review.');
        
         // Clear calculator data from localStorage after successful submission
         clearCalculatorData();
         
        // Redirect to success page
        router.push(`/application/${currentApplication.id}/success`);
      } else {
        throw new Error(result.message || 'Failed to complete application');
      }
    } catch (error) {
      console.error('Complete application error:', error);
      toast.error(error.message || 'Failed to complete application. Please try again.');
    } finally {
      setIsCompletingApplication(false);
    }
  };

  // Enable next step when all required documents are uploaded
  useEffect(() => {
    if (checkRequiredDocuments()) {
      dispatch(enableStepNavigation(5));
    }
  }, [uploadedDocuments, currentApplication, dispatch]);

  // Validate file before processing
  const validateFile = (file, documentType) => {
    if (!file) {
      throw new Error('No file selected');
    }

    if (!file.name || !file.size || !file.type) {
      throw new Error('Invalid file format');
    }

    if (file.size === 0) {
      throw new Error('File is empty');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size must be less than 10MB');
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPG, PNG, and PDF files are allowed');
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = (documentType, event) => {
    try {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      // Validate all files first
      files.forEach(file => {
        validateFile(file, documentType);
      });

      trackDocumentUpload(documentType, 'started', {
        fileCount: files.length,
        fileSize: files.reduce((total, file) => total + file.size, 0),
        fileTypes: files.map(f => f.type)
      });

      console.log('📁 Files selected:', {
        documentType,
        fileCount: files.length,
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }))
      });

      // Update multiple files state
      setMultipleDocumentFiles(prev => ({
        ...prev,
        [documentType]: [...(prev[documentType] || []), ...files]
      }));

      // Also update the legacy documentFiles state for backward compatibility
      setDocumentFiles(prev => ({
        ...prev,
        [documentType]: files[0] // Keep first file for backward compatibility
      }));

      // Create previews for images
      files.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setDocumentPreviews(prev => ({
              ...prev,
              [`${documentType}_${index}`]: e.target.result
            }));
          };
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            toast.error('Failed to read file. Please try again.');
          };
          reader.readAsDataURL(file);
        }
      });

      // Auto-upload all files after selection
      console.log('🚀 Calling handleUpload with files:', files);
      handleUpload(documentType, files);
    } catch (error) {
      console.error('Error in handleFileSelect:', error);
      const normalizedError = normalizeError(error);
      APIErrorHandler.showErrorToast(normalizedError, 'file_selection');
    }
  };

  // Normalize error objects to ensure consistent structure
  const normalizeError = (error) => {
    if (!error) {
      return {
        name: 'UnknownError',
        message: 'An unknown error occurred',
        status: 500
      };
    }

    // If error is already properly structured, return as is
    if (error.name && error.message) {
      return error;
    }

    // If error is a string, convert to error object
    if (typeof error === 'string') {
      return {
        name: 'StringError',
        message: error,
        status: 500
      };
    }

    // If error has status and url but no name/message, normalize it
    if (error.status && error.url && !error.name) {
      return {
        name: 'HTTPError',
        message: `Request failed with status ${error.status}`,
        status: error.status,
        url: error.url,
        timestamp: error.timestamp
      };
    }

    // If error has message but no name, add a default name
    if (error.message && !error.name) {
      return {
        name: 'GenericError',
        message: error.message,
        status: error.status || 500,
        ...error
      };
    }

    // Fallback: create a generic error object
    return {
      name: 'GenericError',
      message: error.message || 'An unexpected error occurred',
      status: error.status || 500,
      ...error
    };
  };

  // Handle specific error types that might occur during file operations
  const handleSpecificErrors = (error) => {
    if (error.message && error.message.includes('Cannot convert undefined or null to object')) {
      return {
        name: 'FileConversionError',
        message: 'File processing failed. Please try again with a different file.',
        status: 400,
        shouldRetry: true
      };
    }

    if (error.message && error.message.includes('Network')) {
      return {
        name: 'NetworkError',
        message: 'Network connection failed. Please check your internet connection and try again.',
        status: 0,
        shouldRetry: true
      };
    }

    return null; // Let the normal error handling take over
  };

  // Handle document upload
  const handleUpload = async (documentType, files) => {
    console.log('🔍 handleUpload called with:', {
      documentType,
      files,
      multipleDocumentFilesState: multipleDocumentFiles,
      filesFromState: multipleDocumentFiles[documentType]
    });

    // Ensure files is an array
    const fileArray = Array.isArray(files) ? files : [files];
    
    if (fileArray.length === 0) {
      console.error('❌ No files found for upload');
      toast.error('Please select files first');
      return;
    }

    // Check if we have a valid application ID
    if (!currentApplication?.id) {
      console.error('❌ No application ID found');
      toast.error('Application not found. Please refresh the page and try again.');
      return;
    }

    // Set upload status to uploading
    dispatch(setDocumentUploadStatus({ documentType, status: 'uploading' }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[documentType] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [documentType]: current + 10 };
        });
      }, 100);

      // Create FormData for multiple file uploads
      const formData = new FormData();
      formData.append('type', documentType);
      
      // Append each file to the FormData
      fileArray.forEach((file, index) => {
        formData.append('documents', file);
      });

      console.log('📤 Uploading files:', {
        documentType,
        fileCount: fileArray.length,
        formDataEntries: Array.from(formData.entries())
      });

      // Call the upload API
      const result = await dispatch(uploadDocument({
        applicationId: currentApplication.id,
        documentData: formData
      })).unwrap();

      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));

      // Update upload status
      dispatch(setDocumentUploadStatus({ documentType, status: 'uploaded' }));

      // Track successful upload
      trackDocumentUpload(documentType, 'completed', {
        fileSize: fileArray.reduce((total, file) => total + file.size, 0),
        result: result
      });

      toast.success(`${documentRequirements[documentType].label} uploaded successfully!`);

      // Clear file input
      if (fileInputRefs[documentType].current) {
        fileInputRefs[documentType].current.value = '';
      }

    } catch (error) {
      // Check for specific error types first
      const specificError = handleSpecificErrors(error);
      if (specificError) {
        trackDocumentUpload(documentType, 'failed', {
          error: specificError.message,
          fileSize: fileArray.reduce((total, file) => total + file.size, 0)
        });
        console.error('Specific error handled:', specificError);
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
        dispatch(setDocumentUploadStatus({ documentType, status: 'error' }));

        // Show specific error message
        toast.error(specificError.message);
        return;
      }

      // Normalize the error object to ensure it has the expected structure
      const normalizedError = normalizeError(error);

      trackDocumentUpload(documentType, 'failed', {
        error: normalizedError.message || 'Unknown error',
        fileSize: fileArray.reduce((total, file) => total + file.size, 0)
      });
      console.error('Upload error:', normalizedError);
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      dispatch(setDocumentUploadStatus({ documentType, status: 'error' }));

      // Use the comprehensive error handler
      APIErrorHandler.showErrorToast(normalizedError, 'document_upload', () => {
        // Retry function
        if (multipleDocumentFiles[documentType]) {
          handleUpload(documentType, multipleDocumentFiles[documentType]);
        }
      });
    }
  };

  // Start selfie liveness capture
  const startSelfieLiveness = async () => {
    try {
      // Validate refs first
      if (!videoRef.current) {
        console.error('Video ref not found, refs:', { videoRef: videoRef.current, canvasRef: canvasRef.current });

        // Check if the video element exists in the DOM
        const videoElement = document.querySelector('video[ref="videoRef"]') || document.querySelector('video');
        console.log('DOM video elements found:', videoElement);

        throw new Error('Video element not found. Please refresh the page and try again.');
      }

      if (!canvasRef.current) {
        console.error('Canvas ref not found');
        throw new Error('Canvas element not found. Please refresh the page and try again.');
      }

      setIsCameraInitializing(true);
      console.log('Starting camera initialization...', {
        videoRef: videoRef.current,
        canvasRef: canvasRef.current,
        videoElement: videoRef.current?.tagName,
        canvasElement: canvasRef.current?.tagName
      });

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user',
          aspectRatio: { ideal: 4 / 3 }
        }
      });

      console.log('Camera stream obtained:', stream);

      // Double-check refs after async operation
      if (!videoRef.current) {
        console.error('Video ref lost after stream acquisition');
        throw new Error('Video element was removed. Please refresh the page and try again.');
      }

      console.log('Video ref found, setting stream...');

      // Set the stream as the video source
      videoRef.current.srcObject = stream;

      // Wait for video to be ready before showing camera interface
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded, dimensions:', {
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        });

        // Ensure video is playing
        videoRef.current.play().then(() => {
          console.log('Video started playing successfully');
          setIsCameraInitializing(false);
          setIsSelfieLivenessActive(true);
        }).catch((playError) => {
          console.error('Error playing video:', playError);
          toast.error('Camera started but video playback failed. Please try again.');
          setIsCameraInitializing(false);
          stopSelfieLiveness();
        });
      };

      // Handle video errors
      videoRef.current.onerror = (error) => {
        console.error('Video error:', error);
        toast.error('Camera error occurred. Please try again.');
        setIsCameraInitializing(false);
        stopSelfieLiveness();
      };

      // Add additional event listeners for debugging
      videoRef.current.oncanplay = () => {
        console.log('Video can play');
      };

      videoRef.current.onloadeddata = () => {
        console.log('Video data loaded');
      };

      videoRef.current.onstalled = () => {
        console.log('Video stalled');
      };

      videoRef.current.onwaiting = () => {
        console.log('Video waiting');
      };

    } catch (error) {
      console.error('Camera access error:', error);
      setIsCameraInitializing(false);
      setCameraError(error.message || 'Unknown camera error');

      if (error.name === 'NotAllowedError') {
        toast.error('Camera access denied. Please allow camera permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found. Please check your device has a camera.');
      } else if (error.name === 'NotReadableError') {
        toast.error('Camera is in use by another application. Please close other camera apps and try again.');
      } else {
        toast.error(`Unable to access camera: ${error.message}`);
      }
    }
  };

  // Capture selfie
  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert to PNG blob and show preview
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'selfie-liveness.png', { type: 'image/png' });

        // Create preview URL
        const previewUrl = URL.createObjectURL(blob);
        setCapturedSelfie({ file, previewUrl });

        // Stop camera but don't upload yet
        stopSelfieLiveness();

        toast.success('Selfie captured! Please review and confirm.');
      } else {
        toast.error('Failed to capture selfie. Please try again.');
      }
    }, 'image/png', 1.0); // PNG format with maximum quality
  };

  // Stop selfie liveness capture
  const stopSelfieLiveness = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsSelfieLivenessActive(false);
    setIsCameraInitializing(false);
    setCameraError(null);
  };

  // Confirm and upload captured selfie
  const confirmAndUploadSelfie = () => {
    if (capturedSelfie) {
      setDocumentFiles(prev => ({
        ...prev,
        [DOCUMENT_TYPES.SELFIE_LIVENESS]: capturedSelfie.file
      }));

      // Upload the confirmed selfie
      handleUpload(DOCUMENT_TYPES.SELFIE_LIVENESS, capturedSelfie.file);

      // Clear the captured selfie
      setCapturedSelfie(null);
    }
  };

  // Retake selfie
  const retakeSelfie = () => {
    setCapturedSelfie(null);
    startSelfieLiveness();
  };
  const handleDownload = async (file) => {
    try {
      const token = storage.get(env.STORAGE_KEYS.ACCESS_TOKEN);
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications/${currentApplication.id}/documents/${file.filename}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // replace with actual token logic
          },
        }
      );
      console.log("=================== handleDownload res", res)

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename; // suggest filename
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };



  // Download a single file
  const downloadFile = async (file, documentType, index) => {
    try {
      const token = storage.get(env.STORAGE_KEYS.ACCESS_TOKEN);
      const applicationId = currentApplication?.id;
      if (!applicationId) {
        toast.error('Application ID not found.');
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications/${applicationId}/documents/${file.filename}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to download file ${file.name}: ${res.statusText}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`File "${file.name}" downloaded successfully!`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(`Failed to download file "${file.name}": ${error.message}`);
    }
  };

  // Download all documents for the entire application
  const downloadAllApplicationDocuments = async () => {
    try {
      const token = storage.get(env.STORAGE_KEYS.ACCESS_TOKEN);
      const applicationId = currentApplication?.id;
      if (!applicationId) {
        toast.error('Application ID not found.');
        return;
      }

      // Get all documents from the backend
      const result = await applicationsService.getApplicationDocuments(applicationId);
      if (!result.success) {
        throw new Error(result.message || 'Failed to get application documents');
      }

      const documents = result.data.documents;
      if (!documents || documents.length === 0) {
        toast.info('No documents found for this application.');
        return;
      }

      const zip = new JSZip();
      let totalFiles = 0;

      // Process each document type
      for (const doc of documents) {
        if (doc.files && doc.files.length > 0) {
          const docTypeFolder = zip.folder(DOCUMENT_LABELS[doc.type] || doc.type);
          
          for (const file of doc.files) {
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/applications/${applicationId}/documents/${file.filename}`,
                {
                  method: "GET",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              
              if (!res.ok) {
                console.warn(`Failed to download file ${file.filename}: ${res.statusText}`);
                continue;
              }
              
              const blob = await res.blob();
              const fileName = file.originalName || file.filename;
              docTypeFolder.file(fileName, blob);
              totalFiles++;
            } catch (error) {
              console.warn(`Error downloading file ${file.filename}:`, error);
              continue;
            }
          }
        }
      }

      if (totalFiles === 0) {
        toast.info('No downloadable files found.');
        return;
      }

      const content = await zip.generateAsync({ type: "blob" });
      const blob = new Blob([content], { type: "application/zip" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentApplication.applicationNumber || currentApplication.id}_all_documents.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${totalFiles} files successfully!`);
    } catch (error) {
      console.error("Error downloading all application documents:", error);
      toast.error(`Failed to download application documents: ${error.message}`);
    }
  };

  // Get document status info
  const getDocumentStatus = (documentType) => {
    const isUploaded = uploadedDocuments[documentType] === 'uploaded' ||
      currentApplication?.documents?.[documentType];
    const isUploading = uploadedDocuments[documentType] === 'uploading';
    const hasError = uploadedDocuments[documentType] === 'error';
    const progress = uploadProgress[documentType] || 0;

    return { isUploaded, isUploading, hasError, progress };
  };

  // Render document upload section with horizontal layout
  const renderDocumentUpload = (documentType) => {
    const requirement = documentRequirements[documentType];
    const { isUploaded, isUploading, hasError, progress } = getDocumentStatus(documentType);

    if (documentType === DOCUMENT_TYPES.SELFIE_LIVENESS) {
      return renderSelfieLiveness();
    }

    return (
      <div key={documentType} className="border border-gray-200 rounded-lg p-6">
        {/* Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-center">

          {/* Left: Document Type */}
          <div className="md:col-span-1 lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {requirement.label}
                    {requirement.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                </div>

                {/* Status Badge */}
                <div className="flex items-center">
                  {isUploaded && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}

                  {isUploading && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Scan
                    </span>
                  )}

                  {hasError && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Upload Failed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Middle: File Requirements */}
          <div className="md:col-span-1 lg:col-span-1">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-full">
              <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File Requirements
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Maximum {requirement.maxSize} per file
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Accepted: {requirement.acceptedFormats.replace(/\./g, '').toUpperCase()}
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Clear and readable
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Replaceable before submission
                </div>
              </div>
            </div>
          </div>

          {/* Right: Upload Button and Details */}
          <div className="md:col-span-1 lg:col-span-1">
            <div className="space-y-4">
              {/* Upload Progress */}
              {isUploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">Uploading...</span>
                    <span className="text-sm text-blue-600">{progress}%</span>
                  </div>
                  <div className="bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* File Preview */}
              {documentPreviews[documentType] && (
                <div className="text-center">
                  <img
                    src={documentPreviews[documentType]}
                    alt="Document preview"
                    className="w-32 h-24 object-cover rounded border mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-1">Preview</p>
                </div>
              )}

              {/* Upload Button */}
              <div className="text-center">
                <Button
                  type="button"
                  variant={isUploaded ? "outline" : hasError ? "outline" : "primary"}
                  onClick={() => {
                    if (hasError && multipleDocumentFiles[documentType]) {
                      // Retry upload with existing files
                      handleUpload(documentType, multipleDocumentFiles[documentType]);
                    } else {
                      fileInputRefs[documentType].current?.click();
                    }
                  }}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center"
                >
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {isUploaded ? 'Add More Documents' : hasError ? 'Retry Upload' : 'Upload Documents'}
                </Button>

                <p className="text-xs text-gray-500 mt-2">
                  Max {requirement.maxSize} • {requirement.acceptedFormats.replace(/\./g, '').toUpperCase()} • Multiple files allowed
                </p>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRefs[documentType]}
                type="file"
                multiple
                accept={requirement.acceptedFormats}
                onChange={(e) => handleFileSelect(documentType, e)}
                className="hidden"
              />

              {/* Uploaded Files Display */}
              {renderUploadedFiles(documentType)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render selfie liveness section with horizontal layout
  const renderSelfieLiveness = () => {
    const requirement = documentRequirements[DOCUMENT_TYPES.SELFIE_LIVENESS];
    const { isUploaded, isUploading } = getDocumentStatus(DOCUMENT_TYPES.SELFIE_LIVENESS);

    return (
      <div className="border border-gray-200 rounded-lg p-6">
        {/* Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-center">

          {/* Left: Document Type */}
          <div className="md:col-span-1 lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {requirement.label}
                    <span className="text-sm text-gray-500 font-bold ml-2">(Optional)</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                </div>

                {isUploaded && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Not provided (optional)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Middle: File Requirements */}
          <div className="md:col-span-1 lg:col-span-1">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 h-full">
              <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File Requirements
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Maximum {requirement.maxSize} per file
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Camera capture required
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Live photo verification
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Optional document
                </div>
              </div>
            </div>
          </div>

          {/* Right: Camera Interface */}
          <div className="md:col-span-1 lg:col-span-1">
            <div className="space-y-4">
              {isCameraInitializing ? (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <LoadingSpinner size="lg" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Initializing Camera...</h4>
                    <p className="text-sm text-gray-600">Please wait while we set up your camera</p>
                  </div>
                </div>
              ) : isSelfieLivenessActive ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    {/* Video element is now always available in the DOM */}
                    <div className="w-full max-w-md mx-auto block">
                      {/* Camera overlay with capture guide */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-4 left-4 right-4 text-center">
                          <div className="inline-block bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            📸 Position your face in the center
                          </div>
                        </div>

                        {/* Capture frame overlay */}
                        <div className="absolute inset-8 border-2 border-white border-dashed rounded-lg opacity-50"></div>

                        {/* Bottom overlay for instructions */}
                        <div className="absolute bottom-4 left-4 right-4 text-center">
                          <div className="inline-block bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            Click Capture when ready
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                                      <div className="flex justify-center space-x-2">
                      <Button
                        type="button"
                        onClick={captureSelfie}
                        disabled={isUploading}
                        className="btn-green px-3 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 text-sm"
                      >
                        {isUploading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>Capture</span>
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={stopSelfieLiveness}
                        className="px-3 py-1.5 rounded-lg text-sm"
                      >
                        Cancel
                      </Button>
                    </div>

                </div>
              ) : capturedSelfie ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Review Your Selfie</h4>
                    <div className="relative bg-white rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={capturedSelfie.previewUrl}
                        alt="Captured selfie"
                        className="w-full max-w-md mx-auto block"
                      />
                    </div>
                  </div>

                                      <div className="flex justify-center space-x-2">
                      <Button
                        type="button"
                        onClick={confirmAndUploadSelfie}
                        disabled={isUploading}
                        className="btn-green px-3 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 text-sm"
                      >
                        {isUploading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Confirm</span>
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={retakeSelfie}
                        className="px-3 py-1.5 rounded-lg text-sm"
                      >
                        Retake
                      </Button>
                    </div>
                </div>
              ) : cameraError ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>

                  <h4 className="text-lg font-medium text-gray-900 mb-2">Camera Error</h4>
                  <p className="text-sm text-gray-600 mb-4">{cameraError}</p>

                                      <div className="space-y-3">
                      <Button
                        type="button"
                        onClick={startSelfieLiveness}
                        disabled={isUploading}
                        className="btn-green w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 text-sm"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Retry Camera</span>
                      </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCameraError(null)}
                      className="w-full py-2 px-4 rounded-lg"
                    >
                      Clear Error
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                                      <Button
                      type="button"
                      onClick={startSelfieLiveness}
                      disabled={isUploading}
                      className="btn-green w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 text-sm"
                    >
                      {isUploading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          {/* <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg> */}
                          <span>Start Camera</span>
                        </>
                      )}
                    </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render uploaded files for a document type
  const renderUploadedFiles = (documentType) => {
    const files = multipleDocumentFiles[documentType] || [];
    
    if (files.length === 0) return null;
    
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Uploaded Files ({files.length})
        </h4>
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" style={{ color: 'var(--color-green-500)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-600">{file.name}</span>
                <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
              </div>
              <div className="flex items-center space-x-2">
                
                <button
                  onClick={() => removeFile(documentType, index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete file"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Remove a specific file
  const removeFile = (documentType, fileIndex) => {
    setMultipleDocumentFiles(prev => ({
      ...prev,
      [documentType]: prev[documentType].filter((_, index) => index !== fileIndex)
    }));
    
    // Also remove from documentFiles for backward compatibility
    setDocumentFiles(prev => {
      const newState = { ...prev };
      delete newState[documentType];
      return newState;
    });
    
    // Remove preview
    setDocumentPreviews(prev => {
      const newState = { ...prev };
      delete newState[`${documentType}_${fileIndex}`];
      return newState;
    });
    
    toast.success('File removed successfully');
  };

  // Helper to format file size
  const formatFileSize = (bytes, decimalPoint = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimalPoint < 0 ? 0 : decimalPoint;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1">
      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentApplication?.status === APPLICATION_STATUSES.APPROVED 
                ? 'Complete Your Application' 
                : 'Documents'
              }
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {currentApplication?.status === APPLICATION_STATUSES.APPROVED 
                ? 'Upload the required documents to complete your application. Once submitted, your documents will be reviewed for final approval.'
                : 'Upload the required documents to verify your identity and eligibility'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Status Indicator for Approved Applications */}
      {currentApplication?.status === APPLICATION_STATUSES.APPROVED && (
        <div className="border rounded-md p-4 mb-6" style={{ backgroundColor: 'var(--color-green-50)', borderColor: 'var(--color-green-200)' }}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" style={{ color: 'var(--color-green-400)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium" style={{ color: 'var(--color-green-800)' }}>
                Application Approved - Documents Required
              </h3>
              <div className="mt-2 text-sm" style={{ color: 'var(--color-green-700)' }}>
                <p>
                  Your initial application has been approved! Please upload the required documents to complete your application.
                  Once submitted, your documents will be reviewed for final approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download All Documents Button */}
      {currentApplication?.documents && currentApplication.documents.some(doc => doc.files?.length > 0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">
                Download All Documents
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Download all uploaded documents for this application as a ZIP file
              </p>
            </div>
            <button
              onClick={downloadAllApplicationDocuments}
              className="bg-blue-600 text-white text-sm py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download All</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden video and canvas elements for camera functionality */}
      <div className="hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas ref={canvasRef} />
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Error Display */}
        {stepError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {stepError.title || 'Upload Error'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{stepError.message}</p>
                  {stepError.details && Array.isArray(stepError.details) && stepError.details.length > 0 && (
                    <ul className="list-disc list-inside mt-1">
                      {stepError.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Sections */}
        <div className="space-y-8">
          {Object.keys(documentRequirements).map(documentType =>
            renderDocumentUpload(documentType)
          )}
        </div>

        {/* Uploaded Documents Display */}
        {currentApplication?.documents && currentApplication.documents.some(doc => doc.files?.length > 0) && (
          <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-primary-800 mb-3">Uploaded Documents:</h3>
            <div className="space-y-2">
              {currentApplication.documents
                .filter(doc => doc.files && doc.files.length > 0)
                .map((doc, docIndex) => (
                  <div key={docIndex} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {DOCUMENT_LABELS[doc.type]}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {doc.files.length} file(s) uploaded
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {doc.files.map((file, fileIndex) => (
                        <button
                          onClick={() => handleDownload(file)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download {file.side}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* File Requirements Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Important Notes:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• All documents must be clear and readable</li>
            <li>• Documents will be verified within 24-48 hours</li>
            <li>• You'll receive notifications about verification status</li>
            <li>• You can replace documents before final submission</li>
          </ul>
        </div>

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
            
            {/* Show different buttons based on application status */}
            {currentApplication?.status === APPLICATION_STATUSES.APPROVED ? (
              // For approved applications, show Complete Application button
              <Button
                onClick={handleCompleteApplication}
                disabled={!checkRequiredDocuments() || isCompletingApplication}
                className="min-w-[150px] text-white"
              >
                {isCompletingApplication ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Completing...
                  </>
                ) : (
                  'Complete Application'
                )}
              </Button>
            ) : (
              // For other statuses, show Continue to Review button
              <Button
                onClick={handleContinue}
                disabled={!checkRequiredDocuments() || isUploading}
                className="min-w-[100px]"
              >
                Continue to Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsStep;
