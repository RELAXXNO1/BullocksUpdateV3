import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
        error ? 'border-red-500' : ''
      } ${className || ''}`}
      {...props}
    />
  );
}