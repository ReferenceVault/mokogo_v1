import Link from 'next/link';
import Logo from './Logo';
import { FOOTER_LINKS } from '../../utils/constants';
import env from '../../config/env';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo mb-4">
              <Logo 
                size="md" 
                variant="white" 
                href="/" 
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
              {env.APP_DESCRIPTION}. Invest in vehicles and build your financial future with our innovative platform.
            </p>
            <div className="footer-social">
              {FOOTER_LINKS.social.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link"
                  aria-label={link.label}
                >
                  <SocialIcon name={link.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h3 className="footer-title">Company</h3>
            <div className="footer-links">
              {FOOTER_LINKS.company.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Links */}
          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <div className="footer-links">
              {FOOTER_LINKS.support.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h3 className="footer-title">Legal</h3>
            <div className="footer-links">
              {FOOTER_LINKS.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-white mb-2">
                Stay Updated
              </h4>
              <p className="text-sm text-gray-300 mb-3">
                Get the latest news and updates.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm">
              <p>
                © {currentYear} {env.APP_NAME}. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <span>Made with ❤️ in Bangladesh</span>
              <span>Version {env.APP_VERSION}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Newsletter signup form
const NewsletterForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    
    // TODO: Implement newsletter signup
    console.log('Newsletter signup:', email);
    
    // Reset form
    e.target.reset();
    
    // Show success message (you can use toast notification here)
    alert('Thank you for subscribing!');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        required
        className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
      >
        Subscribe
      </button>
    </form>
  );
};

// Social media icons
const SocialIcon = ({ name }) => {
  const icons = {
    facebook: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    twitter: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
      </svg>
    ),
    linkedin: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    instagram: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.33-1.297C4.198 14.894 3.708 13.743 3.708 12.446s.49-2.448 1.411-3.33c.882-.882 2.033-1.322 3.33-1.322s2.448.44 3.33 1.322c.921.882 1.411 2.033 1.411 3.33s-.49 2.448-1.411 3.245c-.882.807-2.033 1.297-3.33 1.297zm7.598 0c-1.297 0-2.448-.49-3.33-1.297-.921-.797-1.411-1.948-1.411-3.245s.49-2.448 1.411-3.33c.882-.882 2.033-1.322 3.33-1.322s2.448.44 3.33 1.322c.921.882 1.411 2.033 1.411 3.33s-.49 2.448-1.411 3.245c-.882.807-2.033 1.297-3.33 1.297z" />
      </svg>
    ),
  };

  return icons[name] || null;
};

export default Footer;
