import { useState, useEffect } from "react";
import { Header, Footer, Preloader } from "@/components/index";
import Scripts from "@/components/layout/Scripts";
import Link from "next/link";
import Head from "next/head";

export default function CookiePolicy() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize theme when component mounts
  useEffect(() => {
    const handleAllLibrariesReady = () => {
      console.log('All libraries ready event received in cookie-policy.js');
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
        console.log('Libraries already available in cookie-policy.js');
        handleAllLibrariesReady();
      }
      
      return () => {
        window.removeEventListener('allLibrariesReady', handleAllLibrariesReady);
      };
    }
  }, []);

  useEffect(() => {
    // Hide preloader after component mounts and images load
    const hidePreloader = () => {
      setIsLoading(false);
    };

    // Option 1: Hide after a fixed delay
    const timer = setTimeout(hidePreloader, 1500);

    // Option 2: Hide when all images are loaded (more sophisticated)
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    
    const imageLoadHandler = () => {
      loadedImages++;
      if (loadedImages === images.length) {
        clearTimeout(timer);
        hidePreloader();
      }
    };

    // Add load event listeners to all images
    images.forEach(img => {
      if (img.complete) {
        loadedImages++;
      } else {
        img.addEventListener('load', imageLoadHandler);
        img.addEventListener('error', imageLoadHandler); // Handle error cases too
      }
    });

    // If all images are already loaded, hide immediately
    if (loadedImages === images.length) {
      clearTimeout(timer);
      hidePreloader();
    }

    return () => {
      clearTimeout(timer);
      // Clean up event listeners
      images.forEach(img => {
        img.removeEventListener('load', imageLoadHandler);
        img.removeEventListener('error', imageLoadHandler);
      });
    };
  }, []);

  return (
    <>
      <Head>
        <title>Cookie Policy - Gigly</title>
        <meta name="description" content="Learn about how Gigly uses cookies and similar technologies to enhance your browsing experience." />
        <meta name="keywords" content="cookie policy, gigly cookies, data protection, tracking technologies, privacy rights, GDPR" />
      </Head>
      
      <div>
        <Preloader isLoading={isLoading} />
        <Header />

        {/* Page Header Start */}
        <div className="page-header">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-12">
                {/* Page Header Box Start */}
                <div className="page-header-box">
                  <h1 className="text-anime-style-2" data-cursor="-opaque">Cookie Policy</h1>
                  <nav className="wow fadeInUp">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item"><Link href="/">home</Link></li>
                      <li className="breadcrumb-item active" aria-current="page">cookie policy</li>
                    </ol>
                  </nav>
                </div>
                {/* Page Header Box End */}
              </div>
            </div>
          </div>
        </div>
        {/* Page Header End */}

        {/* Cookie Policy Content Section Start */}
        <div className="terms-content-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="terms-content-wrapper">
                  {/* Cookie Policy Content */}
                  <div id="cookie-content" className="terms-content">
                    <h1 className="wow fadeInUp">Cookie Policy</h1>
                    <p className="wow fadeInUp" data-wow-delay="0.1s">Last updated September 03, 2025</p>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">
                      This Cookie Policy explains how Gigly Inc ("Company," "we," "us," and "our") uses cookies and similar technologies to recognize you when you visit our website at <a href="https://gigly.io" target="_blank" rel="noopener noreferrer">https://gigly.io</a> ("Website"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="0.3s">
                      In some cases, we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="0.4s">What are cookies?</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.5s">
                      Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="0.6s">
                      Cookies set by the website owner (in this case, Gigly Inc) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="0.7s">Why do we use cookies?</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.8s">
                      We use first- and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics, and other purposes.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="0.9s">How can I control cookies?</h2>
                    <p className="wow fadeInUp" data-wow-delay="1.0s">
                      You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. This tool allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.1s">
                      The Cookie Consent Manager can be found in the notification banner and on our Website. If you choose to reject cookies, you may still use our Website, though your access to some functionality and areas of our Website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="1.2s">How can I control cookies on my browser?</h2>
                    <p className="wow fadeInUp" data-wow-delay="1.3s">
                      As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information. Here are links for popular browsers:
                    </p>
                    <ul className="wow fadeInUp browser-links" data-wow-delay="1.4s">
                      <li><a href="https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies" target="_blank" rel="noopener noreferrer" className="browser-link">Chrome</a></li>
                      <li><a href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="browser-link">Internet Explorer</a></li>
                      <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US" target="_blank" rel="noopener noreferrer" className="browser-link">Firefox</a></li>
                      <li><a href="https://support.apple.com/en-ie/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="browser-link">Safari</a></li>
                      <li><a href="https://support.microsoft.com/en-us/microsoft-edge/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd" target="_blank" rel="noopener noreferrer" className="browser-link">Edge</a></li>
                      <li><a href="https://help.opera.com/en/latest/web-preferences/" target="_blank" rel="noopener noreferrer" className="browser-link">Opera</a></li>
                    </ul>
                    <p className="wow fadeInUp" data-wow-delay="1.5s">
                      In addition, most advertising networks offer a way to opt out of targeted advertising. For more information:
                    </p>
                    <ul className="wow fadeInUp advertising-links" data-wow-delay="1.6s">
                      <li><a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="advertising-link">Digital Advertising Alliance</a></li>
                      <li><a href="https://youradchoices.ca/" target="_blank" rel="noopener noreferrer" className="advertising-link">Digital Advertising Alliance of Canada</a></li>
                      <li><a href="https://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="advertising-link">European Interactive Digital Advertising Alliance</a></li>
                    </ul>

                    <h2 className="wow fadeInUp" data-wow-delay="1.7s">What about other tracking technologies, like web beacons?</h2>
                    <p className="wow fadeInUp" data-wow-delay="1.8s">
                      Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called "tracking pixels" or "clear gifs"). These are tiny graphics files that contain a unique identifier that enables us to recognize when someone has visited our Website or opened an email including them.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.9s">This allows us, for example, to:</p>
                    <ul className="wow fadeInUp" data-wow-delay="2.0s">
                      <li>Monitor traffic patterns of users from one page within a website to another</li>
                      <li>Deliver or communicate with cookies</li>
                      <li>Understand whether you came to the website from an online advertisement displayed on a third-party website</li>
                      <li>Improve site performance</li>
                      <li>Measure the success of email marketing campaigns</li>
                    </ul>
                    <p className="wow fadeInUp" data-wow-delay="2.1s">
                      In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.2s">Do you use Flash cookies or Local Shared Objects?</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.3s">
                      Websites may also use "Flash Cookies" (also known as Local Shared Objects or "LSOs") to, among other things, collect and store information about your use of our services, fraud prevention, and other site operations.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="2.4s">
                      If you do not want Flash Cookies stored on your computer, you can adjust the settings of your Flash player using:
                    </p>
                    <ul className="wow fadeInUp flash-links" data-wow-delay="2.5s">
                      <li><a href="https://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html" target="_blank" rel="noopener noreferrer" className="flash-link">Website Storage Settings Panel</a></li>
                      <li><a href="https://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html" target="_blank" rel="noopener noreferrer" className="flash-link">Global Storage Settings Panel</a></li>
                    </ul>
                    <p className="wow fadeInUp" data-wow-delay="2.6s">
                      <strong>Please note:</strong> limiting acceptance of Flash Cookies may reduce or impede the functionality of some Flash applications, including potentially Flash applications used in connection with our services or online content.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.7s">Do you serve targeted advertising?</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.8s">
                      Third parties may serve cookies on your computer or mobile device to serve advertising through our Website. These companies may use information about your visits to this and other websites in order to provide relevant advertisements about goods and services that may interest you.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="2.9s">
                      They may also employ technology to measure the effectiveness of advertisements. They can accomplish this by using cookies or web beacons to collect information about your visits. The information collected does not enable us to identify you directly (name, contact details, etc.) unless you choose to provide this.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.0s">How often will you update this Cookie Policy?</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.1s">
                      We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="3.2s">
                      The date at the top of this Cookie Policy indicates when it was last updated.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.3s">Where can I get further information?</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.4s">
                      If you have any questions about our use of cookies or other technologies, please contact us:
                    </p>
                    <div className="wow fadeInUp" data-wow-delay="3.5s">
                      <p><strong>Gigly Inc</strong></p>
                      <p>1025 Canadian Shield Avenue</p>
                      <p>Ottawa, Ontario K2K 0H3</p>
                      <p>Canada</p>
                      <p>Phone: <a href="tel:+13435760111">(+1) 343-576-0111</a></p>
                      <p>Email: <a href="mailto:saif@gigly.io">saif@gigly.io</a></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Cookie Policy Content Section End */}

        <Footer />
        <Scripts />
      </div>
    </>
  );
};
