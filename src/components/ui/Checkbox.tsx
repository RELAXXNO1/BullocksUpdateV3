import React, { forwardRef, InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, onChange, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={`
            h-4 w-4 text-blue-600 
            focus:ring-blue-500 border-gray-300 rounded
            ${className || ''}
          `}
          onChange={handleChange}
          {...props}
        />
        {label && (
          <label 
            htmlFor={props.id} 
            className="ml-2 block text-sm text-gray-900"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
