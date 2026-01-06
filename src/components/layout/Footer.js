import Link from "next/link";
import { Logo } from "@/components/index";
export default function Footer() {
  return (
    <>
      {/* Footer Section Start */}
      <footer className="main-footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              {/* Footer Newsletter Box Start */}
              <div className="footer-newsletter-box">
                {/* Footer Newsletter Title Start */}
                <div className="footer-newsletter-title">
                  <h3>Get update, subscribe!</h3>
                </div>
                {/* Footer Newsletter Title End */}

                {/* Newsletter Form start */}
                <div className="newsletter-form">
                  <form id="newsletterForm" action="#" method="POST">
                    <div className="form-group">
                      <input type="email" name="email" className="form-control py-3" id="mail" placeholder="Enter Your Email" required="" />
                      <button type="submit" className="newsletter-btn mt-0"><img src="/images/arrow-white.svg" alt="" /></button>
                    </div>
                  </form>
                </div>
                {/* Newsletter Form end */}
              </div>
              {/* Footer Newsletter Box End */}
            </div>
            
            <div className="col-lg-2 col-md-4 col-6">
              {/* Footer Links Start */}
              <div className="footer-links">
                <h3>company</h3>
                <ul>
                  <li><Link href="/">home</Link></li>
                  <li><Link href="/about">about Us</Link></li>
                  <li><Link href="/explore">Explore</Link></li>
                  <li><Link href="/blog">blog</Link></li>
                </ul>
              </div>
              {/* Footer Links End */}
            </div>

            <div className="col-lg-2 col-md-4 col-6">
              {/* Footer Links Start */}
              <div className="footer-links">
                <h3>support</h3>
                <ul>
                  <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                  <li><Link href="/cookie-policy">Cookie Policy</Link></li>
                  <li><Link href="/terms">Term & Condition</Link></li>
                  <li><Link href="/contact">Contact us</Link></li>
                </ul>
              </div>
              {/* Footer Links End */}
            </div>

            <div className="col-lg-2  col-md-4">
              {/* Footer Links Start */}
              <div className="footer-links">
                <h3>service</h3>
                <ul>
                  <li><Link href="/explore">Find Your Place</Link></li>
                  <li><Link href="/explore">List Your Space</Link></li>
                  <li><Link href="/about">How It Works</Link></li>
                  <li><Link href="/contact">Contact Us</Link></li>
                </ul>
              </div>
              {/* Footer Links End */}
            </div>

            <div className="col-lg-12">
              {/* About Footer Start */}
              <div className="footer-cta-box">
                {/* Footer Logo Start */}
                <Logo 
                size="xl" 
                variant="default" 
                href="/" 
                priority 
              />
                {/* Footer Logo End */}
              
                {/* Footer Contact Box Start */}
                <div className="footer-contact-box">
                  {/* Footer Contact Item Start */}
                  <div className="footer-contact-item">
                    <p>Need help!</p>
                    <h3>+1 (613) 304-2773</h3>
                  </div>
                  {/* Footer Contact Item End */}

                  {/* Footer Contact Item Start */}
                  <div className="footer-contact-item">
                    <p>E-mail now</p>
                    <h3>info@mokogo.com</h3>
                  </div>
                  {/* Footer Contact Item End */}
                </div>
                {/* Footer Contact Box End */}
              </div>
              {/* About Footer End */}
            </div>
          </div>

          {/* Footer Copyright Section Start */}
          <div className="footer-copyright">
            <div className="row align-items-center">
              <div className="col-md-5">
                {/* Footer Copyright Start */}
                <div className="footer-copyright-text">
                  <p>Copyright © 2025 All Rights Reserved.</p>
                </div>
                {/* Footer Copyright End */}
              </div>

              <div className="col-md-7">
                {/* Footer Menu Start */}
                <div className="footer-menu">
                  <ul>                            
                    <li><Link href="https://www.linkedin.com/company/gigly4gig/" target="_blank">LinkedIn</Link></li>
                    <li><Link href="https://www.facebook.com/people/Gigly/61558521376687/" target="_blank">Facebook</Link></li>
                    <li><Link href="https://www.instagram.com/gigly4gig?igsh=MWozNDF2ZDc2aDJhZw==" target="_blank">Instagram</Link></li>
                    <li><Link href="https://x.com/Gigly4gig?t=SC7H7iEZOrJXVuSSzid2NA&s=09" target="_blank">Twitter</Link></li>
                  </ul>
                </div>
                {/* Footer Menu End */}
              </div>
            </div>
          </div>
          {/* Footer Copyright Section End */}
        </div>
      </footer>
      {/* Footer Section End */}
    </>
  );
}
