import PhoneInputWithCountry from 'react-phone-number-input/input';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  const handlePhoneChange = (phoneValue?: string) => {
    onChange(phoneValue || '');
  };

  return (
    <div className="w-full">
      <PhoneInputWithCountry
        value={value}
        onChange={handlePhoneChange}
        placeholder={placeholder || "Enter phone number"}
        className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-white"
      />
    </div>
  );
}
