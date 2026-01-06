import Image from 'next/image';
import Link from 'next/link';

const Logo = ({ 
  size = 'md', 
  variant = 'default',
  href = '/',
  className = '',
  priority = false,
  ...props 
}) => {
  // Size configurations
  const sizeConfig = {
    xs: { width: 80, height: 30, class: 'h-6 w-auto' },
    sm: { width: 100, height: 35, class: 'h-8 w-auto' },
    md: { width: 120, height: 40, class: 'h-10 w-auto' },
    lg: { width: 140, height: 50, class: 'h-12 w-auto' },
    xl: { width: 160, height: 60, class: 'h-16 w-auto' },
    '2xl': { width: 200, height: 80, class: 'h-20 w-auto' },
  };

  // Variant configurations
  const variantConfig = {
    default: '',
    white: 'brightness-0 invert', // For dark backgrounds
    dark: '', // Default for light backgrounds
  };

  const config = sizeConfig[size] || sizeConfig.md;
  const variantClass = variantConfig[variant] || '';
  
  // Choose logo based on variant
  const logoSrc = variant === 'white' ? '/images/logos/logo_white.png' : '/images/logos/logo_black1.png';
  
  const logoImage = (
    <Image
      src={logoSrc}
      alt="MokoGo Logo"
      width={config.width}
      height={config.height}
      className={`${config.class} ${variantClass} ${className}`}
      priority={priority}
      {...props}
    />
  );

  // If href is provided, wrap in Link
  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logoImage}
      </Link>
    );
  }

  // Otherwise return just the image
  return logoImage;
};

export default Logo;
