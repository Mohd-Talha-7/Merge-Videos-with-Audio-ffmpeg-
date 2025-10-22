import React from 'react';

interface NumberInputProps {
  label: string;
  value: number | '';
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, placeholder }) => {
  return (
    <div>
      <label htmlFor={label} className="block text-base font-medium text-indigo-200 mb-2">
        {label}
      </label>
      <input
        type="number"
        id={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min="0"
        className="w-full p-4 text-base bg-black/30 text-slate-100 border border-white/20 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
      />
    </div>
  );
};

export default NumberInput;