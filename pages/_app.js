import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { store } from '../src/store';
import '../src/styles/globals.css';
import '../src/styles/components.css';
import { validateEnv } from '../src/config/env';
import ErrorBoundary from '../src/components/common/ErrorBoundary';

function MyApp({ Component, pageProps }) {
  // Validate environment variables on app start
  if (typeof window === 'undefined') {
    validateEnv();
  }

  // Initialize global libraries when app mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Map jQuery to $ for global access
      if (window.jQuery) {
        window.$ = window.jQuery;
        console.log('✅ jQuery mapped to $ globally');
      }
      
      // Register GSAP plugins
      if (window.gsap && window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger, window.SplitText);
        console.log('✅ GSAP plugins registered');
      }
      
      // Initialize WOW.js
      if (window.WOW && !window.wowInitialized) {
        new window.WOW().init();
        window.wowInitialized = true;
        console.log('✅ WOW.js initialized');
      }
      
      // Initialize analytics if user has previously consented
      import('../src/utils/analytics').then(({ initializeAnalyticsOnLoad }) => {
        initializeAnalyticsOnLoad();
      });
      
      // Dispatch global ready event
      window.dispatchEvent(new CustomEvent('allLibrariesReady'));
      console.log('✅ All libraries initialized and ready');
    }
  }, []);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </Provider>
  );
}

export default MyApp;
