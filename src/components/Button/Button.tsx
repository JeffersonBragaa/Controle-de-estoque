import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variante = 'primario',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const classeVariante = styles[variante];
  
  return (
    <button
      className={`${styles.botao} ${classeVariante} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : null}
      <span className={loading ? styles.textoLoading : ''}>{children}</span>
    </button>
  );
};

export default Button;
