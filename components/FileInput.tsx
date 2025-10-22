import React from 'react';

interface FileInputProps {
  id: string;
  label: string;
  accept: string;
  file: File | File[] | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  multiple?: boolean;
}

const FileInput: React.FC<FileInputProps> = ({ id, label, accept, file, onChange, multiple = false }) => {
  const icon = label.includes('Video') ? '🎥' : '🎵';

  let displayText: string;
  if (!file || (Array.isArray(file) && file.length === 0)) {
    displayText = `Choose ${multiple ? 'files' : `a ${label.split(' ')[1].toLowerCase()} file`}...`;
  } else if (Array.isArray(file)) {
    if (file.length === 1) {
      displayText = file[0].name;
    } else {
      displayText = `${file.length} files selected`;
    }
  } else {
    displayText = file.name;
  }
  
  const hasFile = (Array.isArray(file) && file.length > 0) || (!Array.isArray(file) && file !== null);
  
  return (
    <div>
      <label className="block text-base font-medium text-indigo-200 mb-2">
        {label}
      </label>
      <div className="relative">
        <label 
          htmlFor={id} 
          className="w-full flex items-center p-4 text-base bg-black/30 text-slate-100 border border-white/20 rounded-lg cursor-pointer hover:bg-black/40 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition-all duration-300"
        >
          <span className="text-xl mr-3">{icon}</span>
          <span className={`truncate ${hasFile ? 'text-slate-100' : 'text-slate-400'}`}>
            {displayText}
          </span>
        </label>
        <input
          type="file"
          id={id}
          accept={accept}
          onChange={onChange}
          className="sr-only"
          multiple={multiple}
        />
      </div>
    </div>
  );
};

export default FileInput;
