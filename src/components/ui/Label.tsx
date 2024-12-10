import { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-secondary-300 dark:text-secondary-300 ${className || ''}`}
      {...props}
    >
      {children}
    </label>
  );
}