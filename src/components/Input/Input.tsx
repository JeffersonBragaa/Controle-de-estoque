import React from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  erro?: string;
  textarea?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  erro,
  textarea = false,
  id,
  required,
  className = '',
  ...props
}) => {
  const inputId = id || props.name || 'input';

  return (
    <div className={`${styles.container} ${className}`}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
        {required && <span className={styles.obrigatorio} aria-hidden="true"> *</span>}
      </label>
      {textarea ? (
        <textarea
          id={inputId}
          className={`${styles.input} ${styles.textarea} ${erro ? styles.inputErro : ''}`}
          required={required}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          className={`${styles.input} ${erro ? styles.inputErro : ''}`}
          required={required}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {erro && <span className={styles.erroText} role="alert">{erro}</span>}
    </div>
  );
};

export default Input;
