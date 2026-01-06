import { useEffect } from 'react';

const useCookieSettings = () => {
  useEffect(() => {
    const handleCookieSettingsClick = (e) => {
      e.preventDefault();
      
      // Trigger cookie preferences modal
      const event = new CustomEvent('openCookiePreferences');
      window.dispatchEvent(event);
    };

    const cookieSettingsLink = document.getElementById('cookieSettings');
    if (cookieSettingsLink) {
      cookieSettingsLink.addEventListener('click', handleCookieSettingsClick);
      
      return () => {
        cookieSettingsLink.removeEventListener('click', handleCookieSettingsClick);
      };
    }
  }, []);
};

export default useCookieSettings;
