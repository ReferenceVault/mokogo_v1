import { useState, useEffect } from "react";
import { Header, Footer, Preloader } from "@/components/index";
import Scripts from "@/components/layout/Scripts";
import Link from "next/link";
import Head from "next/head";

export default function About() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize theme when component mounts
  useEffect(() => {
    const handleAllLibrariesReady = () => {
      console.log('All libraries ready event received in about.js');
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
        console.log('Libraries already available in about.js');
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
        <title>About Us - Gigly</title>
        <meta name="description" content="Learn about Gigly - AI-powered, Sharia-compliant platform empowering mobility workers with ethical financing for asset ownership and financial freedom." />
        <meta name="keywords" content="about gigly, company, mission, vision, team, values, sharia compliant, gig workers, vehicle financing" />
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
                  <h1 className="text-anime-style-2" data-cursor="-opaque">About us</h1>
                  <nav className="wow fadeInUp">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item"><Link href="/">home</Link></li>
                      <li className="breadcrumb-item active" aria-current="page">about us</li>
                    </ol>
                  </nav>
                </div>
                {/* Page Header Box End */}
              </div>
            </div>
          </div>
        </div>
        {/* Page Header End */}

        {/* About Us Section Start */}
        <div className="about-us">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                {/* About Us Images Start */}
                <div className="about-us-images">
                  {/* About Image 1 Start */}
                  <div className="about-img-1">
                    <figure className="image-anime reveal">
                      <img src="/images/aboutus-img-1.png" alt="" />
                    </figure>
                  </div>
                  {/* About Image 1 End */}

                  {/* About Image 2 Start */}
                  <div className="about-img-2">
                    <figure className="image-anime reveal">
                      <img src="/images/aboutus-img-2.jpg" alt="" />
                    </figure>
                  </div>
                  {/* About Image 2 End */}

                  {/* Contact Circle Start */}
                  <div className="contact-circle">
                    <img src="/images/contact-us-img.svg" alt="" />
                  </div>
                  {/* Contact Circle End */}
                </div>
                {/* About Us Images End */}
              </div>
              
              <div className="col-lg-6">
                {/* About Us Content Start */}
                <div className="about-us-content">
                  {/* Section Title Start */}
                  <div className="section-title">
                    <h3 className="wow fadeInUp">about us</h3>
                    <h2 className="text-anime-style-2 about-heading-spaced">Proudly Canadian. <span>Globally Focused.</span></h2>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">Gigly Tech Inc. is a Canadian fintech company leveraging AI-driven, ESG-compliant financing to empower financially excluded mobility workers in emerging markets. Rooted in Canadian values of inclusion, sustainability, and collaboration, we create pathways to asset ownership that boost driver incomes by 15–45% while generating measurable social and environmental impact.</p>
                  </div>
                  {/* Section Title End */}

                  {/* About Content body Start */}
                  <div className="about-content-body">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        {/* About Content Info Start */}
                        <div className="about-content-info">
                          {/* About Goal Box Start */}
                          <div className="about-goal-box wow fadeInUp" data-wow-delay="0.4s">
                            <div className="icon-box">
                              <img src="/images/icon-financial-strategies.svg" alt="" />
                            </div>
          
                            <div className="about-goal-box-content">
                              <h3>Join us</h3>
                              <p>Whether you're a driver ready for ownership, or an investor want to craete a new revenue source or a platform looking to empower your fleet, the journey starts here</p>
                            </div>
                          </div>
                          {/* About Goal Box End */}
              
                          {/* About Contact Box Start */}
                          <div className="about-contact-box wow fadeInUp" data-wow-delay="0.6s">
                            <div className="icon-box">
                              <img src="/images/icon-phone.svg" alt="" />
                            </div>

                            <div className="about-contact-content">
                              <p><a href="tel:658456975">+(658) 456-975</a></p>
                            </div>
                          </div>
                          {/* About Contact Box End */}
                        </div>
                        {/* About Content Info End */}
                      </div>
                    </div>
                  </div>
                  {/* About Content body End */}
                </div>
                {/* About Us Content End */}
              </div>
            </div>
          </div>
        </div>
        {/* About Us Section End */}

        {/* Our Approach Section Start */}
        <div className="our-approach">
          <div className="container">
            <div className="row section-row align-items-center">
              <div className="col-lg-6">
                {/* Section Title Start */}
                <div className="section-title">
                  <h3 className="wow fadeInUp">our approach</h3>
                  <h2 className="wow fadeInUp about-heading-spaced" data-wow-delay="0.2s">Customized strategies for <span>financial success</span></h2> 
                </div>
                {/* Section Title End */}
              </div>
              <div className="col-lg-6">
                {/* Section Btn Start */}
                <div className="section-btn wow fadeInUp" data-wow-delay="0.2s">
                  <Link href="/contact" className="btn-default">Contact now</Link>
                </div>                     
                {/* Section Btn Start */}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-4 col-md-6">
                {/* Mission Vision Item Start */}
                <div className="mission-vission-item wow fadeInUp">
                  {/* Mission Vision Header Start */}
                  <div className="mission-vission-header">
                    <div className="icon-box">
                      <img src="/images/icon-our-mission.svg" alt="" />
                    </div>

                    <div className="mission-vission-content">
                      <h3>our mission</h3>
                      <p>Gigly is founded to democratize finance for mobility workers globally through creating pathways to asset ownership, income stability, and long-term financial resilience for those who have been systematically excluded.</p>
                    </div>
                  </div>
                  {/* Mission Vision Header End */}

                  {/* Mission Vision Image Start */}
                  <div className="mission-vission-image">
                    <figure className="image-anime">
                      <img src="/images/our-mission-img.jpg" alt="" />
                    </figure>
                  </div>
                  {/* Mission Vision Image End */}
                </div>
                {/* Mission Vision Item End */}
              </div>

              <div className="col-lg-4 col-md-6">
                {/* Mission Vision Item Start */}
                <div className="mission-vission-item wow fadeInUp" data-wow-delay="0.2s">
                  {/* Mission Vision Header Start */}
                  <div className="mission-vission-header">
                    <div className="icon-box">
                      <img src="/images/icon-our-vision.svg" alt="" />
                    </div>

                    <div className="mission-vission-content">
                      <h3>our vision</h3>
                      <p>We envision a future where every gig worker, regardless of their location or financial history, can access the tools they need to build prosperity, contribute to global climate goals, and achieve sustainable development.</p>
                    </div>
                  </div>
                  {/* Mission Vision Header End */}

                  {/* Mission Vision Image Start */}
                  <div className="mission-vission-image">
                    <figure className="image-anime">
                      <img src="/images/our-vision-img.png" alt="" />
                    </figure>
                  </div>
                  {/* Mission Vision Image End */}
                </div>
                {/* Mission Vision Item End */}
              </div>

              <div className="col-lg-4 col-md-6">
                {/* Mission Vision Item Start */}
                <div className="mission-vission-item wow fadeInUp" data-wow-delay="0.4s">
                  {/* Mission Vision Header Start */}
                  <div className="mission-vission-header">
                    <div className="icon-box">
                      <img src="/images/icon-our-value.svg" alt="" />
                    </div>

                    <div className="mission-vission-content">
                      <h3>our value</h3>
                      <p>Gigly is founded on Canadian values of inclusion, sustainability, and collaboration, and we lead with purpose. We are committed to harnessing cutting-edge technology to ensure a more sustainable and equitable global economy.</p>
                    </div>
                  </div>
                  {/* Mission Vision Header End */}

                  {/* Mission Vision Image Start */}
                  <div className="mission-vission-image">
                    <figure className="image-anime">
                      <img src="/images/our-value-img.png" alt="" />
                    </figure>
                  </div>
                  {/* Mission Vision Image End */}
                </div>
                {/* Mission Vision Item End */}
              </div>
            </div>
          </div>
        </div>
        {/* Our Approach Section End */}

        {/* Our Team Section Start */}
        <div className="our-team">
          <div className="container">
            <div className="row section-row align-items-center">
              <div className="col-lg-6">
                {/* Section Title Start */}
                <div className="section-title">
                  <h3 className="wow fadeInUp">team member</h3>
                  <h2 className="text-anime-style-2 about-heading-spaced" data-cursor="-opaque">Proven financial Inclusion <span> and Technology experts</span></h2> 
                </div>
                {/* Section Title End */}
              </div>

              <div className="col-lg-6">
                {/* Section Btn Start */}
                <div className="section-btn wow fadeInUp" data-wow-delay="0.2s">
                  <Link href="/team" className="btn-default">all member</Link>
                </div>
                {/* Section Btn Start */}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-4 col-md-6">
                {/* Team Member Item Start */}
                <div className="team-member-item wow fadeInUp">
                  {/* Team Image Start */}
                  <div className="team-image">
                    <Link href="/team-single" data-cursor-text="View">
                      <figure className="image-anime">
                        <img src="/images/team-1.jpg" alt="" />
                      </figure>
                    </Link>
                  </div>
                  {/* Team Image End */}

                  {/* Team Body Start */}
                  <div className="team-body">
                    {/* Team Content Start */}
                    <div className="team-content">
                      <h3><Link href="/team-single">Saif Rashid</Link></h3>
                      <p>Co-founder & CEO</p>
                    </div>
                    {/* Team Content End */}

                    {/* Team Social Icon Start */}
                    <div className="team-social-icon">
                      <ul>
                        <li><a href="https://www.linkedin.com/in/saif-rashid/" target="_blank"><i className="fa-brands fa-linkedin-in"></i></a></li>
                      </ul>
                    </div>
                    {/* Team Social Icon End */}
                  </div>
                  {/* Team Body End */}
                </div>
                {/* Team Member Item End */}
              </div>

              <div className="col-lg-4 col-md-6">
                {/* Team Member Item Start */}
                <div className="team-member-item wow fadeInUp" data-wow-delay="0.2s">
                  {/* Team Image Start */}
                  <div className="team-image">
                    <Link href="/team-single" data-cursor-text="View">
                      <figure className="image-anime">
                        <img src="/images/team-2.jpg" alt="" />
                      </figure>
                    </Link>
                  </div>
                  {/* Team Image End */}

                  {/* Team Body Start */}
                  <div className="team-body">
                    {/* Team Content Start */}
                    <div className="team-content">
                      <h3><Link href="/team-single">Narveer S.</Link></h3>
                      <p>Co-founder & CTO</p>
                    </div>
                    {/* Team Content End */}

                    {/* Team Social Icon Start */}
                    <div className="team-social-icon">
                      <ul>
                      <li><a href="#"><i className="fa-brands fa-linkedin-in"></i></a></li>
                      </ul>
                    </div>
                    {/* Team Social Icon End */}
                  </div>
                  {/* Team Body End */}
                </div>
                {/* Team Member Item End */}
              </div>

              <div className="col-lg-4 col-md-6">
                {/* Team Member Item Start */}
                <div className="team-member-item wow fadeInUp" data-wow-delay="0.4s">
                  {/* Team Image Start */}
                  <div className="team-image">
                    <Link href="/team-single" data-cursor-text="View">
                      <figure className="image-anime">
                        <img src="/images/team-3.jpg" alt="" />
                      </figure>
                    </Link>
                  </div>
                  {/* Team Image End */}

                  {/* Team Body Start */}
                  <div className="team-body">
                    {/* Team Content Start */}
                    <div className="team-content">
                      <h3><Link href="/team-single">Anthony Annan</Link></h3>
                      <p>Co-founder and CPO</p>
                    </div>
                    {/* Team Content End */}

                    {/* Team Social Icon Start */}
                    <div className="team-social-icon">
                      <ul>
                      <li><a href="https://www.linkedin.com/in/anthonyannan/" target="_blank"><i className="fa-brands fa-linkedin-in"></i></a></li>
                      </ul>
                    </div>
                    {/* Team Social Icon End */}
                  </div>
                  {/* Team Body End */}
                </div>
                {/* Team Member Item End */}
              </div>
            </div>
          </div>    
        </div>
        {/* Our Team Section End */}

        <Footer />
        <Scripts />
      </div>
    </>
  );
}
