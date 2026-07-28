import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const baseStyles = 'w-full bg-canvas border border-ink-tertiary rounded-md px-4 py-3 font-ui text-base text-ink placeholder-ink-subtle transition-all duration-fast ease-out-premium focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:cursor-not-allowed';
    
    const errorStyles = error ? 'border-semantic-error focus-visible:border-semantic-error focus-visible:ring-semantic-error' : '';
    
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-ui font-medium text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseStyles} ${errorStyles} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-semantic-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
