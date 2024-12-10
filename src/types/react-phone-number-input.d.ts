declare module 'react-phone-number-input' {
  import React from 'react';

  export interface PhoneInputProps {
    value?: string;
    onChange?: (value?: string) => void;
    defaultCountry?: string;
    country?: string;
    countries?: string[];
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    readOnly?: boolean;
    error?: 'invalid_country_code' | 'invalid_number' | string;
    international?: boolean;
    withCountryCallingCode?: boolean;
  }

  declare const PhoneInput: React.ComponentType<PhoneInputProps>;

  export default PhoneInput;
}
