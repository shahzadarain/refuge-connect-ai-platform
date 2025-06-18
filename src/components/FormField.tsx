
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  helpText?: string;
  options?: { value: string; label: string }[];
  rows?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  helpText,
  options = [],
  rows = 4
}) => {
  const { t, isRTL } = useLanguage();

  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;
  const helpId = `help-${name}`;

  const baseInputClasses = `mobile-input ${error ? 'border-error-red' : ''} ${isRTL ? 'text-right' : 'text-left'}`;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClasses}
          aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
          aria-invalid={error ? 'true' : 'false'}
          required={required}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={baseInputClasses}
          aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
          aria-invalid={error ? 'true' : 'false'}
          required={required}
        />
      );
    }

    return (
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={baseInputClasses}
        aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim() || undefined}
        aria-invalid={error ? 'true' : 'false'}
        required={required}
        autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : undefined}
      />
    );
  };

  return (
    <div className="mb-6">
      <label htmlFor={fieldId} className="block text-body-mobile font-medium text-neutral-gray mb-2">
        {label}
        {required && <span className="text-error-red ml-1" aria-label="required">*</span>}
      </label>
      
      {renderInput()}
      
      {helpText && (
        <p id={helpId} className="text-small-mobile text-neutral-gray/70 mt-1">
          {helpText}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-small-mobile text-error-red mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;
