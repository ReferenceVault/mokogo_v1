import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Logo } from "@/components/index";
import { NAVIGATION_ITEMS } from '../../utils/constants';

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActivePath = (path) => {
    return router.pathname === path;
  };

  return (
    <>
      {/* Header Start */}
      <header className="main-header">
        <div className="header-sticky">
          <nav className="navbar navbar-expand-lg">
            <div className="container">
              {/* Logo Start */}
              <Logo 
                size="md" 
                variant="default" 
                href="/" 
                priority 
              />
              {/* Logo End */}

              {/* Main Menu Start */}
              <div className="navbar-collapse main-menu">
                <div className="nav-menu-wrapper">
                  <ul className="navbar-nav mr-auto" id="menu">
                    {NAVIGATION_ITEMS.map((item) => {
                      // Only show items that don't require auth
                      if (item.requiresAuth) {
                        return null;
                      }

                      return (
                        <li key={item.href} className="nav-item">
                          <Link 
                            className={`nav-link ${isActivePath(item.href) ? 'active' : ''}`}
                            href={item.href}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                
                {/* Header Actions Start */}
                <div className="header-btn d-inline-flex">
                  <AuthButtons />
                </div>
                {/* Header Actions End */}
              </div>
              {/* Main Menu End */}
              
              {/* Mobile Menu Toggle */}
              <button 
                className="navbar-toggle" 
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className={isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}></span>
                <span className={isMobileMenuOpen ? 'opacity-0' : ''}></span>
                <span className={isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}></span>
              </button>
            </div>
          </nav>
          
          {/* Mobile Menu */}
          <div className={`responsive-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            <div className="responsive-menu-content">
              <ul className="navbar-nav">
                {NAVIGATION_ITEMS.map((item) => {
                  if (item.requiresAuth) {
                    return null;
                  }

                  return (
                    <li key={item.href} className="nav-item">
                      <Link 
                        className={`nav-link ${isActivePath(item.href) ? 'active' : ''}`}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </header>
      {/* Header End */}
    </>
  );
}

// Auth buttons for non-authenticated users
const AuthButtons = () => {
  // No auth buttons - removed as requested
  return null;
};
