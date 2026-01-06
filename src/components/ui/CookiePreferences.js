import { useState, useEffect } from 'react';

const CookiePreferences = ({ onClose, onSave = () => {} }) => {
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    preferences: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load existing preferences
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
      const consent = JSON.parse(savedConsent);
      setPreferences(prev => ({
        ...prev,
        ...consent
      }));
    }
  }, []);

  const handleToggle = (category) => {
    if (category === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSave = async () => {
    if (isSaving) return; // Prevent multiple clicks
    
    console.log('Save button clicked!');
    console.log('Current preferences:', preferences);
    console.log('onSave function:', onSave);
    
    setIsSaving(true);
    
    try {
      const consentData = {
        ...preferences,
        timestamp: new Date().toISOString()
      };
      
      console.log('Saving consent data:', consentData);
      localStorage.setItem('cookieConsent', JSON.stringify(consentData));
      console.log('Data saved to localStorage');
      
      // Initialize selected cookies
      if (preferences.analytics) {
        console.log('Initializing analytics...');
        initializeAnalytics();
      }
      if (preferences.marketing) {
        console.log('Initializing marketing...');
        initializeMarketing();
      }
      if (preferences.preferences) {
        console.log('Initializing preferences...');
        initializePreferences();
      }
      
      // Call onSave if it's a function
      if (typeof onSave === 'function') {
        console.log('Calling onSave function...');
        onSave();
        console.log('onSave function called successfully');
      } else {
        console.log('onSave is not a function, closing modal directly');
        onClose();
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const initializeAnalytics = () => {
    console.log('Initializing analytics cookies...');
    // Import and use the analytics utility
    import('../../utils/analytics').then(({ initializeGA4 }) => {
      initializeGA4();
    });
  };

  const initializeMarketing = () => {
    console.log('Initializing marketing cookies...');
    // Add Facebook Pixel, Google Ads, etc.
  };

  const initializePreferences = () => {
    console.log('Initializing preference cookies...');
    // Add user preference tracking
  };

  const cookieCategories = [
    {
      id: 'necessary',
      title: 'Necessary Cookies',
      description: 'These cookies are essential for the website to function properly and cannot be disabled. They include authentication, security, and basic functionality features.',
      required: true,
      examples: ['Session management', 'Security tokens', 'Form validation', 'User authentication']
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve our website performance and user experience.',
      required: false,
      examples: ['Google Analytics', 'Page views tracking', 'User behavior analysis', 'Performance monitoring']
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      description: 'These cookies are used to track visitors across websites to display relevant and engaging advertisements. They help us measure the effectiveness of our marketing campaigns.',
      required: false,
      examples: ['Facebook Pixel', 'Google Ads', 'Retargeting campaigns', 'Conversion tracking']
    },
    {
      id: 'preferences',
      title: 'Preference Cookies',
      description: 'These cookies remember your choices and preferences to provide a more personalized experience. They store your settings and preferences for future visits.',
      required: false,
      examples: ['Language settings', 'Theme preferences', 'Location settings', 'User preferences']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Cookie Preferences
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="text-sm text-gray-600">
              <p className="mb-4">
                We use cookies to enhance your experience on our website. You can customize your preferences below.
              </p>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4">
              {cookieCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {category.title}
                        </h3>
                        {category.required && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {category.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Examples:</strong> {category.examples.join(', ')}
                      </div>
                    </div>
                    
                    {/* Toggle */}
                    <div className="ml-4">
                      <button
                        onClick={() => handleToggle(category.id)}
                        disabled={category.required}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          preferences[category.id]
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        } ${category.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences[category.id] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                More Information
              </h4>
              <p className="text-xs text-gray-600 mb-2">
                You can change your cookie preferences at any time by clicking the cookie settings link in our footer.
              </p>
              <p className="text-xs text-gray-600">
                For more details, please read our{' '}
                <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </a>
                ,{' '}
                <a href="/cookie-policy" className="text-blue-600 hover:text-blue-800 underline">
                  Cookie Policy
                </a>
                , and{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                  Terms of Service
                </a>.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
                isSaving 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferences;
