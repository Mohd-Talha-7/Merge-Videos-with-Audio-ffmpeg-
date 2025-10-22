import React from 'react';
import { type MergeOption } from '../types';

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: MergeOption[];
  explanation?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options, explanation }) => {
  return (
    <div>
      <label htmlFor={label} className="block text-base font-medium text-indigo-200 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          id={label}
          value={value}
          onChange={onChange}
          className="w-full appearance-none p-4 text-base bg-black/30 text-slate-100 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-800 text-slate-100">
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-300">
          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      {explanation && (
          <p className="mt-3 text-sm text-indigo-200 bg-black/20 p-3 rounded-lg border border-white/10">{explanation}</p>
      )}
    </div>
  );
};

export default SelectInput;