import React from 'react';
import styles from './Loader.module.css';

export interface LoaderProps {
  tamanho?: 'pequeno' | 'padrao';
}

const Loader: React.FC<LoaderProps> = ({ tamanho = 'padrao' }) => {
  const classeTamanho = styles[tamanho];
  
  if (tamanho === 'pequeno') {
    return <span className={`${styles.spinner} ${classeTamanho}`} aria-label="Carregando" />;
  }

  return (
    <div className={styles.telaInteira} role="status">
      <span className={`${styles.spinner} ${classeTamanho}`} />
      <span className={styles.srOnly}>Carregando...</span>
    </div>
  );
};

export default Loader;
