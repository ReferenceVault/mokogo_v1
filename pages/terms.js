import { useState, useEffect } from "react";
import { Header, Footer, Preloader } from "@/components/index";
import Scripts from "@/components/layout/Scripts";
import Link from "next/link";
import Head from "next/head";

export default function Terms() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize theme when component mounts
  useEffect(() => {
    const handleAllLibrariesReady = () => {
      console.log('All libraries ready event received in terms.js');
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
        console.log('Libraries already available in terms.js');
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

  const handleDownloadPDF = () => {
    // Create a new window with the terms content for printing
    const printWindow = window.open('', '_blank');
    const termsContent = document.getElementById('terms-content').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Terms and Conditions - Gigly</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              margin: 40px; 
              color: #333;
            }
            h1 { color: #2c5aa0; font-size: 28px; margin-bottom: 20px; }
            h2 { color: #2c5aa0; font-size: 20px; margin-top: 30px; margin-bottom: 15px; }
            p { margin-bottom: 15px; }
            .terms-container { max-width: 800px; margin: 0 auto; }
            .download-btn { 
              background: #2c5aa0; 
              color: white; 
              padding: 12px 24px; 
              border: none; 
              border-radius: 6px; 
              cursor: pointer; 
              font-size: 16px;
              margin: 20px 0;
            }
            @media print {
              .download-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="terms-container">
            <h1>Welcome to Gigly!</h1>
            <p>These Terms and Conditions ("Terms") govern your access and use of the Gigly mobile application ("App") and related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not access or use the Service.</p>
            
            <h2>1. Definitions</h2>
            <p><strong>"You" or "User"</strong> means the individual or entity accessing or using the Service.</p>
            <p><strong>"Gigly," "we," "us," or "our"</strong> refers to Gigly Inc., the owner and operator of the Service.</p>
            <p><strong>"Content"</strong> means any information, data, text, software, graphics, sounds, photos, videos, or other materials uploaded, posted, or otherwise submitted to the Service by you.</p>
            <p><strong>"Service"</strong> includes the Gigly App and all related services offered by Gigly.</p>
            
            <h2>2. User Accounts</h2>
            <p>You may need to create an account ("Account") to access certain features of the Service. You are responsible for maintaining the confidentiality of your Account information and password and for restricting access to your device. You agree to accept responsibility for all activities or actions that occur under your Account.</p>
            
            <h2>3. User Content</h2>
            <p>You retain all ownership rights to your Content. However, by submitting Content to the Service, you grant Gigly a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, publish, distribute, and translate your Content for the sole purpose of providing and improving the Service.</p>
            <p>You are solely responsible for any Content you submit to the Service. You agree not to submit any Content that is illegal, defamatory, obscene, threatening, harassing, or otherwise violates these Terms.</p>
            
            <h2>4. Data Protection and Sharing</h2>
            <p>Gigly is committed to protecting your privacy. We collect and use your data in accordance with our Privacy Policy, which is available on our website.</p>
            <p>We collect data to provide and improve the Service, personalize your experience, and for other purposes outlined in the Privacy Policy.</p>
            <p>We may share your data with third-party service providers who help us operate the Service. These providers are obligated to protect your data and use it only for the purpose of providing services to Gigly.</p>
            <p>We will not share your data with any third-party for marketing purposes without your consent.</p>
            
            <h2>5. Third-Party Links</h2>
            <p>The Service may contain links to third-party websites or services that are not owned or controlled by Gigly.</p>
            <p>Gigly is not responsible for the content or practices of any third-party website or service.</p>
            
            <h2>6. Disclaimer of Warranties</h2>
            <p><strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</strong></p>
            <p><strong>GIGLY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.</strong></p>
            
            <h2>7. Limitation of Liability</h2>
            <p><strong>GIGLY SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO, DAMAGES FOR LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATING TO THE USE OR INABILITY TO USE THE SERVICE.</strong></p>
            
            <h2>8. Termination</h2>
            <p>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            <p>You may terminate your account at any time by contacting us at saif@gigly.io.</p>
            
            <h2>9. Governing Law</h2>
            <p>These Terms shall be interpreted and governed by the laws of the State of [Insert Your State], without regard to its conflict of law provisions.</p>
            
            <h2>10. Dispute Resolution</h2>
            <p>Any dispute arising out of or relating to these Terms shall be resolved by binding arbitration in accordance with the rules of the American Arbitration Association.</p>
            
            <h2>11. Entire Agreement</h2>
            <p>These Terms constitute the entire agreement between you and Gigly regarding the use of the Service.</p>
            
            <h2>12. Changes to Terms</h2>
            <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.</p>
            
            <h2>13. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at saif@gigly.io.</p>
            
            <button class="download-btn" onclick="window.print()">Download Terms and Conditions</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <>
      <Head>
        <title>Terms and Conditions - Gigly</title>
        <meta name="description" content="Terms and Conditions for Gigly - AI-powered, vehicle financing and investment platform. Read our terms of service and user agreement." />
        <meta name="keywords" content="terms and conditions, gigly terms, user agreement, terms of service, legal, vehicle financing" />
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
                  <h1 className="text-anime-style-2" data-cursor="-opaque">Terms and Conditions</h1>
                  <nav className="wow fadeInUp">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item"><Link href="/">home</Link></li>
                      <li className="breadcrumb-item active" aria-current="page">terms and conditions</li>
                    </ol>
                  </nav>
                </div>
                {/* Page Header Box End */}
              </div>
            </div>
          </div>
        </div>
        {/* Page Header End */}

        {/* Terms Content Section Start */}
        <div className="terms-content-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="terms-content-wrapper">
                  {/* Terms Content */}
                  <div id="terms-content" className="terms-content">
                    <h1 className="wow fadeInUp">Welcome to Gigly!</h1>
                    <p className="wow fadeInUp" data-wow-delay="0.1s">
                      These Terms and Conditions ("Terms") govern your access and use of the Gigly mobile application ("App") and related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, then you may not access or use the Service.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="0.2s">1. Definitions</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.3s">
                      <strong>"You" or "User"</strong> means the individual or entity accessing or using the Service.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="0.4s">
                      <strong>"Gigly," "we," "us," or "our"</strong> refers to Gigly Inc., the owner and operator of the Service.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="0.5s">
                      <strong>"Content"</strong> means any information, data, text, software, graphics, sounds, photos, videos, or other materials uploaded, posted, or otherwise submitted to the Service by you.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="0.6s">
                      <strong>"Service"</strong> includes the Gigly App and all related services offered by Gigly.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="0.7s">2. User Accounts</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.8s">
                      You may need to create an account ("Account") to access certain features of the Service. You are responsible for maintaining the confidentiality of your Account information and password and for restricting access to your device. You agree to accept responsibility for all activities or actions that occur under your Account.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="0.9s">3. User Content</h2>
                    <p className="wow fadeInUp" data-wow-delay="1.0s">
                      You retain all ownership rights to your Content. However, by submitting Content to the Service, you grant Gigly a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, publish, distribute, and translate your Content for the sole purpose of providing and improving the Service.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.1s">
                      You are solely responsible for any Content you submit to the Service. You agree not to submit any Content that is illegal, defamatory, obscene, threatening, harassing, or otherwise violates these Terms.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="1.2s">4. Data Protection and Sharing</h2>
                    <p className="wow fadeInUp" data-wow-delay="1.3s">
                      Gigly is committed to protecting your privacy. We collect and use your data in accordance with our Privacy Policy, which is available on our website.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.4s">
                      We collect data to provide and improve the Service, personalize your experience, and for other purposes outlined in the Privacy Policy.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.5s">
                      We may share your data with third-party service providers who help us operate the Service. These providers are obligated to protect your data and use it only for the purpose of providing services to Gigly.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.6s">
                      We will not share your data with any third-party for marketing purposes without your consent.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="1.7s">5. Third-Party Links</h2>
                    <p className="wow fadeInUp" data-wow-delay="1.8s">
                      The Service may contain links to third-party websites or services that are not owned or controlled by Gigly.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.9s">
                      Gigly is not responsible for the content or practices of any third-party website or service.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.0s">6. Disclaimer of Warranties</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.1s">
                      <strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</strong>
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="2.2s">
                      <strong>GIGLY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.</strong>
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.3s">7. Limitation of Liability</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.4s">
                      <strong>GIGLY SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO, DAMAGES FOR LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATING TO THE USE OR INABILITY TO USE THE SERVICE.</strong>
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.5s">8. Termination</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.6s">
                      We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="2.7s">
                      You may terminate your account at any time by contacting us at saif@gigly.io.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.8s">9. Governing Law</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.9s">
                      These Terms shall be interpreted and governed by the laws of the State of [Insert Your State], without regard to its conflict of law provisions.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.0s">10. Dispute Resolution</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.1s">
                      Any dispute arising out of or relating to these Terms shall be resolved by binding arbitration in accordance with the rules of the American Arbitration Association.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.2s">11. Entire Agreement</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.3s">
                      These Terms constitute the entire agreement between you and Gigly regarding the use of the Service.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.4s">12. Changes to Terms</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.5s">
                      We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.6s">13. Contact Us</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.7s">
                      If you have any questions about these Terms, please contact us at saif@gigly.io.
                    </p>

                    {/* Download Button */}
                    <div className="text-center mt-5">
                      <button 
                        className="btn-default"
                        onClick={handleDownloadPDF}
                      >
                        Download Terms and Conditions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Terms Content Section End */}

        <Footer />
        <Scripts />
      </div>
    </>
  );
}
