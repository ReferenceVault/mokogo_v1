import { useState, useEffect } from 'react';
import CookiePreferences from './CookiePreferences';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    }

    // Listen for cookie settings click from footer
    const handleOpenPreferences = () => {
      setShowPreferences(true);
    };

    window.addEventListener('openCookiePreferences', handleOpenPreferences);
    
    return () => {
      window.removeEventListener('openCookiePreferences', handleOpenPreferences);
    };
  }, []);

  const handleAcceptAll = () => {
    // Set all cookies as accepted
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    
    // Initialize analytics and marketing cookies
    initializeCookies();
  };

  const handleRejectAll = () => {
    // Set only necessary cookies as accepted
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleCustomize = () => {
    console.log('Opening cookie preferences...');
    setShowPreferences(true);
  };

  const handlePreferencesSaved = () => {
    console.log('Preferences saved, closing modal and banner...');
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handlePreferencesClose = () => {
    console.log('Closing cookie preferences...');
    setShowPreferences(false);
  };

  const initializeCookies = () => {
    console.log('Initializing tracking cookies...');
    // Import and use the analytics utility
    import('../../utils/analytics').then(({ initializeGA4 }) => {
      initializeGA4();
    });
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    We use cookies
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <a
                      href="/cookie-policy"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Learn more
                    </a>{' '}
                    or{' '}
                    <button
                      onClick={handleCustomize}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      customize preferences
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <CookiePreferences
          onClose={handlePreferencesClose}
          onSave={handlePreferencesSaved}
        />
      )}
    </>
  );
};

export default CookieBanner;
