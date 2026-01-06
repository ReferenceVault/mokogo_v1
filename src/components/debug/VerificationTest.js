import { useState } from 'react';
import verificationService from '../../services/verification';
import Button from '../common/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const VerificationTest = () => {
  const [testData, setTestData] = useState({
    userId: '',
    phone: '',
    email: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({});

  const handleInputChange = (field, value) => {
    setTestData(prev => ({ ...prev, [field]: value }));
  };

  const testPhoneOTP = async () => {
    if (!testData.userId || !testData.phone) {
      toast.error('Please enter User ID and Phone number');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verificationService.sendPhoneOTP(testData.userId, testData.phone);
      setResults(prev => ({ ...prev, sendOTP: result }));
      toast.success('Phone OTP test completed');
    } catch (error) {
      setResults(prev => ({ ...prev, sendOTP: { error: error.message } }));
      toast.error('Phone OTP test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testVerifyOTP = async () => {
    if (!testData.userId || !testData.phone || !testData.otp) {
      toast.error('Please enter User ID, Phone number, and OTP');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verificationService.verifyPhoneOTP(testData.userId, testData.phone, testData.otp);
      setResults(prev => ({ ...prev, verifyOTP: result }));
      toast.success('OTP verification test completed');
    } catch (error) {
      setResults(prev => ({ ...prev, verifyOTP: { error: error.message } }));
      toast.error('OTP verification test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailVerification = async () => {
    if (!testData.userId || !testData.email) {
      toast.error('Please enter User ID and Email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verificationService.sendEmailVerification(testData.userId, testData.email);
      setResults(prev => ({ ...prev, sendEmail: result }));
      toast.success('Email verification test completed');
    } catch (error) {
      setResults(prev => ({ ...prev, sendEmail: { error: error.message } }));
      toast.error('Email verification test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const testHealth = async () => {
    setIsLoading(true);
    try {
      const result = await verificationService.checkHealth();
      setResults(prev => ({ ...prev, health: result }));
      toast.success('Health check completed');
    } catch (error) {
      setResults(prev => ({ ...prev, health: { error: error.message } }));
      toast.error('Health check failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Verification Service Test</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={testData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter user ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={testData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <input
              type="text"
              value={testData.otp}
              onChange={(e) => handleInputChange('otp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456"
              maxLength="6"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Test Actions</h3>
          
          <Button
            onClick={testPhoneOTP}
            disabled={isLoading || !testData.userId || !testData.phone}
            className="w-full"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Test Send Phone OTP'}
          </Button>

          <Button
            onClick={testVerifyOTP}
            disabled={isLoading || !testData.userId || !testData.phone || !testData.otp}
            className="w-full"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Test Verify OTP'}
          </Button>

          <Button
            onClick={testEmailVerification}
            disabled={isLoading || !testData.userId || !testData.email}
            className="w-full"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Test Send Email Verification'}
          </Button>

          <Button
            onClick={testHealth}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Test Health Check'}
          </Button>
        </div>
      </div>

      {/* Results Display */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(results).map(([testName, result]) => (
            <div key={testName} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 capitalize">
                {testName.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              
              {result.error ? (
                <div className="text-red-600 text-sm">
                  <strong>Error:</strong> {result.error}
                </div>
              ) : (
                <div className="text-sm text-gray-700">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {Object.keys(results).length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No test results yet. Run a test to see results here.
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter a valid User ID to test the verification services</li>
          <li>• Phone number should be in international format (e.g., +1234567890)</li>
          <li>• Email should be a valid email address</li>
          <li>• OTP code should be 6 digits (for verification testing)</li>
          <li>• Make sure your backend server is running and environment variables are set</li>
        </ul>
      </div>
    </div>
  );
};

export default VerificationTest;
