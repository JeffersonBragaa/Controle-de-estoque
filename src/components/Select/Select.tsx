import React from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  erro?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  erro,
  required,
  disabled,
  className = '',
}) => {
  const selectId = name || 'select';

  return (
    <div className={`${styles.container} ${className}`}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
        {required && <span className={styles.obrigatorio} aria-hidden="true"> *</span>}
      </label>
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        className={`${styles.select} ${erro ? styles.selectErro : ''}`}
        required={required}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((opcao) => (
          <option key={opcao.value} value={opcao.value}>
            {opcao.label}
          </option>
        ))}
      </select>
      {erro && <span className={styles.erroText} role="alert">{erro}</span>}
    </div>
  );
};

export default Select;
