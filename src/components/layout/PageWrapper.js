import { useEffect } from 'react';
import Head from 'next/head';
import useCookieSettings from '../../hooks/useCookieSettings';

const PageWrapper = ({ 
  children, 
  title, 
  description, 
  keywords,
  isLoading = false 
}) => {
  // Initialize cookie settings functionality
  useCookieSettings();
  
  // Initialize theme when component mounts (same as original pages)
  useEffect(() => {
    const handleAllLibrariesReady = () => {
      console.log('All libraries ready event received in PageWrapper');
      // Libraries are already initialized by the global initializer
      // No need to manually initialize anything here
      
      // Initialize cursor if it's not already initialized
      if (typeof window !== 'undefined' && window.$ && window.gsap) {
        setTimeout(() => {
          if (!window.cursor && window.Cursor) {
            console.log('Initializing cursor...');
            window.cursor = new window.Cursor();
          }
        }, 100);
      }
    };
    
    // Listen for the global libraries ready event
    if (typeof window !== 'undefined') {
      window.addEventListener('allLibrariesReady', handleAllLibrariesReady);
      
      // If libraries are already ready, trigger immediately
      if (window.$ && window.gsap && window.WOW) {
        console.log('Libraries already available in PageWrapper');
        handleAllLibrariesReady();
      }
      
      return () => {
        window.removeEventListener('allLibrariesReady', handleAllLibrariesReady);
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Head>
      {children}
    </>
  );
};

export default PageWrapper;
