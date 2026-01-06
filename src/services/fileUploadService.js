// File Upload Service - Handles file uploads for campaigns and other entities
class FileUploadService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  }

  // Generic file upload method
  async uploadFile(file, endpoint = '/api/admin/upload') {
    try {
      // Get auth token from localStorage using correct storage key
      const token = localStorage.getItem('gigly_access_token');
      
      const formData = new FormData();
      formData.append('file', file);

      const headers = {};
      
      // Add authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `File upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data || result,
        message: result.message || 'File uploaded successfully'
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file'
      };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, endpoint = '/api/admin/upload') {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, endpoint));
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);
      
      return {
        success: failedUploads.length === 0,
        successfulUploads,
        failedUploads,
        totalFiles: files.length,
        successCount: successfulUploads.length,
        failureCount: failedUploads.length
      };
    } catch (error) {
      console.error('Multiple file upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload files'
      };
    }
  }

  // Validate file before upload
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      required = false
    } = options;

    const errors = [];

    if (required && !file) {
      errors.push('File is required');
      return { valid: false, errors };
    }

    if (file) {
      // Check file size
      if (file.size > maxSize) {
        errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
      }

      // Check file name
      if (file.name.length > 255) {
        errors.push('File name must be less than 255 characters');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Generate preview URL for images
  generatePreviewURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file extension
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Check if file is an image
  isImageFile(file) {
    return file && file.type.startsWith('image/');
  }
}

// Create singleton instance
const fileUploadService = new FileUploadService();

export default fileUploadService;
