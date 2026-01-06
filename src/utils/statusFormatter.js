/**
 * Centralized utility for formatting application and document statuses
 * Provides consistent formatting across the entire application
 */

// Application Status Mapping
export const APPLICATION_STATUS_MAP = {
  'draft': { text: 'Draft', color: 'bg-gray-100 text-gray-800' },
  'in_progress': { text: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  'pending_review': { text: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  'under_review': { text: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  'approved': { text: 'Approved', color: 'bg-green-100 text-green-800' },
  'rejected': { text: 'Rejected', color: 'bg-red-100 text-red-800' },
  'submit_for_documents_review': { text: 'Submit for Document Review', color: 'bg-purple-100 text-purple-800' },
  'withdrawn': { text: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
};

// Document Status Mapping
export const DOCUMENT_STATUS_MAP = {
  'not_uploaded': { text: 'Not Uploaded', color: 'bg-gray-100 text-gray-800' },
  'pending_scan': { text: 'Pending Scan', color: 'bg-yellow-100 text-yellow-800' },
  'scanning': { text: 'Scanning', color: 'bg-blue-100 text-blue-800' },
  'verified': { text: 'Verified', color: 'bg-green-100 text-green-800' },
  'rejected': { text: 'Rejected', color: 'bg-red-100 text-red-800' }
};

/**
 * Format application status for display
 * @param {string} status - Raw status from backend
 * @returns {object} Object with text and color properties
 */
export const formatApplicationStatus = (status) => {
  if (!status) return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  
  return APPLICATION_STATUS_MAP[status] || { 
    text: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
    color: 'bg-gray-100 text-gray-800' 
  };
};

/**
 * Format document status for display
 * @param {string} status - Raw status from backend
 * @returns {object} Object with text and color properties
 */
export const formatDocumentStatus = (status) => {
  if (!status) return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  
  return DOCUMENT_STATUS_MAP[status] || { 
    text: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
    color: 'bg-gray-100 text-gray-800' 
  };
};

/**
 * Get application status badge component props
 * @param {string} status - Raw status from backend
 * @returns {string} CSS classes for status badge
 */
export const getApplicationStatusBadge = (status) => {
  const statusInfo = formatApplicationStatus(status);
  const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
  return `${baseClasses} ${statusInfo.color}`;
};

/**
 * Get document status badge component props
 * @param {string} status - Raw status from backend
 * @returns {string} CSS classes for status badge
 */
export const getDocumentStatusBadge = (status) => {
  const statusInfo = formatDocumentStatus(status);
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  return `${baseClasses} ${statusInfo.color}`;
};

/**
 * Get status display text only
 * @param {string} status - Raw status from backend
 * @returns {string} Formatted status text
 */
export const getStatusText = (status) => {
  return formatApplicationStatus(status).text;
};

/**
 * Get document status display text only
 * @param {string} status - Raw status from backend
 * @returns {string} Formatted status text
 */
export const getDocumentStatusText = (status) => {
  return formatDocumentStatus(status).text;
};

// Legacy function names for backward compatibility
export const getStatusDisplay = formatApplicationStatus;
export const getStatusBadge = getApplicationStatusBadge;
