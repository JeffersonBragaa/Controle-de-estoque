import React from 'react';
import styles from './SearchInput.module.css';

export interface SearchInputProps {
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  valor,
  onChange,
  placeholder = 'Buscar produto...',
}) => {
  return (
    <div className={styles.container}>
      <svg
        className={styles.iconeLupa}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="text"
        className={styles.input}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchInput;
