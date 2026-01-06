import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from './Logo';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectIsAuthenticated, 
  selectUser, 
  logoutUser,
  selectAuthLoading 
} from '../../store/slices/authSlice';
import { NAVIGATION_ITEMS } from '../../utils/constants';
import Button from './Button';

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthLoading);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActivePath = (path) => {
    return router.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="header-logo">
            <Logo 
              size="md" 
              variant="default" 
              href="/" 
              priority 
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            {NAVIGATION_ITEMS.map((item) => {
              // Only show items that don't require auth, or if user is authenticated
              if (item.requiresAuth && !isAuthenticated) {
                return null;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`header-nav-link ${
                    isActivePath(item.href) ? 'header-nav-link-active' : ''
                  }`}
                >
                  {item.label + "old old"}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="header-actions">
            {isAuthenticated ? (
              <UserMenu
                user={user}
                isOpen={isUserMenuOpen}
                onToggle={toggleUserMenu}
                onLogout={handleLogout}
                loading={authLoading}
              />
            ) : (
              <AuthButtons />
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="header-mobile-menu-button"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="header-mobile-menu">
            <nav className="header-mobile-nav">
              {NAVIGATION_ITEMS.map((item) => {
                if (item.requiresAuth && !isAuthenticated) {
                  return null;
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`header-mobile-nav-link ${
                      isActivePath(item.href) ? 'header-nav-link-active' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Mobile auth buttons */}
              {!isAuthenticated && (
                <div className="px-3 py-4 border-t border-gray-200 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => router.push('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => router.push('/signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile user menu */}
              {isAuthenticated && (
                <div className="px-3 py-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <UserAvatar user={user} size="sm" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/profile"
                      className="block text-sm text-gray-700 hover:text-gray-900"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/my-applications"
                      className="block text-sm text-gray-700 hover:text-gray-900"
                    >
                      My Applications
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={authLoading}
                      className="block w-full text-left text-sm text-gray-700 hover:text-gray-900"
                    >
                      {authLoading ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

// Auth buttons for non-authenticated users
const AuthButtons = () => {
  const router = useRouter();

  return (
    <div className="hidden md:flex items-center space-x-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/login')}
      >
        Sign In
      </Button>
      <Button
        variant="primary"
        size="sm"
        onClick={() => router.push('/signup')}
      >
        Sign Up
      </Button>
    </div>
  );
};

// User menu dropdown for authenticated users
const UserMenu = ({ user, isOpen, onToggle, onLogout, loading }) => {
  return (
    <div className="user-menu-container relative">
      <button
        type="button"
        className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <UserAvatar user={user} size="sm" />
        <span className="hidden md:block text-gray-700">
          {user?.firstName}
        </span>
        <ChevronDownIcon className="hidden md:block h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
          
          <div className="py-1">
            <Link
              href="/profile"
              className="dropdown-item"
            >
              Profile
            </Link>
            <Link
              href="/my-applications"
              className="dropdown-item"
            >
              My Applications
            </Link>
            <Link
              href="/settings"
              className="dropdown-item"
            >
              Settings
            </Link>
          </div>
          
          <div className="py-1 border-t border-gray-200">
            <button
              onClick={onLogout}
              disabled={loading}
              className="dropdown-item w-full text-left"
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// User avatar component
const UserAvatar = ({ user, size = 'md' }) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : user?.email?.charAt(0).toUpperCase() || '?';

  return (
    <div className={`${sizeClasses[size]} bg-primary-600 rounded-full flex items-center justify-center`}>
      <span className={`${textSizeClasses[size]} font-medium text-white`}>
        {initials}
      </span>
    </div>
  );
};

// Icons
const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export default Header;
