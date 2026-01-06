import { useState, useEffect } from "react";
import { Header, Footer, Preloader } from "@/components/index";
import { CookieBanner } from "@/components/ui";
import useCookieSettings from "@/hooks/useCookieSettings";
import Scripts from "@/components/layout/Scripts";
import Link from "next/link";
import { useRouter } from "next/router";
import { getBlogPosts } from "@/services/blog";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogPostsLoaded, setBlogPostsLoaded] = useState(false);
  
  // Initialize cookie settings functionality
  useCookieSettings();

  // Service click handlers
  const handleServiceClick = (serviceType) => {
    switch(serviceType) {
      case 'driver-own-car':
        router.push('/onboarding?source=buyer');
        break;
      case 'driver-lease-car':
        router.push('/onboarding?source=buyer');
        break;
      case 'ev-battery':
        router.push('/onboarding?source=buyer');
        break;
      case 'driver-performance':
        router.push('/contact');
        break;
      case 'driver-credit-scoring':
        router.push('/contact');
        break;
      case 'investor-invest':
        router.push('/onboarding?source=investor');
        break;
      default:
        router.push('/onboarding');
    }
  };
  
  // Initialize theme when component mounts
  useEffect(() => {
    const handleAllLibrariesReady = () => {
      console.log('All libraries ready event received in index.js');
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
        console.log('Libraries already available in index.js');
        handleAllLibrariesReady();
      }
      
      return () => {
        window.removeEventListener('allLibrariesReady', handleAllLibrariesReady);
      };
    }
  }, []);

  // Fetch blog posts for home page
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const posts = await getBlogPosts(4); // Get 4 posts for home page
        
        // If no posts from Strapi, use sample data
        if (posts.length === 0) {
          console.log('No posts from Strapi, using sample data');
          const samplePosts = [
            {
              id: 1,
              attributes: {
                title: "Why 70% Of Smart Mobility Workers Are Still Financially Invisible In 2025?",
                slug: "smart-mobility-workers-financially-invisible-2025",
                publishedAt: "2024-09-15T00:00:00.000Z",
                featuredImage: {
                  data: {
                    attributes: {
                      url: "/images/post-1.jpg"
                    }
                  }
                }
              }
            },
            {
              id: 2,
              attributes: {
                title: "Finding Your Perfect Roommate: Tips for a Successful Match",
                slug: "finding-perfect-roommate-tips",
                publishedAt: "2024-09-14T00:00:00.000Z",
                featuredImage: {
                  data: {
                    attributes: {
                      url: "/images/post-2.jpg"
                    }
                  }
                }
              }
            },
            {
              id: 3,
              attributes: {
                title: "Room Hunting Made Easy: A Complete Guide to Using MokoGo",
                slug: "room-hunting-guide-mokogo",
                publishedAt: "2024-09-13T00:00:00.000Z",
                featuredImage: {
                  data: {
                    attributes: {
                      url: "/images/post-3.jpg"
                    }
                  }
                }
              }
            },
            {
              id: 4,
              attributes: {
                title: "Living in India: MokoGo Helps You Find Affordable Rooms in Major Cities",
                slug: "living-india-mokogo-affordable-rooms",
                publishedAt: "2024-09-12T00:00:00.000Z",
                featuredImage: {
                  data: {
                    attributes: {
                      url: "/images/post-4.jpg"
                    }
                  }
                }
              }
            }
          ];
          setBlogPosts(samplePosts);
        } else {
          setBlogPosts(posts);
        }
        setBlogPostsLoaded(true);
      } catch (error) {
        console.error('Error fetching blog posts for home:', error);
        setBlogPosts([]);
        setBlogPostsLoaded(true);
      }
    };

    fetchBlogPosts();
  }, []);

  useEffect(() => {
    // Hide preloader only after both page loads AND blog posts are fetched
    if (blogPostsLoaded) {
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
    }
  }, [blogPostsLoaded]);

  // Format date from Strapi - using UTC to avoid timezone issues
  const formatDate = (dateString) => {
    if (!dateString) {
      return '15 Sep, 2024'; // Fallback date
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '15 Sep, 2024'; // Fallback date
    }
    // Use UTC methods to avoid timezone conversion
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

// Get image URL from Strapi - handle different image structures
const getImageUrl = (image) => {
  if (!image) {
    return '/images/post-1.jpg'; // fallback image
  }
  
  // Handle different image structures from Strapi
  if (typeof image === 'string') {
    return image.startsWith('http') ? image : `http://localhost:1337${image}`;
  }
  
  if (image.url) {
    return image.url.startsWith('http') ? image.url : `http://localhost:1337${image.url}`;
  }
  
  if (image.data && image.data.url) {
    return image.data.url.startsWith('http') ? image.data.url : `http://localhost:1337${image.data.url}`;
  }
  
  return '/images/post-1.jpg';
};

  return (
    <>
      <div>
        <Preloader isLoading={isLoading} />

        <Header />

        {/* Hero Section Start */}
        <div className="hero">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                {/* Hero Content Start */}
                <div className="hero-content">
                  {/* Section Title Start */}
                  <div className="section-title dark-section">
                    <h3 className="wow fadeInUp">welcome to MokoGo</h3>
                    <h1 className="text-anime-style-2 index-heading-spaced" data-cursor="-opaque"><span>Find Your Perfect </span> Room & Roommate</h1>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">Search from 1000+ verified listings across India. Direct contact with owners. Zero brokerage. Your perfect living space is just a click away.</p>
                  </div>
                  {/* Section Title End */}

                  {/* Hero Content Body Start */}
                  <div className="hero-content-body wow fadeInUp" data-wow-delay="0.4s">
                    {/* Hero Button Start */}
                  <div className="hero-btn">
                    <Link href="/explore" className="btn-default text-white">Find Your Place</Link>
                  </div>
                    {/* Hero Button End */}

                    {/* Hero Introduction Video Start */}
                    <div className="hero-introduction-video">
                      {/* Video Play Button Start */}
                      <div className="video-play-button">
                        <a href="https://youtu.be/OeFwbVxokH4" target="_blank" rel="noopener noreferrer" className="popup-video" data-cursor-text="Play">
                          <img src="/images/icon-play.svg" alt="" />
                        </a>
                        <p>About Us</p>
                      </div>
                      {/* Video Play Button End */}
                    </div>
                    {/* Hero Introduction Video End */}
                  </div>
                  {/* Hero Content Body End */}

                  {/* Hero Content Footer Start */}
                  <div className="hero-content-footer">
                    {/* Hero Client Slider Start */}
                    <div className="hero-client-slider">
                      <div className="swiper">
                        <div className="swiper-wrapper">
                          {/* Client Logo Start */}
                          
                          {/* Client Logo End */}
                        </div>
                      </div>
                    </div>
                    {/* Hero Client Slider End */}
                  </div>
                  {/* Hero Content Footer End */}
                </div>
                {/* Hero Content End */}
              </div>

              <div className="col-lg-6">
                {/* Hero Image Start */}
                <div className="hero-image">
                  {/* Hero Img Start */}
                  <div className="hero-img">
                    <figure>
                      <img src="/images/hero-img.png" alt="" />
                    </figure>
                  </div>
                  {/* Hero Img End */}

                  {/* Company Experience Box Start */}
                  <div className="company-experience">
                    <h3><span className="counter">2,500</span>+</h3>
                    <p>Live Listings Available</p>
                  </div>
                  {/* Company Experience Box End */}                       
                </div>
                {/* Hero Image End */}
              </div>
            </div>
          </div>
        </div>
        {/* Hero Section End */}

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
                      <img src="/images/about-img-1.png" alt="" />
                    </figure>
                  </div>
                  {/* About Image 1 End */}

                  {/* About Image 2 Start */}
                  <div className="about-img-2">
                    <figure className="image-anime reveal">
                      <img src="/images/about-img-2.png" alt="" />
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
                    <h3 className="wow fadeInUp">For Room Seekers</h3>
                    <h2 className="text-anime-style-2 index-heading-spaced" data-cursor="-opaque">Tired of searching for the <span>Perfect Roommate?</span></h2>
                    <p className="wow fadeInUp" data-wow-delay="0.2s">Finding the right room and roommate shouldn't be a hassle. MokoGo connects you directly with verified listings and compatible roommates. No brokers, no hidden fees, just honest connections that make living together easy and affordable.</p>
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
                              <h3>Find your perfect room</h3>
                              <p>Browse verified listings and connect directly with owners.</p>
                            </div>
                          </div>
                          {/* About Goal Box End */}
              
                          {/* About Contact Box Start */}
                          <div className="about-contact-box wow fadeInUp" data-wow-delay="0.6s">
                            <div className="icon-box">
                              <img src="/images/icon-phone.svg" alt="" />
                            </div>

                            <div className="about-contact-content">
                              <p><Link href="/explore" className="btn-default">Search Rooms</Link></p>
                            </div>
                          </div>
                          {/* About Contact Box End */}
                        </div>
                        {/* About Content Info End */}
                      </div>

                      <div className="col-md-6">
                        {/* About Author Box Start */}
                        <div className="about-author-box wow fadeInUp" data-wow-delay="0.4s">
                          {/* About Info Box Start */}
                          <div className="about-info-box">
                            <figure className="image-anime reveal">
                              <img src="/images/author-1.jpg" alt="" />
                            </figure>
          
                            <div className="about-author-content">
                              <h3>Available in</h3>
                              <p>100+ Cities</p>
                            </div>
                          </div>
                          {/* About Info Box End */}
                          
                          {/* About Info List Start */}
                          <div className="about-info-list">
                            <ul>
                              <li>Verified Listings</li>
                              <li>Direct Contact</li>
                              <li>Zero Brokerage</li>
                            </ul>
                          </div>
                          {/* About Info List End */}
                        </div>
                        {/* About Author Box End */}
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

        {/* Our Services Section Start */}
        <div className="our-services">
          <div className="container">
            <div className="row">
              <div className="col-lg-4">
                {/* Service Content Start */}
                <div className="our-service-content">
                  {/* Section Title Start */}
                  <div className="section-title">
                    <h3 className="wow fadeInUp">What we offer?</h3>
                    <h2 className="text-anime-style-2 index-heading-spaced" data-cursor="-opaque">Room Finding & Listing <span>in one platform</span></h2>
                  </div>
                  {/* Section Title End */}
                  
                </div>
                {/* Service Content End */}
              </div>

              <div className="col-lg-8">
                {/* Our Service List Start */}
                <div className="our-service-list">
                  {/* Service Item Start */}
                  <div className="service-item" onClick={() => handleServiceClick('driver-own-car')} style={{cursor: 'pointer'}}>
                    <div className="service-no">
                      <h2>01</h2>
                    </div>
                    <div className="service-content-box">
                      <div className="icon-box">
                        <img src="/images/icon-service-1.svg" alt="" />
                      </div>
  
                      <div className="service-item-content">
                        <h3>Find Your Room</h3>
                        <p>Browse through verified listings, filter by location, budget, and preferences. Connect directly with owners and find your perfect living space.</p>
                        <div className="service-btn"><img src="/images/arrow-white.svg" alt="" /></div>
                      </div>
                    </div>
                  </div>
                  {/* Service Item End */}

                  {/* Service Item Start */}
                  <div className="service-item" onClick={() => handleServiceClick('driver-performance')} style={{cursor: 'pointer'}}>
                    <div className="service-no">
                      <h2>04</h2>
                    </div>
                    <div className="service-content-box">
                      <div className="icon-box">
                        <img src="/images/icon-service-2.svg" alt="" />
                      </div>
  
                      <div className="service-item-content">
                        <h3>List Your Space</h3>
                        <p>Have a room to rent? List it on MokoGo and connect with verified seekers. Set your preferences, pricing, and find the perfect roommate match.</p>
                        <div className="service-btn"><img src="/images/arrow-white.svg" alt="" /></div>
                      </div>
                    </div>
                  </div>
                  {/* Service Item End */}

                  {/* Service Item Start */}
                  <div className="service-item" onClick={() => handleServiceClick('driver-lease-car')} style={{cursor: 'pointer'}}>
                    <div className="service-no">
                      <h2>02</h2>
                    </div>
                    <div className="service-content-box">
                      <div className="icon-box">
                        <img src="/images/icon-service-3.svg" alt="" />
                      </div>
  
                      <div className="service-item-content">
                        <h3>Verified Profiles</h3>
                        <p>All users go through ID verification for your safety. See ratings and reviews before connecting. Trust and transparency built into every interaction.</p>
                        <div className="service-btn"><img src="/images/arrow-white.svg" alt="" /></div>
                      </div>
                    </div>
                  </div>
                  {/* Service Item End */}

                  {/* Service Item Start */}
                  <div className="service-item" onClick={() => handleServiceClick('driver-credit-scoring')} style={{cursor: 'pointer'}}>
                    <div className="service-no">
                      <h2>05</h2>
                    </div>
                    <div className="service-content-box">
                      <div className="icon-box">
                        <img src="/images/icon-service-4.svg" alt="" />
                      </div>
  
                      <div className="service-item-content">
                        <h3>Smart Matching</h3>
                        <p>Our platform helps match you with compatible roommates based on lifestyle, preferences, and requirements. Find someone who fits your living style.</p>
                        <div className="service-btn"><img src="/images/arrow-white.svg" alt="" /></div>
                      </div>
                    </div>
                  </div>
                  {/* Service Item End */}

                  {/* Service Item Start */}
                  <div className="service-item" onClick={() => handleServiceClick('ev-battery')} style={{cursor: 'pointer'}}>
                    <div className="service-no">
                      <h2>03</h2>
                    </div>
                    <div className="service-content-box">
                      <div className="icon-box">
                        <img src="/images/icon-service-5.svg" alt="" />
                      </div>
  
                      <div className="service-item-content">
                        <h3>Zero Brokerage</h3>
                        <p>No middlemen, no hidden fees. Connect directly with owners and save on brokerage charges. Transparent pricing and honest communication.</p>
                        <div className="service-btn"><img src="/images/arrow-white.svg" alt="" /></div>
                      </div>
                    </div>
                  </div>
                  {/* Service Item End */}

                  {/* Service Item Start */}
                  <div className="service-item" onClick={() => handleServiceClick('investor-invest')} style={{cursor: 'pointer'}}>
                    <div className="service-no">
                      <h2>06</h2>
                    </div>
                    <div className="service-content-box">
                      <div className="icon-box">
                        <img src="/images/icon-service-6.svg" alt="" />
                      </div>
  
                      <div className="service-item-content">
                        <h3>Safety First</h3>
                        <p>ID verified profiles, verified property listings, and a trusted community. Your safety is our priority with multiple layers of verification.</p>
                        <div className="service-btn"><img src="/images/arrow-white.svg" alt="" /></div>
                      </div>
                    </div>
                  </div>
                  {/* Service Item End */}
                </div>
                {/* Our Service List End */}

                {/* Service Footer Start */}
                <div className="service-footer wow fadeInUp" data-wow-delay="0.8s">
                  <p>Ready to find your perfect space? <Link href="/explore">Browse all listings</Link></p>
                </div>
                {/* Service Footer End */}
              </div>
            </div>
          </div>
        </div>
        {/* Our Services Section End */}

        {/* Why Choose Us Section Start */}
        <div className="why-choose-us">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                {/* Why Choose Content Start */}
                <div className="why-choose-content">
                  {/* Section Title Start */}
                  <div className="section-title">
                    <h3 className="wow fadeInUp">The MokoGo Solution</h3>
                    <h2 className="text-anime-style-2 index-heading-spaced" data-cursor="-opaque">Your Key to Finding the Perfect <span>Room & Roommate</span></h2>
                  </div>
                  {/* Section Title End */}

                  {/* Why Choose Box List Start */}
                  <div className="why-choose-box-list">
                    {/* Why Choose Box Start */}
                    <div className="why-choose-box wow fadeInUp" data-wow-delay="0.2s">
                      <div className="icon-box">
                        <img src="/images/icon-why-choose-1.svg" alt="" />
                      </div>

                      <div className="why-choose-box-content">
                        <h3>A Seeker</h3>
                        <p>Find your perfect room from verified listings. Filter by location, budget, amenities, and lifestyle preferences. Connect directly with owners.</p>
                      </div>
                    </div>
                    {/* Why Choose Box End */}

                    {/* Why Choose Box Start */}
                    <div className="why-choose-box wow fadeInUp" data-wow-delay="0.2s">
                      <div className="icon-box">
                        <img src="/images/icon-why-choose-2.svg" alt="" />
                      </div>

                      <div className="why-choose-box-content">
                        <h3>A Lister</h3>
                        <p>List your room and find the perfect roommate. Set your preferences, pricing, and house rules. No brokers, direct connections only.</p>
                      </div>
                    </div>
                    {/* Why Choose Box End */}
                  </div>
                  {/* Why Choose Box List End */}

                  {/* Why Choose List Start */}
                  <div className="why-choose-list wow fadeInUp" data-wow-delay="0.4s">
                    <ul>
                      <li>Verified Listings & Profiles</li>
                      <li>Zero Brokerage Fees</li>
                    </ul>
                  </div>
                  {/* Why Choose List End */}
                </div>
                {/* Why Choose Content End */}
              </div>

              <div className="col-lg-6">
                {/* Why Choose Image Start */}
                <div className="why-choose-image">
                  {/* Why Choose Image 1 Start */}
                  <div className="why-choose-img-1">
                    <figure className="image-anime reveal">
                      <img src="/images/why-choose-img-2.png" alt="" />
                    </figure>
                  </div>
                  {/* Why Choose Image 1 End */}

                  {/* Why Choose Image 2 Start */}
                  <div className="why-choose-img-2">
                    <figure className="image-anime reveal">
                      <img src="/images/why-choose-img-1.png" alt="" />
                    </figure>
                  </div>
                  {/* Why Choose Image 2 End */}

                  {/* Why Choose Contact Circle Start */}
                  <div className="why-choose-contact-circle">
                    <img src="/images/contact-us-img.svg" alt="" />
                  </div>
                  {/* Why Choose Contact Circle Start */}
                </div>
                {/* Why Choose Image End */}
              </div>
            </div>
          </div>
        </div>
        {/* Why Choose Us Section End */}

        {/* Our Feature Section Start */}
        <div className="our-feature">
          <div className="container">
            <div className="row section-row align-items-center">
              <div className="col-lg-6">
                {/* Section Title Start */}
                <div className="section-title dark-section">
                  <h3 className="wow fadeInUp">Why MokoGo?</h3>
                  <h2 className="text-anime-style-2 index-heading-spaced" data-cursor="-opaque">Key features and values that make all <span> the difference</span></h2>
                </div>
                {/* Section Title End */}
              </div>

              <div className="col-lg-6">
                {/* Section Button Start */}
                <div className="section-btn wow fadeInUp" data-wow-delay="0.2s">
                  <Link href="/contact" className="btn-default">contact now</Link>
                </div>
                {/* Section Button End */}
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                {/* Our Feature List Start */}
                <div className="our-feature-list">
                  {/* Feature Item Start */}
                  <div className="our-feature-item wow fadeInUp">
                    <div className="icon-box">
                      <img src="/images/icon-our-feature-1.svg" alt="" />
                    </div>
                    <div className="feature-item-content">
                      <h3>Smart Matching</h3>
                      <p>Our intelligent matching system connects you with compatible roommates based on lifestyle, preferences, and requirements. Find someone who shares your values and living style.</p>
                    </div>
                  </div>
                  {/* Feature Item End */}

                  {/* Feature Item Start */}
                  <div className="our-feature-item wow fadeInUp" data-wow-delay="0.2s">
                    <div className="icon-box">
                      <img src="/images/icon-our-feature-2.svg" alt="" />
                    </div>
                    <div className="feature-item-content">
                      <h3>Verified & Safe</h3>
                      <p>All users and listings go through strict verification. ID verification, property verification, and community ratings ensure you connect with trusted people and places.</p>
                    </div>
                  </div>
                  {/* Feature Item End */}

                  {/* Feature Item Start */}
                  <div className="our-feature-item wow fadeInUp" data-wow-delay="0.4s">
                    <div className="icon-box">
                      <img src="/images/icon-our-feature-3.svg" alt="" />
                    </div>
                    <div className="feature-item-content">
                      <h3>Transparent & Honest</h3>
                      <p>No hidden fees, no brokers, no surprises. Clear pricing, honest descriptions, and direct communication. We believe in transparency that builds trust.</p>
                    </div>
                  </div>
                  {/* Feature Item End */}

                  {/* Feature Item Start */}
                  <div className="our-feature-item wow fadeInUp" data-wow-delay="0.6s">
                    <div className="icon-box">
                      <img src="/images/icon-our-feature-4.svg" alt="" />
                    </div>
                    <div className="feature-item-content">
                      <h3>Easy to Use</h3>
                      <p>Simple, intuitive platform designed for everyone. Search, filter, connect, and communicate - all in one place. Making room finding as easy as it should be.</p>
                    </div>
                  </div>
                  {/* Feature Item End */}

                  {/* Feature Item Start */}
                  <div className="our-feature-item wow fadeInUp" data-wow-delay="0.8s">
                    <div className="icon-box">
                      <img src="/images/icon-our-feature-5.svg" alt="" />
                    </div>
                    <div className="feature-item-content">
                      <h3>Community Driven</h3>
                      <p>Built by the community, for the community. Ratings, reviews, and feedback help everyone make better decisions. Together we create a better living experience.</p>
                    </div>
                  </div>
                  {/* Feature Item End */}

                  {/* Feature Item Start */}
                  <div className="our-feature-item wow fadeInUp" data-wow-delay="1s">
                    <div className="icon-box">
                      <img src="/images/icon-our-feature-6.svg" alt="" />
                    </div>
                    <div className="feature-item-content">
                      <h3>Wide Coverage</h3>
                      <p>Available in 100+ cities across India. From metros to tier-2 cities, find rooms and roommates wherever you need. Your perfect space is waiting.</p>
                    </div>
                  </div>
                  {/* Feature Item End */}
                  </div>
                  {/* Our Feature List End */}
                </div>

                <div className="col-lg-12">
                  {/* Our Featured Footer Start */}
                  <div className="our-feature-footer wow fadeInUp" data-wow-delay="1.2s">
                    <p><span>Free</span> Ready to find your perfect room? <Link href="/explore">Start searching now</Link></p>
                  </div>
                  {/* Our Featured Footer End */}
                </div>
              </div>
            </div>
          </div>
          {/* Our Feature Section End */}

          {/* Some Fact Section Start */}
          <div className="fact-counter">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-6">
                  {/* Fact Counter Image Start */}
                  <div className="fact-counter-image">
                    {/* Fact Counter img Start */}
                    <div className="fact-counter-img">
                      <figure className="image-anime reveal">
                        <img src="/images/fact-counter-img.png" alt="" />
                      </figure>
                    </div>
                    {/* Fact Counter img End */}

                    {/* Fact Counter Skillbar Start */}
                    <div className="fact-counter-skillbar">
                      <img src="/images/fact-counter-skillbar-img.png" alt="" />
                    </div>
                    {/* Fact Counter Skillbar End */}
                  </div>
                  {/* Fact Counter Image End */}
                </div>

                <div className="col-lg-6">
                  {/* Fact Counter Content Start */}
                  <div className="fact-counter-content">
                    {/* Section Title Start */}
                    <div className="section-title">
                      <h3 className="wow fadeInUp">Key facts</h3>
                      <h2 className="text-anime-style-2" data-cursor="-opaque">We have built on <span>Trust & Experience</span></h2>
                      <p className="wow fadeInUp" data-wow-delay="0.2s">Our platform is built on trust, transparency, and years of understanding what makes great roommate connections work.</p>
                    </div>
                    {/* Section Title End */}

                    {/* Fact Counter Box List Start */}
                    <div className="fact-counter-box-list">
                      {/* Fact Counter Box Start */}
                      <div className="fact-counter-box">
                        <div className="icon-box">
                          <img src="/images/icon-fact-counter-1.svg" alt="" />
                        </div>

                        <div className="fact-counter-box-content">
                          <h2><span className="counter">2,500</span>+</h2>
                          <p>Live Listings Available</p>
                        </div>
                      </div>
                      {/* Fact Counter Box End */}

                      {/* Fact Counter Box Start */}
                      <div className="fact-counter-box">
                        <div className="icon-box">
                          <img src="/images/icon-fact-counter-2.svg" alt="" />
                        </div>

                        <div className="fact-counter-box-content">
                          <h2><span className="counter">10,000</span>+</h2>
                          <p>Happy Users Finding Their Perfect Space</p>
                        </div>
                      </div>
                      {/* Fact Counter Box End */}

                      {/* Fact Counter Box Start */}
                      <div className="fact-counter-box">
                        <div className="icon-box">
                          <img src="/images/icon-fact-counter-3.svg" alt="" />
                        </div>

                        <div className="fact-counter-box-content">
                          <h2><span className="counter">100</span>+</h2>
                          <p>Cities Across India</p>
                        </div>
                      </div>
                      {/* Fact Counter Box End */}
                    </div>
                    {/* Fact Counter Box List End */}

                    {/* Fact Counter List Start */}
                    <div className="fact-counter-list wow fadeInUp" data-wow-delay="0.4s">
                      <ul>
                        <li>Built for Room Seekers</li>
                        <li>Built for Room Listers</li>
                      </ul>
                        </div>
                        {/* Fact Counter List End  */}
                    </div>
                    {/* Fact Counter Content End  */}
                </div>
            </div>
        </div>
     </div>
    {/* Some Fact Section End  */}

    {/* What We Do Section Start  */}
    <div className="what-we-do">
        <div className="container">
            <div className="row align-items-center">
                <div className="col-lg-6">
                    {/* What We Do Content Start  */}
                    <div className="what-we-do-content">
                        {/* Section Title Start  */}
                        <div className="section-title">
                            <h3 className="wow fadeInUp">Our Mission</h3>
                            <h2 className="text-anime-style-2 index-heading-spaced" data-cursor="-opaque">Making Room Finding <span>Simple & Safe</span></h2>
                            <p className="wow fadeInUp" data-wow-delay="0.2s">We're on a mission to transform how people find rooms and roommates. Our platform focuses on: </p>
                        </div>
                        {/* Section Title End  */}

                        {/* What We Do List Start  */}
                        <div className="what-we-do-list wow fadeInUp" data-wow-delay="0.4s">
                            <ul>
                                <li>Verified Listings & Profiles</li>
                                <li>Direct Owner Connections</li>
                                <li>Zero Brokerage Fees</li>
                                <li>Safe & Secure Platform</li>
                            </ul>
                        </div>
                        {/* What We Do List End  */}

                        {/* What We Do Button Start  */}
                        <div className="what-we-do-btn wow fadeInUp" data-wow-delay="0.6s">
                            <Link href="/contact" className="btn-default">contact now</Link>
                        </div>
                        {/* What We Do Button End  */}
                    </div>
                    {/* What We Do Content End  */}
                </div>
                
                <div className="col-lg-6">
                    {/* What We Do Images Start  */}
                    <div className="what-we-do-images">
                        {/* What We Do Image 1 Start  */}
                        <div className="what-do-we-img-1">
                            <figure className="image-anime reveal">
                                <img src="/images/what-we-do-img-1.png" alt="" />
                            </figure>
                        </div>
                        {/* What We Do Image 1 End  */}

                        {/* What We Do Image 2 Start  */}
                        <div className="what-do-we-img-2">
                            <figure className="image-anime reveal">
                                <img src="/images/what-we-do-img-2.png" alt="" />
                            </figure>
                        </div>
                        {/* What We Do Image 2 End  */}

                        {/* Experience Counter Box Start  */}
                        <div className="experience-counter-box">
                            <div className="experience-counter-no">
                                <h2><span className="counter">35</span>+</h2>
                            </div>
                            <div className="experience-counter-content">
                                <p>Successful room connections made</p>
                            </div>
                        </div>
                        {/* Experience Counter Box Start End  */}
                    </div>
                    {/* What We Do Images End  */}
                </div>
            </div>
        </div>
    </div>
    {/* What We Do Section End  */}

    {/* How It Work Section Start  */}
    <div className="how-it-work">
        <div className="container">
            <div className="row">
                <div className="col-lg-6">
                    {/* How It Work Content Start  */}
                    <div className="how-it-work-content">
                        {/* Section Title Start  */}
                        <div className="section-title">
                            <h3 className="wow fadeInUp">how it works</h3>
                            <h2 className="text-anime-style-2" data-cursor="-opaque">Find Your Perfect Room in<span> 3 Simple Steps</span></h2>
                            <p className="wow fadeInUp" data-wow-delay="0.2s">Our platform makes finding the perfect room and roommate as simple as possible. No hassle, no brokers, just honest connections.</p>
                        </div>
                        {/* Section Title End  */}

                        {/* How It Work Button Start  */}
                        <div className="how-it-work-btn wow fadeInUp" data-wow-delay="0.4s">
                            <Link href="/explore" className="btn-default">start searching</Link>
                        </div>
                        {/* How It Work Button End  */}
                    </div>
                    {/* How It Work Content End  */}
                </div>
                
                <div className="col-lg-6">
                    {/* Work Steps Box Start  */}
                    <div className="work-steps-box">
                        {/* Work Steps Item Start  */}
                        <div className="work-step-item wow fadeInUp">
                            <div className="work-step-item-content">
                                <h3>step</h3>
                                <h2>Search & Filter</h2>
                                <p>Browse through verified listings in your preferred location. Filter by budget, amenities, room type, and lifestyle preferences to find exactly what you're looking for.</p>
                            </div>
                            <div className="work-step-item-no">
                                <h2>01</h2>
                            </div>
                        </div>
                        {/* Work Steps Item End  */}

                        {/* Work Steps Item Start  */}
                        <div className="work-step-item wow fadeInUp" data-wow-delay="0.2s">
                            <div className="work-step-item-content">
                                <h3>step</h3>
                                <h2>Connect Directly</h2>
                                <p>Connect directly with owners or roommates. View verified profiles, check compatibility, and communicate through our secure platform. No middlemen, no hidden fees.</p>
                            </div>
                            <div className="work-step-item-no">
                                <h2>02</h2>
                            </div>
                        </div>
                        {/* Work Steps Item End  */}

                        {/* Work Steps Item Start  */}
                        <div className="work-step-item wow fadeInUp" data-wow-delay="0.4s">
                            <div className="work-step-item-content">
                                <h3>step</h3>
                                <h2>Move In & Settle</h2>
                                <p>Finalize the details, sign agreements, and move in. Our platform continues to support you with dispute resolution, reviews, and community features to ensure a smooth living experience.</p>
                            </div>
                            <div className="work-step-item-no">
                                <h2>03</h2>
                            </div>
                        </div>
                        {/* Work Steps Item End  */}
                    </div>
                    {/* Work Steps Box End  */}
                </div>
            </div>
        </div>
    </div>
    {/* How It Work Section End  */}

    {/* Our Pricing Section Start  */}
    {/* Our Pricing Section End  */}

    {/* Our FAQs Section Start */}
    <div className="our-faqs">
        <div className="container">
            <div className="row section-row align-items-center">
                <div className="col-lg-6">
                    {/* Section Title Start  */}
                    <div className="section-title">
                        <h3 className="wow fadeInUp">faqs</h3>
                        <h2 className="text-anime-style-2" data-cursor="-opaque">Your most frequently asked <span>questions answered</span></h2>
                    </div>
                    {/* Section Title End  */}
                </div>

                <div className="col-lg-6">
                    {/* Section Button Start  */}
                    <div className="section-btn wow fadeInUp" data-wow-delay="0.2s">
                        <a href="faqs.html" className="btn-default">view all FAQs</a>
                    </div>
                    {/* Section Button End  */}
                </div>
            </div>

            <div className="row align-items-center">
                <div className="col-lg-6">
                    {/* Our FAQs Image Start  */}
                    <div className="our-faqs-image">
                        {/* Our FAQs Img Start  */}
                        <div className="our-faqs-img">
                            <figure className="image-anime reveal">
                                <img src="/images/faqs-img.png" alt="" />
                            </figure>
                        </div>
                        {/* Our FAQs Img End  */}

                        {/* Client Review Box Start  */}
                        <div className="client-review-box">
                            {/* Client Review Box Content Start  */}
                            <div className="client-review-box-content">
                                <p>100+ Client <span><i className="fa-solid fa-star"></i> 5.0 (250 Reviews)</span></p>
                            </div>
                            {/* Client Review Box Content End  */}

                            {/* Client Review Images Start  */}
                            <div className="client-review-images">
                                {/* Client Image Start  */}
                                <div className="client-image">
                                    <figure className="image-anime">
                                        <img src="/images/satisfy-client-img-1.jpg" alt="" />
                                    </figure>
                                </div>
                                {/* Client Image End  */}

                                {/* Client Image Start  */}
                                <div className="client-image">
                                    <figure className="image-anime">
                                        <img src="/images/satisfy-client-img-2.jpg" alt="" />
                                    </figure>
                                </div>
                                {/* Client Image End  */}

                                {/* Client Image Start  */}
                                <div className="client-image">
                                    <figure className="image-anime">
                                        <img src="/images/satisfy-client-img-3.jpg" alt="" />
                                    </figure>
                                </div>
                                {/* Client Image End  */}

                                {/* Client Image Start  */}
                                <div className="client-image">
                                    <figure className="image-anime">
                                        <img src="/images/satisfy-client-img-4.jpg" alt="" />
                                    </figure>
                                </div>
                                {/* Client Image End  */}

                                {/* Client Image Start  */}
                                <div className="client-image">
                                    <figure className="image-anime">
                                        <img src="/images/satisfy-client-img-5.jpg" alt="" />
                                    </figure>
                                </div>
                                {/* Client Image End  */}

                                {/* Add More Client Image Start  */}
                                <div className="client-image add-more">
                                    <p><span className="counter">30</span>+</p>
                                </div>
                                {/* Add More Client Image End  */}
                            </div>
                            {/* Client Review Images End  */}
                        </div>
                        {/* Client Review Box End  */}
                    </div>
                    {/* Our FAQs Image End  */}
                </div>
                
                <div className="col-lg-6">
                    {/* Our FAQ Section Start  */}
                    <div className="our-faq-section">
                        {/* FAQ Accordion Start  */}
                        <div className="faq-accordion" id="faqaccordion">
                            {/* Accordion Item Start  */}
                            <div className="accordion-item wow fadeInUp">
                                <h2 className="accordion-header" id="heading1">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="true" aria-controls="collapse1">
                                        How do I find a room on MokoGo?
                                    </button>
                                </h2>
                                <div id="collapse1" className="accordion-collapse collapse" aria-labelledby="heading1" data-bs-parent="#faqaccordion">
                                    <div className="accordion-body">
                                        <p>Simply browse our verified listings, use filters to narrow down your search by location, budget, and preferences. Once you find a room you like, connect directly with the owner through our platform. All profiles are verified for your safety.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Accordion Item End  */}

                            {/* Accordion Item Start  */}
                            <div className="accordion-item wow fadeInUp" data-wow-delay="0.2s">
                                <h2 className="accordion-header" id="heading2">
                                    <button className="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                                        How do I list my room on MokoGo? 
                                    </button>
                                </h2>
                                <div id="collapse2" className="accordion-collapse collapse show" aria-labelledby="heading2" data-bs-parent="#faqaccordion">
                                    <div className="accordion-body">
                                        <p>Simply browse our verified listings, use filters to narrow down your search by location, budget, and preferences. Once you find a room you like, connect directly with the owner through our platform. All profiles are verified for your safety.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Accordion Item End  */}

                            {/* Accordion Item Start  */}
                            <div className="accordion-item wow fadeInUp" data-wow-delay="0.4s">
                                <h2 className="accordion-header" id="heading3">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
                                        Is MokoGo safe? How are users verified?
                                    </button>
                                </h2>
                                <div id="collapse3" className="accordion-collapse collapse" aria-labelledby="heading3" data-bs-parent="#faqaccordion">
                                    <div className="accordion-body">
                                        <p>Simply browse our verified listings, use filters to narrow down your search by location, budget, and preferences. Once you find a room you like, connect directly with the owner through our platform. All profiles are verified for your safety.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Accordion Item End  */}    

                            {/* Accordion Item Start  */}
                            <div className="accordion-item wow fadeInUp" data-wow-delay="0.6s">
                                <h2 className="accordion-header" id="heading4">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse4" aria-expanded="false" aria-controls="collapse4">
                                        Are there any brokerage fees or hidden charges?
                                    </button>
                                </h2>
                                <div id="collapse4" className="accordion-collapse collapse" aria-labelledby="heading4" data-bs-parent="#faqaccordion">
                                    <div className="accordion-body">
                                        <p>Simply browse our verified listings, use filters to narrow down your search by location, budget, and preferences. Once you find a room you like, connect directly with the owner through our platform. All profiles are verified for your safety.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Accordion Item End  */} 
                             
                            {/* Accordion Item Start  */}
                            <div className="accordion-item wow fadeInUp" data-wow-delay="0.8s">
                                <h2 className="accordion-header" id="heading5">
                                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse5" aria-expanded="false" aria-controls="collapse5">
                                        What types of rooms can I find on MokoGo? 
                                    </button>
                                </h2>
                                <div id="collapse5" className="accordion-collapse collapse" aria-labelledby="heading5" data-bs-parent="#faqaccordion">
                                    <div className="accordion-body">
                                        <p>Simply browse our verified listings, use filters to narrow down your search by location, budget, and preferences. Once you find a room you like, connect directly with the owner through our platform. All profiles are verified for your safety.</p>
                                    </div>
                                </div>
                            </div>
                            {/* Accordion Item End  */} 
                        </div>
                        {/* FAQ Accordion End  */}
                    </div>
                    {/* Our FAQ Section End  */}
                </div>
            </div>
        </div>
    </div>
    {/* Our FAQs Section End */}

    {/* Our Testimonial Section Start  */}
    <div className="our-testimonial">
        <div className="container">
            <div className="row">
                <div className="col-lg-5">
                    {/* Testimonial Content Start  */}
                    <div className="testimonial-content">
                        {/* Section Title Start  */}
                        <div className="section-title dark-section">
                            <h3 className="wow fadeInUp">our testimonial</h3>
                            <h2 className="text-anime-style-2" data-cursor="-opaque">What customer say <span>about us?</span></h2>
                            <p className="wow fadeInUp" data-wow-delay="0.2s">We've helped thousands of people find their perfect room and roommate. See what our community has to say about their MokoGo experience.</p>
                        </div>
                        {/* Section Title End  */}

                        {/* Testimonial Button Start  */}
                        <div className="testimonial-btn">
                            <Link href="/contact" className="btn-default">contact now</Link>
                        </div>
                        {/* Testimonial Button End  */}
                    </div>
                    {/* Testimonial Content End  */}
                </div>

                <div className="col-lg-7">
                    {/* Testimonial Slider Box Start  */}
                    <div className="testimonial-slider-box">
                        {/* Testimonial Slider Start  */}
                        <div className="testimonial-slider">
                            <div className="swiper">
                                <div className="swiper-wrapper" data-cursor-text="Drag">
                                    {/* Testimonial Slide Start  */}
                                    <div className="swiper-slide">
                                        {/* Testimonial Item Start  */}
                                        <div className="testimonial-item">
                                            {/* Testimonial Header Start  */}
                                            <div className="testimonial-header">
                                                {/* Customer Logo Start  */}
                                                <div className="customer-logo">
                                                    <img src="/images/customer-logo.svg" alt="" />
                                                </div>
                                                {/* Customer Logo End  */}

                                                {/* Testimonial Quotes Start  */}
                                                <div className="testimonial-quotes">
                                                    <img src="/images/testimonial-quotes.svg" alt="" />
                                                </div>
                                                {/* Testimonial Quotes End  */}
                                            </div>
                                            {/* Testimonial Header End  */}

                                            {/* Testimonial Body Start  */}
                                            <div className="testimonial-body">
                                                <p>"Found my perfect flatmate within 3 days! The platform is so easy to use and everyone is verified. No brokers, no hassle. Direct contact with the owner saved me so much time and money!"</p>
                                            </div>
                                            {/* Testimonial Body End  */}

                                            {/* Testimonial Author Start  */}
                                            <div className="testimonial-author">
                                                {/* Author Image Start  */}
                                                <div className="author-image">
                                                    <figure className="image-anime">
                                                        <img src="/images/author-1.jpg" alt="" />
                                                    </figure>
                                                </div>
                                                {/* Author Image End  */}

                                                {/* Author Content Start  */}
                                                <div className="author-content">
                                                    <h3>Priya S. / <span>Software Engineer</span></h3>
                                                </div>
                                                {/* Author Content End  */}
                                            </div>
                                            {/* Testimonial Author End  */}
                                        </div>
                                        {/* Testimonial Item End  */}
                                    </div>
                                    {/* Testimonial Slide End  */}

                                    {/* Testimonial Slide Start  */}
                                    <div className="swiper-slide">
                                        {/* Testimonial Item Start  */}
                                        <div className="testimonial-item">
                                            {/* Testimonial Header Start  */}
                                            <div className="testimonial-header">
                                                {/* Customer Logo Start  */}
                                                <div className="customer-logo">
                                                    <img src="/images/customer-logo.svg" alt="" />
                                                </div>
                                                {/* Customer Logo End  */}

                                                {/* Testimonial Quotes Start  */}
                                                <div className="testimonial-quotes">
                                                    <img src="/images/testimonial-quotes.svg" alt="" />
                                                </div>
                                                {/* Testimonial Quotes End  */}
                                            </div>
                                            {/* Testimonial Header End  */}

                                            {/* Testimonial Body Start  */}
                                            <div className="testimonial-body">
                                                <p>"Found my perfect flatmate within 3 days! The platform is so easy to use and everyone is verified. No brokers, no hassle. Direct contact with the owner saved me so much time and money!"</p>
                                            </div>
                                            {/* Testimonial Body End  */}

                                            {/* Testimonial Author Start  */}
                                            <div className="testimonial-author">
                                                {/* Author Image Start  */}
                                                <div className="author-image">
                                                    <figure className="image-anime">
                                                        <img src="/images/author-2.jpg" alt="" />
                                                    </figure>
                                                </div>
                                                {/* Author Image End  */}

                                                {/* Author Content Start  */}
                                                <div className="author-content">
                                                    <h3>Rahul V. / <span>Marketing Manager</span></h3>
                                                </div>
                                                {/* Author Content End  */}
                                            </div>
                                            {/* Testimonial Author End  */}
                                        </div>
                                        {/* Testimonial Item End  */}
                                    </div>
                                    {/* Testimonial Slide End  */}

                                    {/* Testimonial Slide Start  */}
                                    <div className="swiper-slide">
                                        {/* Testimonial Item Start  */}
                                        <div className="testimonial-item">
                                            {/* Testimonial Header Start  */}
                                            <div className="testimonial-header">
                                                {/* Customer Logo Start  */}
                                                <div className="customer-logo">
                                                    <img src="/images/customer-logo.svg" alt="" />
                                                </div>
                                                {/* Customer Logo End  */}

                                                {/* Testimonial Quotes Start  */}
                                                <div className="testimonial-quotes">
                                                    <img src="/images/testimonial-quotes.svg" alt="" />
                                                </div>
                                                {/* Testimonial Quotes End  */}
                                            </div>
                                            {/* Testimonial Header End  */}

                                            {/* Testimonial Body Start  */}
                                            <div className="testimonial-body">
                                                <p>"Found my perfect flatmate within 3 days! The platform is so easy to use and everyone is verified. No brokers, no hassle. Direct contact with the owner saved me so much time and money!"</p>
                                            </div>
                                            {/* Testimonial Body End  */}

                                            {/* Testimonial Author Start  */}
                                            <div className="testimonial-author">
                                                {/* Author Image Start  */}
                                                <div className="author-image">
                                                    <figure className="image-anime">
                                                        <img src="/images/author-3.jpg" alt="" />
                                                    </figure>
                                                </div>
                                                {/* Author Image End  */}

                                                {/* Author Content Start  */}
                                                <div className="author-content">
                                                    <h3>Ananya D. / <span>Designer</span></h3>
                                                </div>
                                                {/* Author Content End  */}
                                            </div>
                                            {/* Testimonial Author End  */}
                                        </div>
                                        {/* Testimonial Item End  */}
                                    </div>
                                    {/* Testimonial Slide End  */}
                                </div>
                                <div className="testimonial-pagination"></div>
                            </div>
                        </div>
                        {/* Testimonial Slider End  */}

                        {/* Customer Rating Boxes Start  */}
                        <div className="customer-rating-boxes">
                            {/* Customer Rating Box Start  */}
                            <div className="customer-rating-box">
                                {/* Customer Rating Image Start  */}
                                <div className="customer-rating-image">
                                    <img src="/images/icon-google.svg" alt="" />
                                </div>
                                {/* Customer Rating Image End  */}

                                {/* Customer Rating Content Start  */}
                                <div className="customer-rating-content">
                                    <p>google rating</p>
                                    <div className="customer-rating-counter">
                                        <h3><span className="counter">5.0</span></h3>
                                        <div className="customer-rating-star">
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                            <i className="fa-solid fa-star"></i>
                                        </div>
                                    </div>
                                </div>
                                {/* Customer Rating Content End  */}
                            </div>
                            {/* Customer Rating Box End  */}

                            {/* Customer Rating Box Start  */}
                            <div className="customer-rating-box">
                                {/* Customer Rating Counter Start  */}
                                <div className="customer-rating-counter">
                                    <p><span className="counter">5.0</span> rated</p>
                                </div>
                                {/* Customer Rating Counter End  */}

                                {/* Customer Rating Counter Start  */}
                                <div className="customer-rating-star-box">
                                    <div className="customer-rating-star">
                                        <i className="fa-solid fa-star"></i>
                                        <i className="fa-solid fa-star"></i>
                                        <i className="fa-solid fa-star"></i>
                                        <i className="fa-solid fa-star"></i>
                                        <i className="fa-solid fa-star"></i>
                                    </div>

                                    <div className="star-rating-img">
                                        <img src="/images/customer-rating-img.svg" alt="" />
                                    </div>
                                </div>
                                {/* Customer Rating Counter End  */}
                            </div>
                            {/* Customer Rating Box End  */}

                            {/* Customer Rating Content Start  */}
                            <div className="customer-rating-box customer-rating-content">
                                <p>Total rating <span className="counter">5.0</span> base on 1250+ review</p>
                            </div>
                            {/* Customer Rating Content End  */}
                        </div>
                        {/* Customer Rating Boxes End  */}
                    </div>
                    {/* Testimonial Slider Box End  */}
                </div>
            </div>
        </div>
    </div>
    {/* Our Testimonial Section End  */}

    {/* Our Blog Section Start  */}
    <div className="our-blog">
        <div className="container">
            <div className="row section-row">
                <div className="col-lg-6">
                    {/* Section Title Start  */}
                    <div className="section-title">
                        <h3 className="wow fadeInUp">blog / post</h3>
                        <h2 className="text-anime-style-2" data-cursor="-opaque">MokoGo insights, updates <span>and trends</span></h2>
                    </div>
                    {/* Section Title End  */}
                </div>

                <div className="col-lg-6">
                    {/* Section Button Start  */}
                    <div className="section-btn wow fadeInUp" data-wow-delay="0.2s">
                        <Link href="/blog" className="btn-default">view all post</Link>
                    </div>
                    {/* Section Button End  */}
                </div>
            </div>

            <div className="row">
              {blogPosts.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <h3>No blog posts found.</h3>
                  <p>Please add some blog posts in your Strapi admin panel or make sure Strapi is running.</p>
                  {/* Fallback static content */}
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <div className="post-item wow fadeInUp">
                        <div className="post-featured-image">
                          <Link href="#" data-cursor-text="View">
                            <figure className="image-anime">
                              <img src="/images/post-1.jpg" alt="Sample Post" />
                            </figure>
                          </Link>
                        </div>
                        <div className="post-item-body">
                          <div className="post-item-meta">
                            <ul>
                              <li><i className="fa-solid fa-calendar-days"></i> 15 sep, 2024</li>
                            </ul>
                          </div>
                          <div className="post-item-content">
                            <h2><Link href="#">10 Essential Steps to Create Foolproof Financial Plan</Link></h2>
                          </div>
                          <div className="post-item-btn">
                            <Link href="#" className="readmore-btn">read more</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="post-item wow fadeInUp" data-wow-delay="0.2s">
                        <div className="post-featured-image">
                          <Link href="#" data-cursor-text="View">
                            <figure className="image-anime">
                              <img src="/images/post-2.jpg" alt="Sample Post" />
                            </figure>
                          </Link>
                        </div>
                        <div className="post-item-body">
                          <div className="post-item-meta">
                            <ul>
                              <li><i className="fa-solid fa-calendar-days"></i> 15 sep, 2024</li>
                            </ul>
                          </div>
                          <div className="post-item-content">
                            <h2><Link href="#">Top 10 Financial Mistakes to Avoid in 2024</Link></h2>
                          </div>
                          <div className="post-item-btn">
                            <Link href="#" className="readmore-btn">read more</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                blogPosts.map((post, index) => (
                  <div key={post.id} className="col-md-6">
                    {/* Post Item Start  */}
                    <div className="post-item wow fadeInUp" data-wow-delay={`${index * 0.2}s`}>
                      {/* Post Featured Image Start */}
                      <div className="post-featured-image">
                        <Link href={`/blog-single?id=${post.id}`} data-cursor-text="View">
                          <figure className="image-anime">
                            <img 
                              src={getImageUrl(post.featuredImage)} 
                              alt={post.title}
                              onError={(e) => {
                                e.target.src = '/images/post-1.jpg';
                              }}
                            />
                          </figure>
                        </Link>
                      </div>
                      {/* Post Featured Image End  */}

                      {/* Post Item Body Start  */}
                      <div className="post-item-body">
                        {/* Post Item Tag Start  */}
                        <div className="post-item-meta">
                          <ul>
                            <li><i className="fa-solid fa-calendar-days"></i> {formatDate(post.blogpostdate || post.publishedAt)}</li>
                          </ul>
                        </div>
                        {/* Post Item Tag End  */}

                        {/* Post Item Content Start  */}
                        <div className="post-item-content">
                          <h2><Link href={`/blog-single?id=${post.id}`}>{post.title}</Link></h2>
                        </div>
                        {/* Post Item Content End  */}

                        {/* Post Item Readmore Button Start */}
                        <div className="post-item-btn">
                          <Link href={`/blog-single?id=${post.id}`} className="readmore-btn">read more</Link>
                        </div>
                        {/* Post Item Readmore Button End */}
                      </div>
                      {/* Post Item Body End  */}
                    </div>
                    {/* Post Item End  */}
                  </div>
                ))
              )}
            </div>
        </div>
    </div>
    {/* Our Blog Section End   */}

        <Footer />
        
        {/* Cookie Banner */}
        <CookieBanner />
        
        {/* Load Scripts for cursor and other functionality */}
        <Scripts />
      </div>
    </>
  );

}