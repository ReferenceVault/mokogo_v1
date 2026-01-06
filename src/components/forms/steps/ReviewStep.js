import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  submitApplication,
  selectCurrentApplication,
  selectIsSubmitting,
  selectStepError,
  clearStepError,
  setCurrentStep
} from '../../../store/slices/applicationSlice';
import { APPLICATION_STATUSES, STEP_NAMES, DOCUMENT_LABELS } from '../../../services/applications';
import applicationsService from '../../../services/applications';
import useStepTracking from '../../../hooks/useStepTracking';
import Button from '../../common/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { clearCalculatorData } from '../../../utils/localStorage';
import { toast } from 'react-hot-toast';

const ReviewStep = ({ onPrevious }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Step tracking
  const { 
    trackStepStart, 
    trackStepComplete, 
    trackValidationError,
    stepTracker
  } = useStepTracking(5);
  
  // Redux state
  const currentApplication = useSelector(selectCurrentApplication);
  const isSubmitting = useSelector(selectIsSubmitting);
  const stepError = useSelector(selectStepError('review'));
  
  // Local state
  const [finalConsent, setFinalConsent] = useState(false);
  const [isDocumentsReview, setIsDocumentsReview] = useState(false);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearStepError('review'));
    
    // Check if this is documents review submission
    if (currentApplication?.status === APPLICATION_STATUSES.APPROVED) {
      setIsDocumentsReview(true);
    }
  }, [dispatch, currentApplication]);

  // Handle edit section
  const handleEditSection = (step) => {
    dispatch(setCurrentStep(step));
  };

  // Handle application submission
  const handleSubmit = async () => {
    trackStepStart({ action: 'submit_application' });
    
    if (!finalConsent) {
      toast.error('Please confirm that all information is accurate');
      trackValidationError('finalConsent', 'Final consent required');
      return;
    }

    try {
      if (isDocumentsReview) {
        // Submit for documents review
        const result = await applicationsService.submitForDocumentsReview(currentApplication.id);
        if (result.success) {
          toast.success('Documents submitted for review successfully!');
          // Clear calculator data from localStorage after successful submission
          clearCalculatorData();
          router.push(`/application/${currentApplication.id}/success`);
        } else {
          throw new Error(result.message);
        }
      } else {
        // Initial application submission
        await dispatch(submitApplication(currentApplication.id)).unwrap();
        
        // Track application submission
        stepTracker.trackApplicationSubmitted({
          applicationId: currentApplication.id,
          campaignId: currentApplication.campaignId,
          hasAllSteps: true,
          finalConsentGiven: finalConsent,
        });
        
        toast.success('Application submitted successfully!', {
          duration: 3000,
        });

        // Clear calculator data from localStorage after successful submission
        clearCalculatorData();
        
      }
            
      // Redirect to success page
      router.push(`/application/${currentApplication.id}/success`);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit application');
    }
  };

  // Check if application is already submitted
  const isAlreadySubmitted = [
    APPLICATION_STATUSES.SUBMITTED,
    APPLICATION_STATUSES.UNDER_REVIEW,
    APPLICATION_STATUSES.APPROVED,
    APPLICATION_STATUSES.REJECTED
  ].includes(currentApplication?.status);

  // Format data for display
  const formatBasicsInfo = (basicInfo) => {
    if (!basicInfo) return {};
    
    return {
      'Full Name': basicInfo.fullName || ''
    };
  };

  const formatContactInfo = (contactInfo) => {
    if (!contactInfo) return {};
    
    return {
      'Phone Number': contactInfo.phoneNumber ? `+880 ${contactInfo.phoneNumber}` : '',
      'Phone Verified': contactInfo.phoneVerified ? 'Verified' : 'Pending',
      // 'Email Address': contactInfo.emailAddress || 'Not provided',
      // 'Email Verified': contactInfo.emailVerified ? 'Verified' : 'Pending',
      // 'Alternative Contact': contactInfo.alternativeContact || 'Not provided',
      // 'Preferred Language': contactInfo.preferredLanguage?.charAt(0).toUpperCase() + 
        // contactInfo.preferredLanguage?.slice(1)
    };
  };

  const formatCreditScoreInfo = (creditScoreInfo) => {
    if (!creditScoreInfo) return {};
    
    // Debug logging
    console.log('Credit Score Info:', creditScoreInfo);
    
    const getRatingLabel = (rating) => {
      // Convert to number if it's a string
      const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
      
      const ratingLabels = {
        1: '1/5 - Poor',
        2: '2/5 - Fair', 
        3: '3/5 - Good',
        4: '4/5 - Very Good',
        5: '5/5 - Excellent'
      };
      
      // Handle decimal ratings (e.g., 4.75)
      if (numRating >= 1 && numRating <= 5) {
        if (numRating >= 4.5) return '5/5 - Excellent';
        if (numRating >= 3.5) return '4/5 - Very Good';
        if (numRating >= 2.5) return '3/5 - Good';
        if (numRating >= 1.5) return '2/5 - Fair';
        return '1/5 - Poor';
      }
      
      return ratingLabels[numRating] || `Rating: ${rating}`;
    };

    const formatMonthlyActivity = (monthlyActivity) => {
      if (!monthlyActivity || !Array.isArray(monthlyActivity)) return 'Not provided';
      
      return monthlyActivity.map(month => 
        `${month.monthName}: ${month.trips} trips, $${month.earnings} earnings, ${month.activeDays} active days`
      ).join('; ');
    };
    
    const result = {};
    
    // Driver Information
    if (creditScoreInfo.phoneNumber) {
      result['Phone Number'] = creditScoreInfo.phoneNumber;
    }
    
    if (creditScoreInfo.consent !== undefined) {
      result['Consent Given'] = creditScoreInfo.consent ? 'Yes' : 'No';
    }
    
    // Driver Rating (replacing old rating field)
    console.log('Driver Rating value:', creditScoreInfo.driverRating, 'Type:', typeof creditScoreInfo.driverRating);
    if (creditScoreInfo.driverRating !== undefined && creditScoreInfo.driverRating !== null && creditScoreInfo.driverRating !== '') {
      result['Driver Rating'] = getRatingLabel(creditScoreInfo.driverRating);
    } else {
      result['Driver Rating'] = 'Not provided';
    }
    
    // Total Statistics
    if (creditScoreInfo.totalTrips !== undefined && creditScoreInfo.totalTrips !== null) {
      result['Total Trips'] = creditScoreInfo.totalTrips;
    }
    
    if (creditScoreInfo.totalEarnings !== undefined && creditScoreInfo.totalEarnings !== null) {
      result['Total Earnings'] = `$${creditScoreInfo.totalEarnings}`;
    }
    
    // Monthly Activity
    if (creditScoreInfo.monthlyActivity) {
      result['Monthly Activity'] = formatMonthlyActivity(creditScoreInfo.monthlyActivity);
    }
    
    return result;
  };

  const formatEmploymentInfo = (employmentInfo) => {
    if (!employmentInfo) return null;
    
    // Handle array of employment records
    if (Array.isArray(employmentInfo)) {
      return employmentInfo.map((employment, index) => ({
        id: employment._id || index,
        employmentType: employment.employmentType?.replace('_', ' ')
          .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        platforms: employment.platforms || 'Not specified',
        averageMonthlyIncome: employment.averageMonthlyIncome ? 
          `${employment.averageMonthlyIncome.toLocaleString()} BDT` : 'Not specified',
        employerId: employment.employerId || 'Not provided'
      }));
    }
    
    // Handle single employment record (backward compatibility)
    return [{
      id: employmentInfo._id || 0,
      employmentType: employmentInfo.employmentType?.replace('_', ' ')
        .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      platforms: employmentInfo.platforms || 'Not specified',
      averageMonthlyIncome: employmentInfo.averageMonthlyIncome ? 
        `${employmentInfo.averageMonthlyIncome.toLocaleString()} BDT` : 'Not specified',
      employerId: employmentInfo.employerId || 'Not provided'
    }];
  };



  // Render references section with table format
  // const renderReferencesSection = (references, allowEdit = true) => {
  //   if (!references || references.length === 0) return null;

  //   return (
  //     <div className="bg-white border border-gray-200 rounded-lg p-6">
  //       <div className="flex items-center justify-between mb-4">
  //         <h3 className="text-lg font-medium text-gray-900">References</h3>
  //         {allowEdit && (
  //           <Button
  //             type="button"
  //             variant="outline"
  //             size="sm"
  //             onClick={() => handleEditSection(3)}
  //           >
  //             Edit
  //           </Button>
  //         )}
  //       </div>
        
  //       <div className="overflow-x-auto">
  //         <table className="min-w-full divide-y divide-gray-200">
  //           <thead className="bg-gray-50">
  //             <tr>
  //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 NAME
  //               </th>
  //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 PHONE
  //               </th>
  //               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 RELATION
  //               </th>
  //             </tr>
  //           </thead>
  //           <tbody className="bg-white divide-y divide-gray-200">
  //             {references.map((ref, index) => (
  //               <tr key={index}>
  //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  //                   {ref.name}
  //                 </td>
  //                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  //                   {ref.relation}
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>
  //   );
  // };



  const formatDocuments = (documents) => {
    if (!documents || !Array.isArray(documents)) return {};
    
    const formatted = {};
    documents.forEach(doc => {
      const docLabel = DOCUMENT_LABELS[doc.type] || doc.type;
      if (doc.files && doc.files.length > 0) {
        formatted[docLabel] = { status: 'Uploaded', hasFiles: true, type: doc.type };
      } else if (doc.status === 'pending_scan') {
        formatted[docLabel] = { status: 'Pending Verification', hasFiles: false, type: doc.type };
      } else if (doc.status === 'verified') {
        formatted[docLabel] = { status: 'Verified', hasFiles: true, type: doc.type };
      } else {
        // Special handling for selfie liveness
        if (doc.type === 'selfie_liveness') {
          formatted[docLabel] = { status: 'Not provided (optional)', hasFiles: false, type: doc.type, isOptional: true };
        } else {
          formatted[docLabel] = { status: 'Not Uploaded', hasFiles: false, type: doc.type };
        }
      }
    });
    
    return formatted;
  };

  // Render information section
  const renderInfoSection = (title, data, stepNumber, allowEdit = true) => {
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          {allowEdit && !isAlreadySubmitted && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleEditSection(stepNumber)}
            >
              Edit
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(data).map(([key, value]) => {
            // Special handling for verification status
            if (key === 'Phone Verified' || key === 'Email Verified') {
              return (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-500">{key.replace(' Verified', '')}</dt>
                  <dd className="text-sm text-gray-900 mt-1">
                    {value}
                    {value === 'Verified' && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </dd>
                </div>
              );
            }
            
            // Special handling for documents
            if (title === 'Documents' && typeof value === 'object' && value.status) {
              return (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-500">{key}</dt>
                  <dd className="text-sm text-gray-900 mt-1 flex items-center">
                    {value.hasFiles && (
                      <svg className="h-5 w-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.3a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {value.status}
                    {value.hasFiles && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {value.status === 'Uploaded' ? 'Uploaded' : 'Verified'}
                      </span>
                    )}
                    {value.isOptional && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Optional
                      </span>
                    )}
                  </dd>
                </div>
              );
            }
            
            return (
              <div key={key}>
                <dt className="text-sm font-medium text-gray-500">{key}</dt>
                <dd className="text-sm text-gray-900 mt-1">
                  {value || 'Not provided'}
                </dd>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render employment section with multiple employment records
  const renderEmploymentSection = (employmentInfo, stepNumber, allowEdit = true) => {
    if (!employmentInfo || employmentInfo.length === 0) {
      return null;
    }

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
          {allowEdit && !isAlreadySubmitted && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleEditSection(stepNumber)}
            >
              Edit
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {employmentInfo.map((employment, index) => (
            <div key={employment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-900">
                  Employment #{index + 1}
                </h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {employment.employmentType}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Platforms</dt>
                  <dd className="text-sm text-gray-900 mt-1">{employment.platforms}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Average Monthly Income</dt>
                  <dd className="text-sm text-gray-900 mt-1 font-medium" style={{ color: 'var(--color-green-600)' }}>
                    {employment.averageMonthlyIncome}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Employer ID</dt>
                  <dd className="text-sm text-gray-900 mt-1 font-mono">{employment.employerId}</dd>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };



  if (!currentApplication) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading application data...</p>
      </div>
    );
  }

  // Extract data for display (after all functions are defined)
  const basicInfo = formatBasicsInfo(currentApplication?.basics);
  const contactInfo = formatContactInfo(currentApplication?.contact);
  const creditScoreInfo = formatCreditScoreInfo(currentApplication?.creditScore);
  const employmentInfo = formatEmploymentInfo(currentApplication?.employment);
  const documents = formatDocuments(currentApplication?.documents);



  return (
    <div className="flex-1">
      {/* Step Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isAlreadySubmitted ? 'Application Summary' : 
               isDocumentsReview ? 'Review Documents and Submit' : 'Review and Submit'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {isAlreadySubmitted 
                ? 'Your application has been submitted and is being reviewed.'
                : isDocumentsReview
                ? 'Please review your uploaded documents before submitting for review.'
                : 'Please review all information carefully before submitting your application.'
              }
            </p>
          </div>
          
        </div>
      </div>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Application Status */}
        {isAlreadySubmitted && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Application Status: {currentApplication.status?.replace('_', ' ').toUpperCase()}
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Application ID: {currentApplication.id} • 
                    Submitted: {currentApplication.submittedAt ? 
                      new Date(currentApplication.submittedAt).toLocaleString() : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {stepError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {stepError.title || 'Submission Error'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{stepError.message}</p>
                  {stepError.details && (
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

        {/* Review Sections */}
        {!isDocumentsReview && (
          <>
            {renderInfoSection('Basic Information', basicInfo, 1, !isAlreadySubmitted)}
            {renderInfoSection('Contact Information', contactInfo, 2, !isAlreadySubmitted)}
            {renderInfoSection('Credit Score Assessment', creditScoreInfo, 3, !isAlreadySubmitted)}
            {renderEmploymentSection(employmentInfo, 4, !isAlreadySubmitted)}
          </>
        )}
        {isDocumentsReview && renderInfoSection('Documents', documents, 1, !isAlreadySubmitted)}
      </div>

      {/* Final Confirmation */}
      {!isAlreadySubmitted && (
        <div className="border-t pt-6">
          <div className="flex items-start">
            <input
              id="finalConsent"
              type="checkbox"
              checked={finalConsent}
              onChange={(e) => setFinalConsent(e.target.checked)}
              className="h-4 w-4 accent-green-500 focus:ring-green-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="finalConsent" className="ml-3 text-sm text-gray-700">
              {isDocumentsReview 
                ? 'I confirm that all uploaded documents are accurate and authentic.'
                : 'I confirm that all the information provided is accurate and complete.'
              }
              <br />
              <span className="text-gray-500">
                I understand that providing false information may result in the rejection of my application 
                and potential legal consequences.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <div>
          {!isAlreadySubmitted && (
            <Button type="button" variant="outline" onClick={onPrevious}>
              Back
            </Button>
          )}
        </div>
        
        <div className="flex space-x-3">
          {!isAlreadySubmitted && (
            <>
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!finalConsent || isSubmitting}
                className="min-w-[120px] bg-green-500 hover:bg-green-600"
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 
                 isDocumentsReview ? 'Submit Documents' : 'Submit Application'}
              </Button>
            </>
          )}
          
          {isAlreadySubmitted && (
            <Button onClick={() => router.push('/campaigns')}>
              Browse More Campaigns
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
