import React from 'react';
import styles from './Header.module.css';

export interface HeaderProps {
  titulo: string;
  onMenuClique?: () => void;
}

const Header: React.FC<HeaderProps> = ({ titulo, onMenuClique }) => {
  return (
    <header className={styles.header}>
      {onMenuClique && (
        <button
          type="button"
          className={styles.menuHambuerguer}
          onClick={onMenuClique}
          aria-label="Abrir menu lateral"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.iconeMenu}
          >
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
      )}
      <h1 className={styles.titulo}>{titulo}</h1>
    </header>
  );
};

export default Header;
