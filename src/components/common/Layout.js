import { Toaster } from 'react-hot-toast';
import Head from 'next/head';
import Image from 'next/image';

import Logo from './Logo';
import { Header, Footer } from '../layout';
import ErrorBoundary from '../ui/ErrorBoundary';
import env from '../../config/env';

const Layout = ({ 
  children, 
  title, 
  description,
  showHeader = true,
  showFooter = true,
  requireAuth = false,
  className = '',
  containerClassName = '',
}) => {

  // Generate page title
  const pageTitle = title 
    ? `${title} | ${env.APP_NAME}` 
    : `${env.APP_NAME} - ${env.APP_DESCRIPTION}`;

  // Generate page description
  const pageDescription = description || env.APP_DESCRIPTION;

  return (
    <ErrorBoundary>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#f97316" />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={env.APP_NAME} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        {/* Font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`}>
        {/* Header */}
        {showHeader && <Header />}

        {/* Main Content */}
        <main className={`flex-1 ${containerClassName}`}>
          {children}
        </main>

        {/* Footer */}
        {showFooter && <Footer />}

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

// Specialized layout variants
export const AuthLayout = ({ children, title, description }) => {
  return (
    <Layout
      title={title}
      description={description}
      showHeader={false}
      showFooter={false}
      className="bg-gray-100"
    >
      <div className="flex min-h-screen">
        {/* Left side - Branding with Background Image */}
        <div 
          className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/images/auth-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="text-center text-white relative z-10">
            <div className="mb-8">
              <div className="mb-6">
                <Logo 
                  size="xl" 
                  variant="white"
                  href={null}
                  className="mx-auto"
                />
              </div>
              {/* <h1 className="text-4xl font-bold mb-2">{env.APP_NAME}</h1> */}
              <p className="text-xl text-white opacity-90">{env.APP_DESCRIPTION}</p>
            </div>
            
            <div className="space-y-4 text-left max-w-md">
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-5 w-5 text-white opacity-80" />
                <span>Secure investment platform</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-5 w-5 text-white opacity-80" />
                <span>Transparent pricing</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckIcon className="h-5 w-5 text-white opacity-80" />
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile logo - using dark logo for white background */}
            <div className="lg:hidden flex justify-center mx-auto">
              <div className="mb-4 ">
              <Image
                  src="/images/logos/logo_black1.png"
                  alt="Gigly Logo"
                  width={100}
                  height={100}
                />
              </div>
              {/* <h1 className="text-2xl font-bold text-gray-900">{env.APP_NAME}</h1> */}
            </div>

            {children}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const SimpleDashboardLayout = ({ children, title, description }) => {
  return (
    <Layout
      title={title}
      description={description}
      requireAuth={false}
      containerClassName="bg-white"
    >
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </Layout>
  );
};

export const PageLayout = ({ children, title, description, breadcrumbs }) => {
  return (
    <Layout
      title={title}
      description={description}
    >
      <div className="bg-white">
        {/* Page Header */}
        {(title || breadcrumbs) && (
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="container mx-auto px-4 py-6">
              {breadcrumbs && (
                <nav className="breadcrumb mb-4">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={index}>
                      {index > 0 && (
                        <span className="breadcrumb-separator mx-2">/</span>
                      )}
                      {crumb.href ? (
                        <a href={crumb.href} className="breadcrumb-item">
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="breadcrumb-current">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              )}
              
              {title && (
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              )}
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </Layout>
  );
};

// Helper icon
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export default Layout;
