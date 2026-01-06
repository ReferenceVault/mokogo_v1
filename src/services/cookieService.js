// Cookie Service for managing cookie preferences and consent

export const COOKIE_CATEGORIES = {
  NECESSARY: 'necessary',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  PREFERENCES: 'preferences'
};

export const COOKIE_CONSENT_KEY = 'cookieConsent';

// Get current cookie consent preferences
export const getCookieConsent = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    return consent ? JSON.parse(consent) : null;
  } catch (error) {
    console.error('Error reading cookie consent:', error);
    return null;
  }
};

// Set cookie consent preferences
export const setCookieConsent = (preferences) => {
  if (typeof window === 'undefined') return false;
  
  try {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    return true;
  } catch (error) {
    console.error('Error saving cookie consent:', error);
    return false;
  }
};

// Check if user has given consent for a specific category
export const hasConsent = (category) => {
  const consent = getCookieConsent();
  if (!consent) return false;
  
  return consent[category] === true;
};

// Check if user has made any consent choice
export const hasConsentChoice = () => {
  return getCookieConsent() !== null;
};

// Initialize tracking scripts based on consent
export const initializeTracking = () => {
  const consent = getCookieConsent();
  if (!consent) return;

  // Initialize Analytics
  if (consent.analytics) {
    initializeAnalytics();
  }

  // Initialize Marketing
  if (consent.marketing) {
    initializeMarketing();
  }

  // Initialize Preferences
  if (consent.preferences) {
    initializePreferences();
  }
};

// Analytics tracking initialization
const initializeAnalytics = () => {
  console.log('Initializing analytics tracking...');
  
  // Google Analytics
  if (typeof window !== 'undefined' && !window.gtag) {
    // Add your Google Analytics code here
    // Example:
    // window.dataLayer = window.dataLayer || [];
    // function gtag(){dataLayer.push(arguments);}
    // gtag('js', new Date());
    // gtag('config', 'GA_MEASUREMENT_ID');
  }

  // Other analytics tools can be added here
  // Mixpanel, Amplitude, etc.
};

// Marketing tracking initialization
const initializeMarketing = () => {
  console.log('Initializing marketing tracking...');
  
  // Facebook Pixel
  if (typeof window !== 'undefined' && !window.fbq) {
    // Add your Facebook Pixel code here
    // Example:
    // !function(f,b,e,v,n,t,s)
    // {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    // n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    // if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    // n.queue=[];t=b.createElement(e);t.async=!0;
    // t.src=v;s=b.getElementsByTagName(e)[0];
    // s.parentNode.insertBefore(t,s)}(window, document,'script',
    // 'https://connect.facebook.net/en_US/fbevents.js');
    // fbq('init', 'YOUR_PIXEL_ID');
    // fbq('track', 'PageView');
  }

  // Google Ads
  // Add other marketing tools here
};

// Preferences tracking initialization
const initializePreferences = () => {
  console.log('Initializing preference tracking...');
  
  // Store user preferences
  // Theme, language, location, etc.
};

// Clear all non-necessary cookies
export const clearNonEssentialCookies = () => {
  if (typeof window === 'undefined') return;
  
  // Clear analytics cookies
  document.cookie.split(";").forEach((c) => {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
    if (name.includes('_ga') || name.includes('_gid') || name.includes('_fbp')) {
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
  });
};

// Reset consent (for testing or user request)
export const resetConsent = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  clearNonEssentialCookies();
};

// Get consent summary for display
export const getConsentSummary = () => {
  const consent = getCookieConsent();
  if (!consent) return null;
  
  return {
    hasConsent: true,
    necessary: consent.necessary,
    analytics: consent.analytics,
    marketing: consent.marketing,
    preferences: consent.preferences,
    timestamp: consent.timestamp
  };
};

export default {
  getCookieConsent,
  setCookieConsent,
  hasConsent,
  hasConsentChoice,
  initializeTracking,
  clearNonEssentialCookies,
  resetConsent,
  getConsentSummary,
  COOKIE_CATEGORIES
};
