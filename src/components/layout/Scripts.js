import Script from "next/script";

export default function Scripts() {
  return (
    <>
      {/* jQuery-dependent scripts - Load after jQuery (which is now in _document.js) */}
      <Script 
        src="/js/bootstrap.min.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('Bootstrap loaded')}
      />
      
      <Script 
        src="/js/validator.min.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('Validator loaded')}
      />
      
      <Script 
        src="/js/jquery.slicknav.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('SlickNav loaded')}
      />
      
      <Script 
        src="/js/swiper-bundle.min.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('Swiper loaded')}
      />
      
      <Script 
        src="/js/jquery.waypoints.min.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('Waypoints loaded')}
      />
      
      <Script 
        src="/js/jquery.counterup.min.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('CounterUp loaded')}
      />
      
      <Script 
        src="/js/jquery.magnific-popup.min.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('Magnific Popup loaded')}
      />
      
      <Script 
        src="/js/jquery.mb.YTPlayer.min.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('YTPlayer loaded')}
      />
      
      {/* Non-jQuery scripts */}
      <Script 
        src="/js/SmoothScroll.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('SmoothScroll loaded')}
      />
      
      <Script 
        src="/js/parallaxie.js" 
        strategy="afterInteractive"
        onLoad={() => console.log('Parallaxie loaded')}
      />
      
      <Script 
        src="/js/magiccursor.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('MagicCursor loaded');
          // Initialize cursor after all dependencies are loaded
          if (typeof window !== 'undefined' && window.$ && window.gsap) {
            console.log('Initializing cursor...');
            // The cursor is auto-initialized in the script
          }
        }}
      />
      
      {/* Main Custom js file - load last */}
      <Script 
        src="/js/function.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Function.js loaded successfully');
        }}
      />
    </>
  );
}
