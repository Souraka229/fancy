import { HTMLAttributes, forwardRef } from 'react';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'display' | 'ui';
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 'h2', variant = 'ui', className = '', children, ...props }, ref) => {
    const baseStyles = 'font-medium tracking-tight';
    
    const displayStyles = 'font-display';
    const uiStyles = 'font-ui';
    
    const levelStyles = {
      h1: 'text-4xl md:text-5xl lg:text-6xl leading-tight',
      h2: 'text-3xl md:text-4xl lg:text-5xl leading-tight',
      h3: 'text-2xl md:text-3xl lg:text-4xl leading-snug',
      h4: 'text-xl md:text-2xl lg:text-3xl leading-snug',
      h5: 'text-lg md:text-xl lg:text-2xl leading-snug',
      h6: 'text-base md:text-lg lg:text-xl leading-normal',
    };
    
    const variantStyles = variant === 'display' ? displayStyles : uiStyles;
    
    const Tag = level;
    
    return (
      <Tag
        ref={ref as any}
        className={`${baseStyles} ${variantStyles} ${levelStyles[level]} ${className}`}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

Heading.displayName = 'Heading';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  variant?: 'default' | 'muted' | 'subtle';
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = 'base', variant = 'default', className = '', children, ...props }, ref) => {
    const baseStyles = 'font-ui leading-normal';
    
    const sizeStyles = {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };
    
    const variantStyles = {
      default: 'text-ink',
      muted: 'text-ink-muted',
      subtle: 'text-ink-subtle',
    };
    
    return (
      <p
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </p>
    );
  }
);

Text.displayName = 'Text';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'error' | 'warning';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center px-2 py-1 rounded-sm text-xs font-ui font-medium';
    
    const variantStyles = {
      default: 'bg-surface-2 text-ink',
      accent: 'bg-accent-subtle text-accent',
      success: 'bg-semantic-success/10 text-semantic-success',
      error: 'bg-semantic-error/10 text-semantic-error',
      warning: 'bg-semantic-warning/10 text-semantic-warning',
    };
    
    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
