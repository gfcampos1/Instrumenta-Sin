import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 11)}`;
    const hasError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700 mb-1.5"
          >
            {label}
            {required && <span className="text-status-red ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg border bg-white px-4 py-2.5 text-secondary-900
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-1
              disabled:bg-secondary-100 disabled:cursor-not-allowed
              ${hasError
                ? 'border-status-red focus:border-status-red focus:ring-red-500'
                : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
              }
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${props.type === 'datetime-local' ? 'text-sm' : ''}
              ${className}
            `}
            style={props.type === 'datetime-local' ? { minHeight: '42px', maxHeight: '42px' } : undefined}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-status-red">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
