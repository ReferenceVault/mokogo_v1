// Analytics utility functions for Google Analytics 4

/**
 * Initialize Google Analytics 4
 * Only loads when user has consented to analytics cookies
 */
export const initializeGA4 = () => {
  // Check if GA4 is already loaded
  if (window.gtag) {
    console.log('Google Analytics 4 already initialized');
    return;
  }

  try {
    // Load Google Analytics 4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-8QNF5DRCFQ';
    document.head.appendChild(script);

    // Initialize GA4
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    
    // Configure GA4 with privacy-friendly settings
    gtag('config', 'G-8QNF5DRCFQ', {
      anonymize_ip: true,
      cookie_flags: 'secure;samesite=strict',
      send_page_view: true
    });

    console.log('Google Analytics 4 initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Google Analytics 4:', error);
  }
};

/**
 * Check if user has consented to analytics cookies
 */
export const hasAnalyticsConsent = () => {
  try {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) return false;
    
    const consentData = JSON.parse(consent);
    return consentData.analytics === true;
  } catch (error) {
    console.error('Error checking analytics consent:', error);
    return false;
  }
};

/**
 * Initialize analytics on page load if consent is given
 */
export const initializeAnalyticsOnLoad = () => {
  if (hasAnalyticsConsent()) {
    initializeGA4();
  }
};

/**
 * Track custom events in GA4
 */
export const trackEvent = (eventName, parameters = {}) => {
  if (window.gtag && hasAnalyticsConsent()) {
    gtag('event', eventName, parameters);
    console.log('GA4 Event tracked:', eventName, parameters);
  }
};

/**
 * Track page views
 */
export const trackPageView = (pagePath, pageTitle) => {
  if (window.gtag && hasAnalyticsConsent()) {
    gtag('config', 'G-8QNF5DRCFQ', {
      page_path: pagePath,
      page_title: pageTitle
    });
    console.log('GA4 Page view tracked:', pagePath, pageTitle);
  }
};

// Predefined event tracking functions for common actions
export const analyticsEvents = {
  // User engagement
  signUp: (method = 'email') => trackEvent('sign_up', { method }),
  login: (method = 'email') => trackEvent('login', { method }),
  logout: () => trackEvent('logout'),
  
  // Business actions
  applyForVehicle: (vehicleType, location) => trackEvent('apply_for_vehicle', { vehicle_type: vehicleType, location }),
  viewCampaign: (campaignId, campaignType) => trackEvent('view_campaign', { campaign_id: campaignId, campaign_type: campaignType }),
  startInvestment: (investmentType, amount) => trackEvent('start_investment', { investment_type: investmentType, amount }),
  
  // Navigation
  viewPage: (pageName, section) => trackEvent('view_page', { page_name: pageName, section }),
  clickButton: (buttonName, location) => trackEvent('click_button', { button_name: buttonName, location }),
  
  // Contact
  contactSupport: (method) => trackEvent('contact_support', { method }),
  downloadDocument: (documentType) => trackEvent('download_document', { document_type: documentType })
};
