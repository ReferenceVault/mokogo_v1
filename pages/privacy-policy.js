import { useState, useEffect } from "react";
import { Header, Footer, Preloader } from "@/components/index";
import Scripts from "@/components/layout/Scripts";
import Link from "next/link";
import Head from "next/head";

export default function PrivacyPolicy() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize theme when component mounts
  useEffect(() => {
    const handleAllLibrariesReady = () => {
      console.log('All libraries ready event received in privacy-policy.js');
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
        console.log('Libraries already available in privacy-policy.js');
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
    // Create a new window with the privacy policy content for printing
    const printWindow = window.open('', '_blank');
    const privacyContent = document.getElementById('privacy-content').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Privacy Policy - Gigly</title>
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
            .privacy-container { max-width: 800px; margin: 0 auto; }
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
          <div class="privacy-container">
            <h1>Privacy Policy</h1>
            <p>Last updated September 03, 2025</p>
            ${privacyContent}
            <button class="download-btn" onclick="window.print()">Download Privacy Policy</button>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <>
      <Head>
        <title>Privacy Policy - Gigly</title>
        <meta name="description" content="Privacy Policy for Gigly - AI-powered, vehicle financing and investment platform. Learn how we protect your personal information and data." />
        <meta name="keywords" content="privacy policy, gigly privacy, data protection, personal information, privacy rights, GDPR" />
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
                  <h1 className="text-anime-style-2" data-cursor="-opaque">Privacy Policy</h1>
                  <nav className="wow fadeInUp">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item"><Link href="/">home</Link></li>
                      <li className="breadcrumb-item active" aria-current="page">privacy policy</li>
                    </ol>
                  </nav>
                </div>
                {/* Page Header Box End */}
              </div>
            </div>
          </div>
        </div>
        {/* Page Header End */}

        {/* Privacy Policy Content Section Start */}
        <div className="terms-content-section">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="terms-content-wrapper">
                  {/* Privacy Policy Content */}
                  <div id="privacy-content" className="terms-content">
                    <h1 className="wow fadeInUp">Privacy Policy</h1>
                    <p className="wow fadeInUp" data-wow-delay="0.1s">Last updated September 03, 2025</p>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">
                      This Privacy Notice for Gigly Inc ("we," "us," or "our") describes how and why we might access, collect, store, use, and/or share ("process") your personal information when you use our services ("Services"), including when you:
                    </p>
                    <ul className="wow fadeInUp" data-wow-delay="0.3s">
                      <li>Visit our website at <a href="https://gigly.io">https://gigly.io</a> or any website of ours that links to this Privacy Notice</li>
                      <li>Use Gigly — Investor & Buyer Portal (web app). Gigly is a web-based, asset-backed, financing platform for adults (18+). Investors fund campaigns for income-generating vehicles (cars, bikes, auto-rickshaws, including EVs) and receive variable profit-share payouts (no interest). Buyers/operators apply to receive an asset and remit a profit-share from their earnings. The service provides user accounts and verification (KYC), digital forms and e-signatures, investor payments via PayPal, and recording of buyer remittance references from mobile money/bank transfers. For certain assets, an IoT device collects usage data (e.g., location, trip/odometer/speed metrics) to support billing, safety, and support. The platform includes admin/compliance modules and generates receipts, statements, and notifications. Gigly operates primarily in Bangladesh, with read-only investor access in other countries where permitted.</li>
                      <li>Engage with us in other related ways, including any sales, marketing, or events</li>
                    </ul>
                    <p className="wow fadeInUp" data-wow-delay="0.4s">
                      Questions or concerns? Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:saif@gigly.io">saif@gigly.io</a>.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="0.5s">Summary of Key Points</h2>
                    <ul className="wow fadeInUp" data-wow-delay="0.6s">
                      <li><strong>What personal information do we process?</strong> We may process personal information depending on how you interact with our Services, the choices you make, and the features you use.</li>
                      <li><strong>Do we process sensitive personal information?</strong> No.</li>
                      <li><strong>Do we collect any information from third parties?</strong> No.</li>
                      <li><strong>How do we process your information?</strong> To provide, improve, and administer our Services; communicate with you; for security and fraud prevention; and to comply with law.</li>
                      <li><strong>When and with whom do we share personal information?</strong> Only in specific situations with specific third parties.</li>
                      <li><strong>How do we keep your information safe?</strong> We use organizational and technical safeguards, but cannot guarantee 100% security.</li>
                      <li><strong>What are your rights?</strong> Depending on your location, you may have rights regarding your personal data.</li>
                      <li><strong>How do you exercise your rights?</strong> By submitting a data subject access request or contacting us directly.</li>
                    </ul>

                    <h2 className="wow fadeInUp" data-wow-delay="0.7s">1. What Information Do We Collect?</h2>
                    <p className="wow fadeInUp" data-wow-delay="0.8s">
                      <strong>Personal information you disclose to us:</strong> Names, phone numbers, email addresses, billing addresses, authentication data, contact preferences.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="0.9s">
                      <strong>Sensitive Information:</strong> Not collected.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.0s">
                      <strong>Payment Data:</strong> May be collected via payment providers.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.1s">
                      <strong>Social Media Logins:</strong> If you register via Facebook, X, or other accounts, we may collect associated profile information.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.2s">
                      <strong>Automatically collected data:</strong> IP addresses, browser/device info, location data, cookies, usage statistics.
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="1.3s">
                      <strong>Google API:</strong> We adhere to the Google API Services User Data Policy.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="1.4s">2. How Do We Process Your Information?</h2>
                    <ul className="wow fadeInUp" data-wow-delay="1.5s">
                      <li>Facilitate account creation and authentication</li>
                      <li>Deliver requested services</li>
                      <li>Respond to user inquiries and support</li>
                      <li>Enable user-to-user communications</li>
                    </ul>

                    <h2 className="wow fadeInUp" data-wow-delay="1.6s">3. When and With Whom Do We Share Your Personal Information?</h2>
                    <ul className="wow fadeInUp" data-wow-delay="1.7s">
                      <li><strong>Business Transfers:</strong> In mergers, acquisitions, or financing events</li>
                      <li><strong>Business Partners:</strong> To offer products, services, or promotions</li>
                    </ul>

                    <h2 className="wow fadeInUp" data-wow-delay="1.8s">4. Do We Use Cookies and Other Tracking Technologies?</h2>
                    <p className="wow fadeInUp" data-wow-delay="1.9s">
                      Yes, to manage security, preferences, analytics, and advertising. See our Cookie Notice.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.0s">5. Do We Offer Artificial Intelligence-Based Products?</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.1s">
                      Yes — features powered by AI, ML, or similar technologies (e.g., AI predictive analytics).
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="2.2s">
                      <strong>Processing:</strong> Data handled per this Privacy Notice and with third-party AI providers (e.g., AWS AI).
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="2.3s">
                      <strong>Opt-Out:</strong> You can update account settings or contact us to opt out.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.4s">6. How Do We Handle Your Social Logins?</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.5s">
                      If you register with a social media login, we may collect your profile info (e.g., name, email, friends list, profile picture). We only use this for purposes stated in this Privacy Notice.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.6s">7. How Long Do We Keep Your Information?</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.7s">
                      We retain personal information as long as necessary for stated purposes unless required longer by law. When no longer needed, data is deleted, anonymized, or securely stored.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="2.8s">8. How Do We Keep Your Information Safe?</h2>
                    <p className="wow fadeInUp" data-wow-delay="2.9s">
                      We implement technical and organizational safeguards, but no method of transmission/storage is 100% secure.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.0s">9. Do We Collect Information from Minors?</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.1s">
                      No — we do not knowingly collect or market data from anyone under 18. If discovered, such data is deleted.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.2s">10. What Are Your Privacy Rights?</h2>
                    <ul className="wow fadeInUp" data-wow-delay="3.3s">
                      <li>Withdraw consent at any time</li>
                      <li>Opt out of marketing communications (via unsubscribe links, SMS STOP, or contacting us)</li>
                      <li>Review or change account info through account settings or by contacting us</li>
                      <li>Cookies: Manage via browser settings</li>
                    </ul>

                    <h2 className="wow fadeInUp" data-wow-delay="3.4s">11. Controls for Do-Not-Track Features</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.5s">
                      We currently do not respond to DNT browser signals due to lack of a recognized standard.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.6s">12. Do We Make Updates to This Notice?</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.7s">
                      Yes, we update as needed for compliance. The "Last Updated" date will be revised.
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="3.8s">13. How Can You Contact Us About This Notice?</h2>
                    <p className="wow fadeInUp" data-wow-delay="3.9s">
                      <strong>Email:</strong> <a href="mailto:saif@gigly.io">saif@gigly.io</a>
                    </p>
                    <p className="wow fadeInUp" data-wow-delay="4.0s">
                      <strong>Post:</strong><br />
                      Gigly Inc<br />
                      Canadian Shield Avenue<br />
                      Ottawa K2K 0H3<br />
                      Canada
                    </p>

                    <h2 className="wow fadeInUp" data-wow-delay="4.1s">14. How Can You Review, Update, or Delete the Data We Collect from You?</h2>
                    <p className="wow fadeInUp" data-wow-delay="4.2s">
                      Depending on your country's laws, you may request access, correction, deletion, or withdrawal of consent for your data contact us directly.
                    </p>

                    {/* Download Button */}
                    <div className="text-center mt-5">
                      <button 
                        className="btn-default"
                        onClick={handleDownloadPDF}
                      >
                        Download Privacy Policy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Privacy Policy Content Section End */}

        <Footer />
        <Scripts />
      </div>
    </>
  );
}
